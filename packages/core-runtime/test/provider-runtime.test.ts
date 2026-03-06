import { describe, expect, it, vi } from "vitest";
import type { Config } from "@voice-hub/shared-config";
import type {
  NormalizedAudioFrame,
  ProviderCapabilities,
  ProviderEvent,
  ProviderSessionConfig,
  ProviderToolDefinition,
  RealtimeVoiceProvider,
  RealtimeVoiceProviderState,
} from "@voice-hub/shared-types";
import { ProviderRegistry } from "@voice-hub/provider-registry";
import { VoiceRuntime } from "../src/voice-runtime.js";

class MockRealtimeProvider implements RealtimeVoiceProvider {
  id = "local-mock";
  connect = vi.fn(async (_sessionConfig: ProviderSessionConfig) => undefined);
  disconnect = vi.fn(async () => undefined);
  sendAudio = vi.fn(async (_frame: NormalizedAudioFrame) => undefined);
  interrupt = vi.fn(async (_reason?: string) => undefined);
  updateTools = vi.fn(
    async (_toolDefinitions: ProviderToolDefinition[]) => undefined,
  );
  injectTextForReasoning = vi.fn(async (_text: string) => undefined);
  injectTextForAnnouncement = vi.fn(async (_text: string) => undefined);
  queueAnnouncement = vi.fn(async (_text: string) => undefined);
  on = vi.fn(
    (_event: string, _handler: (event: ProviderEvent) => void) => undefined,
  );
  off = vi.fn(
    (_event: string, _handler: (event: ProviderEvent) => void) => undefined,
  );

  getCapabilities(): ProviderCapabilities {
    return {
      transport: "local",
      nativeFullDuplex: true,
      bargeIn: true,
      toolCalling: true,
      manualToolResponse: true,
      transcriptPartial: true,
      transcriptFinal: true,
      providerStates: ["idle", "ready", "streaming"],
      textReasoningInjection: true,
      textAnnouncement: true,
      serverVAD: true,
      semanticVAD: true,
      serverEchoCancellation: false,
      inputAudioFormats: ["pcm16"],
      outputAudioFormats: ["pcm16"],
      authModes: ["none"],
      runtimeSupport: "server",
    };
  }

  getState(): RealtimeVoiceProviderState {
    return {
      status: "ready",
      connected: true,
      streaming: true,
    };
  }
}

function createConfig(): Config {
  return {
    discordBotToken: "token",
    discordGuildId: "guild",
    discordVoiceChannelId: "voice",
    discordClientId: "client",
    doubaoRealtimeWsUrl: undefined,
    doubaoAppId: undefined,
    doubaoAccessToken: undefined,
    volcengineRealtimeWsUrl: undefined,
    volcengineAppId: undefined,
    volcengineAccessToken: undefined,
    openaiRealtimeWsUrl: undefined,
    openaiApiKey: undefined,
    openaiRealtimeModel: "gpt-4o-realtime-preview",
    geminiLiveWsUrl: undefined,
    geminiApiKey: undefined,
    geminiLiveModel: "gemini-live-2.5-flash-preview",
    humeEviWsUrl: undefined,
    humeApiKey: undefined,
    humeConfigId: undefined,
    azureVoiceLiveWsUrl: undefined,
    azureVoiceLiveApiKey: undefined,
    azureVoiceLiveDeployment: undefined,
    qwenRealtimeWsUrl: undefined,
    qwenApiKey: undefined,
    qwenModel: undefined,
    qwenVoice: undefined,
    qwenRegion: "intl",
    backendDispatchUrl: undefined,
    backendTimeoutMs: 30000,
    backendMaxRetries: 3,
    webhookPort: 8911,
    webhookSecret: "test-webhook-secret",
    webhookPath: "/webhook/callback",
    voiceHubApiKey: undefined,
    webhookLegacySecretHeader: false,
    webhookShadowMode: false,
    corsAllowedOrigins: ["http://localhost:3000"],
    memoryDbPath: "./data/memory_bank.db",
    memoryWalEnabled: true,
    memoryBusyTimeout: 5000,
    logLevel: "info",
    logFormat: "json",
    logPretty: false,
    audioSampleRate: 16000,
    audioChannels: 1,
    audioBitsPerSample: 16,
    audioFrameDurationMs: 20,
    audioJitterBufferMs: 200,
    sessionTimeoutMs: 300000,
    sessionMaxReconnectAttempts: 5,
    sessionReconnectDelayMs: 2000,
    precisionModeDefault: "natural",
    voiceProvider: "local-mock",
  };
}

describe("VoiceRuntime provider registry integration", () => {
  it("creates sessions with a selected provider and routes audio to the session provider", async () => {
    const provider = new MockRealtimeProvider();
    const registry = new ProviderRegistry();
    registry.register({
      id: provider.id,
      create: () => provider,
      capabilities: provider.getCapabilities(),
    });

    const runtime = new VoiceRuntime({
      config: createConfig(),
      providerRegistry: registry,
    });

    const sessionId = await runtime.createSession({
      guildId: "guild-1",
      voiceChannelId: "voice-1",
      discordUserId: "user-1",
    });

    await runtime.startListening(sessionId);
    await runtime.sendAudio(sessionId, {
      data: new Int16Array([1, 2, 3]),
      sampleRate: 16000,
      channels: 1,
      timestamp: Date.now(),
      sequence: 1,
      encoding: "pcm16",
      littleEndian: true,
      source: "discord",
    });

    expect(runtime.getSession(sessionId)?.providerId).toBe("local-mock");
    expect(provider.connect).toHaveBeenCalledTimes(1);
    expect(provider.sendAudio).toHaveBeenCalledTimes(1);
  });

  it("blocks backend dispatch from non-owner users", async () => {
    const provider = new MockRealtimeProvider();
    const registry = new ProviderRegistry();
    registry.register({
      id: provider.id,
      create: () => provider,
      capabilities: provider.getCapabilities(),
    });
    const dispatcher = {
      dispatch: vi.fn(async () => ({
        success: true,
        attempts: 1,
        durationMs: 1,
      })),
    };

    const runtime = new VoiceRuntime({
      config: createConfig(),
      providerRegistry: registry,
      dispatcher: dispatcher as never,
    });

    const sessionId = await runtime.createSession({
      guildId: "guild-1",
      voiceChannelId: "voice-1",
      discordUserId: "owner-1",
    });
    runtime.claimSessionOwner(sessionId, "owner-1");

    await expect(
      runtime.dispatchBackendTask(sessionId, "intruder-1", {
        event: "build",
      }),
    ).rejects.toThrow(/not session owner/i);

    await runtime.dispatchBackendTask(sessionId, "owner-1", {
      event: "build",
    });

    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
  });
});
