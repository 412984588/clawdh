/**
 * @voice-hub/core-runtime
 *
 * Provider-agnostic voice runtime
 */

import type { Config } from "@voice-hub/shared-config";
import type {
  NormalizedAudioFrame,
  RealtimeProviderEvent,
  RealtimeVoiceProvider,
} from "@voice-hub/shared-types";
import { SessionState } from "@voice-hub/shared-types";
import {
  ProviderRegistry,
  ProviderSelectionPolicy,
} from "@voice-hub/provider-registry";
import type { MemoryStore } from "@voice-hub/memory-bank";
import type { Dispatcher } from "@voice-hub/backend-dispatcher";
import type {
  AnnouncementRequest,
  CreateSessionInput,
  RuntimeConfig,
  RuntimeEvent,
  SessionContext,
} from "./types.js";
import { SessionManager } from "./session-manager.js";

export interface VoiceRuntimeOptions {
  config: Config;
  provider?: RealtimeVoiceProvider;
  providerRegistry?: ProviderRegistry;
  memoryStore?: MemoryStore;
  dispatcher?: Dispatcher;
}

export class VoiceRuntime {
  private readonly config: Config;
  private readonly runtimeConfig: RuntimeConfig;
  private readonly provider: RealtimeVoiceProvider | null;
  private readonly providerRegistry: ProviderRegistry | null;
  private readonly selectionPolicy: ProviderSelectionPolicy;
  private readonly memoryStore: MemoryStore | null;
  private readonly dispatcher: Dispatcher | null;
  private readonly sessionManager: SessionManager;
  private isRunning = false;
  private listeners: Map<string, Array<(event: RuntimeEvent) => void>> =
    new Map();

