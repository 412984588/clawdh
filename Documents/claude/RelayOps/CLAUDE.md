# CLAUDE.md — RelayOps

## Commands

```bash
pnpm test                    # vitest（全量）
pnpm test -- src/lib/xxx     # 单文件/目录
pnpm dev                     # Next.js dev server
pnpm build                   # 生产构建
pnpm lint                    # ESLint
pnpm test:e2e                # Playwright（需先 npx supabase start + pnpm dev）
npx supabase start           # 本地 Supabase（Docker）
npx supabase db reset        # 重置数据库 + 跑迁移 + seed
```

## Architecture

```
React Pages → Server Actions → Workflows → Services + State Machine → Supabase
```

| 层 | 路径 | 职责 |
|---|---|---|
| **Server Actions** | `src/lib/actions/` | 鉴权 → 调 workflow → revalidatePath |
| **Workflows** | `src/lib/workflows/` | 多步原子业务逻辑（创建工单+通知+日志） |
| **Services** | `src/lib/services/` | 单表 CRUD，返回 `{ data, error }` 元组 |
| **State Machine** | `src/lib/state-machine/` | 状态转换 + guards + engine |
| **Integrations** | `src/lib/integrations/` | 外部服务（Stripe/Resend/Lark），mock/live 双模式 |
| **Validations** | `src/lib/validations/` | Zod schemas，所有输入校验 |

## Key Invariants

1. **状态变更必须走 `transitionTicket()`**（`state-machine/engine.ts`）— 禁止直接 UPDATE status 字段
2. **财务操作必须写 `ledger_entries`** — 禁止直接改余额
3. **集成层通过 `INTEGRATION_MODE=mock|live`** 切换真假服务
4. **Supabase 三种客户端**：browser（RLS）、server（session）、admin（service_role）— 选错会越权或报权限错
5. **Cron 端点需要 `Authorization: Bearer <CRON_SECRET>`** header
6. **错误用 AppError 层级**（`utils/errors.ts`）— `UnauthorizedError(401)` / `ForbiddenError(403)` / `NotFoundError(404)` / `ValidationError(422)`，用 `isAppError()` 判断类型

## Patterns

### Server Action 认证（两步）

所有 server action 共用同一模式（见 `src/lib/actions/ticket.actions.ts`）：

1. `getAuthUser()` — 从 session 取认证用户（server client）
2. `getUserRecord(id)` — 从 DB 取角色和组织（admin client）

只做第一步会漏掉角色校验。永远不要只靠 session 判断权限

### Workflow 原子性

workflow 内任一步失败立即返回 `{ success: false, error }`，不做部分完成。验证和鉴权在 action 层完成，不在 workflow 里重复

## Testing

### 文件组织

- 主体测试：`tests/` 目录，子目录镜像 `src/lib/`（actions/ services/ workflows/ state-machine/ validations/ utils/）
- Cron 路由：colocated 在 `src/app/api/cron/{name}/__tests__/route.test.ts`
- 全局 setup：`tests/setup.ts`（设 `TZ=UTC` + mock 环境变量，保证日期测试无时区漂移）

### Mock 模式

`tests/helpers/mock-supabase.ts` 提供：
- `createMockSupabase()` — 基础 mock client
- `ok(data)` / `err(message)` — 快速构造成功/失败链
- `makeChain(result)` — 可链式调用的完整 mock（支持 `.eq().select().single()` 等）
- 多步操作用 `client.from.mockReturnValueOnce(ok(...))` 逐次 mock

### 覆盖率

阈值 90/90/80/90（lines/functions/branches/statements），只统计 `src/lib/**/*.ts`，排除 types/config/supabase 目录

### E2E

Playwright 测试使用预认证的 storage state（按角色区分），需要本地 Supabase + dev server 运行

## Code Conventions

- 业务逻辑写中文注释
- TypeScript strict mode，路径别名 `@/` → `src/`
- Service 层统一返回 `{ data, error }` 元组
- 所有用户输入用 Zod schema 校验
- pnpm 作为包管理器（有 pnpm-lock.yaml）

## Stripe Webhook 本地测试

```bash
# 1. 安装 Stripe CLI: https://stripe.com/docs/stripe-cli
# 2. 登录
stripe login

# 3. 转发 webhook 到本地 dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. CLI 会输出 webhook signing secret (whsec_...)，设置到 .env.local:
#    STRIPE_WEBHOOK_SECRET=whsec_...
#    INTEGRATION_MODE=live

# 5. 触发测试事件
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

生产环境：`STRIPE_WEBHOOK_SECRET` 从 Stripe Dashboard → Webhooks → Signing secret 获取。签名验证由 `constructWebhookEvent` 自动处理，无效签名返回 400 并上报 Sentry

## Gotchas

- 日期测试用 `T12:00:00Z`（UTC 正午），避免时区边界 flaky
- 首次 `npx supabase start` 拉 ~1GB Docker 镜像，后续秒启
- Stripe SDK 版本要和代码中 `apiVersion` 对齐，否则类型报错
- `tests/setup.ts` 已设 `process.env.TZ = 'UTC'`，新增日期测试无需再设
