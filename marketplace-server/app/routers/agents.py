"""Agent CRUD 路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import Agent
from app.models import AgentCreate, AgentOut, AgentUpdate
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/agents", tags=["agents"])


@router.get("", response_model=list[AgentOut])
async def list_agents(
    team_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Agent)
    if team_id is not None:
        stmt = stmt.where(Agent.team_id == team_id)
    if status is not None:
        stmt = stmt.where(Agent.status == status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Agent.id)
    result = await db.execute(stmt)
    return [_agent_to_out(a) for a in result.scalars().all()]


@router.get("/{agent_id}", response_model=AgentOut)
async def get_agent(agent_id: int, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if agent is None:
        raise_not_found("Agent", agent_id)
    return _agent_to_out(agent)


@router.post("", response_model=AgentOut, status_code=201)
async def create_agent(body: AgentCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    agent = Agent(
        team_id=team_id,
        name=body.name,
        description=body.description,
        system_prompt_id=body.system_prompt_id,
        skill_ids=dump_json_field(body.skill_ids),
        mcp_tool_ids=dump_json_field(body.mcp_tool_ids),
        status=body.status,
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return _agent_to_out(agent)


@router.put("/{agent_id}", response_model=AgentOut)
async def update_agent(agent_id: int, body: AgentUpdate, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if agent is None:
        raise_not_found("Agent", agent_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ("skill_ids", "mcp_tool_ids"):
            setattr(agent, field, dump_json_field(value))
        else:
            setattr(agent, field, value)
    agent.version += 1

    await db.commit()
    await db.refresh(agent)
    return _agent_to_out(agent)


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: int, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if agent is None:
        raise_not_found("Agent", agent_id)
    await db.delete(agent)
    await db.commit()


def _agent_to_out(a: Agent) -> AgentOut:
    return AgentOut(
        id=a.id,
        team_id=a.team_id,
        name=a.name,
        description=a.description,
        system_prompt_id=a.system_prompt_id,
        skill_ids=parse_json_field(a.skill_ids, []),
        mcp_tool_ids=parse_json_field(a.mcp_tool_ids, []),
        version=a.version,
        status=a.status,
        created_at=a.created_at,
    )
