"""
Use case: VerifyOTPUseCase — validates an OTP and issues a JWT.

Module:    src.application.use_cases.auth.verify_otp
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from jose import jwt

from src.application.dto.auth import VerifyOTPInput, TokenResult
from src.config import settings
from src.domain.entities import AniPersonality, Patient, TreatmentModality
from src.domain.exceptions import InvalidOTPError
from src.domain.repositories import AbstractPatientRepository, AbstractSessionCache
from src.domain.value_objects import OTPCode, PhoneNumber

_JWT_ALGORITHM = "HS256"
_TOKEN_EXPIRE_DAYS = 30


class VerifyOTPUseCase:
    """Verifies a one-time password and returns a signed JWT bearer token.

    If the phone number is new, a skeleton patient record is created.
    The OTP is consumed atomically to prevent replay attacks.

    Args:
        patient_repo: The patient repository implementation.
        cache: The session/OTP cache implementation.
    """

    def __init__(
        self,
        patient_repo: AbstractPatientRepository,
        cache: AbstractSessionCache,
    ) -> None:
        self._patient_repo = patient_repo
        self._cache = cache

    async def execute(self, input_dto: VerifyOTPInput) -> TokenResult:
        """Execute the OTP verification flow.

        Args:
            input_dto: See :class:`~src.application.dto.auth.VerifyOTPInput`.

        Returns:
            See :class:`~src.application.dto.auth.TokenResult`.

        Raises:
            ValueError: When the phone or OTP format is invalid.
            :class:`~src.domain.exceptions.InvalidOTPError`: When the OTP is
                incorrect or has expired.
        """
        phone = PhoneNumber(input_dto.phone)
        OTPCode(input_dto.otp)

        is_valid = await self._cache.verify_and_consume_otp(phone, input_dto.otp)
        if not is_valid:
            raise InvalidOTPError("OTP is invalid or has expired.")

        is_new_user = not await self._patient_repo.exists_by_phone(phone)

        if is_new_user:
            patient = await self._patient_repo.save(
                Patient(
                    id=str(uuid.uuid4()),
                    name="",
                    date_of_birth="",
                    cpf_hash=None,
                    cancer_type="",
                    cancer_stage="",
                    treatment_modality=TreatmentModality.SUS,
                    treatment_types=[],
                    journey_phase="diagnosis",
                    diagnosis_date=None,
                    ani_personality=AniPersonality.MENTOR,
                    whatsapp_phone=phone.value,
                    created_at=datetime.now(tz=timezone.utc),
                    updated_at=datetime.now(tz=timezone.utc),
                )
            )
        else:
            patient = await self._patient_repo.get_by_phone(phone)

        expire = datetime.now(tz=timezone.utc) + timedelta(days=_TOKEN_EXPIRE_DAYS)
        token = jwt.encode(
            {"sub": patient.id, "exp": expire, "type": "access"},
            settings.SECRET_KEY,
            algorithm=_JWT_ALGORITHM,
        )

        return TokenResult(
            access_token=token,
            token_type="bearer",
            is_new_user=is_new_user,
            patient_id=patient.id,
        )
