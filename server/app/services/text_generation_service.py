import boto3
from strands import Agent
from strands.models import BedrockModel

from app.core.config import settings


class TextGenerationService:
    def __init__(self) -> None:
        self.model = BedrockModel(
            model_id=settings.BEDROCK_MODEL_ID,
            boto_session=boto3.Session(
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            ),
        )

    def answer(self, prompt: str) -> str:
        agent = Agent(model=self.model)
        answer = str(agent(prompt)).strip()
        if not answer:
            raise RuntimeError("Bedrock returned an empty answer")
        return answer


text_generation_service = TextGenerationService()
