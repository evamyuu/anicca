"""
Router registry: exports all concrete router instances for registration in main.py.

Module:    src.presentation.routers
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from fastapi import APIRouter

from src.presentation.routers.auth_router import router as auth_router
from src.presentation.routers.messages_router import router as messages_router
from src.presentation.routers.whatsapp_router import router as whatsapp_router


def _stub_router(*paths: str) -> APIRouter:
    """Create a minimal stub router with ``GET`` endpoints returning a pending status.

    Args:
        *paths: URL paths to register as stubs.

    Returns:
        An :class:`~fastapi.APIRouter` instance with stub handlers.
    """
    router = APIRouter()
    for path in paths:
        router.add_api_route(
            path,
            lambda: {"status": "not_yet_implemented"},
            methods=["GET"],
        )
    return router


body_map_router = _stub_router("", "/{patient_id}/history")
symptoms_router = _stub_router("", "/{patient_id}/history")
routine_router = _stub_router("/today", "/temperature", "/hydration", "/sleep", "/medications")
journaling_router = _stub_router("/history", "/mood-trend")
tickets_router = _stub_router("")
documents_router = _stub_router("")
profile_router = _stub_router("", "/avatar", "/ani-personality")
consent_router = _stub_router("", "/history")
wearables_router = _stub_router("/latest")
doctor_router = _stub_router("/patients")

__all__ = [
    "auth_router",
    "messages_router",
    "whatsapp_router",
    "body_map_router",
    "symptoms_router",
    "routine_router",
    "journaling_router",
    "tickets_router",
    "documents_router",
    "profile_router",
    "consent_router",
    "wearables_router",
    "doctor_router",
]
