# 04 — Vue Router

Vue Router 4 完整模式：命名路由、嵌套路由、导航守卫、懒加载、元信息。

## Patterns
- 路由配置 + 类型化 `RouteMeta`
- 动态路由参数（`/users/:id(\\d+)`）
- 嵌套路由（dashboard 子路由）
- `props: true` — 路由 params 作为 props
- `router.beforeEach` 认证守卫工厂
- `router.afterEach` 页面标题守卫
- 类型安全路由参数 composable
- `scrollBehavior` — 记忆滚动位置
- 查询参数解析辅助 (`useQueryParam`, `usePaginationQuery`)

## Files
- `example.ts` — 路由配置 + 守卫 + composable 工具

## Quick Start
```bash
npm install vue-router@4
# router/index.ts: createRouter({ history: createWebHistory(), routes })
```
