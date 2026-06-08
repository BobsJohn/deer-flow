# 设计

## 上下文

后端已有 User 表（含 role）、Skill 表（含 status/draft/review/published）、dashboard API。目前没有管理员专用的接口和页面。

## 目标/非目标

**目标：**
- 后端：RoleGuard 依赖 + admin 路由模块（用户管理 + 资产审核）
- 前端：`/marketplace/admin/` 侧边栏布局页面

**非目标：**
- 不做操作日志审计
- 不批量操作（一次只处理一个用户/一个 Skill）

## 决策

### 决策1：RoleGuard 作为 FastAPI 依赖而非中间件

不用全局中间件检查 role（会污染公开路由），而是做成 `Depends(admin_required)` 加到 admin 路由上。

### 决策2：admin 路由集中在 routers/admin.py

不散落到 teams/skills 里，方便统一管理权限。

### 决策3：前端侧边栏用嵌套 layout

`/marketplace/admin/layout.tsx` 放侧边栏，`/marketplace/admin/` 下所有页面共享。
