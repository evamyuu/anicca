"""
Data Transfer Objects for the authentication use cases.

DTOs are plain dataclasses that cross the application layer boundary.
They carry no business logic and are decoupled from both domain entities
and HTTP schemas.

Module:    src.application.dto.auth
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class RequestOTPInput:
    """Input DTO for :class:`~src.application.use_cases.auth.RequestOTPUseCase`.

    Attributes:
        phone: The patient's phone number in E.164 format.
    """

    phone: str


@dataclass(frozen=True)
class RequestOTPOutput:
    """Output DTO for :class:`~src.application.use_cases.auth.RequestOTPUseCase`.

    Attributes:
        sent: ``True`` if the OTP was dispatched via WhatsApp.
        masked_phone: The partially masked phone number for display.
    """

    sent: bool
    masked_phone: str


@dataclass(frozen=True)
class VerifyOTPInput:
    """Input DTO for :class:`~src.application.use_cases.auth.VerifyOTPUseCase`.

    Attributes:
        phone: The patient's phone number in E.164 format.
        otp: The 6-digit OTP entered by the user.
    """

    phone: str
    otp: str


@dataclass(frozen=True)
class TokenResult:
    """Output DTO for :class:`~src.application.use_cases.auth.VerifyOTPUseCase` and Logins.

    Attributes:
        access_token: A signed JWT bearer token.
        token_type: Always ``"bearer"``.
        is_new_user: ``True`` if this is the patient's first authentication.
        patient_id: The patient's server-assigned identifier.
    """

    access_token: str
    token_type: str
    is_new_user: bool
    patient_id: Optional[str] = None


@dataclass(frozen=True)
class LoginInput:
    """Input parameters for traditional login."""

    email: str
    password: str


@dataclass(frozen=True)
class RegisterInput:
    """Input parameters for user registration."""

    email: str
    password: str
    phone: Optional[str] = None
    role: str = "patient"
    crm_number: Optional[str] = None
