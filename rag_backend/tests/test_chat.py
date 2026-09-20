"""Tests for POST /api/v1/chat/."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from langchain_core.documents import Document


def _mock_rag_service(docs=None):
    """Stand in for RAGService() with a retriever whose .ainvoke() resolves
    to `docs` locally — without touching ChromaDB or the embeddings endpoint."""
    docs = docs if docs is not None else [
        Document(page_content="Onboarding takes two weeks.", metadata={"source": "Handbook.pdf"})
    ]
    retriever = MagicMock()
    retriever.ainvoke = AsyncMock(return_value=docs)
    rag = MagicMock()
    rag.vector_store.as_retriever.return_value = retriever
    return rag


def _mock_llm_chain(answer: str, side_effect=None):
    chain = MagicMock()
    if side_effect is not None:
        chain.ainvoke = AsyncMock(side_effect=side_effect)
    else:
        chain.ainvoke = AsyncMock(return_value=answer)
    return chain


def test_chat_returns_answer(client):
    with patch("app.routers.chat.RAGService", return_value=_mock_rag_service()), \
         patch("app.routers.chat.build_llm_chain", return_value=_mock_llm_chain("This is the onboarding answer.")):
        response = client.post(
            "/api/v1/chat/",
            json={"question": "What is the onboarding process?"},
        )

    assert response.status_code == 200
    assert response.json() == {"answer": "This is the onboarding answer."}


def test_chat_accepts_history_field(client):
    with patch("app.routers.chat.RAGService", return_value=_mock_rag_service()), \
         patch("app.routers.chat.build_llm_chain", return_value=_mock_llm_chain("Answer")):
        response = client.post(
            "/api/v1/chat/",
            json={
                "question": "Follow-up question",
                "history": ["previous question"],
            },
        )

    assert response.status_code == 200


def test_chat_missing_question_returns_422(client):
    response = client.post("/api/v1/chat/", json={})
    assert response.status_code == 422


def test_chat_raises_on_unexpected_error(client):
    """Unhandled exceptions from the LLM chain propagate as server errors."""
    with patch("app.routers.chat.RAGService", return_value=_mock_rag_service()), \
         patch(
             "app.routers.chat.build_llm_chain",
             return_value=_mock_llm_chain("", side_effect=RuntimeError("unexpected bug")),
         ):
        with pytest.raises(RuntimeError, match="unexpected bug"):
            client.post(
                "/api/v1/chat/",
                json={"question": "Will this fail?"},
            )
