## 上下文

路线B 不涉及加密传输，也不依赖 DeerFlow 运行时。关键决策是写入位置、写入格式、冲突策略。

## 目标/非目标

**目标：**
- 后端 API 完成权限校验 + 文件写入
- 前端调用 API + 冲突弹窗

**非目标：**
- 不修改 DeerFlow 的 skill 加载逻辑
- 不做实时热加载（重启 DeerFlow 才生效）

## 决策

### 决策1：目标路径 hardcode 为项目根目录下的 skills/custom/

当前项目结构：

```
deer-flow/
├── skills/
│   ├── public/       ← DeerFlow 内置 Skill（只读）
│   └── custom/       ← 用户自定义 Skill（可写）
├── marketplace-server/
│   └── app/
```

安装到 `skills/custom/{skill-name}/SKILL.md`。路径从配置读取，默认 `../../skills/custom`（相对 marketplace-server 的 CWD）。

### 决策2：冲突时返回 409 + conflict 信息

前端收到 409 后弹确认框"该技能已存在，是否覆盖？"。
用户确认后调同样的 API 加 `?force=true` 参数强制覆盖。
不改名——同名意味着同一技能，改名没有意义。

### 决策3：SKILL.md 格式

```yaml
---
name: {技能名}
description: {技能描述}
---

# {技能名}

{技能描述}

## Instructions

{content_public 或 content_encrypted 解密后的内容}
```

## 接口设计

```
POST /api/marketplace/skills/{id}/install
  Headers: Authorization: Bearer <token>
  Query: ?force=false (可选)
  Response 200: {"success": true, "path": "skills/custom/{name}/SKILL.md"}
  Response 409: {"detail": "技能已存在", "path": "skills/custom/{name}/SKILL.md"}
  Response 403: {"detail": "无权使用此技能"} (商业级需要 License)
```
