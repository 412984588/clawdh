# Task Plan: RelayOps MVP

## Goal
构建一个封闭的 B2B 白标履约控制台，用于 HubSpot/CRM 数据清理任务，实现前10个真实订单无事故完成。

## Phases
- [x] Phase 1: Foundation（脚手架 + 迁移 + 认证 + 布局）
- [ ] Phase 2: Public Site + Partner Access
- [ ] Phase 3: Ticket Creation + Requirement Gate + Scope Lock
- [ ] Phase 4: Stripe Invoice + Payment + Ledger
- [ ] Phase 5: Assignment + Worker + Review + Disputes + Comments
- [ ] Phase 6: Timeouts + Retention + Notifications
- [ ] Phase 7: Seed Data + Tests + README + Polish

## Status
**Currently in Phase 2** - Phase 1 完成，Foundation 已就绪

## Decisions Made
- Next.js 15 App Router + TypeScript strict
- pnpm 包管理器
- Supabase Postgres + Auth + Storage
- Stripe Invoicing
- Resend 邮件 / Console logger（开发模式）

## Errors Encountered
- 无
