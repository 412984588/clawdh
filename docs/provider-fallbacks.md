# Provider Fallbacks

## 当前 fallback 规则

- provider 不支持 native tool calling：
  退回本地工具意图桥接和 backend dispatcher。
- provider 不支持 text announcement：
  退回本地 announcement queue，或标记为 unsupported。
- provider 不支持 transcript：
  只能依赖本地适配器，未配置时直接标 unsupported。
- provider 仅浏览器可用：
  daemon `doctor` 标记 unsupported，阻止误启动。
- provider 没有 semantic VAD：
  退回 server VAD 或本地控制逻辑。
- provider 没有 reasoning injection：
  退回 announcement/context bridge。

## 设计原则

- unsupported 必须显式暴露
- 不伪造 capability
- fallback 原因应能被 `doctor` 和 provider matrix 解释
