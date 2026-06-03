"""PluginBundle CRUD 路由。"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import PluginBundle
from app.models import PluginBundleCreate, PluginBundleOut, PluginBundleUpdate
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/plugins", tags=["plugins"])


@router.get("", response_model=list[PluginBundleOut])
async def list_plugins(
    team_id: int | None = None,
    category: str | None = None,
    difficulty: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PluginBundle)
    if team_id is not None:
        stmt = stmt.where(PluginBundle.team_id == team_id)
    if category is not None:
        stmt = stmt.where(PluginBundle.category == category)
    if difficulty is not None:
        stmt = stmt.where(PluginBundle.difficulty == difficulty)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(PluginBundle.id)
    result = await db.execute(stmt)
    return [_bundle_to_out(b) for b in result.scalars().all()]


@router.get("/{bundle_id}", response_model=PluginBundleOut)
async def get_plugin(bundle_id: int, db: AsyncSession = Depends(get_db)):
    bundle = await db.get(PluginBundle, bundle_id)
    if bundle is None:
        raise_not_found("PluginBundle", bundle_id)
    return _bundle_to_out(bundle)


@router.post("", response_model=PluginBundleOut, status_code=201)
async def create_plugin(body: PluginBundleCreate, db: AsyncSession = Depends(get_db), team_id: int = 1):
    bundle = PluginBundle(
        team_id=team_id,
        name=body.name,
        description=body.description,
        category=body.category,
        skill_ids=dump_json_field(body.skill_ids),
        mcp_tool_ids=dump_json_field(body.mcp_tool_ids),
        difficulty=body.difficulty,
        prerequisites=dump_json_field(body.prerequisites),
        quick_start=body.quick_start,
        use_cases=dump_json_field(body.use_cases),
    )
    db.add(bundle)
    await db.commit()
    await db.refresh(bundle)
    return _bundle_to_out(bundle)


@router.put("/{bundle_id}", response_model=PluginBundleOut)
async def update_plugin(bundle_id: int, body: PluginBundleUpdate, db: AsyncSession = Depends(get_db)):
    bundle = await db.get(PluginBundle, bundle_id)
    if bundle is None:
        raise_not_found("PluginBundle", bundle_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ("skill_ids", "mcp_tool_ids", "prerequisites", "use_cases"):
            setattr(bundle, field, dump_json_field(value))
        else:
            setattr(bundle, field, value)

    await db.commit()
    await db.refresh(bundle)
    return _bundle_to_out(bundle)


@router.delete("/{bundle_id}", status_code=204)
async def delete_plugin(bundle_id: int, db: AsyncSession = Depends(get_db)):
    bundle = await db.get(PluginBundle, bundle_id)
    if bundle is None:
        raise_not_found("PluginBundle", bundle_id)
    await db.delete(bundle)
    await db.commit()


def _bundle_to_out(b: PluginBundle) -> PluginBundleOut:
    return PluginBundleOut(
        id=b.id,
        team_id=b.team_id,
        name=b.name,
        description=b.description,
        category=b.category,
        skill_ids=parse_json_field(b.skill_ids, []),
        mcp_tool_ids=parse_json_field(b.mcp_tool_ids, []),
        difficulty=b.difficulty,
        prerequisites=parse_json_field(b.prerequisites, []),
        quick_start=b.quick_start,
        use_cases=parse_json_field(b.use_cases, []),
        created_at=b.created_at,
    )
