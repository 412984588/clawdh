# Runbook: MCP Server Operations

**Last Updated**: 2026-03-13
**Status**: Active
**Owner**: Docs & Research Lead
**Verified Against**: Claude Code 2.1.74, 9 MCP servers

## Problem

MCP (Model Context Protocol) servers extend coding agents with external capabilities. When servers fail, agents lose critical functionality (doc search, code review, browser automation). This runbook covers setup, health checks, and troubleshooting.

## Server Inventory (2026-03-13)

| Server                | Type  | Status       | Purpose                    | Dependencies                                            |
| --------------------- | ----- | ------------ | -------------------------- | ------------------------------------------------------- |
| `context7`            | stdio | ✅ Connected | Documentation retrieval    | `@upstash/context7-mcp`                                 |
| `filesystem`          | stdio | ✅ Connected | File system access         | `@anthropic-ai/mcp-server-filesystem`                   |
| `sequential-thinking` | stdio | ✅ Connected | Chain-of-thought reasoning | `@modelcontextprotocol/server-sequential-thinking`      |
| `gemini`              | stdio | ✅ Connected | Google Gemini code review  | Custom server at `~/.claude/mcp-servers/gemini-server/` |
| `serena`              | stdio | ✅ Connected | LSP semantic analysis      | `uvx` + git package                                     |
| `codex`               | stdio | ❌ Failed    | OpenAI Codex integration   | `codex` CLI                                             |
| `github`              | stdio | —            | GitHub issues/PR/repo      | `@anthropic-ai/mcp-server-github`                       |
| `playwright`          | stdio | —            | Web automation testing     | `@anthropic-ai/mcp-server-playwright`                   |
| `claude-mem`          | stdio | —            | Cross-session memory       | Custom plugin                                           |

## Health Check

### Quick Status (10 seconds)

```bash
claude mcp list
```

### Per-Server Debug

```bash
# Test specific server connection
claude -d mcp <server-name>

# Check if command exists
which <command>  # e.g., which codex, which uvx

# Check npm package availability
npx -y <package> --version
```

### Full Diagnostic

```bash
# 1. List all servers and status
claude mcp list

# 2. Check Claude Code debug logs
claude -d 2>&1 | grep -i mcp

# 3. Verify config file syntax
cat ~/.claude/mcp.json | python3 -m json.tool

# 4. Check each server's command is available
for cmd in node npx uvx codex; do
  echo -n "$cmd: "; which $cmd || echo "NOT FOUND"
done
```

## Common Failure Patterns

### 1. Command Not Found

**Symptom**: `✗ Failed to connect` with no output
**Root Cause**: CLI tool not installed or not in PATH

```bash
# Diagnose
which <command>

# Fix: Install missing tool
# For codex
npm install -g @openai/codex

# For uvx (part of uv)
pip install uv

# For npx (part of node)
brew install node
```

### 2. Stdio Timeout

**Symptom**: Server hangs on startup
**Root Cause**: Slow initialization, network dependency, or auth failure

```bash
# Test server manually with timeout
timeout 10 npx -y @modelcontextprotocol/server-sequential-thinking

# Check for network issues (servers that need API calls)
curl -s -o /dev/null -w "%{http_code}" https://api.github.com

# Fix: Add timeout or retry logic to server args
```

### 3. API Key Missing

**Symptom**: Server starts but tools return auth errors
**Root Cause**: Server needs API key not passed in env

```bash
# Check mcp.json env section
cat ~/.claude/mcp.json | jq '.mcpServers.<name>.env'

# Fix: Add required env vars
# In mcp.json:
{
  "server-name": {
    "command": "...",
    "env": {
      "API_KEY": "${API_KEY}"  # References shell env
    }
  }
}
```

### 4. Package Version Conflict

**Symptom**: `npx` downloads but server crashes
**Root Cause**: Cached version incompatible

```bash
# Clear npx cache
npx clear-npx-cache

# Force fresh download
npx -y --force <package>

# Pin specific version in mcp.json args
"args": ["-y", "@package/name@1.2.3"]
```

### 5. Port Already in Use (HTTP servers)

