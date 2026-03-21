"""FastAPI 异步数据库模式 — Async SQLAlchemy、Repository 模式、迁移、连接池"""

from datetime import datetime
from typing import Annotated, Any, AsyncGenerator

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from pydantic import BaseModel

# ===== 1. 数据库配置 =====


class DatabaseConfig(BaseModel):
    url: str = "postgresql+asyncpg://user:pass@localhost/mydb"
    pool_size: int = 5
    max_overflow: int = 10
    pool_timeout: float = 30.0
    echo: bool = False


def get_db_config() -> DatabaseConfig:
    import os
    return DatabaseConfig(
        url=os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db"),
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        echo=os.getenv("DB_ECHO", "false").lower() == "true",
    )


# ===== 2. 模型（模拟 SQLAlchemy ORM）=====

# 实际项目：
#   from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
#   class Base(DeclarativeBase): pass
#   class UserModel(Base):
#       __tablename__ = "users"
#       id: Mapped[int] = mapped_column(primary_key=True)
#       name: Mapped[str]
#       email: Mapped[str] = mapped_column(unique=True)
#       created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class UserRecord:
    """模拟 ORM 行对象"""
    def __init__(self, id: int, name: str, email: str, created_at: datetime):
        self.id = id
        self.name = name
        self.email = email
        self.created_at = created_at


# ===== 3. 模拟异步 Session =====

_USER_TABLE: list[UserRecord] = [
    UserRecord(1, "Alice", "alice@example.com", datetime(2024, 1, 1)),
    UserRecord(2, "Bob",   "bob@example.com",   datetime(2024, 1, 2)),
]
_next_id = 3


class AsyncSessionMock:
    async def execute(self, query: Any, params: Any = None) -> "ResultMock":
        return ResultMock()

    async def commit(self) -> None:
        pass

    async def rollback(self) -> None:
        pass

    async def close(self) -> None:
        pass

    def add(self, obj: Any) -> None:
        pass


class ResultMock:
    def scalars(self) -> "ScalarsMock":
        return ScalarsMock()

    def scalar_one_or_none(self) -> UserRecord | None:
        return _USER_TABLE[0] if _USER_TABLE else None


class ScalarsMock:
    def all(self) -> list[UserRecord]:
        return list(_USER_TABLE)


async def get_db() -> AsyncGenerator[AsyncSessionMock, None]:
    """FastAPI 依赖：每请求一个 async session"""
    session = AsyncSessionMock()
    try:
        yield session
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


DbSession = Annotated[AsyncSessionMock, Depends(get_db)]


# ===== 4. Repository 模式 =====


class UserRepository:
    def __init__(self, session: AsyncSessionMock) -> None:
        self.session = session

    async def find_by_id(self, user_id: int) -> UserRecord | None:
        return next((u for u in _USER_TABLE if u.id == user_id), None)

    async def find_by_email(self, email: str) -> UserRecord | None:
        return next((u for u in _USER_TABLE if u.email == email), None)

    async def find_all(self, offset: int = 0, limit: int = 20) -> list[UserRecord]:
        return _USER_TABLE[offset : offset + limit]

    async def count(self) -> int:
        return len(_USER_TABLE)

    async def create(self, name: str, email: str) -> UserRecord:
        global _next_id
        record = UserRecord(_next_id, name, email, datetime.utcnow())
        _USER_TABLE.append(record)
        _next_id += 1
        await self.session.commit()
        return record

    async def delete(self, user_id: int) -> bool:
        for i, u in enumerate(_USER_TABLE):
            if u.id == user_id:
                _USER_TABLE.pop(i)
                await self.session.commit()
                return True
        return False


# ===== 5. Pydantic 模型（API 层）=====


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime


class UserCreate(BaseModel):
    name: str
    email: str


class PageResult(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    limit: int


# ===== 6. 路由 =====

router = APIRouter(prefix="/db-demo", tags=["database-async"])


@router.get("/users", response_model=PageResult)
async def list_users(db: DbSession, page: int = 1, limit: int = 20) -> PageResult:
    repo = UserRepository(db)
    offset = (page - 1) * limit
    rows = await repo.find_all(offset, limit)
    total = await repo.count()
    items = [UserOut(id=r.id, name=r.name, email=r.email, created_at=r.created_at) for r in rows]
    return PageResult(items=items, total=total, page=page, limit=limit)


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: DbSession) -> UserOut:
    repo = UserRepository(db)
    record = await repo.find_by_id(user_id)
    if not record:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=record.id, name=record.name, email=record.email, created_at=record.created_at)


@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(body: UserCreate, db: DbSession) -> UserOut:
    repo = UserRepository(db)
    existing = await repo.find_by_email(body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    record = await repo.create(body.name, body.email)
    return UserOut(id=record.id, name=record.name, email=record.email, created_at=record.created_at)


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, db: DbSession) -> None:
    repo = UserRepository(db)
    deleted = await repo.delete(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")


def create_app() -> FastAPI:
    app = FastAPI(title="Async Database Demo", version="1.0.0")
    app.include_router(router)
    return app


app = create_app()
