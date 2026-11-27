from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import engine
from app.exceptions.handlers import register_exception_handlers
from app.routes.audit_logs import router as audit_logs_router
from app.routes.generation import router as generation_router
# from app.routes.auth import router as auth_router
from app.auth.routes.auth import router as auth_router
from app.routes.text_generation import router as text_generation_router
from app.routes.voices import router as voices_router

from app.auth.services.auth_service import auth_service


# from app.db.session_2 import init_db

from app.schema.generation import GenerationRequest, GenerationResponse
from app.services.generation import GenerationService
from app.core.dependencies import close_tts_providers, get_generation_service

from starlette.middleware.sessions import SessionMiddleware
from app.auth.routes.oauth import router as oauth_router

@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    try:
        # init_db()
        yield
    finally:
        try:
            await close_tts_providers()
        finally:
            await engine.dispose()


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    same_site="lax",
    https_only=settings.is_production,
    max_age=600,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Accept-Ranges", "Content-Range", "Content-Length", "ETag"],
    max_age=3000,
)
app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(text_generation_router)
app.include_router(audit_logs_router)
app.include_router(voices_router)
app.include_router(generation_router)
register_exception_handlers(app)


def _audio_url(generation_id: str) -> str:
    return f"/api/v1/generations/{generation_id}/audio"


@app.post('/generation', response_model=GenerationResponse)
async def create_generation(
    request: GenerationRequest,
    service: GenerationService = Depends(get_generation_service),
    user: dict[str, str | None] = Depends(auth_service.get_current_user)
):
    user_id = user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="A valid authenticated user is required")

    return await service.create_generation(request, user_id)

@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/database", tags=["health"])
async def database_health_check() -> dict[str, str]:
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from error

    return {"status": "okok"}


if __name__ in "__main__":
    import uvicorn

    uvicorn.run(app, port=8000)
