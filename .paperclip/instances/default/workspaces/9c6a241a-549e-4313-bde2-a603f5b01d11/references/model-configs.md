# Reference: Model Configurations

**Last Updated**: 2026-03-13  
**Status**: Active  

## Provider Quick Reference

### Anthropic (Claude)

| Model | Context | Best For | Cost (input/output per 1M tokens) |
|-------|---------|----------|-----------------------------------|
| claude-opus-4-6 | 1M* | Complex reasoning, large codebase | $15 / $75 |
| claude-sonnet-4 | 200K | General coding, balanced | $3 / $15 |
| claude-haiku-3.5 | 200K | Quick tasks, classification | $0.80 / $4 |

*Opus 4.6 gets 1M context window by default for Max, Team, and Enterprise plans (Claude Code 2.1.75+). Previously required extra usage.

**Env**: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`  
**Auth**: API key (`sk-ant-...`) or OAuth  
**Docs**: https://docs.anthropic.com

---

### OpenAI (Codex/GPT)

| Model | Context | Best For | Cost (input/output per 1M tokens) |
|-------|---------|----------|-----------------------------------|
| gpt-4o | 128K | Code generation, general | $2.50 / $10 |
| gpt-4o-mini | 128K | Fast tasks, simple edits | $0.15 / $0.60 |
| o1 | 200K | Deep reasoning, math | $15 / $60 |
| o3-mini | 200K | Efficient reasoning | $1.10 / $4.40 |

**Env**: `OPENAI_API_KEY`, `CODEX_MODEL`  
**Auth**: API key (`sk-...`) or project-scoped  
**Docs**: https://platform.openai.com/docs

---

### Google (Gemini)

| Model | Context | Best For | Cost (input/output per 1M tokens) |
|-------|---------|----------|-----------------------------------|
| gemini-2.5-pro | 1M+ | Large codebase analysis | $1.25 / $10 |
| gemini-2.5-flash | 1M+ | Fast large-context tasks | $0.075 / $0.30 |

**Env**: `GEMINI_API_KEY`, `GEMINI_MODEL`  
**Auth**: API key or OAuth  
**Docs**: https://ai.google.dev

---

## Model Selection Decision Tree

```
Task requires reasoning?
├── Yes → Complex + large codebase?
│   ├── Yes → Claude Opus 4.6 (1M context*) or o1
│   └── No → Claude Sonnet or GPT-4o
└── No → Speed matters?
    ├── Yes → Claude Haiku or GPT-4o-mini
    └── No → Context > 200K?
        ├── Yes → Gemini Pro (1M+) or Opus 4.6 (1M*)
        └── No → Claude Sonnet or GPT-4o
```

*Opus 4.6 1M context: Max/Team/Enterprise plans only (Claude Code 2.1.75+)

## Environment Templates

### `.env` (never commit)
```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4

# OpenAI
OPENAI_API_KEY=sk-...
CODEX_MODEL=gpt-4o

# Google
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash

# Paperclip (auto-injected in heartbeats)
# PAPERCLIP_API_KEY=...
# PAPERCLIP_API_URL=http://127.0.0.1:3103  # Port varies by deployment
```

### Shell config (`.zshrc` / `.bashrc`)
```bash
# Source .env if exists
[ -f ~/.env ] && source ~/.env
```

## Rate Limits (Typical Free Tier)

| Provider | RPM | TPM | Notes |
|----------|-----|-----|-------|
| Anthropic | 60 | 100K | Paid tier much higher |
| OpenAI | 60 | 40K | Project limits vary |
| Google | 60 | 1M | Most generous free tier |

## Cost Optimization Tips

1. **Use smaller models for simple tasks** (Haiku/mini for edits, Sonnet/GPT-4o for features)
2. **Cache system prompts** - most providers now support prompt caching
3. **Batch similar tasks** to reduce context switching overhead
4. **Set max_tokens** to prevent runaway generation

## Related

- [Runbook: Local Coding Agents](../runbooks/local-coding-agents-overview.md)
- [Troubleshooting: Auth Issues](../troubleshooting/auth-issues.md)
