"""API 密钥管理路由。"""

import hashlib
import logging
import secrets

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import ApiKey
from app.models import ApiKeyCreate, ApiKeyOut
from app.routers.common import dump_json_field, parse_json_field, raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/api-keys", tags=["api_keys"])


@router.get("", response_model=list[ApiKeyOut])
async def list_api_keys(
    team_id: int | None = None,
    user_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ApiKey)
    if team_id is not None:
        stmt = stmt.where(ApiKey.team_id == team_id)
    if user_id is not None:
        stmt = stmt.where(ApiKey.user_id == user_id)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(ApiKey.id)
    result = await db.execute(stmt)
    return [_key_to_out(k) for k in result.scalars().all()]


@router.post("", status_code=201)
async def create_api_key(
    body: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    team_id: int = 1,
    user_id: int = 1,
):
    """创建 API Key。返回原始 key（仅此一次）。"""
    raw_key = "mkp_" + secrets.token_hex(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    ak = ApiKey(
        team_id=team_id,
        user_id=user_id,
        key_hash=key_hash,
        name=body.name,
        scope=dump_json_field(body.scope),
    )
    db.add(ak)
    await db.commit()
    await db.refresh(ak)

    return {
        "id": ak.id,
        "name": ak.name,
        "api_key": raw_key,
        "scope": body.scope,
        "created_at": ak.created_at,
    }


@router.delete("/{key_id}", status_code=204)
async def delete_api_key(key_id: int, db: AsyncSession = Depends(get_db)):
    ak = await db.get(ApiKey, key_id)
    if ak is None:
        raise_not_found("ApiKey", key_id)
    await db.delete(ak)
    await db.commit()


def _key_to_out(k: ApiKey) -> ApiKeyOut:
    return ApiKeyOut(
        id=k.id,
        team_id=k.team_id,
        user_id=k.user_id,
        name=k.name,
        scope=parse_json_field(k.scope, []),
        created_at=k.created_at,
    )
