# Prompt Optimization Guide

Cut your token costs 30–70% without losing quality. Every unnecessary word in a prompt costs money at scale.

## The Prompt Cost Equation

```
Prompt cost = (System prompt tokens + User message tokens) × Input price
            + (Generated output tokens) × Output price

At $3/1M input, $15/1M output (Claude Sonnet):
- A 2,000-token system prompt called 10,000 times/month = $0.06/month input
- But if output averages 500 tokens: 10,000 × 500 × $15/1M = $75/month output

→ Optimizing OUTPUT length saves more than optimizing input for most models.
```

---

## Prompt Optimization Checklist

### Input Optimization (Reduce Input Tokens)

- [ ] **Remove preamble** — "You are a helpful assistant" adds tokens with zero value
- [ ] **Compress system prompts** — Cut every word that doesn't change model behavior
- [ ] **Use references, not repetition** — "Follow the format above" instead of repeating the format
- [ ] **Remove examples when few-shot isn't needed** — Test zero-shot first; add examples only if quality drops
- [ ] **Shorten few-shot examples** — 2 examples often work as well as 5
- [ ] **Use structured input** — JSON/XML is more token-efficient than natural language for structured data
- [ ] **Strip unnecessary context** — Only include what the model needs for THIS call

### Output Optimization (Reduce Output Tokens)

- [ ] **Set max_tokens** — Always set a ceiling based on expected output length
- [ ] **Request concise output** — "Respond in under 100 words" or "Answer in 1 sentence"
- [ ] **Use structured output** — JSON mode forces tighter responses
- [ ] **Stop sequences** — Set stop tokens to prevent rambling
- [ ] **Stream and cut** — Stream output and stop when you have what you need

### Caching Strategies

- [ ] **Prompt caching** — OpenAI and Anthropic both offer cached prompt pricing (50% off input)
- [ ] **Response caching** — Cache identical queries at the application level
- [ ] **Semantic caching** — Cache similar (not just identical) queries using embeddings
- [ ] **Batch processing** — Use batch API endpoints for non-real-time tasks (50% off)

---

## Before & After Optimization Examples

### Example 1: System Prompt Compression

**Before (387 tokens):**
```
You are a helpful customer support assistant for our e-commerce platform.
You should always be polite and professional. When a customer asks about
their order, you should look up the order details and provide a clear,
concise response. If you don't know the answer, say so honestly rather
than making something up. Always end your response by asking if there
is anything else you can help with. Make sure to reference the order
number in your response...
```

**After (89 tokens):**
```
E-commerce support agent. Rules:
- Look up order details, reference order number
- If unknown, say so
- End with "Anything else?"
Response: concise, professional, <100 words
```

**Savings:** 77% fewer input tokens

### Example 2: Output Control

**Before (no constraints):**
```
Classify this support ticket into a category.

Ticket: "My package hasn't arrived yet"
```
→ Model outputs 200+ tokens with explanation

**After (constrained):**
```
Classify this ticket. Respond with ONLY the category name.
Categories: shipping, billing, product, account, other

Ticket: "My package hasn't arrived yet"
```
→ Model outputs: "shipping" (1 token)

**Savings:** 99% fewer output tokens

---

## Prompt Optimization Worksheet

Use this for each agent/prompt you want to optimize:

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| System prompt tokens | | | tokens (%) |
| Avg user message tokens | | | tokens (%) |
| Avg output tokens | | | tokens (%) |
| Total tokens per call | | | tokens (%) |
| Cost per call | $ | $ | $ (%) |
| Monthly cost (× calls) | $ | $ | $ (%) |
| Quality score (1–10) | /10 | /10 | Δ |

**Rule:** If quality drops more than 1 point on a 10-point scale, the optimization isn't worth it.

---

## Token Counting Quick Reference

| Content Type | Approximate Token Count |
|-------------|----------------------|
| 1 word (English) | ~1.3 tokens |
| 1 sentence | ~15–25 tokens |
| 1 paragraph | ~75–150 tokens |
| 1 page of text (~500 words) | ~650 tokens |
| 1 JSON object (simple) | ~30–50 tokens |
| A full email | ~200–400 tokens |
| A resume | ~500–800 tokens |

---

## Prompt Template Library (Cost-Optimized)

### Classification (Minimal Tokens)
```
Classify: "[input]"
Options: [A, B, C, D]
Reply with letter only.
```

### Extraction (Structured Output)
```
Extract from text. Return JSON only:
{"name": "", "email": "", "phone": ""}

Text: "[input]"
```

### Summarization (Length-Controlled)
```
Summarize in exactly 2 sentences:
[input]
```

### Yes/No Decision
```
Question: [question]
Context: [context]
Answer: yes or no
```

---

## Advanced: Prompt Chaining for Cost Reduction

Instead of one expensive call, chain cheaper calls:

| Approach | Model | Tokens | Cost |
|----------|-------|--------|------|
| Single call (complex prompt) | GPT-4o | 3,000 in + 1,000 out | $0.0175 |
| **Chain: classify → route → generate** | | | |
| Step 1: Classify (GPT-4o-mini) | GPT-4o-mini | 200 in + 5 out | $0.000033 |
| Step 2: Retrieve context | N/A | 0 | $0 |
| Step 3: Generate (GPT-4o, focused) | GPT-4o | 800 in + 500 out | $0.007 |
| **Chain total** | | 1,005 | **$0.007** |

**Savings: 60%** — by only sending relevant context to the expensive model.

---

*Apply these optimizations to your highest-cost agents first (see Token Tracker, template 02).*
*Verify quality before and after every optimization (see ROI Calculator, template 05).*
