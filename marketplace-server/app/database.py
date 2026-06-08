"""SQLite + SQLAlchemy 引擎和会话管理。"""

import os
from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_URL = os.getenv(
    "MARKETPLACE_DATABASE_URL",
    f"sqlite+aiosqlite:///{DB_DIR / 'marketplace.db'}",
)

engine = create_async_engine(DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: yield an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Create all tables (call once at startup)."""
    from app.db_models import (  # noqa: F401
        Agent,
        ApiKey,
        AuditLog,
        DigitalEmployee,
        ExecutionLog,
        KbDocument,
        KnowledgeBase,
        License,
        McpTool,
        PluginBundle,
        Skill,
        SkillVersion,
        Solution,
        SystemPrompt,
        Team,
        User,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
