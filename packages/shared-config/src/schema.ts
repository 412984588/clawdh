/**
 * Zod 配置验证 Schema
 */

import { z } from "zod";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_CORS_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
] as const;

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", ""]);
const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const envBoolean = (defaultValue: boolean) =>
  z
    .preprocess((value) => {
      if (typeof value === "boolean") {
        return value;
      }

      if (typeof value === "number") {
        if (value === 1) {
          return true;
        }
        if (value === 0) {
          return false;
        }
        return value;
      }

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (TRUE_VALUES.has(normalized)) {
          return true;
        }
        if (FALSE_VALUES.has(normalized)) {
          return false;
        }
      }

      return value;
    }, z.boolean())
    .default(defaultValue);

const optionalString = () =>
  z.preprocess(emptyStringToUndefined, z.string().min(1).optional());

const optionalUrl = () =>
  z.preprocess(emptyStringToUndefined, z.string().url().optional());

function resolveDefaultMemoryDbPath(): string {
  const home = homedir();
  return join(home, ".voice-hub", "voice-hub.db");
}

/**
 * 环境变量 Schema
 * 所有配置项都从环境变量读取
 */
export const configSchema = z.object({
  // Discord Configuration
  DISCORD_BOT_TOKEN: z.string().min(1, "DISCORD_BOT_TOKEN 不能为空"),
  DISCORD_GUILD_ID: z.string().min(1, "DISCORD_GUILD_ID 不能为空"),
  DISCORD_VOICE_CHANNEL_ID: z
    .string()
    .min(1, "DISCORD_VOICE_CHANNEL_ID 不能为空"),
  DISCORD_CLIENT_ID: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1, "DISCORD_CLIENT_ID 不能为空").optional(),
  ),

  // Doubao Realtime Voice
  DOUBAO_REALTIME_WS_URL: optionalUrl(),
  DOUBAO_APP_ID: optionalString(),
  DOUBAO_ACCESS_TOKEN: optionalString(),

  // Volcengine Realtime Voice
  VOLCENGINE_REALTIME_WS_URL: optionalUrl(),
  VOLCENGINE_APP_ID: optionalString(),
  VOLCENGINE_ACCESS_TOKEN: optionalString(),

  // OpenAI Realtime
  OPENAI_REALTIME_WS_URL: optionalUrl(),
  OPENAI_API_KEY: optionalString(),
  OPENAI_REALTIME_MODEL: z.string().min(1).default("gpt-4o-realtime-preview"),

  // Gemini Live
  GEMINI_LIVE_WS_URL: optionalUrl(),
  GEMINI_API_KEY: optionalString(),
  GEMINI_LIVE_MODEL: z.string().min(1).default("gemini-live-2.5-flash-preview"),

  // Hume EVI
  HUME_EVI_WS_URL: optionalUrl(),
  HUME_API_KEY: optionalString(),
  HUME_CONFIG_ID: optionalString(),

  // Azure Voice Live
  AZURE_VOICE_LIVE_WS_URL: optionalUrl(),
  AZURE_VOICE_LIVE_API_KEY: optionalString(),
  AZURE_VOICE_LIVE_DEPLOYMENT: optionalString(),

  // Qwen Realtime Voice (DashScope)
  QWEN_REALTIME_WS_URL: z
    .string()
    .url()
    .default("wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime"),
  QWEN_API_KEY: optionalString(),
  QWEN_MODEL: z.string().min(1).default("qwen3-omni-flash-realtime"),
  QWEN_VOICE: optionalString(),
  QWEN_REGION: z.enum(["intl", "cn"]).default("intl"),

  // Backend Dispatcher
  BACKEND_DISPATCH_URL: optionalUrl(),
  BACKEND_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  BACKEND_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),

  // Webhook Server
  WEBHOOK_PORT: z.coerce.number().int().positive().max(65535).default(8911),
  WEBHOOK_SECRET: z.string().min(16).default("change-me-in-production"),
  WEBHOOK_PATH: z.string().default("/webhook/openclaw_callback"),
  VOICE_HUB_API_KEY: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).optional(),
  ),
  WEBHOOK_LEGACY_SECRET_HEADER: envBoolean(false),
  WEBHOOK_SHADOW_MODE: envBoolean(false),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default(DEFAULT_CORS_ALLOWED_ORIGINS.join(",")),

  // Memory Bank
  MEMORY_DB_PATH: z.preprocess(emptyStringToUndefined, z.string().optional()),
  MEMORY_WAL_ENABLED: envBoolean(true),
  MEMORY_BUSY_TIMEOUT: z.coerce.number().int().positive().default(5000),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("json"),
  LOG_PRETTY: envBoolean(false),

  // Audio Configuration
  AUDIO_SAMPLE_RATE: z.coerce.number().int().positive().default(16000),
  AUDIO_CHANNELS: z.coerce.number().int().min(1).max(2).default(1),
  AUDIO_BITS_PER_SAMPLE: z.coerce.number().int().default(16),
  AUDIO_FRAME_DURATION_MS: z.coerce.number().int().positive().default(100),
  AUDIO_JITTER_BUFFER_MS: z.coerce.number().int().positive().default(200),

  // Session Management
  SESSION_TIMEOUT_MS: z.coerce.number().int().positive().default(300000),
  SESSION_MAX_RECONNECT_ATTEMPTS: z.coerce
    .number()
    .int()
    .min(0)
    .max(20)
    .default(5),
  SESSION_RECONNECT_DELAY_MS: z.coerce.number().int().positive().default(2000),
  PRECISION_MODE_DEFAULT: z.enum(["natural", "precision"]).default("natural"),

  // Provider Selection
  VOICE_PROVIDER: z
    .enum([
      "disabled",
      "local-mock",
      "doubao",
      "volcengine-realtime",
      "openai-realtime",
      "gemini-live",
      "hume-evi",
      "azure-voice-live",
      "local-pipeline",
      "qwen-dashscope",
    ])
    .default("disabled"),
});

