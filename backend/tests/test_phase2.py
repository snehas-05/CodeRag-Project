"""
Phase 2 standalone test script for CodeRAG.

Run inside the backend container:
    docker exec -it coderag-project-backend-1 python tests/test_phase2.py
"""

import sys
import os
import time

# Ensure the app package is importable
sys.path.insert(0, "/app")


def run_tests() -> None:
    """Run all Phase 2 tests and print a summary."""
    results: list[tuple[str, bool, str]] = []

    # ── Test 1: Model loading / query embedding ─────────────────────
    print("[1/7] Model loading…", end="", flush=True)
    try:
        from app.services.model_loader import model_manager

        embedding = model_manager.embed_query("test query")
        assert isinstance(embedding, list), "Expected list"
        assert len(embedding) > 0, "Empty embedding"
        assert all(isinstance(x, float) for x in embedding), "Not all floats"
        print(f"         PASS  (dim={len(embedding)})")
        results.append(("Model loading", True, ""))
    except Exception as e:
        print(f"         FAIL  ({e})")
        results.append(("Model loading", False, str(e)))

    # ── Test 2: Code embedding ──────────────────────────────────────
    print("[2/7] Code embedding…", end="", flush=True)
    try:
        embedding = model_manager.embed_code("def hello(): return 42")
        assert isinstance(embedding, list), "Expected list"
        assert len(embedding) > 0, "Empty embedding"
        assert all(isinstance(x, float) for x in embedding), "Not all floats"
        print(f"        PASS  (dim={len(embedding)})")
        results.append(("Code embedding", True, ""))
    except Exception as e:
        print(f"        FAIL  ({e})")
        results.append(("Code embedding", False, str(e)))

    # ── Test 3: Generation ──────────────────────────────────────────
    print("[3/7] Generation…", end="", flush=True)
    try:
        output = model_manager.generate("What causes a null pointer exception?")
        assert isinstance(output, str), "Expected string"
        assert len(output) > 0, "Empty output"
        print(f"           PASS  (len={len(output)})")
        results.append(("Generation", True, ""))
    except Exception as e:
        print(f"           FAIL  ({e})")
        results.append(("Generation", False, str(e)))

    # ── Test 4: Chunker ─────────────────────────────────────────────
    print("[4/7] Chunker…", end="", flush=True)
    try:
        from app.utils.chunker import chunk_file

        test_source = '''
def greet(name):
    """Say hello."""
    return f"Hello, {name}!"

class Calculator:
    """A simple calculator."""
    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b
'''
        chunks = chunk_file(test_source.strip(), "test_file.py")
        assert len(chunks) >= 2, f"Expected >= 2 chunks, got {len(chunks)}"
        for c in chunks:
            assert "chunk_id" in c, "Missing chunk_id"
            assert "content" in c, "Missing content"
        print(f"              PASS  ({len(chunks)} chunks)")
        results.append(("Chunker", True, ""))
    except Exception as e:
        print(f"              FAIL  ({e})")
        results.append(("Chunker", False, str(e)))

    # ── Test 5: ChromaDB connection ─────────────────────────────────
    print("[5/7] ChromaDB connection…", end="", flush=True)
    try:
        import chromadb
        from app.config import settings

        client = chromadb.HttpClient(
            host=settings.CHROMA_HOST,
            port=settings.CHROMA_PORT,
            settings=chromadb.Settings(anonymized_telemetry=False)
        )
        heartbeat = client.heartbeat()
        assert heartbeat is not None, "No heartbeat response"
        print(f"    PASS  (heartbeat={heartbeat})")
        results.append(("ChromaDB connection", True, ""))
    except Exception as e:
        print(f"    FAIL  ({e})")
        results.append(("ChromaDB connection", False, str(e)))

    # ── Test 6: Elasticsearch connection ────────────────────────────
    print("[6/7] Elasticsearch connection…", end="", flush=True)
    try:
        from elasticsearch import Elasticsearch
        from app.config import settings

        es = Elasticsearch(settings.ELASTICSEARCH_URL)
        assert es.ping(), "Elasticsearch ping failed"
        print(" PASS")
        results.append(("Elasticsearch connection", True, ""))
    except Exception as e:
        print(f" FAIL  ({e})")
        results.append(("Elasticsearch connection", False, str(e)))

    # ── Test 7: Full retrieval pipeline ─────────────────────────────
    print("[7/7] Full retrieval pipeline…", end="", flush=True)
    try:
        from app.services.ingestion import ingest_repository
        from app.services.embeddings import embed_and_store_chunks
        from app.services.elasticsearch_service import index_logs_from_repo
        from app.services.retrieval import retrieve_context

        # Ingest a small public repo
        test_url = "https://github.com/pallets/click"
        test_repo_id = "test_repo"

        result = ingest_repository(test_url, test_repo_id)
        assert result["status"] == "success", f"Ingestion failed: {result}"
        chunks = result["chunks"]

        # Only store a small subset to keep the test fast
        subset = chunks[:20] if len(chunks) > 20 else chunks
        stored = embed_and_store_chunks(subset, test_repo_id)
        assert stored > 0, "No chunks stored in ChromaDB"

        # Index logs (may be 0 if no log files, which is fine)
        repo_path = os.path.join(settings.REPOS_DIR, test_repo_id)
        index_logs_from_repo(repo_path, test_repo_id)

        # Run retrieval
        ctx = retrieve_context(
            "how does argument parsing work", test_repo_id
        )
        assert ctx["total_retrieved"] > 0, "No results retrieved"
        print(f"  PASS  (retrieved={ctx['total_retrieved']})")
        results.append(("Full retrieval pipeline", True, ""))
    except Exception as e:
        print(f"  FAIL  ({e})")
        results.append(("Full retrieval pipeline", False, str(e)))

    # ── Summary ─────────────────────────────────────────────────────
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print(f"\n{'=' * 50}")
    print(f"{passed}/{total} tests passed.")
    if passed < total:
        print("\nFailed tests:")
        for name, ok, err in results:
            if not ok:
                print(f"  ✗ {name}: {err}")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    run_tests()
