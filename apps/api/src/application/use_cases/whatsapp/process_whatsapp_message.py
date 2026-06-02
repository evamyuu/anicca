"""
Use case: ProcessWhatsAppMessageUseCase.

Orchestrates the full inbound WhatsApp message pipeline:
receive → identify patient → run Ani → respond via WhatsApp.

Module:    src.application.use_cases.whatsapp.process_whatsapp_message
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Optional

from src.domain.entities import ConversationMessage, MessageChannel
from src.domain.exceptions import PatientNotFoundError
from src.domain.repositories import (
    AbstractMessageRepository,
    AbstractPatientRepository,
    AbstractSessionCache,
)
from src.domain.value_objects import PhoneNumber, SessionId
from src.infrastructure.agents.graph.patient_graph import run_patient_agent
from src.infrastructure.whatsapp.whatsmia_client import whatsmia_client


@dataclass(frozen=True)
class WhatsAppInboundMessage:
    """Normalised representation of an inbound Whatsmiau webhook payload.

    Attributes:
        phone: Sender phone number in E.164 format.
        text: The message body text.
        whatsapp_message_id: Whatsmiau's message identifier for deduplication.
        media_url: Optional URL of an attached image or document.
    """

    phone: str
    text: str
    whatsapp_message_id: str
    media_url: Optional[str] = None


class ProcessWhatsAppMessageUseCase:
    """Processes an inbound WhatsApp message through the full Ani pipeline.

    Pipeline:
        1. Validate and identify the patient by phone number.
        2. Retrieve or create a session context from Redis.
        3. Run the Ani LangGraph orchestrator.
        4. Persist both messages to the database.
        5. Deliver the Ani response via Whatsmiau Cloud.

    Args:
        patient_repo: The patient repository implementation.
        message_repo: The message repository implementation.
        cache: The session/OTP cache implementation.
    """

    def __init__(
        self,
        patient_repo: AbstractPatientRepository,
        message_repo: AbstractMessageRepository,
        cache: AbstractSessionCache,
    ) -> None:
        self._patient_repo = patient_repo
        self._message_repo = message_repo
        self._cache = cache

    async def execute(self, inbound: WhatsAppInboundMessage) -> None:
        """Execute the inbound WhatsApp message pipeline.

        Args:
            inbound: See :class:`WhatsAppInboundMessage`.

        Raises:
            :class:`~src.domain.exceptions.PatientNotFoundError`: When the
                sender's phone number is not linked to any patient account.
        """
        phone = PhoneNumber(inbound.phone)
        patient = await self._patient_repo.get_by_phone(phone)

        if patient is None:
            await whatsmia_client.send_text(
                to=phone.value,
                text=(
                    "🐱 Olá! Sou a *Ani*, sua companheira oncológica.\n\n"
                    "Para usar o Anicca pelo WhatsApp, você precisa primeiro "
                    "criar sua conta no app. Baixe em: https://anicca.app"
                ),
            )
            raise PatientNotFoundError(phone.value)

        session_key = SessionId(patient.id)
        context = await self._cache.get_context(session_key)

        if context is None:
            context = {
                "patient_id": patient.id,
                "cancer_type": patient.cancer_type,
                "cancer_stage": patient.cancer_stage,
                "treatment_modality": patient.treatment_modality.value,
                "treatment_types": patient.treatment_types,
                "journey_phase": patient.journey_phase,
                "ani_personality": patient.ani_personality.value,
            }
            await self._cache.set_context(session_key, context)

        history = await self._message_repo.get_session_history(session_key, limit=20)
        history_dicts = [
            {"role": m.role if m.role == "user" else "assistant", "content": m.text}
            for m in history
        ]

        now = datetime.now(tz=timezone.utc)
        user_msg = ConversationMessage(
            id=str(uuid.uuid4()),
            session_id=session_key.value,
            patient_id=patient.id,
            role="user",
            text=inbound.text,
            channel=MessageChannel.WHATSAPP,
            cards=[],
            agents_invoked=[],
            created_at=now,
        )
        await self._message_repo.save(user_msg)

        ani_result = await run_patient_agent(
            user_message=inbound.text,
            session_history=history_dicts,
            patient_context=context,
            personality=context.get("ani_personality", "default"),
            media_url=inbound.media_url,
        )

        cards = ani_result.get("cards", [])
        ani_msg = ConversationMessage(
            id=str(uuid.uuid4()),
            session_id=session_key.value,
            patient_id=patient.id,
            role="ani",
            text=ani_result["response_text"],
            channel=MessageChannel.WHATSAPP,
            cards=cards,
            agents_invoked=ani_result.get("agents_invoked", []),
            created_at=datetime.now(tz=timezone.utc),
        )
        await self._message_repo.save(ani_msg)

        if cards:
            for card in cards:
                if card.get("type") == "button_group":
                    await whatsmia_client.send_buttons(
                        to=phone.value,
                        text=ani_result["response_text"],
                        buttons=card.get("buttons", [])[:3]
                    )
                    break
                elif card.get("type") == "list":
                    await whatsmia_client.send_list(
                        to=phone.value,
                        text=ani_result["response_text"],
                        button_text=card.get("button_text", "Opções"),
                        sections=card.get("sections", [])
                    )
                    break
        else:
            await whatsmia_client.send_text(
                to=phone.value,
                text=ani_result["response_text"],
            )

