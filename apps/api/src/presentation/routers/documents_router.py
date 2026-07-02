"""
Documents router — upload and retrieval of medical documents with OCR.

Module:    src.presentation.routers.documents_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.use_cases.documents.process_document_use_case import ProcessDocumentUseCase
from src.infrastructure.database.models import DocumentModel
from src.infrastructure.database.session import get_db_session
from src.infrastructure.cache.redis_client import create_redis_client

router = APIRouter()


class DocumentResponse(BaseModel):
    """Response schema for a medical document."""

    id: str
    patient_id: str
    document_type: str
    source_channel: str
    summary: str
    key_finding: Optional[str] = None
    ai_questions: List[str]
    file_url: str
    created_at: datetime


@router.post(
    "/upload",
    summary="Upload and OCR-process a medical document",
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    patient_id: str = Form(...),
    source_channel: str = Form(default="upload"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
) -> DocumentResponse:
    """Upload a medical document, extract text via OCR, and simplify with AI.

    After processing, publishes a ``document_added`` SSE event so the app
    updates the Meus Documentos screen in real time.

    Args:
        patient_id: The patient's Anicca UUID.
        source_channel: Origin — ``"upload"``, ``"camera"``, or ``"whatsapp"``.
        file: The uploaded file (JPEG, PNG, or PDF).
        db: Injected async database session.

    Returns:
        The created :class:`DocumentResponse` with AI-generated summary and questions.
    """
    allowed_types = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, PDF.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB.",
        )

    redis = None
    try:
        redis = await create_redis_client()
        use_case = ProcessDocumentUseCase(db_session=db, redis_client=redis)
        result = await use_case.execute(
            file_bytes=file_bytes,
            content_type=file.content_type,
            patient_id=patient_id,
            source_channel=source_channel,
            filename=file.filename,
        )
        await db.commit()
    finally:
        if redis:
            await redis.aclose()

    db_doc = await db.get(DocumentModel, result.document_id)

    return DocumentResponse(
        id=result.document_id,
        patient_id=patient_id,
        document_type=result.document_type,
        source_channel=source_channel,
        summary=result.summary,
        key_finding=result.key_finding,
        ai_questions=result.questions_for_doctor,
        file_url=db_doc.file_url if db_doc else "",
        created_at=db_doc.created_at if db_doc else datetime.utcnow(),
    )


@router.get(
    "/{patient_id}",
    summary="List all documents for a patient",
)
async def list_documents(
    patient_id: str,
    document_type: Optional[str] = None,
    source_channel: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
) -> List[DocumentResponse]:
    """Return all medical documents for a patient, optionally filtered.

    Args:
        patient_id: The patient's Anicca UUID.
        document_type: Optional filter by document type.
        source_channel: Optional filter by origin channel.
        limit: Maximum number of documents to return.
        db: Injected async database session.

    Returns:
        List of :class:`DocumentResponse` ordered by most recent first.
    """
    query = (
        select(DocumentModel)
        .where(DocumentModel.patient_id == patient_id)
        .order_by(DocumentModel.created_at.desc())
        .limit(limit)
    )
    if document_type:
        query = query.where(DocumentModel.document_type == document_type)
    if source_channel:
        query = query.where(DocumentModel.source_channel == source_channel)

    result = await db.execute(query)
    docs = result.scalars().all()

    return [
        DocumentResponse(
            id=d.id,
            patient_id=d.patient_id,
            document_type=d.document_type,
            source_channel=d.source_channel,
            summary=d.summary,
            key_finding=None,
            ai_questions=d.ai_questions or [],
            file_url=d.file_url,
            created_at=d.created_at,
        )
        for d in docs
    ]
