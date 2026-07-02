"""
Rate limiting middleware using Redis.

Prevents brute-force attacks and limits API abuse per IP or user ID.

Module:    src.infrastructure.security.rate_limiter
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import time
from typing import Callable, Awaitable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from src.config import settings
from src.infrastructure.cache.redis_client import create_redis_client

_RATE_LIMIT_PREFIX = "ratelimit:"


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Middleware that limits the number of requests per window using Redis."""

    def __init__(self, app: ASGIApp, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Enforce rate limits per IP address."""
        # Skip rate limiting in test or local if needed
        if settings.ENVIRONMENT == "development":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        current_minute = int(time.time() // 60)
        key = f"{_RATE_LIMIT_PREFIX}{client_ip}:{current_minute}"

        redis = await create_redis_client()
        try:
            current_count = await redis.incr(key)
            if current_count == 1:
                await redis.expire(key, 60)

            if current_count > self.requests_per_minute:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Muitas requisições. Tente novamente em um minuto."},
                )
        finally:
            await redis.aclose()

        return await call_next(request)
