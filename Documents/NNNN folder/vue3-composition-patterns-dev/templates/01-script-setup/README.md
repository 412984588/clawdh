# 01 — Script Setup

Vue 3 `<script setup>` 语法：defineProps、defineEmits、defineExpose、useAttrs、useSlots、v-model 绑定。

## Patterns
- `defineProps<T>()` — 泛型 props 声明，完整类型推断
- `withDefaults` — props 默认值
- `defineEmits<T>()` — 类型安全事件声明
- `defineExpose` — 向父组件暴露 API
- `useAttrs()` + `inheritAttrs: false` — 手动透传属性
- `useSlots()` — 运行时插槽检测
- `computed v-model` — 双向绑定最佳实践

## Files
- `example.ts` — 所有模式的 TypeScript 实现

## Quick Start
```bash
npm create vue@latest my-app
# 复制代码到 .vue 组件的 <script setup> 块中
```
