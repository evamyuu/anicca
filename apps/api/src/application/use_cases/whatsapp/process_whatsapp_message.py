"""
Use case: ProcessWhatsAppMessageUseCase.

Orchestrates the full inbound WhatsApp message pipeline:
receive → identify patient → run Ani → respond with buttons → publish SSE event.

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
from src.infrastructure.agents.nodes.catalog_agent import publish_catalog_event
from src.infrastructure.whatsapp.whatsmia_client import whatsmia_client
from src.application.use_cases.documents.process_document_use_case import ProcessDocumentUseCase


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


_WELCOME_MESSAGE = (
    "🐱 Olá! Sou a *Ani*, sua companheira oncológica.\n\n"
    "Para usar o Anicca pelo WhatsApp, você precisa primeiro "
    "criar sua conta no app. Baixe em: https://anicca.app"
)

_WELCOME_BUTTONS = [
    {"id": "download_app", "text": "Baixar o app"},
    {"id": "learn_more", "text": "Saber mais"},
]


class ProcessWhatsAppMessageUseCase:
    """Processes an inbound WhatsApp message through the full Ani pipeline.

    Pipeline:
        1. Validate and identify the patient by phone number.
        2. Retrieve or create a session context from Redis (canal-agnostic).
        3. Run the Ani LangGraph orchestrator (supervisor → specialist → synthesizer → catalog).
        4. Persist both messages to the database.
        5. Deliver the Ani response via Whatsmiau — always with interactive buttons.
        6. Publish any catalog event to Redis pub/sub for SSE streaming to the app.

    Args:
        patient_repo: The patient repository implementation.
        message_repo: The message repository implementation.
        cache: The session/OTP cache implementation.
        redis_client: Active Redis client for pub/sub event publishing.
    """

    def __init__(
        self,
        patient_repo: AbstractPatientRepository,
        message_repo: AbstractMessageRepository,
        cache: AbstractSessionCache,
        redis_client=None,
    ) -> None:
        self._patient_repo = patient_repo
        self._message_repo = message_repo
        self._cache = cache
        self._redis = redis_client

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
            await whatsmia_client.send_text(to=phone.value, text=_WELCOME_MESSAGE)
            try:
                await whatsmia_client.send_buttons(
                    to=phone.value,
                    text="O que você gostaria de fazer?",
                    buttons=_WELCOME_BUTTONS,
                )
            except Exception:
                pass
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

        # Se houver arquivo anexo (recebido do WhatsApp Router)
        extracted_ocr_text = ""
        if inbound.media_url and inbound.media_url.startswith("/app/uploads/"):
            try:
                import os
                import mimetypes
                
                filepath = inbound.media_url
                content_type = mimetypes.guess_type(filepath)[0] or "application/octet-stream"
                with open(filepath, "rb") as f:
                    file_bytes = f.read()

                # Usa a infraestrutura real do banco, repassando o redis pub/sub para sincronizar
                doc_uc = ProcessDocumentUseCase(db_session=self._patient_repo._session, redis_client=self._redis)
                doc_result = await doc_uc.execute(
                    file_bytes=file_bytes,
                    content_type=content_type,
                    patient_id=patient.id,
                    source_channel="whatsapp",
                    filename=os.path.basename(filepath)
                )
                
                # Resumo simplificado vai pro LLM entender do que se trata sem reler a imagem
                extracted_ocr_text = f" [A paciente enviou um exame/documento via WhatsApp. O sistema extraiu o seguinte resumo: '{doc_result.summary}'. A principal descoberta é: '{doc_result.key_finding}']."
                
            except Exception as ocr_exc:
                print(f"[ProcessWhatsApp] Erro ao extrair documento via OCR Textract: {ocr_exc}")

        # Roda a IA do LangGraph com a mensagem original + Resumo do OCR (se existir)
        user_message_to_llm = inbound.text + extracted_ocr_text

        ani_result = await run_patient_agent(
            user_message=user_message_to_llm,
            session_history=history_dicts,
            patient_context=context,
            personality=context.get("ani_personality", "default"),
            media_url=inbound.media_url,
            user_id=patient.id,
        )

        cards = ani_result.get("cards", [])
        whatsapp_buttons = ani_result.get("whatsapp_buttons")
        whatsapp_list_sections = ani_result.get("whatsapp_list_sections")
        catalog_event = ani_result.get("catalog_event")

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

        await self._deliver_whatsapp_response(
            phone=phone.value,
            text=ani_result["response_text"],
            buttons=whatsapp_buttons,
            list_sections=whatsapp_list_sections,
        )

        if catalog_event and self._redis:
            await publish_catalog_event(
                redis_client=self._redis,
                user_id=patient.id,
                event_type=catalog_event["type"],
                payload={
                    "summary": catalog_event.get("summary", ""),
                    "channel": "whatsapp",
                },
            )

    async def _deliver_whatsapp_response(
        self,
        phone: str,
        text: str,
        buttons: Optional[list],
        list_sections: Optional[list],
    ) -> None:
        """Deliver the Ani response via Whatsmiau with interactive elements.

        Priority: list sections > buttons > plain text.

        Args:
            phone: Destination phone in E.164 format.
            text: Message body text.
            buttons: Optional list of ``{id, text}`` button dicts (max 3).
            list_sections: Optional list of WhatsApp list section dicts.
        """
        try:
            if list_sections:
                formatted_sections = []
                for s in list_sections:
                    rows = [
                        {"id": r.get("id", ""), "title": r.get("title", "")[:24], "description": r.get("description", "")[:72]}
                        for r in s.get("rows", [])[:10]
                    ]
                    formatted_sections.append({"title": s.get("title", ""), "rows": rows})
                await whatsmia_client.send_list(
                    to=phone,
                    text=text,
                    button_text="Ver opções",
                    sections=formatted_sections,
                )
            elif buttons:
                formatted_buttons = [
                    {"id": b.get("id", ""), "text": b.get("text", "")[:20]}
                    for b in buttons[:3]
                ]
                await whatsmia_client.send_buttons(
                    to=phone,
                    text=text,
                    buttons=formatted_buttons,
                )
            else:
                await whatsmia_client.send_text(to=phone, text=text)
        except Exception as exc:
            print(f"[WhatsApp delivery error] {exc} — falling back to send_text")
            try:
                await whatsmia_client.send_text(to=phone, text=text)
            except Exception as fallback_exc:
                print(f"[WhatsApp fallback also failed] {fallback_exc}")
