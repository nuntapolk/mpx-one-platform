from sqlalchemy import create_engine, text
from app.core.config import settings

# Read-only DB access. AI service must NOT write to tables owned by NestJS.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_size=5)


def db_healthy() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
