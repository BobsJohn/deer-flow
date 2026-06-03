## 为什么

现在用户登录后没有任何个人信息入口——右上角空白，不知道当前登录的是谁，没法退出，也没法改密码。使用体验不完整。

## 变更内容

1. **新增右上角用户菜单** — 显示用户头像和名称，点击弹出下拉菜单（个人信息 / 修改密码 / 退出登录）
2. **新增个人信息弹窗** — 显示用户信息，可切换头像
3. **新增修改密码界面** — 弹窗内修改密码
4. **后端新增 `PUT /me` 和 `PUT /me/password`** — 支持更新用户信息和修改密码

## 功能 (Capabilities)

### 新增功能
- `user-menu`: 右上角用户头像 + 下拉菜单，含退出登录
- `profile-edit`: 个人信息弹窗 + 内置头像选择 + 密码修改

### 修改功能
- 无

## 影响

- `marketplace-server/app/routers/auth.py` — 新增 PUT /me、PUT /me/password
- `marketplace-server/app/models.py` — 新增 ProfileUpdate、PasswordChange 模型
- `frontend/src/components/marketplace/` — 新增 UserMenu 组件 + ManagedAvatar 组件
- `frontend/src/app/marketplace/page.tsx` — Header 区域集成 UserMenu
- `frontend/src/components/marketplace/api.ts` — 新增头像默认列表常量
