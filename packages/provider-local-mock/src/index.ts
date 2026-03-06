import { BaseRealtimeVoiceProvider } from "@voice-hub/provider-contracts";
import type {
  NormalizedAudioFrame,
  ProviderCapabilities,
} from "@voice-hub/shared-types";

export class LocalMockRealtimeProvider extends BaseRealtimeVoiceProvider {
  private frameSequence = 0;

  constructor() {
    super("local-mock");
  }

  getCapabilities(): ProviderCapabilities {
    return {
      transport: "local",
      nativeFullDuplex: true,
      bargeIn: true,
      toolCalling: true,
      manualToolResponse: true,
      transcriptPartial: true,
      transcriptFinal: true,
      providerStates: ["idle", "ready", "streaming", "interrupted", "closed"],
      textReasoningInjection: true,
      textAnnouncement: true,
      serverVAD: true,
      semanticVAD: true,
      serverEchoCancellation: false,
      inputAudioFormats: ["pcm16", "linear16"],
      outputAudioFormats: ["pcm16", "linear16"],
      authModes: ["none"],
      sessionTTL: undefined,
      maxConcurrentSessionsHint: 32,
      runtimeSupport: "server-or-browser",
    };
  }

  override async sendAudio(frame: NormalizedAudioFrame): Promise<void> {
    await super.sendAudio(frame);
    this.emitProviderEvent("TRANSCRIPT_PARTIAL", {
      sequence: this.frameSequence++,
      sampleRate: frame.sampleRate,
    });
    this.emitProviderEvent("MODEL_AUDIO_CHUNK", {
      sampleCount: frame.data.length,
    });
  }
}

export function createLocalMockProvider(): LocalMockRealtimeProvider {
  return new LocalMockRealtimeProvider();
}
