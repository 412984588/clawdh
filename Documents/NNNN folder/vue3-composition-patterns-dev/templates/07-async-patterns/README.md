# 07 — Async Patterns

Vue 3 异步处理全模式：Suspense、defineAsyncComponent、错误边界、竞态取消、乐观更新。

## Patterns
- `defineAsyncComponent` — 懒加载 + 重试（指数退避）
- async setup + `<Suspense>` — 服务端数据等待
- `onErrorCaptured` 错误边界
- `useRaceFreeFetch` — AbortController 防竞态
- `usePaginatedLoader` — 分页 + 加载更多
- `useOptimisticUpdate` — 先更新 UI，失败回滚
- `Promise.all` 并发请求

## Files
- `example.ts` — 所有异步模式实现

## Quick Start
```ts
import { usePaginatedLoader, useRaceFreeFetch } from './example'
const { items, loadFirst, loadMore, hasMore } = usePaginatedLoader(fetchPage)
```
