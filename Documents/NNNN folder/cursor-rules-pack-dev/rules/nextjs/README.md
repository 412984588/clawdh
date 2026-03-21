# Next.js App Router Cursor Rules

## 适用场景
Next.js 14+ 项目，使用 App Router + TypeScript + Tailwind CSS + Shadcn UI 技术栈。

## 核心规则摘要
- 默认使用 Server Components，仅在必要时添加 "use client"
- App Router 文件约定（page.tsx / layout.tsx / loading.tsx / error.tsx）
- TypeScript 严格模式，接口优于类型别名
- Tailwind CSS + cn() 工具函数
- Zod 验证所有输入数据
- Server Actions 处理表单提交和数据变更

## 使用方法
将 `.cursorrules` 文件复制到你的 Next.js 项目根目录。
