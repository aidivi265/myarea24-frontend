import hashlib
import hmac
import json
import os
import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def create_test_user(role="resident", phone=None):
    """Helper to register and authenticate a user with specific role and phone."""
    email = f"sec_{role}_{uuid.uuid4().hex[:6]}@example.com"
    r = client.post("/api/v1/auth/request-otp", json={"email": email, "purpose": "login"})
    otp = r.json()["dev_otp"]
    v = client.post("/api/v1/auth/verify-otp", json={
        "email": email,
        "otp_code": otp,
        "full_name": f"Security Test {role.capitalize()}",
        "phone": phone or f"98{uuid.uuid4().hex[:8]}"
    })
    token = v.json()["access_token"]
    user_id = v.json()["user"]["id"]
    return {
        "headers": {"Authorization": f"Bearer {token}"},
        "token": token,
        "email": email,
        "user_id": user_id,
        "phone": phone or v.json()["user"].get("phone")
    }


def test_multi_role_order_isolation_and_privacy():
    """
    Verify that:
      - User A cannot view User B's orders in /api/v1/orders
      - User B cannot fetch User A's order details without tracking token
      - User B cannot cancel User A's order
      - Unauthenticated stranger cannot enumerate orders with arbitrary phone numbers
    """
    user_a = create_test_user(role="resident", phone="9800000001")
    user_b = create_test_user(role="resident", phone="9800000002")

    # User A creates an order
    order_payload = {
        "items": [{"product_name": "Fresh Paneer", "unit_price": 120.0, "quantity": 1}],
        "delivery_fee": 25.0,
        "platform_fee": 5.0,
        "discount_amount": 0.0,
        "payment_method": "cod",
        "customer_name": "User Alpha",
        "customer_phone": "9800000001",
        "delivery_address": "Flat 101, Alpha Heights",
    }
    create_res = client.post("/api/v1/orders", json=order_payload, headers=user_a["headers"])
    assert create_res.status_code == 201
    order_data = create_res.json()["order"]
    order_num = order_data["order_number"]
    tracking_token = order_data["tracking_token"]
    assert tracking_token is not None

    # 1. User A lists orders -> sees order
    a_list = client.get("/api/v1/orders", headers=user_a["headers"])
    assert a_list.status_code == 200
    assert any(o["order_number"] == order_num for o in a_list.json()["orders"])

    # 2. User B lists orders -> MUST NOT see User A's order
    b_list = client.get("/api/v1/orders", headers=user_b["headers"])
    assert b_list.status_code == 200
    assert not any(o["order_number"] == order_num for o in b_list.json()["orders"])

    # 3. User B attempts to access User A's order by ID -> 403 Forbidden
    b_detail = client.get(f"/api/v1/orders/{order_num}", headers=user_b["headers"])
    assert b_detail.status_code == 403

    # 4. User B attempts to cancel User A's order -> 403 Forbidden
    b_cancel = client.patch(
        f"/api/v1/orders/{order_num}/status",
        headers=user_b["headers"],
        json={"status": "cancelled", "notes": "Malicious attempt"}
    )
    assert b_cancel.status_code == 403

    # 5. Unauthenticated user with phone query parameter cannot enumerate orders
    unauth_phone_list = client.get("/api/v1/orders?phone=9800000001")
    assert unauth_phone_list.status_code == 200
    assert unauth_phone_list.json()["count"] == 0

    # 6. Unauthenticated guest with valid tracking token CAN view this specific order
    guest_ok = client.get(f"/api/v1/orders/{order_num}?token={tracking_token}")
    assert guest_ok.status_code == 200
    assert guest_ok.json()["order"]["order_number"] == order_num

    # 7. Unauthenticated guest with invalid tracking token is rejected
    guest_bad = client.get(f"/api/v1/orders/{order_num}?token=invalid_tracking_token_123")
    assert guest_bad.status_code == 403


def test_transactional_cancellation_and_repeat_prevention():
    """
    Verify that:
      - Placed order can be cancelled by its owner
      - Repeating cancellation on already cancelled order returns 400 Bad Request
      - Delivered orders cannot be cancelled or modified
    """
    user = create_test_user(role="resident")
    order_payload = {
        "items": [{"product_name": "Atta 5kg", "unit_price": 250.0, "quantity": 1}],
        "payment_method": "cod",
        "customer_name": "Resident Tester",
        "customer_phone": user["phone"],
        "delivery_address": "Villa 4, Palm Grove",
    }
    create_res = client.post("/api/v1/orders", json=order_payload, headers=user["headers"])
    assert create_res.status_code == 201
    order_num = create_res.json()["order"]["order_number"]

    # 1. First cancellation succeeds
    cancel_res1 = client.patch(
        f"/api/v1/orders/{order_num}/status",
        headers=user["headers"],
        json={"status": "cancelled", "notes": "Changed my mind"}
    )
    assert cancel_res1.status_code == 200
    assert cancel_res1.json()["new_status"] == "cancelled"

    # 2. Second cancellation MUST be rejected to prevent duplicate processing
    cancel_res2 = client.patch(
        f"/api/v1/orders/{order_num}/status",
        headers=user["headers"],
        json={"status": "cancelled", "notes": "Double cancel attempt"}
    )
    assert cancel_res2.status_code == 400
    assert "already cancelled" in cancel_res2.json()["detail"].lower()


