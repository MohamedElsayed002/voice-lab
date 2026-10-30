from fastapi.testclient import TestClient

from app.main import app
from app.routes import text_generation
from app.services.auth_service import auth_service


def test_answer_endpoint_returns_model_answer_for_authenticated_user(
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        text_generation.text_generation_service,
        "answer",
        lambda prompt: f"Answer: {prompt}",
    )
    app.dependency_overrides[auth_service.get_current_user] = lambda: {
        "id": "test-user"
    }

    try:
        with TestClient(app) as client:
            response = client.post(
                "/text-generation/answer",
                json={"prompt": "  What is Bedrock?  "},
            )
    finally:
        app.dependency_overrides.pop(auth_service.get_current_user, None)

    assert response.status_code == 200
    assert response.json() == {"answer": "Answer: What is Bedrock?"}


def test_answer_endpoint_rejects_missing_authentication() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/text-generation/answer",
            json={"prompt": "What is Bedrock?"},
        )

    assert response.status_code == 401
