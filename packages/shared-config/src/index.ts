/**
 * @voice-hub/shared-config
 *
 * 共享配置模块
 * 提供环境变量解析、配置验证、默认值
 */

import { z } from "zod";
import { configSchema, internalConfigSchema } from "./schema.js";
import { CONSTANTS } from "./constants.js";

export interface Config {
  // Discord
  discordBotToken: string;
  discordGuildId: string;
  discordVoiceChannelId: string;
  discordClientId: string;

  // Volcengine / Doubao
  doubaoRealtimeWsUrl?: string;
  doubaoAppId?: string;
  doubaoAccessToken?: string;
  volcengineRealtimeWsUrl?: string;
  volcengineAppId?: string;
  volcengineAccessToken?: string;

  // OpenAI Realtime
  openaiRealtimeWsUrl?: string;
  openaiApiKey?: string;
  openaiRealtimeModel?: string;

  // Gemini Live
  geminiLiveWsUrl?: string;
  geminiApiKey?: string;
  geminiLiveModel?: string;

  // Hume EVI
  humeEviWsUrl?: string;
  humeApiKey?: string;
  humeConfigId?: string;

  // Azure Voice Live
  azureVoiceLiveWsUrl?: string;
  azureVoiceLiveApiKey?: string;
  azureVoiceLiveDeployment?: string;

  // Qwen DashScope
  qwenRealtimeWsUrl?: string;
  qwenApiKey?: string;
  qwenModel?: string;
  qwenVoice?: string;
  qwenRegion?: "intl" | "cn";

  // Backend
  backendDispatchUrl?: string;
  backendTimeoutMs: number;
  backendMaxRetries: number;

  // Webhook
  webhookPort: number;
  webhookSecret: string;
  webhookPath: string;
  voiceHubApiKey?: string;
  webhookLegacySecretHeader: boolean;
  webhookShadowMode: boolean;
  corsAllowedOrigins: string[];

  // Memory Bank
  memoryDbPath: string;
  memoryWalEnabled: boolean;
  memoryBusyTimeout: number;

  // Logging
  logLevel: "debug" | "info" | "warn" | "error";
  logFormat: "json" | "pretty";
  logPretty: boolean;

  // Audio
  audioSampleRate: number;
  audioChannels: number;
  audioBitsPerSample: number;
  audioFrameDurationMs: number;
  audioJitterBufferMs: number;

  // Session
  sessionTimeoutMs: number;
  sessionMaxReconnectAttempts: number;
  sessionReconnectDelayMs: number;
  precisionModeDefault: "natural" | "precision";

  // Provider
  voiceProvider:
    | "disabled"
    | "local-mock"
    | "doubao"
    | "openai-realtime"
    | "gemini-live"
    | "hume-evi"
    | "azure-voice-live"
    | "volcengine-realtime"
    | "local-pipeline"
    | "qwen-dashscope";
}

export { configSchema, CONSTANTS };

function writeErrorLine(message: string): void {
  process.stderr.write(`${message}\n`);
}

/**
 * 从环境变量加载配置
 */
export function loadConfig(): Config {
  const rawConfig: Record<string, unknown> = {};

  for (const key in process.env) {
    const value = process.env[key];
    if (value !== undefined) {
      rawConfig[key] = value;
    }
  }

  try {
    // 使用 internalConfigSchema 进行转换
    const parsed = internalConfigSchema.parse(rawConfig);
    return parsed as Config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      writeErrorLine("配置验证失败:");
      for (const issue of error.issues) {
        writeErrorLine(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
    }
    throw new Error("配置验证失败，请检查 .env 文件");
  }
}

/**
 * 验证必需配置
 */
export function validateConfigForProvider(config: Config): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 基础 Discord 配置
  if (!config.discordBotToken) {
    errors.push("DISCORD_BOT_TOKEN 是必需的");
  }
  if (!config.discordGuildId) {
    errors.push("DISCORD_GUILD_ID 是必需的");
  }
  if (!config.discordVoiceChannelId) {
    errors.push("DISCORD_VOICE_CHANNEL_ID 是必需的");
  }

  // Provider 特定配置
  if (config.voiceProvider === "volcengine-realtime") {
    if (!config.volcengineRealtimeWsUrl) {
      errors.push(
        "VOLCENGINE_REALTIME_WS_URL 在使用 volcengine-realtime provider 时是必需的",
      );
    }
    if (!config.volcengineAppId) {
      errors.push(
        "VOLCENGINE_APP_ID 在使用 volcengine-realtime provider 时是必需的",
      );
    }
    if (!config.volcengineAccessToken) {
      errors.push(
        "VOLCENGINE_ACCESS_TOKEN 在使用 volcengine-realtime provider 时是必需的",
      );
    }
  }

  if (config.voiceProvider === "openai-realtime") {
    if (!config.openaiRealtimeWsUrl) {
      errors.push(
        "OPENAI_REALTIME_WS_URL 在使用 openai-realtime provider 时是必需的",
      );
    }
    if (!config.openaiApiKey) {
      errors.push("OPENAI_API_KEY 在使用 openai-realtime provider 时是必需的");
    }
  }

  if (config.voiceProvider === "gemini-live") {
    if (!config.geminiLiveWsUrl) {
      errors.push("GEMINI_LIVE_WS_URL 在使用 gemini-live provider 时是必需的");
    }
    if (!config.geminiApiKey) {
      errors.push("GEMINI_API_KEY 在使用 gemini-live provider 时是必需的");
    }
  }

  if (config.voiceProvider === "hume-evi") {
    if (!config.humeEviWsUrl) {
      errors.push("HUME_EVI_WS_URL 在使用 hume-evi provider 时是必需的");
    }
    if (!config.humeApiKey) {
      errors.push("HUME_API_KEY 在使用 hume-evi provider 时是必需的");
    }
  }

  if (config.voiceProvider === "azure-voice-live") {
    if (!config.azureVoiceLiveWsUrl) {
      errors.push(
        "AZURE_VOICE_LIVE_WS_URL 在使用 azure-voice-live provider 时是必需的",
      );
    }
    if (!config.azureVoiceLiveApiKey) {
      errors.push(
        "AZURE_VOICE_LIVE_API_KEY 在使用 azure-voice-live provider 时是必需的",
      );
    }
  }

  if (config.voiceProvider === "qwen-dashscope") {
    if (!config.qwenRealtimeWsUrl) {
      errors.push(
        "QWEN_REALTIME_WS_URL 在使用 qwen-dashscope provider 时是必需的",
      );
    }
    if (!config.qwenApiKey) {
      errors.push("QWEN_API_KEY 在使用 qwen-dashscope provider 时是必需的");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export * from "./schema.js";
export * from "./constants.js";
