from sqlalchemy import select 
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from ..providers.base import ExternalIdentity
from app.models.oauth_account import AuthAccount
from app.models.user import User, UserRole

class OAuthService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate(
            self,
            identity: ExternalIdentity
    ) -> User:

        """
            Find an existing OAuth account or create a new user 
            and link the external provider account.

            The method does not create an application session.
            The OAuth callback route will do that afterward
        """

        if not identity.email_verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="A verified email is required"
            )

        email = identity.email.lower().strip()

        # 1. Look for an existing provider account
        account = await self._get_account(
            provider=identity.provider,
            provider_user_id=identity.provider_user_id
        )

        if account:

            user = await self.db.get(User, account.user_id)

            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This account is unavailable"
                )

            # Keep the provider's current verified email.
            account.email = email

            return user


        # 2. Do not silently merge accounts by email
        existing_user = await self._get_user_by_email(email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "An account with this email already exists",
                    "Sign in using your existing method, then",
                    "explicitly link your OAuth provider "
                )
            )


        # 3. Create the user and provider account atomically
        try:
            async with self.db.begin_nested():
                user = User(
                    email=email,
                    username=None,
                    hashed_password=None,
                    role=UserRole.USER,
                    auth_provider=identity.provider,
                    email_verified=True,
                    is_active=True
                )

                self.db.add(user)
                await self.db.flush()

                account = AuthAccount(
                    user_id=user.id,
                    provider=identity.provider,
                    provider_user_id=identity.provider_user_id,
                    email=email
                )

                self.db.add(account)
                await self.db.flush()

            return user
        except IntegrityError:

            # Another Request may have created this provider
            # account or email concurrently
            account = await self._get_account(
                provider=identity.provider,
                provider_user_id=identity.provider_user_id
            )

            if account:
                user = await self.db.get(User,account.user_id)

                if user and user.is_active:
                    return user

            existing_user = await self._get_user_by_email(email)

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "An account with this email already exists",
                        "Sign in using your existing method"
                    )
                )

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Unable to create the OAuth account. Please retry"
            )


    async def _get_account(
            self,
            provider: str,
            provider_user_id: str
    ) -> AuthAccount | None:

        result = await self.db.execute(
            select(AuthAccount).where(
                AuthAccount.provider == provider, 
                AuthAccount.provider_user_id == provider_user_id
            )
        )

        return result.scalar_one_or_none()


    async def _get_user_by_email(
            self,
            email: str
    ) -> User | None:
        
        result = await self.db.execute(
            select(User).where(User.email == email)
        ) 

        return result.scalar_one_or_none()