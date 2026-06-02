"""
LangGraph state definitions for the Ani Multi-Agent System.

Module:    src.infrastructure.agents.state
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from typing import Annotated, Any, Optional, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AniState(TypedDict):
    """LangGraph state schema for the Ani multi-agent pipeline.

    Attributes:
        messages: The accumulated message history for this turn.
        patient_context: Serialized patient context from Redis.
        personality: The patient's configured Ani personality.
        intent: The route decided by the Supervisor (e.g. 'symptom', 'document', 'general').
        agents_invoked: Names of agent nodes that ran in this pipeline execution.
        final_response: The synthesized text response to return.
        cards: GenUI card payloads to attach to the response.
        media_url: Optional URL of an attached image or document.
    """
    messages: Annotated[list[BaseMessage], add_messages]
    patient_context: dict
    personality: str
    intent: str
    agents_invoked: list[str]
    final_response: str
    cards: list[dict]
    media_url: Optional[str]
