"""运营大盘统计数据路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import (
    Agent,
    DigitalEmployee,
    ExecutionLog,
    License,
    McpTool,
    PluginBundle,
    Skill,
    Solution,
    Team,
    User,
)
from app.models import DashboardStats

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """获取平台所有资源的统计数据。"""
    stats = DashboardStats()

    for attr, model in [
        ("total_teams", Team),
        ("total_skills", Skill),
        ("total_mcp_tools", McpTool),
        ("total_agents", Agent),
        ("total_solutions", Solution),
        ("total_plugin_bundles", PluginBundle),
        ("total_digital_employees", DigitalEmployee),
        ("total_users", User),
        ("total_executions", ExecutionLog),
        ("total_licenses", License),
    ]:
        result = await db.execute(select(func.count()).select_from(model))
        setattr(stats, attr, result.scalar() or 0)

    # 待审核技能
    pending = await db.execute(select(func.count()).select_from(Skill).where(Skill.status.in_(["draft", "review"])))
    stats.total_pending_skills = pending.scalar() or 0

    return stats
