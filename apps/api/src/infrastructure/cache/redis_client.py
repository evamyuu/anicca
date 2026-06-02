"""
Redis-backed session and OTP cache implementation.

Module:    src.infrastructure.cache.redis_client
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import json
import secrets
from typing import Optional

import redis.asyncio as aioredis

from src.config import settings
from src.domain.repositories import AbstractSessionCache
from src.domain.value_objects import PhoneNumber, SessionId

_OTP_KEY_PREFIX = "otp:"
_SESSION_KEY_PREFIX = "session:"


def _otp_key(phone: PhoneNumber) -> str:
    """Compose the Redis key for a phone number's OTP.

    Args:
        phone: The target phone number.

    Returns:
        A namespaced Redis key string.
    """
    return f"{_OTP_KEY_PREFIX}{phone.value}"


def _session_key(session_id: SessionId) -> str:
    """Compose the Redis key for a conversation session context.

    Args:
        session_id: The conversation session identifier.

    Returns:
        A namespaced Redis key string.
    """
    return f"{_SESSION_KEY_PREFIX}{session_id.value}"


class RedisSessionCache(AbstractSessionCache):
    """Redis implementation of :class:`~src.domain.repositories.AbstractSessionCache`.

    Args:
        client: An active :class:`redis.asyncio.Redis` client instance.
    """

    def __init__(self, client: aioredis.Redis) -> None:
        self._client = client

    async def get_context(self, session_id: SessionId) -> Optional[dict]:
        """Retrieve the conversation context for a session.

        Args:
            session_id: The conversation session identifier.

        Returns:
            The deserialized context dictionary, or ``None`` if the key has expired.
        """
        raw = await self._client.get(_session_key(session_id))
        if raw is None:
            return None
        return json.loads(raw)

    async def set_context(
        self, session_id: SessionId, context: dict, ttl_seconds: int = 86_400
    ) -> None:
        """Store or update the conversation context for a session.

        Args:
            session_id: The conversation session identifier.
            context: A JSON-serializable context dictionary.
            ttl_seconds: Time-to-live in seconds. Defaults to ``86400``.
        """
        await self._client.setex(
            _session_key(session_id),
            ttl_seconds,
            json.dumps(context, default=str),
        )

    async def store_otp(
        self, phone: PhoneNumber, otp: str, ttl_seconds: int = 600
    ) -> None:
        """Store an OTP with a TTL, overwriting any existing value.

        Args:
            phone: The target phone number.
            otp: The 6-digit OTP string.
            ttl_seconds: Time-to-live in seconds. Defaults to ``600``.
        """
        await self._client.setex(_otp_key(phone), ttl_seconds, otp)

    async def verify_and_consume_otp(
        self, phone: PhoneNumber, otp: str
    ) -> bool:
        """Verify an OTP and atomically delete it to prevent replay attacks.

        Args:
            phone: The phone number the OTP was issued for.
            otp: The 6-digit OTP string submitted by the user.

        Returns:
            ``True`` if the OTP matched and was consumed. ``False`` if the
            key does not exist or the value does not match.
        """
        key = _otp_key(phone)
        stored = await self._client.get(key)
        if stored is None or stored.decode() != otp:
            return False
        await self._client.delete(key)
        return True


async def create_redis_client() -> aioredis.Redis:
    """Create and return an async Redis client connected to the configured URL.

    Returns:
        A connected :class:`redis.asyncio.Redis` instance.
    """
    return await aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=False,
    )


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP.

    Returns:
        A 6-character string of decimal digits, zero-padded.
    """
    return str(secrets.randbelow(1_000_000)).zfill(6)
