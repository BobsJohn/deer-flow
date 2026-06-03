"""SQLAlchemy ORM 模型 — 映射 PDF 概要设计的 ER 图核心实体。"""

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Team(Base):
    """团队/命名空间"""

    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(128), unique=True, nullable=False, index=True)
    description = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    skills = relationship("Skill", back_populates="team", lazy="select")
    mcp_tools = relationship("McpTool", back_populates="team", lazy="select")
    system_prompts = relationship("SystemPrompt", back_populates="team", lazy="select")
    agents = relationship("Agent", back_populates="team", lazy="select")
    solutions = relationship("Solution", back_populates="team", lazy="select")
    plugin_bundles = relationship("PluginBundle", back_populates="team", lazy="select")
    digital_employees = relationship("DigitalEmployee", back_populates="team", lazy="select")
    knowledge_bases = relationship("KnowledgeBase", back_populates="team", lazy="select")
    users = relationship("User", back_populates="team", lazy="select")


class Skill(Base):
    """技能"""

    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    type = Column(Enum("python", "prompt", "mcp", name="skill_type"), nullable=False, default="python")
    permission_level = Column(Enum("public", "team", "commercial", name="permission_level"), nullable=False, default="team")
    content_public = Column(Text, default="")
    content_encrypted = Column(Text, default="")
    category = Column(Text, default="[]")  # JSON list
    tags = Column(Text, default="[]")  # JSON list
    input_schema = Column(Text, default="{}")  # JSON
    output_schema = Column(Text, default="{}")  # JSON
    examples = Column(Text, default="[]")  # JSON
    version = Column(Integer, nullable=False, default=1)
    status = Column(Enum("draft", "review", "published", "deprecated", name="skill_status"), nullable=False, default="draft")
    plugin_bundle_id = Column(Integer, ForeignKey("plugin_bundles.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    team = relationship("Team", back_populates="skills", lazy="select")
    versions = relationship("SkillVersion", back_populates="skill", lazy="select", cascade="all, delete-orphan")


class SkillVersion(Base):
    """技能版本快照"""

    __tablename__ = "skill_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    content_snapshot = Column(Text, default="")
    created_by = Column(String(128), default="")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    skill = relationship("Skill", back_populates="versions", lazy="select")


class McpTool(Base):
    """MCP 工具接口"""

    __tablename__ = "mcp_tools"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    input_schema = Column(Text, default="{}")  # JSON
    version = Column(Integer, nullable=False, default=1)
    status = Column(Enum("draft", "published", "deprecated", name="tool_status"), nullable=False, default="draft")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="mcp_tools", lazy="select")


class SystemPrompt(Base):
    """角色设定模板"""

    __tablename__ = "system_prompts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    content = Column(Text, nullable=False, default="")
    version = Column(Integer, nullable=False, default=1)
    status = Column(Enum("draft", "published", "deprecated", name="prompt_status"), nullable=False, default="draft")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="system_prompts", lazy="select")


class Agent(Base):
    """Agent 装配体 — 组合 Skill / McpTool / SystemPrompt"""

    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    system_prompt_id = Column(Integer, ForeignKey("system_prompts.id"), nullable=True)
    skill_ids = Column(Text, default="[]")  # JSON list of int
    mcp_tool_ids = Column(Text, default="[]")  # JSON list of int
    version = Column(Integer, nullable=False, default=1)
    status = Column(Enum("draft", "published", "deprecated", name="agent_status"), nullable=False, default="draft")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="agents", lazy="select")


class Solution(Base):
    """方案 / Workflow — 多 Agent 编排"""

    __tablename__ = "solutions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    agent_flow = Column(Text, default="[]")  # JSON: [{agent_id, order, condition, mode}]
    version = Column(Integer, nullable=False, default=1)
    status = Column(Enum("draft", "published", "deprecated", name="solution_status"), nullable=False, default="draft")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="solutions", lazy="select")


class PluginBundle(Base):
    """PluginBundle — Skill 预装配集合包"""

    __tablename__ = "plugin_bundles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    category = Column(Enum("productivity", "development", "analysis", "creative", name="bundle_category"), nullable=False, default="development")
    skill_ids = Column(Text, default="[]")  # JSON list of int
    mcp_tool_ids = Column(Text, default="[]")  # JSON list of int
    difficulty = Column(Enum("beginner", "intermediate", "expert", name="difficulty_level"), nullable=False, default="beginner")
    prerequisites = Column(Text, default="[]")  # JSON
    quick_start = Column(Text, default="")
    use_cases = Column(Text, default="[]")  # JSON
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="plugin_bundles", lazy="select")


class DigitalEmployee(Base):
    """DigitalEmployee — 数字员工"""

    __tablename__ = "digital_employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    avatar = Column(String(512), default="")
    system_prompt_id = Column(Integer, ForeignKey("system_prompts.id"), nullable=True)
    plugin_bundle_ids = Column(Text, default="[]")  # JSON list of int
    tone = Column(Enum("professional", "friendly", "humorous", name="tone_type"), nullable=False, default="professional")
    response_style = Column(Enum("concise", "detailed", "stepByStep", name="response_style"), nullable=False, default="concise")
    max_permission_level = Column(Enum("public", "team", "commercial", name="de_permission_level"), nullable=False, default="team")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="digital_employees", lazy="select")


class License(Base):
    """License — 加密许可"""

    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    license_key = Column(String(256), unique=True, nullable=False)
    type = Column(Enum("trial", "standard", "enterprise", name="license_type"), nullable=False, default="trial")
    expires_at = Column(DateTime, nullable=True)
    usage_limit = Column(Integer, default=0)
    used_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class ApiKey(Base):
    """API 密钥"""

    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    key_hash = Column(String(256), nullable=False)
    name = Column(String(128), nullable=False)
    scope = Column(Text, default="[]")  # JSON array of scopes
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class ExecutionLog(Base):
    """执行日志"""

    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True, index=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    status = Column(Enum("success", "failed", name="execution_status"), nullable=False, default="success")
    result = Column(Text, default="{}")  # JSON
    duration_ms = Column(Integer, default=0)
    llm_calls = Column(Integer, default=0)
    tool_calls = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class KnowledgeBase(Base):
    """知识库"""

    __tablename__ = "knowledge_bases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="knowledge_bases", lazy="select")
    documents = relationship("KbDocument", back_populates="knowledge_base", lazy="select", cascade="all, delete-orphan")


class KbDocument(Base):
    """知识库文档"""

    __tablename__ = "kb_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_bases.id"), nullable=False, index=True)
    filename = Column(String(256), nullable=False)
    content_type = Column(String(128), default="")
    size = Column(Integer, default=0)
    content_path = Column(String(512), default="")
    vector_index_id = Column(String(256), default="")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    knowledge_base = relationship("KnowledgeBase", back_populates="documents", lazy="select")


class User(Base):
    """用户"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(256), unique=True, nullable=False)
    role = Column(Enum("admin", "developer", "user", name="user_role"), nullable=False, default="user")
    password_hash = Column(String(128), nullable=False, default="")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="users", lazy="select")
