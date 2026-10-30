import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient, PyJWKClientConnectionError, PyJWKClientError
from jwt.exceptions import PyJWTError
from app.core.config import settings


bearer_scheme = HTTPBearer(auto_error=False)


class AuthService:
    def __init__(self) -> None:
        self.jwks_client = PyJWKClient(
            settings.NEON_AUTH_JWKS_URL,
            cache_keys=True,
        )

    def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    ) -> dict[str, str | None]:
        if credentials is None or credentials.scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="A bearer token is required",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(
                credentials.credentials
            )
            claims = jwt.decode(
                credentials.credentials,
                signing_key.key,
                algorithms=["EdDSA"],
                issuer=settings.neon_auth_issuer,
                audience=settings.neon_auth_issuer,
                options={"require": ["exp", "iss", "aud", "sub"]},
            )
        except PyJWKClientConnectionError as error:
            raise HTTPException(
                status_code=503,
                detail="Authentication keys are temporarily unavailable",
            ) from error
        except (PyJWKClientError, PyJWTError) as error:
            raise HTTPException(
                status_code=401,
                detail="The bearer token is invalid or expired",
                headers={"WWW-Authenticate": "Bearer"},
            ) from error

        return {
            "id": claims["sub"],
            "email": claims.get("email"),
            "name": claims.get("name"),
        }


auth_service = AuthService()