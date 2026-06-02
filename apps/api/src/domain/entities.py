"""
Domain entities as pure Python dataclasses, free of framework dependencies.

These classes form the innermost layer of the Clean Architecture and MUST NOT
import from FastAPI, SQLAlchemy, or any infrastructure module.

Module:    src.domain.entities
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class TreatmentModality(str, Enum):
    """Classifies the funding modality for a patient's oncological treatment."""

    SUS = "sus"
    CONVENIO = "convenio"
    PARTICULAR = "particular"


class UserProfileType(str, Enum):
    """Identifies the role of an Anicca user."""

    PATIENT = "patient"
    CAREGIVER = "caregiver"
    DOCTOR = "doctor"


class AniPersonality(str, Enum):
    """Defines the conversational style Ani adopts for a given patient.

    Attributes:
        MENTOR: Encouraging and empathetic. Celebrates every milestone.
        REALIST: Direct and factual. Prioritises clarity over comfort.
        OPTIMIST: Positive and hopeful. Focuses on what the patient can control.
        SPECIALIST: Technical and detailed. Provides clinical-grade information.
    """

    DEFAULT = "default"
    BESTIE = "bestie"
    PROTECTOR = "protector"
    NERD = "nerd"
    CHILL = "chill"
    GENTLE = "gentle"


class MessageChannel(str, Enum):
    """Identifies the channel through which a message was sent or received."""

    APP = "app"
    WEB = "web"
    WHATSAPP = "whatsapp"


@dataclass
class Patient:
    """Represents an oncology patient in the Anicca domain.

    Attributes:
        id: Server-assigned unique identifier (UUID).
        name: Full name (stored encrypted at rest; pseudonymized in logs).
        date_of_birth: ISO 8601 date string.
        cpf_hash: SHA-256 hash of the CPF for LGPD-compliant identification.
        cancer_type: Primary cancer type (e.g. ``"mama"``, ``"pulmao"``).
        cancer_stage: TNM staging code (e.g. ``"IIA"``).
        treatment_modality: Funding modality — see :class:`TreatmentModality`.
        treatment_types: List of active treatment modalities (e.g. ``["quimio", "radio"]``).
        journey_phase: Current phase label within the oncology journey.
        diagnosis_date: ISO 8601 diagnosis date string, or ``None`` if unknown.
        ani_personality: Configured conversational style — see :class:`AniPersonality`.
        whatsapp_phone: E.164-formatted phone number linked to WhatsApp, or ``None``.
        created_at: UTC timestamp of record creation.
        updated_at: UTC timestamp of the most recent update.
    """

    id: str
    name: str
    date_of_birth: str
    cpf_hash: Optional[str]
    cancer_type: str
    cancer_stage: str
    treatment_modality: TreatmentModality
    treatment_types: List[str]
    journey_phase: str
    diagnosis_date: Optional[str]
    ani_personality: AniPersonality
    whatsapp_phone: Optional[str]
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class ConversationMessage:
    """Represents a single message within an Ani conversation session.

    Attributes:
        id: Server-assigned unique identifier.
        session_id: The conversation session this message belongs to.
        patient_id: The patient's pseudonymized identifier.
        role: Message author — ``"user"`` or ``"ani"``.
        text: Plain-text content of the message.
        channel: The delivery channel — see :class:`MessageChannel`.
        cards: List of GenUI card dictionaries attached to this message.
        agents_invoked: Names of the LangGraph agents that contributed to this response.
        created_at: UTC timestamp of message creation.
    """

    id: str
    session_id: str
    patient_id: str
    role: str
    text: str
    channel: MessageChannel
    cards: List[dict] = field(default_factory=list)
    agents_invoked: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class BodyMapEntry:
    """Represents a symptom pin placed on the interactive body map.

    Attributes:
        id: Server-assigned unique identifier.
        patient_id: The patient's pseudonymized identifier.
        body_region: Anatomical region identifier (e.g. ``"chest-left"``).
        body_view: Silhouette view — ``"front"`` or ``"back"``.
        intensity: Subjective intensity on a 0–10 scale.
        symptom_types: List of symptom descriptors (e.g. ``["pain", "burning"]``).
        description: Optional free-text annotation from the patient.
        suggested_ctcae_grade: CTCAE grade suggested by the Ani agent, or ``None``.
        registered_at: UTC timestamp of registration.
    """

    id: str
    patient_id: str
    body_region: str
    body_view: str
    intensity: int
    symptom_types: List[str]
    description: Optional[str]
    suggested_ctcae_grade: Optional[int]
    registered_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Ticket:
    """Represents a rights-advocacy support ticket.

    Attributes:
        id: Server-assigned unique identifier.
        patient_id: The patient's pseudonymized identifier.
        type: Ticket category (e.g. ``"medicamento"``, ``"exame"``, ``"consulta"``).
        status: Lifecycle status (e.g. ``"open"``, ``"in_progress"``, ``"closed"``).
        channel: Submission channel (e.g. ``"ouvidoria"``, ``"anss"``, ``"judicial"``).
        title: Short descriptive title.
        description: Full problem description.
        institution_name: Name of the responsible institution, if applicable.
        institution_email: Contact email of the institution, if applicable.
        protocol_number: Official protocol number issued by the institution, if any.
        created_at: UTC timestamp of ticket creation.
        updated_at: UTC timestamp of the most recent status change.
    """

    id: str
    patient_id: str
    type: str
    status: str
    channel: str
    title: str
    description: str
    institution_name: Optional[str]
    institution_email: Optional[str]
    protocol_number: Optional[str]
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Document:
    """Represents a medical document or exam uploaded by the patient.

    Attributes:
        id: Server-assigned unique identifier.
        patient_id: The patient's pseudonymized identifier.
        file_url: URL or local path to the stored document.
        document_type: The type of document identified by AI (e.g. ``"laudo_biopsia"``, ``"exame_sangue"``).
        extracted_text: Full OCR text extracted from the document.
        summary: AI-generated summary in accessible language.
        created_at: UTC timestamp of upload.
    """

    id: str
    patient_id: str
    file_url: str
    document_type: str
    extracted_text: str
    summary: str
    created_at: datetime = field(default_factory=datetime.utcnow)

