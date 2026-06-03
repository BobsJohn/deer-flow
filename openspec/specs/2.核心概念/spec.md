# 核心概念定义

## 概念层级

```
方案（Workflow）              ← 最上层：多 Agent 协作编排
  │
  ▼
Agent                         ← 中间层：可执行智能体
  ├── System Prompt（角色设定）
  ├── Skill 集合（技能）
  └── McpTool 集合（工具接口）
  │
  ▼
知识库（可选）                 ← 辅助层：执行时检索参考
```

## 对比说明

| 概念 | 做什么 | 不做什么 |
|------|--------|---------|
| Skill | 完整的任务指令（"部署 Hadoop"） | 不是原子工具，不是独立 Agent |
| McpTool | 原子工具接口（"执行 bash"） | 不是组合工作流 |
| SystemPrompt | 角色设定（"你是一个运维工程师"） | 不是执行逻辑 |
| Agent | 装配体——把 Prompt + Skill + Tool 装配成执行者 | 不是多 Agent 编排 |
| 方案（Workflow） | 多个 Agent 的顺序/条件/并行编排 | 不是单个 Agent |
| PluginBundle | Skill 的预装配集合包（"数据分析套件"） | 不是编排，不涉及执行顺序 |
| DigitalEmployee | 有完整画像的数字员工（含人格设定） | 不是一次性资产 |

## 各概念属性

| 概念 | 版本管理 | 加密支持 | 团队隔离 | 三档权限 |
|------|---------|---------|---------|---------|
| Skill | ✅ | ✅ | ✅ | ✅ |
| McpTool | ✅ | ❌ | ✅ | ❌（仅公开） |
| SystemPrompt | ✅ | ❌ | ✅ | ❌ |
| Agent | ✅ | ❌ | ✅ | ❌ |
| 方案（Workflow） | ✅ | ❌ | ✅ | ❌ |
| PluginBundle | ❌ | ❌ | ✅ | ✅（继承自内含 Skill） |
| DigitalEmployee | ❌ | ❌ | ✅ | ✅（取最高 Skill 级别） |
