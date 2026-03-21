# 10 — Testing Patterns

Vue 3 测试全模式：Vitest + @vue/test-utils、composable 单元测试、组件测试、依赖 mock。

## Patterns
- `useCounter` + `useTodoList` 被测 composable
- 内联断言测试（无框架依赖，可直接 node 运行）
- Vitest + @vue/test-utils 组件测试示例（注释形式）
- `mount({ props })` + `wrapper.find` + `wrapper.trigger`
- `emitted()` 事件断言
- 依赖注入 mock（`createTestItems` 测试数据工厂）
- `describe/it/expect` 结构化测试套件

## Files
- `example.ts` — 被测代码 + 内联测试 + Vitest 示例注释

## Quick Start
```bash
npm install -D vitest @vue/test-utils happy-dom
npx vitest run
# 或直接运行内联测试:
npx ts-node templates/10-testing-patterns/example.ts
```
