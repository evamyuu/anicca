"""
Implementation of google_login_use_case.

Module:    apps.api.src.application.use_cases.auth.google_login_use_case
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy import select

from src.application.dto.auth import TokenResult
from src.infrastructure.database.models import UserModel
from src.infrastructure.security.jwt import create_access_token
from src.domain.exceptions import UnauthorizedError
from src.config import settings

GOOGLE_CLIENT_ID = getattr(settings, "GOOGLE_CLIENT_ID", None)

class GoogleLoginInput:
    def __init__(self, token: str):
        self.token = token


class GoogleLoginUseCase:
    """Verifies a Google ID token and issues a JWT token."""

    def __init__(self, db_session) -> None:
        self._db = db_session

    async def execute(self, params: GoogleLoginInput) -> TokenResult:
        """Execute the google login validation.

        Args:
            params: Google token.

        Returns:
            The issued access token.

        Raises:
            UnauthorizedError: If the token is invalid.
        """
        try:
            idinfo = id_token.verify_oauth2_token(params.token, requests.Request(), GOOGLE_CLIENT_ID)

            email = idinfo.get('email')
            if not email:
                raise ValueError("Google token without email.")
            
        except ValueError as e:
            raise UnauthorizedError(f"Token do Google inválido: {str(e)}")

        result = await self._db.execute(
            select(UserModel).where(UserModel.email == email)
        )
        user = result.scalars().first()
        is_new_user = False

        if not user:
            user = UserModel(
                email=email,
                role="patient", # Default role
            )
            self._db.add(user)
            await self._db.commit()
            await self._db.refresh(user)
            is_new_user = True

        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role, "patient_id": str(user.patient_id) if user.patient_id else None}
        )

        return TokenResult(
            access_token=access_token,
            token_type="bearer",
            is_new_user=is_new_user,
            patient_id=str(user.patient_id) if user.patient_id else None
        )