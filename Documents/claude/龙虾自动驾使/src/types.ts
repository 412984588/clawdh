/**
 * OpenClaw 插件类型定义（本地副本）
 *
 * 从 OpenClaw 源码复制，确保类型安全
 */

export interface PluginLogger {
  debug?: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export interface OpenClawConfig {
  [key: string]: unknown;
}

export interface OpenClawPluginServiceContext {
  config: OpenClawConfig;
  workspaceDir?: string;
  stateDir: string;
  logger: PluginLogger;
}

export interface OpenClawPluginCommandDefinition {
  name: string;
  description: string;
  requireAuth?: boolean;
  handler: (ctx: PluginCommandContext) => PluginCommandResult | Promise<PluginCommandResult>;
}

export interface PluginCommandContext {
  senderId?: string;
  channel: string;
  isAuthorizedSender: boolean;
  args?: string;
  commandBody: string;
  config: OpenClawConfig;
}

export interface PluginCommandResult {
  text?: string;
  channelId?: string;
}

export interface OpenClawPluginService {
  id: string;
  start: (ctx: OpenClawPluginServiceContext) => void | Promise<void>;
  stop?: (ctx: OpenClawPluginServiceContext) => void | Promise<void>;
}

export interface PluginHookEvent {
  port?: number;
  reason?: string;
}

export type PluginHookName =
  | "gateway_start"
  | "gateway_pre_stop"
  | "gateway_stop";

export interface OpenClawPluginApi {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  config: OpenClawConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: unknown;
  logger: PluginLogger;
  registerService: (service: OpenClawPluginService) => void;
  registerCommand: (command: OpenClawPluginCommandDefinition) => void;
  on: <K extends PluginHookName>(
    hookName: K,
    handler: (event: any, ctx: any) => void | Promise<void>,
    opts?: { priority?: number }
  ) => void;
}

// LLM Agent 接口（为未来集成准备）
export interface LLMAgentConfig {
  provider: "anthropic" | "openai" | "custom";
  model?: string;
  apiKey?: string;
  baseURL?: string;
}

export interface AgentDecision {
  description: string;
  type: "analyze" | "execute" | "report" | "wait";
  confidence: number;
  reasoning?: string;
}
