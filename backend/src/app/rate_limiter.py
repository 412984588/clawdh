"""Rate limiting middleware for FastAPI."""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


# Simple in-memory rate limiter
_rate_limit_store: dict[str, list[float]] = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware that enforces rate limiting."""

    # Default: 100 requests per minute
    RATE_LIMIT = 100
    WINDOW_SECONDS = 60

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ("/health", "/health/deep"):
            return await call_next(request)

        # Use client IP as key (or a default for testing)
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate:{client_ip}"

        now = time.time()
        window_start = now - self.WINDOW_SECONDS

        # Clean old entries
        _rate_limit_store[key] = [ts for ts in _rate_limit_store[key] if ts > window_start]

        # Check limit
        if len(_rate_limit_store[key]) >= self.RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
            )

        # Record request
        _rate_limit_store[key].append(now)

        return await call_next(request)
