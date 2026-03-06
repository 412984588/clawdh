import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type { ProviderCapabilities } from "@voice-hub/shared-types";

export class LocalPipelineProvider extends BaseRealtimeVoiceProvider {
  constructor() {
    super("local-pipeline");
  }

  getCapabilities(): ProviderCapabilities {
    return {
      transport: "local",
      nativeFullDuplex: false,
      bargeIn: false,
      toolCalling: true,
      manualToolResponse: true,
      transcriptPartial: false,
      transcriptFinal: true,
      providerStates: ["idle", "ready", "closed"],
      textReasoningInjection: true,
      textAnnouncement: false,
      serverVAD: false,
      semanticVAD: false,
      serverEchoCancellation: false,
      inputAudioFormats: ["pcm16", "linear16"],
      outputAudioFormats: ["pcm16", "linear16"],
      authModes: ["none"],
      sessionTTL: undefined,
      maxConcurrentSessionsHint: 1,
      runtimeSupport: "server",
    };
  }

  override async injectTextForAnnouncement(): Promise<void> {
    this.emitUnsupported("textAnnouncement");
  }
}

export function createLocalPipelineProvider(): LocalPipelineProvider {
  return new LocalPipelineProvider();
}
