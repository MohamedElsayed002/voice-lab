from app.services import text_generation_service as text_generation_module


def test_answer_uses_a_fresh_agent_for_each_prompt(monkeypatch) -> None:
    prompts: list[str] = []
    agents: list[object] = []

    class FakeAgent:
        def __init__(self, *, model: object) -> None:
            assert model is service.model
            agents.append(self)

        def __call__(self, prompt: str) -> str:
            prompts.append(prompt)
            return f"Answer: {prompt}"

    monkeypatch.setattr(text_generation_module, "Agent", FakeAgent)
    service = text_generation_module.TextGenerationService()

    assert service.answer("First question") == "Answer: First question"
    assert service.answer("Second question") == "Answer: Second question"
    assert prompts == ["First question", "Second question"]
    assert len(agents) == 2
    assert agents[0] is not agents[1]


def test_blank_model_answer_is_not_returned_as_success(monkeypatch) -> None:
    class FakeAgent:
        def __init__(self, *, model: object) -> None:
            _ = model

        def __call__(self, prompt: str) -> str:
            _ = prompt
            return "   "

    monkeypatch.setattr(text_generation_module, "Agent", FakeAgent)
    service = text_generation_module.TextGenerationService()

    try:
        service.answer("Question")
    except RuntimeError as error:
        assert str(error) == "Bedrock returned an empty answer"
    else:
        raise AssertionError("Expected an empty Bedrock answer to raise")
