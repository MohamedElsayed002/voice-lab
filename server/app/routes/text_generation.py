from fastapi import APIRouter, Depends

from app.schema.text_generation import (
    TextGenerationRequest,
    TextGenerationResponse,
)
from app.services.auth_service import auth_service
from app.services.text_generation_service import text_generation_service

router = APIRouter(prefix="/text-generation", tags=["text-generation"])


@router.post(
    "/answer",
    response_model=TextGenerationResponse,
    # dependencies=[Depends(auth_service.get_current_user)],
)
def generate_answer(request: TextGenerationRequest) -> TextGenerationResponse:
    return TextGenerationResponse(
        answer=text_generation_service.answer(request.prompt),
    )
