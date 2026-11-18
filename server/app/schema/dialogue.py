from typing import Literal

from pydantic import BaseModel, Field


class DialogueSegment(BaseModel):
    speaker: Literal["SPEAKER1", "SPEAKER2"]
    text: str = Field(min_length=1, max_length=2000)


class DialogueRequest(BaseModel):
    segments: list[DialogueSegment] = Field(min_length=1)
    voice_ids: dict[str, str]
    language: str = "en"