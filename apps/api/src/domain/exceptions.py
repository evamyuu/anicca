"""
Domain exception hierarchy for the Anicca application.

All exceptions inherit from :class:`AniccaDomainError`, which allows callers
to catch domain violations distinctly from infrastructure or framework errors.

Module:    src.domain.exceptions
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""


class AniccaDomainError(Exception):
    """Base class for all Anicca domain exceptions."""


class PatientNotFoundError(AniccaDomainError):
    """Raised when a patient record cannot be located by the given identifier."""

    def __init__(self, patient_id: str) -> None:
        super().__init__(f"Patient '{patient_id}' not found.")
        self.patient_id = patient_id


class SessionNotFoundError(AniccaDomainError):
    """Raised when a conversation session cannot be located."""

    def __init__(self, session_id: str) -> None:
        super().__init__(f"Session '{session_id}' not found.")
        self.session_id = session_id


class InvalidOTPError(AniccaDomainError):
    """Raised when a provided OTP does not match the stored value or has expired."""


class OTPExpiredError(AniccaDomainError):
    """Raised when an OTP is structurally valid but its TTL has elapsed."""


class ConsentNotGrantedError(AniccaDomainError):
    """Raised when a data operation requires consent that has not been granted.

    Attributes:
        consent_type: The consent type that is missing (e.g. ``"health_data"``).
    """

    def __init__(self, consent_type: str) -> None:
        super().__init__(
            f"Operation requires '{consent_type}' consent, which has not been granted."
        )
        self.consent_type = consent_type


class WebhookSignatureError(AniccaDomainError):
    """Raised when an inbound webhook request fails HMAC signature verification."""


class DocumentNotFoundError(AniccaDomainError):
    """Raised when a medical document cannot be located by the given identifier."""

    def __init__(self, document_id: str) -> None:
        super().__init__(f"Document '{document_id}' not found.")
        self.document_id = document_id


class TicketNotFoundError(AniccaDomainError):
    """Raised when a support ticket cannot be located by the given identifier."""

    def __init__(self, ticket_id: str) -> None:
        super().__init__(f"Ticket '{ticket_id}' not found.")
        self.ticket_id = ticket_id


class PhoneAlreadyLinkedError(AniccaDomainError):
    """Raised when a WhatsApp phone number is already linked to another account."""

    def __init__(self, phone: str) -> None:
        super().__init__(f"Phone '{phone}' is already linked to an existing account.")
        self.phone = phone
