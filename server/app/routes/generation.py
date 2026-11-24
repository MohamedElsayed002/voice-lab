from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.services.auth_service import auth_service
from app.core.dependencies import get_db
from app.schema.generation import GenerationHistoryItem
from app.services.generation_history import GenerationHistoryService

router = APIRouter(prefix="/generation", tags=["generation"])


@router.get("/history", response_model=list[GenerationHistoryItem])
async def get_user_generation_history(
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    user_id = user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="A valid authenticated user is required")

    return await GenerationHistoryService(db).get_user_generation_history(user_id)
