# Team AI Cost Allocation

Track who uses what, allocate costs fairly, and set per-team or per-project budgets.

## Team / Department Allocation Overview

**Month:** _______________ **Total AI Budget:** $_______________

| Team / Department | Budget | Actual Spend | % of Total | Over/Under | Primary Models | Top Agent |
|------------------|--------|-------------|-----------|-----------|---------------|----------|
| Engineering | $ | $ | % | $ | | |
| Product | $ | $ | % | $ | | |
| Marketing | $ | $ | % | $ | | |
| Customer Support | $ | $ | % | $ | | |
| Sales | $ | $ | % | $ | | |
| Data / Analytics | $ | $ | % | $ | | |
| Executive / Strategy | $ | $ | % | $ | | |
| R&D / Experimentation | $ | $ | % | $ | | |
| **TOTAL** | **$** | **$** | **100%** | **$** | | |

---

## Per-User API Key Tracking

If using API keys per person or team:

| User / Team | API Key (last 4) | Provider | Monthly Limit | Current Usage | % Used | Reset Date |
|------------|-----------------|----------|--------------|--------------|--------|-----------|
| | ...XXXX | OpenAI | $ | $ | % | |
| | ...XXXX | Anthropic | $ | $ | % | |
| | ...XXXX | Google | $ | $ | % | |
| | ...XXXX | OpenAI | $ | $ | % | |

---

## Cost Allocation Methods

Choose the method that fits your organization:

### Method 1: Direct Attribution (Recommended)
Each agent/API key is tagged to a team. Cost goes 100% to the team that owns the agent.

**Pros:** Simple, accurate, accountable
**Cons:** Shared services (like a general AI assistant) need a split rule

### Method 2: Usage-Based Split
Shared agents split costs based on usage (requests or tokens per team).

**Split formula:**
```
Team cost = (Team's requests ÷ Total requests) × Total agent cost
```

### Method 3: Fixed Allocation
Each team gets a fixed % of the total AI budget regardless of usage.

**Pros:** Simple budgeting
**Cons:** No incentive to optimize; penalizes efficient teams

### Method 4: Hybrid
Direct attribution for owned agents + usage-based split for shared agents.

**Recommended for most teams.**

---

## Shared Agent Cost Split

For agents used by multiple teams:

| Shared Agent | Total Monthly Cost | Team A (%) | Team A ($) | Team B (%) | Team B ($) | Team C (%) | Team C ($) |
|-------------|-------------------|-----------|-----------|-----------|-----------|-----------|-----------|
| General AI Assistant | $ | % | $ | % | $ | % | $ |
| Code Review Bot | $ | % | $ | % | $ | % | $ |
| Document Summarizer | $ | % | $ | % | $ | % | $ |
| Data Analysis Agent | $ | % | $ | % | $ | % | $ |

---

## Project-Based Tracking

For organizations that bill AI costs to projects or clients:

| Project / Client | Agents Used | Monthly API Cost | Hours Saved | Value Delivered | Billable? | Billed Amount |
|-----------------|------------|-----------------|------------|----------------|----------|--------------|
| | | $ | hrs | $ | Yes/No | $ |
| | | $ | hrs | $ | Yes/No | $ |
| | | $ | hrs | $ | Yes/No | $ |
| | | $ | hrs | $ | Yes/No | $ |

**AI cost pass-through rate:** ___% (what % of AI costs do you bill to clients?)

---

## Team Budget Management

### Setting Team Budgets

| Factor | How to Account For It |
|--------|----------------------|
| Team size | Larger teams may need higher absolute budgets |
| Use case complexity | Code gen costs more than classification |
| Model requirements | Some tasks need premium models |
| Growth trajectory | Fast-growing teams need buffer |
| Historical usage | Base on last 3 months + 20% buffer |

### Budget Request Template

When a team requests more budget:

```
Team: _______________
Current monthly budget: $___
Requested increase: $___
Reason: _______________
Expected value from increase: $___
Alternative (optimization possible?): _______________
Approved by: _______________  Date: _______________
```

---

## Monthly Chargeback Report

Generate this for finance/accounting:

| Team | Provider | Model | Total Tokens | Total Cost | Cost Center Code | PO Number |
|------|----------|-------|-------------|-----------|-----------------|----------|
| | OpenAI | GPT-4o | | $ | | |
| | Anthropic | Claude Sonnet | | $ | | |
| | Google | Gemini Pro | | $ | | |
| **TOTAL** | | | | **$** | | |

---

## Per-Person Usage Guidelines

Set expectations for individual contributors:

| Usage Level | Monthly Limit | Typical Roles | Requires Approval? |
|------------|--------------|--------------|-------------------|
| Light | $50/mo | Writers, analysts, support | No |
| Standard | $200/mo | Engineers, product managers | No |
| Heavy | $500/mo | ML engineers, agent developers | Yes (manager) |
| Unlimited | No cap | R&D leads, approved projects | Yes (director) |

---

*Align team allocations with the Budget Planner (template 04).*
*Review allocations monthly — adjust quarterly based on actual usage patterns.*
