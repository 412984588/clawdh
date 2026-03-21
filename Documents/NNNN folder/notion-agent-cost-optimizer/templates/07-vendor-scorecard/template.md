# AI Vendor Scorecard

Evaluate and compare AI providers objectively. Make data-driven vendor decisions, not hype-driven ones.

## Vendor Comparison Matrix

Rate each provider on a 1–10 scale:

| Dimension | Weight | OpenAI | Anthropic | Google | Mistral | Open Source | Notes |
|-----------|--------|--------|-----------|--------|---------|-------------|-------|
| Model quality (your tasks) | 25% | /10 | /10 | /10 | /10 | /10 | |
| Pricing competitiveness | 20% | /10 | /10 | /10 | /10 | /10 | |
| Reliability / uptime | 15% | /10 | /10 | /10 | /10 | /10 | |
| API developer experience | 10% | /10 | /10 | /10 | /10 | /10 | |
| Rate limits / throughput | 10% | /10 | /10 | /10 | /10 | /10 | |
| Data privacy / compliance | 10% | /10 | /10 | /10 | /10 | /10 | |
| Speed (latency, tokens/s) | 5% | /10 | /10 | /10 | /10 | /10 | |
| Innovation pace | 5% | /10 | /10 | /10 | /10 | /10 | |
| **Weighted Score** | **100%** | **/10** | **/10** | **/10** | **/10** | **/10** | |

**Weighted score formula:**
```
Score = Σ (Rating × Weight) for each dimension
```

---

## Provider Detail Cards

### OpenAI

| Attribute | Details |
|-----------|---------|
| Models used | GPT-4o, GPT-4o-mini, o1, o3-mini |
| Monthly spend | $ |
| % of total AI budget | % |
| Primary use case | |
| Uptime (last 90 days) | % |
| Avg response latency | ms |
| Rate limit tier | |
| Support level | |
| Contract type | Pay-as-you-go / Enterprise |
| Data retention policy | |
| Strengths | |
| Weaknesses | |
| Risk factors | |

### Anthropic

| Attribute | Details |
|-----------|---------|
| Models used | Claude Opus 4, Claude Sonnet 4, Claude Haiku 3.5 |
| Monthly spend | $ |
| % of total AI budget | % |
| Primary use case | |
| Uptime (last 90 days) | % |
| Avg response latency | ms |
| Rate limit tier | |
| Support level | |
| Contract type | Pay-as-you-go / Enterprise |
| Data retention policy | |
| Strengths | |
| Weaknesses | |
| Risk factors | |

### Google (Vertex AI / Gemini)

| Attribute | Details |
|-----------|---------|
| Models used | Gemini 2.5 Pro, Gemini 2.5 Flash |
| Monthly spend | $ |
| % of total AI budget | % |
| Primary use case | |
| Uptime (last 90 days) | % |
| Avg response latency | ms |
| Rate limit tier | |
| Support level | |
| Contract type | |
| Data retention policy | |
| Strengths | |
| Weaknesses | |
| Risk factors | |

---

## Vendor Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Price increase >20% | Medium | High | Multi-vendor strategy, usage-based contracts |
| Extended outage (>4 hrs) | Low | Critical | Automatic failover to secondary provider |
| Model deprecation | Medium | High | Abstract model layer, test alternatives quarterly |
| Rate limit reduction | Medium | Medium | Request limit increase, implement queuing |
| Data privacy incident | Low | Critical | Minimize PII in prompts, review data policies |
| API breaking changes | Medium | Medium | Version pinning, staging environment testing |
| Vendor lock-in | High | High | Abstraction layer, multi-provider architecture |

---

## Quarterly Vendor Review Checklist

- [ ] Update pricing for all providers (prices change frequently)
- [ ] Review uptime/reliability data for the quarter
- [ ] Compare model quality on your specific tasks (not benchmarks)
- [ ] Check for new models or features from each provider
- [ ] Review rate limits vs. actual usage
- [ ] Assess vendor concentration risk (any provider >70%?)
- [ ] Update contract/commitment status
- [ ] Test failover to backup providers

---

## Vendor Negotiation Tracker

| Provider | Current Tier | Monthly Spend | Discount Available? | Enterprise Contact | Contract Renewal |
|----------|-------------|--------------|--------------------|--------------------|-----------------|
| OpenAI | | $ | | | |
| Anthropic | | $ | | | |
| Google | | $ | | | |

**Volume discount thresholds:**
- OpenAI: Contact sales at >$5K/month for usage tiers
- Anthropic: Custom pricing available at scale
- Google: Committed use discounts via Vertex AI

---

*Review this scorecard quarterly. Update scores when providers ship major updates.*
*Feed vendor decisions into the Model Comparison (template 03) for task-level routing.*
