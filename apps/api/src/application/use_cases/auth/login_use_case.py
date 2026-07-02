"""
Traditional Email/Password Login Use Case.

Module:    src.application.use_cases.auth.login_use_case
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from typing import Optional

from passlib.context import CryptContext
from sqlalchemy import select

from src.application.dto.auth import LoginInput, TokenResult
from src.infrastructure.database.models import UserModel
from src.infrastructure.security.jwt import create_access_token
from src.domain.exceptions import UnauthorizedError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginUseCase:
    """Validates user credentials and issues a JWT token."""

    def __init__(self, db_session) -> None:
        self._db = db_session

    async def execute(self, params: LoginInput) -> TokenResult:
        """Execute the login validation.

        Args:
            params: Login credentials.

        Returns:
            The issued access token.

        Raises:
            UnauthorizedError: If credentials are wrong.
        """
        # Fetch the user by email
        result = await self._db.execute(
            select(UserModel).where(UserModel.email == params.email)
        )
        user = result.scalars().first()

        if not user or not user.hashed_password:
            raise UnauthorizedError("E-mail ou senha incorretos.")

        # Verify password hash
        if not pwd_context.verify(params.password, user.hashed_password):
            raise UnauthorizedError("E-mail ou senha incorretos.")

        # Generate JWT
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role, "patient_id": str(user.patient_id) if user.patient_id else None}
        )

        return TokenResult(
            access_token=access_token,
            token_type="bearer",
            is_new_user=False,
            patient_id=str(user.patient_id) if user.patient_id else None
        )
