import type { NormalizedAudioFrame, AudioEncoding } from "./audio.js";

export type ProviderTransport = "websocket" | "webrtc" | "sip" | "local";

export type ProviderAuthMode =
  | "none"
  | "api-key"
  | "bearer"
  | "azure-key"
  | "session-token"
  | "signed-url";

export type AnnouncementPriority =
  | "immediate"
  | "after-current-turn"
  | "queued";

export type PrecisionMode = "natural" | "precision";

export type ProviderRuntimeSupport = "server" | "browser" | "server-or-browser";

export type ProviderEventType =
  | "SESSION_CREATED"
  | "SESSION_UPDATED"
  | "SESSION_CLOSED"
  | "USER_SPEECH_STARTED"
  | "USER_SPEECH_STOPPED"
  | "TRANSCRIPT_PARTIAL"
  | "TRANSCRIPT_FINAL"
  | "MODEL_AUDIO_CHUNK"
  | "MODEL_TEXT_CHUNK"
  | "MODEL_TEXT_FINAL"
  | "TOOL_CALL"
  | "TOOL_CANCEL"
  | "TOOL_RESULT_REQUIRED"
  | "PROVIDER_STATE_CHANGED"
  | "TASK_STATUS"
  | "ERROR"
  | "HEARTBEAT"
  | "DEBUG_PROTOCOL";

export interface ProviderCapabilities {
  transport: ProviderTransport;
  nativeFullDuplex: boolean;
  bargeIn: boolean;
  toolCalling: boolean;
  manualToolResponse: boolean;
  transcriptPartial: boolean;
  transcriptFinal: boolean;
  providerStates: string[];
  textReasoningInjection: boolean;
  textAnnouncement: boolean;
  serverVAD: boolean;
  semanticVAD: boolean;
  serverEchoCancellation: boolean;
  inputAudioFormats: AudioEncoding[];
  outputAudioFormats: AudioEncoding[];
  authModes: ProviderAuthMode[];
  sessionTTL?: number;
  maxConcurrentSessionsHint?: number;
  runtimeSupport: ProviderRuntimeSupport;
}

export interface ProviderSessionConfig {
  sessionId: string;
  providerId: string;
  conversationId?: string;
  guildId?: string;
  voiceChannelId?: string;
  discordUserId?: string;
  precisionMode?: PrecisionMode;
  sampleRate: number;
  channels: number;
  metadata?: Record<string, unknown>;
}

export interface ProviderToolDefinition {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

export interface RealtimeProviderEvent {
  type: ProviderEventType;
  providerId: string;
  eventId: string;
  timestamp: number;
  sessionId?: string;
  data?: Record<string, unknown>;
  rawEventName?: string;
}

export interface ProviderSelectionScope {
  workspaceId?: string;
  guildId?: string;
  voiceChannelId?: string;
  discordUserId?: string;
}

export interface CapabilityNegotiationResult {
  providerId: string;
  requested: Partial<ProviderCapabilities>;
  effective: ProviderCapabilities;
  fallbacks: string[];
  unsupported: string[];
}

export interface RealtimeVoiceProviderState {
  status: string;
  connected: boolean;
  streaming: boolean;
  lastError?: string;
  connectedAt?: number;
}

export type RealtimeVoiceProviderEventHandler = (
  event: RealtimeProviderEvent,
) => void | Promise<void>;

export interface RealtimeVoiceProvider {
  id: string;
  connect(sessionConfig: ProviderSessionConfig): Promise<void>;
  disconnect(): Promise<void>;
  sendAudio(frame: NormalizedAudioFrame): Promise<void>;
  interrupt(reason?: string): Promise<void>;
  updateTools(toolDefinitions: ProviderToolDefinition[]): Promise<void>;
  injectTextForReasoning(
    text: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  injectTextForAnnouncement(
    text: string,
    priority: AnnouncementPriority,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  queueAnnouncement(
    text: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  getCapabilities(): ProviderCapabilities;
  getState(): RealtimeVoiceProviderState;
  on(
    event: ProviderEventType | "*",
    handler: RealtimeVoiceProviderEventHandler,
  ): void;
  off(
    event: ProviderEventType | "*",
    handler: RealtimeVoiceProviderEventHandler,
  ): void;
}
