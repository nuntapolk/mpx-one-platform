# MPX-ONE AI Service (FastAPI)

AI / Analytics sidecar for MPX-ONE Governance. Runs alongside the NestJS core API.

## Role

| Does | Does NOT |
|------|----------|
| Semantic search (controls, evidence, obligations) | Own/write core business tables |
| AI control-mapping suggestions (Phase 2) | Handle CRUD / RBAC / workflow |
| Document parsing — ROPA/policy extract (Phase 2) | Replace NestJS |
| Read DB (read-only role) + return results to core | Be a second source of truth |

NestJS remains the single source of truth. This service reads PostgreSQL and
returns computed results; any persistence happens via the core API.

## Run locally

```bash
cd mpx-ai-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- Swagger: http://localhost:8000/api/docs
- Health:  http://localhost:8000/health

## Example call

```bash
curl -X POST http://localhost:8000/api/v1/ai/semantic-search \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: change-me-in-production" \
  -d '{"query":"encrypt data","target":"control","top_k":5}'
```

## Phase 1 → Phase 2

- **Now:** PostgreSQL keyword relevance ranking (no model download).
- **Phase 2:** swap `search_service._keyword_search` for pgvector cosine
  similarity using `sentence-transformers`. The API contract is unchanged —
  uncomment the AI deps in `requirements.txt` and add an `embeddings` column.

## Structure

```
app/
  main.py              FastAPI app + router registration
  core/
    config.py          Settings (env)
    security.py        Internal service-to-service token guard
  api/
    health.py          GET /health
    search.py          POST /api/v1/ai/semantic-search
  services/
    db.py              Read-only SQLAlchemy engine
    search_service.py  Search logic (keyword now, embedding-ready)
  schemas/
    search.py          Pydantic request/response models
```
