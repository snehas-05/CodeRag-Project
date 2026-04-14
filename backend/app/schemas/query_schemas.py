from pydantic import BaseModel, Field
from typing import Optional

class IngestRequest(BaseModel):
    github_url: str = Field(..., pattern=r"^https://github\.com/")
    repo_id: str = Field(..., pattern=r"^[a-zA-Z0-9_]{1,64}$")

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=10, max_length=1000)
    repo_id: str

class EvidenceItem(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    content: str
    name: str

class QueryResponse(BaseModel):
    root_cause: Optional[str]
    suggested_fix: Optional[str]
    evidence: list[EvidenceItem]
    confidence: float
    iterations: int
    hypothesis_chain: list[str]
    session_id: int
