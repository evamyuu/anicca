"""
Messages router: Ani conversation session and message endpoints.

Module:    src.presentation.routers.messages_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.dto.messages import SendMessageInput, StartSessionInput
from src.application.use_cases.messages.send_message import (
    SendMessageUseCase,
    StartSessionUseCase,
)
from src.infrastructure.cache.redis_client import RedisSessionCache, create_redis_client
from src.infrastructure.database.session import get_db_session
from src.infrastructure.repositories import SQLMessageRepository, SQLPatientRepository
from src.presentation.middleware.auth import get_current_patient_id
from src.presentation.schemas import (
    MessageSchema,
    SendMessageResponseSchema,
    SendMessageSchema,
    StartSessionResponseSchema,
)
from src.domain.value_objects import SessionId

router = APIRouter()


@router.post(
    "/session",
    response_model=StartSessionResponseSchema,
    summary="Start a new Ani conversation session",
)
async def start_session(
    patient_id: Annotated[str, Depends(get_current_patient_id)],
    db: AsyncSession = Depends(get_db_session),
) -> StartSessionResponseSchema:
    """Create a new conversation session and seed its Redis context.

    Args:
        patient_id: Extracted from the JWT bearer token by
            :func:`~src.presentation.middleware.auth.get_current_patient_id`.
        db: Injected async database session.

    Returns:
        See :class:`~src.presentation.schemas.StartSessionResponseSchema`.
    """
    redis = await create_redis_client()
    cache = RedisSessionCache(redis)
    patient_repo = SQLPatientRepository(db)

    result = await StartSessionUseCase(
        patient_repo=patient_repo, cache=cache
    ).execute(StartSessionInput(patient_id=patient_id))

    return StartSessionResponseSchema(session_id=result.session_id)


@router.post(
    "",
    response_model=SendMessageResponseSchema,
    summary="Send a message to Ani",
)
async def send_message(
    body: SendMessageSchema,
    patient_id: Annotated[str, Depends(get_current_patient_id)],
    db: AsyncSession = Depends(get_db_session),
) -> SendMessageResponseSchema:
    """Send a user message and receive the Ani response.

    Args:
        body: See :class:`~src.presentation.schemas.SendMessageSchema`.
        patient_id: Extracted from the JWT bearer token.
        db: Injected async database session.

    Returns:
        See :class:`~src.presentation.schemas.SendMessageResponseSchema`.
    """
    redis = await create_redis_client()
    cache = RedisSessionCache(redis)
    message_repo = SQLMessageRepository(db)
    patient_repo = SQLPatientRepository(db)

    result = await SendMessageUseCase(
        message_repo=message_repo,
        patient_repo=patient_repo,
        cache=cache,
    ).execute(
        SendMessageInput(
            patient_id=patient_id,
            session_id=body.session_id,
            text=body.text,
            channel=body.channel,
            document_url=body.document_url,
        )
    )

    def _to_schema(dto) -> MessageSchema:
        return MessageSchema(
            id=dto.id,
            session_id=dto.session_id,
            role=dto.role,
            text=dto.text,
            cards=dto.cards,
            channel=dto.channel,
            agents_invoked=dto.agents_invoked,
            created_at=dto.created_at,
        )

    return SendMessageResponseSchema(
        user_message=_to_schema(result.user_message),
        ani_response=_to_schema(result.ani_response),
        session_id=result.session_id,
    )


@router.get(
    "/session/{session_id}",
    response_model=List[MessageSchema],
    summary="Retrieve conversation history",
)
async def get_session_history(
    session_id: str,
    patient_id: Annotated[str, Depends(get_current_patient_id)],
    db: AsyncSession = Depends(get_db_session),
) -> List[MessageSchema]:
    """Retrieve the ordered message history for a conversation session.

    Args:
        session_id: The session UUID path parameter.
        patient_id: Extracted from the JWT bearer token.
        db: Injected async database session.

    Returns:
        An ordered list of :class:`~src.presentation.schemas.MessageSchema`.
    """
    message_repo = SQLMessageRepository(db)
    history = await message_repo.get_session_history(SessionId(session_id))

    return [
        MessageSchema(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            text=m.text,
            cards=m.cards,
            channel=m.channel.value,
            agents_invoked=m.agents_invoked,
            created_at=m.created_at.isoformat(),
        )
        for m in history
    ]
