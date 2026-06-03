"""API Key 认证中间件。"""

import hashlib
import logging
import os
import secrets

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


def hash_key(key: str) -> str:
    """对 API Key 做 SHA-256 哈希。"""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_api_key() -> str:
    """生成一个安全的 API Key (mkp_xxx)。"""
    return "mkp_" + secrets.token_hex(32)


class ApiKeyMiddleware(BaseHTTPMiddleware):
    """简单 API Key 认证中间件。

    从 X-API-Key 头或 ?api_key 查询参数读取 key。
    如果 MARKETPLACE_API_KEY 环境变量未设置，则跳过认证（开发模式）。
    """

    async def dispatch(self, request: Request, call_next):
        # 健康检查和 docs 路径跳过认证
        if request.url.path in ("/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        expected_key = os.getenv("MARKETPLACE_API_KEY")
        if not expected_key:
            return await call_next(request)

        api_key = request.headers.get("X-API-Key") or request.query_params.get("api_key")
        if not api_key:
            return JSONResponse(status_code=401, content={"detail": "Missing API key"})

        if not secrets.compare_digest(api_key, expected_key):
            return JSONResponse(status_code=403, content={"detail": "Invalid API key"})

        return await call_next(request)
