from fastapi import APIRouter, Depends
from app.schemas.search import SemanticSearchRequest, SemanticSearchResponse
from app.services import search_service
from app.core.security import verify_internal_token

router = APIRouter(prefix="/api/v1/ai", tags=["AI · Semantic Search"])


@router.post("/semantic-search", response_model=SemanticSearchResponse)
def semantic_search(
    body: SemanticSearchRequest,
    _auth: bool = Depends(verify_internal_token),
):
    """Semantic search across governance objects.

    Phase 1: PostgreSQL keyword relevance ranking.
    Phase 2: pgvector cosine similarity over embeddings (same contract).
    """
    results, engine = search_service.search(
        query=body.query,
        target=body.target,
        top_k=body.top_k,
        organization_id=body.organization_id,
    )
    return SemanticSearchResponse(
        query=body.query,
        target=body.target,
        count=len(results),
        results=results,
        engine=engine,
    )
