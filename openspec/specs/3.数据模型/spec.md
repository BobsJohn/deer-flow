# 数据模型

## ER 关系

```
Team ── owns ──┬── Skill ── SkillVersion
               ├── McpTool ── McpToolVersion
               ├── SystemPrompt ── PromptVersion
               ├── KnowledgeBase ── KbDocument
               ├── Agent (装配 Skill/McpTool/Prompt) ── AgentVersion
               ├── Solution (编排多个 Agent) ── SolutionVersion
               ├── PluginBundle (预装配 Skill 集合)
               ├── DigitalEmployee (完整 Agent 画像)
               ├── User ── belongs to Team
               ├── ApiKey ── belongs to Team
               └── License ── belongs to Skill

ExecutionLog ── 关联 Skill + ApiKey + User
```

## 实体清单（15 张表）

### 1. Team
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | 主键 |
| name | str | 团队名称 |
| description | str | 描述 |
| created_at | datetime | 创建时间 |

### 2. User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | 主键 |
| team_id | str/FK | 所属团队 |
| name | str | 用户名 |
| email | str | 邮箱 |
| role | str | admin / developer / user |

### 3. Skill
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | 主键 |
| team_id | str/FK | 所属命名空间 |
| name | str | 技能名称 |
| description | str | 描述 |
| type | str | python / prompt / mcp |
| permission_level | str | public / team / commercial |
| content_public | str | 明文内容 |
| content_encrypted | str | 加密内容 |
| category | JSON | 分类标签 |
| tags | JSON | 标签 |
| input_schema | JSON | 输入参数 Schema |
| output_schema | JSON | 输出 Schema |
| examples | JSON | 示例 |
| version | int | 当前版本号 |
| status | str | draft / review / published / deprecated |
| plugin_bundle_id | str/FK | 所属插件包（可选） |
| created_at | datetime | |
| updated_at | datetime | |

### 4. SkillVersion
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | 主键 |
| skill_id | str/FK | 所属 Skill |
| version | int | 版本号 |
| content_snapshot | str | 内容快照 |
| created_at | datetime | |
| created_by | str | 创建者 |

### 5. McpTool
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | 主键 |
| team_id | str/FK | |
| name | str | 工具名称 |
| description | str | |
| input_schema | JSON | |
| version | int | |
| status | str | |

### 6. SystemPrompt
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| name | str | |
| description | str | |
| content | str | 提示词内容 |
| version | int | |
| status | str | |

### 7. Agent
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| name | str | |
| description | str | |
| system_prompt_id | str/FK | 绑定的 SystemPrompt |
| skill_ids | JSON | 绑定的 Skill ID 列表 |
| mcp_tool_ids | JSON | 绑定的 McpTool ID 列表 |
| version | int | |
| status | str | |

### 8. Solution（方案/Workflow）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| name | str | |
| description | str | |
| agent_flow | JSON | `[{agent_id, order, condition, mode}]` |
| version | int | |
| status | str | |

### 9. PluginBundle
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| name | str | |
| description | str | |
| category | str | productivity / development / analysis / creative |
| skill_ids | JSON | |
| mcp_tool_ids | JSON | |
| difficulty | str | beginner / intermediate / expert |
| prerequisites | JSON | |
| quick_start | str | |
| use_cases | JSON | |

### 10. DigitalEmployee
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| name | str | |
| description | str | |
| avatar | str | |
| system_prompt_id | str/FK | |
| plugin_bundle_ids | JSON | |
| tone | str | professional / friendly / humorous |
| response_style | str | concise / detailed / stepByStep |
| max_permission_level | str | |

### 11. License
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| skill_id | str/FK | |
| user_id | str/FK | |
| license_key | str | 加密密钥 |
| type | str | trial / standard / enterprise |
| expires_at | datetime | |
| usage_limit | int | |
| used_count | int | |

### 12. ApiKey
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| user_id | str/FK | |
| key_hash | str | 哈希存储 |
| name | str | |
| scope | JSON | |
| created_at | datetime | |

### 13. ExecutionLog
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| skill_id | str/FK | |
| api_key_id | str/FK | |
| user_id | str/FK | |
| team_id | str/FK | |
| status | str | success / failed |
| result | JSON | |
| duration_ms | int | |
| llm_calls | int | |
| tool_calls | int | |
| tokens_used | int | |
| created_at | datetime | |

### 14. KnowledgeBase
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| team_id | str/FK | |
| name | str | |
| description | str | |
| created_at | datetime | |

### 15. KbDocument
| 字段 | 类型 | 说明 |
|------|------|------|
| id | str/UUID | |
| knowledge_base_id | str/FK | |
| filename | str | |
| content_type | str | |
| size | int | |
| content_path | str | 文件存储路径 |
| vector_index_id | str | 向量索引 ID（可选） |
| created_at | datetime | |
