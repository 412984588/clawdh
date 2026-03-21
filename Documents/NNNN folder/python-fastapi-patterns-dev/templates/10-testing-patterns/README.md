# 10 — Testing Patterns

FastAPI 测试全模式：TestClient、依赖覆盖、pytest fixtures、内联测试。

## Patterns

- `TestClient(app)` — 同步测试客户端（基于 httpx）
- `dependency_overrides[get_db] = lambda: test_db` — 替换真实 DB
- `app.dependency_overrides.clear()` — 每测试后清理覆盖
- `pytest.fixture(scope="function")` — 每测试独立数据库
- 状态码断言：200/201/204/404
- 请求体/响应体 JSON 验证
- 内联测试（`pytest routes.py -v`）可直接跑
- 建议 conftest.py 结构（注释内附完整示例）

## Files

- `routes.py` — 被测应用 + 测试辅助 + 内联测试用例

## Quick Start

```bash
pip install fastapi uvicorn httpx pytest
pytest routes.py -v
# 或直接启动服务
uvicorn routes:app --reload
```
