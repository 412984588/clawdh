# Provider 鉴权

## BYOK 原则

- 仓库不带任何共享 key
- `.env.example` 只给占位符
- `prepack` 和 `prepublishOnly` 会跑密钥扫描

## 按 provider 的环境变量

### OpenAI Realtime

- `OPENAI_REALTIME_WS_URL`
- `OPENAI_API_KEY`
- `OPENAI_REALTIME_MODEL`

### Gemini Live

- `GEMINI_LIVE_WS_URL`
- `GEMINI_API_KEY`
- `GEMINI_LIVE_MODEL`

### Hume EVI

- `HUME_EVI_WS_URL`
- `HUME_API_KEY`
- `HUME_CONFIG_ID`

### Azure Voice Live

- `AZURE_VOICE_LIVE_WS_URL`
- `AZURE_VOICE_LIVE_API_KEY`
- `AZURE_VOICE_LIVE_DEPLOYMENT`

### Volcengine Realtime

- `VOLCENGINE_REALTIME_WS_URL`
- `VOLCENGINE_APP_ID`
- `VOLCENGINE_ACCESS_TOKEN`

兼容别名：

- `DOUBAO_REALTIME_WS_URL`
- `DOUBAO_APP_ID`
- `DOUBAO_ACCESS_TOKEN`

### Qwen DashScope

- `QWEN_REALTIME_WS_URL`
- `QWEN_API_KEY`
- `QWEN_MODEL`
- `QWEN_VOICE`
- `QWEN_REGION`

## 验证

```bash
pnpm doctor
pnpm doctor:probe-live
node apps/bridge-daemon/dist/cli.js provider status
```
