"""FastAPI 请求验证模式 — 表单数据、文件上传、查询解析、跨字段验证"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, FastAPI, File, Form, Query, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

# ===== 1. 查询参数验证 =====


class PaginationParams(BaseModel):
    page: int = Field(ge=1, default=1)
    limit: int = Field(ge=1, le=100, default=20)
    sort_by: str = Field(default="created_at", pattern=r"^[a-z_]+$")
    order: str = Field(default="desc", pattern=r"^(asc|desc)$")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class DateRangeQuery(BaseModel):
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def end_after_start(self) -> "DateRangeQuery":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


# ===== 2. 请求体模型 =====


class SearchRequest(BaseModel):
    q: str = Field(min_length=1, max_length=200)
    filters: dict[str, str] = Field(default_factory=dict)
    page: int = Field(ge=1, default=1)
    limit: int = Field(ge=1, le=50, default=10)


class BatchDeleteRequest(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=100)


# ===== 3. 文件上传验证辅助 =====

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_image(file: UploadFile) -> None:
    from fastapi import HTTPException

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Use: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )


# ===== 4. 路由 =====

router = APIRouter(prefix="/validation-demo", tags=["validation"])


# 查询参数解析
@router.get("/items")
async def list_items(
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    q: str | None = None,
    active: bool | None = None,
) -> dict:
    pagination = PaginationParams(page=page, limit=limit)
    return {
        "page": pagination.page,
        "limit": pagination.limit,
        "offset": pagination.offset,
        "q": q,
        "active": active,
    }


# 日期范围查询
@router.get("/events")
async def list_events(
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict:
    params = DateRangeQuery(start_date=start_date, end_date=end_date)
    return {"start_date": str(params.start_date), "end_date": str(params.end_date)}


# 搜索（JSON body）
@router.post("/search")
async def search(body: SearchRequest) -> dict:
    return {
        "query": body.q,
        "filters": body.filters,
        "page": body.page,
        "limit": body.limit,
        "results": [],
    }


# 表单 + 文件上传
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_profile_image(
    user_id: Annotated[int, Form()],
    description: Annotated[str, Form(max_length=200)] = "",
    file: UploadFile = File(...),
) -> JSONResponse:
    validate_image(file)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        from fastapi import HTTPException
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")
    return JSONResponse(
        status_code=201,
        content={
            "user_id": user_id,
            "filename": file.filename,
            "size": len(content),
            "content_type": file.content_type,
            "description": description,
        },
    )


# 批量删除
@router.delete("/items/batch", status_code=status.HTTP_200_OK)
async def batch_delete(body: BatchDeleteRequest) -> dict:
    return {"deleted": body.ids, "count": len(body.ids)}


def create_app() -> FastAPI:
    app = FastAPI(title="Request Validation Demo", version="1.0.0")
    app.include_router(router)
    return app


app = create_app()
