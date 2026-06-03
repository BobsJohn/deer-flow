"""JWT 认证中间件。"""

import logging
import os

import jwt
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

JWT_SECRET = "marketplace-dev-secret-change-in-production"
JWT_ALGORITHM = "HS256"

PREFIXES_TO_PUBLIC = {"/health", "/docs", "/redoc", "/openapi.json"}
PUBLIC_PATHS = {"/api/marketplace/login", "/api/marketplace/register"}
PUBLIC_PREFIXES = {"/api/marketplace/teams"}


def _is_public(path: str) -> bool:
    if path in PREFIXES_TO_PUBLIC or path in PUBLIC_PATHS:
        return True
    for prefix in PUBLIC_PREFIXES:
        if path.startswith(prefix):
            return True
    return False


class AuthMiddleware(BaseHTTPMiddleware):
    """JWT 认证中间件。

    从 Authorization: Bearer <token> 头读取 token。
    如果 SKIP_AUTH=true，则跳过认证（开发模式）。
    """

    async def dispatch(self, request: Request, call_next):
        if os.getenv("SKIP_AUTH") == "true":
            return await call_next(request)

        if _is_public(request.url.path):
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header"})

        token = auth_header.removeprefix("Bearer ")
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.state.current_user = payload
        except jwt.ExpiredSignatureError:
            return JSONResponse(status_code=401, content={"detail": "Token expired"})
        except jwt.InvalidTokenError:
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})

        return await call_next(request)
