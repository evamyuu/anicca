"""
Pydantic request and response schemas for the Auth and Messages endpoints.

Module:    src.presentation.schemas
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator
import re


_E164_RE = re.compile(r"^\+[1-9]\d{7,14}$")


class RequestOTPSchema(BaseModel):
    """Request body for ``POST /api/v1/auth/otp/request``.

    Attributes:
        phone: Patient phone number in E.164 format.
    """

    phone: str = Field(
        ...,
        description="Patient phone number in E.164 format (e.g. +5511999999999)",
        examples=["+5511999999999"],
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate that the phone number is E.164 format.

        Args:
            v: The raw phone string.

        Returns:
            The validated phone string.

        Raises:
            ValueError: When the format is not E.164.
        """
        if not _E164_RE.match(v):
            raise ValueError("Phone must be in E.164 format (e.g. +5511999999999)")
        return v


class RequestOTPResponseSchema(BaseModel):
    """Response for ``POST /api/v1/auth/otp/request``.

    Attributes:
        sent: ``True`` if the OTP was dispatched via WhatsApp.
        masked_phone: Partially masked phone number for display.
    """

    sent: bool
    masked_phone: str


class VerifyOTPSchema(BaseModel):
    """Request body for ``POST /api/v1/auth/otp/verify``.

    Attributes:
        phone: Patient phone number in E.164 format.
        otp: The 6-digit one-time password.
    """

    phone: str = Field(..., examples=["+5511999999999"])
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", examples=["123456"])


class TokenResponseSchema(BaseModel):
    """Response for ``POST /api/v1/auth/otp/verify``.

    Attributes:
        access_token: Signed JWT bearer token.
        token_type: Always ``"bearer"``.
        is_new_user: ``True`` on first authentication.
        patient_id: Optional[str] = Field(None, description="Linked patient UUID")
    """

    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
    patient_id: Optional[str] = Field(None, description="Linked patient UUID")


class LoginRequestSchema(BaseModel):
    """Schema for traditional email/password login request."""
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class RegisterRequestSchema(BaseModel):
    """Schema for traditional user registration."""
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="Desired password")
    phone: Optional[str] = Field(None, description="Optional WhatsApp phone number")
    role: str = Field(default="patient", description="User role: patient, caregiver, doctor")
    crm_number: Optional[str] = Field(None, description="Required if role is doctor")



class StartSessionResponseSchema(BaseModel):
    """Response for ``POST /api/v1/messages/session``.

    Attributes:
        session_id: The newly created session identifier.
    """

    session_id: str


class SendMessageSchema(BaseModel):
    """Request body for ``POST /api/v1/messages``.

    Attributes:
        session_id: The active conversation session identifier.
        text: The user's message text.
        channel: The originating channel.
        document_url: Optional URL of an uploaded document for OCR analysis.
    """

    session_id: str
    text: str = Field(..., min_length=1, max_length=4096)
    channel: str = Field(default="app", pattern=r"^(app|web|whatsapp)$")
    document_url: Optional[str] = None


class MessageSchema(BaseModel):
    """Serialized representation of a single conversation message.

    Attributes:
        id: The message UUID.
        session_id: The session identifier.
        role: The message author — ``"user"`` or ``"ani"``.
        text: The message text content.
        cards: GenUI card payloads.
        channel: The delivery channel.
        agents_invoked: LangGraph agent names.
        created_at: ISO 8601 creation timestamp.
    """

    id: str
    session_id: str
    role: str
    text: str
    cards: List[dict] = []
    channel: str = "app"
    agents_invoked: List[str] = []
    created_at: str


class SendMessageResponseSchema(BaseModel):
    """Response for ``POST /api/v1/messages``.

    Attributes:
        user_message: The persisted user message.
        ani_response: The Ani response message.
        session_id: The active session identifier.
    """

    user_message: MessageSchema
    ani_response: MessageSchema
    session_id: str
