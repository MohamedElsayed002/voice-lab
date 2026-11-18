from pydantic import BaseModel, Field

class GenerationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice_id: str = "default"
    language: str = "en"


class GenerationResponse(BaseModel):
    id: str
    status: str
    audio_url: str | None = None
