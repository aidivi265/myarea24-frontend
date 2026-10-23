import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoints():
    """Verify both /health and /api/v1/health return 200 with database status."""
    res1 = client.get("/health")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] in ("healthy", "degraded")
    assert data1["database"] == "connected"
    assert "app" in data1

    res2 = client.get("/api/v1/health")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] in ("healthy", "degraded")
    assert data2["database"] == "connected"


def test_readiness_endpoints():
    """Verify /ready and /api/v1/ready return 200 and report database connectivity."""
    res1 = client.get("/ready")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "ready"
    assert data1["database"] == "connected"

    res2 = client.get("/api/v1/ready")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "ready"


def test_system_mesh_status():
    """Verify system telemetry heartbeat."""
    res = client.get("/api/v1/system/mesh-status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "synchronized"
    assert data["mesh_network_state"] == "ACTIVE"
    assert "active_districts_indexed" in data
