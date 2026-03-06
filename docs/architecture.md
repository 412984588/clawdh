# 架构说明

## 包结构

```text
apps/
  bridge-daemon              生产 CLI，start/stop/status/doctor/provider 子命令
  voice-hub-app              Fastify API/WebSocket + Discord bot + webhook 入口

packages/
  shared-types               Canonical runtime/provider/audio/webhook types
  shared-config              环境变量 schema 与默认值
  audio-engine               正常化音频边界、pump、watchdog、自检
  provider-contracts         provider 接口与能力协商基础
  provider-registry          provider 注册、选择、fallback 视图
  provider-openai-realtime
  provider-gemini-live
  provider-hume-evi
  provider-azure-voice-live
  provider-volcengine-realtime
  provider-local-mock
  provider-local-pipeline
  provider-test-kit          provider 一致性测试工具
  memory-bank                SQLite/WAL + 任务/坑点/成功模式/webhook 幂等
  backend-dispatcher         后端分发与 webhook 签名校验
  core-runtime               provider 无关运行时与会话所有权
  openclaw-plugin            OpenClaw 插件壳
  claude-mcp-server          Claude MCP server
  claude-marketplace         Claude Code 插件根目录
  provider                   兼容层
```

## 关键边界

- `core-runtime` 只依赖 canonical provider 接口，不消费厂商私有协议字段。
- `audio-engine` 暴露 `AudioFormatNormalizer`，统一把音频收口到 `NormalizedAudioFrame`。
- `memory-bank` 负责 `processed_webhooks` 与 `pending_announcements`，让 webhook 路由 fail-closed。
- `provider-registry` 负责 provider 选择优先级与能力快照。

## 选择与所有权

provider 选择优先级：

1. 显式 session override
2. channel override
3. guild override
4. workspace override
5. 默认 `VOICE_PROVIDER`

会话所有权：

- 单 session 单 owner
- 非 owner backend dispatch 会被拒绝
- 管理员可 override
- 会话关闭和静默超时会释放 owner

## 数据流

```text
Discord ingress
  -> audio-engine normalize
  -> core-runtime session
  -> selected provider adapter
  -> backend-dispatcher / tool bridge
  -> memory-bank persistence
  -> pending announcement recovery
  -> audio-engine egress
```

## webhook 路由

- 路由：`/webhook/openclaw_callback`
- 校验：HMAC-SHA256 + 时间窗 + delivery id 去重
- 存储：`processed_webhooks`
- 缺失目标会话时落 `pending_announcements`
- ACK 优先，慢处理走内部异步队列

## 数据库表

- `pitfalls`
- `successful_patterns`
- `task_runs`
- `task_keywords`
- `processed_webhooks`
- `pending_announcements`

默认路径：`~/.voice-hub/voice-hub.db`
