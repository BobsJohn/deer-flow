"""市场能力广场 FastAPI 应用入口。"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import ApiKeyMiddleware
from app.database import init_db
from app.routers import (
    agents,
    api_keys,
    dashboard,
    employees,
    execution_logs,
    knowledge,
    licenses,
    mcp_tools,
    plugins,
    search,
    skills,
    solutions,
    system_prompts,
    teams,
)

logger = logging.getLogger(__name__)

_APP_TITLE = "DeerFlow 能力广场"
_APP_DESCRIPTION = """
## DeerFlow 能力广场 API

能力广场是 DeerFlow AI Agent 平台的插件、技能、Agent 装配和数字员工管理市场。

### 核心功能

- **技能 (Skill)**: 管理 Python/Prompt/MCP 技能，支持三档权限 (public/team/commercial)
- **MCP 工具**: 工具接口注册与发现
- **System Prompt**: 角色设定模板管理
- **Agent 装配**: 组合 Skill/McpTool/Prompt 形成可执行 Agent
- **方案 (Solution)**: 多 Agent Workflow 编排
- **PluginBundle**: Skill 预装配集合包
- **DigitalEmployee**: 数字员工配置管理
- **License**: 加密许可校验与生命周期管理
- **团队管理**: 团队命名空间与成员管理
- **运营大盘**: 平台统计数据
"""


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期：启动时初始化数据库表。"""
    logger.info("正在初始化能力广场数据库...")
    await init_db()
    logger.info("能力广场数据库初始化完成")
    yield
    logger.info("能力广场服务关闭")


def create_app() -> FastAPI:
    """创建并配置 FastAPI 应用。"""
    app = FastAPI(
        title=_APP_TITLE,
        description=_APP_DESCRIPTION,
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        openapi_tags=[
            {"name": "teams", "description": "团队命名空间管理"},
            {"name": "skills", "description": "技能 CRUD 与版本管理"},
            {"name": "mcp_tools", "description": "MCP 工具接口管理"},
            {"name": "system_prompts", "description": "角色设定模板管理"},
            {"name": "agents", "description": "Agent 装配体管理"},
            {"name": "solutions", "description": "方案 / Workflow 编排"},
            {"name": "plugins", "description": "PluginBundle 预装配集合包"},
            {"name": "employees", "description": "数字员工配置"},
            {"name": "licenses", "description": "License 加密许可管理"},
            {"name": "api_keys", "description": "API 密钥管理"},
            {"name": "execution_logs", "description": "执行日志"},
            {"name": "knowledge", "description": "知识库管理"},
            {"name": "dashboard", "description": "运营大盘统计"},
            {"name": "search", "description": "全局搜索"},
        ],
    )

    # CORS: 允许前端 localhost:3000 访问
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API Key 认证中间件
    app.add_middleware(ApiKeyMiddleware)

    # 注册路由
    app.include_router(teams.router)
    app.include_router(skills.router)
    app.include_router(mcp_tools.router)
    app.include_router(system_prompts.router)
    app.include_router(agents.router)
    app.include_router(solutions.router)
    app.include_router(plugins.router)
    app.include_router(employees.router)
    app.include_router(licenses.router)
    app.include_router(api_keys.router)
    app.include_router(execution_logs.router)
    app.include_router(knowledge.router)
    app.include_router(dashboard.router)
    app.include_router(search.router)

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        """健康检查端点。"""
        return {"status": "healthy", "service": "deer-flow-marketplace"}

    return app


app = create_app()
