import asyncio
import io
import wave

import pytest
import torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

from app.providers.chatterbox.provider import ChatterboxTTSProvider


class FakeChatterboxModel:
    sr = 16_000

    def __init__(self) -> None:
        self.calls: list[tuple[str, dict[str, str]]] = []

    def generate(self, text: str, **kwargs: str) -> torch.Tensor:
        self.calls.append((text, kwargs))
        return torch.tensor([[0.0, 0.5, -0.5]], dtype=torch.float32)


def test_provider_uses_cpu_when_cuda_is_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    model = FakeChatterboxModel()
    loaded_devices: list[str] = []

    def fake_from_pretrained(*, device: str) -> FakeChatterboxModel:
        loaded_devices.append(device)
        return model

    monkeypatch.setattr(torch.cuda, "is_available", lambda: False)
    monkeypatch.setattr(
        ChatterboxMultilingualTTS,
        "from_pretrained",
        staticmethod(fake_from_pretrained),
    )

    provider = ChatterboxTTSProvider()

    assert provider.model is model
    assert loaded_devices == ["cpu"]


def test_provider_supports_arabic_and_passes_language_to_model() -> None:
    model = FakeChatterboxModel()
    provider = ChatterboxTTSProvider.__new__(ChatterboxTTSProvider)
    provider.model = model

    result = asyncio.run(
        provider.generate(
            "مرحبا",
            voice_reference="voices_data\\reference.wav",
            language="ar",
        )
    )

    assert result.format == "wav"
    assert result.sample_rate == 16_000
    assert model.calls == [
        (
            "مرحبا",
            {
                "language_id": "ar",
                "audio_prompt_path": "voices_data\\reference.wav",
            },
        )
    ]

    with wave.open(io.BytesIO(result.data), "rb") as wav:
        assert wav.getnchannels() == 1
        assert wav.getsampwidth() == 2
        assert wav.getframerate() == 16_000
        assert wav.getnframes() == 3
