# 提案

## 为什么
能力广场前端页面目前混用了 mock 数据和真实 API 调用。真实后端已跑起来且有完整 REST API，mock 数据是死代码——维护两套数据源增加了不确定性，mock 和 API 返回格式不一致时会引发运行时错误（已经在详情页遇到过）。

## 变更内容
1. 市场首页 `page.tsx`：删除 `MOCK_SKILLS` 和 `MOCK_BUNDLES`，全部从后端 API 获取
2. 技能详情页 `[id]/page.tsx`：删除 `MOCK_SKILL` fallback，API 失败时直接显示错误
3. 搜索功能：从本地 `in-memory filter` 改为调用后端 `/api/marketplace/search?q=`

## 能力
- **真实数据展示**: 市场首页和详情页的数据全部来自后端 API，无 mock 回退
- **后端驱动搜索**: 搜索词发送到后端，跨 Skill/Agent/McpTool/Solution 搜索
- **响应式加载态**: 页面统一使用 loading → error → data 三态模式

## 影响
- `frontend/src/app/marketplace/page.tsx`: 删除 mock 数据 + 搜索改 API 调用
- `frontend/src/app/marketplace/skills/[id]/page.tsx`: 删除 mock 数据
