"""
Use case: NotifyWhatsAppTriggerUseCase.

Triggered by the Hub Sync when an important action happens in the App
(e.g., Body Map symptom recorded). It proactively sends a WhatsApp message
to the patient to keep the conversation flowing across channels, provided
they haven't received a duplicate notification recently.

Module:    src.application.use_cases.whatsapp.notify_whatsapp_trigger
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from typing import Optional

from src.infrastructure.database.models import PatientModel
from src.infrastructure.whatsapp.whatsmia_client import whatsmia_client
from src.infrastructure.cache.notification_dedup import NotificationDedup


class NotifyWhatsAppTriggerUseCase:
    """Proactively notifies a patient via WhatsApp about an action taken in the app."""

    def __init__(self, db_session, redis_client) -> None:
        self._db = db_session
        self._dedup = NotificationDedup(redis_client)

    async def execute_body_map_trigger(
        self, patient_id: str, intensity: int, symptom_types: list[str]
    ) -> None:
        """Trigger a proactive WhatsApp message when a body map is saved in the app.

        Args:
            patient_id: The Anicca patient UUID.
            intensity: The registered symptom intensity (0-10).
            symptom_types: List of symptom descriptions.
        """
        # 1. Deduplication check: prevent spamming the user if they log multiple times quickly
        if not await self._dedup.should_send(patient_id, "body_map_updated", "whatsapp"):
            return

        # 2. Get patient's phone
        patient = await self._db.get(PatientModel, patient_id)
        if not patient or not patient.phone:
            return

        # 3. Construct the contextual proactive message
        symptoms_str = ", ".join(symptom_types)
        if intensity >= 7:
            message = (
                f"🚨 Vi que você registrou dor forte no app ({symptoms_str}, intensidade {intensity}). "
                "Quer que eu te ajude a gerar um relatório rápido para o seu médico agora?"
            )
            buttons = [
                {"id": "gen_report", "text": "Gerar relatório"},
                {"id": "im_fine", "text": "Estou bem, obrigado"}
            ]
        else:
            message = (
                f"🐱 Vi que você registrou no app que está sentindo {symptoms_str}. "
                "Anotei tudo no seu histórico! Quer conversar um pouco sobre isso?"
            )
            buttons = [
                {"id": "chat_symptom", "text": "Quero conversar"},
                {"id": "ignore", "text": "Agora não"}
            ]

        # 4. Deliver via Whatsmiau
        try:
            await whatsmia_client.send_buttons(
                to=patient.phone,
                text=message,
                buttons=buttons
            )
            # 5. Mark as sent to prevent duplicates for 1 hour
            await self._dedup.mark_sent(patient_id, "body_map_updated", "whatsapp", ttl=3600)
        except Exception as e:
            print(f"[NotifyWhatsApp] Failed to trigger body_map message for {patient_id}: {e}")
