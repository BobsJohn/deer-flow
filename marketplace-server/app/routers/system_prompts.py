"""SystemPrompt CRUD 路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import SystemPrompt
from app.models import SystemPromptCreate, SystemPromptOut, SystemPromptUpdate
from app.routers.common import raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/system-prompts", tags=["system_prompts"])


@router.get("", response_model=list[SystemPromptOut])
async def list_system_prompts(
    team_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SystemPrompt)
    if team_id is not None:
        stmt = stmt.where(SystemPrompt.team_id == team_id)
    if status is not None:
        stmt = stmt.where(SystemPrompt.status == status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(SystemPrompt.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{prompt_id}", response_model=SystemPromptOut)
async def get_system_prompt(prompt_id: int, db: AsyncSession = Depends(get_db)):
    prompt = await db.get(SystemPrompt, prompt_id)
    if prompt is None:
        raise_not_found("SystemPrompt", prompt_id)
    return prompt


@router.post("", response_model=SystemPromptOut, status_code=201)
async def create_system_prompt(body: SystemPromptCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    prompt = SystemPrompt(
        team_id=team_id,
        name=body.name,
        description=body.description,
        content=body.content,
        status=body.status,
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return prompt


@router.put("/{prompt_id}", response_model=SystemPromptOut)
async def update_system_prompt(prompt_id: int, body: SystemPromptUpdate, db: AsyncSession = Depends(get_db)):
    prompt = await db.get(SystemPrompt, prompt_id)
    if prompt is None:
        raise_not_found("SystemPrompt", prompt_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prompt, field, value)
    prompt.version += 1

    await db.commit()
    await db.refresh(prompt)
    return prompt


@router.delete("/{prompt_id}", status_code=204)
async def delete_system_prompt(prompt_id: int, db: AsyncSession = Depends(get_db)):
    prompt = await db.get(SystemPrompt, prompt_id)
    if prompt is None:
        raise_not_found("SystemPrompt", prompt_id)
    await db.delete(prompt)
    await db.commit()
