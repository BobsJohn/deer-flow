"""用户认证路由：注册、登录、当前用户。"""

import hashlib
import logging
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.db_models import Team, User
from app.models import LoginRequest, LoginResponse, RegisterRequest, UserOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace", tags=["auth"])

JWT_SECRET = "marketplace-dev-secret-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_token(user_id: int, team_id: int, role: str) -> str:
    payload = {
        "user_id": user_id,
        "team_id": team_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(request: Request) -> dict:
    user = getattr(request.state, "current_user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@router.post("/register", response_model=LoginResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="邮箱已被注册")

    team = await db.get(Team, body.team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="团队不存在")

    user = User(
        team_id=body.team_id,
        name=body.name,
        email=body.email,
        role=body.role or "user",
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token(user.id, user.team_id, user.role)
    return LoginResponse(
        token=token,
        user=UserOut(
            id=user.id,
            team_id=user.team_id,
            name=user.name,
            email=user.email,
            role=user.role,
        ),
    )


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if user is None or user.password_hash != hash_password(body.password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    token = create_token(user.id, user.team_id, user.role)
    return LoginResponse(
        token=token,
        user=UserOut(
            id=user.id,
            team_id=user.team_id,
            name=user.name,
            email=user.email,
            role=user.role,
        ),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, current_user["user_id"])
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
        id=user.id,
        team_id=user.team_id,
        name=user.name,
        email=user.email,
        role=user.role,
    )
