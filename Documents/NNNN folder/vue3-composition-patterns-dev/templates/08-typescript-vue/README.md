# 08 — TypeScript + Vue

Vue 3 TypeScript 最佳实践：泛型组件、类型安全 emits、泛型 composable、工具类型。

## Patterns
- `SelectOption<T>` — 泛型 props 接口
- `PropType<T>` — 运行时 prop 类型
- `useList<T>` — 完全类型化的泛型列表 composable
- `createTypedEmitter<T>` — 类型安全事件总线
- `ExtractProps<C>` / `ExtractEmits<C>` — 组件类型提取
- `MaybeRef<T>` — Ref 联合类型
- `InjectionKey<T>` — 类型安全 inject
- `ComputedRef<T>` / `Ref<T>` 工具类型最佳实践

## Files
- `example.ts` — 泛型组件 + 类型工具

## Quick Start
```ts
import { useList } from './example'
const list = useList<User>({ keyExtractor: (u) => u.id })
list.add({ id: 1, name: 'Alice' })
```
