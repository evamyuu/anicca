import asyncio
import uuid
from src.infrastructure.database.session import _AsyncSessionFactory
from src.infrastructure.database.models import UserModel

async def seed_doctor():
    async with _AsyncSessionFactory() as session:
        # Check if doctor already exists
        from sqlalchemy import select
        existing = await session.execute(select(UserModel).where(UserModel.email == "renata.lima@cacon.com.br"))
        if existing.scalar_one_or_none():
            print("Doctor already exists.")
            return

        doctor = UserModel(
            email="renata.lima@cacon.com.br",
            role="doctor",
            status="active",
            crm_number="45892"
        )
        session.add(doctor)
        await session.commit()
        print("Doctor created successfully! CRM: 45892")

import sys

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_doctor())
