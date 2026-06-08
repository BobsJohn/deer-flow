# 任务

## 1. 后端 — 操作日志

- [x] 1.1 db_models: AuditLog 表
- [x] 1.2 database.py: 注册 AuditLog
- [x] 1.3 admin.py: PUT /users/{id}/role 记录日志
- [x] 1.4 admin.py: PUT /skills/{id}/review 记录日志
- [x] 1.5 admin.py: GET /audit-logs
- [x] 1.6 admin.py: GET /dashboard/trends

## 2. 后端 — 角色权限 + 重新提交

- [x] 2.1 skills.py: GET /mine（团队内所有技能）
- [x] 2.2 skills.py: PUT /{id}/resubmit（draft→review）

## 3. 前端 — 管理后台增强

- [x] 3.1 layout: 新增"操作日志"导航
- [x] 3.2 概览页: 新增趋势卡片 + 7天新增
- [x] 3.3 admin/logs/page.tsx: 操作日志列表
- [x] 3.4 admin/users/page.tsx: 不变（复用）

## 4. 前端 — 角色权限

- [x] 4.1 marketplace-header: admin/developer 可见"我的技能"
- [x] 4.2 /marketplace/my-skills: 团队技能列表，可创建
- [x] 4.3 user 访问 my-skills 显示无权限

## 5. 验证

- [x] 5.1 所有页面 200
- [x] 5.2 audit-log API 返回正确
- [x] 5.3 /mine + /resubmit API 正常
