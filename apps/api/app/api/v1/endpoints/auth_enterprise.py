from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.auth_enterprise import (
    LoginRequest,
    MFASetupResponse,
    MFAVerifyRequest,
    OAuthUrlResponse,
    RegisterRequest,
    RefreshRequest,
    RequestPasswordReset,
    ResetPasswordRequest,
    TokenPair,
    VerifyEmailRequest,
)
from app.services.auth_enterprise import EnterpriseAuthService

router = APIRouter(prefix="/authx", tags=["authx"])


def _client_ip(req: Request) -> str | None:
    return req.client.host if req.client else None


@router.post("/register", response_model=TokenPair)
async def register(payload: RegisterRequest, req: Request, db: AsyncSession = Depends(get_db)):
    _, access = await EnterpriseAuthService(db).register(email=payload.email, password=payload.password)
    # No refresh token on register by default
    return TokenPair(access_token=access, refresh_token="")


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, req: Request, db: AsyncSession = Depends(get_db)):
    user_agent = req.headers.get("user-agent")
    _, access, refresh = await EnterpriseAuthService(db).login(
        email=payload.email,
        password=payload.password,
        ip=_client_ip(req),
        user_agent=user_agent,
        device_fingerprint=payload.device_fingerprint,
        totp_code=payload.totp_code,
    )
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    access, new_refresh = await EnterpriseAuthService(db).refresh(payload.refresh_token, payload.device_fingerprint)
    return TokenPair(access_token=access, refresh_token=new_refresh)


@router.post("/logout")
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await EnterpriseAuthService(db).logout(payload.refresh_token)
    return {"ok": True}


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    await EnterpriseAuthService(db).verify_email(payload.token)
    return {"ok": True}


@router.post("/request-password-reset")
async def request_password_reset(payload: RequestPasswordReset, db: AsyncSession = Depends(get_db)):
    await EnterpriseAuthService(db).request_password_reset(payload.email)
    return {"ok": True}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await EnterpriseAuthService(db).reset_password(payload.token, payload.new_password)
    return {"ok": True}


@router.post("/mfa/setup", response_model=MFASetupResponse)
async def mfa_setup(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    secret, uri = await EnterpriseAuthService(db).mfa_setup(user)
    return MFASetupResponse(secret=secret, otpauth_uri=uri)


@router.post("/mfa/enable")
async def mfa_enable(payload: MFAVerifyRequest, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await EnterpriseAuthService(db).mfa_enable(user, payload.code)
    return {"ok": True}


@router.post("/mfa/disable")
async def mfa_disable(payload: MFAVerifyRequest, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await EnterpriseAuthService(db).mfa_disable(user, payload.code)
    return {"ok": True}


@router.get("/oauth/{provider}/url", response_model=OAuthUrlResponse)
async def oauth_url(provider: str):
    # Placeholder: full OAuth callback flow is environment-specific; return a doc hint.
    return OAuthUrlResponse(authorization_url=f"/api/v1/authx/oauth/{provider}/callback?code=...")

