"""
Use case: ProcessDocumentUseCase.

OCR pipeline: receive file bytes → extract text (Textract) → simplify with LLM
(CEFR A2 language) → save to DocumentModel → publish document_added SSE event.

Module:    src.application.use_cases.documents.process_document_use_case
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timezone

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings
from src.infrastructure.ocr.textract_client import textract_client
from src.infrastructure.agents.nodes.catalog_agent import publish_catalog_event

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3,
)

_SIMPLIFY_SYSTEM = """
You are Ani, an oncology companion. You received the OCR text of a medical document.
Your task is to:
1. Identify the document type (e.g., "laudo_biopsia", "hemograma", "imagem_tc", "receita", "relatorio_consulta").
2. Write a short, clear summary in Brazilian Portuguese (CEFR A2 level) — maximum 3 sentences.
   Use simple words. No medical jargon unless immediately explained.
3. Generate exactly 3 questions the patient should ask their doctor about this document.
4. Extract the single most important finding (one sentence).

Respond ONLY with a valid JSON object:
{
  "document_type": "...",
  "summary": "...",
  "key_finding": "...",
  "questions_for_doctor": ["...", "...", "..."]
}
"""


@dataclass
class ProcessedDocument:
    """Result of the document processing pipeline.

    Attributes:
        document_id: Generated UUID for the new document record.
        document_type: AI-identified document category.
        summary: Simplified summary in CEFR A2 Portuguese.
        key_finding: Single most important finding.
        questions_for_doctor: Three suggested questions for the doctor.
        extracted_text: Raw OCR text from Textract.
    """

    document_id: str
    document_type: str
    summary: str
    key_finding: str
    questions_for_doctor: list[str]
    extracted_text: str


class ProcessDocumentUseCase:
    """Runs the full OCR → LLM → persist → SSE pipeline for a medical document.

    Args:
        db_session: SQLAlchemy async session.
        redis_client: Active Redis client for SSE event publishing.
    """

    def __init__(self, db_session, redis_client=None) -> None:
        self._db = db_session
        self._redis = redis_client

    async def execute(
        self,
        file_bytes: bytes,
        content_type: str,
        patient_id: str,
        source_channel: str = "upload",
        filename: Optional[str] = None,
    ) -> ProcessedDocument:
        """Execute the document processing pipeline.

        Args:
            file_bytes: Raw file content.
            content_type: MIME type (e.g. ``"image/jpeg"``).
            patient_id: The Anicca patient UUID.
            source_channel: Origin channel — ``"whatsapp"``, ``"camera"``, or ``"upload"``.
            filename: Optional original filename.

        Returns:
            A :class:`ProcessedDocument` with all extracted and AI-generated fields.
        """
        extracted_text = await textract_client.extract_text(
            file_bytes=file_bytes,
            content_type=content_type,
            filename=filename,
        )

        ai_result = await self._simplify_with_llm(extracted_text)

        document_id = str(uuid.uuid4())
        await self._persist_document(
            document_id=document_id,
            patient_id=patient_id,
            extracted_text=extracted_text,
            ai_result=ai_result,
            source_channel=source_channel,
            filename=filename,
        )

        if self._redis:
            await publish_catalog_event(
                redis_client=self._redis,
                user_id=patient_id,
                event_type="document_added",
                payload={
                    "document_id": document_id,
                    "document_type": ai_result.get("document_type", "documento"),
                    "summary": ai_result.get("summary", ""),
                    "source_channel": source_channel,
                },
            )

        return ProcessedDocument(
            document_id=document_id,
            document_type=ai_result.get("document_type", "documento"),
            summary=ai_result.get("summary", ""),
            key_finding=ai_result.get("key_finding", ""),
            questions_for_doctor=ai_result.get("questions_for_doctor", []),
            extracted_text=extracted_text,
        )

    async def _simplify_with_llm(self, extracted_text: str) -> dict:
        """Use Gemini to simplify the OCR text and extract key information.

        Args:
            extracted_text: Raw OCR output from Textract.

        Returns:
            A dict with document_type, summary, key_finding, and questions_for_doctor.
        """
        import json

        messages = [
            SystemMessage(content=_SIMPLIFY_SYSTEM),
            HumanMessage(content=f"OCR TEXT:\n{extracted_text[:4000]}"),
        ]

        try:
            response = await _llm.ainvoke(messages)
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            return json.loads(content)
        except Exception as exc:
            print(f"[ProcessDocument] LLM simplification failed: {exc}")
            return {
                "document_type": "documento",
                "summary": "Documento recebido e processado com sucesso.",
                "key_finding": "Verifique o documento com seu médico.",
                "questions_for_doctor": [
                    "O que significa esse resultado?",
                    "Preciso de algum exame complementar?",
                    "Isso muda meu tratamento atual?",
                ],
            }

    async def _persist_document(
        self,
        document_id: str,
        patient_id: str,
        extracted_text: str,
        ai_result: dict,
        source_channel: str,
        filename: Optional[str],
    ) -> None:
        """Persist the processed document to the database.

        Args:
            document_id: Pre-generated UUID for the document.
            patient_id: Owning patient UUID.
            extracted_text: Raw OCR text.
            ai_result: AI-generated fields dict.
            source_channel: Origin channel string.
            filename: Optional original filename.
        """
        from src.infrastructure.database.models import DocumentModel

        doc = DocumentModel(
            id=document_id,
            patient_id=patient_id,
            file_url=f"s3://{settings.AWS_S3_BUCKET}/documents/{filename or document_id}",
            document_type=ai_result.get("document_type", "documento"),
            source_channel=source_channel,
            extracted_text=extracted_text,
            summary=ai_result.get("summary", ""),
            ai_questions=ai_result.get("questions_for_doctor", []),
        )
        self._db.add(doc)
        await self._db.flush()
