"""Pydantic 请求 / 响应模型。"""

import datetime
from typing import Any

from pydantic import BaseModel, Field


# ─── 通用 ───

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Any]


# ─── Team ───

class TeamCreate(BaseModel):
    name: str = Field(..., max_length=128, description="团队名称")
    description: str = ""


class TeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class TeamOut(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Skill ───

class SkillCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    type: str = "python"
    permission_level: str = "team"
    content_public: str = ""
    content_encrypted: str = ""
    category: list[str] = []
    tags: list[str] = []
    input_schema: dict[str, Any] = {}
    output_schema: dict[str, Any] = {}
    examples: list[dict[str, Any]] = []
    status: str = "draft"


class SkillUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    type: str | None = None
    permission_level: str | None = None
    content_public: str | None = None
    content_encrypted: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    input_schema: dict[str, Any] | None = None
    output_schema: dict[str, Any] | None = None
    examples: list[dict[str, Any]] | None = None
    status: str | None = None


class SkillOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    type: str
    permission_level: str
    category: list[str]
    tags: list[str]
    version: int
    status: str
    plugin_bundle_id: int | None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── SkillVersion ───

class SkillVersionOut(BaseModel):
    id: int
    skill_id: int
    version: int
    content_snapshot: str
    created_by: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── McpTool ───

class McpToolCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    input_schema: dict[str, Any] = {}
    status: str = "draft"


class McpToolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    input_schema: dict[str, Any] | None = None
    status: str | None = None


class McpToolOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    input_schema: dict[str, Any]
    version: int
    status: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── SystemPrompt ───

class SystemPromptCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    content: str = ""
    status: str = "draft"


class SystemPromptUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    content: str | None = None
    status: str | None = None


class SystemPromptOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    content: str
    version: int
    status: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Agent ───

class AgentCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    system_prompt_id: int | None = None
    skill_ids: list[int] = []
    mcp_tool_ids: list[int] = []
    status: str = "draft"


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    system_prompt_id: int | None = None
    skill_ids: list[int] | None = None
    mcp_tool_ids: list[int] | None = None
    status: str | None = None


class AgentOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    system_prompt_id: int | None
    skill_ids: list[int]
    mcp_tool_ids: list[int]
    version: int
    status: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Solution ───

class SolutionCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    agent_flow: list[dict[str, Any]] = []
    status: str = "draft"


class SolutionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    agent_flow: list[dict[str, Any]] | None = None
    status: str | None = None


class SolutionOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    agent_flow: list[dict[str, Any]]
    version: int
    status: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── PluginBundle ───

class PluginBundleCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    category: str = "development"
    skill_ids: list[int] = []
    mcp_tool_ids: list[int] = []
    difficulty: str = "beginner"
    prerequisites: list[str] = []
    quick_start: str = ""
    use_cases: list[dict[str, Any]] = []


class PluginBundleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    skill_ids: list[int] | None = None
    mcp_tool_ids: list[int] | None = None
    difficulty: str | None = None
    prerequisites: list[str] | None = None
    quick_start: str | None = None
    use_cases: list[dict[str, Any]] | None = None


class PluginBundleOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    category: str
    skill_ids: list[int]
    mcp_tool_ids: list[int]
    difficulty: str
    prerequisites: list[str]
    quick_start: str
    use_cases: list[dict[str, Any]]
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── DigitalEmployee ───

class DigitalEmployeeCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""
    avatar: str = ""
    system_prompt_id: int | None = None
    plugin_bundle_ids: list[int] = []
    tone: str = "professional"
    response_style: str = "concise"
    max_permission_level: str = "team"


class DigitalEmployeeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    avatar: str | None = None
    system_prompt_id: int | None = None
    plugin_bundle_ids: list[int] | None = None
    tone: str | None = None
    response_style: str | None = None
    max_permission_level: str | None = None


class DigitalEmployeeOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    avatar: str
    system_prompt_id: int | None
    plugin_bundle_ids: list[int]
    tone: str
    response_style: str
    max_permission_level: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── License ───

class LicenseCreate(BaseModel):
    skill_id: int
    user_id: int
    license_key: str
    type: str = "trial"
    expires_at: datetime.datetime | None = None
    usage_limit: int = 0


class LicenseVerifyRequest(BaseModel):
    license_key: str
    skill_id: int


class LicenseVerifyResponse(BaseModel):
    valid: bool
    message: str
    license_info: dict[str, Any] | None = None


class LicenseOut(BaseModel):
    id: int
    skill_id: int
    user_id: int
    license_key: str
    type: str
    expires_at: datetime.datetime | None
    usage_limit: int
    used_count: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── ApiKey ───

class ApiKeyCreate(BaseModel):
    name: str = Field(..., max_length=128)
    scope: list[str] = []


class ApiKeyOut(BaseModel):
    id: int
    team_id: int
    user_id: int
    name: str
    scope: list[str]
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── ExecutionLog ───

class ExecutionLogOut(BaseModel):
    id: int
    skill_id: int | None
    api_key_id: int | None
    user_id: int | None
    team_id: int | None
    status: str
    result: dict[str, Any]
    duration_ms: int
    llm_calls: int
    tool_calls: int
    tokens_used: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── KnowledgeBase ───

class KnowledgeBaseCreate(BaseModel):
    name: str = Field(..., max_length=128)
    description: str = ""


class KnowledgeBaseUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class KnowledgeBaseOut(BaseModel):
    id: int
    team_id: int
    name: str
    description: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── KbDocument ───

class KbDocumentOut(BaseModel):
    id: int
    knowledge_base_id: int
    filename: str
    content_type: str
    size: int
    content_path: str
    vector_index_id: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── User ───

class UserCreate(BaseModel):
    name: str = Field(..., max_length=128)
    email: str = Field(..., max_length=256)
    password: str = ""
    role: str = "user"


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    role: str | None = None


class UserOut(BaseModel):
    id: int
    team_id: int
    name: str
    email: str
    role: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Dashboard ───

class DashboardStats(BaseModel):
    total_teams: int = 0
    total_skills: int = 0
    total_mcp_tools: int = 0
    total_agents: int = 0
    total_solutions: int = 0
    total_plugin_bundles: int = 0
    total_digital_employees: int = 0
    total_users: int = 0
    total_executions: int = 0
    total_licenses: int = 0


# ─── Search ───

class SearchResultItem(BaseModel):
    resource_type: str  # e.g. "skill", "agent", "mcp_tool"
    resource_id: int
    name: str
    description: str


class SearchResults(BaseModel):
    query: str
    results: list[SearchResultItem]

# ─── Auth ───

class RegisterRequest(BaseModel):
    name: str = Field(..., max_length=128)
    email: str = Field(..., max_length=256)
    password: str = Field(..., min_length=6)
    team_id: int = 1
    role: str = "user"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    team_id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    token: str
    user: UserOut