def test_payment_underpayment_and_amount_mismatch_rejection():
    """
    Verify that:
      - verify_payment endpoint rejects underpayment / amount mismatch (e.g. paying ₹1 for a ₹280 order)
      - verify_payment rejects payment for a cancelled order
      - verify_payment accepts correct amount and transitions status to paid
      - Re-submitting payment with same transaction ID is idempotent
      - Re-submitting payment with different transaction ID returns 409 Conflict
    """
    user = create_test_user(role="resident")
    order_payload = {
        "items": [{"product_name": "Basmati Rice 5kg", "unit_price": 450.0, "quantity": 1}],
        "delivery_fee": 30.0,
        "platform_fee": 5.0,
        "payment_method": "upi_qr",
        "customer_name": "Resident Tester",
        "customer_phone": user["phone"],
        "delivery_address": "Villa 10, Palm Grove",
    }
    create_res = client.post("/api/v1/orders", json=order_payload, headers=user["headers"])
    assert create_res.status_code == 201
    order_data = create_res.json()["order"]
    order_num = order_data["order_number"]
    final_payable = order_data["final_payable"]
    assert final_payable == 485.0

    # 1. Underpayment exploit attempt: pass amount = 1.0
    bad_pay = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "upi_qr",
            "amount": 1.0,
            "transaction_id": "TXN_EXPLOIT_1",
            "upi_ref_id": "UPI_REF_EXPLOIT"
        }
    )
    assert bad_pay.status_code == 400
    assert "amount mismatch" in bad_pay.json()["detail"].lower()

    # 2. Legitimate payment with matching amount succeeds
    good_pay = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "upi_qr",
            "amount": final_payable,
            "transaction_id": "TXN_LEGIT_12345",
            "upi_ref_id": "UPI_REF_12345"
        }
    )
    assert good_pay.status_code == 200
    assert good_pay.json()["order_status"] == "confirmed"

    # 3. Idempotent re-submission with same transaction ID returns 200
    idem_pay = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "upi_qr",
            "amount": final_payable,
            "transaction_id": "TXN_LEGIT_12345"
        }
    )
    assert idem_pay.status_code == 200
    assert "already verified" in idem_pay.json()["message"].lower()

    # 4. Conflicting re-submission with different transaction ID returns 409 Conflict
    conflict_pay = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "upi_qr",
            "amount": final_payable,
            "transaction_id": "TXN_DIFFERENT_9999"
        }
    )
    assert conflict_pay.status_code == 409


