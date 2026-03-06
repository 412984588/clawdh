# Provider Matrix

| Provider              | 传输      | Full Duplex | Barge-in | Tool Calling | Transcript Final | Text Announcement | 运行时支持     | 当前状态 |
| --------------------- | --------- | ----------- | -------- | ------------ | ---------------- | ----------------- | -------------- | -------- |
| `local-mock`          | local     | yes         | yes      | yes          | yes              | yes               | server/browser | 已实现   |
| `local-pipeline`      | local     | no          | no       | no           | no               | no                | server         | 骨架     |
| `openai-realtime`     | websocket | yes         | yes      | yes          | yes              | yes               | server         | 适配骨架 |
| `gemini-live`         | websocket | yes         | yes      | yes          | yes              | yes               | server         | 适配骨架 |
| `hume-evi`            | websocket | yes         | yes      | no           | yes              | yes               | server         | 适配骨架 |
| `azure-voice-live`    | websocket | yes         | yes      | yes          | yes              | yes               | server         | 适配骨架 |
| `volcengine-realtime` | websocket | yes         | yes      | yes          | yes              | yes               | server         | 适配骨架 |
| `qwen-dashscope`      | websocket | legacy      | legacy   | legacy       | legacy           | legacy            | server         | 兼容保留 |

## 说明

- “适配骨架”表示 canonical adapter、能力描述和 conformance 测试入口已在仓库内，但真实外部协议字段仍有 `TODO(protocol-confirmation)`。
- `doctor --probe-live` 在提供真实凭证前不会伪造 PASS。
- `local-mock` 是推荐的本地开发 provider。