/**
 * 转换为内部配置格式
 */
export const internalConfigSchema = configSchema.transform((raw) => ({
  discordBotToken: raw.DISCORD_BOT_TOKEN,
  discordGuildId: raw.DISCORD_GUILD_ID,
  discordVoiceChannelId: raw.DISCORD_VOICE_CHANNEL_ID,
  discordClientId: raw.DISCORD_CLIENT_ID || "",

  doubaoRealtimeWsUrl: raw.DOUBAO_REALTIME_WS_URL,
  doubaoAppId: raw.DOUBAO_APP_ID,
  doubaoAccessToken: raw.DOUBAO_ACCESS_TOKEN,

  volcengineRealtimeWsUrl:
    raw.VOLCENGINE_REALTIME_WS_URL ?? raw.DOUBAO_REALTIME_WS_URL,
  volcengineAppId: raw.VOLCENGINE_APP_ID ?? raw.DOUBAO_APP_ID,
  volcengineAccessToken: raw.VOLCENGINE_ACCESS_TOKEN ?? raw.DOUBAO_ACCESS_TOKEN,

  openaiRealtimeWsUrl: raw.OPENAI_REALTIME_WS_URL,
  openaiApiKey: raw.OPENAI_API_KEY,
  openaiRealtimeModel: raw.OPENAI_REALTIME_MODEL,

  geminiLiveWsUrl: raw.GEMINI_LIVE_WS_URL,
  geminiApiKey: raw.GEMINI_API_KEY,
  geminiLiveModel: raw.GEMINI_LIVE_MODEL,

  humeEviWsUrl: raw.HUME_EVI_WS_URL,
  humeApiKey: raw.HUME_API_KEY,
  humeConfigId: raw.HUME_CONFIG_ID,

  azureVoiceLiveWsUrl: raw.AZURE_VOICE_LIVE_WS_URL,
  azureVoiceLiveApiKey: raw.AZURE_VOICE_LIVE_API_KEY,
  azureVoiceLiveDeployment: raw.AZURE_VOICE_LIVE_DEPLOYMENT,

  qwenRealtimeWsUrl: raw.QWEN_REALTIME_WS_URL,
  qwenApiKey: raw.QWEN_API_KEY,
  qwenModel: raw.QWEN_MODEL,
  qwenVoice: raw.QWEN_VOICE,
  qwenRegion: raw.QWEN_REGION,

  backendDispatchUrl: raw.BACKEND_DISPATCH_URL,
  backendTimeoutMs: raw.BACKEND_TIMEOUT_MS,
  backendMaxRetries: raw.BACKEND_MAX_RETRIES,

  webhookPort: raw.WEBHOOK_PORT,
  webhookSecret: raw.WEBHOOK_SECRET,
  webhookPath: raw.WEBHOOK_PATH,
  voiceHubApiKey: raw.VOICE_HUB_API_KEY,
  webhookLegacySecretHeader: raw.WEBHOOK_LEGACY_SECRET_HEADER,
  webhookShadowMode: raw.WEBHOOK_SHADOW_MODE,
  corsAllowedOrigins: raw.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),

  memoryDbPath: raw.MEMORY_DB_PATH ?? resolveDefaultMemoryDbPath(),
  memoryWalEnabled: raw.MEMORY_WAL_ENABLED,
  memoryBusyTimeout: raw.MEMORY_BUSY_TIMEOUT,

  logLevel: raw.LOG_LEVEL,
  logFormat: raw.LOG_FORMAT,
  logPretty: raw.LOG_PRETTY,

  audioSampleRate: raw.AUDIO_SAMPLE_RATE,
  audioChannels: raw.AUDIO_CHANNELS,
  audioBitsPerSample: raw.AUDIO_BITS_PER_SAMPLE,
  audioFrameDurationMs: raw.AUDIO_FRAME_DURATION_MS,
  audioJitterBufferMs: raw.AUDIO_JITTER_BUFFER_MS,

  sessionTimeoutMs: raw.SESSION_TIMEOUT_MS,
  sessionMaxReconnectAttempts: raw.SESSION_MAX_RECONNECT_ATTEMPTS,
  sessionReconnectDelayMs: raw.SESSION_RECONNECT_DELAY_MS,
  precisionModeDefault: raw.PRECISION_MODE_DEFAULT,

  voiceProvider:
    raw.VOICE_PROVIDER === "doubao"
      ? "volcengine-realtime"
      : raw.VOICE_PROVIDER,
}));

export type InternalConfig = z.infer<typeof internalConfigSchema>;
