/**
 * 🤖 LLM 提供商抽象层
 *
 * 统一接口支持多个 LLM 提供商：
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude Opus, Sonnet, Haiku)
 * - 本地模型 (Ollama, vLLM)
 * - OpenClaw Gateway
 *
 * @version 2.40.0
 * @since 2025-03-11
 */

// ========== 类型定义 ==========

/**
 * LLM 提供商类型
 */
export enum LLMProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  OPENCLAW = "openclaw",
  OLLAMA = "ollama",
  VLLM = "vllm",
  CUSTOM = "custom",
}

/**
 * 模型配置
 */
export interface ModelConfig {
  /** 提供商 */
  provider: LLMProvider;
  /** 模型名称 */
  model: string;
  /** API 密钥 */
  apiKey?: string;
  /** API 端点 */
  baseURL?: string;
  /** 最大 Token 数 */
  maxTokens?: number;
  /** 温度 */
  temperature?: number;
  /** 超时（毫秒） */
  timeout?: number;
  /** 自定义头 */
  headers?: Record<string, string>;
}

/**
 * LLM 请求
 */
export interface LLMRequest {
  /** 提示词 */
  prompt: string;
  /** 系统提示 */
  systemPrompt?: string;
  /** 对话历史 */
  messages?: Array<{ role: string; content: string }>;
  /** 工具定义 */
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  /** 工具调用 */
  toolCalls?: Array<{ id: string; name: string; parameters: Record<string, unknown> }>;
}

/**
 * LLM 响应
 */
export interface LLMResponse {
  /** 内容 */
  content: string;
  /** 使用的 Token 数 */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 工具调用请求 */
  toolCalls?: Array<{ id: string; name: string; parameters: Record<string, unknown> }>;
  /** 模型名称 */
  model?: string;
  /** 原始响应 */
  raw?: unknown;
}

// ========== LLM 提供商基类 ==========

/**
 * LLM 提供商接口
 */
export interface ILLMProvider {
  /** 提供商类型 */
  readonly provider: LLMProvider;
  /** 当前模型 */
  readonly model: string;

  /**
   * 生成文本
   */
  generate(request: LLMRequest): Promise<LLMResponse>;

  /**
   * 流式生成
   */
  stream(request: LLMRequest, onChunk: (chunk: string) => void): Promise<LLMResponse>;
}

// ========== OpenAI 提供商 ==========

/**
 * OpenAI LLM 提供商
 */
export class OpenAIProvider implements ILLMProvider {
  readonly provider = LLMProvider.OPENAI;
  readonly model: string;
  private _config: ModelConfig; // 保留用于未来实现

  constructor(config: ModelConfig) {
    this.model = config.model;
    this._config = config;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 OpenAI API 调用
    // 这里返回模拟响应
    return {
      content: `[OpenAI ${this.model}] 模拟响应: ${request.prompt.slice(0, 50)}...`,
      usage: {
        promptTokens: request.prompt.length / 4,
        completionTokens: 100,
        totalTokens: request.prompt.length / 4 + 100,
      },
      model: this.model,
    };
  }

  async stream(request: LLMRequest, _onChunk: (chunk: string) => void): Promise<LLMResponse> {
    // TODO: 实现 OpenAI 流式调用
    const response = await this.generate(request);
    return response;
  }
}

// ========== Anthropic 提供商 ==========

/**
 * Anthropic Claude 提供商
 */
export class AnthropicProvider implements ILLMProvider {
  readonly provider = LLMProvider.ANTHROPIC;
  readonly model: string;
  private _config: ModelConfig; // 保留用于未来实现

  constructor(config: ModelConfig) {
    this.model = config.model;
    this._config = config;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 Anthropic API 调用
    // 这里返回模拟响应
    return {
      content: `[Claude ${this.model}] 模拟响应: ${request.prompt.slice(0, 50)}...`,
      usage: {
        promptTokens: request.prompt.length / 4,
        completionTokens: 100,
        totalTokens: request.prompt.length / 4 + 100,
      },
      model: this.model,
    };
  }

  async stream(request: LLMRequest, _onChunk: (chunk: string) => void): Promise<LLMResponse> {
    // TODO: 实现 Anthropic 流式调用
    const response = await this.generate(request);
    return response;
  }
}

