# 05 — Reactive Forms

无第三方依赖的 Vue 3 响应式表单：字段验证规则、跨字段校验、提交状态管理。

## Patterns
- `rules.*` 验证器工厂（required/minLength/email/pattern/match）
- `createField` — 单字段状态（value/error/touched/dirty）
- `useRegisterForm` — 完整注册表单（4字段 + 密码确认）
- `validateField` / `validateAll` — 字段级 + 全量验证
- `submit(onSuccess)` — 统一提交流程（防重复提交）
- `useFieldArray` — 动态字段数组（add/remove/update/move）
- 服务端错误 `serverError` 绑定

## Files
- `example.ts` — 验证规则 + 表单 composable

## Quick Start
```ts
import { useRegisterForm } from './example'
const { form, errors, submit } = useRegisterForm()
```
