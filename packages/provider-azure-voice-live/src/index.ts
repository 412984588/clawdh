import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type { ProviderCapabilities } from "@voice-hub/shared-types";

export interface AzureVoiceLiveConfig {
  url: string;
  apiKey: string;
  deployment?: string;
}

export class AzureVoiceLiveProvider extends BaseRealtimeVoiceProvider {
  constructor(private readonly config: AzureVoiceLiveConfig) {
    super("azure-voice-live");
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
      semanticVAD: false,
      serverEchoCancellation: true,
      inputAudioFormats: ["pcm16", "linear16"],
      outputAudioFormats: ["pcm16", "linear16"],
      authModes: ["azure-key", "bearer"],
      sessionTTL: 900,
      maxConcurrentSessionsHint: 8,
      runtimeSupport: "server",
    };
  }

  override async connect(
    sessionConfig: Parameters<BaseRealtimeVoiceProvider["connect"]>[0],
  ): Promise<void> {
    if (!this.config.url || !this.config.apiKey) {
      throw new Error("Azure Voice Live provider requires url and apiKey");
    }
    await super.connect(sessionConfig);
    this.emitProviderEvent("DEBUG_PROTOCOL", {
      url: this.config.url,
      deployment: this.config.deployment,
      note: "TODO(protocol-confirmation): verify Azure Voice Live auth and session bootstrap fields",
    });
  }
}

export function createAzureVoiceLiveProvider(
  config: AzureVoiceLiveConfig,
): AzureVoiceLiveProvider {
  return new AzureVoiceLiveProvider(config);
}
