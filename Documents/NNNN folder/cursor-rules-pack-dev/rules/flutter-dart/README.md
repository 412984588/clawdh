# Flutter Dart Cursor Rules

## 适用场景
Flutter 3.x 移动/桌面应用，使用 Riverpod + GoRouter + Freezed 技术栈。

## 核心规则摘要
- Riverpod 2.x 代码生成模式（@riverpod 注解）
- Freezed 不可变数据模型 + sealed class
- GoRouter 声明式路由 + 重定向守卫
- Clean Architecture（data/domain/presentation）
- AsyncValue.when() 统一处理加载/错误/成功状态

## 使用方法
将 `.cursorrules` 文件复制到你的 Flutter 项目根目录。
