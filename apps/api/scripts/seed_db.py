import asyncio
import uuid
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.session import _engine, _AsyncSessionFactory
from src.infrastructure.database.base import Base
from src.infrastructure.database.models import (
    PatientModel, UserModel, RoutineModel, BodyMapEntryModel,
    MessageModel, DocumentModel, TicketModel, JournalingModel,
    doctor_patients
)

# Helper for UTC dates
def get_past_date(days_ago):
    return datetime.now(timezone.utc) - timedelta(days=days_ago)

async def wipe_and_seed():
    print("Connecting to DB and wiping tables...")
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    print("Tables recreated. Seeding data...")
    async with _AsyncSessionFactory() as session:
        # Generate some generic avatars
        avatar_conf = {"hair": "short", "skin": "light", "accessories": "glasses"}

        # ---------------------------------------------------------
        # SCENARIO 1: Patient 1 (With phone) + Doctor 1 + Caregiver 1
        # ---------------------------------------------------------
        p1 = PatientModel(
            name_encrypted="Evelin Brandão (Paciente Principal)",
            cpf_hash="hash_cpf_1",
            date_of_birth="1990-05-15",
            cancer_type="mama",
            cancer_stage="IIB",
            treatment_modality="convenio",
            treatment_types=["quimioterapia", "cirurgia"],
            journey_phase="em_tratamento",
            diagnosis_date="2025-10-10",
            whatsapp_phone="+5511980991729",
            ani_personality="mentor"
        )
        session.add(p1)
        await session.flush()

        d1 = UserModel(
            email="dr.roberto@anicca.com",
            role="doctor",
            crm_number="CRM-SP 123456",
            avatar_config=avatar_conf
        )
        c1 = UserModel(
            email="cuidador1@anicca.com",
            role="caregiver",
            patient_id=p1.id,
            avatar_config=avatar_conf
        )
        session.add_all([d1, c1])
        await session.flush()
        # Link Doctor 1 to Patient 1
        await session.execute(insert(doctor_patients).values(doctor_id=d1.id, patient_id=p1.id))

        # ---------------------------------------------------------
        # SCENARIO 2: Patient 2 + Doctor 2 + Caregiver 2
        # ---------------------------------------------------------
        p2 = PatientModel(
            name_encrypted="Carlos Silva (Paciente 2)",
            cpf_hash="hash_cpf_2",
            date_of_birth="1980-08-20",
            cancer_type="prostata",
            cancer_stage="III",
            treatment_modality="sus",
            treatment_types=["radioterapia"],
            journey_phase="em_tratamento",
            diagnosis_date="2025-01-10",
            ani_personality="realist"
        )
        session.add(p2)
        await session.flush()

        d2 = UserModel(
            email="dra.marcia@anicca.com",
            role="doctor",
            crm_number="CRM-SP 654321",
            avatar_config=avatar_conf
        )
        c2 = UserModel(
            email="cuidador2@anicca.com",
            role="caregiver",
            patient_id=p2.id,
            avatar_config=avatar_conf
        )
        session.add_all([d2, c2])
        await session.flush()
        await session.execute(insert(doctor_patients).values(doctor_id=d2.id, patient_id=p2.id))

        # ---------------------------------------------------------
        # SCENARIO 3: Patient 3 (NO Doctor, NO Caregiver)
        # ---------------------------------------------------------
        p3 = PatientModel(
            name_encrypted="Ana Souza (Paciente 3 Solo)",
            cpf_hash="hash_cpf_3",
            date_of_birth="1995-12-05",
            cancer_type="linfoma",
            cancer_stage="I",
            treatment_modality="particular",
            treatment_types=["quimioterapia"],
            journey_phase="diagnostico",
            diagnosis_date="2026-07-20",
            ani_personality="optimist"
        )
        session.add(p3)
        await session.flush()

        # ---------------------------------------------------------
        # SCENARIO 4: Patient 4 + ONLY Caregiver 4
        # ---------------------------------------------------------
        p4 = PatientModel(
            name_encrypted="João Pedro (Paciente 4 - Só Cuidador)",
            cpf_hash="hash_cpf_4",
            date_of_birth="1975-03-30",
            cancer_type="pulmao",
            cancer_stage="IV",
            treatment_modality="sus",
            treatment_types=["imunoterapia", "paliativo"],
            journey_phase="cuidados_paliativos",
            diagnosis_date="2024-11-11",
            ani_personality="specialist"
        )
        session.add(p4)
        await session.flush()
        
        c4 = UserModel(
            email="cuidador4@anicca.com",
            role="caregiver",
            patient_id=p4.id,
            avatar_config=avatar_conf
        )
        session.add(c4)
        await session.flush()

        # Generate realistic data for all patients
        patients = [p1, p2, p3, p4]
        
        for p in patients:
            # 1. Routines (Last 7 days)
            for i in range(7):
                r_date = get_past_date(i)
                session.add(RoutineModel(
                    patient_id=p.id,
                    date=r_date.strftime("%Y-%m-%d"),
                    temperature=random.uniform(36.0, 37.8),
                    hydration_glasses=random.randint(2, 8),
                    sleep_hours=random.uniform(4.5, 9.0),
                    sleep_quality=random.randint(1, 5),
                    medications=[
                        {"name": "Ondansetrona 8mg", "period": "Manhã", "taken": random.choice([True, False])},
                        {"name": "Dipirona 1g", "period": "Noite", "taken": True}
                    ],
                    wearable_steps=random.randint(1000, 8000),
                    created_at=r_date
                ))

            # 2. Body Map Entries
            for i in range(3):
                session.add(BodyMapEntryModel(
                    patient_id=p.id,
                    body_region=random.choice(["cabeça", "tórax", "abdômen", "pernas"]),
                    body_view=random.choice(["front", "back"]),
                    intensity=random.randint(2, 8),
                    symptom_types=[random.choice(["dor", "náusea", "formigamento", "fadiga"])],
                    description="Senti isso logo após acordar.",
                    suggested_ctcae_grade=random.randint(1, 3),
                    registered_at=get_past_date(random.randint(1, 5))
                ))

            # 3. Journaling
            for i in range(2):
                session.add(JournalingModel(
                    patient_id=p.id,
                    mood=random.choice(["great", "ok", "difficult", "hard"]),
                    text_encrypted="Hoje o dia foi desafiador, mas estou confiante.",
                    shared_with_doctor=random.choice([True, False]),
                    created_at=get_past_date(random.randint(1, 5))
                ))
            
            # 4. Documents
            session.add(DocumentModel(
                patient_id=p.id,
                file_url="https://s3.amazonaws.com/fake-url/exam.pdf",
                document_type="Hemograma Completo",
                extracted_text="Leucócitos: 3500. Plaquetas: 120000.",
                summary="Seus leucócitos estão levemente baixos, o que é comum após a quimio. Procure se cuidar e evite aglomerações.",
                created_at=get_past_date(2)
            ))

            # 5. Tickets
            session.add(TicketModel(
                patient_id=p.id,
                type="doubt",
                status="resolved",
                channel="app",
                title="Dúvida sobre medicação",
                description="Posso tomar dipirona junto com o remédio do enjoo?",
                created_at=get_past_date(3)
            ))

            # 6. Messages (Chat with Ani)
            sess_id = str(uuid.uuid4())
            messages = [
                MessageModel(session_id=sess_id, patient_id=p.id, role="user", text="Olá, Ani! Estou com muita náusea hoje.", created_at=get_past_date(1)),
                MessageModel(session_id=sess_id, patient_id=p.id, role="ani", text="Sinto muito que você esteja com náuseas. Você já tomou a Ondansetrona que o seu médico prescreveu para a manhã?", created_at=get_past_date(1) + timedelta(minutes=1)),
                MessageModel(session_id=sess_id, patient_id=p.id, role="user", text="Ainda não, vou tomar agora.", created_at=get_past_date(1) + timedelta(minutes=5)),
                MessageModel(session_id=sess_id, patient_id=p.id, role="ani", text="Ótimo. Descanse um pouco e me avise se não melhorar. Se o enjoo ficar muito forte, é importante avisarmos a equipe médica.", created_at=get_past_date(1) + timedelta(minutes=6)),
            ]
            session.add_all(messages)

        await session.commit()
        print("Database seeding completed successfully!")


if __name__ == "__main__":
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(wipe_and_seed())
