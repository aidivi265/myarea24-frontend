import hashlib
import hmac
import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


@pytest.fixture
def auth_headers():
    """Generates an authenticated resident token for testing."""
    import uuid
    email = f"order_test_{uuid.uuid4().hex[:6]}@example.com"
    r = client.post("/api/v1/auth/request-otp", json={"email": email, "purpose": "login"})
    otp = r.json()["dev_otp"]
    v = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp_code": otp, "full_name": "Test Customer", "phone": "9876543210"})
    token = v.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_order_creation_and_privacy(auth_headers):
    """Verify order creation and that unauthenticated listing does not leak all orders."""
    order_payload = {
        "items": [
            {
                "product_name": "Organic A2 Gir Cow Milk",
                "unit_price": 95.0,
                "quantity": 2,
                "store_name": "Apna Dairy",
            }
        ],
        "delivery_fee": 30.0,
        "platform_fee": 5.0,
        "discount_amount": 0.0,
        "payment_method": "upi_qr",
        "customer_name": "Test Customer",
        "customer_phone": "9876543210",
        "delivery_address": "House 102, Green Avenue, Sector 15",
    }

    create_res = client.post("/api/v1/orders", json=order_payload, headers=auth_headers)
    assert create_res.status_code == 201
    order_data = create_res.json()["order"]
    order_number = order_data["order_number"]
    assert order_number.startswith("MA24-ORD-")
    assert order_data["final_payable"] == 225.0

    # 1. Unauthenticated listing with no phone MUST NOT return orders
    unauth_list = client.get("/api/v1/orders")
    assert unauth_list.status_code == 200
    assert unauth_list.json()["count"] == 0

    # 2. Authenticated listing MUST return this customer's order
    auth_list = client.get("/api/v1/orders", headers=auth_headers)
    assert auth_list.status_code == 200
    assert auth_list.json()["count"] >= 1
    found = any(o["order_number"] == order_number for o in auth_list.json()["orders"])
    assert found is True

    # 3. Direct detail access by owner
    detail_res = client.get(f"/api/v1/orders/{order_number}", headers=auth_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["order"]["order_number"] == order_number

    # 4. Unauthorized stranger detail access should return 403 Forbidden
    stranger_res = client.get(f"/api/v1/orders/{order_number}")
    assert stranger_res.status_code in (401, 403)


def test_order_status_authorization(auth_headers):
    """Verify that a customer cannot change order status to delivered, only cancelled while in placed stage."""
    order_payload = {
        "items": [{"product_name": "Brown Bread", "unit_price": 45.0, "quantity": 1}],
        "payment_method": "cod",
        "customer_name": "Test Customer",
        "customer_phone": "9876543210",
        "delivery_address": "Flat 2B, Galaxy Tower",
    }
    r = client.post("/api/v1/orders", json=order_payload, headers=auth_headers)
    order_num = r.json()["order"]["order_number"]

    # Customer tries to mark order as delivered (forbidden)
    bad_status = client.patch(f"/api/v1/orders/{order_num}/status", json={"status": "delivered"}, headers=auth_headers)
    assert bad_status.status_code == 403

    # Customer cancels placed order (allowed)
    cancel_res = client.patch(f"/api/v1/orders/{order_num}/status", json={"status": "cancelled"}, headers=auth_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["new_status"] == "cancelled"

    # Customer cannot cancel already cancelled order
    re_cancel = client.patch(f"/api/v1/orders/{order_num}/status", json={"status": "cancelled"}, headers=auth_headers)
    assert re_cancel.status_code == 400


def test_payment_verification_and_tampered_signature():
    """Verify cryptographic signature check, rejection of tampered signature, and idempotency."""
    # Create order
    order_payload = {
        "items": [{"product_name": "Filter Coffee Decoction", "unit_price": 120.0, "quantity": 1}],
        "payment_method": "razorpay",
        "customer_name": "Priya",
        "customer_phone": "9911223344",
        "delivery_address": "Indiranagar 100ft Road",
    }
    r = client.post("/api/v1/orders", json=order_payload)
    order_num = r.json()["order"]["order_number"]
    rzp_order_id = r.json()["payment"]["razorpay_order_id"]

    # 1. Fake / Tampered Razorpay signature
    fake_verify = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "razorpay",
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": "pay_test_123456",
            "razorpay_signature": "tampered_invalid_signature_hash_value_999",
        },
    )
    # If secret is set, it will be 400. Even if not set, let's test valid signature calculation
    razorpay_secret = settings.RAZORPAY_KEY_SECRET or "test_secret_for_unit_tests"
    settings.RAZORPAY_KEY_SECRET = razorpay_secret

    tampered_res = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "razorpay",
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": "pay_test_123456",
            "razorpay_signature": "tampered_invalid_signature_hash_value_999",
        },
    )
    assert tampered_res.status_code == 400
    assert "signature verification failed" in tampered_res.json()["detail"].lower()

    # 2. Valid signature verification
    valid_payload = f"{rzp_order_id}|pay_test_123456".encode("utf-8")
    valid_signature = hmac.new(
        razorpay_secret.encode("utf-8"),
        valid_payload,
        hashlib.sha256
    ).hexdigest()

    good_res = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "razorpay",
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": "pay_test_123456",
            "razorpay_signature": valid_signature,
            "transaction_id": "pay_test_123456",
        },
    )
    assert good_res.status_code == 200
    assert good_res.json()["order_status"] == "confirmed"

    # 3. Idempotent repeat payment verification with SAME transaction_id
    idempotent_res = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "razorpay",
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": "pay_test_123456",
            "razorpay_signature": valid_signature,
            "transaction_id": "pay_test_123456",
        },
    )
    assert idempotent_res.status_code == 200
    assert "idempotent" in idempotent_res.json()["message"].lower()

    # 4. Conflicting payment attempt with DIFFERENT transaction_id on already paid order
    conflict_res = client.post(
        f"/api/v1/orders/{order_num}/verify-payment",
        json={
            "payment_method": "razorpay",
            "transaction_id": "pay_different_conflict_txn_888",
        },
    )
    assert conflict_res.status_code == 409
