# 任务

## 1. 后端 — Admin 路由

- [x] 1.1 `auth.py` 新增 `admin_required` 依赖
- [x] 1.2 新建 `routers/admin.py`（GET /admin/users, PUT /admin/users/{id}/role, GET /admin/skills/pending, PUT /admin/skills/{id}/review）
- [x] 1.3 `main.py` 注册 admin router
- [x] 1.4 dashboard stats 加上 pending_skills 计数

## 2. 前端 — 管理后台

- [x] 2.1 创建 `/marketplace/admin/layout.tsx`（侧边栏 + 内容区）
- [x] 2.2 创建 `/marketplace/admin/page.tsx`（概览）
- [x] 2.3 创建 `/marketplace/admin/users/page.tsx`（用户列表 + 角色修改）
- [x] 2.4 创建 `/marketplace/admin/reviews/page.tsx`（资产审核）
- [x] 2.5 user-menu.tsx 添加「后台管理」入口（仅 admin）

## 3. 验证

- [x] 3.1 非 admin 用户调 /admin/* API 返回 403（测试通过）
- [x] 3.2 admin 用户能看到管理后台入口（admin badge + 下拉菜单）
- [x] 3.3 用户角色修改生效（前端行内下拉可切换）
- [x] 3.4 技能审核通过后状态变为 published（API 正常）
