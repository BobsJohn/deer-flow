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
from app.auth import get_current_user

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


@router.get("/mine", response_model=list[SkillOut])
async def list_my_skills(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """当前用户所在团队的技能列表。"""
    stmt = select(Skill).where(Skill.team_id == current_user.get("team_id")).order_by(Skill.updated_at.desc())
    rows = (await db.execute(stmt)).scalars().all()
    return [_skill_to_out(s) for s in rows]


@router.get("/{skill_id}", response_model=SkillOut)
async def get_skill(skill_id: str, db: AsyncSession = Depends(get_db)):
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
        category=dump_json_field(body.category),
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
async def update_skill(skill_id: str, body: SkillUpdate, db: AsyncSession = Depends(get_db)):
    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "tags" or field == "category":
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
        category=parse_json_field(skill.category, []),
        tags=parse_json_field(skill.tags, []),
        version=skill.version,
        status=skill.status,
        plugin_bundle_id=skill.plugin_bundle_id,
        created_at=skill.created_at,
        updated_at=skill.updated_at,
    )


@router.get("/mine", response_model=list[SkillOut])
async def list_my_skills(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """当前用户所在团队的技能列表。"""
    stmt = select(Skill).where(Skill.team_id == current_user.get("team_id")).order_by(Skill.updated_at.desc())
    rows = (await db.execute(stmt)).scalars().all()
    result = []
    for skill in rows:
        result.append(SkillOut(
            id=skill.id, team_id=skill.team_id,
            name=skill.name, description=skill.description,
            type=skill.type, permission_level=skill.permission_level,
            category=parse_json_field(skill.category, []),
            tags=parse_json_field(skill.tags, []),
            version=skill.version, status=skill.status,
            plugin_bundle_id=skill.plugin_bundle_id,
            created_at=skill.created_at, updated_at=skill.updated_at,
        ))
    return [_skill_to_out(s) for s in result]


@router.put("/{skill_id}/resubmit", response_model=SkillOut)
async def resubmit_skill(
    skill_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """重新提交审核（仅 draft→review）。"""
    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)
    if skill.status != "draft":
        raise HTTPException(status_code=400, detail="仅草稿状态的技能可以重新提交")
    if skill.team_id != current_user.get("team_id"):
        raise HTTPException(status_code=403, detail="无权操作此技能")
    skill.status = "review"
    await db.commit()
    await db.refresh(skill)
    return SkillOut(
        id=skill.id, team_id=skill.team_id,
        name=skill.name, description=skill.description,
        type=skill.type, permission_level=skill.permission_level,
        category=parse_json_field(skill.category, []),
        tags=parse_json_field(skill.tags, []),
        version=skill.version, status=skill.status,
        plugin_bundle_id=skill.plugin_bundle_id,
        created_at=skill.created_at, updated_at=skill.updated_at,
    )


@router.post("/{skill_id}/install")
async def install_skill(
    skill_id: int,
    force: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """安装 Skill 到 DeerFlow skills/custom/ 目录。"""
    import os
    from pathlib import Path

    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)

    # 权限校验
    if skill.permission_level == "commercial":
        raise HTTPException(status_code=403, detail="商业级技能需要有效的 License 才能使用")
    if skill.status != "published":
        raise HTTPException(status_code=400, detail="仅已发布的技能可以安装")

    content = skill.content_public or f"# {skill.name}\n\n{skill.description}\n"
    tags_str = ", ".join(parse_json_field(skill.tags, []))
    category_str = ", ".join(parse_json_field(skill.category, []))

    # 生成 SKILL.md
    skill_md = f"""---
name: {skill.name}
description: {skill.description}
---

# {skill.name}

{skill.description}

## Metadata

- **Category**: {category_str}
- **Tags**: {tags_str}
- **Type**: {skill.type}
- **Permission Level**: {skill.permission_level}

## Instructions

{content}
"""

    # 目标路径: deer-flow/skills/custom/
    base = Path(__file__).resolve().parent.parent.parent.parent / "skills" / "custom"
    target_dir = base / skill.name.replace(" ", "-").lower()
    target_file = target_dir / "SKILL.md"

    target_dir.mkdir(parents=True, exist_ok=True)

    if target_file.exists() and not force:
        raise HTTPException(
            status_code=409,
            detail=f"技能已存在: {target_file}",
        )

    target_file.write_text(skill_md, encoding="utf-8")

    return {"success": True, "path": str(target_file.relative_to(base.parent.parent))}
