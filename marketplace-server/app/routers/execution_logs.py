"""执行日志路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import ExecutionLog
from app.models import ExecutionLogOut
from app.routers.common import parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/execution-logs", tags=["execution_logs"])


@router.get("", response_model=list[ExecutionLogOut])
async def list_execution_logs(
    skill_id: int | None = None,
    team_id: int | None = None,
    user_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ExecutionLog)
    if skill_id is not None:
        stmt = stmt.where(ExecutionLog.skill_id == skill_id)
    if team_id is not None:
        stmt = stmt.where(ExecutionLog.team_id == team_id)
    if user_id is not None:
        stmt = stmt.where(ExecutionLog.user_id == user_id)
    if status is not None:
        stmt = stmt.where(ExecutionLog.status == status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(ExecutionLog.created_at.desc())
    result = await db.execute(stmt)
    return [_log_to_out(log) for log in result.scalars().all()]


@router.get("/{log_id}", response_model=ExecutionLogOut)
async def get_execution_log(log_id: int, db: AsyncSession = Depends(get_db)):
    log = await db.get(ExecutionLog, log_id)
    if log is None:
        raise_not_found("ExecutionLog", log_id)
    return _log_to_out(log)


def _log_to_out(log: ExecutionLog) -> ExecutionLogOut:
    return ExecutionLogOut(
        id=log.id,
        skill_id=log.skill_id,
        api_key_id=log.api_key_id,
        user_id=log.user_id,
        team_id=log.team_id,
        status=log.status,
        result=parse_json_field(log.result, {}),
        duration_ms=log.duration_ms,
        llm_calls=log.llm_calls,
        tool_calls=log.tool_calls,
        tokens_used=log.tokens_used,
        created_at=log.created_at,
    )
