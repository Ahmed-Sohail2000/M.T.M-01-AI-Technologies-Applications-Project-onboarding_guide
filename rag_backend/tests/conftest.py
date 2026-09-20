"""Shared pytest fixtures for the RAG backend test suite."""
import pytest
from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.main import app


def _test_current_user() -> dict:
    """Stand-in for the JWT-derived user, used to bypass auth in route tests.

    Route-level tests exercise business logic (retrieval, prompt building,
    persona propagation), not the auth layer itself — that's covered by
    test_auth-style unit tests against app.core.security directly. Every
    endpoint here requires get_current_user, so the shared client fixture
    overrides it once for the whole session rather than every test crafting
    a real bearer token.
    """
    return {"id": "test-user", "role": "ADMIN", "dept": "IT", "display_name": "Test User"}


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Synchronous HTTPX test client for the FastAPI app, pre-authenticated."""
    app.dependency_overrides[get_current_user] = _test_current_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_current_user, None)
