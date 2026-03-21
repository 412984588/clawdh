# RelayOps 安全审计报告

**日期：** 2026-03-21
**审计范围：** OWASP Top 10 (2021) 逐项检查
**审计方式：** 静态代码分析 + 配置审查

## 总体评分：8.8 / 10

## OWASP Top 10 检查清单

### A01 — 访问控制失效 (Broken Access Control)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| RLS 策略覆盖所有表 | PASS | 6 个迁移文件，tickets/ledger/assignments/comments/storage 全覆盖 |
| Server Action 角色守卫 | PASS | 两层防御：getSessionUser() + role 检查，8 个 action 文件一致 |
| Middleware 路由守卫 | PASS | middleware.ts 按角色限制路径访问，未认证重定向 /login |
| Partner 数据隔离 | PASS | getPartnerOwnedTicket() 使用 server client（RLS 保护），验证 organization_id |
| Worker 数据隔离 | PASS | getWorkerContext() 验证 worker_profiles.user_id |
| Admin 跨组织访问 | N/A | Admin 设计为全权，无组织边界（单租户架构） |
| Ledger 防篡改 | PASS | RLS `WITH CHECK (false)` 禁止 authenticated 角色直接写入 |
| Storage 文件隔离 | PASS | ticket-files 按 ticket_id 前缀 + 角色策略隔离 |

**评分：9/10**

### A02 — 加密失败 (Cryptographic Failures)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| 传输加密 (TLS) | PASS | Vercel 自动 HTTPS，HSTS 头已添加 |
| 密钥管理 | PASS | 所有密钥通过环境变量管理，零硬编码 |
| Session 令牌安全 | PASS | Supabase SSR 自动 httpOnly + Secure + SameSite |
| Stripe Webhook 签名 | PASS | 使用 Stripe SDK 官方签名验证 |
| Cron 密钥比较 | PASS | 已修复为 timingSafeCompare（防 timing attack） |
| 密码存储 | N/A | 使用 Supabase Auth OTP，不存储密码 |

**评分：9.5/10** — 修复后

### A03 — 注入 (Injection)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| SQL 注入 | PASS | 所有 DB 查询通过 Supabase JS SDK（参数化查询），无 raw SQL |
| XSS | PASS | React 自动转义 + CSP 头已添加 |
| 输入校验 | PASS | 所有用户输入经 Zod schema 校验（ticketCreateSchema 等） |
| Server Action 参数 | PASS | 入口处 safeParse，失败直接返回错误 |

**评分：10/10**

### A04 — 不安全设计 (Insecure Design)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| 状态机引擎 | PASS | transitionTicket() 强制走 guards，禁止直接 UPDATE status |
| 财务操作审计 | PASS | ledger_entries 记录所有财务变更 |
| Workflow 原子性 | PASS | 任一步失败立即返回，不做部分完成 |
| 幂等性 | PASS | Webhook + Cron 使用 ticket_events 防重复处理 |

**评分：9/10**

### A05 — 安全配置错误 (Security Misconfiguration)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| X-Frame-Options | PASS | DENY |
| X-Content-Type-Options | PASS | nosniff |
| Content-Security-Policy | PASS | 完整 CSP 策略（已添加） |
| Strict-Transport-Security | PASS | max-age=31536000; includeSubDomains; preload（生产环境，已添加） |
| Referrer-Policy | PASS | strict-origin-when-cross-origin |
| Permissions-Policy | PASS | camera/microphone/geolocation 全禁 |
| Server Actions allowedOrigins | PASS | 白名单配置，从环境变量读取 |
| 生产环境禁 mock | PASS | env.ts 检查 VERCEL_ENV=production 时禁 INTEGRATION_MODE=mock |
| 错误信息泄露 | PASS | AppError 层级控制错误码，不暴露内部实现 |

**评分：9.5/10** — 修复后

### A06 — 脆弱和过时组件 (Vulnerable and Outdated Components)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| 依赖版本 | PASS | Next.js 15.x, Supabase 最新, Stripe SDK 匹配 apiVersion |
| 已知漏洞 | N/A | 建议定期运行 `pnpm audit` |

**评分：8/10** — 缺自动化漏洞扫描

### A07 — 认证失败 (Identification and Authentication Failures)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| 认证方式 | PASS | Supabase Auth OTP（Magic Link），无密码存储 |
| Session 管理 | PASS | Supabase SSR 自动管理 cookie 生命周期 |
| Cookie 安全属性 | PASS | httpOnly / Secure / SameSite=Lax（SSR 库默认） |
| Cron 端点认证 | PASS | Bearer token + timingSafeCompare |
| Rate Limiting | PASS | 滑动窗口，Edge Runtime 级别 |

**评分：9/10**

### A08 — 软件和数据完整性失败

| 检查项 | 状态 | 发现 |
|--------|------|------|
| CI/CD 安全 | N/A | Vercel 自动部署，需验证 Git 分支保护 |
| 依赖完整性 | PASS | pnpm-lock.yaml 锁定版本 |
| Webhook 签名验证 | PASS | Stripe SDK 官方验证 |

**评分：9/10**

### A09 — 安全日志和监控不足

| 检查项 | 状态 | 发现 |
|--------|------|------|
| 错误追踪 | PASS | Sentry 集成（@sentry/nextjs） |
| 应用日志 | PASS | logger 工具统一记录上下文 |
| 认证日志 | PASS | Supabase Auth 自动记录登录事件 |
| 财务操作日志 | PASS | ticket_events 表记录所有状态变更 |

**评分：9/10**

### A10 — 服务端请求伪造 (SSRF)

| 检查项 | 状态 | 发现 |
|--------|------|------|
| 外部请求限制 | PASS | 仅连接 Supabase / Stripe / Resend，无用户控制的 URL 请求 |
| 内部服务访问 | N/A | 无内部微服务架构 |

**评分：10/10**

## 本次修复清单

| 修复项 | 文件 | 风险等级 |
|--------|------|----------|
| 添加 Content-Security-Policy 头 | next.config.ts | HIGH → FIXED |
| 添加 Strict-Transport-Security 头 | next.config.ts | HIGH → FIXED |
| Cron 密钥 timing-safe 比较 | 3 个 cron route.ts + crypto.ts | MEDIUM → FIXED |

## 建议后续改进

| 优先级 | 建议 | 说明 |
|--------|------|------|
| P1 | Rate Limiting Redis adapter | 当前内存 per-instance，多实例可绕过 |
| P1 | CRON_SECRET 生产强制 | 当前 optional，建议生产环境必填 |
| P2 | 自动化依赖漏洞扫描 | `pnpm audit` 集成到 CI |
| P2 | CSP nonce 模式 | 替代 unsafe-inline，需要 Next.js middleware 配合 |
| P3 | SameSite=Strict 升级 | 当前 Lax，Strict 更安全但可能影响跨站 OAuth 流程 |
