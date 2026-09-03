"""
Anicca Trust Layer - Audit Trail

Module:    apps.api.src.infrastructure.trust_layer.audit_trail
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import json
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.models import AuditLogModel

async def log_llm_interaction(
    db: AsyncSession,
    model_name: str,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    latency_ms: int = 0,
    safety_flags: Optional[dict] = None,
    session_id: Optional[str] = None,
    patient_id: Optional[str] = None,
) -> None:
    """Logs LLM interaction metadata to the Audit Trail without saving PII."""
    
    audit_log = AuditLogModel(
        llm_model=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        latency_ms=latency_ms,
        safety_flags=safety_flags,
        session_id=session_id,
        patient_id=patient_id,
    )
    
    db.add(audit_log)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"[AuditTrail] Failed to log interaction: {e}")

