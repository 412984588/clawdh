# Monorepo Turborepo Cursor Rules

## 适用场景
Turborepo + pnpm workspaces 单仓多包项目，多个 Next.js/Vite 应用共享 UI、数据库、配置。

## 核心规则摘要
- turbo.json 任务依赖图（dependsOn: ["^build"]）
- workspace:* 内部依赖引用
- 共享 TypeScript 配置和 ESLint 配置
- 共享 UI 组件包、数据库包
- Changesets 版本管理

## 使用方法
将 `.cursorrules` 文件复制到你的 Turborepo 项目根目录。
