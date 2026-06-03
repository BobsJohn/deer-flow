"""McpTool CRUD 路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import McpTool
from app.models import McpToolCreate, McpToolOut, McpToolUpdate
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/mcp-tools", tags=["mcp_tools"])


@router.get("", response_model=list[McpToolOut])
async def list_mcp_tools(
    team_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(McpTool)
    if team_id is not None:
        stmt = stmt.where(McpTool.team_id == team_id)
    if status is not None:
        stmt = stmt.where(McpTool.status == status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(McpTool.id)
    result = await db.execute(stmt)
    return [_tool_to_out(t) for t in result.scalars().all()]


@router.get("/{tool_id}", response_model=McpToolOut)
async def get_mcp_tool(tool_id: int, db: AsyncSession = Depends(get_db)):
    tool = await db.get(McpTool, tool_id)
    if tool is None:
        raise_not_found("McpTool", tool_id)
    return _tool_to_out(tool)


@router.post("", response_model=McpToolOut, status_code=201)
async def create_mcp_tool(body: McpToolCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    tool = McpTool(
        team_id=team_id,
        name=body.name,
        description=body.description,
        input_schema=dump_json_field(body.input_schema),
        status=body.status,
    )
    db.add(tool)
    await db.commit()
    await db.refresh(tool)
    return _tool_to_out(tool)


@router.put("/{tool_id}", response_model=McpToolOut)
async def update_mcp_tool(tool_id: int, body: McpToolUpdate, db: AsyncSession = Depends(get_db)):
    tool = await db.get(McpTool, tool_id)
    if tool is None:
        raise_not_found("McpTool", tool_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "input_schema":
            setattr(tool, field, dump_json_field(value))
        else:
            setattr(tool, field, value)
    tool.version += 1

    await db.commit()
    await db.refresh(tool)
    return _tool_to_out(tool)


@router.delete("/{tool_id}", status_code=204)
async def delete_mcp_tool(tool_id: int, db: AsyncSession = Depends(get_db)):
    tool = await db.get(McpTool, tool_id)
    if tool is None:
        raise_not_found("McpTool", tool_id)
    await db.delete(tool)
    await db.commit()


def _tool_to_out(t: McpTool) -> McpToolOut:
    return McpToolOut(
        id=t.id,
        team_id=t.team_id,
        name=t.name,
        description=t.description,
        input_schema=parse_json_field(t.input_schema, {}),
        version=t.version,
        status=t.status,
        created_at=t.created_at,
    )
