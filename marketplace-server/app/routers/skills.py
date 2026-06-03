"""Skill CRUD 路由。"""

import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import Skill, SkillVersion
from app.models import (
    SkillCreate,
    SkillOut,
    SkillUpdate,
    SkillVersionOut,
)
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/skills", tags=["skills"])


@router.get("", response_model=list[SkillOut])
async def list_skills(
    team_id: int | None = None,
    status: str | None = None,
    type: str | None = None,
    permission_level: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Skill)
    if team_id is not None:
        stmt = stmt.where(Skill.team_id == team_id)
    if status is not None:
        stmt = stmt.where(Skill.status == status)
    if type is not None:
        stmt = stmt.where(Skill.type == type)
    if permission_level is not None:
        stmt = stmt.where(Skill.permission_level == permission_level)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Skill.id)
    result = await db.execute(stmt)
    skills = result.scalars().all()
    return [_skill_to_out(s) for s in skills]


@router.get("/{skill_id}", response_model=SkillOut)
async def get_skill(skill_id: int, db: AsyncSession = Depends(get_db)):
    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)
    return _skill_to_out(skill)


@router.post("", response_model=SkillOut, status_code=201)
async def create_skill(body: SkillCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    skill = Skill(
        team_id=team_id,
        name=body.name,
        description=body.description,
        type=body.type,
        permission_level=body.permission_level,
        content_public=body.content_public,
        content_encrypted=body.content_encrypted,
        category=body.category,
        tags=dump_json_field(body.tags),
        input_schema=dump_json_field(body.input_schema),
        output_schema=dump_json_field(body.output_schema),
        examples=dump_json_field(body.examples),
        status=body.status,
    )
    db.add(skill)
    await db.flush()

    sv = SkillVersion(skill_id=skill.id, version=1, content_snapshot=body.content_public)
    db.add(sv)

    await db.commit()
    await db.refresh(skill)
    return _skill_to_out(skill)


@router.put("/{skill_id}", response_model=SkillOut)
async def update_skill(skill_id: int, body: SkillUpdate, db: AsyncSession = Depends(get_db)):
    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "tags":
            setattr(skill, field, dump_json_field(value))
        elif field in ("input_schema", "output_schema", "examples"):
            setattr(skill, field, dump_json_field(value))
        else:
            setattr(skill, field, value)

    skill.version += 1

    sv = SkillVersion(skill_id=skill.id, version=skill.version, content_snapshot=skill.content_public)
    db.add(sv)

    await db.commit()
    await db.refresh(skill)
    return _skill_to_out(skill)


@router.delete("/{skill_id}", status_code=204)
async def delete_skill(skill_id: int, db: AsyncSession = Depends(get_db)):
    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)
    await db.delete(skill)
    await db.commit()


@router.get("/{skill_id}/versions", response_model=list[SkillVersionOut])
async def list_skill_versions(skill_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(SkillVersion).where(SkillVersion.skill_id == skill_id).order_by(SkillVersion.version.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


def _skill_to_out(skill: Skill) -> SkillOut:
    return SkillOut(
        id=skill.id,
        team_id=skill.team_id,
        name=skill.name,
        description=skill.description,
        type=skill.type,
        permission_level=skill.permission_level,
        category=skill.category,
        tags=parse_json_field(skill.tags, []),
        version=skill.version,
        status=skill.status,
        plugin_bundle_id=skill.plugin_bundle_id,
        created_at=skill.created_at,
        updated_at=skill.updated_at,
    )
