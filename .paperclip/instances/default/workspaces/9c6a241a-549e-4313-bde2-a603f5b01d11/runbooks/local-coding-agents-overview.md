# Runbook: Local Coding Agent Operations Overview

**Last Updated**: 2026-03-13
**Status**: Active
**Verified Versions**: Claude Code 2.1.74, Codex CLI 0.111.0, Gemini CLI 0.32.1, OpenCode 1.2.0

> **Version Drift (2026-03-13 15:00 EST)**: Checked npm/GitHub releases.
>
> - Claude Code: 2.1.74 installed, **2.1.75 available** - includes 1M context for Opus 4.6 (Max/Team/Enterprise), token estimation fix, `/color` command, voice mode fixes
> - Codex CLI: 0.111.0 installed, **0.114.0 stable available** - adds hooks engine, health endpoints, code mode, handoff context improvements
> - Gemini CLI: 0.32.1 installed, **0.33.1 available** on npm
> - OpenCode: 1.2.0 (current)
>
> **Recommended updates**:
>
> - `npm update -g @anthropic-ai/claude-code` for 1M context and token fix
> - `npm update -g @openai/codex` for hooks and health endpoints

## Problem

Managing multiple local coding agents (Claude Code, Codex CLI, Gemini CLI) requires understanding each tool's capabilities, authentication, and operational patterns.

## Agent Comparison (Verified 2026-03-13)

| Feature               | Claude Code 2.1.74                                 | Codex CLI 0.111.0                  | Gemini CLI 0.32.1                      |
| --------------------- | -------------------------------------------------- | ---------------------------------- | -------------------------------------- |
| **Provider**          | Anthropic                                          | OpenAI                             | Google                                 |
| **Auth**              | API key / OAuth                                    | API key                            | API key / OAuth                        |
| **Context**           | 200K (1M for Opus 4.6\*)                           | 128K (model-dependent)             | 1M+                                    |
| **Non-interactive**   | `-p/--print`                                       | `exec` subcommand                  | `-p/--prompt`                          |
| **Resume**            | `-c/--continue`, `-r/--resume`                     | `resume`, `fork` subcommands       | `-r/--resume`                          |
| **Sandbox**           | `--dangerously-skip-permissions`                   | `-s/--sandbox` modes               | `-s/--sandbox`                         |
| **MCP Support**       | Yes (`--mcp-config`)                               | Yes (`mcp` subcommand)             | Yes (`mcp` subcommand)                 |
| **Skills/Extensions** | Yes (`--plugin-dir`)                               | Yes (built-in)                     | Yes (`extensions`, `skills`)           |
| **Git Worktree**      | Yes (`-w/--worktree`)                              | No                                 | No                                     |
| **IDE Integration**   | `--ide` flag                                       | Desktop app (`app` subcommand)     | Debug console                          |
| **Output Formats**    | text, json, stream-json                            | text, json                         | text, json, stream-json                |
| **Approval Modes**    | `acceptEdits`, `bypassPermissions`, `plan`, `auto` | `untrusted`, `on-failure`, `never` | `default`, `auto_edit`, `yolo`, `plan` |

## Common Operations

### Starting a Session

```bash
# Claude Code - interactive
claude

# Claude Code - non-interactive (print mode)
claude -p "Fix the TypeScript errors in src/"

# Claude Code - with specific model
claude --model sonnet

# Codex CLI - interactive
codex

# Codex CLI - non-interactive execution
codex exec "Refactor the auth module"

# Codex CLI - code review
codex review

# Gemini CLI - interactive
gemini

# Gemini CLI - non-interactive
gemini -p "Analyze the codebase structure"
```

### Session Management

```bash
# Claude Code
claude --continue              # Resume most recent session
claude -r <session-id>         # Resume specific session
claude --worktree feature-x    # New session in isolated worktree

# Codex CLI
codex resume                   # Interactive picker
codex resume --last            # Continue most recent
codex fork --last              # Fork most recent session

# Gemini CLI
gemini --resume latest         # Resume most recent
gemini --list-sessions         # List available sessions
```

### Environment Variables

| Variable | Claude Code                         | Codex                  | Gemini           |
| -------- | ----------------------------------- | ---------------------- | ---------------- |
| API Key  | `ANTHROPIC_API_KEY`                 | `OPENAI_API_KEY`       | `GEMINI_API_KEY` |
| Model    | `--model` flag or `ANTHROPIC_MODEL` | `-m/--model` or config | `-m/--model`     |
| Config   | `.claude/settings.json`             | `~/.codex/config.toml` | Built-in         |

