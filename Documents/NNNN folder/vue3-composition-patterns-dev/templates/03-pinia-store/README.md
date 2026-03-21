# 03 — Pinia Store

Pinia 2.x 状态管理：Option Store、Setup Store、跨 Store 组合、持久化插件。

## Patterns
- Option Store 语法（state / getters / actions）
- Setup Store 语法（推荐，完整 Composition API）
- `storeToRefs` — 解构保持响应性
- User Store — 登录/登出/更新 Profile
- Cart Store — 复杂购物车状态 + localStorage 持久化
- Checkout Store — 跨 Store 依赖组合
- Pinia 插件模式 — 自动持久化
- `$patch` / `$reset` / `$subscribe`

## Files
- `example.ts` — Store 定义 + 独立 composable 模拟实现

## Quick Start
```bash
npm install pinia
# main.ts: app.use(createPinia())
```
