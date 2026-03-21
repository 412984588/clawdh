# Vue 3 + Nuxt 3 Cursor Rules

## 适用场景
Nuxt 3 全栈应用，使用 Vue 3 Composition API + TypeScript + Pinia + Tailwind CSS。

## 核心规则摘要
- `<script setup>` 语法，Composition API
- `useFetch` / `useAsyncData` 处理 SSR 数据获取
- Pinia Setup Store 模式
- Nitro 服务端路由约定（[id].get.ts）
- `useRuntimeConfig()` 管理环境变量

## 使用方法
将 `.cursorrules` 文件复制到你的 Nuxt 3 项目根目录。
