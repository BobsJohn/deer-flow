"""团队管理路由。"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import Team, User
from app.models import TeamCreate, TeamOut, TeamUpdate, UserCreate, UserOut
from app.routers.auth import hash_password
from app.routers.common import raise_not_found

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace/teams", tags=["teams"])


@router.get("", response_model=list[TeamOut])
async def list_teams(page: int = 1, page_size: int = 20, db: AsyncSession = Depends(get_db)):
    stmt = select(Team).offset((page - 1) * page_size).limit(page_size).order_by(Team.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{team_id}", response_model=TeamOut)
async def get_team(team_id: int, db: AsyncSession = Depends(get_db)):
    team = await db.get(Team, team_id)
    if team is None:
        raise_not_found("Team", team_id)
    return team


@router.post("", response_model=TeamOut, status_code=201)
async def create_team(body: TeamCreate, db: AsyncSession = Depends(get_db)):
    team = Team(name=body.name, description=body.description)
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamOut)
async def update_team(team_id: int, body: TeamUpdate, db: AsyncSession = Depends(get_db)):
    team = await db.get(Team, team_id)
    if team is None:
        raise_not_found("Team", team_id)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)

    await db.commit()
    await db.refresh(team)
    return team


@router.delete("/{team_id}", status_code=204)
async def delete_team(team_id: int, db: AsyncSession = Depends(get_db)):
    team = await db.get(Team, team_id)
    if team is None:
        raise_not_found("Team", team_id)
    await db.delete(team)
    await db.commit()


@router.get("/{team_id}/users", response_model=list[UserOut])
async def list_team_users(team_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.team_id == team_id).order_by(User.id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{team_id}/users", response_model=UserOut, status_code=201)
async def add_team_member(team_id: int, body: UserCreate, db: AsyncSession = Depends(get_db)):
    team = await db.get(Team, team_id)
    if team is None:
        raise_not_found("Team", team_id)

    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="该邮箱已被注册")

    if body.password is None:
        raise HTTPException(status_code=422, detail="password is required")

    user = User(
        team_id=team_id,
        name=body.name,
        email=body.email,
        role=body.role or "user",
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut(id=user.id, team_id=user.team_id, name=user.name, email=user.email, role=user.role)


@router.delete("/{team_id}/users/{user_id}", status_code=204)
async def remove_team_member(team_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if user is None or user.team_id != team_id:
        raise_not_found("User", user_id)
    await db.delete(user)
    await db.commit()
