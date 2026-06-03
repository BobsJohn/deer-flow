# 前端需求

## 页面清单

### P0（核心体验）

| 页面 | 路由 | 说明 |
|------|------|------|
| 能力广场首页 | /marketplace | 技能卡片网格、分类导航、搜索框、推荐专区 |
| 技能详情页 | /marketplace/skills/{id} | 展示内容、参数、版本、示例 |
| 搜索页面 | /marketplace/search?q=xxx | 搜索结果展示 |

### P1（管理功能）

| 页面 | 路由 | 说明 |
|------|------|------|
| 创建技能 | /marketplace/skills/new | 表单创建 Skill |
| 编辑技能 | /marketplace/skills/{id}/edit | 编辑已有 Skill |
| 团队管理 | /marketplace/teams | 团队列表和成员管理 |
| Agent 管理 | /marketplace/agents | Agent 装配体列表 |
| 方案管理 | /marketplace/solutions | 多 Agent 编排列表 |

### P2（增强体验）

| 页面 | 路由 | 说明 |
|------|------|------|
| 插件包详情 | /marketplace/plugins/{id} | PluginBundle |
| 数字员工详情 | /marketplace/employees/{id} | DigitalEmployee |
| 运营大盘 | /marketplace/dashboard | 统计指标面板 |
| 我的资产 | /marketplace/my-assets | 当前用户发布的资产 |

## 画布侧边栏集成

在 DeerFlow 画布右侧添加"能力市场"侧边栏（利用现有画布扩展点）：

| 功能 | 说明 |
|------|------|
| 4 个 Tab | 技能市场 / 插件包 / 数字员工 / 我的资产 |
| 搜索 | 按名称、分类、权限级别搜索 |
| 拖拽引入 | 拖入画布自动填充节点配置 |
| 加密资产 | 拖入时弹出 License 输入框 |

## 权限 UI 表现

| 权限等级 | 前端表现 |
|---------|---------|
| public | 直接使用按钮，无额外操作 |
| team | 验证团队成员身份，自动继承 |
| commercial | 购买/授权流程，License 输入 |

## 技术栈

- Next.js App Router（与 DeerFlow 前端一致）
- shadcn/ui 组件
- 调用 `http://localhost:8003/api/marketplace/` API
