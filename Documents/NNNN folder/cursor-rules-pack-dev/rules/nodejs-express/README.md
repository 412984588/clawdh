# Node.js Express Cursor Rules

## 适用场景
Node.js REST API，使用 Express.js + TypeScript + Prisma + PostgreSQL 技术栈。

## 核心规则摘要
- 分层架构（routes → controllers → services）
- Prisma ORM（包含 $transaction 模式）
- Zod 请求体验证中间件
- JWT 认证中间件
- 统一错误处理中间件

## 使用方法
将 `.cursorrules` 文件复制到你的 Node.js 项目根目录。
