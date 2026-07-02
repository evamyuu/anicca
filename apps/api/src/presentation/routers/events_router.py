"""
Server-Sent Events (SSE) endpoint for real-time app updates.

When a WhatsApp interaction triggers an event (document uploaded, body map
recorded, routine synced), the Catalog Agent publishes to Redis pub/sub channel
``events:{user_id}``. This endpoint subscribes and streams those events to the
React Native app in real time — no polling required.

Module:    src.presentation.routers.events_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from src.infrastructure.cache.redis_client import create_redis_client

router = APIRouter()

_EVENTS_CHANNEL_PREFIX = "events:"
_KEEPALIVE_INTERVAL = 15


async def _event_generator(user_id: str) -> AsyncGenerator[str, None]:
    """Subscribe to the user's Redis pub/sub channel and yield SSE frames.

    Args:
        user_id: The Anicca user UUID to subscribe for.

    Yields:
        SSE-formatted strings (``data: {...}\\n\\n``).
    """
    redis = await create_redis_client()
    pubsub = redis.pubsub()
    channel = f"{_EVENTS_CHANNEL_PREFIX}{user_id}"

    await pubsub.subscribe(channel)

    try:
        yield f"data: {json.dumps({'type': 'connected', 'user_id': user_id})}\n\n"

        keepalive_counter = 0
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)

            if message and message["type"] == "message":
                raw = message["data"]
                if isinstance(raw, bytes):
                    raw = raw.decode("utf-8")
                yield f"data: {raw}\n\n"
            else:
                keepalive_counter += 1
                if keepalive_counter >= _KEEPALIVE_INTERVAL:
                    keepalive_counter = 0
                    yield ": keepalive\n\n"
                await asyncio.sleep(1)
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
        await redis.aclose()


@router.get(
    "/stream/{user_id}",
    summary="Subscribe to real-time hub events for a user",
    response_description="SSE stream of hub events",
)
async def stream_events(
    user_id: str,
) -> StreamingResponse:
    """Stream Server-Sent Events for a given user's hub activity.

    Events are published by the Catalog Agent whenever a WhatsApp interaction
    triggers a data change (document added, body map updated, routine synced,
    journaling synced). The React Native app consumes this stream via
    ``useHubSync`` and invalidates the corresponding React Query caches.

    Args:
        user_id: The target user's Anicca UUID (path parameter).

    Returns:
        A :class:`~fastapi.responses.StreamingResponse` with
        ``Content-Type: text/event-stream``.

    Event types:
        - ``connected``: Emitted once on connection to confirm the stream is live.
        - ``document_added``: A new document was catalogued (WhatsApp or upload).
        - ``body_map_updated``: A body map entry was saved via any channel.
        - ``routine_synced``: A routine entry was recorded or updated.
        - ``journaling_synced``: A journaling entry was saved via any channel.
        - ``keepalive``: Periodic comment to prevent connection timeout (every 15s).
    """
    return StreamingResponse(
        _event_generator(user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
