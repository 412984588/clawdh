"""FastAPI JWT 认证模式 — 令牌签发、验证、OAuth2、刷新令牌、受保护路由"""

import hashlib
import hmac
import json
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

# ===== 1. JWT 工具（无第三方依赖）=====

SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 900       # 15 分钟
REFRESH_TOKEN_EXPIRE_SECONDS = 604800   # 7 天


def _b64url_encode(data: bytes) -> str:
    return urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return urlsafe_b64decode(s + "=" * padding)


def sign_jwt(payload: dict, secret: str = SECRET_KEY) -> str:
    header = _b64url_encode(json.dumps({"alg": ALGORITHM, "typ": "JWT"}).encode())
    body = _b64url_encode(json.dumps(payload).encode())
    sig = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    return f"{header}.{body}.{_b64url_encode(sig)}"


def verify_jwt(token: str, secret: str = SECRET_KEY) -> dict:
    try:
        header, body, sig = token.split(".")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    expected = _b64url_encode(
        hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    )
    if not hmac.compare_digest(expected, sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    payload = json.loads(_b64url_decode(body))
    if payload.get("exp", 0) < time.time():
        raise HTTPException(status_code=401, detail="Token expired")
    return payload


def create_token_pair(user_id: int, role: str) -> dict:
    now = int(time.time())
    access_payload = {"sub": str(user_id), "role": role, "iat": now, "exp": now + ACCESS_TOKEN_EXPIRE_SECONDS}
    refresh_payload = {"sub": str(user_id), "type": "refresh", "iat": now, "exp": now + REFRESH_TOKEN_EXPIRE_SECONDS}
    return {
        "access_token": sign_jwt(access_payload),
        "refresh_token": sign_jwt(refresh_payload),
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_SECONDS,
    }


# ===== 2. 模拟用户数据库 =====

_USERS: dict[str, dict] = {
    "alice": {"id": 1, "email": "alice@example.com", "hashed_password": "hashed_secret", "role": "admin"},
    "bob":   {"id": 2, "email": "bob@example.com",   "hashed_password": "hashed_pass",   "role": "user"},
}

# 简化哈希（生产用 bcrypt）
def hash_password(pw: str) -> str:
    return "hashed_" + pw

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed


# ===== 3. OAuth2 & 依赖项 =====

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class CurrentUser(BaseModel):
    id: int
    email: str
    role: str


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> CurrentUser:
    payload = verify_jwt(token)
    user_id = int(payload["sub"])
    for user in _USERS.values():
        if user["id"] == user_id:
            return CurrentUser(id=user["id"], email=user["email"], role=payload.get("role", "user"))
    raise HTTPException(status_code=401, detail="User not found")


def require_role(*roles: str):
    async def _check(current: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if current.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current
    return _check


# ===== 4. 路由 =====

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> dict:
    user = _USERS.get(form.username)
    if not user or not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials", headers={"WWW-Authenticate": "Bearer"})
    return create_token_pair(user["id"], user["role"])


@router.post("/refresh")
async def refresh_token(refresh_token: str) -> dict:
    payload = verify_jwt(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Not a refresh token")
    user_id = int(payload["sub"])
    for user in _USERS.values():
        if user["id"] == user_id:
            return create_token_pair(user["id"], user["role"])
    raise HTTPException(status_code=401, detail="User not found")


@router.get("/me", response_model=CurrentUser)
async def get_me(current: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    return current


protected_router = APIRouter(prefix="/protected", tags=["protected"])


@protected_router.get("/user-only")
async def user_only(current: Annotated[CurrentUser, Depends(get_current_user)]) -> dict:
    return {"message": f"Hello {current.email}", "role": current.role}


@protected_router.get("/admin-only")
async def admin_only(current: Annotated[CurrentUser, Depends(require_role("admin"))]) -> dict:
    return {"message": "Admin access granted", "admin_id": current.id}


def create_app() -> FastAPI:
    app = FastAPI(title="JWT Auth Demo", version="1.0.0")
    app.include_router(router)
    app.include_router(protected_router)
    return app


app = create_app()
