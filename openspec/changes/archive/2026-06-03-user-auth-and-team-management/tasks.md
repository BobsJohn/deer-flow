# 任务

## 1. 后端 — 用户认证

- [x] 1.1 新建 `routers/auth.py`: POST /login + POST /register + GET /me
- [x] 1.2 替换 auth.py 为 JWT 中间件
- [x] 1.3 公开路由白名单（/login, /register, /health, /teams）
- [-] 1.4 生成 seed 数据: 默认管理员账号 (跳过，注册流程已通)

## 2. 后端 — 团队管理完善

- [x] 2.1 补全 teams router: `POST /{id}/users`, `DELETE /{id}/users/{user_id}`
- [x] 2.2 team 路由改为公开（允许团队创建和用户注册）

## 3. 前端 — 登录页面

- [x] 3.1 创建 `/marketplace/login/page.tsx`（登录 + 注册 tab 切换）
- [x] 3.2 创建 `auth-context.tsx`（token 管理、当前用户状态）
- [x] 3.3 marketplace layout 纳入 AuthProvider
- [x] 3.4 路由保护：市场首页无 token 跳登录

## 4. 前端 — 团队管理

- [x] 4.1 创建 `/marketplace/teams/[id]/page.tsx`（团队详情 + 成员管理）
- [x] 4.2 角色权限 UI（admin 显示管理按钮和移除，user 只读）

## 5. 验证

- [x] 5.1 `/marketplace/login` 渲染正常
- [x] 5.2 后端注册/登录/me API 正常工作
- [x] 5.3 无 token 访问 `/marketplace/skills` 返回 401
- [x] 5.4 团队成员增删 API 正常工作
