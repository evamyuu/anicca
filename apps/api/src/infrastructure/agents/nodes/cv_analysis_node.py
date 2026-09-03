"""
Body Map Computer Vision (Multimodal LLM)

Module:    apps.api.src.infrastructure.agents.nodes.cv_analysis_node
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import json
from typing import Optional, Dict

from google import genai
from google.genai import types

from src.config import settings

_CV_PROMPT = """
Você é um assistente de inteligência artificial clínica atuando no sistema Anicca (Augmented Intelligence).
Sua função é analisar uma imagem reportada por um paciente oncológico e classificar o achado visual.
O paciente relatou que está sentindo o seguinte sintoma: "{patient_symptom}" com intensidade {patient_intensity} (escala 0-10).

Sua tarefa é analisar a imagem de forma objetiva (não dê diagnósticos finais) e gerar um JSON estruturado estrito contendo:
{{
    "category": "tipo visual identificado (ex: eritema, ulceração, edema, rash, etc)",
    "severity_estimation": "estimativa de severidade (leve, moderada, grave)",
    "confidence_score": 0.0 a 1.0,
    "divergence_flag": boolean (true se a imagem parecer muito pior ou incompatível com a intensidade relatada pelo paciente),
    "clinical_notes": "observações clínicas curtas para o médico (ex: 'Padrão maculopapular visível no antebraço direito.')"
}}

Responda APENAS com o JSON.
"""

async def run_cv_analysis(
    file_bytes: bytes,
    mime_type: str,
    patient_symptom: str,
    patient_intensity: int,
) -> Optional[Dict]:
    """Runs a multimodal prompt against Gemini to classify a clinical image."""
    
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = _CV_PROMPT.format(
            patient_symptom=patient_symptom, 
            patient_intensity=patient_intensity
        )
        
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                prompt
            ]
        )
        
        # Parse JSON from response
        text = response.text
        
        # Clean markdown code blocks if present
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].strip()
            
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            return json.loads(text[start_idx:end_idx+1])
        return json.loads(text)
        
    except Exception as e:
        print(f"[CV Analysis] Failed to process image: {e}")
        return {
            "category": "Erro de Processamento",
            "severity_estimation": "N/A",
            "confidence_score": 0.0,
            "divergence_flag": False,
            "clinical_notes": f"Não foi possível processar a imagem via IA: {str(e)}"
        }

