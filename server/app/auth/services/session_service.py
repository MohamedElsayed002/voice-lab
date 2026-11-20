# Creates, refreshes, and revokes sessions

from datetime import datetime, timedelta, timezone 

from sqlalchemy import select 
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.session import AuthSession
from app.models.user import User 

from app.auth.services.token_service import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token
)


class SessionService:

    async def create_session(
            self,
            db: AsyncSession,
            user: User
    ) -> dict[str,str]:
        raw_refresh_token = create_refresh_token()

        session = AuthSession(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(raw_refresh_token),
            expires_at=(datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS))
        )

        db.add(session)
        await db.commit()

        return {
            "access_token": create_access_token(user.id),
            "refresh_token": raw_refresh_token,
            "token_type": "bearer"
        }

    async def refresh_session(
        self,
        db: AsyncSession,
        raw_refresh_token: str
    ) -> dict[str, str]:

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
            select(User).where(User.id == session.user_id)
        )

        user = user_result.scalar_one_or_none()

        if user is None or not user.is_active:
            session.revoked_at = now 
            await db.commit()
            raise ValueError("User is unavailable")


        # Rotate invalidate the old token
        session.revoked_at = now 

        new_refresh_token = create_refresh_token()

        new_session = AuthSession(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(new_refresh_token),
            expires_at=(
                now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
            )
        )

        db.add(new_session)
        await db.commit()

        return {
            "access_token": create_access_token(user.id),
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }


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


session_service = SessionService()