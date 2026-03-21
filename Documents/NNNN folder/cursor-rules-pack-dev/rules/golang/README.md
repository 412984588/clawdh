# Golang Cursor Rules

## 适用场景
Go 后端服务，使用 Gin/Chi + GORM/sqlx + PostgreSQL 技术栈。

## 核心规则摘要
- 接受接口，返回具体类型（依赖倒置）
- 错误包装模式：`fmt.Errorf("fn: %w", err)`
- context.Context 作为所有 I/O 函数的第一个参数
- Clean Architecture（handler → service → repository）
- Table-driven tests with testify

## 使用方法
将 `.cursorrules` 文件复制到你的 Go 项目根目录。
