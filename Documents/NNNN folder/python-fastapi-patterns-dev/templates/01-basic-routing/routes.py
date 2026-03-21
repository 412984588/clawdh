"""FastAPI 基础路由模式 — 路径参数、查询参数、响应模型、APIRouter、状态码"""

from enum import Enum
from typing import Annotated

from fastapi import APIRouter, FastAPI, Path, Query, status
from pydantic import BaseModel

# ===== 1. 响应模型 =====


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    active: bool = True


class UserCreate(BaseModel):
    name: str
    email: str


class Paginated(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    limit: int


# ===== 2. 模拟数据库 =====

_DB: dict[int, UserOut] = {
    1: UserOut(id=1, name="Alice", email="alice@example.com"),
    2: UserOut(id=2, name="Bob", email="bob@example.com"),
}
_next_id = 3


# ===== 3. APIRouter =====

router = APIRouter(prefix="/users", tags=["users"])


# GET /users — 分页列表
@router.get("/", response_model=Paginated)
async def list_users(
    page: Annotated[int, Query(ge=1, description="页码")] = 1,
    limit: Annotated[int, Query(ge=1, le=100, description="每页数量")] = 10,
    active: bool | None = None,
) -> Paginated:
    items = list(_DB.values())
    if active is not None:
        items = [u for u in items if u.active == active]
    total = len(items)
    start = (page - 1) * limit
    return Paginated(items=items[start : start + limit], total=total, page=page, limit=limit)


# GET /users/{user_id} — 单个资源
@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: Annotated[int, Path(ge=1, description="用户 ID")],
) -> UserOut:
    from fastapi import HTTPException

    user = _DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


# POST /users — 创建资源
@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(body: UserCreate) -> UserOut:
    global _next_id
    user = UserOut(id=_next_id, name=body.name, email=body.email)
    _DB[_next_id] = user
    _next_id += 1
    return user


# DELETE /users/{user_id} — 删除资源
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int) -> None:
    from fastapi import HTTPException

    if user_id not in _DB:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    del _DB[user_id]


# ===== 4. 枚举路径参数 =====

class ItemCategory(str, Enum):
    electronics = "electronics"
    clothing = "clothing"
    food = "food"


items_router = APIRouter(prefix="/items", tags=["items"])


@items_router.get("/category/{category}")
async def items_by_category(category: ItemCategory) -> dict:
    return {"category": category.value, "count": 42}


# ===== 5. 应用组装 =====

def create_app() -> FastAPI:
    app = FastAPI(title="FastAPI Basic Routing", version="1.0.0")
    app.include_router(router)
    app.include_router(items_router)

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
