"""
Concrete SQLAlchemy repository implementations.

Each class implements the corresponding abstract port from
:mod:`src.domain.repositories` using SQLAlchemy async sessions.

Module:    src.infrastructure.repositories
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

from typing import List, Optional
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities import (
    Patient,
    ConversationMessage,
    BodyMapEntry,
    Ticket,
    TreatmentModality,
    AniPersonality,
    MessageChannel,
    Document,
)
from src.domain.repositories import (
    AbstractPatientRepository,
    AbstractMessageRepository,
    AbstractBodyMapRepository,
    AbstractTicketRepository,
    AbstractDocumentRepository,
)
from src.domain.value_objects import PhoneNumber, SessionId
from src.infrastructure.database.models import (
    PatientModel,
    MessageModel,
    BodyMapEntryModel,
    TicketModel,
    DocumentModel,
)


class SQLPatientRepository(AbstractPatientRepository):
    """SQLAlchemy implementation of :class:`~src.domain.repositories.AbstractPatientRepository`.

    Args:
        session: An active :class:`~sqlalchemy.ext.asyncio.AsyncSession`.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, patient_id: str) -> Optional[Patient]:
        """Retrieve a patient by UUID.

        Args:
            patient_id: The patient's UUID string.

        Returns:
            The :class:`~src.domain.entities.Patient` entity, or ``None``.
        """
        result = await self._session.execute(
            select(PatientModel).where(PatientModel.id == patient_id)
        )
        model = result.scalar_one_or_none()
        return _patient_model_to_entity(model) if model else None

    async def get_by_phone(self, phone: PhoneNumber) -> Optional[Patient]:
        """Retrieve a patient by WhatsApp phone number.

        Args:
            phone: A validated :class:`~src.domain.value_objects.PhoneNumber`.

        Returns:
            The :class:`~src.domain.entities.Patient` entity, or ``None``.
        """
        result = await self._session.execute(
            select(PatientModel).where(PatientModel.whatsapp_phone == phone.value)
        )
        model = result.scalar_one_or_none()
        return _patient_model_to_entity(model) if model else None

    async def save(self, patient: Patient) -> Patient:
        """Persist a patient aggregate.

        Args:
            patient: The :class:`~src.domain.entities.Patient` entity.

        Returns:
            The persisted entity.
        """
        model = _patient_entity_to_model(patient)
        self._session.add(model)
        await self._session.flush()
        return patient

    async def exists_by_phone(self, phone: PhoneNumber) -> bool:
        """Check whether a patient with the given phone number exists.

        Args:
            phone: A validated :class:`~src.domain.value_objects.PhoneNumber`.

        Returns:
            ``True`` if a matching patient record exists.
        """
        result = await self._session.execute(
            select(PatientModel.id).where(PatientModel.whatsapp_phone == phone.value)
        )
        return result.scalar_one_or_none() is not None


