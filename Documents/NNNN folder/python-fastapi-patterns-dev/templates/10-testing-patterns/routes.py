"""FastAPI 测试模式 — TestClient、pytest fixtures、异步测试、依赖覆盖"""

from typing import AsyncGenerator

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

# ===== 1. 应用被测模块（简洁示例）=====


class Item(BaseModel):
    id: int
    name: str
    price: float


_items: dict[int, Item] = {
    1: Item(id=1, name="Widget", price=9.99),
    2: Item(id=2, name="Gadget", price=24.99),
}
_next_item_id = 3


class ItemCreate(BaseModel):
    name: str
    price: float


# 模拟数据库依赖
async def get_db() -> AsyncGenerator[dict, None]:
    yield _items


router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=list[Item])
async def list_items(db: dict = Depends(get_db)) -> list[Item]:
    return list(db.values())


@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: int, db: dict = Depends(get_db)) -> Item:
    item = db.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/", response_model=Item, status_code=201)
async def create_item(body: ItemCreate, db: dict = Depends(get_db)) -> Item:
    global _next_item_id
    item = Item(id=_next_item_id, name=body.name, price=body.price)
    db[_next_item_id] = item
    _next_item_id += 1
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: int, db: dict = Depends(get_db)) -> None:
    if item_id not in db:
        raise HTTPException(status_code=404, detail="Item not found")
    del db[item_id]


def create_app() -> FastAPI:
    app = FastAPI(title="Testing Patterns Demo", version="1.0.0")
    app.include_router(router)

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()


# ===== 2. 测试辅助 & fixtures（复制到 tests/ 中使用）=====

# --- conftest.py 示例 ---
#
# import pytest
# from fastapi.testclient import TestClient
# from myapp.routes import create_app, get_db
#
# @pytest.fixture()
# def test_db():
#     """每个测试使用独立的内存数据库"""
#     return {1: Item(id=1, name="Test Widget", price=1.00)}
#
# @pytest.fixture()
# def client(test_db):
#     app = create_app()
#     app.dependency_overrides[get_db] = lambda: test_db
#     with TestClient(app) as c:
#         yield c
#     app.dependency_overrides.clear()


# ===== 3. 内联测试（可直接运行：pytest routes.py）=====


def _make_test_client() -> TestClient:
    test_db: dict[int, Item] = {
        1: Item(id=1, name="Test Item", price=5.00),
    }
    test_app = create_app()
    test_app.dependency_overrides[get_db] = lambda: test_db
    return TestClient(test_app)


def test_health() -> None:
    client = _make_test_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_list_items() -> None:
    client = _make_test_client()
    resp = client.get("/items/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 1


def test_get_item_found() -> None:
    client = _make_test_client()
    resp = client.get("/items/1")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Item"


def test_get_item_not_found() -> None:
    client = _make_test_client()
    resp = client.get("/items/999")
    assert resp.status_code == 404


def test_create_item() -> None:
    client = _make_test_client()
    resp = client.post("/items/", json={"name": "New Item", "price": 12.50})
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "New Item"
    assert body["price"] == 12.50


def test_delete_item() -> None:
    client = _make_test_client()
    resp = client.delete("/items/1")
    assert resp.status_code == 204
    # 确认已删除
    assert client.get("/items/1").status_code == 404


def test_delete_nonexistent_item() -> None:
    client = _make_test_client()
    resp = client.delete("/items/999")
    assert resp.status_code == 404


if __name__ == "__main__":
    import pytest, sys
    sys.exit(pytest.main([__file__, "-v"]))
