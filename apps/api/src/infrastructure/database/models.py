"""
SQLAlchemy ORM models for the Anicca database schema.

Each model maps to a PostgreSQL table and provides the persistence
representation of the corresponding domain entity.

Module:    src.infrastructure.database.models
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.database.base import Base


def _uuid() -> str:
    """Generate a new UUID4 string for use as a primary key default."""
    return str(uuid.uuid4())


class PatientModel(Base):
    """ORM model for the ``patients`` table.

    Attributes:
        id: UUID primary key.
        name_encrypted: AES-256 encrypted full name (plaintext never stored).
        cpf_hash: SHA-256 hash of the CPF with application-level salt.
        date_of_birth: ISO 8601 date string.
        cancer_type: Primary cancer type identifier.
        cancer_stage: TNM staging code.
        treatment_modality: Funding modality (``sus``, ``convenio``, ``particular``).
        treatment_types: Array of treatment type identifiers.
        journey_phase: Current oncology journey phase label.
        diagnosis_date: ISO 8601 diagnosis date, or ``None``.
        ani_personality: Configured Ani conversational style.
        whatsapp_phone: E.164 phone number linked to WhatsApp, or ``None``.
        created_at: UTC timestamp of record creation (server default).
        updated_at: UTC timestamp of the most recent update (auto-updated).
        messages: Relationship to :class:`MessageModel` records.
        tickets: Relationship to :class:`TicketModel` records.
        body_map_entries: Relationship to :class:`BodyMapEntryModel` records.
    """

    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    name_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    cpf_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    date_of_birth: Mapped[str] = mapped_column(String(10), nullable=False)
    cancer_type: Mapped[str] = mapped_column(String(100), nullable=False)
    cancer_stage: Mapped[str] = mapped_column(String(20), nullable=False)
    treatment_modality: Mapped[str] = mapped_column(String(20), nullable=False)
    treatment_types: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    journey_phase: Mapped[str] = mapped_column(String(50), nullable=False)
    diagnosis_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    ani_personality: Mapped[str] = mapped_column(String(20), nullable=False, default="default")
    whatsapp_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    messages: Mapped[List["MessageModel"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    tickets: Mapped[List["TicketModel"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    body_map_entries: Mapped[List["BodyMapEntryModel"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    documents: Mapped[List["DocumentModel"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    routines: Mapped[List["RoutineModel"]] = relationship(
        "RoutineModel", foreign_keys="RoutineModel.patient_id", cascade="all, delete-orphan"
    )
    journaling_entries: Mapped[List["JournalingModel"]] = relationship(
        "JournalingModel", foreign_keys="JournalingModel.patient_id", cascade="all, delete-orphan"
    )


class MessageModel(Base):
    """ORM model for the ``messages`` table.

    Attributes:
        id: UUID primary key.
        session_id: Conversation session identifier (indexed).
        patient_id: Foreign key to :class:`PatientModel`.
        role: Message author — ``"user"`` or ``"ani"``.
        text: Plain-text message content.
        channel: Delivery channel — ``"app"``, ``"web"``, or ``"whatsapp"``.
        cards: JSONB array of GenUI card payloads.
        agents_invoked: Array of LangGraph agent names that contributed.
        created_at: UTC timestamp of message creation.
        patient: Relationship to :class:`PatientModel`.
    """

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    patient_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(10), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False, default="app")
    cards: Mapped[List[dict]] = mapped_column(JSONB, nullable=False, default=list)
    agents_invoked: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    patient: Mapped["PatientModel"] = relationship(back_populates="messages")


class BodyMapEntryModel(Base):
    """ORM model for the ``body_map_entries`` table.

    Attributes:
        id: UUID primary key.
        patient_id: Foreign key to :class:`PatientModel`.
        body_region: Anatomical region identifier.
        body_view: Silhouette side — ``"front"`` or ``"back"``.
        intensity: Subjective intensity on a 0–10 scale.
        symptom_types: Array of symptom descriptor strings.
        description: Optional free-text annotation.
        suggested_ctcae_grade: Ani-suggested CTCAE grade (0–4), or ``None``.
        registered_at: UTC timestamp of entry creation.
        patient: Relationship to :class:`PatientModel`.
    """

    __tablename__ = "body_map_entries"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    body_region: Mapped[str] = mapped_column(String(50), nullable=False)
    body_view: Mapped[str] = mapped_column(String(10), nullable=False)
    intensity: Mapped[int] = mapped_column(Integer, nullable=False)
    symptom_types: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suggested_ctcae_grade: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    patient: Mapped["PatientModel"] = relationship(back_populates="body_map_entries")


class TicketModel(Base):
    """ORM model for the ``tickets`` table.

    Attributes:
        id: UUID primary key.
        patient_id: Foreign key to :class:`PatientModel`.
        type: Ticket category string.
        status: Lifecycle status string.
        channel: Submission channel string.
        title: Short descriptive title.
        description: Full problem description.
        institution_name: Responsible institution name, or ``None``.
        institution_email: Institution contact email, or ``None``.
        protocol_number: Official protocol number, or ``None``.
        created_at: UTC creation timestamp.
        updated_at: UTC last-update timestamp.
        patient: Relationship to :class:`PatientModel`.
    """

    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    channel: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    institution_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    institution_email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    protocol_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    patient: Mapped["PatientModel"] = relationship(back_populates="tickets")


class DocumentModel(Base):
    """ORM model for the ``documents`` table.

    Attributes:
        id: UUID primary key.
        patient_id: Foreign key to :class:`PatientModel`.
        file_url: URL or local path to the stored document.
        document_type: The type of document identified by AI.
        extracted_text: Full OCR text extracted from the document.
        summary: AI-generated summary in accessible language.
        created_at: UTC timestamp of upload.
        patient: Relationship to :class:`PatientModel`.
    """

    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_channel: Mapped[str] = mapped_column(String(20), nullable=False, default="upload")
    extracted_text: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    ai_questions: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    patient: Mapped["PatientModel"] = relationship(back_populates="documents")


class UserModel(Base):
    """ORM model for the ``users`` table — authentication layer.

    Attributes:
        id: UUID primary key.
        email: Unique user email address.
        hashed_password: bcrypt-hashed password, or ``None`` for social auth.
        role: User role — ``patient``, ``caregiver``, or ``doctor``.
        patient_id: FK to :class:`PatientModel` for patient/caregiver roles.
        refresh_token_hash: SHA-256 hash of the last issued refresh token.
        expo_push_token: Expo push notification token, or ``None``.
        created_at: UTC creation timestamp.
        updated_at: UTC last-update timestamp.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="patient")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    crm_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    patient_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="SET NULL"), nullable=True
    )
    refresh_token_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    expo_push_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class RoutineModel(Base):
    """ORM model for the ``routines`` table — daily patient routine tracking.

    Attributes:
        id: UUID primary key.
        patient_id: FK to :class:`PatientModel`.
        date: ISO 8601 date string for the routine entry.
        temperature: Body temperature in Celsius, or ``None``.
        hydration_glasses: Number of water glasses consumed (0–8).
        sleep_hours: Hours of sleep, or ``None``.
        sleep_quality: Subjective sleep quality (1–5), or ``None``.
        medications: JSONB array of ``{name, period, taken}`` objects.
        wearable_steps: Daily step count from Health Connect, or ``None``.
        wearable_hrv: HRV RMSSD value from Health Connect, or ``None``.
        wearable_resting_hr: Resting heart rate in bpm, or ``None``.
        created_at: UTC creation timestamp.
        updated_at: UTC last-update timestamp.
    """

    __tablename__ = "routines"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    temperature: Mapped[Optional[float]] = mapped_column(nullable=True)
    hydration_glasses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sleep_hours: Mapped[Optional[float]] = mapped_column(nullable=True)
    sleep_quality: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    medications: Mapped[List[dict]] = mapped_column(JSONB, nullable=False, default=list)
    wearable_steps: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    wearable_hrv: Mapped[Optional[float]] = mapped_column(nullable=True)
    wearable_resting_hr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    patient: Mapped["PatientModel"] = relationship("PatientModel", foreign_keys=[patient_id])


