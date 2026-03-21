"""FastAPI 依赖注入模式 — Depends()、子依赖、作用域依赖、数据库会话"""

from contextlib import asynccontextmanager
from typing import Annotated, AsyncGenerator

from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Query
from pydantic import BaseModel

# ===== 1. 简单依赖 =====


def get_pagination(
    page: int = Query(ge=1, default=1),
    limit: int = Query(ge=1, le=100, default=20),
) -> dict:
    """注入分页参数"""
    return {"page": page, "limit": limit, "offset": (page - 1) * limit}


Pagination = Annotated[dict, Depends(get_pagination)]


# ===== 2. 嵌套/链式依赖 =====


class Settings:
    debug: bool = False
    db_url: str = "sqlite:///./app.db"


_settings = Settings()


def get_settings() -> Settings:
    return _settings


def get_db_url(settings: Annotated[Settings, Depends(get_settings)]) -> str:
    """子依赖：从 settings 提取 db_url"""
    return settings.db_url


# ===== 3. 模拟数据库会话（async context manager 风格）=====


class FakeSession:
    """模拟 SQLAlchemy AsyncSession"""

    def __init__(self) -> None:
        self._closed = False

    async def execute(self, query: str) -> list:
        return []

    async def close(self) -> None:
        self._closed = True


async def get_db() -> AsyncGenerator[FakeSession, None]:
    """每个请求创建一个独立 session，请求结束后关闭"""
    session = FakeSession()
    try:
        yield session
    finally:
        await session.close()


DbSession = Annotated[FakeSession, Depends(get_db)]


# ===== 4. 认证依赖 =====


class TokenData(BaseModel):
    user_id: int
    role: str


def get_token_data(authorization: str = Header(default="")) -> TokenData:
    """从 Authorization header 提取令牌数据（简化版）"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    # 简化：token 格式为 "user_id:role"
    try:
        parts = token.split(":")
        return TokenData(user_id=int(parts[0]), role=parts[1])
    except (IndexError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")


CurrentUser = Annotated[TokenData, Depends(get_token_data)]


def require_admin(user: CurrentUser) -> TokenData:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


AdminUser = Annotated[TokenData, Depends(require_admin)]


# ===== 5. 类形式依赖 =====


class FilterParams:
    def __init__(self, active: bool | None = None, search: str | None = None):
        self.active = active
        self.search = search


FilterDep = Annotated[FilterParams, Depends(FilterParams)]


# ===== 6. 路由 =====

router = APIRouter(prefix="/di-demo", tags=["dependency-injection"])


@router.get("/items")
async def list_items(pagination: Pagination, filters: FilterDep, db: DbSession) -> dict:
    return {
        "page": pagination["page"],
        "limit": pagination["limit"],
        "active_filter": filters.active,
        "search": filters.search,
        "db_closed": db._closed,
    }


@router.get("/me")
async def get_me(user: CurrentUser) -> dict:
    return {"user_id": user.user_id, "role": user.role}


@router.get("/admin")
async def admin_panel(user: AdminUser) -> dict:
    return {"message": "Admin panel", "admin_id": user.user_id}


@router.get("/settings")
async def app_settings(settings: Annotated[Settings, Depends(get_settings)]) -> dict:
    return {"debug": settings.debug, "db_url": settings.db_url}


# ===== 7. 应用级 lifespan 依赖 =====

@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    # 启动时初始化（数据库连接池、缓存等）
    print("Application startup: initializing resources")
    yield
    # 关闭时清理
    print("Application shutdown: releasing resources")


def create_app() -> FastAPI:
    app = FastAPI(title="Dependency Injection Demo", version="1.0.0", lifespan=lifespan)
    app.include_router(router)
    return app


app = create_app()
