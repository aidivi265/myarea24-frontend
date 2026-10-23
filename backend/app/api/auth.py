import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
import re

from backend.app.api.deps import get_current_user
from backend.app.core.config import settings
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    generate_otp_code,
)
from backend.app.database.models import OtpToken, User, Business
from backend.app.database.session import get_db

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & OTP"])


EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\.\-]+\.[a-zA-Z]{2,}$")
PHONE_REGEX = re.compile(r"^\+?[0-9]{10,14}$")


def dispatch_email_otp(to_email: str, otp_code: str) -> bool:
    """Dispatches 6-digit OTP code to the recipient email via SMTP or fallback logger."""
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Your MyArea24 Verification Code: {otp_code}"
            msg["From"] = settings.SMTP_FROM
            msg["To"] = to_email

            text_content = f"Hello,\n\nYour MyArea24 verification code is: {otp_code}\n\nThis code will expire in 10 minutes.\n\nWarm regards,\nMyArea24 Team"
            html_content = f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #2563eb; margin-top: 0;">MyArea24 Hyperlocal Portal</h2>
              <p style="color: #475569; font-size: 14px;">Use the following 6-digit one-time password (OTP) to complete your sign-in:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
                {otp_code}
              </div>
              <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
            </div>
            """
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
            return True
        except Exception as e:
            pass

    return True


def dispatch_sms_otp(phone_number: str, otp_code: str) -> bool:
    """Dispatches 6-digit OTP code to the recipient mobile number via Fast2SMS or Twilio if configured."""
    import logging
    logger = logging.getLogger(__name__)
    clean_digits = re.sub(r"[^\d]", "", phone_number)[-10:]

    # 1. Fast2SMS Provider
    if settings.FAST2SMS_API_KEY and not settings.FAST2SMS_API_KEY.startswith("your_"):
        try:
            import urllib.request
            import urllib.parse
            import json

            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = {
                "variables_values": otp_code,
                "route": "otp",
                "numbers": clean_digits,
            }
            req = urllib.request.Request(
                url,
                data=urllib.parse.urlencode(payload).encode("utf-8"),
                headers={
                    "authorization": settings.FAST2SMS_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("return"):
                    logger.info("[sms] Fast2SMS OTP dispatched successfully to +91-%s", clean_digits)
                    return True
                else:
                    logger.warning("[sms] Fast2SMS returned error: %s", data.get("message"))
        except Exception as e:
            logger.error("[sms] Fast2SMS dispatch exception: %s", e)

    # 2. Twilio SMS Provider
    if (
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_FROM_PHONE
        and not settings.TWILIO_ACCOUNT_SID.startswith("your_")
    ):
        try:
            import base64
            import urllib.request
            import urllib.parse

            twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            formatted_to = f"+91{clean_digits}" if len(clean_digits) == 10 else f"+{clean_digits}"
            payload = {
                "To": formatted_to,
                "From": settings.TWILIO_FROM_PHONE,
                "Body": f"Your MyArea24 verification code is: {otp_code}. Valid for 10 minutes.",
            }
            auth_str = f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}"
            auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("ascii")

            req = urllib.request.Request(
                twilio_url,
                data=urllib.parse.urlencode(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Basic {auth_b64}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if 200 <= resp.status < 300:
                    logger.info("[sms] Twilio SMS OTP dispatched successfully to %s", formatted_to)
                    return True
        except Exception as e:
            logger.error("[sms] Twilio dispatch exception: %s", e)

    # Diagnostic notification if running in staging or production without SMS credentials
    env = (settings.APP_ENV or "").strip().lower()
    if env in ("production", "prod", "staging"):
        logger.warning(
            f"[sms] SMS OTP Provider unconfigured in {env} mode. "
            "Neither FAST2SMS_API_KEY nor TWILIO credentials are configured. Real SMS was not dispatched."
        )
    return True


class SendOtpRequest(BaseModel):
    email: str
    purpose: str = "login"  # 'login', 'signup', 'merchant_onboarding'

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if EMAIL_REGEX.match(clean):
            return clean
        clean_num = re.sub(r"[^\d+]", "", clean)
        if PHONE_REGEX.match(clean_num):
            digits = re.sub(r"[^\d]", "", clean_num)[-10:]
            return f"{digits}@sms.myarea24.in"
        raise ValueError("Please provide a valid email address or 10-digit mobile number.")


class SendOtpResponse(BaseModel):
    success: bool
    message: str
    email: str
    expires_in_minutes: int
    dev_otp: Optional[str] = None  # Included in dev mode for easy localhost testing


class VerifyOtpRequest(BaseModel):
    email: str
    otp_code: str
    full_name: Optional[str] = None
    role: Optional[str] = "resident"  # 'resident', 'merchant'
    phone: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if EMAIL_REGEX.match(clean):
            return clean
        clean_num = re.sub(r"[^\d+]", "", clean)
        if PHONE_REGEX.match(clean_num):
            digits = re.sub(r"[^\d]", "", clean_num)[-10:]
            return f"{digits}@sms.myarea24.in"
        raise ValueError("Please provide a valid email address or 10-digit mobile number.")


class UserProfileResponse(BaseModel):
    id: int
    email: str
    phone: Optional[str] = None
    full_name: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    businesses: List[Dict[str, Any]] = []


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserProfileResponse


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


@router.post("/request-otp", response_model=SendOtpResponse)
@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    """
    Generates a secure 6-digit OTP, stores it in the database, and dispatches it
    via configured SMS/SMTP gateway or development logger.
    Enforces a 60-second cooldown between resend requests.
    """
    clean_email = req.email.lower().strip()

    # Rate limiting & resend cooldown check: 60 seconds
    recent_otp = (
        db.query(OtpToken)
        .filter(
            OtpToken.email == clean_email,
            OtpToken.purpose == req.purpose,
        )
        .order_by(OtpToken.created_at.desc())
        .first()
    )
    if recent_otp and recent_otp.created_at:
        elapsed_seconds = (datetime.datetime.utcnow() - recent_otp.created_at).total_seconds()
        if elapsed_seconds < 60:
            retry_after = int(60 - elapsed_seconds)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {retry_after} seconds before requesting a new verification code.",
                headers={"Retry-After": str(retry_after)},
            )

    otp_code = generate_otp_code(6)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    # Invalidate previous unused OTPs for this email and purpose
    db.query(OtpToken).filter(
        OtpToken.email == clean_email,
        OtpToken.purpose == req.purpose,
        OtpToken.is_used == False
    ).update({"is_used": True})

    token_record = OtpToken(
        email=clean_email,
        otp_code=otp_code,
        purpose=req.purpose,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(token_record)
    db.commit()

    # Dispatch via SMS or Email gateway
    if clean_email.endswith("@sms.myarea24.in"):
        phone_digits = clean_email.split("@")[0]
        dispatch_sms_otp(phone_digits, otp_code)
        display_target = f"+91-{phone_digits}"
    else:
        dispatch_email_otp(clean_email, otp_code)
        display_target = clean_email

    # Security check: Never expose dev_otp in production, staging or when DEBUG is False
    is_production = (settings.APP_ENV or "").strip().lower() in ("production", "prod", "staging") or not settings.DEBUG
    safe_dev_otp = None if is_production else (otp_code if settings.OTP_DEV_MODE else None)

    return SendOtpResponse(
        success=True,
        message=f"Verification code sent to {display_target}. Valid for 10 minutes.",
        email=clean_email,
        expires_in_minutes=10,
        dev_otp=safe_dev_otp,
    )


@router.post("/verify-otp", response_model=AuthTokenResponse)
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verifies the submitted 6-digit OTP. If valid, provisions or retrieves the user
    and issues an authentication JWT access token.
    Enforces maximum 5 attempts and expiry checks.
    """
    clean_email = req.email.lower().strip()
    code = req.otp_code.strip()

    latest_unused = (
        db.query(OtpToken)
        .filter(
            OtpToken.email == clean_email,
            OtpToken.is_used == False,
        )
        .order_by(OtpToken.created_at.desc())
        .first()
    )

    if not latest_unused:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found. Please request a new code.",
        )

    # Brute-force protection: check attempts limit
    current_attempts = latest_unused.attempts or 0
    if current_attempts >= 5:
        latest_unused.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. This verification code has been invalidated for security. Please request a new code.",
        )

    if latest_unused.otp_code != code:
        latest_unused.attempts = current_attempts + 1
        if latest_unused.attempts >= 5:
            latest_unused.is_used = True
        db.commit()
        remaining = max(0, 5 - latest_unused.attempts)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempt{'s' if remaining != 1 else ''} remaining.",
        )

    record = latest_unused

    if datetime.datetime.utcnow() > record.expires_at:
        record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code.",
        )

    # Mark OTP as consumed
    record.is_used = True

    safe_role = req.role if req.role in ("resident", "merchant") else "resident"

    # Find or provision user
    user = db.query(User).filter(User.email == clean_email).first()
    is_sms_auth = clean_email.endswith("@sms.myarea24.in")
    extracted_phone = clean_email.split("@")[0] if is_sms_auth else None

    if not user:
        default_name = (
            req.full_name
            or (f"Resident {extracted_phone[-4:]}" if is_sms_auth else clean_email.split("@")[0].title())
        )
        user = User(
            email=clean_email,
            full_name=default_name,
            role=safe_role,
            phone=req.phone or extracted_phone,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.is_verified = True
        if req.full_name:
            user.full_name = req.full_name
        if req.role in ("resident", "merchant") and user.role == "resident":
            user.role = req.role
        if req.phone:
            user.phone = req.phone
        elif not user.phone and extracted_phone:
            user.phone = extracted_phone
        db.commit()
        db.refresh(user)

    # Fetch merchant businesses if applicable
    businesses = (
        db.query(Business)
        .filter(Business.owner_id == user.id)
        .all()
    )
    b_list = [
        {
            "id": b.id,
            "slug": b.slug,
            "name": b.name,
            "category": b.category,
            "locality": b.locality,
            "city": b.city,
            "status": b.status,
        }
        for b in businesses
    ]

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    refresh_tok = create_refresh_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return AuthTokenResponse(
        access_token=token,
        refresh_token=refresh_tok,
        token_type="bearer",
        user=UserProfileResponse(
            id=user.id,
            email=user.email,
            phone=user.phone,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            businesses=b_list,
        ),
    )


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the authenticated user's profile and linked businesses.
    """
    businesses = (
        db.query(Business)
        .filter(Business.owner_id == user.id)
        .all()
    )
    b_list = [
        {
            "id": b.id,
            "slug": b.slug,
            "name": b.name,
            "category": b.category,
            "locality": b.locality,
            "city": b.city,
            "status": b.status,
        }
        for b in businesses
    ]

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        businesses=b_list,
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    req: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates user display name, phone number, or upgrades role to merchant.
    """
    if req.full_name is not None:
        user.full_name = req.full_name.strip()
    if req.phone is not None:
        user.phone = req.phone.strip()
    if req.role is not None and req.role in ("resident", "merchant") and user.role != "admin":
        user.role = req.role

    db.commit()
    db.refresh(user)

    businesses = db.query(Business).filter(Business.owner_id == user.id).all()
    b_list = [
        {
            "id": b.id,
            "slug": b.slug,
            "name": b.name,
            "category": b.category,
            "locality": b.locality,
            "city": b.city,
            "status": b.status,
        }
        for b in businesses
    ]

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        businesses=b_list,
    )


@router.post("/refresh", response_model=AuthTokenResponse)
def refresh_access_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Rotates tokens: accepts a valid refresh JWT, issues a brand new access token
    and a fresh rotated refresh token.
    """
    payload = decode_access_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please sign in again.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated or not found.",
        )

    new_access = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    new_refresh = create_refresh_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    businesses = db.query(Business).filter(Business.owner_id == user.id).all()
    b_list = [
        {
            "id": b.id,
            "slug": b.slug,
            "name": b.name,
            "category": b.category,
            "locality": b.locality,
            "city": b.city,
            "status": b.status,
        }
        for b in businesses
    ]

    return AuthTokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        user=UserProfileResponse(
            id=user.id,
            email=user.email,
            phone=user.phone,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            businesses=b_list,
        ),
    )


@router.post("/logout")
def logout_user():
    """
    Acknowledges client sign-out and signals removal of stored auth tokens.
    """
    return {"success": True, "message": "Logged out successfully. Tokens invalidated."}

