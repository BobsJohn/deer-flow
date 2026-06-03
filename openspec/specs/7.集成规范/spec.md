# 集成规范

## 服务层 vs 执行侧职责

| 维度 | 能力广场（服务层） | DeerFlow（执行侧） |
|------|------------------|-------------------|
| 核心关注 | 资产怎么存、怎么管、谁能用 | 资产怎么跑、怎么调度 |
| 资产状态 | 唯一可信来源（SSOT） | 不存储，运行时实时获取 |
| 权限控制 | 统一认证授权、命名空间隔离 | 透传，不额外鉴权 |
| 内容安全 | 加密存储、执行时解密 | 不落盘，仅内存使用 |
| 执行环境 | 不管执行环境 | 管理 Docker Sandbox |
| 模型调用 | 不接触 LLM | 负责 LLM 调用 |
| 结果反馈 | 接收并记录执行结果 | 生成执行结果并上报 |

## 集成接口

### REST API（主协议）
- Agent/方案配置获取
- Skill 内容解密获取
- 执行结果上报

### MCP 协议（辅助，V2）
- 对话式场景中的能力浏览
- 核心调用链路不依赖 MCP

## 调用流程

```
使用者提出任务需求
  │
  ▼
DeerFlow → GET /api/marketplace/agents/{id}/config
  │  返回：System Prompt + Skill 列表 + McpTool 列表 + 执行模式
  ▼
LLM 决策需执行某 Skill
  │
  ▼
DeerFlow → POST /api/marketplace/skills/{id}/execute
  │  返回：解密后 instructions + execution_token
  ▼
执行 Skill → 结果上报 → POST /api/marketplace/report
```

## 数据安全规范

### V1（简化版）
- 服务层解密后，以明文传递给执行侧
- 前提：服务层和执行侧在同一内网/容器网络
- 执行侧不落盘，执行完成后清理

### V2（增强版）
- 执行侧通过 License 在内存中解密
- 加密模块以二方包形式提供
- 遵守"最小明文窗口"原则

## 向后兼容

- 现有 DeerFlow 项目的本地 Skill 可继续使用
- 用户可选择将 Skill 迁移到能力广场
- 混合运行：一个 DAG 中可同时包含本地 Skill 和远程 Skill
