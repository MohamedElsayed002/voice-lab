
from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException, status

from app.core.config import settings
from app.auth.providers.base import OAuthProvider
from app.auth.providers.google import GoogleProvider
from app.auth.providers.github import GithubProvider


oauth = OAuth()


if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url=(
            "https://accounts.google.com/.well-known/openid-configuration"
        ),
        client_kwargs={
            "scope": "openid email profile",
        },
    )


if settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
    oauth.register(
        name="github",
        client_id=settings.GITHUB_CLIENT_ID,
        client_secret=settings.GITHUB_CLIENT_SECRET,
        authorize_url="https://github.com/login/oauth/authorize",
        access_token_url="https://github.com/login/oauth/access_token",
        api_base_url="https://api.github.com/",
        client_kwargs={
            "scope": "read:user user:email",
        },
    )


def get_oauth_provider(provider_name: str) -> OAuthProvider:
    providers = {
        "google": GoogleProvider,
        "github": GithubProvider,
    }

    provider_class = providers.get(provider_name.lower())

    if provider_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unsupported OAuth provider",
        )

    try:
        return provider_class(oauth)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OAuth provider is not configured",
        ) from error
