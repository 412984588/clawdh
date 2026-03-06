import { describe, expect, it } from "vitest";
import { homedir } from "node:os";
import { join } from "node:path";
import { configSchema, internalConfigSchema } from "../src/schema.js";

const minimalEnv = {
  DISCORD_BOT_TOKEN: "token",
  DISCORD_GUILD_ID: "guild",
  DISCORD_VOICE_CHANNEL_ID: "voice",
};

describe("config schema boolean parsing", () => {
  it('parses "false" and "0" as false', () => {
    const parsed = configSchema.parse({
      ...minimalEnv,
      MEMORY_WAL_ENABLED: "false",
      LOG_PRETTY: "0",
      WEBHOOK_LEGACY_SECRET_HEADER: "false",
      WEBHOOK_SHADOW_MODE: "0",
    });

    expect(parsed.MEMORY_WAL_ENABLED).toBe(false);
    expect(parsed.LOG_PRETTY).toBe(false);
    expect(parsed.WEBHOOK_LEGACY_SECRET_HEADER).toBe(false);
    expect(parsed.WEBHOOK_SHADOW_MODE).toBe(false);
  });

  it("parses enabled values as true", () => {
    const parsed = configSchema.parse({
      ...minimalEnv,
      MEMORY_WAL_ENABLED: "true",
      LOG_PRETTY: "1",
      WEBHOOK_LEGACY_SECRET_HEADER: "yes",
      WEBHOOK_SHADOW_MODE: "on",
    });

    expect(parsed.MEMORY_WAL_ENABLED).toBe(true);
    expect(parsed.LOG_PRETTY).toBe(true);
    expect(parsed.WEBHOOK_LEGACY_SECRET_HEADER).toBe(true);
    expect(parsed.WEBHOOK_SHADOW_MODE).toBe(true);
  });

  it("rejects invalid boolean strings", () => {
    expect(() =>
      configSchema.parse({
        ...minimalEnv,
        MEMORY_WAL_ENABLED: "maybe",
      }),
    ).toThrow();
  });
});

describe("internal config transform", () => {
  it("splits CORS allowlist by comma", () => {
    const parsed = internalConfigSchema.parse({
      ...minimalEnv,
      CORS_ALLOWED_ORIGINS: "https://a.example.com, https://b.example.com",
    });

    expect(parsed.corsAllowedOrigins).toEqual([
      "https://a.example.com",
      "https://b.example.com",
    ]);
  });

  it("uses the default app-data memory db path when MEMORY_DB_PATH is omitted", () => {
    const parsed = internalConfigSchema.parse(minimalEnv);

    expect(parsed.memoryDbPath).toBe(
      join(homedir(), ".voice-hub", "voice-hub.db"),
    );
  });

  it("defaults webhook path to the OpenClaw callback route", () => {
    const parsed = internalConfigSchema.parse(minimalEnv);

    expect(parsed.webhookPath).toBe("/webhook/openclaw_callback");
  });

  it("treats blank optional provider fields as omitted values", () => {
    const parsed = internalConfigSchema.parse({
      ...minimalEnv,
      DOUBAO_REALTIME_WS_URL: "",
      DOUBAO_APP_ID: "",
      DOUBAO_ACCESS_TOKEN: "",
      VOLCENGINE_REALTIME_WS_URL: "",
      VOLCENGINE_APP_ID: "",
      VOLCENGINE_ACCESS_TOKEN: "",
      OPENAI_REALTIME_WS_URL: "",
      OPENAI_API_KEY: "",
      GEMINI_LIVE_WS_URL: "",
      GEMINI_API_KEY: "",
      HUME_EVI_WS_URL: "",
      HUME_API_KEY: "",
      HUME_CONFIG_ID: "",
      AZURE_VOICE_LIVE_WS_URL: "",
      AZURE_VOICE_LIVE_API_KEY: "",
      AZURE_VOICE_LIVE_DEPLOYMENT: "",
      QWEN_API_KEY: "",
      QWEN_VOICE: "",
      BACKEND_DISPATCH_URL: "",
      VOICE_HUB_API_KEY: "",
      MEMORY_DB_PATH: "",
    });

    expect(parsed.doubaoRealtimeWsUrl).toBeUndefined();
    expect(parsed.doubaoAppId).toBeUndefined();
    expect(parsed.doubaoAccessToken).toBeUndefined();
    expect(parsed.volcengineRealtimeWsUrl).toBeUndefined();
    expect(parsed.volcengineAppId).toBeUndefined();
    expect(parsed.volcengineAccessToken).toBeUndefined();
    expect(parsed.openaiRealtimeWsUrl).toBeUndefined();
    expect(parsed.openaiApiKey).toBeUndefined();
    expect(parsed.geminiLiveWsUrl).toBeUndefined();
    expect(parsed.geminiApiKey).toBeUndefined();
    expect(parsed.humeEviWsUrl).toBeUndefined();
    expect(parsed.humeApiKey).toBeUndefined();
    expect(parsed.humeConfigId).toBeUndefined();
    expect(parsed.azureVoiceLiveWsUrl).toBeUndefined();
    expect(parsed.azureVoiceLiveApiKey).toBeUndefined();
    expect(parsed.azureVoiceLiveDeployment).toBeUndefined();
    expect(parsed.qwenApiKey).toBeUndefined();
    expect(parsed.qwenVoice).toBeUndefined();
    expect(parsed.backendDispatchUrl).toBeUndefined();
    expect(parsed.voiceHubApiKey).toBeUndefined();
    expect(parsed.memoryDbPath).toBe(
      join(homedir(), ".voice-hub", "voice-hub.db"),
    );
  });
});
