# Python FastAPI Patterns

Production-ready FastAPI patterns for building modern Python APIs — 10 battle-tested templates covering routing, validation, auth, async database, middleware, error handling, and testing.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | Basic Routing | Path/query params, response models, APIRouter, status codes |
| 02 | Pydantic Models | Validators, nested models, custom types, serialization |
| 03 | Request Validation | Form data, file uploads, query parsing, cross-field validation |
| 04 | Auth JWT | JWT signing/verification, OAuth2, protected routes, refresh tokens |
| 05 | Dependency Injection | Depends(), sub-dependencies, scoped deps, database sessions |
| 06 | Background Tasks | BackgroundTasks, async workers, task queues, scheduling |
| 07 | Database Async | Async SQLAlchemy, repository pattern, migrations, connection pooling |
| 08 | Middleware & CORS | Custom middleware, CORS, rate limiting, request ID, logging |
| 09 | Error Handling | HTTPException, exception handlers, validation errors, custom errors |
| 10 | Testing Patterns | TestClient, pytest fixtures, async tests, mocking dependencies |

## Tiers

- **Starter** ($19) — Templates 01–05: routing through dependency injection
- **Pro** ($39) — All 10 templates including async DB, middleware, and testing

## Quick Start

```bash
pip install fastapi uvicorn[standard] pydantic

# Run any template
uvicorn templates.01-basic-routing.routes:app --reload
```

## Requirements

- Python 3.11+
- FastAPI 0.110+
- Pydantic v2

## License

MIT — use in personal and commercial projects.
