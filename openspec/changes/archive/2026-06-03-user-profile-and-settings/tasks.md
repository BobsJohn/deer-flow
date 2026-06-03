# 任务

## 1. 后端 — 新增 API

- [x] 1.1 `models.py` 新增 `ProfileUpdate(BaseModel)` 和 `PasswordChange(BaseModel)`
- [x] 1.2 `routers/auth.py` 新增 `PUT /me`（更新 name / avatar）和 `PUT /me/password`（验证旧密码 → 更新新密码）

## 2. 前端 — UserMenu 组件

- [x] 2.1 `api.ts` 导出 AVATARS 常量（8 个 emoji）
- [x] 2.2 创建 `UserMenu.tsx`（头像 + 名称 + 下拉菜单 + 退出登录）
- [x] 2.3 集成到 `MarketplaceHeader`

## 3. 前端 — 个人信息弹窗

- [x] 3.1 创建 `ProfileDialog.tsx`（含 8 个头像选择器 + 保存）
- [x] 3.2 创建 `PasswordDialog.tsx`（旧密码 + 新密码 + 确认 + 提交）
- [x] 3.3 集成到 UserMenu

## 4. 验证

- [x] 4.1 后端 PUT /me 和 PUT /me/password 测试通过
- [x] 4.2 后端 avatar 字段读写正常
- [x] 4.3 前端 market / login 页面 200
