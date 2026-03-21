# FAQ — Python FastAPI Patterns

**Q: What Python version is required?**
Python 3.11 or later. The templates use modern type hints (`X | Y`, `match`, etc.) that require 3.11+.

**Q: Which FastAPI and Pydantic versions do these templates target?**
FastAPI 0.110+ with Pydantic v2 (2.0+). All validators use the v2 API (`@field_validator`, `model_validator`, `ConfigDict`).

**Q: Can I use these in a commercial project?**
Yes. The MIT license allows personal and commercial use with no restrictions beyond attribution.

**Q: Do the templates include database migrations?**
Template 07 (Async Database) explains the Alembic migration workflow in the README. The code itself uses mock sessions to stay dependency-free out of the box.

**Q: Do I need to install any dependencies to run the templates?**
Each template is self-contained. You need `fastapi` and `uvicorn`. Some templates need extras like `python-multipart` (file uploads) or `pydantic[email]` (email validation) — these are listed in each template's README.

**Q: What's the difference between Starter and Pro?**
Starter includes templates 01–05 (routing through dependency injection). Pro adds templates 06–10 (background tasks, async DB, middleware, error handling, and testing). If you're a beginner, Starter is a great entry point. If you're building production systems, Pro gives you the full stack.

**Q: Are there tests included?**
Template 10 (Testing Patterns) includes inline pytest tests and a complete conftest.py example. Other templates focus on the pattern itself and include comments suggesting test approaches.

**Q: Can I request a refund?**
See `refund-policy.md` for full details. Generally, refunds are accepted within 7 days if the templates don't work as described.
