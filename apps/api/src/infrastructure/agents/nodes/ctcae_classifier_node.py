"""
CTCAE Symptom Classifier Node.

Module:    src.infrastructure.agents.nodes.ctcae_classifier_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from langchain_core.messages import SystemMessage, HumanMessage
from src.infrastructure.agents.state import AniState

async def ctcae_classifier_node(state: AniState) -> dict:
    """Specialized node for handling symptom reports.
    
    This node doesn't generate the final response. It injects a system message
    with CTCAE guidelines to influence the synthesizer.
    """
    last_message = state["messages"][-1].content if state["messages"] else ""

    system_msg = SystemMessage(content=(
        "You are the Symptom Specialist. The user is reporting a physical symptom. "
        "Analyze the symptom against NCI CTCAE v5.0 guidelines. "
        "If it sounds like Grade 3 or 4 (severe or life-threatening), you MUST instruct "
        "the synthesizer to recommend immediate medical attention. "
        "Do NOT reply to the user directly, just provide your clinical assessment in this internal thought."
    ))

    # A more robust implementation would actually use an LLM here to output structured JSON
    # representing the CTCAE grade, and append it to the context.
    # For now, we just append the specialist's instruction for the synthesizer to read.
    
    agents = list(state.get("agents_invoked", []))
    agents.append("ctcae_classifier")

    return {
        "messages": [system_msg],
        "agents_invoked": agents
    }
