from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: str | None = Field(default=None, min_length=6, max_length=8)
    device_fingerprint: str | None = Field(default=None, max_length=128)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
    device_fingerprint: str | None = Field(default=None, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str


class RequestPasswordReset(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class MFASetupResponse(BaseModel):
    secret: str
    otpauth_uri: str


class MFAVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=8)


class OAuthUrlResponse(BaseModel):
    authorization_url: str

