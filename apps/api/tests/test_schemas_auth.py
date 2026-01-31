import pytest
from pydantic import ValidationError

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


def test_register_request_valid():
    r = RegisterRequest(email="user@example.com", password="password123")
    assert r.email == "user@example.com"
    assert r.password == "password123"


def test_register_request_password_too_short():
    with pytest.raises(ValidationError):
        RegisterRequest(email="user@example.com", password="short")


def test_register_request_invalid_email():
    with pytest.raises(ValidationError):
        RegisterRequest(email="not-an-email", password="password123")


def test_login_request_valid():
    r = LoginRequest(email="user@example.com", password="any")
    assert r.email == "user@example.com"
    assert r.password == "any"


def test_token_response_defaults():
    r = TokenResponse(access_token="abc")
    assert r.access_token == "abc"
    assert r.token_type == "bearer"
