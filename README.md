# Voice Hub

Discord 语音桥接守护进程，带 provider 注册表、会话隔离、Memory Bank、OpenClaw 插件和 Claude Code 插件。

## 当前实现

- `apps/bridge-daemon`：生产入口和 CLI。
- `apps/voice-hub-app`：HTTP/WebSocket/API 服务器与 Discord 集成。
- `packages/core-runtime`：provider 无关的会话运行时。
- `packages/provider-*`：分 provider 适配层。
- `packages/memory-bank`：SQLite/WAL 记忆与 webhook 幂等存储。
- `packages/openclaw-plugin`：OpenClaw 自包含插件壳。
- `packages/claude-marketplace`：Claude Code 自包含插件根目录。

## 支持的 provider

- `local-mock`
- `local-pipeline`
- `openai-realtime`
- `gemini-live`
- `hume-evi`
- `azure-voice-live`
- `volcengine-realtime`
- `qwen-dashscope`：兼容保留，不在主矩阵内

## 快速开始

```bash
pnpm install
cp .env.example .env
pnpm doctor
pnpm typecheck
pnpm build
pnpm test
```

启动守护进程：

```bash
node apps/bridge-daemon/dist/cli.js start
node apps/bridge-daemon/dist/cli.js status
```

本地安装插件：

```bash
pnpm install-openclaw-local
pnpm install-claude-local
```

## 关键默认值

- Node：`>=22.12.0`
- pnpm：`>=9`
- 默认 DB：`~/.voice-hub/voice-hub.db`
- 默认 webhook/API 路径：`/webhook/openclaw_callback`
- 默认端口：`8911`
- 默认模式：`PRECISION_MODE_DEFAULT=natural`

## 文档

- [安装](docs/install.md)
- [架构](docs/architecture.md)
- [Provider Matrix](docs/provider-matrix.md)
- [Provider 鉴权](docs/provider-auth.md)
- [Provider Fallbacks](docs/provider-fallbacks.md)
- [运行模式](docs/runtime-modes.md)
- [运维](docs/operations.md)
- [隐私与保留](docs/privacy-retention.md)
- [插件开发](docs/plugin-dev.md)
- [OpenClaw 安装说明](README.openclaw.md)
- [Claude Code 安装说明](README.claude-code.md)
- [开发者说明](README.dev.md)
- [审计记录](docs/audit-codex-final.md)

## BYOK

仓库不提供任何共享密钥。所有外部 provider 都要求你自己配置凭证；`doctor --probe-live` 只在你显式提供真实凭证后才有意义。
