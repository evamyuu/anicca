"""
Implementation of catalog_agent.

Module:    apps.api.src.infrastructure.agents.nodes.catalog_agent
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
import json
from typing import Literal, Optional

from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings
from src.infrastructure.agents.state import AniState

_llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.0,
)


class BodyMapPayload(BaseModel):
    body_region: str = Field(description="Region like head, abdomen, arm_left, chest_left, back_head, etc.")
    body_view: Literal["front", "back"]
    intensity: int = Field(description="0 to 5")
    symptom_types: list[str] = Field(description="dor, dormencia, inchaco, vermelhidao, ferida, formigamento, or outro")

class CatalogDecision(BaseModel):
    """Structured catalog classification output."""

    event_type: Literal[
        "document_added",
        "body_map_updated",
        "routine_synced",
        "journaling_synced",
        "no_catalog_action",
    ] = Field(description="The type of data event this interaction produced.")
    payload_summary: str = Field(
        description="One sentence summarizing what was captured in Portuguese."
    )
    body_map_payload: Optional[BodyMapPayload] = Field(
        default=None,
        description="Extract the body map data if event_type is body_map_updated."
    )


async def catalog_agent_node(state: AniState) -> dict:
    """Classify the WhatsApp interaction and publish a typed SSE event.

    This node runs AFTER the synthesizer. It inspects the conversation turn,
    decides what data event (if any) was produced, and publishes it to the
    Redis pub/sub channel ``events:{user_id}`` so the app can react in real time.

    Args:
        state: The current pipeline state after synthesis.

    Returns:
        A partial state update with ``catalog_event`` set.
    """
    last_message = state["messages"][-1].content if state["messages"] else ""
    final_response = state.get("final_response", "")
    intent = state.get("intent", "")

    system_msg = SystemMessage(
        content=(
            "You are the Anicca Catalog Agent. Analyze the user's last message and the "
            "AI response to classify what data event was produced in this interaction.\n\n"
            "- document_added: User sent a medical document, exam, or report image.\n"
            "- body_map_updated: User described or reported a physical symptom or pain.\n"
            "- routine_synced: User registered temperature, medication, hydration, or sleep.\n"
            "- journaling_synced: User expressed emotions, did a mood check-in, or journaled.\n"
            "- no_catalog_action: General question or conversation with no data captured.\n\n"
            "Be precise. Only classify as a data event if the user actually provided data."
        )
    )
    user_msg = HumanMessage(
        content=f"User: {last_message}\nAni response: {final_response}\nIntent: {intent}"
    )

    structured_llm = _llm.with_structured_output(CatalogDecision)
    decision: CatalogDecision = await structured_llm.ainvoke([system_msg, user_msg])

    agents = list(state.get("agents_invoked", []))
    agents.append("catalog")

    catalog_event = None
    if decision.event_type != "no_catalog_action":
        catalog_event = {
            "type": decision.event_type,
            "summary": decision.payload_summary,
            "channel": "whatsapp",
        }
        if decision.body_map_payload:
            catalog_event["body_map_payload"] = decision.body_map_payload.model_dump()

    return {
        "catalog_event": catalog_event,
        "agents_invoked": agents,
    }


async def publish_catalog_event(
    redis_client,
    user_id: str,
    event_type: str,
    payload: dict,
) -> None:
    """Publish a typed event to the user's Redis pub/sub channel.

    Args:
        redis_client: An active :class:`redis.asyncio.Redis` client.
        user_id: The Anicca user UUID.
        event_type: One of the catalog event type strings.
        payload: Additional event data to include in the SSE payload.
    """
    channel = f"events:{user_id}"
    message = json.dumps(
        {"type": event_type, "payload": payload},
        default=str,
    )
    await redis_client.publish(channel, message)
