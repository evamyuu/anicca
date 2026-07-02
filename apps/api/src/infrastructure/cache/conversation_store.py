"""
Canal-agnostic conversation context store backed by Redis.

The conversation key is ``conversation:{user_id}``, NOT phone number or device ID.
This is the foundation of the Hub Sync: a session started on WhatsApp continues
in the app, and vice versa, with full context preserved.

Module:    src.infrastructure.cache.conversation_store
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import json
from typing import Optional

import redis.asyncio as aioredis

from src.config import settings

_CONV_PREFIX = "conversation:"
_CONV_TTL = 86_400 * 7


def _conv_key(user_id: str) -> str:
    """Compose the Redis key for a user's cross-channel conversation context.

    Args:
        user_id: The Anicca user UUID.

    Returns:
        A namespaced Redis key string.
    """
    return f"{_CONV_PREFIX}{user_id}"


class ConversationStore:
    """Manages cross-channel conversation context in Redis.

    A single user_id maps to one conversation regardless of whether the
    message came from WhatsApp, the mobile app, or the web portal.

    Args:
        client: An active :class:`redis.asyncio.Redis` client.
    """

    def __init__(self, client: aioredis.Redis) -> None:
        self._client = client

    async def get_context(self, user_id: str) -> Optional[dict]:
        """Retrieve the full conversation context for a user.

        Args:
            user_id: The Anicca user UUID.

        Returns:
            The deserialized context dict, or ``None`` if not found.
        """
        raw = await self._client.get(_conv_key(user_id))
        if raw is None:
            return None
        return json.loads(raw)

    async def set_context(self, user_id: str, context: dict) -> None:
        """Store or overwrite the full conversation context for a user.

        Args:
            user_id: The Anicca user UUID.
            context: A JSON-serializable context dictionary.
        """
        await self._client.setex(
            _conv_key(user_id),
            _CONV_TTL,
            json.dumps(context, default=str),
        )

    async def merge_turn(
        self,
        user_id: str,
        role: str,
        text: str,
        channel: str,
        extra: Optional[dict] = None,
    ) -> dict:
        """Append a new conversation turn to the context and return the updated context.

        Args:
            user_id: The Anicca user UUID.
            role: Message author — ``"user"`` or ``"ani"``.
            text: Message body text.
            channel: Originating channel — ``"whatsapp"``, ``"app"``, or ``"web"``.
            extra: Optional extra fields to merge into the turn dict.

        Returns:
            The updated context dictionary.
        """
        context = await self.get_context(user_id) or {"history": [], "patient_context": {}}
        turn = {"role": role, "content": text, "channel": channel}
        if extra:
            turn.update(extra)
        context["history"] = context.get("history", [])[-19:] + [turn]
        context["last_channel"] = channel
        await self.set_context(user_id, context)
        return context

    async def set_patient_context(self, user_id: str, patient_context: dict) -> None:
        """Store the patient profile context within the conversation.

        Args:
            user_id: The Anicca user UUID.
            patient_context: Patient profile fields (cancer_type, modality, phase).
        """
        context = await self.get_context(user_id) or {"history": [], "patient_context": {}}
        context["patient_context"] = patient_context
        await self.set_context(user_id, context)

    async def get_history(self, user_id: str) -> list[dict]:
        """Return only the conversation history list for a user.

        Args:
            user_id: The Anicca user UUID.

        Returns:
            A list of ``{role, content, channel}`` turn dicts, or empty list.
        """
        context = await self.get_context(user_id)
        if context is None:
            return []
        return context.get("history", [])
