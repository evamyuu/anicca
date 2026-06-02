"""
Abstract repository interfaces (ports) for the domain layer.

These interfaces define the contract between the application layer and the
infrastructure layer. The domain and application layers depend ONLY on these
abstractions — never on SQLAlchemy, Redis, or any concrete implementation.

Module:    src.domain.repositories
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional, List

from src.domain.entities import (
    Patient,
    ConversationMessage,
    BodyMapEntry,
    Ticket,
    Document,
)
from src.domain.value_objects import PhoneNumber, SessionId


class AbstractPatientRepository(ABC):
    """Port: persistence contract for :class:`~src.domain.entities.Patient` aggregates."""

    @abstractmethod
    async def get_by_id(self, patient_id: str) -> Optional[Patient]:
        """Retrieve a patient by their server-assigned identifier.

        Args:
            patient_id: The patient's UUID string.

        Returns:
            The :class:`Patient` entity, or ``None`` if not found.
        """

    @abstractmethod
    async def get_by_phone(self, phone: PhoneNumber) -> Optional[Patient]:
        """Retrieve a patient by their linked WhatsApp phone number.

        Args:
            phone: A validated :class:`~src.domain.value_objects.PhoneNumber`.

        Returns:
            The :class:`Patient` entity, or ``None`` if not found.
        """

    @abstractmethod
    async def save(self, patient: Patient) -> Patient:
        """Persist a new or updated patient aggregate.

        Args:
            patient: The :class:`Patient` entity to persist.

        Returns:
            The persisted :class:`Patient` with any server-generated fields populated.
        """

    @abstractmethod
    async def exists_by_phone(self, phone: PhoneNumber) -> bool:
        """Check whether a patient with the given phone number exists.

        Args:
            phone: A validated :class:`~src.domain.value_objects.PhoneNumber`.

        Returns:
            ``True`` if a patient with that phone number exists.
        """


class AbstractMessageRepository(ABC):
    """Port: persistence contract for :class:`~src.domain.entities.ConversationMessage` records."""

    @abstractmethod
    async def save(self, message: ConversationMessage) -> ConversationMessage:
        """Persist a conversation message.

        Args:
            message: The :class:`ConversationMessage` to persist.

        Returns:
            The persisted message with any server-generated fields populated.
        """

    @abstractmethod
    async def get_session_history(
        self, session_id: SessionId, limit: int = 50
    ) -> List[ConversationMessage]:
        """Retrieve the message history for a conversation session.

        Args:
            session_id: The conversation session identifier.
            limit: Maximum number of messages to return, ordered ascending by
                creation time. Defaults to ``50``.

        Returns:
            An ordered list of :class:`ConversationMessage` objects.
        """


class AbstractBodyMapRepository(ABC):
    """Port: persistence contract for :class:`~src.domain.entities.BodyMapEntry` records."""

    @abstractmethod
    async def save(self, entry: BodyMapEntry) -> BodyMapEntry:
        """Persist a body map entry.

        Args:
            entry: The :class:`BodyMapEntry` to persist.

        Returns:
            The persisted entry with any server-generated fields populated.
        """

    @abstractmethod
    async def get_patient_history(
        self, patient_id: str, limit: int = 100
    ) -> List[BodyMapEntry]:
        """Retrieve body map entries for a patient.

        Args:
            patient_id: The patient's pseudonymized identifier.
            limit: Maximum number of entries to return. Defaults to ``100``.

        Returns:
            An ordered list of :class:`BodyMapEntry` objects.
        """


class AbstractTicketRepository(ABC):
    """Port: persistence contract for :class:`~src.domain.entities.Ticket` records."""

    @abstractmethod
    async def save(self, ticket: Ticket) -> Ticket:
        """Persist a support ticket.

        Args:
            ticket: The :class:`Ticket` to persist.

        Returns:
            The persisted ticket with any server-generated fields populated.
        """

    @abstractmethod
    async def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Retrieve a ticket by identifier.

        Args:
            ticket_id: The ticket's UUID string.

        Returns:
            The :class:`Ticket`, or ``None`` if not found.
        """

    @abstractmethod
    async def list_by_patient(self, patient_id: str) -> List[Ticket]:
        """List all tickets for a patient.

        Args:
            patient_id: The patient's pseudonymized identifier.

        Returns:
            A list of :class:`Ticket` objects, ordered by creation date descending.
        """

    @abstractmethod
    async def update_status(self, ticket_id: str, status: str) -> Ticket:
        """Update the lifecycle status of a ticket.

        Args:
            ticket_id: The ticket's UUID string.
            status: The new status string (e.g. ``"in_progress"``, ``"closed"``).

        Returns:
            The updated :class:`Ticket` entity.
        """


class AbstractSessionCache(ABC):
    """Port: cache contract for conversation session context (Redis-backed)."""

    @abstractmethod
    async def get_context(self, session_id: SessionId) -> Optional[dict]:
        """Retrieve the conversation context for a session.

        Args:
            session_id: The conversation session identifier.

        Returns:
            A dictionary of context data, or ``None`` if the session has expired.
        """

    @abstractmethod
    async def set_context(
        self, session_id: SessionId, context: dict, ttl_seconds: int = 86_400
    ) -> None:
        """Store or update the conversation context for a session.

        Args:
            session_id: The conversation session identifier.
            context: A JSON-serializable dictionary of context data.
            ttl_seconds: Time-to-live in seconds. Defaults to ``86400`` (24 hours).
        """

    @abstractmethod
    async def store_otp(
        self, phone: PhoneNumber, otp: str, ttl_seconds: int = 600
    ) -> None:
        """Store an OTP for a phone number with a TTL.

        Args:
            phone: The target phone number.
            otp: The 6-digit OTP string.
            ttl_seconds: Time-to-live in seconds. Defaults to ``600`` (10 minutes).
        """

    @abstractmethod
    async def verify_and_consume_otp(
        self, phone: PhoneNumber, otp: str
    ) -> bool:
        """Verify an OTP and consume it if valid (prevents replay attacks).

        Args:
            phone: The phone number the OTP was issued for.
            otp: The 6-digit OTP string submitted by the user.

        Returns:
            ``True`` if the OTP is valid and has been consumed, ``False`` otherwise.
        """


class AbstractDocumentRepository(ABC):
    """Port: persistence contract for :class:`~src.domain.entities.Document` records."""

    @abstractmethod
    async def save(self, document: Document) -> Document:
        """Persist a medical document.

        Args:
            document: The :class:`Document` to persist.

        Returns:
            The persisted document with any server-generated fields populated.
        """

    @abstractmethod
    async def get_by_id(self, document_id: str) -> Optional[Document]:
        """Retrieve a document by identifier.

        Args:
            document_id: The document's UUID string.

        Returns:
            The :class:`Document`, or ``None`` if not found.
        """

    @abstractmethod
    async def list_by_patient(self, patient_id: str) -> List[Document]:
        """List all documents for a patient.

        Args:
            patient_id: The patient's pseudonymized identifier.

        Returns:
            A list of :class:`Document` objects, ordered by creation date descending.
        """

