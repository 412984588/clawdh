import { randomUUID } from "node:crypto";
import { EventEmitter } from "eventemitter3";
import type {
  AnnouncementPriority,
  ProviderCapabilities,
  ProviderEventType,
  ProviderSessionConfig,
  ProviderToolDefinition,
  RealtimeProviderEvent,
  RealtimeVoiceProvider,
  RealtimeVoiceProviderEventHandler,
  RealtimeVoiceProviderState,
  NormalizedAudioFrame,
} from "@voice-hub/shared-types";

export type { RealtimeVoiceProvider };
export type ProviderEvent = RealtimeProviderEvent;
export type ProviderFactory = () => RealtimeVoiceProvider;

export interface RealtimeTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(payload: string | Buffer | Uint8Array): Promise<void>;
}

export abstract class BaseRealtimeVoiceProvider implements RealtimeVoiceProvider {
  readonly id: string;
  protected sessionConfig: ProviderSessionConfig | null = null;
  protected readonly events = new EventEmitter();
  protected state: RealtimeVoiceProviderState = {
    status: "idle",
    connected: false,
    streaming: false,
  };

  protected constructor(id: string) {
    this.id = id;
  }

  abstract getCapabilities(): ProviderCapabilities;

  async connect(sessionConfig: ProviderSessionConfig): Promise<void> {
    this.sessionConfig = sessionConfig;
    this.state = {
      ...this.state,
      status: "ready",
      connected: true,
      connectedAt: Date.now(),
    };
    this.emitProviderEvent("SESSION_CREATED", {
      precisionMode: sessionConfig.precisionMode ?? "natural",
    });
  }

  async disconnect(): Promise<void> {
    this.state = {
      ...this.state,
      status: "closed",
      connected: false,
      streaming: false,
    };
    this.emitProviderEvent("SESSION_CLOSED");
  }

  async sendAudio(_frame: NormalizedAudioFrame): Promise<void> {
    this.state = { ...this.state, streaming: true };
  }

  async interrupt(reason?: string): Promise<void> {
    this.state = { ...this.state, streaming: false, status: "interrupted" };
    this.emitProviderEvent("PROVIDER_STATE_CHANGED", { reason });
  }

  async updateTools(toolDefinitions: ProviderToolDefinition[]): Promise<void> {
    this.emitProviderEvent("SESSION_UPDATED", {
      toolCount: toolDefinitions.length,
    });
  }

  async injectTextForReasoning(
    text: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    this.emitProviderEvent("MODEL_TEXT_FINAL", {
      mode: "reasoning",
      text,
      metadata,
    });
  }

  async injectTextForAnnouncement(
    text: string,
    priority: AnnouncementPriority,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    this.emitProviderEvent("MODEL_TEXT_FINAL", {
      mode: "announcement",
      priority,
      text,
      metadata,
    });
  }

  async queueAnnouncement(
    text: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    this.emitProviderEvent("TASK_STATUS", {
      mode: "queued-announcement",
      text,
      metadata,
    });
  }

  getState(): RealtimeVoiceProviderState {
    return { ...this.state };
  }

  on(
    event: ProviderEventType | "*",
    handler: RealtimeVoiceProviderEventHandler,
  ): void {
    this.events.on(event, handler);
  }

  off(
    event: ProviderEventType | "*",
    handler: RealtimeVoiceProviderEventHandler,
  ): void {
    this.events.off(event, handler);
  }

  protected emitProviderEvent(
    type: ProviderEventType,
    data?: Record<string, unknown>,
    rawEventName?: string,
  ): void {
    const event: RealtimeProviderEvent = {
      type,
      providerId: this.id,
      eventId: randomUUID(),
      timestamp: Date.now(),
      sessionId: this.sessionConfig?.sessionId,
      data,
      rawEventName,
    };
    this.events.emit(type, event);
    this.events.emit("*", event);
  }

  protected emitUnsupported(feature: string): void {
    this.emitProviderEvent("ERROR", {
      code: "UNSUPPORTED_FEATURE",
      message: `${this.id} does not support ${feature}`,
    });
  }
}
