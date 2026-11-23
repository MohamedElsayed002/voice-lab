from abc import ABC, abstractmethod
from dataclasses import dataclass

from starlette.requests import Request 
from starlette.responses import RedirectResponse

@dataclass(frozen=True, slots=True)
class ExternalIdentity:
    provider: str 
    provider_user_id: str 
    email: str
    email_verified: bool 
    name: str | None = None 
    avatar_url: str | None = None 


class OAuthProvider(ABC):
    name: str 

    @abstractmethod
    async def authorize_redirect(
        self,
        request: Request,
        redirect_uri: str
    ) -> RedirectResponse:
        """
            Redirect the user to the provider's authentication page
        """
        raise NotImplementedError


    @abstractmethod
    async def get_identity(
        self,
        request: Request
    ) -> ExternalIdentity:
        """
            Exchange the authorization code and normalize the identity.
        """
        raise NotImplementedError