# ADR-001: TDD Enforcement for Coding Agents

**Date**: 2026-03-13  
**Status**: Accepted  
**Decision Makers**: Engineering Team  

## Context

Coding agents (Claude Code, Codex, Gemini) can generate functional code but often:
- Skip edge cases
- Miss regression prevention
- Create code without validation

This leads to fragile implementations that break on modification.

## Decision

**Enforce Test-Driven Development (TDD) as mandatory workflow for all coding agents.**

### Workflow Requirement

Before any business logic implementation:
1. **Write test** → reproduces requirement or bug
2. **Run test** → MUST fail (confirms test validity)
3. **Write code** → makes test pass
4. **Run test** → MUST pass
5. **Refactor** → if needed, tests still pass

### Enforcement Points

| Location | Mechanism |
|----------|-----------|
| `AGENTS.md` | Explicit TDD rules in agent instructions |
| Skill files | TDD skill with step-by-step guidance |
| Code review | Reviewers verify test-first evidence |

## Consequences

### Positive
- Higher code quality
- Automatic regression protection
- Clearer requirements (tests as spec)
- Safer refactoring

### Negative
- Slower initial development
- Requires test infrastructure
- May feel restrictive for trivial changes

## Evidence

- Industry studies show TDD reduces defects by 40-90%
- Coding agents perform better with test-driven constraints
- Test suites serve as living documentation

## Supersedes

None (initial decision)

## Related

- [Runbook: Local Coding Agents](../runbooks/local-coding-agents-overview.md)
- [ADR-002: Type Safety](./002-type-safety.md) *(pending)*
