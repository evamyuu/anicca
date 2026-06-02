"""
Document OCR Processor Node.

Module:    src.infrastructure.agents.nodes.documents_ocr_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from langchain_core.messages import SystemMessage
from src.infrastructure.agents.state import AniState

async def documents_ocr_node(state: AniState) -> dict:
    """Specialized node for handling uploaded documents and images."""
    media_url = state.get("media_url")
    if not media_url:
        return {}

    # In a real implementation, this would call AWS Textract or Gemini Vision
    ocr_text = "Laudo simulado: Paciente apresenta exames normais. Nódulos ausentes."
    
    system_msg = SystemMessage(
        content=(
            f"The user uploaded a medical document. "
            f"The OCR vision system extracted the following text: {ocr_text}\n"
            f"Please interpret this for the user in a simple, reassuring way according to your personality."
        )
    )
    
    agents = list(state.get("agents_invoked", []))
    agents.append("documents_ocr")
    
    return {
        "messages": [system_msg],
        "agents_invoked": agents
    }
