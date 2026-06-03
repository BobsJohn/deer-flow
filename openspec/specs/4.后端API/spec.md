# 后端 API 设计

## 基础信息

- 端口：8003
- 前缀：`/api/marketplace/`
- 协议：REST JSON
- 认证：`X-API-Key` header 或 `?api_key` 参数
- 开发模式：未设 `MARKETPLACE_API_KEY` 环境变量时跳过认证

## 路由清单

### 团队管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/teams | 列表 |
| GET | /api/marketplace/teams/{id} | 详情 |
| POST | /api/marketplace/teams | 创建 |
| PUT | /api/marketplace/teams/{id} | 更新 |
| DELETE | /api/marketplace/teams/{id} | 删除 |

### 技能管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/skills | 列表（支持 category/permission_level/page 参数） |
| GET | /api/marketplace/skills/{id} | 详情 |
| POST | /api/marketplace/skills | 创建（自动生成版本快照） |
| PUT | /api/marketplace/skills/{id} | 更新（自动生成版本快照） |
| DELETE | /api/marketplace/skills/{id} | 删除 |

### MCP 工具
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/mcp-tools | 列表 |
| GET | /api/marketplace/mcp-tools/{id} | 详情 |
| POST | /api/marketplace/mcp-tools | 创建 |
| PUT | /api/marketplace/mcp-tools/{id} | 更新 |
| DELETE | /api/marketplace/mcp-tools/{id} | 删除 |

### 角色设定模板
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/system-prompts | 列表 |
| GET | /api/marketplace/system-prompts/{id} | 详情 |
| POST | /api/marketplace/system-prompts | 创建 |
| PUT | /api/marketplace/system-prompts/{id} | 更新 |
| DELETE | /api/marketplace/system-prompts/{id} | 删除 |

### Agent 装配
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/agents | 列表 |
| GET | /api/marketplace/agents/{id} | 详情（含装配的 Skill/McpTool/Prompt） |
| POST | /api/marketplace/agents | 创建 |
| PUT | /api/marketplace/agents/{id} | 更新（装配关系变更即新版本） |
| DELETE | /api/marketplace/agents/{id} | 删除 |

### 方案（Workflow）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/solutions | 列表 |
| GET | /api/marketplace/solutions/{id} | 详情（含 Agent 编排顺序） |
| POST | /api/marketplace/solutions | 创建 |
| PUT | /api/marketplace/solutions/{id} | 更新 |
| DELETE | /api/marketplace/solutions/{id} | 删除 |

### PluginBundle
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/plugins | 列表 |
| GET | /api/marketplace/plugins/{id} | 详情 |
| POST | /api/marketplace/plugins | 创建 |
| PUT | /api/marketplace/plugins/{id} | 更新 |
| DELETE | /api/marketplace/plugins/{id} | 删除 |

### DigitalEmployee
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/employees | 列表 |
| GET | /api/marketplace/employees/{id} | 详情 |
| POST | /api/marketplace/employees | 创建 |
| PUT | /api/marketplace/employees/{id} | 更新 |
| DELETE | /api/marketplace/employees/{id} | 删除 |

### License 管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/licenses | 列表 |
| POST | /api/marketplace/licenses | 创建（生成 license_key） |
| POST | /api/marketplace/licenses/verify | 校验 License（过期、用量） |

### API 密钥
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/api-keys | 列表 |
| POST | /api/marketplace/api-keys | 创建（返回原始 key，仅一次） |
| DELETE | /api/marketplace/api-keys/{id} | 删除 |

### 执行日志
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/execution-logs | 列表（支持 status/skill_id 筛选） |

### 知识库
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/knowledge-bases | 列表 |
| POST | /api/marketplace/knowledge-bases | 创建 |
| GET | /api/marketplace/knowledge-bases/{id}/documents | 文档列表 |
| POST | /api/marketplace/knowledge-bases/{id}/documents | 上传文档 |

### 运营大盘
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/dashboard/stats | 资产总数/调用成功率/热门排行/僵尸资产 |

### 全局搜索
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/marketplace/search?q=xxx | 跨实体全局搜索 |

## 数据流

```
下行（能力广场 → DeerFlow）：
  方案配置（Agent 装配关系、执行编排）
  → Skill 元数据（名称、描述、参数定义）
  → Skill 解密内容（instructions、tools）
  → execution_token

上行（DeerFlow → 能力广场）：
  执行结果（status、result）
  → 执行指标（duration_ms、llm_calls、tool_calls、tokens_used）
```
