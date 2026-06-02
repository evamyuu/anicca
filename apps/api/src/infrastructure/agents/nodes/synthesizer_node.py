"""
Synthesizer Node for final response generation.

Module:    src.infrastructure.agents.nodes.synthesizer_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings
from src.domain.entities import AniPersonality
from src.infrastructure.agents.state import AniState

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.7,
)

# Output schema enforcing GenUI and text separation
class GenUIButton(BaseModel):
    id: str = Field(description="Unique ID for the button payload")
    text: str = Field(description="Button display text (max 20 chars)")

class GenUICard(BaseModel):
    type: str = Field(description="Type of card, e.g., 'button_group', 'list', 'ctcae_grade'")
    text: Optional[str] = Field(description="Optional text inside the card")
    buttons: Optional[List[GenUIButton]] = Field(description="List of buttons if type is button_group")

class AniFinalResponse(BaseModel):
    text: str = Field(description="The main text response spoken by Ani to the user")
    cards: List[GenUICard] = Field(description="Interactive cards or buttons to show alongside the text")


def _build_system_prompt(personality: AniPersonality, patient_context: dict) -> str:
    """Construct the high-fidelity Ani system prompt based on personality."""
    
    base_identity = (
        "You are Ani, an AI companion specialized in oncology navigation for Brazilian patients. "
        "Your mission is to provide emotional support, clinical guidance (never diagnosing), "
        "and help the patient navigate their journey with cancer.\n\n"
        "Rules of Engagement:\n"
        "- Always respond in Brazilian Portuguese (pt-BR).\n"
        "- Respect the Brazilian healthcare context (SUS, ANS, Lei dos 60 dias).\n"
        "- When discussing symptoms, implicitly reference NCI CTCAE v5.0 severity.\n"
        "- Keep language simple, accessible (WCAG 1.4.4), and jargon-free.\n"
    )

    personality_instructions = {
        AniPersonality.DEFAULT: (
            "PERSONALITY: DEFAULT\n"
            "You are balanced, polite, and helpful. You act as a reliable standard companion. "
            "Your tone is warm but professional, clear, and reassuring without being overly casual."
        ),
        AniPersonality.BESTIE: (
            "PERSONALITY: BESTIE (GenZ Vibe)\n"
            "You are the patient's absolute best friend. You are extremely informal, deeply supportive, and relatable. "
            "CRITICAL: Use GenZ Brazilian slang (e.g., 'mano', 'tlgd', 'tb', 'agr', 'mt'). "
            "CRITICAL: Never use capital letters at the beginning of sentences (type in lowercase). "
            "CRITICAL: Use kaomojis like ';-;' or 'T-T' or common emojis often. Be dramatic but loving."
        ),
        AniPersonality.PROTECTOR: (
            "PERSONALITY: PROTECTOR (Parental Vibe)\n"
            "You are extremely warm, caring, and slightly protective, like a loving parent. "
            "Use terms of endearment ('meu bem', 'querido(a)', 'meu anjo'). "
            "Always express concern for their sleep, hydration, and comfort. Be immensely comforting."
        ),
        AniPersonality.NERD: (
            "PERSONALITY: NERD (Geek Vibe)\n"
            "You are highly analytical, curious, and friendly. "
            "Explain clinical concepts or logistics using fun pop-culture analogies (video games, RPGs, movies, Bob Esponja, anime). "
            "You focus on the logic but in a cool, accessible, 'nerd' way."
        ),
        AniPersonality.CHILL: (
            "PERSONALITY: CHILL (Laid-back Vibe)\n"
            "You are direct, objective, relaxed, and zero-drama. "
            "You don't write long texts. You keep things practical ('fica de boa', 'tranquilo', 'vamo resolver isso'). "
            "Provide objective reassurance without overreacting."
        ),
        AniPersonality.GENTLE: (
            "PERSONALITY: GENTLE (Older Adult Vibe)\n"
            "You are extremely patient, respectful, and clear, tailored for an older generation. "
            "Speak slowly (using short, clear sentences), use respectful pronouns ('o senhor', 'a senhora' if appropriate), "
            "and avoid modern slang or complex technical terms. Be the most polite and affectionate companion."
        ),
    }

    selected_persona = personality_instructions.get(
        AniPersonality(personality), 
        personality_instructions[AniPersonality.DEFAULT]
    )

    cancer_type = patient_context.get("cancer_type", "oncological condition")
    treatment = patient_context.get("treatment_modality", "")
    journey_phase = patient_context.get("journey_phase", "treatment")

    context_str = (
        "\n\nPATIENT CONTEXT:\n"
        f"- Condition: {cancer_type}\n"
        f"- Treatment: {treatment}\n"
        f"- Phase: {journey_phase}\n"
    )

    return base_identity + selected_persona + context_str


async def synthesizer_node(state: AniState) -> dict:
    """Synthesize the final response using the designated personality and Structured Outputs."""
    try:
        personality = AniPersonality(state.get("personality", "default"))
    except ValueError:
        personality = AniPersonality.DEFAULT
        
    system_prompt = _build_system_prompt(personality, state.get("patient_context", {}))
    
    # We combine the system prompt with whatever context the specialist nodes injected
    messages_to_send = [SystemMessage(content=system_prompt)] + state["messages"]

    # Force the LLM to output our exact schema
    structured_llm = _llm.with_structured_output(AniFinalResponse)
    
    response: AniFinalResponse = await structured_llm.ainvoke(messages_to_send)

    agents = list(state.get("agents_invoked", []))
    agents.append("synthesizer")

    # Serialize the Pydantic cards to dicts so they can be JSON-serialized later
    cards_dicts = [card.model_dump() for card in response.cards]

    return {
        "final_response": response.text,
        "cards": cards_dicts,
        "agents_invoked": agents,
    }
