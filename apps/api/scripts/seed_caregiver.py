import asyncio
import sys
import uuid
from src.infrastructure.database.session import _AsyncSessionFactory
from src.infrastructure.database.models import UserModel

async def seed_caregiver():
    async with _AsyncSessionFactory() as session:
        # Check if caregiver already exists
        from sqlalchemy import select
        existing = await session.execute(select(UserModel).where(UserModel.email == "joao.cuidador@gmail.com"))
        if existing.scalar_one_or_none():
            print("Caregiver already exists.")
            return

        caregiver = UserModel(
            email="joao.cuidador@gmail.com",
            role="caregiver",
            status="active"
        )
        session.add(caregiver)
        await session.commit()
        print("Caregiver created successfully! Email: joao.cuidador@gmail.com")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_caregiver())
