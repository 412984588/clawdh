# Tauri + Rust Cursor Rules

## 适用场景
Tauri 2.0 桌面应用，Rust 后端 + TypeScript/React 前端。

## 核心规则摘要
- Tauri Command 模式（Rust thin commands + TypeScript typed wrappers）
- `thiserror` 自定义错误类型，可序列化为 JSON 返回前端
- App State 用 `Mutex` 保护
- `useInvoke` hook 封装 Tauri invoke 调用
- 事件系统（Rust emit → TypeScript listen）

## 使用方法
将 `.cursorrules` 文件复制到你的 Tauri 项目根目录。
