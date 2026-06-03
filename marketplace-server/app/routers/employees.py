"""DigitalEmployee CRUD 路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import DigitalEmployee
from app.models import DigitalEmployeeCreate, DigitalEmployeeOut, DigitalEmployeeUpdate
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/employees", tags=["employees"])


@router.get("", response_model=list[DigitalEmployeeOut])
async def list_employees(
    team_id: int | None = None,
    tone: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(DigitalEmployee)
    if team_id is not None:
        stmt = stmt.where(DigitalEmployee.team_id == team_id)
    if tone is not None:
        stmt = stmt.where(DigitalEmployee.tone == tone)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(DigitalEmployee.id)
    result = await db.execute(stmt)
    return [_de_to_out(de) for de in result.scalars().all()]


@router.get("/{employee_id}", response_model=DigitalEmployeeOut)
async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    de = await db.get(DigitalEmployee, employee_id)
    if de is None:
        raise_not_found("DigitalEmployee", employee_id)
    return _de_to_out(de)


@router.post("", response_model=DigitalEmployeeOut, status_code=201)
async def create_employee(body: DigitalEmployeeCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    de = DigitalEmployee(
        team_id=team_id,
        name=body.name,
        description=body.description,
        avatar=body.avatar,
        system_prompt_id=body.system_prompt_id,
        plugin_bundle_ids=dump_json_field(body.plugin_bundle_ids),
        tone=body.tone,
        response_style=body.response_style,
        max_permission_level=body.max_permission_level,
    )
    db.add(de)
    await db.commit()
    await db.refresh(de)
    return _de_to_out(de)


@router.put("/{employee_id}", response_model=DigitalEmployeeOut)
async def update_employee(employee_id: int, body: DigitalEmployeeUpdate, db: AsyncSession = Depends(get_db)):
    de = await db.get(DigitalEmployee, employee_id)
    if de is None:
        raise_not_found("DigitalEmployee", employee_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "plugin_bundle_ids":
            setattr(de, field, dump_json_field(value))
        else:
            setattr(de, field, value)

    await db.commit()
    await db.refresh(de)
    return _de_to_out(de)


@router.delete("/{employee_id}", status_code=204)
async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    de = await db.get(DigitalEmployee, employee_id)
    if de is None:
        raise_not_found("DigitalEmployee", employee_id)
    await db.delete(de)
    await db.commit()


def _de_to_out(de: DigitalEmployee) -> DigitalEmployeeOut:
    return DigitalEmployeeOut(
        id=de.id,
        team_id=de.team_id,
        name=de.name,
        description=de.description,
        avatar=de.avatar,
        system_prompt_id=de.system_prompt_id,
        plugin_bundle_ids=parse_json_field(de.plugin_bundle_ids, []),
        tone=de.tone,
        response_style=de.response_style,
        max_permission_level=de.max_permission_level,
        created_at=de.created_at,
    )
