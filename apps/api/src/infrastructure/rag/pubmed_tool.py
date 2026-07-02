"""
PubMed Integration Tool for Medical LangGraph.

Uses NCBI Entrez E-utilities to search real medical abstracts and guidelines
worldwide without mocks.
API Reference: https://www.ncbi.nlm.nih.gov/books/NBK25500/

Module:    src.infrastructure.rag.pubmed_tool
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import httpx
import xml.etree.ElementTree as ET
from langchain_core.tools import tool

@tool
async def search_pubmed(query: str, max_results: int = 3) -> str:
    """
    Search the NCBI PubMed database for real, peer-reviewed medical abstracts.
    Useful for answering clinical questions, finding oncological guidelines, or checking recent medical literature.
    
    Args:
        query: The medical search terms (e.g., "colon cancer FOLFOX neutropenia guidelines").
        max_results: Number of papers to retrieve.
        
    Returns:
        A formatted string containing the titles and abstracts of the retrieved medical papers.
    """
    # 1. eSearch: Get PubMed IDs matching the query
    search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    search_params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": max_results
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            search_resp = await client.get(search_url, params=search_params)
            search_resp.raise_for_status()
            
            data = search_resp.json()
            id_list = data.get("esearchresult", {}).get("idlist", [])
            
            if not id_list:
                return "No recent medical papers found on PubMed for this query."
                
            # 2. eFetch: Retrieve XML abstracts for the found IDs
            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
            fetch_params = {
                "db": "pubmed",
                "id": ",".join(id_list),
                "retmode": "xml"
            }
            
            fetch_resp = await client.get(fetch_url, params=fetch_params)
            fetch_resp.raise_for_status()
            
            # Parse XML response
            root = ET.fromstring(fetch_resp.text)
            results = []
            
            for article in root.findall(".//PubmedArticle"):
                title_elem = article.find(".//ArticleTitle")
                title = title_elem.text if title_elem is not None else "No Title"
                
                abstract_elem = article.find(".//AbstractText")
                abstract = abstract_elem.text if abstract_elem is not None else "No Abstract available."
                
                # Combine multiple abstract text segments if they exist
                if abstract_elem is not None:
                    abstract_texts = article.findall(".//AbstractText")
                    if len(abstract_texts) > 1:
                        abstract = " ".join([t.text for t in abstract_texts if t.text])
                
                results.append(f"TITLE: {title}\nABSTRACT: {abstract}")
                
            return "\n\n---\n\n".join(results)
            
    except Exception as e:
        print(f"PubMed search failed: {e}")
        return f"Error contacting PubMed database: {str(e)}"
