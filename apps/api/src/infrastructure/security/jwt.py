"""
JWT Security utility.

Module:    src.infrastructure.security.jwt
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from jose import jwt

from src.config import settings

_JWT_ALGORITHM = "HS256"
_TOKEN_EXPIRE_DAYS = 30


def create_access_token(data: Dict[str, Any]) -> str:
    """Creates a signed JWT bearer token.

    Args:
        data: Payload to encode into the token.

    Returns:
        The encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + timedelta(days=_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=_JWT_ALGORITHM,
    )
    return encoded_jwt
