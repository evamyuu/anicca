"""
Use cases: SendMessageUseCase and StartSessionUseCase.

Module:    src.application.use_cases.messages
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from src.application.dto.messages import (
    MessageDTO,
    SendMessageInput,
    SendMessageOutput,
    StartSessionInput,
    StartSessionOutput,
)
from src.domain.entities import ConversationMessage, MessageChannel
from src.domain.repositories import (
    AbstractMessageRepository,
    AbstractPatientRepository,
    AbstractSessionCache,
)
from src.domain.value_objects import SessionId
from src.infrastructure.agents.graph.patient_graph import run_patient_agent


class StartSessionUseCase:
    """Creates a new conversation session and initializes its Redis context.

    Args:
        patient_repo: The patient repository implementation.
        cache: The session/OTP cache implementation.
    """

    def __init__(
        self,
        patient_repo: AbstractPatientRepository,
        cache: AbstractSessionCache,
    ) -> None:
        self._patient_repo = patient_repo
        self._cache = cache

    async def execute(self, input_dto: StartSessionInput) -> StartSessionOutput:
        """Create a new session and seed its Redis context from the patient record.

        Args:
            input_dto: See :class:`~src.application.dto.messages.StartSessionInput`.

        Returns:
            See :class:`~src.application.dto.messages.StartSessionOutput`.
        """
        session_id = SessionId(str(uuid.uuid4()))
        patient = await self._patient_repo.get_by_id(input_dto.patient_id)

        context: dict = {}
        if patient:
            context = {
                "patient_id": patient.id,
                "cancer_type": patient.cancer_type,
                "cancer_stage": patient.cancer_stage,
                "treatment_modality": patient.treatment_modality.value,
                "treatment_types": patient.treatment_types,
                "journey_phase": patient.journey_phase,
                "ani_personality": patient.ani_personality.value,
            }

        await self._cache.set_context(session_id, context)
        return StartSessionOutput(session_id=session_id.value)


class SendMessageUseCase:
    """Persists a user message, invokes the Ani orchestrator, and persists the response.

    Args:
        message_repo: The message repository implementation.
        patient_repo: The patient repository implementation.
        cache: The session/OTP cache implementation.
    """

    def __init__(
        self,
        message_repo: AbstractMessageRepository,
        patient_repo: AbstractPatientRepository,
        cache: AbstractSessionCache,
    ) -> None:
        self._message_repo = message_repo
        self._patient_repo = patient_repo
        self._cache = cache

    async def execute(self, input_dto: SendMessageInput) -> SendMessageOutput:
        """Process a user message through the Ani pipeline and return the response.

        Args:
            input_dto: See :class:`~src.application.dto.messages.SendMessageInput`.

        Returns:
            See :class:`~src.application.dto.messages.SendMessageOutput`.
        """
        session_id = SessionId(input_dto.session_id)
        now = datetime.now(tz=timezone.utc)

        user_msg = ConversationMessage(
            id=str(uuid.uuid4()),
            session_id=session_id.value,
            patient_id=input_dto.patient_id,
            role="user",
            text=input_dto.text,
            channel=MessageChannel(input_dto.channel),
            cards=[],
            agents_invoked=[],
            created_at=now,
        )
        await self._message_repo.save(user_msg)

        context = await self._cache.get_context(session_id) or {}
        history = await self._message_repo.get_session_history(session_id, limit=20)

        history_dicts = [
            {"role": m.role if m.role == "user" else "assistant", "content": m.text}
            for m in history
            if m.id != user_msg.id
        ]

        ani_result = await run_patient_agent(
            user_message=input_dto.text,
            session_history=history_dicts,
            patient_context=context,
            personality=context.get("ani_personality", "default"),
        )

        ani_msg = ConversationMessage(
            id=str(uuid.uuid4()),
            session_id=session_id.value,
            patient_id=input_dto.patient_id,
            role="ani",
            text=ani_result["response_text"],
            channel=MessageChannel(input_dto.channel),
            cards=ani_result.get("cards", []),
            agents_invoked=ani_result.get("agents_invoked", []),
            created_at=datetime.now(tz=timezone.utc),
        )
        await self._message_repo.save(ani_msg)

        updated_context = {**context, "last_session_id": session_id.value}
        await self._cache.set_context(session_id, updated_context)

        return SendMessageOutput(
            user_message=MessageDTO(
                id=user_msg.id,
                session_id=user_msg.session_id,
                role=user_msg.role,
                text=user_msg.text,
                cards=[],
                channel=user_msg.channel.value,
                agents_invoked=[],
                created_at=user_msg.created_at.isoformat(),
            ),
            ani_response=MessageDTO(
                id=ani_msg.id,
                session_id=ani_msg.session_id,
                role=ani_msg.role,
                text=ani_msg.text,
                cards=ani_msg.cards,
                channel=ani_msg.channel.value,
                agents_invoked=ani_msg.agents_invoked,
                created_at=ani_msg.created_at.isoformat(),
            ),
            session_id=session_id.value,
        )
