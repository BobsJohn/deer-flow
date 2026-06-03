# 设计

## 上下文

目前能力广场无用户体系，所有请求用 `team_id=1` 硬编码。后端已有 User 表和 team/users API（只差 team CRUD），前端只有一个市场首页和一个详情页。

## 目标/非目标

**目标：**
- 让用户能注册/登录，API 调用带用户身份
- 前端团队管理页面（列表 + 成员管理）
- 在登录前标记哪些路由需要认证、哪些公开

**非目标：**
- 不引入 OAuth、SSO、微信登录等——V1 简配密码登录
- 不改动现有后端 API 的业务逻辑（只加 userId 上下文参数）

## 决策

### 决策1：JWT token + password 哈希（SHA-256）

- 用 pyjwt 签发 HS256 token
- 密码不存明文，SHA-256 哈希后存
- token 有效期 24h，存在 localStorage
- 选择 SHA-256 而非 bcrypt（bcrypt 已引入但密码验证在业务层加，避免改动 db_models）

### 决策2：认证中间件（可选跳过）

- 后端 `/login`、`/register`、`/health` 为公开路由
- 其余请求通过中间件检查 `Authorization: Bearer <token>` 头
- 中间件将 `user_id` 注入 request state
- 开发模式下可通过 `SKIP_AUTH=true` 环境变量跳过

### 决策3：前端路由保护

- `/marketplace/login` 公开
- 其余页面客户端判断是否有 token，无则跳转到登录页
- 用 localStorage 存 token，`fetch` 时自动附加 `Authorization` 头
