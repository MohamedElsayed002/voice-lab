from fastapi import APIRouter, Depends

from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
def read_current_user(
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
) -> dict[str, dict[str, str | None]]:
    return {"user": user}
