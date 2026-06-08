"""管理员专用路由：用户管理、资产审核。"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import admin_required
from app.database import get_db
from app.db_models import AuditLog, Skill, Team, User
from app.models import SkillOut, UserOut
from app.routers.common import parse_json_field, raise_not_found

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/marketplace/admin", tags=["admin"], dependencies=[Depends(admin_required)])


@router.get("/users", response_model=list[dict])
async def admin_list_users(db: AsyncSession = Depends(get_db)):
    """全平台用户列表，含所属团队名称。"""
    stmt = select(User, Team.name.label("team_name")).join(Team, User.team_id == Team.id).order_by(User.id)
    rows = await db.execute(stmt)
    result = []
    for user, team_name in rows:
        result.append({
            "id": user.id,
            "team_id": user.team_id,
            "team_name": team_name,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        })
    return result


@router.put("/users/{user_id}/role")
async def admin_update_role(
    user_id: int,
    body: dict,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    """修改用户角色。禁止修改自己的角色。"""
    if user_id == current_user.get("user_id"):
        raise HTTPException(status_code=400, detail="不能修改自己的角色")

    new_role = body.get("role")
    if new_role not in ("user", "developer", "admin"):
        raise HTTPException(status_code=422, detail="Invalid role")

    # 防止移除最后一个 admin
    if new_role != "admin":
        admin_count = (await db.execute(select(User).where(User.role == "admin"))).scalars().all()
        if len(admin_count) <= 1:
            user_to_update = await db.get(User, user_id)
            if user_to_update and user_to_update.role == "admin":
                raise HTTPException(status_code=400, detail="至少保留一个管理员")

    user = await db.get(User, user_id)
    if user is None:
        raise_not_found("User", user_id)

    old_role = user.role
    user.role = new_role
    db.add(AuditLog(
        user_id=current_user["user_id"],
        user_name=user.name,
        action="update_role",
        target_type="user",
        target_id=user_id,
        detail=str({"old_role": old_role, "new_role": new_role, "target_email": user.email}),
    ))
    await db.commit()
    return {"success": True}


@router.get("/skills/pending", response_model=list[SkillOut])
async def admin_list_pending_skills(db: AsyncSession = Depends(get_db)):
    """待审核技能列表（status = draft 或 review）。"""
    stmt = select(Skill).where(Skill.status.in_(["draft", "review"])).order_by(Skill.updated_at.desc())
    rows = (await db.execute(stmt)).scalars().all()
    result = []
    for skill in rows:
        result.append(SkillOut(
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
        ))
    return result


@router.put("/skills/{skill_id}/review")
async def admin_review_skill(skill_id: int, body: dict, current_user: dict = Depends(admin_required), db: AsyncSession = Depends(get_db)):
    """审核通过或驳回 Skill。"""
    new_status = body.get("status")
    if new_status not in ("published", "draft"):
        raise HTTPException(status_code=422, detail="Status must be 'published' or 'draft'")
    skill = await db.get(Skill, skill_id)
    if skill is None:
        raise_not_found("Skill", skill_id)
    old_status = skill.status
    skill.status = new_status
    db.add(AuditLog(
        user_id=current_user["user_id"],
        user_name=current_user.get("name", ""),
        action="review_skill",
        target_type="skill",
        target_id=skill_id,
        detail=str({"old_status": old_status, "new_status": new_status, "reason": body.get("reason", "")}),
    ))
    await db.commit()
    return {"success": True, "status": new_status}


@router.get("/audit-logs", response_model=list[dict])
async def admin_list_audit_logs(db: AsyncSession = Depends(get_db)):
    """操作日志列表，最近 100 条。"""
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100)
    rows = (await db.execute(stmt)).scalars().all()
    return [
        {"id": r.id, "user_name": r.user_name, "action": r.action,
         "target_type": r.target_type, "target_id": r.target_id,
         "detail": r.detail, "created_at": r.created_at.isoformat()}
        for r in rows
    ]


@router.get("/dashboard/trends")
async def admin_dashboard_trends(db: AsyncSession = Depends(get_db)):
    """趋势数据：过去 7 天新增数。"""
    from datetime import datetime, timedelta, timezone
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    new_skills = (await db.execute(select(Skill).where(Skill.created_at >= seven_days_ago))).scalars().all()
    new_users = (await db.execute(select(User).where(User.created_at >= seven_days_ago))).scalars().all()
    return {
        "new_skills_7d": len(new_skills),
        "new_users_7d": len(new_users),
    }
