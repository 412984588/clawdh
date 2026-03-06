# 安装指南

## 前置要求

- Node.js `>=22.12.0`
- pnpm `>=9`
- Discord Bot 凭证
- 至少一个可用 provider，或先用 `local-mock`

## 安装步骤

```bash
pnpm install
cp .env.example .env
pnpm doctor
pnpm typecheck
pnpm build
pnpm test
```

## 推荐的最小 `.env`

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_VOICE_CHANNEL_ID=your_voice_channel_id
VOICE_PROVIDER=local-mock
WEBHOOK_SECRET=replace-with-random-secret
WEBHOOK_PORT=8911
WEBHOOK_PATH=/webhook/openclaw_callback
```

## 启动方式

构建后启动守护进程：

```bash
node apps/bridge-daemon/dist/cli.js start
node apps/bridge-daemon/dist/cli.js status
```

直接运行 doctor：

```bash
node apps/bridge-daemon/dist/cli.js doctor
pnpm doctor:probe-live
```

## 健康检查

```bash
curl http://127.0.0.1:8911/health
curl http://127.0.0.1:8911/ready
```

## 插件安装

OpenClaw：

```bash
pnpm install-openclaw-local
pnpm smoke:openclaw:install
```

Claude Code：

```bash
pnpm install-claude-local
pnpm smoke:claude:install
```

## 重要默认值

- DB：`~/.voice-hub/voice-hub.db`
- webhook 路径：`/webhook/openclaw_callback`
- `doctor --probe-live` 没有真实凭证时会返回 `ENVIRONMENT-BLOCKED`
