from typing import Optional
from pydantic import BaseModel, Field


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., description="Natural-language query", examples=["encrypt data at rest"])
    target: str = Field(
        default="control",
        description="Object type to search",
        examples=["control", "evidence", "obligation"],
    )
    top_k: int = Field(default=5, ge=1, le=50, description="Number of results")
    organization_id: Optional[str] = Field(default=None, description="Scope to organization")


class SearchHit(BaseModel):
    id: str
    code: str
    title: str
    score: float = Field(..., description="Similarity score 0–1")
    snippet: Optional[str] = None


class SemanticSearchResponse(BaseModel):
    query: str
    target: str
    count: int
    results: list[SearchHit]
    engine: str = Field(..., description="Which engine answered (keyword | embedding)")
