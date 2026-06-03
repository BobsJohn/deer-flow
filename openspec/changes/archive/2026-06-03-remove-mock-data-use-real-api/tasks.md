# 任务

## 1. 市场首页 — 移除 mock 数据

- [x] 1.1 删除 `MOCK_SKILLS` 和 `MOCK_BUNDLES` 常量
- [x] 1.2 删除推荐专区区块
- [x] 1.3 删除 `.catch(() => setSkills(MOCK_SKILLS))` fallback

## 2. 技能详情页 — 移除 mock 数据

- [x] 2.1 删除 `MOCK_SKILL` 常量
- [x] 2.2 删除 `.catch(() => setSkill(MOCK_SKILL))` fallback
- [x] 2.3 API 失败时显示错误状态 UI

## 3. 搜索 — 接入后端 API

- [x] 3.1 添加 300ms debounce hook
- [x] 3.2 搜索改为 `GET /api/marketplace/search?q=`
- [x] 3.3 搜索结果保留分类导航 filter

## 4. 验证

- [x] 4.1 访问 `/marketplace` 显示 7 个技能卡片
- [x] 4.2 搜索 API 返回正确结果
- [x] 4.3 详情页正常显示
- [x] 4.4 错误状态 UI
