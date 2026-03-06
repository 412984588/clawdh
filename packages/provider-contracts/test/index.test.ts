import { describe, expect, it } from "vitest";
import { BaseRealtimeVoiceProvider } from "../src/index.ts";

class TestProvider extends BaseRealtimeVoiceProvider {
  constructor() {
    super("test-provider");
  }

  getCapabilities() {
    return {
      transport: "local" as const,
      nativeFullDuplex: true,
      bargeIn: true,
      toolCalling: true,
      manualToolResponse: true,
      transcriptPartial: true,
      transcriptFinal: true,
      providerStates: ["idle"],
      textReasoningInjection: true,
      textAnnouncement: true,
      serverVAD: true,
      semanticVAD: true,
      serverEchoCancellation: false,
      inputAudioFormats: ["pcm16"] as const,
      outputAudioFormats: ["pcm16"] as const,
      authModes: ["none"] as const,
      runtimeSupport: "server" as const,
    };
  }
}

describe("provider contracts", () => {
  it("emits canonical provider events", async () => {
    const provider = new TestProvider();
    const seen: string[] = [];

    provider.on("*", (event) => {
      seen.push(event.type);
    });

    await provider.connect({
      sessionId: "s1",
      providerId: "test-provider",
      sampleRate: 16000,
      channels: 1,
    });

    expect(provider.getState().connected).toBe(true);
    expect(seen).toContain("SESSION_CREATED");
  });
});