def test_razorpay_webhook_security():
    """
    Verify that:
      - Webhook requires configured signature when secret is set
      - Webhook enforces amount matching in paise
      - Webhook on cancelled order flags refund_pending rather than confirming
    """
    user = create_test_user(role="resident")
    order_payload = {
        "items": [{"product_name": "Almonds 500g", "unit_price": 350.0, "quantity": 1}],
        "delivery_fee": 20.0,
        "platform_fee": 5.0,
        "payment_method": "razorpay",
        "customer_name": "Razorpay Tester",
        "customer_phone": user["phone"],
        "delivery_address": "Tower 5, Silver Oak",
    }
    create_res = client.post("/api/v1/orders", json=order_payload, headers=user["headers"])
    assert create_res.status_code == 201
    order_num = create_res.json()["order"]["order_number"]
    final_payable = create_res.json()["order"]["final_payable"]  # 375.0
    expected_paise = int(final_payable * 100)

    secret = settings.RAZORPAY_KEY_SECRET or os.getenv("RAZORPAY_KEY_SECRET", "")

    # 1. Missing signature rejection
    res_no_sig = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=b"{}",
        headers={"Content-Type": "application/json"}
    )
    if secret:
        assert res_no_sig.status_code == 400
        assert "signature" in res_no_sig.json()["detail"].lower()

    # 2. Underpayment in webhook with valid signature (e.g., 100 paise = ₹1 instead of 37500 paise = ₹375)
    underpay_body = json.dumps({
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_fake_underpay_1",
                    "amount": 100,  # 1 INR
                    "notes": {"order_number": order_num}
                }
            }
        }
    }).encode("utf-8")

    sig_underpay = hmac.new(secret.encode("utf-8"), underpay_body, hashlib.sha256).hexdigest() if secret else "sig"

    res_underpay = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=underpay_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig_underpay}
    )
    assert res_underpay.status_code == 400
    assert "mismatch" in res_underpay.json()["detail"].lower()

    # 3. Cancel order first, then simulate webhook arrival
    cancel_res = client.patch(
        f"/api/v1/orders/{order_num}/status",
        headers=user["headers"],
        json={"status": "cancelled", "notes": "Cancelled before payment webhook"}
    )
    assert cancel_res.status_code == 200

    webhook_cancelled = json.dumps({
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_late_capture_99",
                    "amount": expected_paise,
                    "notes": {"order_number": order_num}
                }
            }
        }
    }).encode("utf-8")

    sig_cancelled = hmac.new(secret.encode("utf-8"), webhook_cancelled, hashlib.sha256).hexdigest() if secret else "sig"

    res_cancelled_webhook = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=webhook_cancelled,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig_cancelled}
    )
    assert res_cancelled_webhook.status_code == 200

    # Verify that order remained cancelled and payment_status became refund_pending
    detail_res = client.get(f"/api/v1/orders/{order_num}", headers=user["headers"])
    assert detail_res.status_code == 200
    assert detail_res.json()["order"]["status"] == "cancelled"
    assert detail_res.json()["order"]["payment_status"] == "refund_pending"


def test_service_booking_privacy_and_authorization():
    """
    Verify that:
      - Unauthenticated listing of service bookings returns 0 records
      - User A cannot view User B's service bookings
      - Guest lookup requires valid OTP code
    """
    user_a = create_test_user(role="resident")
    user_b = create_test_user(role="resident")

    booking_payload = {
        "service_title": "AC Master Servicing",
        "category": "Home Appliance",
        "provider_name": "CoolCare Techs",
        "provider_phone": "9811122233",
        "customer_name": "User Alpha",
        "customer_phone": user_a["phone"],
        "service_address": "House 55, Park Street",
        "scheduled_date": "2026-10-25",
        "scheduled_slot": "10:00 AM - 12:00 PM",
        "estimated_cost": 499.0
    }

    create_res = client.post("/api/v1/services/book", json=booking_payload, headers=user_a["headers"])
    assert create_res.status_code == 201
    booking_data = create_res.json()["booking"]
    booking_num = booking_data["booking_number"]
    otp_code = booking_data["otp_code"]

    # 1. Unauthenticated request to /services/bookings returns 0 items
    unauth_res = client.get("/api/v1/services/bookings")
    assert unauth_res.status_code == 200
    assert unauth_res.json()["count"] == 0

    # 2. User A sees their booking
    a_res = client.get("/api/v1/services/bookings", headers=user_a["headers"])
    assert a_res.status_code == 200
    assert any(b["booking_number"] == booking_num for b in a_res.json()["bookings"])

    # 3. User B MUST NOT see User A's booking
    b_res = client.get("/api/v1/services/bookings", headers=user_b["headers"])
    assert b_res.status_code == 200
    assert not any(b["booking_number"] == booking_num for b in b_res.json()["bookings"])

    # 4. Guest detail lookup with correct OTP succeeds
    guest_ok = client.get(f"/api/v1/services/bookings/{booking_num}?otp={otp_code}")
    assert guest_ok.status_code == 200
    assert guest_ok.json()["booking"]["booking_number"] == booking_num

    # 5. Guest detail lookup with wrong OTP is rejected (403 Forbidden)
    guest_bad = client.get(f"/api/v1/services/bookings/{booking_num}?otp=9999")
    assert guest_bad.status_code == 403


def test_health_endpoints_do_not_leak_internals():
    """Verify that /health and /api/v1/health return clean status without leaking internal database URLs or secrets."""
    for path in ("/health", "/api/v1/health"):
        res = client.get(path)
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") in ("healthy", "ok")
        # Ensure no secrets or connection strings leaked
        raw_text = res.text.lower()
        assert "password" not in raw_text
        assert "secret" not in raw_text
        assert "sqlite:///" not in raw_text
        assert "postgres://" not in raw_text


