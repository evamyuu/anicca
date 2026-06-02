"""
Domain value objects: immutable primitives with built-in validation.

Value objects enforce business invariants at construction time so that
invalid states are impossible to represent anywhere in the application.

Module:    src.domain.value_objects
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import re
from dataclasses import dataclass


_E164_PATTERN = re.compile(r"^\+[1-9]\d{7,14}$")
_OTP_PATTERN = re.compile(r"^\d{6}$")


@dataclass(frozen=True)
class PhoneNumber:
    """A validated E.164-format telephone number.

    Attributes:
        value: The canonical E.164 string (e.g. ``"+5511999999999"``).

    Raises:
        ValueError: When ``value`` does not match the E.164 pattern.

    Example:
        >>> phone = PhoneNumber("+5511999999999")
        >>> phone.value
        '+5511999999999'
    """

    value: str

    def __post_init__(self) -> None:
        if not _E164_PATTERN.match(self.value):
            raise ValueError(
                f"'{self.value}' is not a valid E.164 phone number. "
                "Expected format: +[country code][number] (8–15 digits total)."
            )

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class OTPCode:
    """A validated 6-digit one-time password.

    Attributes:
        value: The 6-digit OTP string.

    Raises:
        ValueError: When ``value`` is not exactly 6 decimal digits.

    Example:
        >>> code = OTPCode("123456")
        >>> code.value
        '123456'
    """

    value: str

    def __post_init__(self) -> None:
        if not _OTP_PATTERN.match(self.value):
            raise ValueError(
                f"'{self.value}' is not a valid OTP. Expected exactly 6 decimal digits."
            )

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class SessionId:
    """A non-empty conversation session identifier.

    Attributes:
        value: The UUID string identifying the session.

    Raises:
        ValueError: When ``value`` is blank.
    """

    value: str

    def __post_init__(self) -> None:
        if not self.value or not self.value.strip():
            raise ValueError("SessionId value must not be blank.")

    def __str__(self) -> str:
        return self.value
