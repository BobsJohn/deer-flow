# 任务

## 1. 后端 — 安装 API

- [x] 1.1 `routers/skills.py` 新增 `POST /{skill_id}/install`
- [x] 1.2 校验权限：public 直接放行，commercial 需 License（暂不实现）
- [x] 1.3 检查 `skills/custom/{name}/SKILL.md` 是否存在，存在返回 409
- [x] 1.4 `?force=true` 时覆盖写入
- [x] 1.5 生成 SKILL.md 并写入文件系统

## 2. 前端 — 按钮联动

- [x] 2.1 详情页"直接使用"按钮调 `/install`
- [x] 2.2 收到 409 时弹确认框"技能已存在，是否覆盖？"
- [x] 2.3 确认后调 `/install?force=true`
- [x] 2.4 安装后显示成功提示

## 3. 验证

- [x] 3.1 安装后 `skills/custom/{name}/SKILL.md` 文件存在
- [x] 3.2 重复安装返回 409
- [x] 3.3 force=true 覆盖写入成功
- [x] 3.4 public 技能可安装，commercial 返回 403
