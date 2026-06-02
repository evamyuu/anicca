"""
JWT authentication middleware and dependency provider.

Module:    src.presentation.middleware.auth
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from src.config import settings

_JWT_ALGORITHM = "HS256"
_bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_patient_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer_scheme)],
) -> str:
    """Validate the JWT bearer token and return the patient's identifier.

    Args:
        credentials: The HTTP Authorization header, parsed by FastAPI's
            :class:`~fastapi.security.HTTPBearer` scheme.

    Returns:
        The ``sub`` claim from the validated JWT — the patient's UUID.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``401`` when the token is
            missing, malformed, expired, or has no ``sub`` claim.

    Example:
        >>> @router.get("/protected")
        ... async def handler(patient_id: str = Depends(get_current_patient_id)):
        ...     ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[_JWT_ALGORITHM],
        )
        patient_id: str | None = payload.get("sub")
        if patient_id is None:
            raise credentials_exception
        return patient_id
    except JWTError:
        raise credentials_exception
