"""
Auth router: OTP request and verification endpoints.

Module:    src.presentation.routers.auth_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.dto.auth import RequestOTPInput, VerifyOTPInput
from src.application.use_cases.auth.request_otp import RequestOTPUseCase
from src.application.use_cases.auth.verify_otp import VerifyOTPUseCase
from src.domain.exceptions import InvalidOTPError
from src.infrastructure.cache.redis_client import RedisSessionCache, create_redis_client
from src.infrastructure.database.session import get_db_session
from src.infrastructure.repositories import SQLPatientRepository
from src.presentation.schemas import (
    RequestOTPResponseSchema,
    RequestOTPSchema,
    TokenResponseSchema,
    VerifyOTPSchema,
)

router = APIRouter()


@router.post(
    "/otp/request",
    response_model=RequestOTPResponseSchema,
    summary="Request a WhatsApp OTP",
)
async def request_otp(
    body: RequestOTPSchema,
    db: AsyncSession = Depends(get_db_session),
) -> RequestOTPResponseSchema:
    """Dispatch a 6-digit OTP to the patient's WhatsApp number.

    Args:
        body: See :class:`~src.presentation.schemas.RequestOTPSchema`.
        db: Injected async database session.

    Returns:
        See :class:`~src.presentation.schemas.RequestOTPResponseSchema`.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``400`` on invalid phone format.
    """
    redis = await create_redis_client()
    cache = RedisSessionCache(redis)

    try:
        result = await RequestOTPUseCase(cache=cache).execute(
            RequestOTPInput(phone=body.phone)
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return RequestOTPResponseSchema(sent=result.sent, masked_phone=result.masked_phone)


@router.post(
    "/otp/verify",
    response_model=TokenResponseSchema,
    summary="Verify OTP and obtain a JWT",
)
async def verify_otp(
    body: VerifyOTPSchema,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponseSchema:
    """Verify the OTP and return a signed JWT bearer token.

    Args:
        body: See :class:`~src.presentation.schemas.VerifyOTPSchema`.
        db: Injected async database session.

    Returns:
        See :class:`~src.presentation.schemas.TokenResponseSchema`.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``401`` when the OTP is
            invalid or expired.
    """
    redis = await create_redis_client()
    cache = RedisSessionCache(redis)
    patient_repo = SQLPatientRepository(db)

    try:
        result = await VerifyOTPUseCase(
            patient_repo=patient_repo, cache=cache
        ).execute(VerifyOTPInput(phone=body.phone, otp=body.otp))
    except InvalidOTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        )

    return TokenResponseSchema(
        access_token=result.access_token,
        token_type=result.token_type,
        is_new_user=result.is_new_user,
        patient_id=result.patient_id,
    )
