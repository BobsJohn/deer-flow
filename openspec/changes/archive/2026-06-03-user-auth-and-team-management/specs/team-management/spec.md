# 团队管理规格说明

## 新增需求

### 需求: 团队列表页

#### 场景: 查看所有团队

- **当** 管理员访问 `/marketplace/teams`
- **那么** 页面调用 `GET /api/marketplace/teams` 展示团队列表
- **并且** 每个团队显示名称、描述、成员数

### 需求: 团队成员管理

#### 场景: 查看团队成员

- **当** 管理员点击某团队
- **那么** 页面调用 `GET /api/marketplace/teams/{id}/users` 展示成员列表
- **并且** 每个成员显示姓名、邮箱、角色

#### 场景: 添加成员

- **当** 管理员在团队详情页点击"添加成员"
- **那么** 弹出表单（email + 角色选择）
- **并且** 提交后调用 `POST /api/marketplace/teams/{id}/users`

#### 场景: 移除成员

- **当** 管理员点击成员旁的"移除"
- **那么** 调用 `DELETE /api/marketplace/teams/{id}/users/{user_id}`

### 需求: 角色权限

#### 场景: 角色限制

- **当** `user` 角色的用户访问团队管理页面
- **那么** 只读展示，不显示"添加/移除"操作按钮
- **并且** 后端拒绝写操作返回 403

#### 场景: 角色分配

- **当** 管理员创建团队时分配 admin/developer/user
- **那么** role 字段控制：admin 可管理团队、developer 可发布 Skill、user 可使用 Skill
