from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schema.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    return await auth_service.register(db, data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await auth_service.login(db, data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    data: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await auth_service.refresh(db, data.refresh_token)


@router.post("/logout")
async def logout(
    _user: dict[str, str | None] = Depends(auth_service.get_current_user),
) -> dict[str, str]:
    return await auth_service.logout()


@router.get("/me")
def read_current_user(
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
) -> dict[str, dict[str, str | None]]:
    return {"user": user}
