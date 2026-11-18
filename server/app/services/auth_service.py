import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient, PyJWKClientConnectionError, PyJWKClientError
from jwt.exceptions import PyJWTError
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.secuirty import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.exceptions.handlers import BadRequestException, ConflictException
from app.models.user import User, UserRole
from app.schema.auth import LoginRequest, RegisterRequest, TokenResponse

bearer_scheme = HTTPBearer(auto_error=False)


class AuthService:
    """Handle account credentials and validate incoming bearer tokens."""

    def __init__(self) -> None:
        self.jwks_client = PyJWKClient(settings.NEON_AUTH_JWKS_URL, cache_keys=True)

    async def register(self, db: AsyncSession, data: RegisterRequest) -> User:
        if await self._find_user_by_email(db, data.email):
            raise ConflictException("An account with this email already exists")

        if data.username and await self._find_user_by_username(db, data.username):
            raise ConflictException("This username is already taken")

        user = User(
            email=str(data.email),
            username=data.username,
            hashed_password=hash_password(data.password),
            role=UserRole.USER,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def login(self, db: AsyncSession, data: LoginRequest) -> TokenResponse:
        user = await self._find_user_by_email(db, str(data.email))
        if (
            user is None
            or user.hashed_password is None
            or not self._password_matches(data.password, user.hashed_password)
        ):
            raise BadRequestException("Invalid email or password")

        return self._create_token_response(user)

    async def refresh(self, db: AsyncSession, refresh_token: str) -> TokenResponse:
        user_id = self._get_refresh_subject(refresh_token)
        user = await self._find_user_by_id(db, user_id)
        if user is None:
            raise BadRequestException("Invalid or expired refresh token")

        return self._create_token_response(user)

    async def logout(self) -> dict[str, str]:
        return {"message": "Logged out successfully"}

    def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    ) -> dict[str, str | None]:
        token = self._get_bearer_token(credentials)

        # Accept tokens issued by this service as well as existing Neon Auth tokens.
        user = self._decode_local_access_token(token)
        if user is not None:
            return user
        return self._decode_neon_token(token)

    async def _find_user_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def _find_user_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def _find_user_by_id(self, db: AsyncSession, user_id: str) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    def _password_matches(password: str, hashed_password: str) -> bool:
        return verify_password(password, hashed_password)

    @staticmethod
    def _create_token_response(user: User) -> TokenResponse:
        role = user.role.value
        return TokenResponse(
            access_token=create_access_token(user.id, {"role": role}),
            refresh_token=create_refresh_token(user.id),
        )

    @staticmethod
    def _get_refresh_subject(token: str) -> str:
        try:
            payload = decode_token(token)
        except JWTError as error:
            raise BadRequestException("Invalid or expired refresh token") from error

        subject = payload.get("sub")
        if payload.get("type") != "refresh" or not isinstance(subject, str):
            raise BadRequestException("Invalid refresh token")
        return subject

    @staticmethod
    def _get_bearer_token(
        credentials: HTTPAuthorizationCredentials | None,
    ) -> str:
        if credentials is None or credentials.scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="A bearer token is required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return credentials.credentials

    @staticmethod
    def _decode_local_access_token(token: str) -> dict[str, str | None] | None:
        try:
            claims = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
                options={"require": ["exp", "sub", "type"]},
            )
        except PyJWTError:
            return None

        if claims.get("type") != "access":
            return None
        return {
            "id": claims["sub"],
            "email": claims.get("email"),
            "name": claims.get("name"),
        }

    def _decode_neon_token(self, token: str) -> dict[str, str | None]:
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
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
            raise self._unauthorized_token_error() from error

        return {
            "id": claims["sub"],
            "email": claims.get("email"),
            "name": claims.get("name"),
        }

    @staticmethod
    def _unauthorized_token_error() -> HTTPException:
        return HTTPException(
            status_code=401,
            detail="The bearer token is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


auth_service = AuthService()
