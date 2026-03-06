import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type { ProviderCapabilities } from "@voice-hub/shared-types";

export interface VolcengineRealtimeConfig {
  url: string;
  appId: string;
  accessToken: string;
}

export class VolcengineRealtimeProvider extends BaseRealtimeVoiceProvider {
  constructor(private readonly config: VolcengineRealtimeConfig) {
    super("volcengine-realtime");
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
      serverEchoCancellation: false,
      inputAudioFormats: ["pcm16", "linear16", "opus"],
      outputAudioFormats: ["pcm16", "linear16", "opus"],
      authModes: ["bearer", "api-key"],
      sessionTTL: 900,
      maxConcurrentSessionsHint: 8,
      runtimeSupport: "server",
    };
  }

  override async connect(
    sessionConfig: Parameters<BaseRealtimeVoiceProvider["connect"]>[0],
  ): Promise<void> {
    if (!this.config.url || !this.config.appId || !this.config.accessToken) {
      throw new Error(
        "Volcengine realtime provider requires url, appId, and accessToken",
      );
    }
    await super.connect(sessionConfig);
    this.emitProviderEvent("DEBUG_PROTOCOL", {
      url: this.config.url,
      note: "TODO(protocol-confirmation): verify Volcengine realtime handshake fields",
    });
  }
}

export function createVolcengineRealtimeProvider(
  config: VolcengineRealtimeConfig,
): VolcengineRealtimeProvider {
  return new VolcengineRealtimeProvider(config);
}
