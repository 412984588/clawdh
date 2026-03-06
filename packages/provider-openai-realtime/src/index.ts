import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type { ProviderCapabilities } from "@voice-hub/shared-types";

export interface OpenAIRealtimeConfig {
  url: string;
  apiKey: string;
  model?: string;
}

export class OpenAIRealtimeProvider extends BaseRealtimeVoiceProvider {
  constructor(private readonly config: OpenAIRealtimeConfig) {
    super("openai-realtime");
  }

  getCapabilities(): ProviderCapabilities {
    return {
      transport: "websocket",
      nativeFullDuplex: true,
      bargeIn: true,
      toolCalling: true,
      manualToolResponse: true,
      transcriptPartial: true,
      transcriptFinal: true,
      providerStates: [
        "idle",
        "connecting",
        "ready",
        "streaming",
        "interrupted",
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
      authModes: ["bearer"],
      sessionTTL: 900,
      maxConcurrentSessionsHint: 16,
      runtimeSupport: "server",
    };
  }

  override async connect(
    sessionConfig: Parameters<BaseRealtimeVoiceProvider["connect"]>[0],
  ): Promise<void> {
    if (!this.config.url || !this.config.apiKey) {
      throw new Error("OpenAI Realtime provider requires url and apiKey");
    }
    await super.connect(sessionConfig);
    this.emitProviderEvent("DEBUG_PROTOCOL", {
      url: this.config.url,
      model: this.config.model,
      note: "TODO(protocol-confirmation): verify OpenAI Realtime session.update payload structure",
    });
  }
}

export function createOpenAIRealtimeProvider(
  config: OpenAIRealtimeConfig,
): OpenAIRealtimeProvider {
  return new OpenAIRealtimeProvider(config);
}
