/**
 * @voice-hub/core-runtime
 *
 * 核心运行时类型定义
 */

import type {
  AnnouncementPriority,
  NormalizedAudioFrame,
  PrecisionMode,
  RealtimeProviderEvent,
  RealtimeVoiceProvider,
  SessionState,
} from "@voice-hub/shared-types";
import type { MemoryStore } from "@voice-hub/memory-bank";
import type { Dispatcher } from "@voice-hub/backend-dispatcher";

/** 会话事件 */
export interface RuntimeSessionEvent {
  /** 事件类型 */
  type: SessionEventType;
  /** 会话 ID */
  sessionId: string;
  /** 时间戳 */
  timestamp: number;
  /** 附加数据 */
  data?: Record<string, unknown>;
}

/** 会话事件类型 */
export enum SessionEventType {
  /** 会话创建 */
  CREATED = "created",
  /** 会话启动 */
  STARTED = "started",
  /** 会话停止 */
  STOPPED = "stopped",
  /** 会话销毁 */
  DESTROYED = "destroyed",
  /** 状态变更 */
  STATE_CHANGED = "state_changed",
  /** 错误 */
  ERROR = "error",
}

/** 运行时配置 */
export interface RuntimeConfig {
  /** 会话超时（毫秒） */
  sessionTimeoutMs: number;
  /** 最大重连次数 */
  maxReconnectAttempts: number;
  /** 重连延迟（毫秒） */
  reconnectDelayMs: number;
  /** 是否自动保存音频 */
  autoSaveAudio: boolean;
  /** 音频保存目录 */
  audioSaveDir: string;
  /** 是否启用记忆存储 */
  enableMemoryStore: boolean;
  /** 是否启用后端分发 */
  enableBackendDispatch: boolean;
  /** 默认精确模式 */
  precisionModeDefault: PrecisionMode;
}

/** 会话创建输入 */
export interface CreateSessionInput {
  guildId?: string;
  voiceChannelId?: string;
  discordUserId?: string;
  providerId?: string;
  precisionMode?: PrecisionMode;
  userId?: string;
  channelId?: string;
  conversationId?: string;
  agentId?: string;
}

/** 会话上下文 */
export interface SessionContext {
  sessionId: string;
  guildId?: string;
  voiceChannelId?: string;
  discordUserId?: string;
  userId?: string;
  channelId?: string;
  providerId?: string;
  conversationId?: string;
  backendJobId?: string;
  agentId?: string;
  ownerUserId?: string;
  createdAt: number;
  lastActiveAt: number;
  precisionMode: PrecisionMode;
}

/** 会话管理器接口 */
export interface ISessionManager {
  /** 创建会话 */
  createSession(input?: CreateSessionInput): Promise<string>;
  /** 销毁会话 */
  destroySession(sessionId: string): Promise<void>;
  /** 获取会话 */
  getSession(sessionId: string): SessionContext | null;
  /** 获取所有会话 */
  getAllSessions(): SessionContext[];
  /** 获取活跃会话数 */
  getActiveSessionCount(): number;
}

/** 状态机接口 */
export interface IStateMachine {
  /** 当前状态 */
  readonly currentState: SessionState;
  /** 转换到新状态 */
  transitionTo(state: SessionState): Promise<boolean>;
  /** 检查是否可以转换 */
  canTransitionTo(state: SessionState): boolean;
  /** 重置状态 */
  reset(): void;
}

/** 运行时事件 */
export interface RuntimeEvent {
  type:
    | "session_created"
    | "session_destroyed"
    | "state_changed"
    | "audio_received"
    | "audio_sent"
    | "error"
    | "provider_event"
    | "owner_claimed"
    | "owner_released"
    | "backend_task_dispatched";
  sessionId?: string;
  timestamp: number;
  data?: unknown;
}

export interface SessionProviderBinding {
  provider: RealtimeVoiceProvider;
  providerEventListener: (event: RealtimeProviderEvent) => void;
}

export interface AnnouncementRequest {
  text: string;
  priority?: AnnouncementPriority;
  metadata?: Record<string, unknown>;
}
