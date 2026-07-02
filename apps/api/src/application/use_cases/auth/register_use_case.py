"""
Traditional Email/Password Registration Use Case.

Module:    src.application.use_cases.auth.register_use_case
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from passlib.context import CryptContext
from sqlalchemy import select

from src.application.dto.auth import RegisterInput, TokenResult
from src.infrastructure.database.models import UserModel, PatientModel
from src.infrastructure.security.jwt import create_access_token
from src.domain.exceptions import DomainError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterUseCase:
    """Registers a new user and issues a JWT token."""

    def __init__(self, db_session) -> None:
        self._db = db_session

    async def execute(self, params: RegisterInput) -> TokenResult:
        """Registers a new user, creates a patient profile and returns a JWT.

        Args:
            params: Registration data (email, password, etc).

        Returns:
            The issued access token.

        Raises:
            DomainError: If email is already in use.
        """
        # 1. Check if email exists
        result = await self._db.execute(
            select(UserModel).where(UserModel.email == params.email)
        )
        if result.scalars().first():
            raise DomainError("Este e-mail já está em uso.")

        # 2. Hash password
        hashed_pw = pwd_context.hash(params.password)

        # 3. Create Patient Profile (Only if role is patient or caregiver)
        patient_id = None
        new_status = "active"
        
        if params.role == "doctor":
            if not params.crm_number:
                raise DomainError("Registro Médico (CRM) é obrigatório para contas médicas.")
            new_status = "pending_approval"
        else:
            # Usually onboarding will fill these up later.
            new_patient = PatientModel(
                name_encrypted="[Aguardando Onboarding]",
                date_of_birth="2000-01-01",
                cancer_type="TBD",
                cancer_stage="TBD",
                treatment_modality="TBD",
                journey_phase="onboarding",
                whatsapp_phone=params.phone if hasattr(params, "phone") else None
            )
            self._db.add(new_patient)
            await self._db.flush()
            patient_id = new_patient.id

        # 4. Create User
        new_user = UserModel(
            email=params.email,
            hashed_password=hashed_pw,
            role=params.role,
            status=new_status,
            crm_number=params.crm_number if params.role == "doctor" else None,
            patient_id=patient_id
        )
        self._db.add(new_user)
        await self._db.commit()

        # 5. Generate JWT
        access_token = create_access_token(
            data={"sub": str(new_user.id), "role": new_user.role, "status": new_status, "patient_id": str(patient_id) if patient_id else None}
        )

        return TokenResult(
            access_token=access_token,
            token_type="bearer",
            is_new_user=True,
            patient_id=str(patient_id) if patient_id else None
        )