class SQLMessageRepository(AbstractMessageRepository):
    """SQLAlchemy implementation of :class:`~src.domain.repositories.AbstractMessageRepository`.

    Args:
        session: An active :class:`~sqlalchemy.ext.asyncio.AsyncSession`.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, message: ConversationMessage) -> ConversationMessage:
        """Persist a conversation message.

        Args:
            message: The :class:`~src.domain.entities.ConversationMessage` to persist.

        Returns:
            The persisted message.
        """
        model = MessageModel(
            id=message.id,
            session_id=message.session_id,
            patient_id=message.patient_id,
            role=message.role,
            text=message.text,
            channel=message.channel.value if hasattr(message.channel, "value") else message.channel,
            cards=message.cards,
            agents_invoked=message.agents_invoked,
            created_at=message.created_at,
        )
        self._session.add(model)
        await self._session.flush()
        return message

    async def get_session_history(
        self, session_id: SessionId, limit: int = 50
    ) -> List[ConversationMessage]:
        """Retrieve ordered message history for a session.

        Args:
            session_id: The conversation session identifier.
            limit: Maximum number of messages to return.

        Returns:
            An ordered list of :class:`~src.domain.entities.ConversationMessage` objects.
        """
        result = await self._session.execute(
            select(MessageModel)
            .where(MessageModel.session_id == session_id.value)
            .order_by(MessageModel.created_at.asc())
            .limit(limit)
        )
        return [
            ConversationMessage(
                id=m.id,
                session_id=m.session_id,
                patient_id=m.patient_id,
                role=m.role,
                text=m.text,
                channel=MessageChannel(m.channel),
                cards=m.cards or [],
                agents_invoked=m.agents_invoked or [],
                created_at=m.created_at,
            )
            for m in result.scalars().all()
        ]


class SQLTicketRepository(AbstractTicketRepository):
    """SQLAlchemy implementation of :class:`~src.domain.repositories.AbstractTicketRepository`.

    Args:
        session: An active :class:`~sqlalchemy.ext.asyncio.AsyncSession`.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, ticket: Ticket) -> Ticket:
        """Persist a support ticket.

        Args:
            ticket: The :class:`~src.domain.entities.Ticket` to persist.

        Returns:
            The persisted ticket.
        """
        model = TicketModel(
            id=ticket.id,
            patient_id=ticket.patient_id,
            type=ticket.type,
            status=ticket.status,
            channel=ticket.channel,
            title=ticket.title,
            description=ticket.description,
            institution_name=ticket.institution_name,
            institution_email=ticket.institution_email,
            protocol_number=ticket.protocol_number,
        )
        self._session.add(model)
        await self._session.flush()
        return ticket

    async def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Retrieve a ticket by UUID.

        Args:
            ticket_id: The ticket UUID string.

        Returns:
            The :class:`~src.domain.entities.Ticket`, or ``None``.
        """
        result = await self._session.execute(
            select(TicketModel).where(TicketModel.id == ticket_id)
        )
        model = result.scalar_one_or_none()
        return _ticket_model_to_entity(model) if model else None

    async def list_by_patient(self, patient_id: str) -> List[Ticket]:
        """List all tickets for a patient.

        Args:
            patient_id: The patient's pseudonymized identifier.

        Returns:
            A list of :class:`~src.domain.entities.Ticket` objects.
        """
        result = await self._session.execute(
            select(TicketModel)
            .where(TicketModel.patient_id == patient_id)
            .order_by(TicketModel.created_at.desc())
        )
        return [_ticket_model_to_entity(m) for m in result.scalars().all()]

    async def update_status(self, ticket_id: str, status: str) -> Ticket:
        """Update ticket lifecycle status.

        Args:
            ticket_id: The ticket UUID string.
            status: The new status string.

        Returns:
            The updated :class:`~src.domain.entities.Ticket`.

        Raises:
            ValueError: When the ticket does not exist.
        """
        await self._session.execute(
            update(TicketModel)
            .where(TicketModel.id == ticket_id)
            .values(status=status, updated_at=datetime.utcnow())
        )
        ticket = await self.get_by_id(ticket_id)
        if ticket is None:
            raise ValueError(f"Ticket '{ticket_id}' not found after update.")
        return ticket


def _patient_model_to_entity(model: PatientModel) -> Patient:
    """Map a :class:`PatientModel` ORM instance to a :class:`~src.domain.entities.Patient` entity.

    Args:
        model: The SQLAlchemy ORM model instance.

    Returns:
        The corresponding domain entity.
    """
    try:
        personality = AniPersonality(model.ani_personality)
    except ValueError:
        personality = AniPersonality.DEFAULT

    return Patient(
        id=model.id,
        name=model.name_encrypted,
        date_of_birth=model.date_of_birth,
        cpf_hash=model.cpf_hash,
        cancer_type=model.cancer_type,
        cancer_stage=model.cancer_stage,
        treatment_modality=TreatmentModality(model.treatment_modality),
        treatment_types=model.treatment_types or [],
        journey_phase=model.journey_phase,
        diagnosis_date=model.diagnosis_date,
        ani_personality=personality,
        whatsapp_phone=model.whatsapp_phone,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _patient_entity_to_model(entity: Patient) -> PatientModel:
    """Map a :class:`~src.domain.entities.Patient` entity to a :class:`PatientModel` ORM instance.

    Args:
        entity: The domain entity.

    Returns:
        The corresponding SQLAlchemy model instance.
    """
    return PatientModel(
        id=entity.id,
        name_encrypted=entity.name,
        cpf_hash=entity.cpf_hash,
        date_of_birth=entity.date_of_birth,
        cancer_type=entity.cancer_type,
        cancer_stage=entity.cancer_stage,
        treatment_modality=entity.treatment_modality.value,
        treatment_types=entity.treatment_types,
        journey_phase=entity.journey_phase,
        diagnosis_date=entity.diagnosis_date,
        ani_personality=entity.ani_personality.value,
        whatsapp_phone=entity.whatsapp_phone,
    )


def _ticket_model_to_entity(model: TicketModel) -> Ticket:
    """Map a :class:`TicketModel` ORM instance to a :class:`~src.domain.entities.Ticket` entity.

    Args:
        model: The SQLAlchemy ORM model instance.

    Returns:
        The corresponding domain entity.
    """
    return Ticket(
        id=model.id,
        patient_id=model.patient_id,
        type=model.type,
        status=model.status,
        channel=model.channel,
        title=model.title,
        description=model.description,
        institution_name=model.institution_name,
        institution_email=model.institution_email,
        protocol_number=model.protocol_number,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SQLDocumentRepository(AbstractDocumentRepository):
    """SQLAlchemy implementation of :class:`~src.domain.repositories.AbstractDocumentRepository`.

    Args:
        session: An active :class:`~sqlalchemy.ext.asyncio.AsyncSession`.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, document: Document) -> Document:
        model = DocumentModel(
            id=document.id,
            patient_id=document.patient_id,
            file_url=document.file_url,
            document_type=document.document_type,
            extracted_text=document.extracted_text,
            summary=document.summary,
            created_at=document.created_at,
        )
        self._session.add(model)
        await self._session.flush()
        return document

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        result = await self._session.execute(
            select(DocumentModel).where(DocumentModel.id == document_id)
        )
        model = result.scalar_one_or_none()
        return _document_model_to_entity(model) if model else None

    async def list_by_patient(self, patient_id: str) -> List[Document]:
        result = await self._session.execute(
            select(DocumentModel)
            .where(DocumentModel.patient_id == patient_id)
            .order_by(DocumentModel.created_at.desc())
        )
        return [_document_model_to_entity(m) for m in result.scalars().all()]


def _document_model_to_entity(model: DocumentModel) -> Document:
    """Map a :class:`DocumentModel` ORM instance to a :class:`~src.domain.entities.Document` entity."""
    return Document(
        id=model.id,
        patient_id=model.patient_id,
        file_url=model.file_url,
        document_type=model.document_type,
        extracted_text=model.extracted_text,
        summary=model.summary,
        created_at=model.created_at,
    )

