import hashlib
import secrets 
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select 
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from app.auth.providers.registry import get_oauth_provider
from app.auth.schemas.auth import TokenResponse
from app.auth.schemas.oauth import OAuthExchangeRequest
from app.auth.services.oauth_service import OAuthService
from app.auth.services.session_service import session_service
from app.core.config import settings
from app.core.dependencies import get_db
from app.models.oauth_exchange_code import OAuthExchangeCode
from app.models.user import User 

router = APIRouter(
    prefix="/auth/oauth",
    tags=["oauth"]
)

def _hash_exchange_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _get_redirect_uri(provider: str) -> str:
    redirect_uris = {
        "google": settings.GOOGLE_REDIRECT_URI,
        "github": settings.GITHUB_REDIRECT_URI
    }


    redirect_uri = redirect_uris.get(provider)

    if not redirect_uri:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unsupported OAuth provider"
        )

    return redirect_uri



def _frontend_callback_url(
    *,
    code: str | None = None,
    error: str | None = None,
) -> str:
    if code:
        return (
            f"{settings.FRONTEND_URL.rstrip('/')}"
            f"/auth/callback#code={code}"
        )

    if error:
        return (
            f"{settings.FRONTEND_URL.rstrip('/')}"
            f"/auth/callback?error={error}"
        )

    return f"{settings.FRONTEND_URL.rstrip('/')}/auth/callback"


@router.get("/{provider}")
async def start_oauth(
    provider: str,
    request: Request
):
    provider_name = provider.lower()
    oauth_provider = get_oauth_provider(provider_name)

    redirect_uri = _get_redirect_uri(provider_name)

    return await oauth_provider.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    provider_name = provider.lower()

    try:
        oauth_provider = get_oauth_provider(provider_name)

        # Authlib validates the OAuth state and, for Google
        # the OIDC ID token and nonce
        identity = await oauth_provider.get_identity(request)

        oauth_service = OAuthService(db)

        user = await oauth_service.authenticate(identity)

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is unavailable"
            )

        # Generate a random, short-lived, one-time exchange code.
        raw_code = secrets.token_urlsafe(32)


        exchange_code = OAuthExchangeCode(
            user_id=user.id,
            code_hash=_hash_exchange_code(raw_code),
            expires_at=(
                datetime.now(timezone.utc) + timedelta(seconds=settings.OAUTH_EXCHANGE_CODE_EXPIRE_SECONDS)
            )
        )

        db.add(exchange_code)

        # Commits the new user/account (if created) and exchange code.
        await db.commit()

        return RedirectResponse(
            url=_frontend_callback_url(code=raw_code),
            status_code=status.HTTP_303_SEE_OTHER
        )

    except HTTPException:
        await db.rollback()

        return RedirectResponse(
            url=_frontend_callback_url(error="oauth_failed"),
            status_code=status.HTTP_303_SEE_OTHER
        )

    except Exception:
        await db.rollback()

        return RedirectResponse(
            url=_frontend_callback_url(error="oauth_failed"),
            status_code=status.HTTP_303_SEE_OTHER
        )




@router.post(
    "/exchange",
    response_model=TokenResponse,
)
async def exchange_oauth_code(
    data: OAuthExchangeRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    code_hash = _hash_exchange_code(data.code)
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(OAuthExchangeCode)
        .where(OAuthExchangeCode.code_hash == code_hash)
        .with_for_update()
    )

    exchange_code = result.scalar_one_or_none()

    if (
        exchange_code is None
        or exchange_code.used_at is not None
        or exchange_code.expires_at <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth exchange code",
        )

    user = await db.get(User, exchange_code.user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is unavailable",
        )

    # Mark it as consumed. SessionService commits this change
    # together with the newly created session.
    exchange_code.used_at = now

    return await session_service.create_session(db, user)