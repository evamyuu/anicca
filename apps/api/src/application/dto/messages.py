"""
Data Transfer Objects for the message (Ani conversation) use cases.

Module:    src.application.dto.messages
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from dataclasses import dataclass, field
from typing import List


@dataclass(frozen=True)
class StartSessionInput:
    """Input DTO for :class:`~src.application.use_cases.messages.StartSessionUseCase`.

    Attributes:
        patient_id: The authenticated patient's identifier.
    """

    patient_id: str


@dataclass(frozen=True)
class StartSessionOutput:
    """Output DTO for :class:`~src.application.use_cases.messages.StartSessionUseCase`.

    Attributes:
        session_id: The newly created conversation session identifier.
    """

    session_id: str


@dataclass(frozen=True)
class SendMessageInput:
    """Input DTO for :class:`~src.application.use_cases.messages.SendMessageUseCase`.

    Attributes:
        patient_id: The authenticated patient's identifier.
        session_id: The active conversation session identifier.
        text: The user's message text.
        channel: The originating channel (``"app"``, ``"web"``, or ``"whatsapp"``).
        document_url: Optional URL of an uploaded document for OCR analysis.
    """

    patient_id: str
    session_id: str
    text: str
    channel: str = "app"
    document_url: str | None = None


@dataclass
class MessageDTO:
    """Serializable representation of a single conversation message.

    Attributes:
        id: The message UUID.
        session_id: The session this message belongs to.
        role: The message author — ``"user"`` or ``"ani"``.
        text: The message text content.
        cards: GenUI card payloads attached to the message.
        channel: The delivery channel.
        agents_invoked: LangGraph agents that contributed to this response.
        created_at: ISO 8601 creation timestamp.
    """

    id: str
    session_id: str
    role: str
    text: str
    cards: List[dict] = field(default_factory=list)
    channel: str = "app"
    agents_invoked: List[str] = field(default_factory=list)
    created_at: str = ""


@dataclass
class SendMessageOutput:
    """Output DTO for :class:`~src.application.use_cases.messages.SendMessageUseCase`.

    Attributes:
        user_message: The persisted user message.
        ani_response: The Ani response message.
        session_id: The active session identifier.
    """

    user_message: MessageDTO
    ani_response: MessageDTO
    session_id: str
