import logging

from fastapi import HTTPException, status
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app.auth.providers.base import (
    ExternalIdentity,
    OAuthProvider
)

class GoogleProvider(OAuthProvider):

    name = "google"
    logger = logging.getLogger(__name__)

    def __init__(self, oauth: OAuth):
        self.client = oauth.create_client(self.name)

        if self.client is None:
            raise RuntimeError("Google OAuth client is not configured")

    async def authorize_redirect(
            self,
            request: Request,
            redirect_uri: str
    ) -> RedirectResponse:
        
        return await self.client.authorize_redirect(
            request,
            redirect_uri
        )

    async def get_identity(
            self,
            request: Request
    ) -> ExternalIdentity:
        try:
            token = await self.client.authorize_access_token(request)

            # Authlib parses the OIDC ID Token and exposes userinfo 
            # when the openid scope is configured 
            userinfo = token.get("userinfo")

            if not userinfo:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google did not return a verified identity"
                )

            subject = userinfo.get("sub")
            email = userinfo.get("email")
            email_verified = userinfo.get("email_verified") is True

            if not subject or not email or not email_verified:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google account must have a verified email"
                )

            return ExternalIdentity(
                provider=self.name,
                provider_user_id=str(subject),
                email=email.lower().strip(),
                email_verified=True,
                name=userinfo.get("name"),
                avatar_url=userinfo.get("picture")
            )

        except HTTPException:
            raise
        except Exception as error:
            self.logger.warning(
                "Google identity verification failed with %s",
                type(error).__name__,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google authentication failed"
            ) from error