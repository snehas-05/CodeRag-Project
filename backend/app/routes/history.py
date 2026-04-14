import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.query_history import QueryHistory
from app.schemas.history_schemas import HistoryListResponse, HistoryItem
from app.services.auth_service import get_current_user, get_db

router = APIRouter(prefix="/history", tags=["history"])

@router.get("", response_model=HistoryListResponse)
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(QueryHistory).filter(QueryHistory.user_id == current_user.id).order_by(QueryHistory.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    parsed_items = []
    for item in items:
        resp_dict = json.loads(item.response)
        parsed_items.append(
            HistoryItem(
                id=item.id,
                query=item.query,
                response=resp_dict,
                created_at=item.created_at
            )
        )
        
    return HistoryListResponse(
        items=parsed_items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{session_id}", response_model=HistoryItem)
def get_history_item(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(QueryHistory).filter(QueryHistory.id == session_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return HistoryItem(
        id=item.id,
        query=item.query,
        response=json.loads(item.response),
        created_at=item.created_at
    )

@router.delete("/{session_id}")
def delete_history_item(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(QueryHistory).filter(QueryHistory.id == session_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(item)
    db.commit()
    return {"message": "Session deleted"}
