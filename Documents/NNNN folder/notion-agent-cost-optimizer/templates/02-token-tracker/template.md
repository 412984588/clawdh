# Token Usage Tracker

Track every API call at the token level. Find where tokens are wasted and optimize prompt efficiency.

## Token Pricing Reference (2024)

| Provider | Model | Input (per 1M tokens) | Output (per 1M tokens) | Context Window |
|----------|-------|-----------------------|------------------------|---------------|
| OpenAI | GPT-4o | $2.50 | $10.00 | 128K |
| OpenAI | GPT-4o-mini | $0.15 | $0.60 | 128K |
| OpenAI | o1 | $15.00 | $60.00 | 200K |
| OpenAI | o3-mini | $1.10 | $4.40 | 200K |
| Anthropic | Claude Sonnet 4 | $3.00 | $15.00 | 200K |
| Anthropic | Claude Opus 4 | $15.00 | $75.00 | 200K |
| Anthropic | Claude Haiku 3.5 | $0.80 | $4.00 | 200K |
| Google | Gemini 2.5 Pro | $1.25 | $10.00 | 1M |
| Google | Gemini 2.5 Flash | $0.15 | $0.60 | 1M |

*Prices change frequently — verify at provider pricing pages before budget planning.*

---

## Daily Token Log

**Date:** _______________

| Time | Agent / Task | Model | Input Tokens | Output Tokens | Total Tokens | Cost ($) | Success? | Notes |
|------|-------------|-------|-------------|--------------|-------------|---------|---------|-------|
| | | | | | | $ | ✅/❌ | |
| | | | | | | $ | ✅/❌ | |
| | | | | | | $ | ✅/❌ | |
| | | | | | | $ | ✅/❌ | |
| | | | | | | $ | ✅/❌ | |
| **Daily Total** | | | | | | **$** | | |

**Daily cost formula:**
```
Cost = (Input Tokens × Input Price / 1,000,000) + (Output Tokens × Output Price / 1,000,000)
```

---

## Weekly Token Summary

| Day | Total Input | Total Output | Total Tokens | Total Cost | Requests | Avg Tokens/Request | Failed Requests |
|-----|-----------|-------------|-------------|-----------|---------|-------------------|----------------|
| Mon | | | | $ | | | |
| Tue | | | | $ | | | |
| Wed | | | | $ | | | |
| Thu | | | | $ | | | |
| Fri | | | | $ | | | |
| Sat | | | | $ | | | |
| Sun | | | | $ | | | |
| **Total** | | | | **$** | | | |

---

## Token Usage by Agent / Task

| Agent / Task | Avg Input Tokens | Avg Output Tokens | Avg Cost/Call | Calls/Day | Daily Cost | Monthly Estimate |
|-------------|-----------------|------------------|-------------|----------|-----------|-----------------|
| | | | $ | | $ | $ |
| | | | $ | | $ | $ |
| | | | $ | | $ | $ |
| | | | $ | | $ | $ |

---

## Token Waste Analysis

Identify where tokens are being burned without value:

| Waste Category | Description | Monthly Token Waste | Cost Impact | Fix |
|---------------|-------------|-------------------|-------------|-----|
| Retries | Failed calls that consume tokens | | $ | Rate limiting, better error handling |
| Overlong prompts | System prompts >2000 tokens | | $ | Compress prompts, use references |
| Unused output | Generated content that's discarded | | $ | Lower max_tokens, stream + stop early |
| Duplicate calls | Same query repeated | | $ | Implement caching layer |
| Wrong model | Using GPT-4o for simple tasks | | $ | Model routing (template 03) |

**Total monthly waste:** $_______________
**Waste as % of total spend:** ___%

---

## Token Efficiency Metrics

| Metric | Formula | Your Value | Target |
|--------|---------|-----------|--------|
| Output/Input ratio | Output tokens ÷ Input tokens | | >0.3 |
| Cost per successful task | Total cost ÷ Successful completions | $ | Varies |
| Token utilization rate | (Total - Wasted) ÷ Total × 100 | % | >85% |
| Cache savings | Cached tokens × price ÷ Total cost | $ | >20% of spend |

---

*Feed this data into the Cost Dashboard (template 01) weekly.*
*Use the Prompt Optimizer (template 06) to reduce per-call token usage.*
