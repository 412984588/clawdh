# LLM Provider SDK Consolidation Research

> **Research Issue**: CMP-30 / CMP-40
> **Researcher**: Evolver (cf996eec-4337-4cc5-b2e5-0833df8c1629)
> **Date**: 2026-03-17
> **Status**: Complete

---

## Executive Summary

**Recommendation**: **Consolidate using Vercel AI SDK** with fallback to direct OpenClaw Gateway integration.

The 龙虾自动驾驶 project currently has **22 TODO comments** for unimplemented LLM API calls across 4 providers. All current implementations return mock responses. The Vercel AI SDK provides the best balance of:

- Multi-provider support (25+ providers including OpenAI, Anthropic, Ollama)
- Streaming-first architecture
- Minimal bundle size (~34-60 KB per provider)
- Native TypeScript support with full inference
- Edge runtime compatibility

**Estimated Effort**: 2-3 days for full migration

---

## 1. Current State Analysis

### 1.1 Existing Architecture

The project has a unified LLM provider abstraction in `llm-provider.ts`:

```
src/engine/llm-provider.ts
├── ILLMProvider interface (generate, stream)
├── LLMProvider enum (OPENAI, ANTHROPIC, OPENCLAW, OLLAMA, VLLM, CUSTOM)
├── ModelConfig, LLMRequest, LLMResponse types
├── OpenAIProvider (STUB - returns mock)
├── AnthropicProvider (STUB - returns mock)
├── OpenClawProvider (STUB - returns mock)
├── OllamaProvider (STUB - returns mock)
└── LLMFactory (creates providers from config/env)
```

### 1.2 TODO Inventory

| File                    | TODO Count | Description                                                                                                   |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `llm-provider.ts`       | 8          | Provider implementations (generate + stream per provider)                                                     |
| `ultrathink.ts`         | 7          | LLM integration for hypothesis, observation, inference, deep thought, contradiction, correction, verification |
| `ralph-loop.ts`         | 6          | Error translation, three-question diagnosis, search, backup, rollback, verification                           |
| `epoch-orchestrator.ts` | 1          | Baseline implementation                                                                                       |
| **Total**               | **22**     |                                                                                                               |

### 1.3 Current Provider Status

| Provider  | generate() | stream() | Status          |
| --------- | ---------- | -------- | --------------- |
| OpenAI    | Mock       | Mock     | NOT IMPLEMENTED |
| Anthropic | Mock       | Mock     | NOT IMPLEMENTED |
| OpenClaw  | Mock       | Mock     | NOT IMPLEMENTED |
| Ollama    | Mock       | Mock     | NOT IMPLEMENTED |

---

## 2. Provider Requirements Matrix

### 2.1 Functional Requirements

| Requirement             | Priority | Notes                     |
| ----------------------- | -------- | ------------------------- |
| Text Generation         | Critical | Core functionality        |
| Streaming               | High     | For real-time responses   |
| Tool/Function Calling   | Medium   | For agent workflows       |
| Multi-turn Conversation | High     | For chat interfaces       |
| Custom Base URL         | Medium   | For gateway/proxy support |
| Error Handling          | Critical | Robust error recovery     |
| TypeScript Types        | High     | Type safety               |

### 2.2 Provider Support Requirements

| Provider               | Required | Use Case                |
| ---------------------- | -------- | ----------------------- |
| OpenAI (GPT-4, GPT-4o) | Yes      | Primary production      |
| Anthropic (Claude)     | Yes      | Primary production      |
| Ollama (Local)         | Yes      | Development/offline     |
| OpenClaw Gateway       | Yes      | Internal gateway        |
| vLLM                   | Optional | Self-hosted alternative |

### 2.3 Non-Functional Requirements

| Requirement     | Target    | Notes                 |
| --------------- | --------- | --------------------- |
| Bundle Size     | <100 KB   | Per provider          |
| Latency (p99)   | <100ms    | Streaming overhead    |
| Edge Runtime    | Supported | For Vercel/Cloudflare |
| Node.js Version | >=18      | LTS support           |

---

## 3. SDK Comparison

### 3.1 Options Evaluated

| SDK                  | Weekly Downloads | Bundle Size       | Providers | Edge Runtime |
| -------------------- | ---------------- | ----------------- | --------- | ------------ |
| **Vercel AI SDK**    | ~4.5M            | 34-60 KB/provider | 25+       | Yes          |
| **LangChain.js**     | ~3.1M            | ~101 KB core      | 200+      | No           |
| **Direct SDKs**      | ~4M (OpenAI)     | ~50 KB each       | 1 each    | Varies       |
| **Custom (current)** | N/A              | Minimal           | 4 (stub)  | Yes          |

### 3.2 Detailed Comparison

#### Vercel AI SDK (`ai`)

**Pros:**

- Streaming-first architecture with `streamText`, `generateText`
- Unified API across 25+ providers
- Native React hooks (`useChat`, `useCompletion`)
- Full TypeScript inference
- Edge runtime compatible
- Active development (v4.x in 2026)
- ~100x smaller than LangChain
- Tool calling support with Zod schemas

**Cons:**

- Less agent orchestration support vs LangChain
- Newer ecosystem (fewer integrations)
- Vercel-centric documentation

**Code Example:**

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { ollama } from "ai-ollama"; // community provider

