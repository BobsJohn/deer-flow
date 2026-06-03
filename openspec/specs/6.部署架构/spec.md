# 部署架构

## 当前架构

```
浏览器                                    Nginx (2026)
  │                                          │
  ├── /marketplace/*  ──── 能力广场前端 ──┬──┤
  │                                       │  ├── 前端 -> / (Next.js 3000)
  └── /api/marketplace/* ── marketplace-server (8003)
                                           │
                                           └── /api/* -> Gateway API (8001)
```

## 两阶段部署

### V1：开发模式

```
能力广场：独立启动
  uv icon app.main:app --port 8003 --reload
  → 前端直接调 localhost:8003

DeerFlow：原有方式启动
  make dev → Nginx 2026
```

### V2：生产集成

```
Nginx 2026 增加反向代理规则：
  /api/marketplace/* -> marketplace-server:8003

统一入口：
  所有请求通过 Nginx 2026
  前端路径：/marketplace
  API 路径：/api/marketplace/*
```

## 数据存储

| V1 | V2 |
|----|----|
| SQLite 本地文件 | PostgreSQL |
| 本地文件系统存储 | S3/MinIO/Nexus 对象存储 |

## 与 DeerFlow 的集成方式

| 集成点 | 方案 |
|--------|------|
| 部署关系 | 独立部署，不塞入 DeerFlow 后端 |
| 通信协议 | REST API（主）+ MCP（辅助，V2） |
| 前端共存 | 在 Next.js 中新增 /marketplace/* 路由 |
| 画布集成 | 利用 DeerFlow 画布扩展点添加侧边栏 |
| 执行时调用 | DeerFlow 通过 REST API 获取 Skill 内容 |
