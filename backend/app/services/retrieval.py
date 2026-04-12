"""Unified retrieval combining ChromaDB vector search and Elasticsearch BM25."""

import logging
from typing import TypedDict

from app.services.embeddings import query_chromadb
from app.services.elasticsearch_service import search_logs
from app.services.model_loader import model_manager

logger = logging.getLogger(__name__)


class RetrievalContext(TypedDict):
    """Combined retrieval result from all search backends."""

    query: str
    repo_id: str
    code_chunks: list[dict]  # from ChromaDB
    log_results: list[dict]  # from Elasticsearch
    total_retrieved: int


def retrieve_context(
    query: str, repo_id: str, top_k: int = 5
) -> RetrievalContext:
    """Retrieve relevant code chunks and log lines for a debugging query."""
    # Embed the query for vector search using code embeddings to match dimensionality
    try:
        query_embedding = model_manager.embed_code(query)
    except Exception as e:
        logger.error(f"Query embedding failed: {e}")
        query_embedding = None

    # Vector search in ChromaDB
    code_chunks: list[dict] = []
    if query_embedding is not None:
        try:
            code_chunks = query_chromadb(query_embedding, repo_id, top_k)
        except Exception as e:
            logger.warning(f"ChromaDB query failed: {e}")

    # BM25 keyword search in Elasticsearch
    log_results: list[dict] = []
    try:
        log_results = search_logs(query, repo_id, top_k)
    except Exception as e:
        logger.warning(f"Elasticsearch search failed: {e}")

    return RetrievalContext(
        query=query,
        repo_id=repo_id,
        code_chunks=code_chunks,
        log_results=log_results,
        total_retrieved=len(code_chunks) + len(log_results),
    )
