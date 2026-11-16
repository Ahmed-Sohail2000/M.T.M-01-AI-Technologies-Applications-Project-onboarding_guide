
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import Base, engine
from app.models import db_models  # noqa: F401 — import side-effects register all ORM models
from app.routers import auth, health, chat, documents, onboarding, ingest, trainer, departments
from app.routers.integrations import router as integrations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables on startup (idempotent — safe to call multiple times)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

# CORS setup for frontend integration
#   Local dev origins are always allowed. Deployed frontends (e.g. Vercel) are
#   added via env: CORS_ORIGINS as a JSON list of exact origins, and/or
#   CORS_ORIGIN_REGEX for preview deployments, e.g.
#   CORS_ORIGIN_REGEX=^https://vaultmind(-[a-z0-9-]+)?\.vercel\.app$
LOCAL_DEV_ORIGINS = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://localhost:3001",
	"http://127.0.0.1:3001",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=LOCAL_DEV_ORIGINS + [o for o in settings.CORS_ORIGINS if o not in LOCAL_DEV_ORIGINS],
	allow_origin_regex=settings.CORS_ORIGIN_REGEX or None,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(onboarding.router)
app.include_router(ingest.router)
app.include_router(trainer.router)
app.include_router(departments.router)
app.include_router(integrations_router)
