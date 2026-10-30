import pytest
from pydantic import ValidationError

from app.schema.text_generation import TextGenerationRequest


def test_request_trims_prompt() -> None:
    request = TextGenerationRequest(prompt="  Explain testing  ")

    assert request.prompt == "Explain testing"


@pytest.mark.parametrize("prompt", ["", "  ", "x" * 4001])
def test_request_rejects_empty_or_oversized_prompt(prompt: str) -> None:
    with pytest.raises(ValidationError):
        TextGenerationRequest(prompt=prompt)
