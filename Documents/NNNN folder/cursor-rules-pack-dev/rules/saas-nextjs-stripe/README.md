# SaaS Next.js + Stripe Cursor Rules

## 适用场景
SaaS 应用，Next.js App Router + Stripe 订阅支付 + Supabase 认证/数据库。

## 核心规则摘要
- Stripe Checkout 会话创建（含 Customer ID 管理）
- Webhook 处理（含签名验证）
- 订阅计划定义和功能限制（Feature Gating）
- Stripe Customer Portal 集成
- Supabase subscriptions 表 + RLS

## 使用方法
将 `.cursorrules` 文件复制到你的 SaaS 项目根目录。
