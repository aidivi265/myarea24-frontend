import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database.session import Base, get_db
from backend.app.database.models import User, Business, Product, Order, CustomerEnquiry, ServiceListing, Offer, Event
from backend.app.core.security import create_access_token
from backend.app.core.config import settings

# In-memory SQLite database dedicated for tests
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def merchant_a(db_session):
    user_a = User(
        email="merchant_a@example.com",
        phone="+919811000001",
        full_name="Merchant Alice",
        role="merchant",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user_a)
    db_session.commit()
    db_session.refresh(user_a)

    biz_a = Business(
        name="Alice Kirana Store",
        slug="alice-kirana",
        owner_id=user_a.id,
        category="Grocery",
        description="Alice's neighborhood grocery store.",
        address="Shop 1, Sector 15 Market",
        locality="Sector 15",
        city="Noida",
        state="Uttar Pradesh",
        latitude=28.5800,
        longitude=77.3100,
        phone="+919811000001",
        status="active",
        is_verified=True,
    )
    db_session.add(biz_a)
    db_session.commit()
    db_session.refresh(biz_a)

    token = create_access_token({"sub": str(user_a.id), "email": user_a.email, "role": user_a.role})
    return {"user": user_a, "business": biz_a, "token": token}


@pytest.fixture
def merchant_b(db_session):
    user_b = User(
        email="merchant_b@example.com",
        phone="+919811000002",
        full_name="Merchant Bob",
        role="merchant",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user_b)
    db_session.commit()
    db_session.refresh(user_b)

    biz_b = Business(
        name="Bob Electronics",
        slug="bob-electronics",
        owner_id=user_b.id,
        category="Electronics",
        description="Bob's certified gadget repair shop.",
        address="Shop 2, Sector 18 Market",
        locality="Sector 18",
        city="Noida",
        state="Uttar Pradesh",
        latitude=28.5700,
        longitude=77.3200,
        phone="+919811000002",
        status="active",
        is_verified=True,
    )
    db_session.add(biz_b)
    db_session.commit()
    db_session.refresh(biz_b)

    token = create_access_token({"sub": str(user_b.id), "email": user_b.email, "role": user_b.role})
    return {"user": user_b, "business": biz_b, "token": token}


# ==============================================================================
# 1. Unauthenticated Requests Rejected (401)
# ==============================================================================
def test_unauthenticated_requests_rejected(client):
    endpoints = [
        ("GET", "/api/v1/merchant/overview"),
        ("GET", "/api/v1/merchant/storefront"),
        ("PUT", "/api/v1/merchant/storefront"),
        ("GET", "/api/v1/merchant/products"),
        ("POST", "/api/v1/merchant/products"),
        ("GET", "/api/v1/merchant/orders"),
        ("GET", "/api/v1/merchant/leads"),
        ("GET", "/api/v1/merchant/settings"),
        ("PUT", "/api/v1/merchant/settings"),
        ("GET", "/api/v1/merchant/export-data"),
        ("GET", "/api/v1/merchant/services"),
        ("GET", "/api/v1/merchant/offers"),
        ("GET", "/api/v1/merchant/events"),
    ]
    for method, ep in endpoints:
        if method == "GET":
            res = client.get(ep)
        elif method == "PUT":
            res = client.put(ep, json={})
        elif method == "POST":
            res = client.post(ep, json={})
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {ep}, got {res.status_code}"


# ==============================================================================
# 2. Invalid or Expired Tokens Rejected (401)
# ==============================================================================
def test_invalid_tokens_rejected(client):
    headers = {"Authorization": "Bearer completely_bogus_token_12345"}
    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 401
    assert "invalid or has expired" in res.json().get("detail", "").lower()


