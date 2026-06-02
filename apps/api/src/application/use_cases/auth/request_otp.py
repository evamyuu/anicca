"""
Use case: RequestOTPUseCase — initiates phone number authentication.

Module:    src.application.use_cases.auth.request_otp
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from src.application.dto.auth import RequestOTPInput, RequestOTPOutput
from src.domain.repositories import AbstractSessionCache
from src.domain.value_objects import PhoneNumber, OTPCode
from src.infrastructure.cache.redis_client import generate_otp
from src.infrastructure.whatsapp.whatsmia_client import whatsmia_client


class RequestOTPUseCase:
    """Generates a 6-digit OTP, caches it in Redis, and delivers it via WhatsApp.

    The OTP expires after 10 minutes. A new invocation for the same phone
    number overwrites the previous OTP.

    Args:
        cache: The session/OTP cache implementation.
    """

    _OTP_TTL_SECONDS = 600
    _OTP_MESSAGE_TEMPLATE = (
        "🐱 *Anicca* — Seu código de acesso é: *{otp}*\n\n"
        "Este código expira em 10 minutos. Não o compartilhe com ninguém."
    )

    def __init__(self, cache: AbstractSessionCache) -> None:
        self._cache = cache

    async def execute(self, input_dto: RequestOTPInput) -> RequestOTPOutput:
        """Execute the OTP request flow.

        Args:
            input_dto: See :class:`~src.application.dto.auth.RequestOTPInput`.

        Returns:
            See :class:`~src.application.dto.auth.RequestOTPOutput`.

        Raises:
            ValueError: When the phone number is not a valid E.164 string.
        """
        phone = PhoneNumber(input_dto.phone)
        otp_value = generate_otp()
        OTPCode(otp_value)

        await self._cache.store_otp(phone, otp_value, ttl_seconds=self._OTP_TTL_SECONDS)

        await whatsmia_client.send_text(
            to=phone.value,
            text=self._OTP_MESSAGE_TEMPLATE.format(otp=otp_value),
        )

        masked = f"{phone.value[:3]}***{phone.value[-4:]}"
        return RequestOTPOutput(sent=True, masked_phone=masked)
