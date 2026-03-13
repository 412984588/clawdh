# ADR-002: Strict Type Hints for Python Code

**Date**: 2026-03-13  
**Status**: Accepted  
**Decision Makers**: Engineering Team  
**Supersedes**: None  

## Context

Coding agents frequently generate Python code without type hints, leading to:
- Runtime errors caught too late
- Poor IDE autocomplete and static analysis
- Unclear function contracts between modules
- Difficulty refactoring without breaking consumers

Python 3.11+ and 3.13 have mature typing support including `TypeAlias`, `TypeGuard`, `ParamSpec`, and improved generic syntax.

## Decision

**All Python functions must include type hints per Python 3.13 standards.**

### Requirements

```python
# Required: All function signatures must be typed
def process(data: dict[str, Any], timeout: float = 30.0) -> Result[str]:
    ...

# Required: Class attributes typed
class Config:
    name: str
    retries: int = 3

# Required: Use modern union syntax (3.10+)
value: str | None  # not Optional[str]

# Required: Import from collections.abc for container types
from collections.abc import Sequence, Mapping
```

### Exceptions

- Test fixtures with obvious types
- Simple `__init__` where dataclass handles it
- Lambda expressions

## Enforcement

| Location | Mechanism |
|----------|-----------|
| `AGENTS.md` | Explicit typing rules |
| CI/CD | mypy or pyright check (future) |
| Code review | Reviewers flag missing hints |

## Consequences

### Positive
- Better IDE support and autocomplete
- Catch type errors before runtime
- Self-documenting function signatures
- Safer refactoring

### Negative
- Slightly more verbose code
- Learning curve for advanced types (`TypeVar`, `ParamSpec`)

## Evidence

- mypy catches ~20% of bugs before runtime (Dropbox internal study)
- Python typing adoption: 78% of top PyPI packages (2025 survey)
- PEP 484, 585, 604 establish modern typing patterns

## Related

- [ADR-001: TDD Enforcement](./001-tdd-enforcement.md)
- [Runbook: Local Coding Agents](../runbooks/local-coding-agents-overview.md)
