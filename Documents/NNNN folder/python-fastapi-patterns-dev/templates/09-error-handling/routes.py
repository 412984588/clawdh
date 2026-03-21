"""FastAPI 错误处理模式 — HTTPException、自定义错误、验证错误、全局处理器"""

import traceback
from typing import Any

from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ===== 1. 自定义异常层级 =====


class AppError(Exception):
    """应用基础异常"""
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred"

    def __init__(self, message: str | None = None, **kwargs: Any) -> None:
        super().__init__(message or self.message)
        self.detail = message or self.message
        self.extra = kwargs


class NotFoundError(AppError):
    status_code = 404
    error_code = "NOT_FOUND"
    message = "Resource not found"


class ValidationError(AppError):
    status_code = 422
    error_code = "VALIDATION_FAILED"
    message = "Validation failed"


class AuthenticationError(AppError):
    status_code = 401
    error_code = "UNAUTHENTICATED"
    message = "Authentication required"


class AuthorizationError(AppError):
    status_code = 403
    error_code = "FORBIDDEN"
    message = "Access denied"


class ConflictError(AppError):
    status_code = 409
    error_code = "CONFLICT"
    message = "Resource conflict"


class RateLimitError(AppError):
    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"
    message = "Too many requests"


# ===== 2. 统一错误响应格式 =====


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict


def make_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Any = None,
) -> JSONResponse:
    body = ErrorResponse(
        error={
            "code": error_code,
            "message": message,
            **({"details": details} if details else {}),
        }
    )
    return JSONResponse(status_code=status_code, content=body.model_dump())


# ===== 3. 全局异常处理器 =====


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return make_error_response(
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.detail,
        details=exc.extra or None,
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return make_error_response(
        status_code=exc.status_code,
        error_code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    field_errors = []
    for error in exc.errors():
        field_errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return make_error_response(
        status_code=422,
        error_code="VALIDATION_ERROR",
        message="Request validation failed",
        details=field_errors,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # 生产环境不应泄露 traceback
    print(f"Unhandled error: {traceback.format_exc()}")
    return make_error_response(
        status_code=500,
        error_code="INTERNAL_ERROR",
        message="An internal server error occurred",
    )


# ===== 4. 路由（演示各种错误场景）=====

router = APIRouter(prefix="/error-demo", tags=["error-handling"])


class CreateItemRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)


@router.get("/not-found/{item_id}")
async def trigger_not_found(item_id: int) -> dict:
    if item_id > 100:
        raise NotFoundError(f"Item {item_id} not found", item_id=item_id)
    return {"id": item_id}


@router.get("/http-error")
async def trigger_http_error() -> dict:
    raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.post("/validate")
async def validate_item(body: CreateItemRequest) -> dict:
    """演示 Pydantic 验证错误格式"""
    return {"name": body.name, "price": body.price}


@router.get("/auth-error")
async def trigger_auth_error() -> dict:
    raise AuthenticationError("JWT token missing or invalid")


@router.get("/conflict")
async def trigger_conflict() -> dict:
    raise ConflictError("Email already registered", email="alice@example.com")


@router.get("/rate-limit")
async def trigger_rate_limit() -> dict:
    raise RateLimitError("Too many login attempts", retry_after=60)


# ===== 5. 应用组装（注册处理器）=====

def create_app() -> FastAPI:
    app = FastAPI(title="Error Handling Demo", version="1.0.0")

    # 注册自定义异常处理器
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)

    app.include_router(router)
    return app


app = create_app()