// Unified API
const result = await streamText({
  model: openai("gpt-4o"), // or anthropic('claude-sonnet-4')
  messages: [{ role: "user", content: "Hello" }],
});
```

#### LangChain.js (`langchain`)

**Pros:**

- 200+ integrations
- LangGraph for multi-agent workflows
- LangSmith for observability
- Mature RAG tooling
- Document processing pipelines

**Cons:**

- Larger bundle (~101 KB core + providers)
- No edge runtime support
- More complex API
- Streaming added later (less ergonomic)
- Higher p99 latency (~50ms vs ~30ms)

**When to Use:**

- Complex agent orchestration
- RAG pipelines with document processing
- Multi-step reasoning chains

#### Direct SDKs (OpenAI SDK + Anthropic SDK)

**Pros:**

- Official SDKs with best TypeScript types
- Direct API access (no abstraction overhead)
- Most up-to-date with provider features

**Cons:**

- No unified API across providers
- Must maintain separate implementations
- No shared streaming primitives
- Higher maintenance burden

---

## 4. Recommendation

### 4.1 Primary Recommendation: Vercel AI SDK

**Rationale:**

1. **Matches Project Needs**: The 龙虾自动驾驶 project needs simple text generation and streaming - Vercel AI SDK excels here.

2. **Provider Coverage**: Supports all required providers:
   - `@ai-sdk/openai` - OpenAI GPT-4, GPT-4o
   - `@ai-sdk/anthropic` - Claude Opus, Sonnet, Haiku
   - `ai-ollama` (community) - Local models
   - Custom provider for OpenClaw Gateway

3. **Minimal Migration**: The existing `ILLMProvider` interface maps directly to AI SDK's `generateText`/`streamText`.

4. **Future-Proof**: Active development, 4.5M weekly downloads, strong community.

### 4.2 Implementation Strategy

```
Phase 1: Core Migration (Day 1)
├── Install @ai-sdk/openai, @ai-sdk/anthropic
├── Update OpenAIProvider to use @ai-sdk/openai
├── Update AnthropicProvider to use @ai-sdk/anthropic
└── Verify streaming works

Phase 2: Local & Gateway (Day 2)
├── Install ai-ollama for Ollama support
├── Create OpenClawGatewayProvider using custom provider pattern
└── Update LLMFactory

Phase 3: Integration (Day 3)
├── Update ultrathink.ts to use LLMFactory
├── Update ralph-loop.ts
├── Add error handling and retries
└── Write tests
```

### 4.3 Fallback Strategy

If Vercel AI SDK doesn't meet needs:

1. Keep current abstraction layer
2. Use direct SDKs (OpenAI SDK, Anthropic SDK)
3. Implement streaming manually

---

## 5. Implementation Effort Estimate

| Task                             | Effort                | Priority |
| -------------------------------- | --------------------- | -------- |
| Install and configure AI SDK     | 2 hours               | High     |
| Migrate OpenAI provider          | 2 hours               | High     |
| Migrate Anthropic provider       | 2 hours               | High     |
| Add Ollama support               | 2 hours               | Medium   |
| Create OpenClaw Gateway provider | 4 hours               | Medium   |
| Update ultrathink.ts integration | 2 hours               | High     |
| Update ralph-loop.ts integration | 1 hour                | Medium   |
| Error handling and retries       | 2 hours               | High     |
| Unit tests                       | 3 hours               | High     |
| Integration tests                | 2 hours               | Medium   |
| Documentation                    | 2 hours               | Low      |
| **Total**                        | **24 hours (3 days)** |          |

### Risk Factors

| Risk                          | Impact | Mitigation                           |
| ----------------------------- | ------ | ------------------------------------ |
| Custom provider for OpenClaw  | Medium | Use AI SDK's custom provider pattern |
| Breaking changes in AI SDK v5 | Low    | Pin version, test before upgrade     |
| Edge runtime compatibility    | Low    | Already supported                    |

---

## 6. References

1. [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
2. [LangChain.js Documentation](https://js.langchain.com/docs/)
3. [PkgPulse: LangChain.js vs Vercel AI SDK 2026](https://www.pkgpulse.com/blog/langchainjs-vs-vercel-ai-sdk-2026)
4. [PkgPulse: Best AI/LLM Libraries for JavaScript 2026](https://www.pkgpulse.com/blog/best-ai-llm-libraries-javascript-2026)
5. [Ryz Labs: LangChain vs Vercel AI SDK](https://learn.ryzlabs.com/llm-development/langchain-vs-vercel-ai-sdk-which-to-use-for-your-next-llm-project)

---

## Appendix A: Current Code Analysis

### llm-provider.ts Structure

```typescript
// Current stub implementation pattern:
export class OpenAIProvider implements ILLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 OpenAI API 调用
    return {
      content: `[OpenAI ${this.model}] 模拟响应...`,
      usage: { promptTokens: 100, completionTokens: 100, totalTokens: 200 },
    };
  }
}
```

### ultrathink.ts TODO Methods

```typescript
// Methods requiring LLM integration:
- generateHypotheses(problem: string): Promise<string[]>
- generateObservations(hypothesis: string): Promise<string[]>
- generateInference(observation: string): Promise<string>
- generateDeepThoughts(inference: string): Promise<string[]>
- detectContradiction(hypothesis: string, inference: string): Promise<boolean>
- generateCorrection(contradiction: string): Promise<string>
- generateVerification(conclusion: string): Promise<string>
```

---

_Research completed by Evolver agent on 2026-03-17_