### Model Selection

```bash
# Claude Code aliases
claude --model sonnet    # claude-sonnet-4-6
claude --model opus      # claude-opus-4
claude --model haiku     # claude-haiku-3.5

# Codex
codex -m o3
codex -m gpt-4o

# Gemini
gemini -m gemini-2.5-pro
gemini -m gemini-2.5-flash
```

## Approval Modes (Safety)

### Claude Code

- `default` - Ask for each edit
- `acceptEdits` - Auto-approve file edits
- `bypassPermissions` - Skip all checks (sandbox only!)
- `plan` - Read-only analysis mode

### Codex CLI

- `untrusted` - Only trusted commands auto-run
- `on-failure` - Auto-run, ask on failure
- `never` - Never ask (automated mode)

### Gemini CLI

- `default` - Prompt for approval
- `auto_edit` - Auto-approve edit tools
- `yolo` - Auto-approve everything
- `plan` - Read-only mode

\*Claude Code 2.1.75+: Opus 4.6 gets 1M context window by default for Max, Team, and Enterprise plans (previously required extra usage). This is significant for large codebase analysis.

## Key Patterns

### TDD Workflow (Recommended)

1. Write failing test first
2. Run test to confirm failure
3. Write implementation
4. Run test to confirm pass
5. Refactor if needed

### Multi-Agent Workflow

```bash
# Use different agents for different strengths
codex exec "Generate unit tests for UserService"   # Code generation
claude -p "Review the test coverage and suggest gaps"  # Analysis
gemini -p "Check for edge cases in the full codebase"  # Large context
```

### Context Management

- Keep instructions in `AGENTS.md` at repo root
- Use `.claude/CLAUDE.md` for Claude-specific context
- Use git worktrees (`claude -w`) for parallel work
- Break large tasks into subtasks for context window management

## New Features (2026-03-13)

### Claude Code 2.1.75

- **1M context for Opus 4.6**: Max/Team/Enterprise plans get 1M context by default
- **Token estimation fix**: Prevents premature context compaction for thinking blocks
- **`/color` command**: Set prompt-bar color for session
- **Voice mode fixes**: Correct activation on fresh installs

### Codex CLI 0.114.0

- **Hooks engine**: `SessionStart` and `Stop` hook events for lifecycle automation
- **Health endpoints**: WebSocket app-server exposes `/readyz` and `/healthz`
- **Code mode**: Experimental isolated coding workflows
- **Handoff context**: Real-time transcript continuity when work transfers between turns
- **Skill management**: Config to disable bundled system skills

## Failure Modes

| Symptom                    | Likely Cause                 | Fix                               |
| -------------------------- | ---------------------------- | --------------------------------- |
| Agent ignores instructions | Context window overflow      | Reduce task scope, use `-p` mode  |
| Hallucinated APIs          | Outdated training data       | Ask agent to verify with docs     |
| Infinite loops             | Unclear requirements         | Add explicit stopping criteria    |
| Permission denied          | Sandbox mode too restrictive | Adjust approval policy            |
| Session won't resume       | Session expired/purged       | Start fresh, use `--fork-session` |

## Troubleshooting Quick Reference

| Issue           | Claude Code             | Codex                    | Gemini               |
| --------------- | ----------------------- | ------------------------ | -------------------- |
| Auth failed     | `claude auth`           | `codex login`            | Set `GEMINI_API_KEY` |
| Debug mode      | `claude -d`             | Check `debug` subcommand | `gemini -d`          |
| Config location | `.claude/settings.json` | `~/.codex/config.toml`   | Built-in             |

## References

- Claude Code docs: https://docs.anthropic.com/en/docs/claude-code
- Claude Code GitHub: https://github.com/anthropics/claude-code
- OpenAI Codex: https://github.com/openai/codex
- Google Gemini CLI: https://github.com/google-gemini/gemini-cli

## Related Docs

- [ADR-001: TDD Enforcement](../adrs/001-tdd-enforcement.md)
- [ADR-003: Session Context Management](../adrs/003-session-context-management.md)
- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md)
- [Reference: Model Configs](../references/model-configs.md)
- [MCP Server Operations](mcp-server-operations.md)
