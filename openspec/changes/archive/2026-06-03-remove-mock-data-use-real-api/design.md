# 设计

## 上下文

能力广场前端目前有两种数据获取方式混杂：
- market 首页：初始化时 fetch API，失败时 fallback 到 MOCK_SKILLS
- 详情页：初始化时 fetch API，失败时 fallback 到 MOCK_SKILL
- 搜索：全部在前端对已有的 skills 做 filter
- 推荐专区：硬编码的 MOCK_BUNDLES

后端 API 已全部可用（skills, search, plugins），不存在无法替代 mock 的理由。

## 目标/非目标

**目标：**
- 完全删除 MOCK 数据常量
- 搜索改为调后端 API
- API 失败时显示统一的 error 状态而非静默 fallback

**非目标：**
- 不改变 UI 组件的样式和布局
- 不引入状态管理库

## 决策

### 决策1：搜索采用 debounce 调 API 而非本地 filter

前端本地 filter 只覆盖已 loaded 的技能，后端 search 跨实体（Skill/Agent/McpTool/Solution），范围更全。

用 300ms debounce，避免每次按键都发请求。

### 决策2：推荐专区在未来迭代中从后端 API 获取

目前后端还没有 `GET /api/marketplace/recommendations` 端点。V1 先移除前端硬编码的 MOCK_BUNDLES 区块，后续在 dashboard 或专门的 recommendation 路由中实现。
