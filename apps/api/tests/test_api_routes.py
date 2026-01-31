"""Integration tests for FastAPI routes using TestClient."""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ok():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data.get("ok") is True


def test_api_v1_developer_examples():
    res = client.get("/api/v1/developer/examples")
    assert res.status_code == 200
    data = res.json()
    assert "curl" in data
    assert "python" in data
    assert "js" in data
