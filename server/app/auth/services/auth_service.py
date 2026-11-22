from fastapi import Depends, HTTPException, status 
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)
from jose import JWTError
from sqlalchemy import select 
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.auth.services.token_service import (
    decode_access_token,
)
from app.auth.services.session_service import  session_service
from app.exceptions.handlers import ConflictException 
from app.models.user import User, UserRole
from app.auth.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse
)
from .password_service import (
    hash_password,
    verify_password,
    password_needs_rehash,
    verify_and_update_password
)

import jwt

from app.services.audit_log_services import audit_service

bearer_scheme = HTTPBearer(auto_error=False)

class AuthService:

    def __init__(self):
        self.audit_service = audit_service
        self.session_service = session_service
    # Helper func
    @staticmethod
    def _unauthorized(
        detail: str = "Invalid or expired credentials"
    ) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

    async def _find_user_by_email(
            self,
            db: AsyncSession,
            email: str
    ) -> User | None:
        result = await db.execute(
            select(User).where(User.email == email.lower())
        )

        return result.scalar_one_or_none()

    async def _find_by_username(
            self,
            db: AsyncSession,
            username: str
    ) -> User | None:
        result = await db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()


    async def register(
            self,
            db: AsyncSession,
            data: RegisterRequest
    ) -> User:

        email = str(data.email).lower()
        username = data.username

        if await self._find_user_by_email(db,email):
            raise ConflictException(
                "An account with this email already exists"
            )

        if username and await self._find_by_username(
            db,
            username
        ):
            raise ConflictException(
                "This username is already taken"
            )

        user = User(
            email=email,
            username=username,
            hashed_password=hash_password(data.password),
            role=UserRole.USER,
            is_active=True,
            email_verified=False,
            auth_provider="local"
        )

        db.add(user)

        try:
            await db.commit()
            await db.refresh(user)
        except IntegrityError:
            await db.rollback()
            raise ConflictException(
                "An account with this email or username already exists"
            )

        return user

    async def login(
            self,
            db: AsyncSession,
            data: LoginRequest
    ) -> TokenResponse:

        user = await self._find_user_by_email(
            db,
            str(data.email)
        )

        if(user is None or user.hashed_password is None):

            await self.audit_service.create_audit_log(
                event="FAILED_USER_LOGIN",
                status=str(status.HTTP_401_UNAUTHORIZED),
                user_id=None,
                metadata={"message": "Invalid email or password"}
            )
            raise self._unauthorized("Invalid email or password")

        valid, updated_hash = verify_and_update_password(
            data.password,
            user.hashed_password
        )

        if not valid:
            raise self._unauthorized("Invalid email or password")

        if not user.is_active:
            raise self._unauthorized("This account is disabled")

        # Upgrade old bcrypt hashed after successful authentication 
        if updated_hash:
            user.hashed_password = updated_hash

        return await self.session_service.create_session(db, user)


    async def refresh(
            self,
            db: AsyncSession,
            raw_refresh_token: str 
    ) -> TokenResponse:
        try:
            return await self.session_service.refresh_session(
                db,
                raw_refresh_token,
            )
        except ValueError as error:
            detail = str(error)
            if detail == "Invalid refresh token":
                detail = "Invalid refresh token"
            elif detail == "Expired refresh token":
                detail = "Refresh token has expired"
            elif detail == "User is unavailable":
                detail = "Account is unavailable"
            raise self._unauthorized(detail) from error


    async def logout(
            self,
            db: AsyncSession,
            raw_refresh_token: str
    ) -> dict[str,str]:
        await self.session_service.revoke_session(db, raw_refresh_token)
        return { "message": "Logged out successfully"}


    async def logout_all(
            self,
            db:AsyncSession,
            user_id: str
    ) -> dict[str,str]:
        await self.session_service.revoke_all(db, user_id)
        return {
            "message": "Logged out from all devices"
        }
    

    async def get_current_user(
            self,
            credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
            db: AsyncSession = Depends(get_db)
    ) -> dict[str, str | None]:

        if(
            credentials is None
            or credentials.scheme.lower() != "bearer"
        ):
            raise self._unauthorized("A bearer token is required")

        try:
            claims = decode_access_token(
                credentials.credentials
            )

        except jwt.InvalidTokenError as error:
            raise self._unauthorized() from error

        session_id = claims.get("sid")
        user_id = claims.get("sub")

        if not session_id or not user_id:
            raise self._unauthorized()

        if not await self.session_service.validate_session(
            db,
            session_id,
            user_id,
        ):
            raise self._unauthorized("Session is no longer active")

        user_result = await db.execute(
            select(User).where(
                User.id == user_id,
                User.is_active.is_(True)
            )
        )

        user = user_result.scalar_one_or_none()

        if user is None:
            raise self._unauthorized("Account is unavailable")

        return {
            "id": user.id,
            "email": user.email,
            "name": user.username,
            "role": user.role.value,
            "tier": user.tier,
            "avatar": user.avatar_url,
            "email_notification": user.email_notification
        }


auth_service = AuthService()