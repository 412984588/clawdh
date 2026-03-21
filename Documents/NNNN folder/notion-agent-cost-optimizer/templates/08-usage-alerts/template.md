# Usage Alerts & Anomaly Detection

Catch cost spikes before they become surprise bills. Set up alerts, monitor anomalies, and respond fast.

## Alert Configuration

### Threshold Alerts

| Alert Name | Metric | Threshold | Check Frequency | Notification | Owner | Active? |
|-----------|--------|----------|----------------|-------------|-------|---------|
| Daily Spend Limit | Total daily cost | >$___/day | Hourly | Email/Slack | | ☐ |
| Hourly Spike | Hourly cost | >3× avg hourly | Every 15 min | Slack | | ☐ |
| Single Agent Over Budget | Per-agent daily cost | >$___/day | Hourly | Email | | ☐ |
| Error Rate Spike | Failed requests % | >__% of calls | Every 30 min | Slack + PagerDuty | | ☐ |
| Token Anomaly | Tokens per request | >2× avg | Per request | Log only | | ☐ |
| Monthly Pace Alert | Projected monthly spend | >120% of budget | Daily | Email | | ☐ |
| New Model Usage | Unrecognized model ID | Any usage | Per request | Slack | | ☐ |
| Rate Limit Warning | 429 errors | >10/hour | Hourly | Slack | | ☐ |

---

## Alert Response Playbook

When an alert fires, follow this decision tree:

### Daily Spend Limit Exceeded

```
1. Check which agent(s) caused the spike
   → Is it a known batch job or planned spike?
      YES → Acknowledge alert, update threshold for next time
      NO  → Continue to step 2

2. Check for runaway loops or retry storms
   → Look at request count vs. normal baseline
   → Are requests repeating with same input? = Retry loop
      YES → Kill the process, investigate code
      NO  → Continue to step 3

3. Check for increased user volume
   → Did traffic increase legitimately?
      YES → This is scaling cost, review model efficiency
      NO  → Investigate unauthorized usage
```

### Error Rate Spike (Wasted Tokens)

```
1. Check error type
   - 429 (Rate Limited) → Implement backoff, request limit increase
   - 500 (Provider Error) → Check provider status page, enable failover
   - 400 (Bad Request) → Check recent prompt changes, fix input validation
   - Timeout → Reduce max_tokens, check network, implement streaming

2. Calculate wasted spend
   Wasted = Failed requests × avg cost per request

3. If wasted spend > $___/day → Pause the agent, fix, then resume
```

### Token Anomaly (Unexpectedly Large Requests)

```
1. Check which agent sent the oversized request
2. Check input — was context window stuffed?
   → Common cause: entire database/file passed as context
3. Check output — did the model generate way more than needed?
   → Fix: Set tighter max_tokens, add stop sequences
4. Was it a one-off or a pattern?
   → One-off: Log and monitor
   → Pattern: Fix the prompt immediately
```

---

## Anomaly Detection Log

Record every alert that fires:

| Date | Time | Alert Type | Agent | Metric Value | Threshold | Root Cause | Action Taken | Resolved? | Cost Impact |
|------|------|-----------|-------|-------------|----------|-----------|-------------|----------|-----------|
| | | | | | | | | ☐ | $ |
| | | | | | | | | ☐ | $ |
| | | | | | | | | ☐ | $ |
| | | | | | | | | ☐ | $ |

---

## Monitoring Setup Guide

### Option 1: DIY with API Logs (Free)

```
1. Log every API call: timestamp, model, input_tokens, output_tokens, cost, status
2. Aggregate hourly and daily
3. Compare against baselines
4. Alert via email/Slack webhook when thresholds exceeded
```

**Minimum fields to log per request:**
| Field | Example | Why |
|-------|---------|-----|
| timestamp | 2024-01-15T14:30:00Z | When |
| agent_id | customer-support-bot | Who |
| model | claude-sonnet-4-20250514 | What model |
| input_tokens | 1,245 | Input cost |
| output_tokens | 387 | Output cost |
| total_cost | $0.0095 | Running total |
| status | success / error | Error rate tracking |
| latency_ms | 1,240 | Performance |

### Option 2: Provider Dashboards (Free)

| Provider | Dashboard URL | What It Shows |
|----------|-------------|--------------|
| OpenAI | platform.openai.com/usage | Daily spend, model breakdown |
| Anthropic | console.anthropic.com/settings/usage | Token usage, rate limits |
| Google | console.cloud.google.com/billing | Vertex AI costs by model |

### Option 3: Third-Party Tools

| Tool | Cost | Features |
|------|------|---------|
| Helicone | Free tier | Request logging, cost tracking, caching |
| LangSmith | Free tier | Trace logging, evaluation, monitoring |
| Portkey | Free tier | Multi-provider gateway, cost tracking |
| Custom (OpenTelemetry) | Free | Full control, any visualization tool |

---

## Weekly Alert Review

Complete every Friday:

- [ ] How many alerts fired this week? ___
- [ ] False positive rate? ___% (adjust thresholds if >30%)
- [ ] Total cost of anomalies detected? $___
- [ ] Cost prevented by alerts (estimated)? $___
- [ ] Any new alert types needed? ___
- [ ] Any thresholds to adjust? ___

---

*Alerts are your first line of defense against cost overruns.*
*Feed anomaly data into the Monthly Report (template 10) for trend analysis.*
