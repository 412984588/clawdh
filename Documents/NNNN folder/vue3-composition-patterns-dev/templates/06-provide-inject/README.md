# 06 — Provide / Inject

Vue 3 依赖注入模式：类型安全注入键、Theme/User/Toast 上下文、全局插件。

## Patterns
- `InjectionKey<T>` — Symbol 注入键，保证类型安全
- `THEME_KEY` — 主题 Provider（亮/暗模式切换）
- `USER_KEY` — 用户上下文（登录状态、displayName）
- `TOAST_KEY` — 全局通知系统（toast/dismiss/clear）
- `inject(key)` 未找到时抛出有意义的错误
- `injectWithDefault<T>` — 带默认值安全注入
- Vue Plugin 安装模式（`app.use(Plugin)`）

## Files
- `example.ts` — 3 个 Provider + 对应 use hooks

## Quick Start
```ts
// App.vue setup:
provideTheme(); provideUser(); provideToast()
// 子组件:
const { toggle } = useTheme()
const { toast } = useToast()
```
