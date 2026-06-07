"""Semantic search service.

Phase 1 (now): PostgreSQL keyword/ILIKE search over controls — works today,
no model download required.

Phase 2: swap `_keyword_search` internals for pgvector cosine similarity using
sentence-transformers embeddings. The public `search()` signature stays the same,
so the API contract and frontend don't change.
"""
from __future__ import annotations
from sqlalchemy import text
from app.services.db import engine
from app.schemas.search import SearchHit

# Maps logical target → (table, code_col, title_col, text_cols[])
TARGET_TABLE = {
    "control":    ("controls",     "control_id",   "name",  ["objective", "description"]),
    "obligation": ("obligations",  "obligation_id", "title", ["description"]),
    "evidence":   ("evidences",    "evidence_id",  "name",  ["description"]),
}


def search(query: str, target: str, top_k: int, organization_id: str | None) -> tuple[list[SearchHit], str]:
    if target not in TARGET_TABLE:
        return [], "keyword"
    return _keyword_search(query, target, top_k, organization_id), "keyword"


def _keyword_search(query: str, target: str, top_k: int, organization_id: str | None) -> list[SearchHit]:
    table, code_col, title_col, text_cols = TARGET_TABLE[target]
    search_cols = [title_col] + text_cols

    # Build a relevance score: title match weighted higher than body match
    like = f"%{query}%"
    where_org = "AND organization_id = :org" if organization_id else ""
    ilike_clauses = " OR ".join(f"{c} ILIKE :like" for c in search_cols)

    score_expr = " + ".join(
        f"(CASE WHEN {c} ILIKE :like THEN {w} ELSE 0 END)"
        for c, w in zip(search_cols, [3] + [1] * len(text_cols))
    )

    sql = text(f"""
        SELECT id, {code_col} AS code, {title_col} AS title,
               ({score_expr}) AS raw_score,
               LEFT(COALESCE({text_cols[0]}, ''), 160) AS snippet
        FROM {table}
        WHERE ({ilike_clauses}) {where_org}
        ORDER BY raw_score DESC
        LIMIT :top_k
    """)

    params = {"like": like, "top_k": top_k}
    if organization_id:
        params["org"] = organization_id

    with engine.connect() as conn:
        rows = conn.execute(sql, params).mappings().all()

    max_raw = max((r["raw_score"] for r in rows), default=1) or 1
    return [
        SearchHit(
            id=str(r["id"]),
            code=r["code"] or "",
            title=r["title"] or "",
            score=round(r["raw_score"] / max_raw, 3),
            snippet=r["snippet"] or None,
        )
        for r in rows
    ]
