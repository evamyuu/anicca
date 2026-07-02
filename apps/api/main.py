"""
Anicca API application entry point.

Registers all BFF routers and CORS middleware for the FastAPI application.

Module:    main
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.presentation.routers import (
    auth_router,
    messages_router,
    whatsapp_router,
    body_map_router,
    symptoms_router,
    routine_router,
    journaling_router,
    tickets_router,
    documents_router,
    profile_router,
    consent_router,
    wearables_router,
    doctor_router,
)
from src.presentation.routers.events_router import router as events_router
from src.infrastructure.security.pii_sanitizer import PIISanitizerMiddleware
from src.infrastructure.security.rate_limiter import RateLimiterMiddleware
from src.config import settings

app = FastAPI(
    title="Anicca API",
    description="Oncology Navigation Hub — Backend for Frontend (BFF)",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom security middlewares
app.add_middleware(PIISanitizerMiddleware)
app.add_middleware(RateLimiterMiddleware)

@app.middleware("http")
async def add_security_headers(request, call_next):
    """Secure HTTP headers middleware."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(messages_router, prefix="/api/v1/messages", tags=["Messages (Ani)"])
app.include_router(whatsapp_router, prefix="/api/v1/whatsapp", tags=["WhatsApp (Whatsmiau)"])
app.include_router(body_map_router, prefix="/api/v1/body-map", tags=["Body Map"])
app.include_router(symptoms_router, prefix="/api/v1/symptoms", tags=["Symptoms (CTCAE)"])
app.include_router(routine_router, prefix="/api/v1/routine", tags=["Routine"])
app.include_router(journaling_router, prefix="/api/v1/journaling", tags=["Journaling"])
app.include_router(tickets_router, prefix="/api/v1/tickets", tags=["Tickets"])
app.include_router(documents_router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["Profile"])
app.include_router(consent_router, prefix="/api/v1/consent", tags=["Consent (LGPD)"])
app.include_router(wearables_router, prefix="/api/v1/wearables", tags=["Wearables"])
app.include_router(doctor_router, prefix="/api/v1/doctor", tags=["Doctor Panel"])
app.include_router(events_router, prefix="/api/v1/events", tags=["Hub Sync (SSE)"])


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Return the API health status.

    Returns:
        A dictionary with ``status``, ``service``, and ``version`` fields.
    """
    return {"status": "healthy", "service": "anicca-api", "version": "1.0.0"}
