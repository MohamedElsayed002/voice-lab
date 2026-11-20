import asyncio
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schema.voice import VoiceCreateFields, VoiceCreateRequest, VoiceResponse
from app.schema.visibility import VisibilityStatus
from app.schema.voices import VoiceCategory
from app.auth.services.auth_service import auth_service
from app.services.voices_services import VoiceService

router = APIRouter(prefix="/voices", tags=["voices"])
voice_service = VoiceService()


def parse_voice_create_fields(
    name: Annotated[str, Form(min_length=1, max_length=256)],
    reference_text: Annotated[str, Form(min_length=1, max_length=4000)],
    description: Annotated[str, Form(max_length=4000)] = "",
    category: Annotated[VoiceCategory, Form()] = VoiceCategory.GENERAL,
    language: Annotated[str, Form(min_length=2, max_length=36)] = "en",
    status: Annotated[VisibilityStatus, Form()] = VisibilityStatus.PRIVATE,
) -> VoiceCreateFields:
    return VoiceCreateFields(
        name=name,
        reference_text=reference_text,
        description=description,
        category=category,
        language=language,
        status=status,
    )


@router.get("/", response_model=list[VoiceResponse])
async def get_all_voices(
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    return await voice_service.get_all_voices(db)


@router.get("/me/custom", response_model=list[VoiceResponse])
async def get_user_custom_voices(
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    user_id = user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="A valid authenticated user is required")
    return await voice_service.get_user_custom_voices(db, user_id)


@router.get("/me/custom/{voice_id}", response_model=VoiceResponse)
async def get_custom_voice_user(
    voice_id: str,
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    user_id = user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="A valid authenticated user is required")
    return await voice_service.get_single_voice_user(db, user_id, voice_id)


def _stream_audio_object(audio_object: dict) -> StreamingResponse:
    body = audio_object["Body"]

    async def stream_audio() -> AsyncIterator[bytes]:
        try:
            while chunk := await asyncio.to_thread(body.read, 64 * 1024):
                yield chunk
        finally:
            await asyncio.to_thread(body.close)

    headers = {}
    if "ContentLength" in audio_object:
        headers["Content-Length"] = str(audio_object["ContentLength"])

    return StreamingResponse(
        stream_audio(),
        media_type=audio_object.get("ContentType", "audio/wav"),
        headers=headers,
    )


@router.get("/me/custom/{voice_id}/audio", response_class=StreamingResponse)
async def get_custom_voice_audio(
    voice_id: str,
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    user_id = user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="A valid authenticated user is required")
    audio_object = await voice_service.get_custom_voice_audio(db, user_id, voice_id)
    return _stream_audio_object(audio_object)


@router.post("/", response_model=VoiceResponse, status_code=201)
async def create_voice(
    fields: Annotated[VoiceCreateFields, Depends(parse_voice_create_fields)],
    audio: Annotated[UploadFile, File()],
    avatar: Annotated[UploadFile | None, File()] = None,
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    user_id = user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="A valid authenticated user is required")

    return await voice_service.create_voice(
        db=db,
        user_id=user_id,
        user_email=user.get("email"),
        request=VoiceCreateRequest(fields=fields, audio=audio, avatar=avatar),
    )


@router.get("/{voice_id}", response_model=VoiceResponse)
async def get_voice(
    voice_id: str,
    user: dict[str, str | None] = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await voice_service.get_voice(db, voice_id, user["id"])


@router.get("/{voice_id}/audio", response_class=StreamingResponse)
async def get_public_voice_audio(
    voice_id: str,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    audio_object = await voice_service.get_public_voice_audio(db, voice_id)
    return _stream_audio_object(audio_object)