class JournalingModel(Base):
    """ORM model for the ``journaling_entries`` table — emotional journaling.

    Attributes:
        id: UUID primary key.
        patient_id: FK to :class:`PatientModel`.
        mood: Mood code — ``great``, ``ok``, ``difficult``, ``hard``.
        text_encrypted: AES-256 encrypted journal text.
        ctcae_context: JSONB snapshot of current CTCAE events for context.
        shared_with_doctor: Whether the patient opted to share with their doctor.
        ai_prompt: The contextual prompt generated by Ani for this entry.
        created_at: UTC creation timestamp.
    """

    __tablename__ = "journaling_entries"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    mood: Mapped[str] = mapped_column(String(20), nullable=False)
    text_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ctcae_context: Mapped[List[dict]] = mapped_column(JSONB, nullable=False, default=list)
    shared_with_doctor: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    ai_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    patient: Mapped["PatientModel"] = relationship("PatientModel", foreign_keys=[patient_id])


class ConsentModel(Base):
    """ORM model for the ``consents`` table — LGPD audit trail.

    Attributes:
        id: UUID primary key.
        user_id: FK to :class:`UserModel`.
        consent_type: Type of consent (``main``, ``notifications``, ``camera``,
            ``calendar``, ``research``).
        granted: Whether consent is currently granted.
        term_version: Version string of the terms accepted.
        granted_at: UTC timestamp when consent was granted.
        revoked_at: UTC timestamp when consent was revoked, or ``None``.
    """

    __tablename__ = "consents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    consent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    granted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    term_version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
