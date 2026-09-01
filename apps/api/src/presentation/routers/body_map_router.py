"""
Implementation of body_map_router.

Module:    apps.api.src.presentation.routers.body_map_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.use_cases.whatsapp.notify_whatsapp_trigger import NotifyWhatsAppTriggerUseCase
from src.infrastructure.database.models import BodyMapEntryModel
from src.infrastructure.database.session import get_db_session, _AsyncSessionFactory
from src.infrastructure.cache.redis_client import create_redis_client
from src.infrastructure.agents.nodes.catalog_agent import publish_catalog_event

router = APIRouter()


class BodyMapEntryCreate(BaseModel):
    """Request body for creating a body map entry."""

    patient_id: str = Field(description="Patient UUID")
    body_region: str = Field(description="Anatomical region ID (e.g. 'chest-left')")
    body_view: str = Field(description="'front' or 'back'")
    intensity: int = Field(ge=0, le=10, description="Symptom intensity 0–10")
    symptom_types: List[str] = Field(description="List of symptom descriptors")
    description: Optional[str] = Field(default=None, description="Free-text note")


class BodyMapEntryResponse(BaseModel):
    """Response schema for a body map entry."""

    id: str
    patient_id: str
    body_region: str
    body_view: str
    intensity: int
    symptom_types: List[str]
    description: Optional[str]
    suggested_ctcae_grade: Optional[int]
    registered_at: datetime


@router.post(
    "",
    summary="Record a symptom on the body map",
    status_code=status.HTTP_201_CREATED,
)
async def create_body_map_entry(
    body: BodyMapEntryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
) -> BodyMapEntryResponse:
    """Record a new symptom pin on the patient's body map.

    After saving, publishes a ``body_map_updated`` SSE event so the app
    and any connected viewers (e.g. the doctor panel) update in real time.

    Args:
        body: See :class:`BodyMapEntryCreate`.
        db: Injected async database session.

    Returns:
        The created :class:`BodyMapEntryResponse`.
    """
    suggested_ctcae = None
    if body.intensity >= 7:
        suggested_ctcae = 3
    elif body.intensity >= 4:
        suggested_ctcae = 2
    elif body.intensity >= 1:
        suggested_ctcae = 1

    entry = BodyMapEntryModel(
        id=str(uuid.uuid4()),
        patient_id=body.patient_id,
        body_region=body.body_region,
        body_view=body.body_view,
        intensity=body.intensity,
        symptom_types=body.symptom_types,
        description=body.description,
        suggested_ctcae_grade=suggested_ctcae,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    try:
        redis = await create_redis_client()
        await publish_catalog_event(
            redis_client=redis,
            user_id=body.patient_id,
            event_type="body_map_updated",
            payload={
                "body_region": body.body_region,
                "intensity": body.intensity,
                "symptom_types": body.symptom_types,
                "ctcae_grade": suggested_ctcae,
            },
        )
        async def _trigger_whatsapp():
            trigger_uc = NotifyWhatsAppTriggerUseCase(db, redis)
            await trigger_uc.execute_body_map_trigger(
                patient_id=body.patient_id,
                intensity=body.intensity,
                symptom_types=body.symptom_types,
            )
            await redis.aclose()
            
        background_tasks.add_task(_trigger_whatsapp)
    except Exception as e:
        print(f"[BodyMap] Trigger failed: {e}")

    return BodyMapEntryResponse(
        id=entry.id,
        patient_id=entry.patient_id,
        body_region=entry.body_region,
        body_view=entry.body_view,
        intensity=entry.intensity,
        symptom_types=entry.symptom_types,
        description=entry.description,
        suggested_ctcae_grade=entry.suggested_ctcae_grade,
        registered_at=entry.registered_at,
    )


@router.get(
    "/{patient_id}/history",
    summary="Get body map history for a patient",
)
async def get_body_map_history(
    patient_id: str,
    region: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
) -> List[BodyMapEntryResponse]:
    """Return the body map symptom history for a patient.

    Args:
        patient_id: The patient's Anicca UUID.
        region: Optional anatomical region filter.
        limit: Maximum number of entries to return. Defaults to 50.
        db: Injected async database session.

    Returns:
        List of :class:`BodyMapEntryResponse` ordered by most recent first.
    """
    query = (
        select(BodyMapEntryModel)
        .where(BodyMapEntryModel.patient_id == patient_id)
        .order_by(BodyMapEntryModel.registered_at.desc())
        .limit(limit)
    )
    if region:
        query = query.where(BodyMapEntryModel.body_region == region)

    result = await db.execute(query)
    entries = result.scalars().all()

    return [
        BodyMapEntryResponse(
            id=e.id,
            patient_id=e.patient_id,
            body_region=e.body_region,
            body_view=e.body_view,
            intensity=e.intensity,
            symptom_types=e.symptom_types,
            description=e.description,
            suggested_ctcae_grade=e.suggested_ctcae_grade,
            registered_at=e.registered_at,
        )
        for e in entries
    ]
@router.post(
    "/{entry_id}/photo",
    summary="Anexar foto a um registro do Body Map",
)
async def attach_photo(
    entry_id: str,
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
):
    from src.infrastructure.agents.nodes.cv_analysis_node import run_cv_analysis
    import boto3
    from src.config import settings

    entry = await db.get(BodyMapEntryModel, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    file_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"
    
    async def _process_cv_background(entry_id: str, bytes_data: bytes, mime_type: str):
        async with _AsyncSessionFactory() as session:
            entry = await session.get(BodyMapEntryModel, entry_id)
            if not entry:
                return

            # 1. Upload to S3
            s3 = boto3.client(
                "s3", 
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            key = f"bodymap_cv/{entry_id}_{file.filename}"
            try:
                s3.put_object(Bucket=settings.AWS_S3_BUCKET, Key=key, Body=bytes_data, ContentType=mime_type)
                photo_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
                entry.photo_url = photo_url
            except Exception as e:
                print(f"[BodyMap CV] S3 Upload failed: {e}")
                return

            # 2. Run CV Analysis (Gemini Multimodal)
            patient_symptom = ", ".join(entry.symptom_types)
            cv_result = await run_cv_analysis(
                file_bytes=bytes_data, 
                mime_type=mime_type, 
                patient_symptom=patient_symptom, 
                patient_intensity=entry.intensity
            )
            
            entry.cv_classification = cv_result
            entry.cv_processed_at = datetime.now(timezone.utc)
            
            await session.commit()

    background_tasks.add_task(_process_cv_background, entry_id, file_bytes, content_type)
    return {"message": "Foto recebida e em processamento na IA."}


