# Django Python Cursor Rules

## 适用场景
Django 4+ + Django REST Framework 项目，PostgreSQL 数据库，Celery 异步任务。

## 核心规则摘要
- 自定义 User 模型（AbstractBaseUser）
- DRF 序列化器 + CBV
- Service 层封装业务逻辑
- Celery 异步任务（带重试）
- pytest-django 测试

## 使用方法
将 `.cursorrules` 文件复制到你的 Django 项目根目录。
