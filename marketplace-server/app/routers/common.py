"""路由通用辅助函数。"""

import json
from typing import Any

from fastapi import HTTPException


def parse_json_field(value: str | None, default: Any = None) -> Any:
    """安全解析 JSON 字符串字段。"""
    if value is None:
        return default
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default


def dump_json_field(value: Any) -> str:
    """将 Python 对象转为 JSON 字符串。"""
    return json.dumps(value, ensure_ascii=False, default=str)


def raise_not_found(resource: str, resource_id: int) -> None:
    """抛出 404 异常。"""
    raise HTTPException(status_code=404, detail=f"{resource} with id {resource_id} not found")