  constructor(options: VoiceRuntimeOptions) {
    this.config = options.config;
    this.provider = options.provider ?? null;
    this.providerRegistry = options.providerRegistry ?? null;
    this.memoryStore = options.memoryStore ?? null;
    this.dispatcher = options.dispatcher ?? null;
    this.selectionPolicy = new ProviderSelectionPolicy(this.config);

    this.runtimeConfig = {
      sessionTimeoutMs: this.config.sessionTimeoutMs,
      maxReconnectAttempts: this.config.sessionMaxReconnectAttempts,
      reconnectDelayMs: this.config.sessionReconnectDelayMs,
      autoSaveAudio: false,
      audioSaveDir: "./audio",
      enableMemoryStore: !!this.memoryStore,
      enableBackendDispatch: !!this.dispatcher,
      precisionModeDefault: this.config.precisionModeDefault,
    };

    this.sessionManager = new SessionManager(
      this.runtimeConfig,
      this.memoryStore || undefined,
      this.dispatcher || undefined,
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.emit("started");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    const sessions = this.sessionManager.getAllSessions();
    for (const session of sessions) {
      const binding = this.sessionManager.getSessionProvider(session.sessionId);
      if (binding) {
        binding.provider.off("*", binding.providerEventListener);
      }
    }
    await this.sessionManager.destroyAllSessions();

    this.isRunning = false;
    this.emit("stopped");
  }

  async createSession(
    inputOrUserId?: CreateSessionInput | string,
    channelId?: string,
  ): Promise<string> {
    const input = this.normalizeCreateSessionInput(inputOrUserId, channelId);
    const providerId =
      input.providerId ??
      this.selectionPolicy.select({
        guildId: input.guildId,
        voiceChannelId: input.voiceChannelId,
        discordUserId: input.discordUserId,
      });

    const sessionId = await this.sessionManager.createSession({
      ...input,
      providerId,
    });
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found after creation: ${sessionId}`);
    }

    const provider = this.createProvider(providerId);
    const providerEventListener = (event: RealtimeProviderEvent): void => {
      this.handleProviderEvent(sessionId, event);
    };

    provider.on("*", providerEventListener);
    await provider.connect({
      sessionId,
      providerId,
      conversationId: session.conversationId,
      guildId: session.guildId,
      voiceChannelId: session.voiceChannelId,
      discordUserId: session.discordUserId,
      precisionMode: session.precisionMode,
      sampleRate: this.config.audioSampleRate,
      channels: this.config.audioChannels,
      metadata: session.agentId ? { agentId: session.agentId } : undefined,
    });

    this.sessionManager.setSessionProvider(sessionId, {
      provider,
      providerEventListener,
    });
    this.sessionManager.setSessionTimeout(sessionId);

    this.emit("session_created", {
      type: "session_created",
      sessionId,
      timestamp: Date.now(),
      data: { providerId },
    });

    return sessionId;
  }

  async destroySession(sessionId: string): Promise<void> {
    const binding = this.sessionManager.getSessionProvider(sessionId);
    if (binding) {
      binding.provider.off("*", binding.providerEventListener);
    }

    await this.sessionManager.destroySession(sessionId);
    this.emit("session_destroyed", {
      type: "session_destroyed",
      sessionId,
      timestamp: Date.now(),
    });
  }

  async sendAudio(
    sessionId: string,
    frame: NormalizedAudioFrame,
  ): Promise<void> {
    const binding = this.requireBinding(sessionId);
    const stateMachine = this.sessionManager.getStateMachine(sessionId);
    if (!stateMachine) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (stateMachine.currentState !== SessionState.LISTENING) {
      return;
    }

    await binding.provider.sendAudio(this.normalizeAudioFrame(frame));
    this.emit("audio_sent", {
      type: "audio_sent",
      sessionId,
      timestamp: Date.now(),
      data: { frameSize: frame.data.length },
    });
  }

  async startListening(sessionId: string): Promise<void> {
    const stateMachine = this.sessionManager.getStateMachine(sessionId);
    if (!stateMachine) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const transitioned = await stateMachine.transitionTo(
      SessionState.LISTENING,
    );
    if (!transitioned) {
      throw new Error(
        `Invalid state transition: ${stateMachine.currentState} -> ${SessionState.LISTENING}`,
      );
    }
    this.sessionManager.clearSessionTimeout(sessionId);
  }

  async stopListening(sessionId: string): Promise<void> {
    const stateMachine = this.sessionManager.getStateMachine(sessionId);
    if (!stateMachine) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const binding = this.requireBinding(sessionId);
    await binding.provider.interrupt("stop_listening");

    const transitioned = await stateMachine.transitionTo(SessionState.IDLE);
    if (!transitioned) {
      throw new Error(
        `Invalid state transition: ${stateMachine.currentState} -> ${SessionState.IDLE}`,
      );
    }
    this.sessionManager.setSessionTimeout(sessionId);
  }

  claimSessionOwner(sessionId: string, ownerUserId: string): void {
    this.sessionManager.claimOwner(sessionId, ownerUserId);
    this.emit("owner_claimed", {
      type: "owner_claimed",
      sessionId,
      timestamp: Date.now(),
      data: { ownerUserId },
    });
  }

  releaseSessionOwner(sessionId: string): void {
    this.sessionManager.releaseOwner(sessionId);
    this.emit("owner_released", {
      type: "owner_released",
      sessionId,
      timestamp: Date.now(),
    });
  }

  adminOverrideSessionOwner(sessionId: string, ownerUserId: string): void {
    this.claimSessionOwner(sessionId, ownerUserId);
  }

  async dispatchBackendTask(
    sessionId: string,
    actorUserId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (!this.dispatcher) {
      return;
    }
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.ownerUserId && session.ownerUserId !== actorUserId) {
      throw new Error(`User ${actorUserId} is not session owner`);
    }

    await this.dispatcher.dispatch({
      ...payload,
      sessionId,
      conversationId: session.conversationId,
      backendJobId: session.backendJobId,
      providerId: session.providerId,
      actorUserId,
    } as never);

    this.emit("backend_task_dispatched", {
      type: "backend_task_dispatched",
      sessionId,
      timestamp: Date.now(),
      data: { actorUserId },
    });
  }

  async injectTextForReasoning(
    sessionId: string,
    text: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.requireBinding(sessionId).provider.injectTextForReasoning(
      text,
      metadata,
    );
  }

  async injectTextForAnnouncement(
    sessionId: string,
    request: AnnouncementRequest,
  ): Promise<void> {
    await this.requireBinding(sessionId).provider.injectTextForAnnouncement(
      request.text,
      request.priority ?? "queued",
      request.metadata,
    );
  }

  async queueAnnouncement(
    sessionId: string,
    request: AnnouncementRequest,
  ): Promise<void> {
    await this.requireBinding(sessionId).provider.queueAnnouncement(
      request.text,
      request.metadata,
    );
  }

  getSession(sessionId: string): SessionContext | null {
    return this.sessionManager.getSession(sessionId);
  }

  getSessionState(sessionId: string): SessionState | null {
    const stateMachine = this.sessionManager.getStateMachine(sessionId);
    return stateMachine?.currentState ?? null;
  }

  getAllSessions(): SessionContext[] {
    return this.sessionManager.getAllSessions();
  }

  getActiveSessionCount(): number {
    return this.sessionManager.getActiveSessionCount();
  }

  getProviderCapabilityMatrix() {
    return this.providerRegistry?.capabilityMatrix() ?? [];
  }

  isActive(): boolean {
    return this.isRunning;
  }

  on(event: string, listener: (event: RuntimeEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  off(event: string, listener: (event: RuntimeEvent) => void): void {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  private handleProviderEvent(
    sessionId: string,
    event: RealtimeProviderEvent,
  ): void {
    this.emit("provider_event", {
      type: "provider_event",
      sessionId,
      timestamp: Date.now(),
      data: event,
    });

    if (event.type === "ERROR") {
      this.emit("error", {
        type: "error",
        sessionId,
        timestamp: Date.now(),
        data: event.data,
      });
    }
  }

  private createProvider(providerId: string): RealtimeVoiceProvider {
    if (this.provider && this.provider.id === providerId) {
      return this.provider;
    }
    if (this.providerRegistry?.has(providerId)) {
      return this.providerRegistry.create(providerId);
    }
    if (this.provider) {
      return this.provider;
    }
    throw new Error(`No provider available for ${providerId}`);
  }

  private requireBinding(sessionId: string) {
    const binding = this.sessionManager.getSessionProvider(sessionId);
    if (!binding) {
      throw new Error(`Provider binding not found for session: ${sessionId}`);
    }
    return binding;
  }

  private normalizeCreateSessionInput(
    inputOrUserId?: CreateSessionInput | string,
    channelId?: string,
  ): CreateSessionInput {
    if (typeof inputOrUserId === "string") {
      return {
        userId: inputOrUserId,
        channelId,
        discordUserId: inputOrUserId,
        voiceChannelId: channelId,
      };
    }
    return inputOrUserId ?? {};
  }

  private normalizeAudioFrame(
    frame: NormalizedAudioFrame,
  ): NormalizedAudioFrame {
    return {
      ...frame,
      encoding: frame.encoding ?? "pcm16",
      littleEndian: frame.littleEndian ?? true,
    };
  }

  private emit(event: string, data?: RuntimeEvent): void {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      listener(
        data || { type: event as RuntimeEvent["type"], timestamp: Date.now() },
      );
    }
  }
}
