"""
Implementation of register_use_case.

Module:    apps.api.src.application.use_cases.auth.register_use_case
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
        result = await self._db.execute(
            select(UserModel).where(UserModel.email == params.email)
        )
        if result.scalars().first():
            raise DomainError("Este e-mail já está em uso.")

        if params.phone:
            phone_check = await self._db.execute(
                select(PatientModel).where(PatientModel.whatsapp_phone == params.phone)
            )
            if phone_check.scalars().first():
                raise DomainError("Este número de telefone já está em uso.")


        hashed_pw = pwd_context.hash(params.password)

        patient_id = None
        new_status = "active"

        if params.role == "doctor":
            if not params.crm_number:
                raise DomainError("Registro Médico (CRM) é obrigatório para contas médicas.")
            new_status = "pending_approval"
        elif params.role == "patient":
            new_patient = PatientModel(
                name_encrypted="[Paciente Anonimizado]",  # Filled during onboarding or later
                date_of_birth=params.date_of_birth or "2000-01-01",
                cancer_type=params.cancer_type or "Não informado",
                cancer_stage=params.journey_phase or "Não informado",
                treatment_modality=params.treatment_modality or "Não informado",
                journey_phase=params.journey_phase or "onboarding",
                ani_personality=params.ani_personality or "default",
                whatsapp_phone=params.phone if hasattr(params, "phone") else None
            )
            self._db.add(new_patient)
            await self._db.flush()
            patient_id = new_patient.id
        elif params.role == "caregiver":
            patient_id = None

        new_user = UserModel(
            email=params.email,
            hashed_password=hashed_pw,
            role=params.role,
            status=new_status,
            crm_number=params.crm_number if params.role == "doctor" else None,
            patient_id=patient_id,
            avatar_config=params.avatar_config or {}
        )
        self._db.add(new_user)
        await self._db.flush()
        
        from src.infrastructure.database.models import ConsentModel
        if params.consents:
            for c_type, is_granted in params.consents.items():
                new_consent = ConsentModel(
                    user_id=new_user.id,
                    consent_type=c_type,
                    granted=is_granted
                )
                self._db.add(new_consent)
                
        await self._db.commit()

        access_token = create_access_token(
            data={"sub": str(new_user.id), "role": new_user.role, "status": new_status, "patient_id": str(patient_id) if patient_id else None}
        )

        return TokenResult(
            access_token=access_token,
            token_type="bearer",
            is_new_user=True,
            patient_id=str(patient_id) if patient_id else None
        )