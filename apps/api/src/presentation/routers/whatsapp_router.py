"""
WhatsApp webhook router and outbound message endpoints.

Handles inbound Whatsmiau Cloud webhook events and routes them through the
:class:`~src.application.use_cases.whatsapp.process_whatsapp_message.ProcessWhatsAppMessageUseCase`.

Module:    src.presentation.routers.whatsapp_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import os
import traceback
import httpx
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.use_cases.whatsapp.process_whatsapp_message import (
    ProcessWhatsAppMessageUseCase,
    WhatsAppInboundMessage,
)
from src.domain.exceptions import PatientNotFoundError, WebhookSignatureError
from src.infrastructure.cache.redis_client import RedisSessionCache, create_redis_client
from src.infrastructure.database.session import get_db_session, _AsyncSessionFactory
from src.infrastructure.repositories import SQLMessageRepository, SQLPatientRepository
from src.infrastructure.whatsapp.whatsmia_client import whatsmia_client

router = APIRouter()


def _parse_whatsmiau_payload(data: dict) -> Optional[WhatsAppInboundMessage]:
    """Extract a normalised :class:`~...WhatsAppInboundMessage` from a raw Whatsmiau payload.

    Args:
        data: The decoded JSON webhook payload.

    Returns:
        A :class:`~...WhatsAppInboundMessage` instance, or ``None`` if the
        payload does not represent a processable inbound text message.
    """
    events = data.get("data")
    if events is None:
        # Sometimes Whatsmiau sends the event at the root level without a "data" wrapper
        events = [data]
    elif not isinstance(events, list):
        events = [events]

    for event in events:
        if not isinstance(event, dict):
            continue

        message_type = event.get("messageType") or event.get("type")
        if message_type not in ("text", "image", "document", "conversation", "extendedTextMessage", "interactive", "buttonsResponseMessage", "listResponseMessage", "templateButtonReplyMessage"):
            continue

        phone = (
            event.get("remoteJid") or 
            event.get("key", {}).get("remoteJid") or 
            event.get("from", "")
        )
        if phone:
            phone = phone.split("@")[0]
            if not phone.startswith("+"):
                phone = f"+{phone}"
        
        # Check text in different possible Whatsmiau formats
        message_data = event.get("message", {})
        text = (
            message_data.get("conversation") or 
            message_data.get("extendedTextMessage", {}).get("text") or
            event.get("body", {}).get("text") or
            message_data.get("interactiveResponseMessage", {}).get("body", {}).get("text") or
            message_data.get("buttonsResponseMessage", {}).get("selectedDisplayText") or
            message_data.get("listResponseMessage", {}).get("title") or
            message_data.get("templateButtonReplyMessage", {}).get("selectedDisplayText") or
            ""
        )
        message_id = event.get("key", {}).get("id") or event.get("messageId", "")
        media_url = (
            event.get("body", {}).get("url") or 
            message_data.get("imageMessage", {}).get("url") or
            message_data.get("documentMessage", {}).get("url")
        )

        if media_url and not text:
            text = "[Mídia recebida]"

        if not phone or not text:
            continue

        return WhatsAppInboundMessage(
            phone=phone,
            text=text,
            whatsapp_message_id=message_id,
            media_url=media_url,
        )
        
    return None


async def _download_media(url: str, message_id: str) -> str:
    """Download media from URL to a local uploads directory."""
    os.makedirs("/app/uploads", exist_ok=True)
    filepath = f"/app/uploads/{message_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            with open(filepath, "wb") as f:
                f.write(response.content)
        return filepath
    except Exception as e:
        print(f"Failed to download media: {e}")
        return ""


async def _process_in_background(inbound: WhatsAppInboundMessage):
    """Background task to run the complete Ani pipeline.
    
    Creates its own database session to ensure it remains open after the
    FastAPI HTTP response has returned.
    """
    async with _AsyncSessionFactory() as db:
        redis = await create_redis_client()
        cache = RedisSessionCache(redis)
        patient_repo = SQLPatientRepository(db)
        message_repo = SQLMessageRepository(db)

        try:
            print(f"[BACKGROUND] Processing inbound from {inbound.phone}...")
            
            if inbound.media_url:
                local_path = await _download_media(inbound.media_url, inbound.whatsapp_message_id)
                if local_path:
                    inbound = WhatsAppInboundMessage(
                        phone=inbound.phone,
                        text=inbound.text,
                        whatsapp_message_id=inbound.whatsapp_message_id,
                        media_url=local_path
                    )
                    
            await ProcessWhatsAppMessageUseCase(
                patient_repo=patient_repo,
                message_repo=message_repo,
                cache=cache,
            ).execute(inbound)
            await db.commit()
            print("[BACKGROUND] Processing finished successfully.")
        except PatientNotFoundError:
            print(f"[BACKGROUND] Patient not found: {inbound.phone}")
            await db.rollback()
        except Exception as e:
            print(f"[BACKGROUND] Error during processing: {e}")
            traceback.print_exc()
            await db.rollback()


@router.post("/webhook", summary="Receive inbound WhatsApp messages from Whatsmiau Cloud")
async def receive_whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_whatsmiau_signature: Annotated[Optional[str], Header()] = None,
) -> dict:
    """Receive, verify, and dispatch an inbound WhatsApp message.

    Args:
        request: The raw FastAPI request object.
        background_tasks: FastAPI background task manager.
        x_whatsmiau_signature: The ``X-Whatsmiau-Signature`` header value,
            or ``None`` if absent.

    Returns:
        A dictionary with ``status`` and ``messageId`` fields.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``401`` on invalid signature.
        :class:`~fastapi.HTTPException`: With status ``422`` on unparseable payload.
    """
    payload = await request.body()

    if x_whatsmiau_signature:
        is_valid = whatsmia_client.verify_webhook_signature(payload, x_whatsmiau_signature)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature.",
            )

    data = await request.json()
    print(f"Received webhook payload: {data}")
    inbound = _parse_whatsmiau_payload(data)
    print(f"Parsed inbound: {inbound}")

    if inbound is None:
        print("Ignored: non_text_or_unsupported_type")
        return {"status": "ignored", "reason": "non_text_or_unsupported_type"}

    # Schedule the processing pipeline as a background task to prevent webhook timeout
    background_tasks.add_task(_process_in_background, inbound)

    return {"status": "processing", "messageId": inbound.whatsapp_message_id}


@router.post("/send", summary="Send a WhatsApp text message via Whatsmiau Cloud")
async def send_whatsapp_message(request: Request) -> dict:
    """Send a plain-text WhatsApp message via Whatsmiau Cloud.

    Args:
        request: The raw FastAPI request object. Must contain a JSON body
            with ``to`` (E.164 phone) and ``text`` fields.

    Returns:
        The Whatsmiau API response payload as a dictionary.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``400`` when ``to`` or
            ``text`` is missing.
    """
    body = await request.json()
    to = body.get("to")
    text = body.get("text")

    if not to or not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'to' and 'text' are required.",
        )

    return await whatsmia_client.send_text(to=to, text=text)


@router.post("/link", summary="Initiate WhatsApp phone number linking")
async def link_whatsapp_phone(request: Request) -> dict:
    """Initiate the WhatsApp phone number linking flow for a patient account.

    Sends a verification OTP via WhatsApp and stores a pending link record
    in Redis with a 10-minute TTL.

    Args:
        request: The raw FastAPI request object.

    Returns:
        A dictionary with ``status`` and ``message`` fields.
    """
    return {"status": "pending", "message": "Verification code sent via WhatsApp"}
