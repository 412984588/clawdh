# Runtime Modes

## Natural Mode

- 默认模式：`PRECISION_MODE_DEFAULT=natural`
- 正常 turn-taking
- 更接近电话式交互

## Precision Mode

- `PRECISION_MODE_DEFAULT=precision`
- 适合工具执行、精确切换、手动推进 turn
- 适合 backend callback 回灌与结构化控制

## Announcement Priority

- `immediate`
- `after-current-turn`
- `queued`

## 会话隔离

- 每个活跃 session 独占一个 provider 实例
- owner claim/release 独立
- webhook callback 不跨 session 注入
