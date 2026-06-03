# 任务

## 1. 后端 — 新增 API

- [ ] 1.1 `models.py` 新增 `ProfileUpdate(BaseModel)` 和 `PasswordChange(BaseModel)`
- [ ] 1.2 `routers/auth.py` 新增 `PUT /me`（更新 name / avatar）和 `PUT /me/password`（验证旧密码 → 更新新密码）

## 2. 前端 — UserMenu 组件

- [ ] 2.1 `api.ts` 导出 AVATARS 常量（8 个 emoji）
- [ ] 2.2 创建 `UserMenu.tsx`（头像 + 名称 + 下拉菜单 + 退出登录）
- [ ] 2.3 集成到 `MarketplaceHeader` 的 `rightSlot`

## 3. 前端 — 个人信息弹窗

- [ ] 3.1 创建 `ProfileDialog.tsx`（含 8 个头像选择器 + 保存）
- [ ] 3.2 创建 `PasswordDialog.tsx`（旧密码 + 新密码 + 确认 + 提交）
- [ ] 3.3 集成到 UserMenu 的下拉菜单中

## 4. 验证

- [ ] 4.1 登录后右上角显示头像和名称
- [ ] 4.2 点击头像弹出下拉菜单
- [ ] 4.3 切换头像后保存成功
- [ ] 4.4 修改密码后可用新密码登录
- [ ] 4.5 退出登录跳转到登录页