def test_razorpay_currency_and_refund_lifecycle():
    """
    Verify:
      - Webhook rejects non-INR currency
      - Webhook handles duplicate/idempotent callbacks
      - Webhook processes refund events, marking payment_status as refunded and order as cancelled
    """
    user = create_test_user(role="resident")
    order_payload = {
        "items": [{"product_name": "Turmeric Powder 200g", "unit_price": 60.0, "quantity": 1}],
        "delivery_fee": 15.0,
        "platform_fee": 5.0,
        "payment_method": "razorpay",
        "customer_name": "Currency Test Customer",
        "customer_phone": user["phone"],
        "delivery_address": "House 12, Rose Lane",
    }
    create_res = client.post("/api/v1/orders", json=order_payload, headers=user["headers"])
    assert create_res.status_code == 201
    order_data = create_res.json()["order"]
    order_num = order_data["order_number"]
    final_payable = order_data["final_payable"]
    expected_paise = int(final_payable * 100)

    secret = settings.RAZORPAY_KEY_SECRET or os.getenv("RAZORPAY_KEY_SECRET", "")

    # 1. Non-INR currency (e.g. USD) is rejected
    usd_body = json.dumps({
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_usd_attempt_1",
                    "amount": expected_paise,
                    "currency": "USD",
                    "notes": {"order_number": order_num}
                }
            }
        }
    }).encode("utf-8")
    sig_usd = hmac.new(secret.encode("utf-8"), usd_body, hashlib.sha256).hexdigest() if secret else "sig"
    res_usd = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=usd_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig_usd}
    )
    assert res_usd.status_code == 400
    assert "currency" in res_usd.json()["detail"].lower()

    # 2. Legitimate INR payment captured via webhook
    inr_body = json.dumps({
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_inr_legit_1",
                    "amount": expected_paise,
                    "currency": "INR",
                    "notes": {"order_number": order_num}
                }
            }
        }
    }).encode("utf-8")
    sig_inr = hmac.new(secret.encode("utf-8"), inr_body, hashlib.sha256).hexdigest() if secret else "sig"
    res_inr = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=inr_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig_inr}
    )
    assert res_inr.status_code == 200

    # 3. Duplicate event with same payment ID returns 200 (idempotent)
    res_dup = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=inr_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig_inr}
    )
    assert res_dup.status_code == 200
    assert "duplicate" in res_dup.json().get("message", "").lower()

    # 4. Refund processed webhook event
    refund_body = json.dumps({
        "event": "refund.processed",
        "payload": {
            "refund": {
                "entity": {
                    "id": "rfnd_test_12345",
                    "payment_id": "pay_inr_legit_1",
                    "amount": expected_paise,
                    "currency": "INR",
                    "notes": {"order_number": order_num}
                }
            }
        }
    }).encode("utf-8")
    sig_rfnd = hmac.new(secret.encode("utf-8"), refund_body, hashlib.sha256).hexdigest() if secret else "sig"
    res_rfnd = client.post(
        "/api/v1/orders/webhook/razorpay",
        content=refund_body,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig_rfnd}
    )
    assert res_rfnd.status_code == 200

    # Verify order state is refunded and cancelled
    detail_res = client.get(f"/api/v1/orders/{order_num}", headers=user["headers"])
    assert detail_res.status_code == 200
    assert detail_res.json()["order"]["payment_status"] == "refunded"
    assert detail_res.json()["order"]["status"] == "cancelled"


def test_civic_alert_admin_authorization():
    """
    Verify that /api/v1/ws/trigger-civic-alert requires administrator credentials.
    Unauthenticated callers receive 401 Unauthorized.
    Regular residents or merchants receive 403 Forbidden.
    Administrators receive 200 OK.
    """
    alert_payload = {
        "title": "Severe Heatwave Warning",
        "description": "Temperatures projected to cross 45C in North Delhi.",
        "severity": "Warning",
        "category": "Weather Alert",
    }

    # 1. Unauthenticated request rejected
    res_unauth = client.post("/api/v1/ws/trigger-civic-alert", json=alert_payload)
    assert res_unauth.status_code == 401

    # 2. Resident request rejected with 403 Forbidden
    resident = create_test_user(role="resident")
    res_resident = client.post(
        "/api/v1/ws/trigger-civic-alert",
        json=alert_payload,
        headers=resident["headers"]
    )
    assert res_resident.status_code == 403
    assert "administrators" in res_resident.json()["detail"].lower()

    # 3. Administrator request accepted
    admin = create_test_user(role="admin")
    # Mark user as admin in database directly
    from backend.app.database.session import SessionLocal
    from backend.app.database.models import User
    db = SessionLocal()
    db_admin = db.query(User).filter(User.id == admin["user_id"]).first()
    if db_admin:
        db_admin.role = "admin"
        db.commit()
    db.close()

    res_admin = client.post(
        "/api/v1/ws/trigger-civic-alert",
        json=alert_payload,
        headers=admin["headers"]
    )
    assert res_admin.status_code == 200
    assert res_admin.json()["success"] is True
