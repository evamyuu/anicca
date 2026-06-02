import asyncio
import sys
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.infrastructure.database.models import Base
from src.infrastructure.database.models import PatientModel
from src.config import settings

DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def main(phone: str):
    if not phone.startswith("+"):
        phone = f"+{phone}"

    async with async_session() as session:
        # Check if exists
        # In a real scenario we'd use repositories, but this is a quick raw insert
        patient = PatientModel(
            id=str(uuid.uuid4()),
            name_encrypted="Usuário de Teste (WhatsApp)",
            whatsapp_phone=phone,
            date_of_birth="1980-01-01",
            cancer_type="breast",
            cancer_stage="II",
            treatment_modality="sus",
            journey_phase="active_treatment",
            ani_personality="mentor",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(patient)
        await session.commit()
        print(f"✅ Paciente de teste criado com sucesso com o número: {phone}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python insert_test_patient.py <numero_whatsapp_com_codigo_pais>")
        print("Exemplo: python insert_test_patient.py 5511999999999")
        sys.exit(1)
    asyncio.run(main(sys.argv[1]))
