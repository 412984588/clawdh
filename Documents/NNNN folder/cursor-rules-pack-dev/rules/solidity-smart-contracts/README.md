# Solidity Smart Contracts Cursor Rules

## 适用场景
以太坊智能合约开发，使用 Solidity 0.8.x + Hardhat + OpenZeppelin。

## 核心规则摘要
- CEI 模式（Checks-Effects-Interactions）防重入
- 自定义错误替代 require 字符串（省 gas）
- OpenZeppelin 标准合约（ERC20/ERC721/AccessControl）
- NatSpec 注释所有公共函数
- 全面的 Hardhat 测试（含边界和 revert 测试）

## 使用方法
将 `.cursorrules` 文件复制到你的 Hardhat 项目根目录。
