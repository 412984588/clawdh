# 隐私与保留

## 默认存储

- SQLite 数据库：`~/.voice-hub/voice-hub.db`
- WAL：默认开启
- busy timeout：默认开启

## 关键表

- `pitfalls`
- `successful_patterns`
- `task_runs`
- `task_keywords`
- `processed_webhooks`
- `pending_announcements`

## 保留策略

- `task_runs` 设计为 append-only
- webhook 去重依赖 `processed_webhooks`
- 未送达通知暂存到 `pending_announcements`
- `cleanupRetention()` 负责清理过期数据

## Transcript 策略

- transcript 持久化是可配置行为
- 没有真实凭证时不建议存生产语音内容
- 同步盘/网络盘会被 `doctor` 标记风险
