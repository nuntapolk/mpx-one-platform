from fastapi import Header, HTTPException, status
from app.core.config import settings


async def verify_internal_token(x_internal_token: str = Header(default="")):
    """Verify service-to-service token from NestJS core.

    Used to protect internal endpoints that the core API calls.
    """
    if x_internal_token != settings.INTERNAL_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal service token",
        )
    return True
