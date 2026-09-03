"""
Implementation of doctor_graph.

Module:    apps.api.src.infrastructure.agents.graph.doctor_graph
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from typing import List
import httpx
import xml.etree.ElementTree as ET
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import settings


_SYSTEM_PROMPT = """Você é Ani, agente de Inteligência Clínica Oncológica do painel Anicca.

Você recebe uma pergunta clínica e artigos científicos reais do PubMed já coletados.
Sua tarefa é estruturar sempre a resposta com EXATAMENTE estas três seções:

**[PENSAMENTO]**
Descreva seu raciocínio clínico: que hipótese está formando, que links do Knowledge Graph identificou (ex: mutação → via → toxicidade → manejo), e por que os artigos são relevantes para o caso.

**[RESPOSTA CLÍNICA]**
Resposta direta e estruturada usando markdown (## para seções, listas com -, **negrito** para termos críticos). Inclua grau CTCAE quando relevante.

**[FONTES E REFERÊNCIAS]**
Liste cada artigo fornecido que embasou a resposta:
- [PubMed PMID] Título do artigo. (Recuperado via busca: "<termo usado>")

Se nenhum artigo foi encontrado, escreva: "Nenhuma publicação recente encontrada no PubMed. Resposta baseada em conhecimento médico interno — validação clínica obrigatória."

REGRAS:
- Escreva em Português (Brasil). Terminologia médica precisa.
- NÃO invente citações. Cite apenas o que foi fornecido nos artigos.
- Seja direto e objetivo. Máximo de suporte à decisão clínica (CDS), não substitua o julgamento médico.
"""


async def _search_pubmed(query: str, max_results: int = 3) -> str:
    """Search PubMed directly and return formatted results."""
    search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            search_resp = await client.get(search_url, params={
                "db": "pubmed", "term": query, "retmode": "json", "retmax": max_results
            })
            search_resp.raise_for_status()
            id_list = search_resp.json().get("esearchresult", {}).get("idlist", [])

            if not id_list:
                return f"[PubMed — Busca: '{query}']\nNenhum artigo encontrado."

            fetch_resp = await client.get(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
                params={"db": "pubmed", "id": ",".join(id_list), "retmode": "xml"}
            )
            fetch_resp.raise_for_status()

            root = ET.fromstring(fetch_resp.text)
            results = []
            for article in root.findall(".//PubmedArticle"):
                pmid_elem = article.find(".//PMID")
                pmid = pmid_elem.text if pmid_elem is not None else "N/A"
                title_elem = article.find(".//ArticleTitle")
                title = title_elem.text if title_elem is not None else "Sem Título"
                abstract_texts = article.findall(".//AbstractText")
                abstract = " ".join([t.text for t in abstract_texts if t.text]) or "Sem resumo disponível."
                results.append(f"[PMID: {pmid}] {title}\nResumo: {abstract[:600]}...")

            return f"[PubMed — Busca: '{query}']\n\n" + "\n\n---\n\n".join(results)

    except Exception as e:
        return f"[PubMed] Erro na busca: {str(e)}"


def _build_pubmed_query(user_query: str) -> str:
    """Extract key clinical terms for PubMed search from user query."""
    keywords = user_query.lower()
    if any(w in keywords for w in ['neutropenia', 'febre', 'febril']):
        return "febrile neutropenia chemotherapy management ASCO guidelines"
    if any(w in keywords for w in ['folfox', 'oxaliplatina', 'oxaliplatin']):
        return f"FOLFOX colorectal cancer {user_query[:50]}"
    if any(w in keywords for w in ['her2', 'herceptin', 'trastuzumab']):
        return f"HER2 positive breast cancer {user_query[:50]}"
    if any(w in keywords for w in ['mucosite', 'mucositis']):
        return "oral mucositis chemotherapy management grading"
    if any(w in keywords for w in ['neuropatia', 'neuropathy']):
        return "chemotherapy induced peripheral neuropathy management"
    return user_query[:100]


async def run_doctor_agent(
    user_query: str,
    chat_history: List[dict] = None
) -> str:
    """Run the Clinical AI agent to answer a doctor's query.

    Fetches PubMed papers directly (no LangGraph tool calling) to avoid
    the thought_signature issue with Gemini thinking models. Then passes
    structured context to the LLM for a single-shot, well-cited response.

    Args:
        user_query: The medical question from the doctor.
        chat_history: Optional history dicts with "role" and "content".

    Returns:
        Structured markdown string with PENSAMENTO, RESPOSTA CLÍNICA, and FONTES.
    """
    if chat_history is None:
        chat_history = []

    pubmed_query = _build_pubmed_query(user_query)
    pubmed_results = await _search_pubmed(pubmed_query)

    augmented_prompt = f"""Pergunta clínica do médico: {user_query}

---
ARTIGOS CIENTÍFICOS RECUPERADOS DO PUBMED:
{pubmed_results}
---

Responda estruturando em [PENSAMENTO], [RESPOSTA CLÍNICA] e [FONTES E REFERÊNCIAS] conforme suas instruções."""

    import google.genai as genai
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = _SYSTEM_PROMPT + "\n\n[Histórico do Chat Clínico]\n"
    for msg in chat_history[-6:]:
        role = "Doutor" if msg["role"] == "user" else "Ani"
        prompt += f"{role}: {msg['content']}\n"
    prompt += "\n" + augmented_prompt

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error in Gemini: {e}")
        return "Erro de conexão com o provedor de IA Clínica."
