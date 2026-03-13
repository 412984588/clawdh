# Research Log

**Owner**: Docs & Research Lead  
**Purpose**: Track research findings for documentation updates

---

## 2026-03-13 11:00 EDT — Claude Code v2.1.74 Review

**Source**: [GitHub Release](https://github.com/anthropics/claude-code/releases/tag/v2.1.74)

### Key Findings

1. **Context Optimization**: New `/context` command provides actionable suggestions for reducing context bloat
2. **Memory Management**: `autoMemoryDirectory` setting now configurable
3. **Model Handling**: Full model IDs now work correctly in agent configs (was silently ignored)
4. **Hook Configuration**: SessionEnd hook timeout now configurable via `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS`
5. **MCP OAuth Fixes**: 
   - Port conflict handling improved
   - Refresh token expiry properly handled (especially for Slack-style servers)
6. **Voice Mode**: Fixed on macOS native binary (added `audio-input` entitlement)
7. **Windows**: Fixed LSP servers (file URI fix) and RTL text rendering

### Documentation Actions Taken
- Updated RB 0006 with new Claude Code features
- Updated RB 0008 with MCP OAuth troubleshooting
- Updated docs index with RB 0011

### Open Items
- Monitor for Claude Code v2.1.75+ changes
- Update model selection guide when new models are released
- Review OpenAI Codex CLI updates (GitHub API returned empty)

---

## 2026-03-13 11:15 EDT — Agent Selection Strategy Documentation

### Key Findings

1. **Gap Identified**: No documented strategy for choosing which coding agent to use for a given task
2. **Capability Matrix Created**: Documented strengths of each agent across task types
3. **Selection Rules**: Defined 7 rules for automatic agent selection based on task characteristics
4. **Fallback Chains**: Established fallback paths when primary agent fails

### Documentation Actions Taken
- Created ADR 0007: Agent Selection Strategy
- Created Runbook 0012: Agent Cost Optimization
- Updated docs/README.md index with new ADR and runbook
- Defined metrics to track for ongoing optimization

### Key Insights
- Claude Code excels at frontend/React and architecture tasks
- Codex strongest for Python/backend and test generation
- Gemini CLI's 1M context window ideal for large codebase analysis
- OpenCode fastest startup for quick fixes

---

## 2026-03-13 15:19 EDT — Paperclip Run Ownership Conflict

**Issue**: CLI-15 (Document MVP API surface and integration guide)

### What Happened

1. Task was assigned to me with `executionRunId` from a queued run (`878393ec-...`)
2. My current heartbeat run ID is `406bec67-...`
3. Checkout failed with "Issue checkout conflict" (executionRunId mismatch)
4. Status update to `in_progress` succeeded via PATCH
5. All subsequent PATCH/POST operations failed with "Issue run ownership conflict"

### Root Cause

Paperclip enforces run ownership: only the run that holds the `executionRunId` can mutate the issue. When a previous run queued but the issue wasn't properly cleaned up, subsequent runs are locked out.

### Work Completed

Despite the conflict:
- Created `docs/api-reference.md` — Complete API reference with all 10 endpoints, 14 data models, integration guide, and database schema
- Updated `docs/README.md` index and changelog
- Added run ownership conflict troubleshooting to RB 0007

### Documentation Actions Taken
- Added API Reference section to docs index
- Added Paperclip run ownership conflict section to RB 0007
- Documented case study for future reference

### Open Items
- CLI-15 status cannot be updated to `done` due to run ownership conflict
- Requires manual intervention or run cleanup from manager
- Consider proposing run cleanup mechanism for stale execution locks

---

## 2026-03-13 15:30 EDT — Paperclip Run Cleanup Patterns Research

**Source**: Paperclip API analysis, CLI-15 case study, heartbeat lifecycle review

### Key Findings

1. **Run Ownership Architecture**: Paperclip enforces strict run ownership via `executionRunId` and `checkoutRunId` fields
2. **Stale Run Problem**: When heartbeat runs are interrupted mid-execution, stale run IDs persist and block subsequent runs
3. **Current Gap**: No automatic run cleanup mechanism exists in the platform

### Identified Cleanup Patterns

#### Pattern 1: Heartbeat Timeout-Based Cleanup
```python
# Proposed: Auto-release stale checkouts after timeout
class RunCleanupService:
    STALE_TIMEOUT_SECONDS = 300  # 5 minutes
    
    def cleanup_stale_runs(self):
        stale_issues = self.api.get_issues(
            status="in_progress",
            stale_after_seconds=self.STALE_TIMEOUT_SECONDS
        )
        for issue in stale_issues:
            if issue.checkoutRunId and self.is_run_dead(issue.checkoutRunId):
                self.api.release_issue(issue.id, reason="stale_run_cleanup")
```

#### Pattern 2: Run Health Check Before Checkout
```python
# Proposed: Verify run ownership before starting work
def safe_checkout(issue_id: str, agent_id: str, run_id: str):
    issue = api.get_issue(issue_id)
    
    if issue.executionRunId and issue.executionRunId != run_id:
        # Stale lock detected
        if api.is_run_alive(issue.executionRunId):
            raise CheckoutConflictError("Issue owned by active run")
        else:
            # Run is dead, force release
            api.force_release(issue_id, dead_run_id=issue.executionRunId)
    
    return api.checkout(issue_id, agent_id)
```

#### Pattern 3: Periodic Run Audit Cron
```bash
# Proposed: Scheduled cleanup job
*/10 * * * * paperclip audit stale-runs --company-id $COMPANY_ID --auto-release
```

### Recommended Implementation

1. **Short-term**: Add run health check in heartbeat pre-checkout step
2. **Medium-term**: Implement stale run cleanup service with configurable timeout
3. **Long-term**: Add run ownership transfer mechanism for legitimate handoffs

### Documentation Actions Taken
- Added run cleanup patterns to research log for future implementation reference
- Documented three cleanup patterns with code examples
- Recommended phased implementation approach

### Next Steps
- Propose run cleanup service to CEO/manager for implementation
- Update RB 0007 with cleanup patterns when implemented
- Monitor for Paperclip platform updates that address this issue

---

## 2026-03-13 15:45 EDT — Codex CLI v0.111.0 Review

**Source**: Local installation analysis, CLI help documentation

### Key Findings

1. **Version**: v0.111.0 installed locally
2. **New Commands**: 
   - `codex review` - Dedicated code review command (non-interactive)
   - `codex mcp` - MCP server management
   - `codex mcp-server` - Start Codex as an MCP server
   - `codex app-server` - [experimental] App server or related tooling
   - `codex cloud` - [EXPERIMENTAL] Browse tasks from Codex Cloud
   - `codex features` - Inspect feature flags
   - `codex debug` - Debugging tools
   - `codex apply` - Apply latest diff as `git apply` [aliases: a]
   - `codex resume` - Resume previous interactive session
   - `codex fork` - Fork previous interactive session

3. **Review Command Features**:
   - `--uncommitted` - Review staged, unstaged, and untracked changes
   - `--base <BRANCH>` - Review changes against base branch
   - `--commit <SHA>` - Review specific commit
   - Custom review instructions via prompt argument

4. **MCP Integration**:
   - `codex mcp list` - List configured MCP servers
   - `codex mcp add/remove` - Manage MCP servers
   - `codex mcp login/logout` - MCP server authentication

5. **Configuration Enhancements**:
   - `-c, --config <key=value>` - Override any config value
   - `--enable/--disable <FEATURE>` - Toggle feature flags
   - `-p, --profile <CONFIG_PROFILE>` - Use config profile

6. **Sandbox Modes**:
   - `read-only` - Default for analysis
   - `workspace-write` - For edits
   - `danger-full-access` - Full access (use with caution)
   - `--full-auto` - Convenience alias for workspace-write

### Documentation Actions Taken
- Updated research log with Codex CLI v0.111.0 findings
- Identified new commands and features for runbook updates

### Open Items
- GitHub API returned empty for latest releases (as noted in previous research)
- Monitor for Codex CLI v0.112.0+ changes
- Consider updating RB 0006 with new Codex CLI commands

---

## 2026-03-13 16:00 EDT — Gemini CLI v0.32.1 Review

**Source**: Local installation analysis, CLI help documentation

### Key Findings

1. **Version**: v0.32.1 installed locally
2. **New Commands**:
   - `gemini mcp` - MCP server management (add, remove, list, enable, disable)
   - `gemini extensions` - Extension system (install, uninstall, list, update, link, new, validate, config)
   - `gemini skills` - Agent skills management
   - `gemini hooks` - Hooks management

3. **Execution Modes**:
   - Interactive mode (default)
   - `-p, --prompt` - Non-interactive (headless) mode
   - `-i, --prompt-interactive` - Execute prompt then continue interactive
   - `-r, --resume` - Resume previous session ("latest" or index number)
   - `--list-sessions` - List available sessions
   - `--delete-session` - Delete session by index

4. **Approval Modes** (replaces `--yolo`):
   - `default` - Prompt for approval
   - `auto_edit` - Auto-approve edit tools
   - `yolo` - Auto-approve all tools
   - `plan` - Read-only mode

5. **Policy Engine** (new):
   - `--policy` - Load additional policy files or directories
   - Replaces deprecated `--allowed-tools` flag
   - More flexible permission management

6. **Output Formats**:
   - `-o, --output-format` - text, json, stream-json
   - `--raw-output` - Disable sanitization (security warning)
   - `--accept-raw-output-risk` - Suppress security warning

7. **Extension System**:
   - Install from git URL or local path
   - Auto-update support
   - Pre-release channel
   - Link local extensions for development
   - Template-based extension creation
   - Validation support

### Documentation Actions Taken
- Updated research log with Gemini CLI v0.32.1 findings
- Identified new commands and features for runbook updates
- Noted policy engine as significant improvement over deprecated --allowed-tools

### Open Items
- Monitor for Gemini CLI v0.33.0+ changes
- Consider updating RB 0006 with new Gemini CLI commands
- Review extension ecosystem for useful additions

---

## 2026-03-13 16:15 EDT — MCP Ecosystem Review

**Source**: Global npm packages, Claude Code MCP configuration analysis

### Key Findings

1. **MCP SDK Version**: v1.21.1 (latest)
2. **Installed MCP Servers**:
   - `@upstash/context7-mcp@2.1.3` - Documentation retrieval
   - `@modelcontextprotocol/server-filesystem@2025.8.21` - File system access
   - `@modelcontextprotocol/server-github@2025.4.8` - GitHub integration
   - `@modelcontextprotocol/server-sequential-thinking@2025.7.1` - Chain of thought
   - `@modelcontextprotocol/server-postgres@0.6.2` - PostgreSQL access
   - `@modelcontextprotocol/server-slack@2025.4.25` - Slack integration
   - `@modelcontextprotocol/server-everything@2025.9.25` - Combined server
   - `@playwright/mcp@0.0.41` - Browser automation
   - `@anthropic-ai/mcp-server-filesystem` - Anthropic's filesystem server
   - `@anthropic-ai/mcp-server-github` - Anthropic's GitHub server
   - `@anthropic-ai/mcp-server-playwright` - Anthropic's Playwright server

3. **New MCP Servers Discovered**:
   - `@brave/brave-search-mcp-server@2.0.61` - Brave search integration
   - `@netlify/mcp@1.15.1` - Netlify deployment
   - `@steipete/oracle@0.8.5` - Oracle database
   - `@promptx/mcp-server@1.27.2` - Prompt management
   - `@composio/mcp@1.0.9` - Composio integration
   - `@z_ai/mcp-server@0.1.0` - Z.ai integration

4. **MCP Configuration in Project**:
   - 9 servers configured in `~/.claude/mcp.json`
   - Codex uses `codex mcp` command directly
   - Gemini has its own MCP management via `gemini mcp`

5. **Protocol Updates**:
   - MCP SDK v1.21.1 is current
   - No breaking changes detected
   - OAuth support improved (as noted in Claude Code v2.1.74)

### Documentation Actions Taken
- Updated research log with MCP ecosystem findings
- Identified new MCP servers for potential integration
- Noted MCP SDK version for compatibility tracking

### Recommendations
1. Consider adding `@brave/brave-search-mcp-server` for web search capabilities
2. Evaluate `@netlify/mcp` for deployment automation
3. Update RB 0008 with new MCP servers discovered
4. Monitor MCP SDK for any breaking changes

---

## 2026-03-13 16:30 EDT — Anthropic Agent SDK Review

**Source**: GitHub API, npm package analysis

### Key Findings

1. **Claude Code**: v2.1.74 installed (latest)
2. **Agent SDK**: No standalone `@anthropic-ai/claude-agent-sdk` package found
3. **Integration**: Agent capabilities integrated into Claude Code CLI
4. **GitHub API**: Returns empty for latest releases (rate limiting or private repo)

### Documentation Actions Taken
- Updated research log with Agent SDK findings
- Noted that agent capabilities are integrated into Claude Code

### Open Items
- Monitor for Anthropic Agent SDK announcements
- Check if SDK is available via different package name
- Review Claude Code changelog for agent-related features

---

## 2026-03-13 16:45 EDT — Runbook Updates Required

**Source**: CLI pattern research, documentation review

### Updates Needed

1. **RB 0006 (Coding Agent CLI Patterns)**:
   - Add Codex CLI v0.111.0 new commands (review, mcp, apply, resume, fork)
   - Add Gemini CLI v0.32.1 new commands (mcp, extensions, skills, hooks)
   - Update approval modes for Gemini CLI
   - Add policy engine documentation for Gemini CLI

2. **RB 0008 (MCP Server Management)**:
   - Add new MCP servers discovered (brave-search, netlify, oracle, promptx, composio, z-ai)
   - Update MCP SDK version to v1.21.1
   - Add Codex MCP management commands
   - Add Gemini MCP management commands

3. **RB 0007 (Debugging Agent Failures)**:
   - Add Paperclip run cleanup patterns (from research log)
   - Update run ownership conflict troubleshooting

4. **RB 0009 (Model Selection Guide)**:
   - Verify model pricing is current (last updated 2026-03-13)
   - Add new model capabilities if available

### Documentation Actions Taken
- Identified specific runbook updates needed
- Created update checklist for implementation

### Next Steps
- Update RB 0006 with latest CLI patterns
- Update RB 0008 with new MCP servers
- Update RB 0007 with run cleanup patterns
- Review RB 0009 for currency

---

## Summary of Research Session (2026-03-13)

### Completed Research
1. ✅ Paperclip run cleanup patterns (3 patterns documented)
2. ✅ Codex CLI v0.111.0 review (new commands identified)
3. ✅ Gemini CLI v0.32.1 review (new features identified)
4. ✅ MCP ecosystem review (new servers discovered)
5. ✅ Anthropic Agent SDK review (integrated into Claude Code)

### Documentation Updated
- Research log updated with all findings
- Identified specific runbook updates needed
- Documented Paperclip run cleanup patterns for future implementation

### Outstanding Items
- Update RB 0006 with latest CLI patterns
- Update RB 0008 with new MCP servers
- Update RB 0007 with run cleanup patterns
- Propose Paperclip run cleanup service for implementation
- Monitor for new CLI releases and MCP servers

### Next Research Priorities
1. Update runbooks with latest CLI patterns
2. Monitor for new MCP servers and protocol updates
3. Track Anthropic Agent SDK announcements
4. Research multi-agent coordination patterns
5. Document cost optimization strategies for new models

---

## 2026-03-13 15:20 EDT — OpenClaw Engine Runaway Loop Incident

**Severity**: Critical | **Status**: Fixed

### Symptoms
- `.lobster-engine/suggestions.log`: **404MB** with 5.8M lines
- Loop count: **23,440,930**
- Error: `Cannot read properties of undefined (reading 'createReasoningChain')`
- Time span: ~3 hours (13:30-16:19 EDT, March 12)

### Root Causes
1. **No error backoff** — loop continued immediately after errors with no delay
2. **No circuit breaker** — no mechanism to stop after N consecutive failures
3. **No log rotation** — suggestions.log appended indefinitely
4. **No minimum loop interval** — `setImmediate` allowed sub-millisecond cycles
5. **Passive health check** — only logged warnings, never stopped the loop

### Fixes Implemented
1. **Error backoff** (`loop-engine.ts`): Exponential backoff on errors (1s → 60s max)
2. **Circuit breaker** (`loop-engine.ts`): Auto-stop after 10 consecutive errors
3. **Minimum loop interval** (`loop-engine.ts`): 1 second minimum between loops
4. **Active health check** (`loop-engine.ts`): Auto-stop after 300 seconds stall
5. **Log rotation** (`service.ts`): Auto-truncate suggestions.log at 50MB

### Files Modified
- `src/engine/runtime/loop-engine.ts` — added reliability guards
- `src/engine/service.ts` — added log rotation
- `docs/runbooks/0013-openclaw-engine-runaway-loop.md` — new runbook

### Verification
- Build: ✅ TypeScript 0 errors
- Tests: ✅ 54/54 passing
- Lint: ✅ Clean

### Lessons Learned
- Perpetual loops without rate limiting are inherently dangerous
- Health checks must be actionable, not just observational
- Log files need rotation to prevent disk exhaustion
- Circuit breakers are essential for unattended processes
