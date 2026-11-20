from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status 
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)
from jose import JWTError
from sqlalchemy import select 
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_db
from app.auth.services.token_service import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    hash_refresh_token,
)
from app.exceptions.handlers import ConflictException 
from app.models.session import AuthSession 
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

from app.services.audit_log_services import audit_service

bearer_scheme = HTTPBearer(auto_error=False)

class AuthService:

    def __init__(self):
        self.audit_service = audit_service
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


    async def _create_session(
        self,
        db: AsyncSession,
        user: User
    ) -> TokenResponse:

        raw_refresh_token = create_refresh_token()

        session = AuthSession(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(
                raw_refresh_token
            ),
            expires_at=(
                datetime.now(timezone.utc)
                + timedelta(
                    days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
                )
            )
        )

        db.add(session)

        # I need to generated session id before creating the jwt
        await db.flush()

        access_token = create_access_token(
            user_id=user.id,
            session_id=session.id,
            role=user.role.value
        )

        await db.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token
        )


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
            email,
            username,
            hashed_password=hash_password(data.password),
            role=UserRole.USER,
            is_active=True
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

        return await self._create_session(db,user)


    async def refresh(
            self,
            db: AsyncSession,
            raw_refresh_token: str 
    ) -> TokenResponse:

        token_hash = hash_refresh_token(raw_refresh_token)

        result = await db.execute(
            select(AuthSession)
            .where(
                AuthSession.refresh_token_hash == token_hash,
                AuthSession.revoked_at.is_(None)
            )
            .with_for_update()
        )

        session = result.scalar_one_or_none()

        if session is None:
            raise self._unauthorized("Invalid refresh token")

        now = datetime.now(timezone.utc)

        if session.expires_at <= now:
            session.revoked_at = now 
            await db.commit()
            raise self._unauthorized("Refresh token has expired")

        user_result = await db.execute(
            select(User).where(User.id == session.user_id)
        )

        user = user_result.scalar_one_or_none()

        if user is None or not user.is_active:
            session.revoked_at = now
            await db.commit()
            raise self._unauthorized("Account is unavailable")


        # Rotate the refresh token on every successful refresh
        new_refresh_token = create_refresh_token()

        session.refresh_token_hash = hash_refresh_token(
            new_refresh_token
        )

        session.expires_at = (
            now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        )

        new_access_token = create_access_token(
            user_id=user.id,
            session_id=session.id,
            role=user.role.value
        )

        await db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token
        )


    async def logout(
            self,
            db: AsyncSession,
            raw_refresh_token: str
    ) -> dict[str,str]:
        
        token_hash = hash_refresh_token(raw_refresh_token)

        result = await db.execute(
            select(AuthSession).where(
                AuthSession.refresh_token_hash == token_hash,
                AuthSession.revoked_at.is_(None)
            )
        )

        session = result.scalar_one_or_none()

        if session is not None:
            session.revoked_at = datetime.now(timezone.utc)
            await db.commit()

        return { "message": "Logged out successfully"}


    async def logout_all(
            self,
            db:AsyncSession,
            user_id: str
    ) -> dict[str,str]:
        result = await db.execute(
            select(AuthSession).where(
                AuthSession.user_id == user_id,
                AuthSession.revoked_at.is_(None)
            )
        )

        sessions = result.scalars().all()
        now = datetime.now(timezone.utc)

        for session in sessions:
            session.revoked_at = now 

        await db.commit()

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

        except JWTError as error:
            raise self._unauthorized() from error

        session_id = claims.get("sid")
        user_id = claims.get("sub")

        if not session_id or not user_id:
            raise self._unauthorized()

        now = datetime.now(timezone.utc)


        # Checking the session means logout can invalidate
        # access tokens immediately, not just refresh tokens.
        session_result = await db.execute(
            select(AuthSession.id).where(
                AuthSession.id == session_id,
                AuthSession.user_id == user_id,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > now,
            )
        )

        if session_result.scalar_one_or_none() is None:
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