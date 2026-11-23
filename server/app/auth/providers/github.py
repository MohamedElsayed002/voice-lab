from fastapi import HTTPException, status
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request 
from starlette.responses import RedirectResponse

from .base import ExternalIdentity, OAuthProvider


class GithubProvider(OAuthProvider):
    name = "github"

    def __init__(self, oauth: OAuth):
        self.client = oauth.create_client(self.name)

        if self.client is None:
            raise RuntimeError("Github OAuth client is not configured")

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

            # Get Github account 
            user_response = await self.client.get(
                "user",
                token=token
            )

            user_response.raise_for_status()

            user_data = user_response.json()

            github_id = user_data.get("id")

            if not github_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Github did not a valid account"
                )


            email_response = await self.client.get(
                "user/emails",
                token=token
            )

            email_response.raise_for_status()

            emails = email_response.json()

            verified_emails = [
                item 
                for item in emails
                if item.get("verified") is True
            ]

            primary_email = next(
                (
                    item for item in verified_emails if item.get("primary") is True
                ),
                None
            )

            if primary_email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Github account must have a verified primary email"
                )

            return ExternalIdentity(
                provider=self.name,
                provider_user_id=str(github_id),
                email=primary_email["email"].strip().lower(),
                email_verified=True,
                name=user_data.get("name") or user_data.get("login"),
                avatar_url=user_data.get("avatar_url")
            )

        except HTTPException:
            raise
        except Exception as error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Github authentication failed"
            ) from error