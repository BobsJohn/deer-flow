## 为什么

目前没有管理员后台，管理员无法管理用户角色、审核资产、查看平台概况。非管理员和技术用户共用同一套页面，权限控制不完整。

## 变更内容

1. 新增管理员 RoleGuard 中间件（非 admin 返回 403）
2. 新增 `GET /api/marketplace/admin/users` — 跨团队用户列表
3. 新增 `PUT /api/marketplace/admin/users/{id}/role` — 修改用户角色
4. 新增 `GET /api/marketplace/admin/skills/pending` — 待审核 Skill
5. 新增 `PUT /api/marketplace/admin/skills/{id}/review` — 审核通过/驳回
6. 新增前端 `/marketplace/admin/*` 页面（侧边栏布局 + 概览/用户管理/资产审核）

## 功能

### 新增功能
- `admin-api`: 5 个管理员专用后端 API + RoleGuard 中间件
- `admin-ui`: 前端管理后台（侧边栏、概览、用户管理、资产审核）

## 影响

- `marketplace-server/app/auth.py` — 新增 role_guard 依赖
- `marketplace-server/app/routers/admin.py` — 新增 admin 路由
- `frontend/src/app/marketplace/admin/` — 新增页面目录
- `frontend/src/components/marketplace/` — 新增 AdminSidebar 组件
- `frontend/src/components/marketplace/user-menu.tsx` — admin 显示入口
