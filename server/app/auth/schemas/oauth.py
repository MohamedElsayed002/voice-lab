from pydantic import BaseModel, Field

class OAuthExchangeRequest(BaseModel):
    code: str = Field(min_length=20, max_length=200)