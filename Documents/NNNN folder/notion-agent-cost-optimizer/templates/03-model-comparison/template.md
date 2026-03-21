# AI Model Comparison & Selection Guide

Choose the right model for each task. Using GPT-4o for everything is like driving a Ferrari to the grocery store — expensive and unnecessary.

## The Model Selection Matrix

| Task Type | Recommended Model | Why | Cost Level |
|-----------|------------------|-----|-----------|
| Simple classification / routing | GPT-4o-mini / Haiku / Flash | Fast, cheap, 95%+ accuracy for simple tasks | $ |
| Content generation (drafts) | Claude Sonnet / GPT-4o | Best quality-to-cost ratio for text | $$ |
| Code generation | Claude Sonnet / GPT-4o | Strong coding + reasoning | $$ |
| Complex reasoning / analysis | Claude Opus / o1 / Gemini Pro | Worth the premium for hard problems | $$$ |
| Data extraction / parsing | GPT-4o-mini / Flash | Structured output, fast, cheap | $ |
| Summarization | GPT-4o-mini / Haiku | Doesn't need top-tier reasoning | $ |
| Multi-step agent workflows | Claude Sonnet / GPT-4o | Best tool use + long context | $$ |
| Vision / image analysis | GPT-4o / Claude Sonnet | Strong multimodal capability | $$ |
| Embeddings | text-embedding-3-small | Purpose-built, extremely cheap | ¢ |
| Real-time chat (user-facing) | GPT-4o-mini / Haiku / Flash | Low latency, low cost per message | $ |

---

## Model-by-Model Comparison

### Cost Comparison (per 1M tokens, 2024 pricing)

| Model | Input | Output | Speed (tokens/s) | Context | Best For |
|-------|-------|--------|------------------|---------|---------|
| **GPT-4o** | $2.50 | $10.00 | ~80 | 128K | General purpose, coding, vision |
| **GPT-4o-mini** | $0.15 | $0.60 | ~120 | 128K | Classification, extraction, chat |
| **o1** | $15.00 | $60.00 | ~30 | 200K | Math, science, complex reasoning |
| **o3-mini** | $1.10 | $4.40 | ~60 | 200K | Reasoning at lower cost |
| **Claude Opus 4** | $15.00 | $75.00 | ~40 | 200K | Hardest problems, agentic tasks |
| **Claude Sonnet 4** | $3.00 | $15.00 | ~80 | 200K | Best all-rounder, coding, agents |
| **Claude Haiku 3.5** | $0.80 | $4.00 | ~150 | 200K | Fast classification, simple tasks |
| **Gemini 2.5 Pro** | $1.25 | $10.00 | ~70 | 1M | Long context, multimodal |
| **Gemini 2.5 Flash** | $0.15 | $0.60 | ~150 | 1M | Budget tasks with long context |

---

## Cost Savings: Model Downgrade Calculator

Calculate savings from switching models for specific tasks:

| Task | Current Model | Current Cost/mo | Proposed Model | New Cost/mo | Monthly Savings | Quality Impact |
|------|-------------|----------------|---------------|------------|----------------|---------------|
| | GPT-4o | $ | GPT-4o-mini | $ | $ | Minimal / None |
| | Claude Opus | $ | Claude Sonnet | $ | $ | Minimal |
| | o1 | $ | o3-mini | $ | $ | Slight |
| | Gemini Pro | $ | Gemini Flash | $ | $ | Minimal |
| **TOTAL** | | **$** | | **$** | **$** | |

**Savings formula:**
```
Monthly savings = (Current price - New price) × Monthly tokens ÷ 1,000,000
```

---

## Model Routing Decision Tree

Use this to decide which model handles each request:

```
Is the task simple? (classification, extraction, yes/no, short answer)
  ├── YES → Use cheap model (GPT-4o-mini / Haiku / Flash)  [$]
  └── NO → Does it require complex reasoning or multi-step logic?
        ├── YES → Does it require the absolute best quality?
        │     ├── YES → Use premium model (Opus / o1)  [$$$]
        │     └── NO  → Use mid-tier model (Sonnet / GPT-4o / o3-mini)  [$$]
        └── NO → Is it content generation?
              ├── YES → Mid-tier model (Sonnet / GPT-4o)  [$$]
              └── NO → Cheap model (GPT-4o-mini / Haiku / Flash)  [$]
```

---

## Quality vs. Cost Benchmarks

Run these tests on your actual tasks to validate model downgrades:

| Test | Task Description | Eval Metric | Opus/o1 Score | Sonnet/4o Score | Mini/Haiku Score | Acceptable? |
|------|-----------------|-------------|--------------|----------------|-----------------|-------------|
| 1 | [Your task here] | Accuracy % | % | % | % | Yes/No |
| 2 | [Your task here] | F1 / BLEU | | | | Yes/No |
| 3 | [Your task here] | Human eval (1-5) | | | | Yes/No |
| 4 | [Your task here] | Pass rate % | % | % | % | Yes/No |

**Rule of thumb:** If the cheaper model scores within 5% of the expensive model on your eval, switch.

---

## Multi-Provider Strategy

Don't lock into one provider. Use this table to plan your provider mix:

| Provider | % of Spend | Primary Use Case | Fallback Provider | Risk |
|----------|-----------|-----------------|-------------------|------|
| OpenAI | % | | | Rate limits, outages |
| Anthropic | % | | | Rate limits, outages |
| Google | % | | | Pricing changes |
| Open Source (local) | % | | N/A | Maintenance cost |

**Diversification target:** No single provider >70% of total spend.

---

*Use this guide when setting up new agents or reviewing existing ones.*
*Feed model selections into the Budget Planner (template 04) for cost projections.*
