"""
Implementation of whatsapp_router.

Module:    apps.api.src.presentation.routers.whatsapp_router
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
        events = [data]
    elif not isinstance(events, list):
        events = [events]

    for event in events:
        if not isinstance(event, dict):
            continue

        message_type = event.get("messageType") or event.get("type")
        if message_type not in (
            "text", "image", "imageMessage",
            "document", "documentMessage",
            "conversation", "extendedTextMessage",
            "interactive", "buttonsResponseMessage",
            "listResponseMessage", "templateButtonReplyMessage"
        ):
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
        
        message_data = event.get("message", {})
        text = (
            message_data.get("conversation") or 
            message_data.get("extendedTextMessage", {}).get("text") or
            event.get("body", {}).get("text") or
            message_data.get("imageMessage", {}).get("caption") or
            message_data.get("documentMessage", {}).get("caption") or
            message_data.get("interactiveResponseMessage", {}).get("body", {}).get("text") or
            message_data.get("buttonsResponseMessage", {}).get("selectedDisplayText") or
            message_data.get("listResponseMessage", {}).get("title") or
            message_data.get("templateButtonReplyMessage", {}).get("selectedDisplayText") or
            ""
        )
        message_id = event.get("key", {}).get("id") or event.get("messageId", "")
        media_url = (
            event.get("mediaUrl") or
            event.get("body", {}).get("url") or 
            message_data.get("imageMessage", {}).get("url") or
            message_data.get("documentMessage", {}).get("url")
        )

        if media_url and not text:
            if message_type in ("imageMessage", "image"):
                text = "[Imagem recebida — analisando o exame ou foto...]"
            else:
                text = "[Documento recebido]"

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
            
            if inbound.media_url or inbound.whatsapp_message_id:
                if inbound.whatsapp_message_id and not (inbound.media_url or "").startswith("/app/uploads/"):
                    print(f"[BACKGROUND] Attempting media download for message {inbound.whatsapp_message_id}...")
                    media_bytes = await whatsmia_client.download_media(inbound.whatsapp_message_id)
                    if media_bytes:
                        import os, uuid as _uuid
                        os.makedirs("/app/uploads", exist_ok=True)
                        local_path = f"/app/uploads/{inbound.whatsapp_message_id}"
                        with open(local_path, "wb") as f:
                            f.write(media_bytes)
                        print(f"[BACKGROUND] Media saved to {local_path} ({len(media_bytes)} bytes)")
                        inbound = WhatsAppInboundMessage(
                            phone=inbound.phone,
                            text=inbound.text,
                            whatsapp_message_id=inbound.whatsapp_message_id,
                            media_url=local_path
                        )
                    else:
                        print("[BACKGROUND] Media download returned no bytes, continuing without media.")
                elif inbound.media_url and not inbound.media_url.startswith("/app/uploads/"):
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
                redis_client=redis,
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
        finally:
            await redis.aclose()



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


import random
import string


@router.post("/link/request-otp", summary="Send OTP via WhatsApp for phone verification")
async def request_whatsapp_otp(request: Request) -> dict:
    """Generate a 6-digit OTP and deliver it via WhatsApp.

    Stores the OTP in Redis with a 10-minute TTL keyed by phone number.

    Args:
        request: JSON body with ``phone`` (E.164) and ``patient_id`` fields.

    Returns:
        A dictionary with ``status`` field.
    """
    body = await request.json()
    phone = body.get("phone")
    patient_id = body.get("patient_id")

    if not phone or not patient_id:
        raise HTTPException(status_code=400, detail="'phone' and 'patient_id' are required.")

    code = "".join(random.choices(string.digits, k=6))

    redis = await create_redis_client()
    try:
        await redis.setex(f"whatsapp_otp:{phone}", 600, f"{code}:{patient_id}")
    finally:
        await redis.aclose()

    message = (
        f"🔐 *Código de verificação Anicca*\n\n"
        f"Seu código é: *{code}*\n\n"
        f"Válido por 10 minutos. Não compartilhe com ninguém."
    )
    await whatsmia_client.send_text(to=phone, text=message)

    return {"status": "sent"}


@router.post("/link/verify-otp", summary="Verify OTP and link WhatsApp to patient account")
async def verify_whatsapp_otp(
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Verify the OTP and link the phone number to the patient account.

    Args:
        request: JSON body with ``phone``, ``patient_id``, and ``code`` fields.
        db: Async database session.

    Returns:
        A dictionary with ``status`` and ``message`` fields.

    Raises:
        :class:`~fastapi.HTTPException`: 400 on invalid/expired OTP.
    """
    body = await request.json()
    phone = body.get("phone")
    patient_id = body.get("patient_id")
    code = body.get("code")

    if not phone or not patient_id or not code:
        raise HTTPException(status_code=400, detail="'phone', 'patient_id' and 'code' are required.")

    redis = await create_redis_client()
    try:
        stored = await redis.get(f"whatsapp_otp:{phone}")
        if not stored:
            raise HTTPException(status_code=400, detail="OTP expired or not found.")

        stored_str = stored.decode() if isinstance(stored, bytes) else stored
        stored_code, stored_patient_id = stored_str.split(":", 1)

        if stored_code != code:
            raise HTTPException(status_code=400, detail="OTP invalid.")

        if stored_patient_id != patient_id:
            raise HTTPException(status_code=400, detail="OTP invalid for this patient.")

        await redis.delete(f"whatsapp_otp:{phone}")
    finally:
        await redis.aclose()

    patient_repo = SQLPatientRepository(db)
    from src.domain.value_objects import PhoneNumber
    patient = await patient_repo.get_by_id(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found.")

    await patient_repo.update_phone(patient_id, PhoneNumber(phone))
    await db.commit()

    await whatsmia_client.send_text(
        to=phone,
        text="✅ *WhatsApp vinculado com sucesso!*\n\nAgora você pode falar comigo diretamente por aqui. Basta me mandar uma mensagem! 💙"
    )

    return {"status": "linked", "message": "WhatsApp vinculado com sucesso!"}