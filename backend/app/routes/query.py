import json
import asyncio
import uuid
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.query_history import QueryHistory
from app.schemas.query_schemas import IngestRequest, QueryRequest
from app.services.auth_service import get_current_user, get_db
from app.services.ingestion import ingest_repository
from app.services.elasticsearch_service import index_logs_from_repo
from app.services.retrieval import retrieve_context
from app.services.agent_graph import run_agent

router = APIRouter(prefix="", tags=["query"])

@router.post("/ingest")
async def ingest(request: IngestRequest, current_user: User = Depends(get_current_user)):
    repo_id = request.repo_id or str(uuid.uuid4())
    
    def process_ingest():
        num_chunks = ingest_repository(request.github_url, repo_id)
        # Note: assuming repo is cloned to /app/repos/{repo_id}
        repo_path = f"/app/repos/{repo_id}"
        index_logs_from_repo(repo_path, repo_id)
        return num_chunks

    total_chunks = await asyncio.to_thread(process_ingest)
    
    return {"repo_id": repo_id, "total_chunks": total_chunks, "status": "success"}

@router.post("/query")
async def query(request: QueryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    async def stream_agent_response(query_text, repo_id, user_id, db_session):
        try:
            yield f'data: {{"status": "retrieving", "message": "Fetching relevant code..."}}\n\n'
            
            chunks = retrieve_context(query_text, repo_id)
            num_chunks = len(chunks) if isinstance(chunks, list) else 0
            yield f'data: {{"status": "retrieved", "chunks": {num_chunks}}}\n\n'
            
            yield f'data: {{"status": "analyzing", "message": "Generating hypothesis..."}}\n\n'
            
            final_response = await asyncio.to_thread(run_agent, query_text, repo_id)
            
            q_history = QueryHistory(
                user_id=user_id,
                query=query_text,
                response=json.dumps(final_response)
            )
            db_session.add(q_history)
            db_session.commit()
            db_session.refresh(q_history)
            
            yield f'data: {{"status": "complete", "result": {json.dumps(final_response)}, "session_id": {q_history.id}}}\n\n'
            
        except Exception as e:
            yield f'data: {{"status": "error", "message": "{str(e)}"}}\n\n'

    return StreamingResponse(
        stream_agent_response(request.query, request.repo_id, current_user.id, db),
        media_type="text/event-stream"
    )
