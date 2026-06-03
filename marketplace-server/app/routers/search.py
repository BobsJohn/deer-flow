"""全局搜索路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import Agent, McpTool, Skill, Solution
from app.models import SearchResultItem, SearchResults

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace", tags=["search"])


@router.get("/search", response_model=SearchResults)
async def global_search(q: str, db: AsyncSession = Depends(get_db)):
    """全局搜索：跨 Skill、Agent、McpTool、Solution 搜索名称和描述。"""
    if not q.strip():
        return SearchResults(query=q, results=[])

    like_pattern = f"%{q}%"
    results: list[SearchResultItem] = []

    # 搜索 Skill
    stmt = select(Skill).where(
        or_(Skill.name.ilike(like_pattern), Skill.description.ilike(like_pattern))
    ).limit(20)
    rows = (await db.execute(stmt)).scalars().all()
    for r in rows:
        results.append(SearchResultItem(resource_type="skill", resource_id=r.id, name=r.name, description=r.description[:200]))

    # 搜索 Agent
    stmt = select(Agent).where(
        or_(Agent.name.ilike(like_pattern), Agent.description.ilike(like_pattern))
    ).limit(20)
    rows = (await db.execute(stmt)).scalars().all()
    for r in rows:
        results.append(SearchResultItem(resource_type="agent", resource_id=r.id, name=r.name, description=r.description[:200]))

    # 搜索 McpTool
    stmt = select(McpTool).where(
        or_(McpTool.name.ilike(like_pattern), McpTool.description.ilike(like_pattern))
    ).limit(20)
    rows = (await db.execute(stmt)).scalars().all()
    for r in rows:
        results.append(SearchResultItem(resource_type="mcp_tool", resource_id=r.id, name=r.name, description=r.description[:200]))

    # 搜索 Solution
    stmt = select(Solution).where(
        or_(Solution.name.ilike(like_pattern), Solution.description.ilike(like_pattern))
    ).limit(20)
    rows = (await db.execute(stmt)).scalars().all()
    for r in rows:
        results.append(SearchResultItem(resource_type="solution", resource_id=r.id, name=r.name, description=r.description[:200]))

    return SearchResults(query=q, results=results)
