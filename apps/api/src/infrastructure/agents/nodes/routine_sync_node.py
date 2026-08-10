"""
Implementation of routine_sync_node.

Module:    apps.api.src.infrastructure.agents.nodes.routine_sync_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from __future__ import annotations

import json
from typing import Literal, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings
from src.infrastructure.agents.state import AniState

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.0,
)


class RoutineExtraction(BaseModel):
    """Structured extraction of routine data from a patient's WhatsApp message."""

    routine_type: Literal["temperature", "medication", "hydration", "sleep", "general"] = Field(
        description="The type of routine data being reported."
    )
    value: Optional[str] = Field(
        default=None,
        description=(
            "The extracted value. Examples: '37.8' for temperature, "
            "'Ondansetrona 4mg' for medication, '3' for cups of water, "
            "'22:30-07:00' for sleep window."
        ),
    )
    unit: Optional[str] = Field(
        default=None,
        description="Unit for the value, e.g. '°C', 'mg', 'copos', 'horas'."
    )
    context_summary: str = Field(
        description=(
            "One sentence in Portuguese summarizing what the patient reported, "
            "for use as context in the Ani response."
        )
    )


_SYSTEM_PROMPT = """
You are the Anicca Routine Sync Agent. Extract structured routine data from the patient's message.

Focus on:
- Temperature: any mention of fever, temperature measurement (e.g., "estou com 38°C", "medi 37.5")
- Medication: mentions of taking medicine, dose, name (e.g., "tomei o ondansetrona", "tomei 2 comprimidos")
- Hydration: mentions of drinking water, glasses/cups (e.g., "bebi 3 copos", "estou bebendo bastante água")
- Sleep: mentions of sleep time, quality, hours slept (e.g., "dormi 6 horas", "acordei às 7")
- General: any other routine observation

Extract ONLY what is explicitly stated. Do not infer or assume values not mentioned.
"""


async def routine_sync_node(state: AniState) -> dict:
    """Extract routine data from the WhatsApp message and prepare for persistence.

    Args:
        state: The current pipeline state.

    Returns:
        A partial state update with routine_data and context for the synthesizer.
    """
    last_message = state["messages"][-1].content if state["messages"] else ""

    messages = [
        SystemMessage(content=_SYSTEM_PROMPT),
        HumanMessage(content=f"Patient message: {last_message}"),
    ]

    structured_llm = _llm.with_structured_output(RoutineExtraction)

    try:
        extraction: RoutineExtraction = await structured_llm.ainvoke(messages)
    except Exception as exc:
        print(f"[RoutineSyncNode] Extraction failed: {exc}")
        extraction = RoutineExtraction(
            routine_type="general",
            value=None,
            unit=None,
            context_summary="Paciente relatou informação sobre sua rotina.",
        )

    agents = list(state.get("agents_invoked", []))
    agents.append("routine_sync")

    return {
        "routine_data": extraction.model_dump(),
        "agents_invoked": agents,
        "specialist_context": (
            f"ROTINA CAPTURADA: {extraction.context_summary}. "
            f"Tipo: {extraction.routine_type}. "
            f"Valor: {extraction.value} {extraction.unit or ''}. "
            "Confirme o registro para o paciente e ofereça a opção de corrigir se necessário."
        ),
    }