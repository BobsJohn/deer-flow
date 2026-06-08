## 为什么

能力广场的"直接使用"按钮目前没有实际效果。Skill 数据存在 marketplace-server 的 SQLite 里，DeerFlow 无法发现和执行。路线B 的目标是：点击"直接使用"后，将 Skill 内容写入 DeerFlow 的 `skills/custom/` 目录，重启后即可被 DeerFlow Agent 加载。

## 变更内容

1. **新增 API**: `POST /api/marketplace/skills/{id}/install` — 校验权限 → 检查冲突 → 写入文件系统
2. **冲突处理**: 同名 Skill 已存在时返回冲突信息（含路径），前端弹窗让用户选择「覆盖」或「取消」
3. **前端联动**: 详情页"直接使用"按钮调用 `/install`，冲突时弹确认框
4. **写入格式**: 生成标准 SKILL.md（YAML frontmatter + Markdown 内容），放在 `skills/custom/{skill-name}/` 下

## 功能

### 新增功能
- `skill-install`: 后端安装 API + 前端联动

## 影响

- `marketplace-server/app/routers/skills.py` — 新增 POST /{id}/install
- `frontend/src/app/marketplace/skills/[id]/page.tsx` — 按钮事件
