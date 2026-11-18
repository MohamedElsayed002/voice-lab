
from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000)
    voice_key: str = Field(..., min_length=1, max_length=300)

    temperature: float = Field(default=0.8, ge=0.0, le=2.0) # Controls sampling randomness
    top_p: float = Field(default=0.95, ge=0.0, le=1.0) # Restricts sampling to a probability mass
    top_k: int = Field(default=1000, ge=1, le=10000) # Restricts sampling to a number of candidate choices
    repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)

    norm_loudness: bool = Field(default=True) # Requests loudness normalization from the model


# {
#   "prompt": "Welcome to my AI voice platform.",
#   "voice_key": "voices/system/default.wav",
#   "temperature": 0.8,
#   "top_p": 0.95,
#   "top_k": 1000,
#   "repetition_penalty": 1.2,
#   "norm_loudness": true
# }