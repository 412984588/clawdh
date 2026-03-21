# 09 — Transitions

Vue 3 过渡动画全模式：CSS 过渡类名、JS 钩子、TransitionGroup 列表、GSAP 集成。

## Patterns
- `CSS_TRANSITION_CLASSES` — fade/slideRight/slideDown/scale Tailwind 类名集
- `collapseHooks` — 高度展开/收起 JS 钩子（手风琴效果）
- `TransitionGroup` 列表动画 + `.list-move` 流畅重排
- `useTransitionState` — 过渡状态 + isAnimating 追踪
- GSAP 集成模式（注释形式，含 stagger 列表动画）
- 路由过渡 `useRouteTransition` — 基于方向切换过渡名称

## Files
- `example.ts` — CSS 类名配置 + JS 钩子 + composable

## Quick Start
```vue
<Transition v-bind="collapseHooks">
  <div v-if="show">Expandable content</div>
</Transition>
```
