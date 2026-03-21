# 02 — Composables

Vue 3 可复用逻辑（Composables）：状态管理、副作用封装、自动清理。

## Patterns
- `useToggle` — 布尔状态切换
- `useLocalStorage<T>` — 持久化响应式状态
- `useFetch<T>` — 数据获取 + 响应式 URL 自动重请求
- `useEventListener` — 自动注销的事件监听
- `useDebounce<T>` — 防抖响应式值
- `useMediaQuery` — 响应式媒体查询
- `useIntersectionObserver` — 懒加载触发
- `useAsync` — 通用异步操作状态管理

## Files
- `example.ts` — 8 个 composable 实现

## Quick Start
```ts
import { useToggle, useFetch } from './example'
const { state: isOpen, toggle } = useToggle()
const { data, loading } = useFetch<User[]>('/api/users')
```
