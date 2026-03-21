# AI Agent Budget Planner

Set monthly and quarterly budgets, forecast costs, and prevent surprise bills.

## Annual Budget Overview

| Quarter | Budget | Projected Spend | Actual Spend | Variance | Notes |
|---------|--------|----------------|-------------|---------|-------|
| Q1 (Jan–Mar) | $ | $ | $ | $ | |
| Q2 (Apr–Jun) | $ | $ | $ | $ | |
| Q3 (Jul–Sep) | $ | $ | $ | $ | |
| Q4 (Oct–Dec) | $ | $ | $ | $ | |
| **Annual** | **$** | **$** | **$** | **$** | |

---

## Monthly Budget Breakdown

**Month:** _______________ **Total Budget:** $_______________

### By Provider

| Provider | Monthly Budget | % of Total | Projected | Actual | Over/Under |
|----------|---------------|-----------|----------|--------|-----------|
| OpenAI | $ | % | $ | $ | $ |
| Anthropic | $ | % | $ | $ | $ |
| Google | $ | % | $ | $ | $ |
| Other | $ | % | $ | $ | $ |
| **Total** | **$** | **100%** | **$** | **$** | **$** |

### By Project / Agent

| Project / Agent | Monthly Budget | Priority | Projected | Actual | Over/Under | Action if Over |
|----------------|---------------|----------|----------|--------|-----------|---------------|
| | $ | Critical | $ | $ | $ | Optimize prompts |
| | $ | High | $ | $ | $ | Downgrade model |
| | $ | Medium | $ | $ | $ | Rate limit |
| | $ | Low | $ | $ | $ | Pause agent |
| | $ | Experimental | $ | $ | $ | Kill if >150% |
| **Total** | **$** | | **$** | **$** | **$** | |

---

## Cost Forecasting Calculator

### New Agent Cost Estimate

Use this before launching any new agent:

| Parameter | Value | Notes |
|-----------|-------|-------|
| Agent name | | |
| Model planned | | |
| Avg input tokens per call | | Test with 10 sample calls |
| Avg output tokens per call | | Test with 10 sample calls |
| Estimated calls per day | | Based on expected usage |
| Input price per 1M tokens | $ | From pricing table |
| Output price per 1M tokens | $ | From pricing table |

**Daily cost estimate:**
```
Daily = (Input tokens × Calls × Input price / 1,000,000)
      + (Output tokens × Calls × Output price / 1,000,000)
```

**Daily:** $_____ → **Monthly (×30):** $_____ → **Annual (×365):** $_____

### Scaling Cost Projection

| Users / Volume | Calls/Day | Daily Cost | Monthly Cost | Annual Cost |
|---------------|----------|-----------|-------------|------------|
| Current | | $ | $ | $ |
| 2× growth | | $ | $ | $ |
| 5× growth | | $ | $ | $ |
| 10× growth | | $ | $ | $ |

---

## Budget Guardrails

Set hard limits to prevent runaway costs:

| Guardrail | Threshold | Action | Owner | Implemented? |
|-----------|----------|--------|-------|-------------|
| Daily spend limit | $___/day | Alert + review | | ☐ |
| Weekly spend limit | $___/week | Alert + throttle | | ☐ |
| Monthly hard cap | $___/month | Auto-pause non-critical | | ☐ |
| Single agent >X% of budget | __% | Review + optimize | | ☐ |
| Cost per request >$X | $___/request | Flag for review | | ☐ |
| Error rate >X% (wasted spend) | __% | Investigate immediately | | ☐ |

---

## Budget Adjustment Triggers

When should you increase or decrease budget?

| Trigger | Direction | Action |
|---------|----------|--------|
| Agent consistently at >90% budget | ↑ Increase | Review if genuinely needed, increase 20% |
| Agent at <50% budget for 2+ months | ↓ Decrease | Reduce allocation, redistribute |
| New product launch | ↑ Increase | Add temporary 30-day budget buffer |
| Cost optimization implemented | ↓ Decrease | Reduce budget by expected savings |
| Provider price cut announced | ↓ Decrease | Recalculate at new prices |
| Provider price increase announced | ↑ Increase | Evaluate alternatives first |

---

## Monthly Budget Review Checklist

Complete at the end of each month:

- [ ] Compare actual vs. budget for each provider
- [ ] Compare actual vs. budget for each agent
- [ ] Identify top 3 cost drivers
- [ ] Check for wasted spend (failed requests, unused capacity)
- [ ] Review optimization opportunities (model downgrades, caching)
- [ ] Adjust next month's budget based on findings
- [ ] Update annual projection with actuals

---

*Feed monthly actuals into the Cost Dashboard (template 01).*
*Use the Model Comparison (template 03) to identify downgrade opportunities before adjusting budget.*
