"""FastAPI Pydantic v2 模型模式 — 验证器、嵌套模型、自定义类型、序列化"""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Any
from uuid import UUID, uuid4

from fastapi import APIRouter, FastAPI
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

# ===== 1. 基础模型与字段约束 =====


class Address(BaseModel):
    street: str
    city: str
    country: str = "CN"
    zip_code: str = Field(pattern=r"^\d{6}$", description="6位邮政编码")


class UserBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_min_length=1)

    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    age: Annotated[int, Field(ge=0, le=150)]


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "UserCreate":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

    @field_validator("name")
    @classmethod
    def name_no_numbers(cls, v: str) -> str:
        if any(c.isdigit() for c in v):
            raise ValueError("Name must not contain digits")
        return v.title()


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(default_factory=uuid4)
    address: Address | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ===== 2. 嵌套模型与联合类型 =====


class ProductBase(BaseModel):
    name: str
    price: Decimal = Field(gt=Decimal("0"), decimal_places=2)
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class DigitalProduct(ProductBase):
    kind: str = "digital"
    download_url: str


class PhysicalProduct(ProductBase):
    kind: str = "physical"
    weight_kg: float = Field(gt=0)
    dimensions: dict[str, float]  # {"length": 10, "width": 5, "height": 3}


# 判别联合
from typing import Union
Product = Union[DigitalProduct, PhysicalProduct]


# ===== 3. 响应包装器 =====


class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: str = ""


# ===== 4. 路由 =====

router = APIRouter(prefix="/models-demo", tags=["pydantic-models"])


@router.post("/users", response_model=ApiResponse)
async def create_user(body: UserCreate) -> ApiResponse:
    user = UserOut(name=body.name, email=body.email, age=body.age)
    return ApiResponse(data=user.model_dump(mode="json"), message="User created")


@router.post("/products", response_model=ApiResponse)
async def create_product(body: dict) -> ApiResponse:
    kind = body.get("kind", "physical")
    if kind == "digital":
        product = DigitalProduct(**body)
    else:
        product = PhysicalProduct(**body)
    return ApiResponse(data=product.model_dump(mode="json"))


@router.get("/schema/user")
async def user_schema() -> dict:
    return UserOut.model_json_schema()


def create_app() -> FastAPI:
    app = FastAPI(title="Pydantic Models Demo", version="1.0.0")
    app.include_router(router)
    return app


app = create_app()
