"""
PII (Personally Identifiable Information) sanitizer middleware.

Strips sensitive information like CPFs, emails, and phone numbers from request
logs to ensure compliance with LGPD and prevent leakage of health-related
patient data into monitoring tools like Datadog/Sentry.

Module:    src.infrastructure.security.pii_sanitizer
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import re
import logging
from typing import Callable, Awaitable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Regex patterns for common Brazilian PII
_PII_PATTERNS = {
    "CPF": re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b"),
    "CNS": re.compile(r"\b[12789]\d{14}\b"),
    "PHONE": re.compile(r"\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9\d{4}[-\s]?\d{4}\b"),
    "EMAIL": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"),
}


def _sanitize_string(text: str) -> str:
    """Replace found PII patterns with placeholders."""
    for pii_type, pattern in _PII_PATTERNS.items():
        text = pattern.sub(f"[REDACTED_{pii_type}]", text)
    return text


class PIISanitizerMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware to sanitize PII from request paths and query params."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self._logger = logging.getLogger("anicca.security.pii")

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Sanitize URLs before they are logged or processed further."""
        # Sanitize query parameters and path if needed for logging
        safe_path = _sanitize_string(request.url.path)
        safe_query = _sanitize_string(request.url.query.decode("utf-8")) if request.url.query else ""
        
        # We don't alter the actual request payload here as that might break valid use cases,
        # but we ensure the path logged internally is sanitized.
        request.state.safe_url = f"{safe_path}?{safe_query}" if safe_query else safe_path

        response = await call_next(request)
        return response
