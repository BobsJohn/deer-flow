"""Solution (方案 Workflow) CRUD 路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import Solution
from app.models import SolutionCreate, SolutionOut, SolutionUpdate
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/solutions", tags=["solutions"])


@router.get("", response_model=list[SolutionOut])
async def list_solutions(
    team_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Solution)
    if team_id is not None:
        stmt = stmt.where(Solution.team_id == team_id)
    if status is not None:
        stmt = stmt.where(Solution.status == status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Solution.id)
    result = await db.execute(stmt)
    return [_solution_to_out(s) for s in result.scalars().all()]


@router.get("/{solution_id}", response_model=SolutionOut)
async def get_solution(solution_id: int, db: AsyncSession = Depends(get_db)):
    solution = await db.get(Solution, solution_id)
    if solution is None:
        raise_not_found("Solution", solution_id)
    return _solution_to_out(solution)


@router.post("", response_model=SolutionOut, status_code=201)
async def create_solution(body: SolutionCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    solution = Solution(
        team_id=team_id,
        name=body.name,
        description=body.description,
        agent_flow=dump_json_field(body.agent_flow),
        status=body.status,
    )
    db.add(solution)
    await db.commit()
    await db.refresh(solution)
    return _solution_to_out(solution)


@router.put("/{solution_id}", response_model=SolutionOut)
async def update_solution(solution_id: int, body: SolutionUpdate, db: AsyncSession = Depends(get_db)):
    solution = await db.get(Solution, solution_id)
    if solution is None:
        raise_not_found("Solution", solution_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "agent_flow":
            setattr(solution, field, dump_json_field(value))
        else:
            setattr(solution, field, value)
    solution.version += 1

    await db.commit()
    await db.refresh(solution)
    return _solution_to_out(solution)


@router.delete("/{solution_id}", status_code=204)
async def delete_solution(solution_id: int, db: AsyncSession = Depends(get_db)):
    solution = await db.get(Solution, solution_id)
    if solution is None:
        raise_not_found("Solution", solution_id)
    await db.delete(solution)
    await db.commit()


def _solution_to_out(s: Solution) -> SolutionOut:
    return SolutionOut(
        id=s.id,
        team_id=s.team_id,
        name=s.name,
        description=s.description,
        agent_flow=parse_json_field(s.agent_flow, []),
        version=s.version,
        status=s.status,
        created_at=s.created_at,
    )
