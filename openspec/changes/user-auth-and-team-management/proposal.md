## 为什么

能力广场目前没有用户和认证体系。所有操作硬编码 `team_id=1`，导航栏的"团队"和"Agent"链接点进去都是 404。没有用户身份就无法做权限校验（谁能创建 Skill、谁可以使用商业级 Skill）、也无法做团队管理。

## 变更内容

1. **新增：用户认证** — 简单密码登录 + 会话 token（JWT），不引入 OAuth 以保持 V1 轻量
2. **新增：用户注册/选择团队** — 创建用户时可选择所属团队
3. **新增：团队管理前端页面** — 列表、成员管理、角色分配
4. **新增：导航菜单后端路由** — 让顶栏的 Agent、方案等链接有真实页面（或占位）
5. **改造：所有 API 使用当前用户身份** — 移除硬编码 `team_id=1`

## 功能 (Capabilities)

### 新增功能
- `user-auth`: 登录/注册/当前用户身份，JWT token 认证，API 中间件自动解析用户
- `team-management`: 前端团队管理页面，团队列表、成员管理、角色分配 UI

### 修改功能
- 无（所有现有功能的行为不变，只是从 `team_id=1` 改为从 token 获取）

## 影响

- `marketplace-server/app/` — 新增 `routers/auth.py`，修改 `auth.py`（JWT 中间件）
- `frontend/src/app/marketplace/` — 新增 `login/page.tsx`、`teams/` 目录
- `frontend/src/components/marketplace/` — 新增用户/团队相关组件
- `frontend/next.config.js` — 无需改动（API proxy 已就位）
