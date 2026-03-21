# Chrome Extension MV3 Cursor Rules

## 适用场景
Chrome 扩展开发，使用 Manifest V3 + TypeScript。

## 核心规则摘要
- Service Worker 替代 background page（无持久状态）
- 类型安全的消息传递系统
- `chrome.storage` 封装工具
- 禁止 eval 和远程代码执行
- 最小权限原则

## 使用方法
将 `.cursorrules` 文件复制到你的 Chrome 扩展项目根目录。
