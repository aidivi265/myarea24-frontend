import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_otp_flow_and_cooldown():
    """Verify OTP generation, 60-second cooldown rate limit (429), and verification."""
    unique_email = f"tester_{uuid.uuid4().hex[:6]}@example.com"

    # 1. Request OTP
    res1 = client.post("/api/v1/auth/request-otp", json={"email": unique_email, "purpose": "login"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["success"] is True
    otp = data1.get("dev_otp")
    assert otp is not None
    assert len(otp) == 6

    # 2. Immediate second request within 60s should trigger 429 Too Many Requests
    res2 = client.post("/api/v1/auth/request-otp", json={"email": unique_email, "purpose": "login"})
    assert res2.status_code == 429
    assert "Please wait" in res2.json()["detail"]


def test_otp_brute_force_protection():
    """Verify that 5 failed attempts locks and invalidates the OTP."""
    unique_email = f"brute_{uuid.uuid4().hex[:6]}@example.com"

    # Request OTP
    res = client.post("/api/v1/auth/request-otp", json={"email": unique_email, "purpose": "login"})
    assert res.status_code == 200
    real_otp = res.json()["dev_otp"]

    # 4 invalid attempts
    for i in range(4):
        bad_res = client.post("/api/v1/auth/verify-otp", json={"email": unique_email, "otp_code": "000000"})
        assert bad_res.status_code == 400
        assert "attempt" in bad_res.json()["detail"].lower()

    # 5th invalid attempt
    bad_res_5 = client.post("/api/v1/auth/verify-otp", json={"email": unique_email, "otp_code": "000000"})
    assert bad_res_5.status_code == 400

    # 6th attempt even with REAL OTP must be rejected because token was burnt
    burn_res = client.post("/api/v1/auth/verify-otp", json={"email": unique_email, "otp_code": real_otp})
    assert burn_res.status_code == 400
    assert "No active verification code found" in burn_res.json()["detail"] or "invalidated" in burn_res.json()["detail"]


def test_successful_otp_login_issues_jwt():
    """Verify that correct OTP issues valid JWT access token and provisions user."""
    email = f"valid_{uuid.uuid4().hex[:6]}@example.com"
    req_res = client.post("/api/v1/auth/request-otp", json={"email": email, "purpose": "login"})
    assert req_res.status_code == 200
    otp = req_res.json()["dev_otp"]

    verify_res = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp_code": otp, "full_name": "Divya Test"})
    assert verify_res.status_code == 200
    auth_data = verify_res.json()
    assert "access_token" in auth_data
    assert auth_data["user"]["email"] == email

    # Test authenticated /me endpoint
    token = auth_data["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email
