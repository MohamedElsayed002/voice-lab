from pydantic import BaseModel, Field, field_validator


class TextGenerationRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)

    @field_validator("prompt")
    @classmethod
    def prompt_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Prompt must not be blank")
        return value


class TextGenerationResponse(BaseModel):
    answer: str
