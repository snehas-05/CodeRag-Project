"""Query and ingestion routes including streaming responses."""

import json
from typing import Mapping

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse

from app.models.user import User
from app.schemas.query_schemas import IngestRequest, QueryRequest
from app.services.agent_state import initial_state
from app.services.agent_graph import agent as langgraph_agent
from app.services.auth_service import get_current_user
from app.services.ingestion import ingest_repository

router = APIRouter(tags=["query"])


@router.post("/ingest", status_code=202)
def start_ingestion(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """Trigger background clone and ingestion of a remote GitHub repository."""
    background_tasks.add_task(ingest_repository, request.github_url, request.repo_id)
    return {"message": f"Ingestion started for {request.repo_id} in the background."}


async def stream_agent_steps(query: str, repo_id: str):
    """Generator to yield events from the LangGraph agent step-by-step."""
    state = initial_state(query, repo_id)
    try:
        # stream() yields tuples of (node_name, node_output_state dict)
        async for output in langgraph_agent.astream(state):
            for node_name, node_state in output.items():
                event_data = {
                    "node": node_name,
                }

                # We don't want to dump the entire state, only relevant chunks
                if "error" in node_state and node_state["error"]:
                    event_data["error"] = node_state["error"]
                
                # Yield an SSE-formatted string
                yield f"data: {json.dumps(event_data)}\n\n"

        # Final yield to close stream gracefully with final summary
        yield f"data: {json.dumps({'status': 'complete'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/query")
async def run_query(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
):
    """Run an agentic debugging query. Returns an SSE stream of thought process."""
    return StreamingResponse(
        stream_agent_steps(request.query, request.repo_id),
        media_type="text/event-stream"
    )
