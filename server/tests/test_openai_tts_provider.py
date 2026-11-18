import json

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from openai import AsyncOpenAI

from app.core.exceptions import (
    TTSProviderError,
    TTSProviderQuotaExceededError,
    TTSProviderRateLimitError,
)
from app.exceptions.handlers import register_exception_handlers
from app.providers.openai.provider import OpenAITTSProvider


@pytest.mark.asyncio
async def test_provider_factory_selects_openai(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core import dependencies

    dependencies.get_tts_provider.cache_clear()
    monkeypatch.setattr(dependencies.settings, "tts_provider", "openai")
    monkeypatch.setattr(dependencies.settings, "OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(dependencies.settings, "openai_tts_model", "test-model")
    monkeypatch.setattr(dependencies.settings, "openai_tts_voice", "alloy")

    provider = dependencies.get_tts_provider()
    try:
        assert isinstance(provider, OpenAITTSProvider)
        assert provider.model == "test-model"
        assert provider.voice == "alloy"
    finally:
        await provider.aclose()
        dependencies.get_tts_provider.cache_clear()


@pytest.mark.asyncio
async def test_openai_provider_returns_wav_bytes_and_uses_configured_voice() -> None:
    request_payload: dict[str, object] = {}

    def handle_request(request: httpx.Request) -> httpx.Response:
        request_payload.update(json.loads(request.content))
        return httpx.Response(
            200,
            headers={"content-type": "audio/wav"},
            content=b"wav-audio-data",
        )

    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handle_request))
    client = AsyncOpenAI(api_key="test-key", http_client=http_client)
    provider = OpenAITTSProvider(
        client=client,
        model="test-model",
        voice="coral",
    )

    try:
        result = await provider.generate("Hello there.", language="en")
    finally:
        await provider.aclose()

    assert result.data == b"wav-audio-data"
    assert result.format == "wav"
    assert result.sample_rate == 24_000
    assert request_payload == {
        "input": "Hello there.",
        "instructions": "Speak in the language identified by this code: en.",
        "model": "test-model",
        "response_format": "wav",
        "voice": "coral",
    }


@pytest.mark.asyncio
async def test_openai_provider_rejects_reference_audio() -> None:
    http_client = httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(200, content=b"unused")
        )
    )
    client = AsyncOpenAI(api_key="test-key", http_client=http_client)
    provider = OpenAITTSProvider(
        client=client,
        model="test-model",
        voice="coral",
    )

    try:
        with pytest.raises(TTSProviderError, match="does not accept"):
            await provider.generate("Hello there.", voice_reference="voice.wav")
    finally:
        await provider.aclose()


@pytest.mark.parametrize(
    ("error_code", "error_type", "expected_exception"),
    [
        ("credit_balance_exhausted", "insufficient_quota", TTSProviderQuotaExceededError),
        ("rate_limit_exceeded", "requests", TTSProviderRateLimitError),
    ],
)
@pytest.mark.asyncio
async def test_openai_provider_maps_rate_limit_errors(
    error_code: str,
    error_type: str,
    expected_exception: type[TTSProviderError],
) -> None:
    payload = {
        "error": {
            "message": "provider limit reached",
            "type": error_type,
            "param": None,
            "code": error_code,
        }
    }

    def handle_request(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json=payload)

    http_client = httpx.AsyncClient(transport=httpx.MockTransport(handle_request))
    client = AsyncOpenAI(api_key="test-key", http_client=http_client)
    provider = OpenAITTSProvider(client=client, model="test-model", voice="coral")

    try:
        with pytest.raises(expected_exception):
            await provider.generate("Hello there.")
    finally:
        await provider.aclose()


def test_provider_quota_error_returns_clear_service_unavailable_response() -> None:
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/test-quota-error")
    async def raise_quota_error() -> None:
        raise TTSProviderQuotaExceededError()

    response = TestClient(app).get("/test-quota-error")

    assert response.status_code == 503
    assert response.json()["error_code"] == "tts_provider_quota_exceeded"
    assert "no remaining credits" in response.json()["message"]