def test_expired_tokens_rejected(client, merchant_a):
    expired_token = create_access_token(
        {"sub": str(merchant_a["user"].id), "email": merchant_a["user"].email},
        expires_delta=datetime.timedelta(seconds=-60),
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 401


def test_malformed_auth_header_rejected(client):
    headers = {"Authorization": "Basic dXNlcjpwYXNz"}
    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 401


# ==============================================================================
# 3. Authenticated Merchant Can Access Only Their Own Resources (200)
# ==============================================================================
def test_authenticated_merchant_can_access_own_resources(client, merchant_a):
    headers = {"Authorization": f"Bearer {merchant_a['token']}"}

    # Overview
    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["business"]["name"] == "Alice Kirana Store"
    assert data["business"]["id"] == merchant_a["business"].id

    # Storefront
    res = client.get("/api/v1/merchant/storefront", headers=headers)
    assert res.status_code == 200
    assert res.json()["storefront"]["name"] == "Alice Kirana Store"

    # Products listing
    res = client.get("/api/v1/merchant/products", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "success"


# ==============================================================================
# 4. Merchant A Cannot Read or Modify Merchant B's Resources (403/404)
# ==============================================================================
def test_merchant_cannot_access_other_business_by_id(client, merchant_a, merchant_b):
    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}

    # Alice passes business_id belonging to Bob
    res = client.get(f"/api/v1/merchant/overview?business_id={merchant_b['business'].id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]

    # Alice passes X-Merchant-Id header belonging to Bob
    headers_spoof = {
        "Authorization": f"Bearer {merchant_a['token']}",
        "X-Merchant-Id": str(merchant_b["business"].id),
    }
    res = client.get("/api/v1/merchant/overview", headers=headers_spoof)
    assert res.status_code == 403


def test_merchant_cannot_spoof_via_phone_header(client, merchant_a, merchant_b):
    # Alice passes X-Merchant-Phone header belonging to Bob
    headers_spoof = {
        "Authorization": f"Bearer {merchant_a['token']}",
        "X-Merchant-Phone": merchant_b["user"].phone,
    }
    res = client.get("/api/v1/merchant/overview", headers=headers_spoof)
    assert res.status_code == 200
    # Must STILL return Alice's business, NEVER Bob's!
    assert res.json()["business"]["id"] == merchant_a["business"].id
    assert res.json()["business"]["name"] == "Alice Kirana Store"


def test_merchant_cannot_mutate_other_merchants_product(client, db_session, merchant_a, merchant_b):
    # Bob creates a product
    prod_b = Product(
        business_id=merchant_b["business"].id,
        name="Bob's Smartphone",
        category="Electronics",
        local_price=15000.0,
        availability_status="in_stock",
    )
    db_session.add(prod_b)
    db_session.commit()
    db_session.refresh(prod_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}

    # Alice tries to update Bob's product
    res_update = client.put(
        f"/api/v1/merchant/products/{prod_b.id}",
        json={"name": "Alice Hacked This", "price": 10.0},
        headers=headers_a,
    )
    assert res_update.status_code == 403
    assert "Forbidden" in res_update.json()["detail"]

    # Alice tries to delete Bob's product
    res_delete = client.delete(
        f"/api/v1/merchant/products/{prod_b.id}",
        headers=headers_a,
    )
    assert res_delete.status_code == 403
    assert "Forbidden" in res_delete.json()["detail"]


def test_merchant_cannot_mutate_other_merchants_order(client, db_session, merchant_a, merchant_b):
    order_b = Order(
        order_number="ORD-BOB-001",
        business_id=merchant_b["business"].id,
        status="placed",
        total_amount=500.0,
        final_payable=500.0,
        customer_name="Customer Charlie",
        customer_phone="+919999999999",
        delivery_address="Nearby address",
    )
    db_session.add(order_b)
    db_session.commit()
    db_session.refresh(order_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.put(
        f"/api/v1/merchant/orders/{order_b.id}/status",
        json={"status": "cancelled"},
        headers=headers_a,
    )
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_mutate_other_merchants_service(client, db_session, merchant_a, merchant_b):
    svc_b = ServiceListing(
        business_id=merchant_b["business"].id,
        user_id=merchant_b["user"].id,
        provider_name="Bob Mobile Repair",
        category="Electronics",
        service_area="Noida",
        locality="Sector 18",
        city="Noida",
        latitude=28.57,
        longitude=77.32,
        phone="+919811000002",
        price_starting_at=300.0,
    )
    db_session.add(svc_b)
    db_session.commit()
    db_session.refresh(svc_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.delete(f"/api/v1/merchant/services/{svc_b.id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_mutate_other_merchants_offer(client, db_session, merchant_a, merchant_b):
    off_b = Offer(
        business_id=merchant_b["business"].id,
        title="Bob's 50% Off",
        discount_text="50% Off",
        category="Electronics",
        valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=7),
    )
    db_session.add(off_b)
    db_session.commit()
    db_session.refresh(off_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.delete(f"/api/v1/merchant/offers/{off_b.id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_delete_other_merchants_event(client, db_session, merchant_a, merchant_b):
    evt_b = Event(
        title="Bob's Tech Expo",
        category="Tech",
        organizer=merchant_b["business"].name,
        source=f"Merchant: {merchant_b['business'].name}",
        venue_name="Bob Store",
        address=merchant_b["business"].address,
        locality="Sector 18",
        city="Noida",
        latitude=28.57,
        longitude=77.32,
        start_time=datetime.datetime.utcnow() + datetime.timedelta(days=3),
    )
    db_session.add(evt_b)
    db_session.commit()
    db_session.refresh(evt_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.delete(f"/api/v1/merchant/events/{evt_b.id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_mutate_other_merchants_lead(client, db_session, merchant_a, merchant_b):
    lead_b = CustomerEnquiry(
        business_id=merchant_b["business"].id,
        customer_name="Lead Dave",
        customer_phone="+918888888888",
        message="Need quotation for phone repair",
        status="pending",
    )
    db_session.add(lead_b)
    db_session.commit()
    db_session.refresh(lead_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.put(
        f"/api/v1/merchant/leads/{lead_b.id}/status",
        json={"status": "Closed"},
        headers=headers_a,
    )
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_mutate_other_merchants_service(client, db_session, merchant_a, merchant_b):
    svc_b = ServiceListing(
        business_id=merchant_b["business"].id,
        user_id=merchant_b["user"].id,
        provider_name="Bob Mobile Repair",
        category="Electronics",
        service_area="Noida",
        locality="Sector 18",
        city="Noida",
        latitude=28.57,
        longitude=77.32,
        phone="+919811000002",
        price_starting_at=300.0,
    )
    db_session.add(svc_b)
    db_session.commit()
    db_session.refresh(svc_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.delete(f"/api/v1/merchant/services/{svc_b.id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_mutate_other_merchants_offer(client, db_session, merchant_a, merchant_b):
    off_b = Offer(
        business_id=merchant_b["business"].id,
        title="Bob's 50% Off",
        discount_text="50% Off",
        category="Electronics",
        valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=7),
    )
    db_session.add(off_b)
    db_session.commit()
    db_session.refresh(off_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.delete(f"/api/v1/merchant/offers/{off_b.id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_merchant_cannot_delete_other_merchants_event(client, db_session, merchant_a, merchant_b):
    evt_b = Event(
        title="Bob's Tech Expo",
        category="Tech",
        organizer=merchant_b["business"].name,
        source=f"Merchant: {merchant_b['business'].name}",
        venue_name="Bob Store",
        address=merchant_b["business"].address,
        locality="Sector 18",
        city="Noida",
        latitude=28.57,
        longitude=77.32,
        start_time=datetime.datetime.utcnow() + datetime.timedelta(days=3),
    )
    db_session.add(evt_b)
    db_session.commit()
    db_session.refresh(evt_b)

    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.delete(f"/api/v1/merchant/events/{evt_b.id}", headers=headers_a)
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


# ==============================================================================
# 5. Regression Coverage for Working Authorized Workflows
# ==============================================================================
def test_authorized_merchant_crud_workflow(client, merchant_a):
    headers_a = {"Authorization": f"Bearer {merchant_a['token']}"}

    # 1. Update storefront profile
    res_prof = client.put(
        "/api/v1/merchant/storefront",
        json={"name": "Alice Super Kirana", "tagline": "Fresh vegetables daily"},
        headers=headers_a,
    )
    assert res_prof.status_code == 200
    assert res_prof.json()["business"]["name"] == "Alice Super Kirana"

    # 2. Update settings
    res_sett = client.put(
        "/api/v1/merchant/settings",
        json={"notifications": {"enquiries": False}},
        headers=headers_a,
    )
    assert res_sett.status_code == 200
    assert res_sett.json()["settings"]["notifications"]["enquiries"] is False

    # 3. Create a product
    res_prod = client.post(
        "/api/v1/merchant/products",
        json={
            "name": "Toor Dal 1kg",
            "category": "Grocery",
            "price": 140.0,
            "mrp": 160.0,
            "availability_status": "in_stock",
        },
        headers=headers_a,
    )
    assert res_prod.status_code == 200
    prod_id = res_prod.json()["product"]["numericId"]

    # 4. Update product
    res_up = client.put(
        f"/api/v1/merchant/products/{prod_id}",
        json={"price": 135.0, "status": "Active"},
        headers=headers_a,
    )
    assert res_up.status_code == 200

    # 5. Export data (only Alice's items)
    res_exp = client.get("/api/v1/merchant/export-data", headers=headers_a)
    assert res_exp.status_code == 200
    exp_data = res_exp.json()
    assert exp_data["storefront"]["id"] == merchant_a["business"].id
    catalog_names = [p["name"] for p in exp_data["catalog"]]
    assert "Toor Dal 1kg" in catalog_names

    # 6. Delete product
    res_del = client.delete(f"/api/v1/merchant/products/{prod_id}", headers=headers_a)
    assert res_del.status_code == 200


# ==============================================================================
# 6. Dev Bypass Strict Rejection in Production Mode
# ==============================================================================
def test_dev_bypass_strictly_rejected_in_production(client, merchant_a, monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "production")
    monkeypatch.setattr(settings, "DEBUG", False)

    headers = {
        "Authorization": f"Bearer {merchant_a['token']}",
        "X-Dev-Merchant-Bypass": "true",
    }
    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 403
    assert "forbidden in production" in res.json()["detail"].lower()


def test_user_without_business_raises_404_in_production(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "production")
    monkeypatch.setattr(settings, "DEBUG", False)

    # Resident user without a business
    resident = User(
        email="new_resident@example.com",
        role="resident",
        is_active=True,
    )
    db_session.add(resident)
    db_session.commit()
    db_session.refresh(resident)

    token = create_access_token({"sub": str(resident.id), "email": resident.email, "role": resident.role})
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 404
    assert "No business registered" in res.json()["detail"]


def test_deactivated_merchant_account_rejected(client, db_session, merchant_a):
    merchant_a["user"].is_active = False
    db_session.commit()
    headers = {"Authorization": f"Bearer {merchant_a['token']}"}
    res = client.get("/api/v1/merchant/overview", headers=headers)
    assert res.status_code == 403
    assert "deactivated" in res.json().get("detail", "").lower()


def test_admin_can_access_and_manage_any_business(client, db_session, merchant_a):
    admin_user = User(
        email="admin@myarea24.in",
        full_name="Platform Admin",
        role="admin",
        is_active=True,
        is_verified=True,
    )
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)

    admin_token = create_access_token({"sub": str(admin_user.id), "email": admin_user.email, "role": "admin"})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin accesses Alice's business explicitly via business_id query param
    res = client.get(f"/api/v1/merchant/overview?business_id={merchant_a['business'].id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["business"]["id"] == merchant_a["business"].id
