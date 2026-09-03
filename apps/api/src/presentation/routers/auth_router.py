"""
Implementation of auth_router.

Module:    apps.api.src.presentation.routers.auth_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.dto.auth import RequestOTPInput, VerifyOTPInput
from src.application.use_cases.auth.request_otp import RequestOTPUseCase
from src.application.use_cases.auth.verify_otp import VerifyOTPUseCase
from src.domain.exceptions import InvalidOTPError
from src.infrastructure.cache.redis_client import RedisSessionCache, create_redis_client
from src.infrastructure.database.session import get_db_session
from src.infrastructure.repositories import SQLPatientRepository
from src.presentation.schemas import (
    RequestOTPResponseSchema,
    RequestOTPSchema,
    TokenResponseSchema,
    VerifyOTPSchema,
    LoginRequestSchema,
    RegisterRequestSchema,
)
from src.application.dto.auth import LoginInput, RegisterInput
from src.application.use_cases.auth.login_use_case import LoginUseCase
from src.application.use_cases.auth.register_use_case import RegisterUseCase
from src.application.use_cases.auth.google_login_use_case import GoogleLoginUseCase, GoogleLoginInput
from src.domain.exceptions import UnauthorizedError, DomainError
from pydantic import BaseModel, Field

class GoogleLoginRequestSchema(BaseModel):
    id_token: str = Field(..., description="Google ID Token")

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponseSchema,
    summary="Login using email and password",
)
async def login(
    body: LoginRequestSchema,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponseSchema:
    """Authenticates a user via Email/Password."""
    try:
        result = await LoginUseCase(db_session=db).execute(
            LoginInput(email=body.email, password=body.password)
        )
    except UnauthorizedError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
        
    return TokenResponseSchema(
        access_token=result.access_token,
        token_type=result.token_type,
        is_new_user=result.is_new_user,
        patient_id=result.patient_id,
    )
@router.post(
    "/google",
    response_model=TokenResponseSchema,
    summary="Login with Google ID Token",
)
async def login_with_google(
    body: GoogleLoginRequestSchema,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponseSchema:
    """Authenticates a user via Google Sign-In."""
    try:
        result = await GoogleLoginUseCase(db_session=db).execute(
            GoogleLoginInput(token=body.id_token)
        )
    except UnauthorizedError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
        
    return TokenResponseSchema(
        access_token=result.access_token,
        token_type=result.token_type,
        is_new_user=result.is_new_user,
        patient_id=result.patient_id,
    )


@router.post(
    "/register",
    response_model=TokenResponseSchema,
    summary="Register a new user via email and password",
)
async def register(
    body: RegisterRequestSchema,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponseSchema:
    """Registers a new user and creates an empty patient profile."""
    try:
        result = await RegisterUseCase(db_session=db).execute(
            RegisterInput(
                email=body.email, 
                password=body.password, 
                phone=body.phone,
                role=body.role,
                crm_number=body.crm_number,
                date_of_birth=body.date_of_birth,
                patient_link_code=body.patient_link_code,
                cancer_type=body.cancer_type,
                journey_phase=body.journey_phase,
                treatment_modality=body.treatment_modality,
                ani_personality=body.ani_personality,
                avatar_config=body.avatar_config,
                consents=body.consents
            )
        )
    except DomainError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
        
    return TokenResponseSchema(
        access_token=result.access_token,
        token_type=result.token_type,
        is_new_user=result.is_new_user,
        patient_id=result.patient_id,
    )


@router.post(
    "/otp/request",
    response_model=RequestOTPResponseSchema,
    summary="Request a WhatsApp OTP",
)
async def request_otp(
    body: RequestOTPSchema,
    db: AsyncSession = Depends(get_db_session),
) -> RequestOTPResponseSchema:
    """Dispatch a 6-digit OTP to the patient's WhatsApp number.

    Args:
        body: See :class:`~src.presentation.schemas.RequestOTPSchema`.
        db: Injected async database session.

    Returns:
        See :class:`~src.presentation.schemas.RequestOTPResponseSchema`.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``400`` on invalid phone format.
    """
    redis = await create_redis_client()
    cache = RedisSessionCache(redis)

    try:
        result = await RequestOTPUseCase(cache=cache).execute(
            RequestOTPInput(phone=body.phone)
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return RequestOTPResponseSchema(sent=result.sent, masked_phone=result.masked_phone)


@router.post(
    "/otp/verify",
    response_model=TokenResponseSchema,
    summary="Verify OTP and obtain a JWT",
)
async def verify_otp(
    body: VerifyOTPSchema,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponseSchema:
    """Verify the OTP and return a signed JWT bearer token.

    Args:
        body: See :class:`~src.presentation.schemas.VerifyOTPSchema`.
        db: Injected async database session.

    Returns:
        See :class:`~src.presentation.schemas.TokenResponseSchema`.

    Raises:
        :class:`~fastapi.HTTPException`: With status ``401`` when the OTP is
            invalid or expired.
    """
    redis = await create_redis_client()
    cache = RedisSessionCache(redis)
    patient_repo = SQLPatientRepository(db)

    try:
        result = await VerifyOTPUseCase(
            patient_repo=patient_repo, cache=cache
        ).execute(VerifyOTPInput(phone=body.phone, otp=body.otp))
    except InvalidOTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        )

    return TokenResponseSchema(
        access_token=result.access_token,
        token_type=result.token_type,
        is_new_user=result.is_new_user,
        patient_id=result.patient_id,
    )
@router.post(
    "/link-doctor",
    summary="Link a patient to a doctor using CRM",
)
async def link_doctor(
    patient_id: str,
    crm: str,
    db: AsyncSession = Depends(get_db_session),
):
    from sqlalchemy import select
    from src.infrastructure.database.models import UserModel, PatientModel, doctor_patients

    # Find doctor by CRM
    result = await db.execute(select(UserModel).where(UserModel.crm_number == crm, UserModel.role == "doctor"))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor with given CRM not found.")

    # Find patient
    result_p = await db.execute(select(PatientModel).where(PatientModel.id == patient_id))
    patient = result_p.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    # Insert into doctor_patients
    try:
        await db.execute(doctor_patients.insert().values(doctor_id=doctor.id, patient_id=patient.id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(e)
        # Assume already linked if unique constraint fails
        pass

    return {"message": "Doctor linked successfully"}


@router.post(
    "/link-caregiver",
    summary="Link a patient to a caregiver using email",
)
async def link_caregiver(
    patient_id: str,
    email: str,
    db: AsyncSession = Depends(get_db_session),
):
    from sqlalchemy import select
    from src.infrastructure.database.models import UserModel

    # Find caregiver by email
    result = await db.execute(select(UserModel).where(UserModel.email == email, UserModel.role == "caregiver"))
    caregiver = result.scalar_one_or_none()
    if not caregiver:
        raise HTTPException(status_code=404, detail="Caregiver with given email not found.")

    # Link them
    caregiver.patient_id = patient_id
    await db.commit()

    return {"message": "Caregiver linked successfully"}


@router.get("/caregivers/{patient_id}")
async def get_caregivers(patient_id: str, db: AsyncSession = Depends(get_db_session)):
    from sqlalchemy import select
    from src.infrastructure.database.models import UserModel
    result = await db.execute(select(UserModel).where(UserModel.patient_id == patient_id, UserModel.role == "caregiver"))
    caregivers = result.scalars().all()
    return [{"id": c.id, "name": c.name or "Cuidador", "email": c.email} for c in caregivers]

@router.get("/doctors/{patient_id}")
async def get_doctors(patient_id: str, db: AsyncSession = Depends(get_db_session)):
    from sqlalchemy import select
    from src.infrastructure.database.models import UserModel, doctor_patients
    stmt = select(UserModel).join(doctor_patients, UserModel.id == doctor_patients.c.doctor_id).where(doctor_patients.c.patient_id == patient_id)
    result = await db.execute(stmt)
    doctors = result.scalars().all()
    return [{"id": d.id, "name": d.name or "Médico", "crm": d.crm_number} for d in doctors]

@router.post("/unlink-caregiver")
async def unlink_caregiver(patient_id: str, caregiver_id: str, db: AsyncSession = Depends(get_db_session)):
    from sqlalchemy import select
    from src.infrastructure.database.models import UserModel
    result = await db.execute(select(UserModel).where(UserModel.id == caregiver_id, UserModel.patient_id == patient_id))
    caregiver = result.scalar_one_or_none()
    if caregiver:
        caregiver.patient_id = None
        await db.commit()
    return {"message": "Unlinked successfully"}

@router.post("/unlink-doctor")
async def unlink_doctor(patient_id: str, doctor_id: str, db: AsyncSession = Depends(get_db_session)):
    from src.infrastructure.database.models import doctor_patients
    stmt = doctor_patients.delete().where(doctor_patients.c.doctor_id == doctor_id, doctor_patients.c.patient_id == patient_id)
    await db.execute(stmt)
    await db.commit()
    return {"message": "Unlinked successfully"}

