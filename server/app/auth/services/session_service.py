# Creates, refreshes, and revokes sessions

from datetime import datetime, timedelta, timezone 

from sqlalchemy import select 
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.session import AuthSession
from app.models.user import User 
from ..schemas.auth import TokenResponse

from app.auth.services.token_service import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token
)


class SessionService:

    @staticmethod
    def _create_access_token(user: User, session_id: str):
        return create_access_token(
            user_id=user.id,
            session_id=session_id,
            role=user.role.value
        )

    async def create_session(
            self,
            db: AsyncSession,
            user: User
    ) -> TokenResponse:

        now = datetime.now(timezone.utc)
        raw_refresh_token = create_refresh_token()

        session = AuthSession(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(raw_refresh_token),
            expires_at=(now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS))
        )

        db.add(session)
        await db.flush()

        access_token = self._create_access_token(
            user,
            session.id
        )

        await db.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
        )

    async def refresh_session(
        self,
        db: AsyncSession,
        raw_refresh_token: str
    ) -> TokenResponse:

        token_hash = hash_refresh_token(raw_refresh_token)

        result = await db.execute(
            select(AuthSession).where(AuthSession.refresh_token_hash == token_hash, AuthSession.revoked_at.is_(None))
            .with_for_update(),
        )

        session = result.scalar_one_or_none()

        if session is None:
            raise ValueError("Invalid refresh token")

        now = datetime.now(timezone.utc)

        if session.expires_at <= now:
            session.revoked_at = now
            await db.commit()
            raise ValueError("Expired refresh token")

        user_result = await db.execute(
            select(User).where(User.id == session.user_id,User.is_active.is_(True))
        )

        user = user_result.scalar_one_or_none()

        if user is None or not user.is_active:
            session.revoked_at = now 
            await db.commit()
            raise ValueError("User is unavailable")

        new_refresh_token = create_refresh_token()
        session.refresh_token_hash = hash_refresh_token(new_refresh_token)
        session.expires_at = (
            now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        )

        access_token = self._create_access_token(
            user,
            session.id
        )

        await db.commit()
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token
        )

    async def revoke_session(
            self,
            db: AsyncSession,
            raw_refresh_token: str
    ) -> None:
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

    async def revoke_all(
            self,
            db: AsyncSession,
            user_id: str
    ) -> None:
        result = await db.execute(
            select(AuthSession).where(
                AuthSession.user_id == user_id,
                AuthSession.revoked_at.is_(None),
            )
        )

        now = datetime.now(timezone.utc)
        for session in result.scalars().all():
            session.revoked_at = now

        await db.commit()

    async def revoke_all_sessions(
            self,
            db: AsyncSession,
            user_id: str,
        ) -> None:

            result = await db.execute(
                select(AuthSession).where(
                    AuthSession.user_id == user_id,
                    AuthSession.revoked_at.is_(None),
                )
            )

            sessions = result.scalars().all()
            now = datetime.now(timezone.utc)

            for session in sessions:
                session.revoked_at = now

            await db.commit()

    async def validate_session(
        self,
        db: AsyncSession,
        session_id: str,
        user_id: str,
    ) -> bool:
        now = datetime.now(timezone.utc)
        session_result = await db.execute(
            select(AuthSession.id).where(
                AuthSession.id == session_id,
                AuthSession.user_id == user_id,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > now,
            )
        )
        return session_result.scalar_one_or_none() is not None
session_service = SessionService()