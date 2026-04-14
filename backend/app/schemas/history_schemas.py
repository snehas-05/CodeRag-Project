from pydantic import BaseModel, ConfigDict
from datetime import datetime

class HistoryItem(BaseModel):
    id: int
    query: str
    response: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HistoryListResponse(BaseModel):
    items: list[HistoryItem]
    total: int
    page: int
    page_size: int
