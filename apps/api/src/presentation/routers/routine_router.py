"""
Routine router — records and retrieves the patient's daily routine.

Covers temperature, medications, hydration, sleep, and wearable data.
Publishes ``routine_synced`` SSE events after each update.

Module:    src.presentation.routers.routine_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.models import RoutineModel
from src.infrastructure.database.session import get_db_session
from src.infrastructure.cache.redis_client import create_redis_client
from src.infrastructure.agents.nodes.catalog_agent import publish_catalog_event

router = APIRouter()

_TEMP_ALERT_THRESHOLD = 37.8


class MedicationItem(BaseModel):
    """A single medication item in the daily routine."""

    name: str
    period: str
    taken: bool = False


class RoutineUpdate(BaseModel):
    """Request body for updating a routine field."""

    patient_id: str
    date: Optional[str] = Field(default=None, description="ISO 8601 date, defaults to today")


class TemperatureUpdate(RoutineUpdate):
    """Update the temperature field of the routine."""

    temperature: float = Field(ge=35.0, le=42.0, description="Body temperature in Celsius")


class HydrationUpdate(RoutineUpdate):
    """Update the hydration field of the routine."""

    glasses: int = Field(ge=0, le=8, description="Number of water glasses (0–8)")


class SleepUpdate(RoutineUpdate):
    """Update the sleep field of the routine."""

    hours: float = Field(ge=0, le=24)
    quality: int = Field(ge=1, le=5, description="Subjective quality 1–5")


class MedicationsUpdate(RoutineUpdate):
    """Update the medications list of the routine."""

    medications: List[MedicationItem]


class RoutineResponse(BaseModel):
    """Full routine state for a given day."""

    id: str
    patient_id: str
    date: str
    temperature: Optional[float]
    temperature_alert: bool
    hydration_glasses: int
    sleep_hours: Optional[float]
    sleep_quality: Optional[int]
    medications: List[dict]
    wearable_steps: Optional[int]
    wearable_hrv: Optional[float]
    updated_at: datetime


async def _get_or_create_routine(patient_id: str, target_date: str, db: AsyncSession) -> RoutineModel:
    """Get today's routine record, or create a blank one if it doesn't exist."""
    result = await db.execute(
        select(RoutineModel)
        .where(RoutineModel.patient_id == patient_id, RoutineModel.date == target_date)
    )
    routine = result.scalar_one_or_none()
    if routine is None:
        routine = RoutineModel(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            date=target_date,
            medications=[],
        )
        db.add(routine)
        await db.flush()
    return routine


async def _publish_routine_event(patient_id: str) -> None:
    """Publish a routine_synced SSE event for the patient."""
    try:
        redis = await create_redis_client()
        await publish_catalog_event(
            redis_client=redis,
            user_id=patient_id,
            event_type="routine_synced",
            payload={"source_channel": "app"},
        )
        await redis.aclose()
    except Exception:
        pass


@router.get("/today/{patient_id}", summary="Get today's routine for a patient")
async def get_today_routine(
    patient_id: str,
    db: AsyncSession = Depends(get_db_session),
) -> RoutineResponse:
    """Return the current day's routine state for a patient.

    Args:
        patient_id: The patient's Anicca UUID.
        db: Injected async database session.

    Returns:
        The :class:`RoutineResponse` for today, creating a blank record if needed.
    """
    today = date.today().isoformat()
    routine = await _get_or_create_routine(patient_id, today, db)
    await db.commit()
    return _to_response(routine)


@router.post("/temperature", summary="Record body temperature", status_code=status.HTTP_200_OK)
async def update_temperature(
    body: TemperatureUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> RoutineResponse:
    """Record or update the patient's body temperature for the day.

    Returns a temperature_alert flag when the value is ≥37.8°C, per ASCO guidelines
    for fever management during chemotherapy (informational, not diagnostic).

    Args:
        body: Temperature update payload.
        db: Injected async database session.

    Returns:
        Updated :class:`RoutineResponse`.
    """
    target_date = body.date or date.today().isoformat()
    routine = await _get_or_create_routine(body.patient_id, target_date, db)
    routine.temperature = body.temperature
    await db.commit()
    await db.refresh(routine)
    await _publish_routine_event(body.patient_id)
    return _to_response(routine)


@router.post("/hydration", summary="Update hydration count", status_code=status.HTTP_200_OK)
async def update_hydration(
    body: HydrationUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> RoutineResponse:
    """Update the patient's water intake count for the day.

    Args:
        body: Hydration update payload.
        db: Injected async database session.

    Returns:
        Updated :class:`RoutineResponse`.
    """
    target_date = body.date or date.today().isoformat()
    routine = await _get_or_create_routine(body.patient_id, target_date, db)
    routine.hydration_glasses = body.glasses
    await db.commit()
    await db.refresh(routine)
    await _publish_routine_event(body.patient_id)
    return _to_response(routine)


@router.post("/sleep", summary="Record sleep data", status_code=status.HTTP_200_OK)
async def update_sleep(
    body: SleepUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> RoutineResponse:
    """Record the patient's sleep duration and quality.

    Args:
        body: Sleep update payload.
        db: Injected async database session.

    Returns:
        Updated :class:`RoutineResponse`.
    """
    target_date = body.date or date.today().isoformat()
    routine = await _get_or_create_routine(body.patient_id, target_date, db)
    routine.sleep_hours = body.hours
    routine.sleep_quality = body.quality
    await db.commit()
    await db.refresh(routine)
    await _publish_routine_event(body.patient_id)
    return _to_response(routine)


@router.post("/medications", summary="Update medication list", status_code=status.HTTP_200_OK)
async def update_medications(
    body: MedicationsUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> RoutineResponse:
    """Update the patient's medication adherence list for the day.

    Args:
        body: Medications update payload.
        db: Injected async database session.

    Returns:
        Updated :class:`RoutineResponse`.
    """
    target_date = body.date or date.today().isoformat()
    routine = await _get_or_create_routine(body.patient_id, target_date, db)
    routine.medications = [m.model_dump() for m in body.medications]
    await db.commit()
    await db.refresh(routine)
    await _publish_routine_event(body.patient_id)
    return _to_response(routine)


def _to_response(routine: RoutineModel) -> RoutineResponse:
    """Convert a :class:`RoutineModel` to a :class:`RoutineResponse`."""
    return RoutineResponse(
        id=routine.id,
        patient_id=routine.patient_id,
        date=routine.date,
        temperature=routine.temperature,
        temperature_alert=bool(
            routine.temperature and routine.temperature >= _TEMP_ALERT_THRESHOLD
        ),
        hydration_glasses=routine.hydration_glasses,
        sleep_hours=routine.sleep_hours,
        sleep_quality=routine.sleep_quality,
        medications=routine.medications or [],
        wearable_steps=routine.wearable_steps,
        wearable_hrv=routine.wearable_hrv,
        updated_at=routine.updated_at,
    )
