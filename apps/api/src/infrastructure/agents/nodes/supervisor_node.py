"""
Implementation of supervisor_node.

Module:    apps.api.src.infrastructure.agents.nodes.supervisor_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from typing import Literal
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings
from src.infrastructure.agents.state import AniState

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.0,  # Zero temperature for routing consistency
)

class RouteDecision(BaseModel):
    """Structured output for the Supervisor Router."""
    route: Literal[
        "ROUTE_SYMPTOM",
        "ROUTE_DOCUMENT",
        "ROUTE_ROUTINE",
        "ROUTE_JOURNALING",
        "ROUTE_GENERAL",
    ] = Field(
        description="The target node to handle the user's request."
    )


async def supervisor_node(state: AniState) -> dict:
    """Classify intent and decide the next node using Structured Outputs.

    Args:
        state: The current pipeline state.

    Returns:
        A partial state update containing the decided `intent` route.
    """
    if state.get("media_url"):
        agents = list(state.get("agents_invoked", []))
        agents.append("supervisor (forced)")
        return {"intent": "ROUTE_DOCUMENT", "agents_invoked": agents}

    last_message = state["messages"][-1].content if state["messages"] else ""

    system_msg = SystemMessage(content=(
        "You are the Supervisor Router for an oncology patient AI assistant. "
        "Analyze the user's message and select the most appropriate execution route:\n"
        "- ROUTE_SYMPTOM: User is reporting physical pain, side effects, body discomfort, or symptoms.\n"
        "- ROUTE_DOCUMENT: User is asking about exams, reports, or sending documents/images.\n"
        "- ROUTE_ROUTINE: User is reporting daily routine data — temperature measurement, "
        "taking medication/pills, drinking water/hydration, sleep quality or hours.\n"
        "- ROUTE_JOURNALING: User is expressing emotions, mood, feelings, anxiety, fear, "
        "gratitude, sadness, hope — any emotional check-in or diary entry.\n"
        "- ROUTE_GENERAL: General questions, rights, logistics, or anything that doesn't "
        "fit the above categories precisely."
    ))
    user_msg = HumanMessage(content=str(last_message))

    structured_llm = _llm.with_structured_output(RouteDecision)
    decision = await structured_llm.ainvoke([system_msg, user_msg])

    agents = list(state.get("agents_invoked", []))
    agents.append("supervisor")

    return {"intent": decision.route, "agents_invoked": agents}