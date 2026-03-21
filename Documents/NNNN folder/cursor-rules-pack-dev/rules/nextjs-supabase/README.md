# Next.js + Supabase Cursor Rules

## 适用场景
Next.js 14+ App Router 项目，使用 Supabase 作为后端（PostgreSQL + Auth + Storage + Realtime）。

## 核心规则摘要
- SSR 安全的 Supabase 客户端（`@supabase/ssr`）
- 服务端使用 `auth.getUser()` 而非 `auth.getSession()`
- 所有用户数据表强制启用 RLS
- 类型安全：从 Supabase schema 生成 TypeScript 类型
- Server Actions 处理数据变更

## 使用方法
将 `.cursorrules` 文件复制到你的项目根目录。
