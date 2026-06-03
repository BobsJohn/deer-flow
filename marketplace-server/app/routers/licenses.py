"""License 管理路由。"""

import datetime
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import License
from app.models import LicenseCreate, LicenseOut, LicenseVerifyRequest, LicenseVerifyResponse
from app.routers.common import raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/licenses", tags=["licenses"])


@router.get("", response_model=list[LicenseOut])
async def list_licenses(
    skill_id: int | None = None,
    user_id: int | None = None,
    type: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(License)
    if skill_id is not None:
        stmt = stmt.where(License.skill_id == skill_id)
    if user_id is not None:
        stmt = stmt.where(License.user_id == user_id)
    if type is not None:
        stmt = stmt.where(License.type == type)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(License.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{license_id}", response_model=LicenseOut)
async def get_license(license_id: int, db: AsyncSession = Depends(get_db)):
    lic = await db.get(License, license_id)
    if lic is None:
        raise_not_found("License", license_id)
    return lic


@router.post("", response_model=LicenseOut, status_code=201)
async def create_license(body: LicenseCreate, db: AsyncSession = Depends(get_db)):
    lic = License(
        skill_id=body.skill_id,
        user_id=body.user_id,
        license_key=body.license_key,
        type=body.type,
        expires_at=body.expires_at,
        usage_limit=body.usage_limit,
    )
    db.add(lic)
    await db.commit()
    await db.refresh(lic)
    return lic


@router.delete("/{license_id}", status_code=204)
async def delete_license(license_id: int, db: AsyncSession = Depends(get_db)):
    lic = await db.get(License, license_id)
    if lic is None:
        raise_not_found("License", license_id)
    await db.delete(lic)
    await db.commit()


@router.post("/verify", response_model=LicenseVerifyResponse)
async def verify_license(body: LicenseVerifyRequest, db: AsyncSession = Depends(get_db)):
    """校验 License 有效性。"""
    stmt = select(License).where(
        License.license_key == body.license_key,
        License.skill_id == body.skill_id,
    )
    result = await db.execute(stmt)
    lic = result.scalar_one_or_none()

    if lic is None:
        return LicenseVerifyResponse(valid=False, message="License not found")

    # 检查过期
    if lic.expires_at and lic.expires_at < datetime.datetime.now(datetime.timezone.utc):
        return LicenseVerifyResponse(valid=False, message="License has expired")

    # 检查用量
    if lic.usage_limit > 0 and lic.used_count >= lic.usage_limit:
        return LicenseVerifyResponse(valid=False, message="Usage limit exceeded")

    # 更新使用次数
    lic.used_count += 1
    await db.commit()

    return LicenseVerifyResponse(
        valid=True,
        message="License is valid",
        license_info={
            "id": lic.id,
            "type": lic.type,
            "used_count": lic.used_count,
            "usage_limit": lic.usage_limit,
            "expires_at": lic.expires_at.isoformat() if lic.expires_at else None,
        },
    )
