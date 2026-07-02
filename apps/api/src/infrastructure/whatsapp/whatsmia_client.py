"""
Whatsmiau Cloud HTTP client for WhatsApp message delivery.

Encapsulates all outbound API calls to https://whatsmiau.dev and provides
HMAC-SHA256 webhook signature verification for inbound requests.

Module:    src.infrastructure.whatsapp.whatsmia_client
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import hmac
import hashlib
import httpx

from src.config import settings


class WhatsmiaClient:
    """HTTP client for the Whatsmiau Cloud API.

    Provides typed methods for each supported outbound message type and a
    HMAC-SHA256 signature verifier for inbound webhook requests.

    Attributes:
        base_url: The Whatsmiau Cloud API base URL.
        token: The bearer token for API authentication.
        instance_id: The WhatsApp instance identifier on Whatsmiau.
        headers: Pre-built authorization headers shared across all requests.

    See Also:
        https://whatsmiau.dev/docs
    """

    def __init__(self) -> None:
        self.base_url = settings.WHATSMIAU_API_BASE
        self.token = settings.WHATSMIAU_TOKEN
        self.instance_id = settings.WHATSMIAU_INSTANCE_ID
        self.headers = {
            "apikey": self.token,
            "Content-Type": "application/json",
        }

    async def send_text(self, to: str, text: str, preview_url: bool = False) -> dict:
        """Send a plain-text WhatsApp message.

        Args:
            to: Destination phone number in E.164 format (e.g. ``"+5511999999999"``).
            text: Message body. Supports WhatsApp markdown: ``*bold*``,
                ``_italic_``, ``~strikethrough~``, `` ```monospace``` ``).
            preview_url: When ``True``, Whatsmiau generates a URL link preview.

        Returns:
            The Whatsmiau API response payload as a dictionary.

        Raises:
            httpx.HTTPStatusError: On a non-2xx HTTP response.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/message/sendText/{self.instance_id}",
                headers=self.headers,
                json={
                    "number": to.replace("+", ""),
                    "text": text,
                },
            )
            response.raise_for_status()
            return response.json()

    async def send_buttons(self, to: str, text: str, buttons: list[dict]) -> dict:
        """Send an interactive button message.

        Args:
            to: Destination phone number in E.164 format.
            text: Message body displayed above the buttons.
            buttons: List of button descriptors. Each must have ``id`` and ``text``
                keys. Maximum of 3 buttons; each ``text`` must be ≤ 20 characters.

        Returns:
            The Whatsmiau API response payload as a dictionary.

        Raises:
            httpx.HTTPStatusError: On a non-2xx HTTP response.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/message/sendButtons/{self.instance_id}",
                headers=self.headers,
                json={
                    "number": to.replace("+", ""),
                    "buttonMessage": {
                        "text": text,
                        "footer": "Anicca",
                        "buttons": [{"type": "reply", "reply": {"id": b.get("id"), "title": b.get("text")}} for b in buttons]
                    }
                },
            )
            response.raise_for_status()
            return response.json()

    async def send_list(
        self, to: str, text: str, button_text: str, sections: list[dict]
    ) -> dict:
        """Send an interactive list message.

        Args:
            to: Destination phone number in E.164 format.
            text: Message body displayed above the list button.
            button_text: Label for the button that opens the list.
            sections: List of section descriptors, each containing a ``title``
                and a ``rows`` array of ``{id, title, description}`` objects.

        Returns:
            The Whatsmiau API response payload as a dictionary.

        Raises:
            httpx.HTTPStatusError: On a non-2xx HTTP response.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/message/sendList/{self.instance_id}",
                headers=self.headers,
                json={
                    "number": to.replace("+", ""),
                    "listMessage": {
                        "title": "Anicca",
                        "description": text,
                        "buttonText": button_text,
                        "sections": sections
                    }
                },
            )
            response.raise_for_status()
            return response.json()

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify the HMAC-SHA256 signature of an inbound Whatsmiau webhook request.

        Args:
            payload: The raw request body bytes.
            signature: The value of the ``X-Whatsmiau-Signature`` header,
                expected in the format ``sha256=<hex_digest>``.

        Returns:
            ``True`` if the signature is valid, ``False`` otherwise.
        """
        expected = hmac.new(
            settings.WHATSMIAU_WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(f"sha256={expected}", signature)


whatsmia_client = WhatsmiaClient()
"""Module-level singleton instance of :class:`WhatsmiaClient`."""
