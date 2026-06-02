"""
Main LangGraph definition for the Patient profile orchestration.

Module:    src.infrastructure.agents.graph.patient_graph
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from typing import Any
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import END, StateGraph

from src.infrastructure.agents.state import AniState
from src.infrastructure.agents.nodes.supervisor_node import supervisor_node
from src.infrastructure.agents.nodes.ctcae_classifier_node import ctcae_classifier_node
from src.infrastructure.agents.nodes.documents_ocr_node import documents_ocr_node
from src.infrastructure.agents.nodes.synthesizer_node import synthesizer_node

def _route_by_supervisor(state: AniState) -> str:
    """Read the intent from the state to route to the appropriate specialist."""
    intent = state.get("intent")
    
    if intent == "ROUTE_SYMPTOM":
        return "ctcae_classifier"
    elif intent == "ROUTE_DOCUMENT":
        return "documents_ocr"
    
    # If ROUTE_GENERAL or unknown, go straight to synthesizer
    return "synthesizer"

def build_patient_graph() -> Any:
    """Construct and compile the Patient LangGraph state machine.

    Returns:
        A compiled :class:`~langgraph.graph.StateGraph` ready for invocation.
    """
    graph = StateGraph(AniState)

    # 1. Add all nodes
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("ctcae_classifier", ctcae_classifier_node)
    graph.add_node("documents_ocr", documents_ocr_node)
    graph.add_node("synthesizer", synthesizer_node)

    # 2. Define Entry Point
    graph.set_entry_point("supervisor")

    # 3. Define conditional routing from supervisor
    graph.add_conditional_edges(
        "supervisor",
        _route_by_supervisor,
        {
            "ctcae_classifier": "ctcae_classifier",
            "documents_ocr": "documents_ocr",
            "synthesizer": "synthesizer"
        },
    )

    # 4. Define edges from specialists to synthesizer
    graph.add_edge("ctcae_classifier", "synthesizer")
    graph.add_edge("documents_ocr", "synthesizer")

    # 5. End graph after synthesizer
    graph.add_edge("synthesizer", END)

    return graph.compile()


# Module-level compiled instance for reuse
patient_graph = build_patient_graph()


async def run_patient_agent(
    user_message: str,
    session_history: list[dict],
    patient_context: dict,
    personality: str = "default",
    media_url: str | None = None,
) -> dict:
    """Execute the Multi-Agent pipeline for a single user message.

    Args:
        user_message: The user's message text.
        session_history: List of prior ``{role, content}`` message dicts.
        patient_context: Patient context dictionary from Redis.
        personality: The patient's Ani personality string. Defaults to ``"mentor"``.
        media_url: Optional path to an uploaded document.

    Returns:
        A dictionary with ``response_text``, ``agents_invoked``, and ``cards``.
    """
    history_messages = [
        HumanMessage(content=m["content"]) if m["role"] == "user"
        else AIMessage(content=m["content"])
        for m in session_history
    ]
    history_messages.append(HumanMessage(content=user_message))

    initial_state: AniState = {
        "messages": history_messages,
        "patient_context": patient_context,
        "personality": personality,
        "intent": "",
        "agents_invoked": [],
        "final_response": "",
        "cards": [],
        "media_url": media_url,
    }

    result = await patient_graph.ainvoke(initial_state)

    return {
        "response_text": result["final_response"],
        "agents_invoked": result["agents_invoked"],
        "cards": result.get("cards", []),
    }
