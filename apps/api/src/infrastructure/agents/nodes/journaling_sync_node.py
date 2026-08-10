"""
Implementation of journaling_sync_node.

Module:    apps.api.src.infrastructure.agents.nodes.journaling_sync_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings
from src.infrastructure.agents.state import AniState

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.2,
)


class JournalingExtraction(BaseModel):
    """Structured extraction of emotional/journaling data from a patient's message."""

    mood: Literal["muito_bem", "bem", "neutro", "mal", "muito_mal"] = Field(
        description="The patient's inferred mood from the message."
    )
    mood_score: int = Field(
        ge=1, le=10,
        description="Numeric mood score: 1=muito_mal, 10=muito_bem."
    )
    themes: list[str] = Field(
        default_factory=list,
        description=(
            "Key emotional themes mentioned, in Portuguese. "
            "Examples: ['ansiedade', 'esperança', 'solidão', 'gratidão', 'medo']"
        ),
    )
    entry_text: str = Field(
        description="A cleaned, 1-2 sentence summary of what the patient expressed, in Portuguese."
    )
    needs_support: bool = Field(
        description="True if the message suggests the patient needs emotional support or is in distress."
    )


_SYSTEM_PROMPT = """
You are the Anicca Journaling Sync Agent. Analyze the emotional content of the patient's message.

The patient is an oncology patient. They may express:
- Fears or anxieties about treatment, results, or the future
- Gratitude for good days or support from family
- Sadness, loneliness, or hopelessness
- Hope, resilience, or positive progress
- Day-to-day emotional check-ins

Be empathetic and accurate. Do NOT project feelings the patient didn't express.
Extract ONLY what is present in the message.
"""


async def journaling_sync_node(state: AniState) -> dict:
    """Extract emotional journaling data from the WhatsApp message.

    Args:
        state: The current pipeline state.

    Returns:
        A partial state update with journaling_data and context for the synthesizer.
    """
    last_message = state["messages"][-1].content if state["messages"] else ""

    messages = [
        SystemMessage(content=_SYSTEM_PROMPT),
        HumanMessage(content=f"Patient message: {last_message}"),
    ]

    structured_llm = _llm.with_structured_output(JournalingExtraction)

    try:
        extraction: JournalingExtraction = await structured_llm.ainvoke(messages)
    except Exception as exc:
        print(f"[JournalingSyncNode] Extraction failed: {exc}")
        extraction = JournalingExtraction(
            mood="neutro",
            mood_score=5,
            themes=[],
            entry_text="Paciente compartilhou algo sobre como está se sentindo.",
            needs_support=False,
        )

    agents = list(state.get("agents_invoked", []))
    agents.append("journaling_sync")

    support_hint = (
        "ATENÇÃO: O paciente parece estar em sofrimento emocional. "
        "Responda com máxima empatia e pergunte se ele gostaria de conversar mais. "
        "Não minimize o que sente. "
        if extraction.needs_support
        else ""
    )

    themes_str = ", ".join(extraction.themes) if extraction.themes else "nenhum tema específico identificado"

    return {
        "journaling_data": extraction.model_dump(),
        "agents_invoked": agents,
        "specialist_context": (
            f"JOURNALING CAPTURADO: {extraction.entry_text}. "
            f"Humor: {extraction.mood} ({extraction.mood_score}/10). "
            f"Temas: {themes_str}. "
            f"{support_hint}"
            "Valide o sentimento do paciente, registre que o diário foi atualizado "
            "e ofereça espaço para continuar conversando."
        ),
    }