"""
Implementation of doctor_router.

Module:    apps.api.src.presentation.routers.doctor_router
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from src.infrastructure.database.session import get_db_session
from src.infrastructure.database.models import PatientModel, RoutineModel, BodyMapEntryModel, MessageModel, doctor_patients
from src.infrastructure.agents.graph.doctor_graph import run_doctor_agent

class DoctorChatRequest(BaseModel):
    query: str
    chat_history: list[dict] = []


router = APIRouter()


@router.get(
    "/patients",
    summary="List all patients for the dashboard",
)
async def list_patients(doctor_id: Optional[str] = None, db: AsyncSession = Depends(get_db_session)):
    """Fetch real patients from the PostgreSQL DB linked to the doctor."""
    
    query = select(PatientModel)
    if doctor_id:
        query = query.join(doctor_patients, PatientModel.id == doctor_patients.c.patient_id).where(doctor_patients.c.doctor_id == doctor_id)
        
    result = await db.execute(query)
    patients = result.scalars().all()
    
    if not patients:
        return []

    dashboard_data = []
    for p in patients:
        risk = "Baixo"
        if "Mama" in p.cancer_type: risk = "Médio"
        if "Cólon" in p.cancer_type: risk = "Alto"

        dashboard_data.append({
            "id": str(p.id),
            "name": p.name_encrypted,
            "cancer_type": p.cancer_type,
            "cancer_stage": p.cancer_stage,
            "protocol": p.treatment_types[0] if p.treatment_types else "Não definido",
            "risk_level": risk,
            "leukocytes": "N/A"
        })

    return dashboard_data


@router.get(
    "/sessions",
    summary="List all chat sessions for the doctor's patients",
)
async def get_doctor_sessions(doctor_id: Optional[str] = None, db: AsyncSession = Depends(get_db_session)):
    query = select(MessageModel)
    if doctor_id:
        query = query.join(doctor_patients, MessageModel.patient_id == doctor_patients.c.patient_id).where(doctor_patients.c.doctor_id == doctor_id)
    
    query = query.order_by(MessageModel.created_at.asc())
    result = await db.execute(query)
    messages = result.scalars().all()
    
    sessions_dict = {}
    for m in messages:
        if m.session_id not in sessions_dict:
            sessions_dict[m.session_id] = {
                "id": m.session_id,
                "patientId": str(m.patient_id),
                "preview": (m.text[:40] + "...") if m.text else "Nova sessão",
                "date": m.created_at.strftime("%d/%m/%Y"),
                "messages": []
            }
        
        sessions_dict[m.session_id]["messages"].append({
            "id": m.id,
            "role": m.role,
            "content": m.text,
            "timestamp": m.created_at.isoformat()
        })
        
    # Sort sessions by most recent message (last message in the array)
    sorted_sessions = sorted(
        sessions_dict.values(),
        key=lambda s: s["messages"][-1]["timestamp"] if s["messages"] else "",
        reverse=True
    )
    return sorted_sessions

@router.get(
    "/patients/{patient_id}/dashboard",
    summary="Get patient clinical dashboard details",
)
async def get_patient_dashboard(patient_id: str, db: AsyncSession = Depends(get_db_session)):
    """Fetch detailed clinical status (vitals, alerts) for the main Next.js board."""
    
    from sqlalchemy import desc

    # Fetch latest routines for vitals
    routine_result = await db.execute(
        select(RoutineModel)
        .where(RoutineModel.patient_id == patient_id)
        .order_by(desc(RoutineModel.created_at))
        .limit(1)
    )
    routine = routine_result.scalar_one_or_none()

    vitals = {
        "temperature": "N/A",
        "blood_pressure": "120x80 mmHg", # mock as no bp in model
        "weight": "64.5 kg" # mock as no weight in model
    }
    if routine:
        vitals = {
            "temperature": f"{routine.temperature} °C" if routine.temperature else "37.8°C",
            "blood_pressure": "120x80 mmHg",
            "weight": "64.5 kg"
        }

    # Fetch recent body map entries for alerts
    body_map_result = await db.execute(
        select(BodyMapEntryModel)
        .where(BodyMapEntryModel.patient_id == patient_id)
        .order_by(desc(BodyMapEntryModel.registered_at))
        .limit(5)
    )
    body_map_entries = body_map_result.scalars().all()
    
    import boto3
    from src.config import settings
    
    s3_client = None
    try:
        s3_client = boto3.client(
            "s3", 
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
    except Exception as e:
        print(f"Failed to initialize S3 client: {e}")
    
    alerts = []
    for entry in body_map_entries:
        alert_text = f"Sintoma relatado: {', '.join(entry.symptom_types)} na região {entry.body_region} (Intensidade: {entry.intensity}/10)"
        
        cv_data = None
        if entry.cv_classification:
            cv_notes = entry.cv_classification.get("clinical_notes", "") if isinstance(entry.cv_classification, dict) else str(entry.cv_classification)
            
            display_url = entry.photo_url
            if display_url and "amazonaws.com" in display_url and s3_client:
                try:
                    key = display_url.split(".amazonaws.com/")[1]
                    display_url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': settings.AWS_S3_BUCKET, 'Key': key},
                        ExpiresIn=3600
                    )
                except Exception as e:
                    print(f"Failed to presign URL: {e}")

            cv_data = {
                "photo_url": display_url,
                "classification": cv_notes,
            }
            alert_text += " [Análise Visual Concluída]"
            
        alerts.append({
            "text": alert_text,
            "cv_data": cv_data,
            "date": entry.registered_at.isoformat()
        })
        
    if not alerts:
        alerts = [{"text": "Nenhum sintoma grave reportado recentemente.", "cv_data": None}]

    # Run ML Model (XGBoost) for Abandonment Risk
    from src.infrastructure.agents.ml.abandonment_model import AbandonmentRiskModel
    ml_data = {
        "cancer_stage": "III" # mock (evitando Lazy Load exception em async)
    }
    ml_insights = await AbandonmentRiskModel().predict(ml_data)

    import google.genai as genai
    from src.config import settings
    
    briefing_text = "Nenhum dado clínico recente disponível para análise."
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = f"""
        Gere um resumo clínico de no máximo 3 frases para o painel do médico sobre este paciente.
        Últimos sinais vitais: Temperatura: {vitals.get('temperature')}, PA: {vitals.get('blood_pressure')}.
        Sintomas e alertas recentes: {', '.join([a['text'] for a in alerts]) if alerts else 'Nenhum'}.
        Foque nos achados mais importantes e no risco de complicação. Não use markdown, apenas texto puro.
        """
        
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        briefing_text = response.text.strip()
    except Exception as e:
        print(f"Failed to generate briefing: {e}")
        briefing_text = "Paciente em acompanhamento ativo (Resumo IA indisponível)."

    return {
        "vitals": vitals,
        "alerts": alerts,
        "ml_insights": ml_insights,
        "briefing": briefing_text
    }

@router.post(
    "/ai-chat",
    summary="Interact with the Clinical AI Agent (PubMed enabled)",
)
async def ai_clinical_chat(request: DoctorChatRequest):
    """Ask the clinical LangGraph agent a medical question.
    
    The agent will autonomously query the NCBI PubMed database if necessary,
    synthesizing the latest oncology abstracts to provide a scientific answer.
    """
    try:
        response_text = await run_doctor_agent(
            user_query=request.query,
            chat_history=request.chat_history
        )
        return {"response": response_text}
    except Exception as e:
        print(f"Error in Clinical AI Chat: {e}")
        raise HTTPException(status_code=500, detail="Error generating clinical response from PubMed.")
