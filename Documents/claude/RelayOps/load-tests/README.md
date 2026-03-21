# RelayOps 负载测试

基于 [k6](https://k6.io/) 的负载测试套件，用于建立性能基准线、识别瓶颈。

## 环境要求

1. **k6**：`brew install k6`（macOS）或参考 [k6 安装文档](https://grafana.com/docs/k6/latest/set-up/install-k6/)
2. **本地 Supabase**：`npx supabase start`
3. **Dev Server**：`pnpm dev`（默认 http://localhost:3000）
4. **测试用户**：需在本地 Supabase 中有可用密码登录的测试用户

## 测试用户配置

认证场景需要一个可密码登录的测试用户。通过环境变量配置：

```bash
export TEST_USER_EMAIL="partner@test.relayops.com"
export TEST_USER_PASSWORD="test-password-123"
```

在本地 Supabase 中创建测试用户：

```sql
-- 在 supabase/seed.sql 或手动执行
-- Supabase Auth Admin API 也可创建
```

## 运行方式

```bash
# 冒烟测试（1 VU × 30s）— 验证脚本可用
pnpm test:load:smoke

# 标准负载测试（50 VU × 5min）— 建立基准
pnpm test:load

# 压力测试（100 VU × 3min）— 找极限
pnpm test:load:stress
```

### 传递环境变量

```bash
# 自定义 BASE_URL 和 Supabase 配置
k6 run \
  -e BASE_URL=http://localhost:3000 \
  -e SUPABASE_URL=http://127.0.0.1:54321 \
  -e SUPABASE_ANON_KEY=your-anon-key \
  -e TEST_USER_EMAIL=partner@test.relayops.com \
  -e TEST_USER_PASSWORD=test-password-123 \
  load-tests/load.js
```

### 带 Stripe Webhook 签名

```bash
# 传入 webhook secret 以测试完整签名验证流程
k6 run -e STRIPE_WEBHOOK_SECRET=whsec_xxx load-tests/load.js
```

## 测试场景

| 场景 | 文件 | 端点 | 类型 |
|------|------|------|------|
| 公开页面 | `scenarios/public-pages.js` | `/`, `/how-it-works`, `/for-partners` | GET（页面） |
| 登录页 | `scenarios/login-page.js` | `/login` | GET（页面） |
| 工单操作 | `scenarios/partner-tickets.js` | `/partner/tickets`, Server Action | GET + POST（认证） |
| Stripe Webhook | `scenarios/stripe-webhook.js` | `/api/webhooks/stripe` | POST（API） |

## 负载模型

| 模式 | VU | 持续时间 | 用途 |
|------|-----|----------|------|
| Smoke | 1 | 30s | 验证脚本可用 |
| Load | 渐进 → 50 | 5min | 建立性能基准 |
| Stress | 渐进 → 100 | 4min | 找降级拐点 |

## 性能基准

| 指标 | 阈值 | 说明 |
|------|------|------|
| API P95 响应时间 | < 500ms | Server Action / Webhook |
| 页面 P95 响应时间 | < 2000ms | SSR 页面渲染 |
| 错误率 | < 1% | HTTP 4xx/5xx |
| 并发用户 | 50 | 无性能降级 |

## 报告输出

测试完成后报告自动输出到 `load-tests/reports/`：

- `{type}-{timestamp}.json` — 完整指标数据
- 终端输出 — 可读的汇总统计

### 解读报告

```
✓ http_req_duration..............: avg=120ms  min=45ms  med=98ms  max=890ms  p(90)=320ms  p(95)=450ms
```

- **avg**：平均响应时间
- **p(95)**：95% 请求在此时间内完成（关键指标）
- **max**：最慢请求（可能是冷启动或 GC）
- **http_req_failed**：失败率，应 < 1%

## 目录结构

```
load-tests/
├── README.md              # 本文件
├── config.js              # 共享配置（URL、阈值、stages）
├── helpers/
│   └── auth.js            # Supabase 认证 helper
├── scenarios/
│   ├── public-pages.js    # 公开页面场景
│   ├── login-page.js      # 登录页场景
│   ├── partner-tickets.js # 工单操作场景（认证）
│   └── stripe-webhook.js  # Webhook 场景
├── smoke.js               # 冒烟测试入口
├── load.js                # 标准负载入口
├── stress.js              # 压力测试入口
└── reports/               # 报告输出目录
    └── .gitkeep
```

## 注意事项

- 所有请求仅打 `localhost:3000`，不对外部服务发请求
- 负载测试不纳入 CI，仅手动触发
- k6 是系统级工具（`brew install k6`），不在 node_modules 中
- 压力测试可能导致本地 dev server 响应变慢，属正常现象
- Server Action 调用格式依赖 Next.js 内部实现，如格式变更需更新 `partner-tickets.js`