**Symptom**: `EADDRINUSE` error
**Root Cause**: Previous instance still running

```bash
# Find process using port
lsof -i :<port>

# Kill stale process
kill $(lsof -t -i :<port>)

# Or use different port in server config
```

## Adding a New MCP Server

### 1. Choose Installation Method

| Method       | When to Use              | Example                |
| ------------ | ------------------------ | ---------------------- |
| `npx -y`     | Simple, widely available | Official MCP servers   |
| Local script | Custom integrations      | `gemini`, `claude-mem` |
| CLI command  | Agent CLIs               | `codex mcp`            |
| `uvx`        | Python-based servers     | `serena`               |

### 2. Edit Configuration

```bash
# Edit global config
code ~/.claude/mcp.json

# Add new server entry
{
  "mcpServers": {
    "new-server": {
      "command": "npx",
      "args": ["-y", "@org/mcp-server-name"],
      "env": {},
      "description": "What this server does"
    }
  }
}
```

### 3. Verify

```bash
# Restart Claude Code or reload
claude mcp list

# Test the server
claude -d mcp new-server
```

## Removing/Disabling a Server

### Temporary Disable

Comment out or remove from `mcp.json` - servers not in config are not loaded.

### Clean Removal

```bash
# 1. Remove from mcp.json
# 2. Clear any cached data
rm -rf ~/.claude/mcp-servers/<server-name>/

# 3. Verify removal
claude mcp list
```

## Debugging Connection Failures

### Step-by-Step Debug Flow

```
Server failed to connect
├── Check command exists
│   └── which <command> || install it
├── Test command manually
│   └── Run the exact command from mcp.json args
├── Check for errors in stderr
│   └── command 2>&1 | head -50
├── Check network/auth if server calls APIs
│   └── Verify API keys in env
└── Check Claude Code logs
    └── claude -d 2>&1 | grep -i mcp
```

### Known Issues (2026-03-13)

| Server           | Issue                             | Workaround                                                  |
| ---------------- | --------------------------------- | ----------------------------------------------------------- |
| `codex`          | Fails with `codex mcp`            | Ensure `codex` CLI is latest: `npm update -g @openai/codex` |
| `system-monitor` | Not in mcp.json but shows in list | May be from plugin config, ignore or add explicitly         |

## Server-Specific Notes

### context7 (Documentation Retrieval)

- Requires `CONTEXT7_API_KEY` or uses default
- Best for: API docs, library references, framework guides
- Tool: `search_docs`, `get_doc`

### gemini (Code Review)

- Custom server at `~/.claude/mcp-servers/gemini-server/`
- Requires `GEMINI_API_KEY` in environment
- Tool: `review_code`

### serena (LSP Analysis)

- Uses `uvx` to run from git
- First run downloads package (~50MB)
- Project-aware: analyzes current working directory

### claude-mem (Cross-Session Memory)

- Plugin-based, auto-managed
- Stores/retrieves memories across sessions
- Data at `~/.claude/plugins/cache/thedotmack/claude-mem/`

## Maintenance Checklist

### Weekly

- [ ] Run `claude mcp list` - verify all critical servers connected
- [ ] Check for package updates: `npm outdated -g`

### Monthly

- [ ] Review server usage - remove unused servers
- [ ] Clear npx cache if issues: `npx clear-npx-cache`
- [ ] Update server documentation if APIs changed

### After Claude Code Update

- [ ] Verify all servers still connect
- [ ] Check for breaking changes in MCP protocol
- [ ] Review new MCP features in release notes

## Environment Variables Reference

```bash
# In shell profile (~/.zshrc)
export CONTEXT7_API_KEY="..."      # For context7
export GEMINI_API_KEY="..."        # For gemini server
export GITHUB_TOKEN="..."          # For github server (optional)
```

## Related

- [Runbook: Debugging Agent Failures](debugging-agent-failures.md) - General agent debugging
- [Runbook: Local Coding Agents Overview](local-coding-agents-overview.md) - Agent capabilities
- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md) - API key problems

## Changelog

- 2026-03-13: Initial version with 9-server inventory, common failure patterns, and operational procedures
