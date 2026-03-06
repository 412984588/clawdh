import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type { ProviderCapabilities } from "@voice-hub/shared-types";

export interface HumeEviConfig {
  url: string;
  apiKey: string;
  configId?: string;
}

export class HumeEviProvider extends BaseRealtimeVoiceProvider {
  constructor(private readonly config: HumeEviConfig) {
    super("hume-evi");
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
      textReasoningInjection: false,
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
      throw new Error("Hume EVI provider requires url and apiKey");
    }
    await super.connect(sessionConfig);
    this.emitProviderEvent("DEBUG_PROTOCOL", {
      url: this.config.url,
      configId: this.config.configId,
      note: "TODO(protocol-confirmation): verify Hume EVI subscribe/session fields",
    });
  }
}

export function createHumeEviProvider(config: HumeEviConfig): HumeEviProvider {
  return new HumeEviProvider(config);
}
