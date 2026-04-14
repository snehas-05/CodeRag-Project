from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import Base, engine

# Import models so they are registered with Base.metadata before create_all
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CodeRAG",
    description="AI-powered debugging assistant for developers",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "coderag"}
