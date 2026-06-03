"""知识库路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import KbDocument, KnowledgeBase
from app.models import (
    KbDocumentOut,
    KnowledgeBaseCreate,
    KnowledgeBaseOut,
    KnowledgeBaseUpdate,
)
from app.routers.common import raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/knowledge", tags=["knowledge"])


# ─── KnowledgeBase ───

@router.get("/bases", response_model=list[KnowledgeBaseOut])
async def list_knowledge_bases(
    team_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(KnowledgeBase)
    if team_id is not None:
        stmt = stmt.where(KnowledgeBase.team_id == team_id)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(KnowledgeBase.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/bases/{kb_id}", response_model=KnowledgeBaseOut)
async def get_knowledge_base(kb_id: int, db: AsyncSession = Depends(get_db)):
    kb = await db.get(KnowledgeBase, kb_id)
    if kb is None:
        raise_not_found("KnowledgeBase", kb_id)
    return kb


@router.post("/bases", response_model=KnowledgeBaseOut, status_code=201)
async def create_knowledge_base(body: KnowledgeBaseCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    kb = KnowledgeBase(team_id=team_id, name=body.name, description=body.description)
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    return kb


@router.put("/bases/{kb_id}", response_model=KnowledgeBaseOut)
async def update_knowledge_base(kb_id: int, body: KnowledgeBaseUpdate, db: AsyncSession = Depends(get_db)):
    kb = await db.get(KnowledgeBase, kb_id)
    if kb is None:
        raise_not_found("KnowledgeBase", kb_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kb, field, value)

    await db.commit()
    await db.refresh(kb)
    return kb


@router.delete("/bases/{kb_id}", status_code=204)
async def delete_knowledge_base(kb_id: int, db: AsyncSession = Depends(get_db)):
    kb = await db.get(KnowledgeBase, kb_id)
    if kb is None:
        raise_not_found("KnowledgeBase", kb_id)
    await db.delete(kb)
    await db.commit()


# ─── KbDocument ───

@router.get("/bases/{kb_id}/documents", response_model=list[KbDocumentOut])
async def list_kb_documents(kb_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(KbDocument).where(KbDocument.knowledge_base_id == kb_id).order_by(KbDocument.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/documents/{doc_id}", status_code=204)
async def delete_kb_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    doc = await db.get(KbDocument, doc_id)
    if doc is None:
        raise_not_found("KbDocument", doc_id)
    await db.delete(doc)
    await db.commit()
