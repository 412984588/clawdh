import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type { ProviderCapabilities } from "@voice-hub/shared-types";

export interface GeminiLiveConfig {
  url: string;
  apiKey: string;
  model?: string;
}

export class GeminiLiveProvider extends BaseRealtimeVoiceProvider {
  constructor(private readonly config: GeminiLiveConfig) {
    super("gemini-live");
  }

  getCapabilities(): ProviderCapabilities {
    return {
      transport: "websocket",
      nativeFullDuplex: true,
      bargeIn: true,
      toolCalling: false,
      manualToolResponse: true,
      transcriptPartial: true,
      transcriptFinal: true,
      providerStates: [
        "idle",
        "connecting",
        "ready",
        "streaming",
        "closed",
        "error",
      ],
      textReasoningInjection: true,
      textAnnouncement: true,
      serverVAD: true,
      semanticVAD: true,
      serverEchoCancellation: false,
      inputAudioFormats: ["pcm16", "linear16"],
      outputAudioFormats: ["pcm16", "linear16"],
      authModes: ["api-key", "bearer"],
      sessionTTL: 900,
      maxConcurrentSessionsHint: 8,
      runtimeSupport: "server-or-browser",
    };
  }

  override async connect(
    sessionConfig: Parameters<BaseRealtimeVoiceProvider["connect"]>[0],
  ): Promise<void> {
    if (!this.config.url || !this.config.apiKey) {
      throw new Error("Gemini Live provider requires url and apiKey");
    }
    await super.connect(sessionConfig);
    this.emitProviderEvent("DEBUG_PROTOCOL", {
      url: this.config.url,
      model: this.config.model,
      note: "TODO(protocol-confirmation): verify Gemini Live setup message format",
    });
  }
}

export function createGeminiLiveProvider(
  config: GeminiLiveConfig,
): GeminiLiveProvider {
  return new GeminiLiveProvider(config);
}
