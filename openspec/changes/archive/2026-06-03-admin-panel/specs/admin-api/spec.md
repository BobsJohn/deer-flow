# 管理员 API 规格说明

## 新增需求

### 需求: RoleGuard 中间件

#### 场景: 非管理员调用 admin API

- **当** 用户 role != "admin" 调用任何 `/api/marketplace/admin/` 接口
- **那么** 返回 403 Forbidden

### 需求: 用户管理

#### 场景: 查看所有用户

- **当** 管理员访问用户管理页面
- **那么** 调用 `GET /api/marketplace/admin/users` 获取全平台用户列表
- **并且** 返回 id / name / email / role / team_id / team_name

#### 场景: 修改用户角色

- **当** 管理员修改用户角色
- **那么** 调用 `PUT /api/marketplace/admin/users/{id}/role` 传入新 role
- **并且** 后端校验 role 值合法（user / developer / admin）

### 需求: 资产审核

#### 场景: 查看待审核技能

- **当** 管理员打开资产审核页面
- **那么** 调用 `GET /api/marketplace/admin/skills/pending`
- **并且** 返回所有 status=draft 或 review 的 Skill

#### 场景: 审核通过/驳回

- **当** 管理员点击"通过"
- **那么** 调用 `PUT /api/marketplace/admin/skills/{id}/review` 传入 `{status: "published"}`
- **当** 管理员点击"驳回"
- **那么** 调用同一接口传入 `{status: "draft", reason: "原因"}`

### 需求: 运营概览

#### 场景: 查看平台概况

- **当** 管理员打开管理后台
- **那么** 调用 `GET /api/marketplace/dashboard/stats`
- **并且** 展示总用户数/总技能数/待审核数/总执行次数