// ========== OpenClaw Gateway 提供商 ==========

/**
 * OpenClaw Gateway 提供商
 * 通过项目的 OpenClaw 插件系统调用
 */
export class OpenClawProvider implements ILLMProvider {
  readonly provider = LLMProvider.OPENCLAW;
  readonly model: string;
  private _config: ModelConfig; // 保留用于未来实现

  constructor(config: ModelConfig) {
    this.model = config.model;
    this._config = config;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 通过 OpenClaw Gateway API 调用
    // POST /api/agents/{id}/chat
    return {
      content: `[OpenClaw ${this.model}] 模拟响应: ${request.prompt.slice(0, 50)}...`,
      usage: {
        promptTokens: request.prompt.length / 4,
        completionTokens: 100,
        totalTokens: request.prompt.length / 4 + 100,
      },
      model: this.model,
    };
  }

  async stream(request: LLMRequest, _onChunk: (chunk: string) => void): Promise<LLMResponse> {
    // TODO: 实现 OpenClaw 流式调用
    const response = await this.generate(request);
    return response;
  }
}

// ========== 本地模型提供商 ==========

/**
 * Ollama 本地模型提供商
 */
export class OllamaProvider implements ILLMProvider {
  readonly provider = LLMProvider.OLLAMA;
  readonly model: string;
  private _config: ModelConfig; // 保留用于未来实现

  constructor(config: ModelConfig) {
    this.model = config.model;
    this._config = config;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 Ollama API 调用
    // POST http://localhost:11434/api/generate
    return {
      content: `[Ollama ${this.model}] 模拟响应: ${request.prompt.slice(0, 50)}...`,
      model: this.model,
    };
  }

  async stream(request: LLMRequest, _onChunk: (chunk: string) => void): Promise<LLMResponse> {
    // TODO: 实现 Ollama 流式调用
    const response = await this.generate(request);
    return response;
  }
}

// ========== LLM 工厂 ==========

/**
 * LLM 提供商工厂
 */
export class LLMFactory {
  private static providers = new Map<string, ILLMProvider>();

  /**
   * 创建 LLM 提供商实例
   */
  static create(config: ModelConfig): ILLMProvider {
    const key = `${config.provider}:${config.model}`;

    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: ILLMProvider;

    switch (config.provider) {
      case LLMProvider.OPENAI:
        provider = new OpenAIProvider(config);
        break;
      case LLMProvider.ANTHROPIC:
        provider = new AnthropicProvider(config);
        break;
      case LLMProvider.OPENCLAW:
        provider = new OpenClawProvider(config);
        break;
      case LLMProvider.OLLAMA:
        provider = new OllamaProvider(config);
        break;
      default:
        throw new Error(`不支持的提供商: ${config.provider}`);
    }

    this.providers.set(key, provider);
    return provider;
  }

  /**
   * 从环境变量创建配置
   */
  static createFromEnv(provider?: LLMProvider, model?: string): ILLMProvider {
    const resolvedProvider = provider ?? (process.env.LLM_PROVIDER as LLMProvider) ?? LLMProvider.ANTHROPIC;
    const resolvedModel = model ?? process.env.LLM_MODEL ?? "claude-sonnet-4-20250514";

    const config: ModelConfig = {
      provider: resolvedProvider,
      model: resolvedModel,
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL,
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? "4096"),
      temperature: parseFloat(process.env.LLM_TEMPERATURE ?? "0.7"),
    };

    return this.create(config);
  }

  /**
   * 清除缓存的提供商
   */
  static clearCache(): void {
    this.providers.clear();
  }
}

// ========== 快捷函数 ==========

/**
 * 快速生成文本
 */
export async function generateText(
  prompt: string,
  config?: ModelConfig
): Promise<string> {
  const provider = config ? LLMFactory.create(config) : LLMFactory.createFromEnv();

  const response = await provider.generate({ prompt });
  return response.content;
}

/**
 * 快速流式生成
 */
export async function streamText(
  prompt: string,
  onChunk: (chunk: string) => void,
  config?: ModelConfig
): Promise<string> {
  const provider = config ? LLMFactory.create(config) : LLMFactory.createFromEnv();

  const response = await provider.stream({ prompt }, onChunk);
  return response.content;
}
