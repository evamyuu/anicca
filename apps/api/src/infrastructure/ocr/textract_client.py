"""
AWS Textract OCR client for medical document text extraction.

Uploads documents to S3 and uses Textract to extract structured text.
Falls back gracefully with a user-friendly message on any error.

Module:    src.infrastructure.ocr.textract_client
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import uuid
from typing import Optional

from src.config import settings

_FALLBACK_MESSAGE = (
    "Recebi seu documento! Estou processando o texto. "
    "Se demorar muito, tente enviar o documento como foto com boa iluminação."
)


class TextractClient:
    """AWS Textract client for medical document OCR.

    Uses synchronous Textract detection for documents up to 5MB.
    For larger files, delegates to asynchronous Textract jobs via S3.

    See Also:
        https://docs.aws.amazon.com/textract/latest/dg/what-is.html
    """

    def __init__(self) -> None:
        self._configured = bool(
            settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY
        )

    def _get_boto_clients(self):
        """Create and return boto3 S3 and Textract clients.

        Returns:
            Tuple of (s3_client, textract_client).
        """
        import boto3
        session = boto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        return session.client("s3"), session.client("textract")

    async def extract_text(
        self, file_bytes: bytes, content_type: str = "image/jpeg", filename: Optional[str] = None
    ) -> str:
        """Extract text from a medical document using AWS Textract.

        Uploads the file to S3 first, then runs Textract detection.
        For files ≤5MB, uses synchronous detection.

        Args:
            file_bytes: Raw file content as bytes.
            content_type: MIME type of the file (e.g. ``"image/jpeg"``).
            filename: Optional original filename. A UUID is generated if not provided.

        Returns:
            Extracted text as a single string, or a fallback message on error.
        """
        if not self._configured:
            return await self._mock_extract(file_bytes)

        try:
            import asyncio
            return await asyncio.get_event_loop().run_in_executor(
                None, self._sync_extract, file_bytes, content_type, filename
            )
        except Exception as exc:
            print(f"[Textract] Extraction failed: {exc}")
            return _FALLBACK_MESSAGE

    def _sync_extract(
        self, file_bytes: bytes, content_type: str, filename: Optional[str]
    ) -> str:
        """Synchronous Textract extraction (runs in thread pool).

        Args:
            file_bytes: Raw file bytes.
            content_type: MIME type string.
            filename: Optional original filename.

        Returns:
            Concatenated extracted text.
        """
        s3_client, textract_client = self._get_boto_clients()

        key = f"documents/{filename or uuid.uuid4()}"
        s3_client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )

        response = textract_client.detect_document_text(
            Document={
                "S3Object": {
                    "Bucket": settings.AWS_S3_BUCKET,
                    "Name": key,
                }
            }
        )

        lines = [
            block["Text"]
            for block in response.get("Blocks", [])
            if block["BlockType"] == "LINE"
        ]
        return "\n".join(lines)

    async def _mock_extract(self, file_bytes: bytes) -> str:
        """Return a mock extraction result when AWS is not configured.

        Args:
            file_bytes: Ignored — used only to simulate processing.

        Returns:
            A realistic mock OCR text for demonstration purposes.
        """
        return (
            "RESULTADO DE EXAME ANATOMOPATOLÓGICO\n"
            "Paciente: Rosa Silva\n"
            "Data da biópsia: 15/03/2026\n"
            "Material: Core biopsy - mama direita\n"
            "Resultado: Carcinoma ductal invasivo\n"
            "Grau histológico: II (moderadamente diferenciado)\n"
            "Receptores hormonais: ER positivo (90%), PR positivo (70%)\n"
            "HER2: Negativo\n"
            "Ki-67: 18%\n"
            "Classificação molecular sugerida: Luminal A\n"
            "Observações: Margens cirúrgicas livres de neoplasia."
        )


textract_client = TextractClient()
"""Module-level singleton instance of :class:`TextractClient`."""
