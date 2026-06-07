from fastapi import APIRouter
from app.core.config import settings
from app.services.db import db_healthy

router = APIRouter(tags=["Health"])


@router.get("/health")
def health():
    db_ok = db_healthy()
    return {
        "status": "ok" if db_ok else "degraded",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.ENV,
        "checks": {
            "database": "ok" if db_ok else "fail",
        },
    }
