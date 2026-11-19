from io import BytesIO

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.dependencies import get_db
from app.routes import voices
from app.services.auth_service import auth_service


def test_get_user_custom_voices_uses_authenticated_user_id(monkeypatch) -> None:
    app = FastAPI()
    app.include_router(voices.router)
    captured: dict[str, str] = {}

    async def get_custom_voices(_db, user_id: str) -> list[dict]:
        captured["user_id"] = user_id
        return []

    monkeypatch.setattr(voices.voice_service, "get_user_custom_voices", get_custom_voices)
    app.dependency_overrides[auth_service.get_current_user] = lambda: {
        "id": "test-user",
        "email": "test@example.com",
        "name": "Test User",
    }
    app.dependency_overrides[get_db] = lambda: object()

    try:
        with TestClient(app) as client:
            response = client.get("/voices/me/custom")
    finally:
        app.dependency_overrides.pop(auth_service.get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json() == []
    assert captured["user_id"] == "test-user"


def test_get_single_custom_voice_uses_authenticated_user_id(monkeypatch) -> None:
    app = FastAPI()
    app.include_router(voices.router)
    captured: dict[str, str] = {}

    async def get_single_voice(_db, user_id: str, voice_id: str) -> dict:
        captured["user_id"] = user_id
        captured["voice_id"] = voice_id
        return {
            "id": voice_id,
            "user_id": user_id,
            "name": "Warm narrator",
            "description": "A clear, warm voice.",
            "category": "audiobook",
            "language": "en",
            "variant": "custom",
            "status": "private",
            "reference_text": "A sample sentence.",
            "audio_url": "https://storage.test/audio.wav",
            "avatar_url": None,
            "created_at": "2026-11-19T00:00:00Z",
        }

    monkeypatch.setattr(voices.voice_service, "get_single_voice_user", get_single_voice)
    app.dependency_overrides[auth_service.get_current_user] = lambda: {
        "id": "test-user",
        "email": "test@example.com",
        "name": "Test User",
    }
    app.dependency_overrides[get_db] = lambda: object()

    try:
        with TestClient(app) as client:
            response = client.get("/voices/me/custom/voice-1")
    finally:
        app.dependency_overrides.pop(auth_service.get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json()["id"] == "voice-1"
    assert captured == {"user_id": "test-user", "voice_id": "voice-1"}


def test_get_single_custom_voice_rejects_missing_authenticated_user_id() -> None:
    app = FastAPI()
    app.include_router(voices.router)
    app.dependency_overrides[auth_service.get_current_user] = lambda: {"email": "test@example.com"}
    app.dependency_overrides[get_db] = lambda: object()

    try:
        with TestClient(app) as client:
            response = client.get("/voices/me/custom/voice-1")
    finally:
        app.dependency_overrides.pop(auth_service.get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 401


def test_get_custom_voice_audio_streams_owned_voice_audio(monkeypatch) -> None:
    app = FastAPI()
    app.include_router(voices.router)
    captured: dict[str, str] = {}

    async def get_custom_voice_audio(_db, user_id: str, voice_id: str) -> dict:
        captured["user_id"] = user_id
        captured["voice_id"] = voice_id
        return {
            "Body": BytesIO(b"sample audio"),
            "ContentType": "audio/wav",
            "ContentLength": 12,
        }

    monkeypatch.setattr(voices.voice_service, "get_custom_voice_audio", get_custom_voice_audio)
    app.dependency_overrides[auth_service.get_current_user] = lambda: {
        "id": "test-user",
        "email": "test@example.com",
        "name": "Test User",
    }
    app.dependency_overrides[get_db] = lambda: object()

    try:
        with TestClient(app) as client:
            response = client.get("/voices/me/custom/voice-1/audio")
    finally:
        app.dependency_overrides.pop(auth_service.get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"
    assert response.content == b"sample audio"
    assert captured == {"user_id": "test-user", "voice_id": "voice-1"}
