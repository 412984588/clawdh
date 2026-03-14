# ADR-005: Model Fallback & Provider Resilience

**Date**: 2026-03-13
**Status**: Accepted
**Decision Makers**: Engineering Team
**Supersedes**: None
**Evidence**: Gateway error logs (2026-03-13 09:26-12:44 EDT)

## Context

Production gateway logs reveal cascading model failures that degrade user experience:

1. **Timeout chain**: `gpt-5.4` → `kimi-coding/k2p5` (timeout after 16s)
2. **404 chain**: `gpt-5.4` → `kimi-coding/k2p5` (404 model not found) → `xheai/claude-opus-4-6`
3. **Context overflow**: `claude-opus-4-6` fails with "Context window is full" (2 instances)
4. **Permission errors**: `openai/gpt-5-mini` image generation fails with 401 (missing `api.responses.write` scope)
5. **Summarization failures**: Both full and partial summarization return 404

Without a resilience strategy, provider failures cascade to complete task failure.

## Decision

**Implement graceful degradation with explicit fallback chains and circuit breakers for provider failures.**

### Fallback Chain Strategy

```
Primary Request
    ↓ (timeout > 15s)
Fallback 1: Same provider, smaller model
    ↓ (404 / model not found)
Fallback 2: Different provider, equivalent capability
    ↓ (context overflow)
Fallback 3: Context reduction + retry
    ↓ (all fail)
Graceful failure with user notification
```

### Provider Health Matrix

| Provider  | Models                           | Timeout | Circuit State     |
| --------- | -------------------------------- | ------- | ----------------- |
| OpenAI    | gpt-5.4, gpt-5-mini, gpt-4o      | 15s     | Monitor           |
| Anthropic | claude-opus-4-6, claude-sonnet-4 | 20s     | Healthy           |
| Kimi      | k2p5                             | 10s     | **Unreliable** ⚠️ |
| xheai     | claude-opus-4-6 (proxy)          | 15s     | Monitor           |

### Circuit Breaker Rules

```yaml
circuit_breaker:
  failure_threshold: 3 # Open circuit after 3 failures
  reset_timeout: 300s # Try again after 5 minutes
  half_open_requests: 1 # Test with single request
  monitored_errors:
    - timeout
    - 404 (model not found)
    - 500 (server error)
    - 429 (rate limit)
```

### Timeout Configuration

| Operation        | Timeout | Fallback Trigger          |
| ---------------- | ------- | ------------------------- |
| LLM completion   | 15s     | After 10s, start fallback |
| Summarization    | 30s     | After 20s, try partial    |
| Image generation | 45s     | After 30s, try smaller    |
| Embedding        | 10s     | No fallback, retry once   |

## Observed Failure Patterns

### Pattern 1: Cascading 404s (kimi-coding)

```
Request → gpt-5.4 (timeout) → k2p5 (404) → claude-opus (success)
```

**Root cause**: kimi-coding/k2p5 model endpoint returns 404 (model not available)
**Fix**: Remove kimi-coding from fallback chain or mark as unreliable

### Pattern 2: Context Window Overflow

```
Error: "Context window is full. Reduce conversation history, system prompt, or tools."
```

**Root cause**: Conversation history exceeds model context limit
**Fix**: Implement automatic context reduction before retry

### Pattern 3: Summarization Failure

```
Full summarization failed → Partial also failed → Both 404
```

**Root cause**: Summarization endpoint unavailable or misconfigured
**Fix**: Fall back to truncation-based context reduction

### Pattern 4: Permission Scope Missing

```
Image generation: 401 "Missing scopes: api.responses.write"
```

**Root cause**: API key lacks required OAuth scopes
**Fix**: Document required scopes per operation type

## Implementation

### 1. Fallback Decision Logic

```typescript
interface FallbackDecision {
  stage: "timeout" | "error" | "context_overflow";
  currentModel: string;
  nextModel: string;
  reason: string;
}

async function withFallback<T>(
  primary: () => Promise<T>,
  fallbacks: Array<{ fn: () => Promise<T>; timeout: number }>,
): Promise<T> {
  try {
    return await withTimeout(primary(), 15000);
  } catch (err) {
    for (const fallback of fallbacks) {
      try {
        return await withTimeout(fallback.fn(), fallback.timeout);
      } catch {
        continue;
      }
    }
    throw new Error("All fallbacks exhausted");
  }
}
```

### 2. Context Reduction Strategy

```
Context > 80% limit?
├── Yes → Compress history
│   ├── Keep last 10 messages
│   ├── Summarize older messages
│   └── Remove tool outputs > 1000 chars
└── No → Proceed normally
```

### 3. Provider Health Tracking

```typescript
interface ProviderHealth {
  provider: string;
  model: string;
  successRate: number; // 0-1
  avgLatency: number; // ms
  lastFailure: Date | null;
  circuitState: "closed" | "open" | "half-open";
}
```

## Monitoring

### Metrics to Track

| Metric                | Alert Threshold | Action                 |
| --------------------- | --------------- | ---------------------- |
| Provider timeout rate | > 5%            | Check provider status  |
| Fallback chain depth  | > 2             | Review primary model   |
| Context overflow rate | > 2%            | Reduce prompt size     |
| Circuit breaker opens | > 3/hour        | Provider investigation |

### Dashboard Queries

```sql
-- Provider failure rates (last hour)
SELECT
  provider,
  COUNT(*) as total,
  SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate
FROM model_requests
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY provider;
```

## Consequences

### Positive

- Graceful degradation instead of hard failures
- Clear provider health visibility
- Automatic recovery from transient issues
- Better user experience during provider issues

### Negative

- Complexity in fallback logic
- Potential for masking persistent issues
- Fallback models may have different capabilities
- Additional latency from retry attempts

### Mitigations

- Log all fallback decisions for analysis
- Alert on repeated fallback patterns
- Regular provider health reviews
- Document model capability differences

## Model Updates (2026-03-13)

### Claude Code 2.1.75 Fixes

- **Token estimation fix**: Prevents premature context compaction for thinking and `tool_use` blocks. Was causing ~40% overcount, leading to unnecessary compaction at 60% actual usage.
- **Opus 4.6 1M context**: Max/Team/Enterprise plans now get 1M context by default. Reduces context overflow failures for large codebase analysis.

## Alternatives Considered

### Option A: No fallback, fail fast

**Pros**: Simple, clear errors
**Cons**: Poor UX, task failure on transient issues
**Why rejected**: Unacceptable for production use

### Option B: Infinite retry with backoff

**Pros**: Eventually succeeds
**Cons**: Long delays, budget waste, poor UX
**Why rejected**: Timeout concerns

### Option C: Manual provider selection

**Pros**: Full control
**Cons**: Requires human intervention, doesn't scale
**Why rejected**: Defeats automation purpose

## Related

- [Runbook: Debugging Agent Failures](../runbooks/debugging-agent-failures.md)
- [Reference: Model Configs](../references/model-configs.md)
- [ADR-004: Multi-Agent Coordination](./004-multi-agent-coordination.md)

## Changelog

- 2026-03-13: Initial version based on gateway error log analysis
