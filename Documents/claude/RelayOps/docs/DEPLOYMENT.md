# RelayOps — Production Deployment Guide

## Vercel 部署 Step-by-Step

### 1. 连接仓库

1. 登录 [vercel.com](https://vercel.com)
2. Import Git Repository → 选择 RelayOps 仓库
3. Framework Preset: **Next.js**（自动检测）
4. Build Command: `pnpm build`
5. Install Command: `pnpm install`

### 2. 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables 中逐一添加：

#### 必填变量（Priority 1 — 缺失则构建/运行失败）

| Variable | 值来源 | 说明 |
|----------|--------|------|
| `INTEGRATION_MODE` | `live` | **必须为 live**，mock 会在生产环境抛出 fatal error |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | 生产项目的 API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | 公开 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | 服务端 service_role key（不暴露给客户端） |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | 生产域名（含 https://） |

#### 支付变量（Priority 2 — 缺失则支付流程不可用）

| Variable | 值来源 | 说明 |
|----------|--------|------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | `sk_live_...` 或 `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys | `pk_live_...` 或 `pk_test_...` |

#### 通知变量（Priority 3 — 缺失则邮件/定时任务不可用）

| Variable | 值来源 | 说明 |
|----------|--------|------|
| `RESEND_API_KEY` | resend.com → API Keys | `re_...` |
| `EMAIL_FROM` | 已验证域名 | `RelayOps <noreply@yourdomain.com>` |
| `CRON_SECRET` | 自行生成 | `openssl rand -hex 32` |
| `ADMIN_NOTIFICATION_EMAIL` | 运维邮箱 | SLA 告警和系统通知接收地址 |

#### 可观测性变量（Priority 4 — 可选，推荐开启）

| Variable | 值来源 | 说明 |
|----------|--------|------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → Project → Client Keys | 客户端错误追踪 |
| `SENTRY_DSN` | Sentry → Project → Client Keys | 服务端错误追踪 |
| `MIXPANEL_TOKEN` | Mixpanel → Settings → Project Token | 用户行为分析 |

### 3. 配置 Stripe Webhook

1. 登录 Stripe Dashboard → Developers → Webhooks
2. Add Endpoint: `https://your-domain.com/api/webhooks/stripe`
3. 选择事件: `invoice.paid`, `invoice.payment_failed`
4. 复制 Signing secret → 设置为 `STRIPE_WEBHOOK_SECRET`

### 4. 配置 Vercel Cron

在 `vercel.json` 中定义（如未创建，需新建）：

```json
{
  "crons": [
    { "path": "/api/cron/check-timeouts", "schedule": "0 * * * *" },
    { "path": "/api/cron/send-reminders", "schedule": "0 */4 * * *" },
    { "path": "/api/cron/data-retention", "schedule": "0 2 * * *" }
  ]
}
```

Vercel Cron 会自动附带 `Authorization: Bearer <CRON_SECRET>` header。

### 5. 部署

```bash
git push origin main
```

Vercel 自动构建 + 部署。首次部署后检查 Functions tab 确认 serverless 函数正常。

---

## Supabase 生产配置要点

### 项目创建

1. 登录 [supabase.com](https://supabase.com) → New Project
2. 选择 Region（推荐与 Vercel 部署区域相同）
3. 设置强密码（数据库密码）

### 迁移

```bash
# 将本地迁移推送到生产 Supabase
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### RLS 确认

迁移后验证 RLS 策略已生效：

```sql
-- 在 SQL Editor 中执行
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

所有 `rowsecurity` 应为 `true`。

### Storage Bucket

确认 `ticket-files` bucket 已创建且 RLS 策略已应用（迁移 `00010` 和 `00015` 覆盖）。

### Auth 配置

1. Authentication → Providers → 启用 Email（密码登录模式）
2. Authentication → URL Configuration → Site URL 设为生产域名
3. Authentication → URL Configuration → Redirect URLs 添加 `https://your-domain.com/auth/callback`

---

## 上线前检查清单

### 环境变量

- [ ] `INTEGRATION_MODE=live`（严禁 mock）
- [ ] 所有 Priority 1 变量已设置且非空
- [ ] `NEXT_PUBLIC_APP_URL` 指向正确的生产域名
- [ ] `CRON_SECRET` 已设置（随机字符串，至少 32 字符）

### Supabase

- [ ] 生产项目已创建
- [ ] 所有迁移已推送（`npx supabase db push`）
- [ ] RLS 已启用（所有表 `rowsecurity = true`）
- [ ] Storage bucket `ticket-files` 已创建
- [ ] Auth → Site URL 指向生产域名
- [ ] Auth → Redirect URLs 包含 `/auth/callback`

### Stripe

- [ ] Webhook endpoint 已注册（指向生产域名）
- [ ] 事件选择：`invoice.paid`, `invoice.payment_failed`
- [ ] `STRIPE_WEBHOOK_SECRET` 匹配 Stripe Dashboard 中的 Signing secret
- [ ] 使用 `sk_live_...` / `pk_live_...`（非 test keys，除非 staging）

### Resend

- [ ] 发送域名已验证（DNS 记录）
- [ ] `EMAIL_FROM` 使用已验证域名
- [ ] 测试邮件发送成功

### Vercel

- [ ] Cron jobs 已配置（`vercel.json`）
- [ ] 构建成功（`pnpm build` 无报错）
- [ ] Functions tab 确认 serverless 函数正常
- [ ] 自定义域名已绑定 + SSL 证书生效

### 可观测性

- [ ] Sentry DSN 已配置（推荐）
- [ ] Mixpanel Token 已配置（推荐）
- [ ] `ADMIN_NOTIFICATION_EMAIL` 已设置

### 安全

- [ ] 所有 secret 仅在 Vercel 环境变量中（不在代码仓库）
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 标记为 Sensitive（Vercel 设置）
- [ ] HTTPS 强制（Vercel 默认，HSTS 头已在 `next.config.ts` 配置）
- [ ] CSP 头已配置（`next.config.ts`）

### 功能验证

- [ ] 首页可正常访问
- [ ] 登录流程正常
- [ ] 工单创建 → 范围锁定 → 开票 → 支付完整流程
- [ ] 邮件通知正常发送
- [ ] Cron job 按计划执行
- [ ] 中文版 `/zh` 路径可正常访问
