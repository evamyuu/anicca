"""
Notification deduplication to prevent duplicate push/WhatsApp events.

Before sending any notification, check this store. If a notification of the
same type was sent to the same channel for the same user within the TTL window,
suppress the duplicate.

Module:    src.infrastructure.cache.notification_dedup
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import redis.asyncio as aioredis

_DEDUP_TTL = 3_600
_DEDUP_PREFIX = "notif:"


class NotificationDedup:
    """Redis-backed notification deduplication guard.

    Args:
        client: An active :class:`redis.asyncio.Redis` client.
    """

    def __init__(self, client: aioredis.Redis) -> None:
        self._client = client

    def _key(self, user_id: str, event_type: str, channel: str) -> str:
        """Compose the dedup key.

        Args:
            user_id: The Anicca user UUID.
            event_type: Event name (e.g. ``"body_map_updated"``).
            channel: Notification channel (e.g. ``"whatsapp"``, ``"push"``).

        Returns:
            A namespaced Redis key string.
        """
        return f"{_DEDUP_PREFIX}{user_id}:{event_type}:{channel}"

    async def should_send(
        self, user_id: str, event_type: str, channel: str
    ) -> bool:
        """Check if a notification should be sent (not a duplicate).

        If this returns ``True``, the caller MUST call :meth:`mark_sent`
        immediately after sending to register the dedup record.

        Args:
            user_id: The Anicca user UUID.
            event_type: Event name.
            channel: Notification channel.

        Returns:
            ``True`` if the notification has NOT been sent recently.
        """
        key = self._key(user_id, event_type, channel)
        existing = await self._client.get(key)
        return existing is None

    async def mark_sent(
        self, user_id: str, event_type: str, channel: str, ttl: int = _DEDUP_TTL
    ) -> None:
        """Register that a notification was sent, blocking duplicates for TTL seconds.

        Args:
            user_id: The Anicca user UUID.
            event_type: Event name.
            channel: Notification channel.
            ttl: How long (in seconds) to suppress duplicates. Defaults to 3600.
        """
        key = self._key(user_id, event_type, channel)
        await self._client.setex(key, ttl, "1")
