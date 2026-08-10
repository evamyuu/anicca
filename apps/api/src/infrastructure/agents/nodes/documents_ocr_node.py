"""
Implementation of documents_ocr_node.

Module:    apps.api.src.infrastructure.agents.nodes.documents_ocr_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from langchain_core.messages import SystemMessage
from src.infrastructure.agents.state import AniState
from src.infrastructure.ocr.textract_client import textract_client


async def documents_ocr_node(state: AniState) -> dict:
    """Run OCR on the attached document and inject the text into the conversation.

    Reads ``media_url`` from state (local file path downloaded by the WhatsApp
    router) and calls the ``TextractClient`` singleton, which uses AWS Textract
    when credentials are configured or falls back to a realistic mock otherwise.

    Args:
        state: The current pipeline state.

    Returns:
        A partial state update injecting the OCR result as a SystemMessage.
    """
    media_url = state.get("media_url")

    agents = list(state.get("agents_invoked", []))
    agents.append("documents_ocr")

    if not media_url:
        system_msg = SystemMessage(
            content=(
                "The user is asking about a medical document or exam but did not "
                "attach a file in this message. Ask them to send the photo of the "
                "document so you can read and explain it."
            )
        )
        return {"messages": [system_msg], "agents_invoked": agents}

    ocr_text = ""
    try:
        import os
        import mimetypes

        content_type = mimetypes.guess_type(media_url)[0] or "image/jpeg"
        with open(media_url, "rb") as f:
            file_bytes = f.read()

        ocr_text = await textract_client.extract_text(
            file_bytes=file_bytes,
            content_type=content_type,
            filename=os.path.basename(media_url),
        )
    except Exception as exc:
        print(f"[DocumentsOCRNode] Failed to read/extract file {media_url}: {exc}")
        ocr_text = (
            "Não foi possível extrair o texto do documento enviado. "
            "Por favor, tente enviar a foto com mais luz e sem borrões."
        )

    system_msg = SystemMessage(
        content=(
            "The user sent a medical document via WhatsApp. "
            "The OCR system extracted the following text from it:\n\n"
            f"--- DOCUMENT TEXT ---\n{ocr_text}\n--- END ---\n\n"
            "INSTRUCTIONS:\n"
            "1. Identify the document type (exam, biopsy report, prescription, etc.).\n"
            "2. Explain the key findings in SIMPLE Brazilian Portuguese (CEFR A2 level) — "
            "no medical jargon without immediate explanation.\n"
            "3. Highlight the single most important result in bold (*text*).\n"
            "4. Suggest 2-3 questions the patient should ask their doctor.\n"
            "5. Reassure the patient that you saved the document in 'Meus Documentos'.\n"
            "6. ALWAYS include whatsapp_buttons with next actions: "
            "'Ver documento', 'Perguntar à Ani', 'Minha rotina'."
        )
    )

    return {
        "messages": [system_msg],
        "agents_invoked": agents,
    }