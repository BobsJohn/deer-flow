# 任务

## 1. 后端 — 用户认证

- [ ] 1.1 新建 `routers/auth.py`: POST /login + POST /register + GET /me
- [ ] 1.2 删除旧 `auth.py` 中的 ApiKeyMiddleware，替换为 JWT 中间件
- [ ] 1.3 公开路由白名单（/login, /register, /health）
- [ ] 1.4 生成 seed 数据: 默认管理员账号

## 2. 后端 — 团队管理完善

- [ ] 2.1 补全 teams router: `POST /{id}/users`, `DELETE /{id}/users/{user_id}`
- [ ] 2.2 检查已有 API 中 `team_id` 硬编码改为从 request state 获取

## 3. 前端 — 登录页面

- [ ] 3.1 创建 `/marketplace/login/page.tsx`（登录 + 注册 tab 切换）
- [ ] 3.2 创建 `auth-context.tsx`（token 管理、当前用户状态）
- [ ] 3.3 创建 `api-client.ts`（自动带 token 的 fetch 封装）
- [ ] 3.4 路由保护：无 token 时跳登录

## 4. 前端 — 团队管理

- [ ] 4.1 创建 `/marketplace/teams/page.tsx`（团队列表）
- [ ] 4.2 创建 `/marketplace/teams/[id]/page.tsx`（团队详情 + 成员管理）
- [ ] 4.3 角色权限 UI（admin 显示管理按钮，user 只读）

## 5. 验证

- [ ] 5.1 访问 `/marketplace` 无 token 跳转到 `/marketplace/login`
- [ ] 5.2 注册新用户 → 自动登录 → 进入首页
- [ ] 5.3 团队管理页面显示成员列表
- [ ] 5.4 admin 可添加/移除成员
