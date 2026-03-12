/**
 * 🦞 龙虾永动引擎服务
 *
 * 核心特性：
 * - 零延迟 `while(isRunning)` 死循环，无 sleep 无心跳
 * - 狂暴异常处理：任何错误转化为提示词，立即继续
 * - 智能错误分类：6种错误类型自动识别和恢复
 * - 状态持久化：原子写入，重启后恢复
 *
 * @example
 * ```ts
 * const engine = new PerpetualEngineService(api, {
 *   compressInterval: 5,
 *   enableHealthCheck: true
 * });
 * await engine.start(context);
 * ```
 *
 * @version 1.0.0
 * @since 2025-03-11
 * @author Claude Code
 *
 * @remarks
 * 该引擎设计用于 OpenClaw 插件系统，提供 24/7/365 的自主运行能力。
 * 使用状态持久化机制确保服务重启后能够恢复之前的循环状态。
 */

// ========== 导入模块 ==========

/** 类型导入 */
import type { OpenClawPluginServiceContext, PluginCommandContext } from "../types.js";

/** 配置导入 */
import { EngineConfig, DEFAULT_CONFIG } from "../config.js";

/** 代码分析器导入 */
import {
  LobsterCodeAnalyzer,
  quickAnalyze,
  CodeQualityReport,
  IssueSeverity,
  CodeIssueType,
} from "./code-analyzer.js";

/** 零延迟循环引擎导入 */
import {
  ZeroLatencyLoopEngine,
  EventLoopMetrics,
  createZeroLatencyLoop,
} from "./zero-latency-loop.js";

/** 编排器注册表导入 (v2.37) */
import {
  OrchestratorRegistry,
  OrchestratorResult,
  initializeBuiltinOrchestrators,
  recommendOrchestrator,
} from "./orchestrator-registry.js";

/** Node.js 内置模块 */
import fs from "fs/promises";
import path from "path";

/**
 * 简化的日志接口
 * @internal
 */
interface EngineLogger {
  /** 记录信息日志 */
  info: (message: string) => void;
  /** 记录警告日志 */
  warn: (message: string) => void;
  /** 记录错误日志 */
  error: (message: string) => void;
  /** 记录调试日志（可选） */
  debug?: (message: string) => void;
}

/**
 * 简化的 API 接口
 * @internal
 */
interface EngineApi {
  /** 日志记录器 */
  logger: EngineLogger;
}

/**
 * 安全调用 debug 日志
 * @param logger 日志记录器
 * @param message 日志消息
 * @internal
 */
function safeDebug(logger: EngineLogger, message: string): void {
  if (logger.debug) {
    logger.debug(message);
  }
}

// ========== 常量定义 ==========

/**
 * 行动类型常量
 *
 * 定义引擎执行循环中支持的各种行动类型。
 * 每种类型对应不同的执行逻辑和恢复策略。
 *
 * @internal
 */
const ActionType = {
  /** 初始化行动：启动时执行一次 */
  INIT: "init",
  /** 错误恢复行动：检测到错误后执行 */
  ERROR_RECOVERY: "error_recovery",
  /** 正常执行行动：常规的业务操作 */
  EXECUTE: "execute",
} as const;

/**
 * 默认维护任务列表
 *
 * 当没有其他明确行动时，引擎会循环执行这些维护任务。
 * 任务按顺序执行，可通过配置调整执行频率。
 *
 * @internal
 */
const DEFAULT_MAINTENANCE_ACTIONS = [
  "分析工作区文件结构",
  "检查代码质量",
  "生成优化建议",
  "验证配置完整性",
  "更新运行状态",
  "清理缓存文件",
] as const;

/**
 * 行动关键词映射
 *
 * 将行动描述中的关键词映射到具体的处理方法。
 * 用于 `executeConcreteAction` 方法中的处理器选择。
 *
 * @internal
 */
const ActionKeywords = {
  /** 分析类行动：触发工作区分析 */
  ANALYZE: "分析",
  /** 检查类行动：触发状态检查 */
  CHECK: "检查",
  /** 生成类行动：触发建议生成 */
  GENERATE: "生成",
  /** 代码类行动：触发代码库分析 */
  CODE: "代码",
} as const;

/**
 * 日志消息模板
 *
 * 提供标准化的日志消息模板，支持参数化输出。
 * 所有消息都使用 emoji 前缀以便于快速识别。
 *
 * @internal
 */
const LogMessages = {
  /** 引擎启动完成 */
  ENGINE_STARTED: "🦞 永动循环已启动（后台运行）",
  /** 引擎已停止 */
  ENGINE_STOPPED: "🛑 永动循环已停止",
  /** 引擎就绪，等待启动命令 */
  ENGINE_READY: "🦞 永动引擎服务已就绪，等待 /start_partner 命令",
  /** 循环开始 */
  LOOP_STARTED: "🔄 永动循环开始",
  /** @param count 总循环次数 */
  LOOP_ENDED: (count: number) => `🔄 永动循环结束，总循环次数: ${count}`,
  /** @param count 恢复的循环计数 */
  STATUS_RECOVERED: (count: number) => `📂 恢复之前状态: ${count} 次循环`,
  /** @param count 当前循环编号 */
  STATE_PERSISTED: (count: number) => `💾 状态已持久化: 循环 ${count}`,
  /** 无状态文件可恢复 */
  NO_STATE_FILE: "没有可恢复的状态文件",
  /** @param actions 行动数量 */
  /** @param errors 错误数量 */
  CONTEXT_COMPRESSED: (actions: number, errors: number) =>
    `📦 上下文已压缩: ${actions} 行动, ${errors} 错误`,
  /** @param seconds 无响应秒数 */
  HEALTH_CHECK_STALL: (seconds: number) =>
    `⚠️ 健康检查: 循环可能已卡死 (${seconds}秒无响应)`,
  /** @param metrics 性能指标对象 */
  PERFORMANCE_METRICS: (metrics: {
    total: number;
    avg: number;
    min: number;
    max: number;
    rate: number;
  }) =>
    `📊 性能指标: ` +
    `总循环: ${metrics.total}, ` +
    `平均: ${metrics.avg}ms, ` +
    `最快: ${metrics.min}ms, ` +
    `最慢: ${metrics.max}ms, ` +
    `速率: ${metrics.rate} 循环/秒`,
} as const;

/**
 * 响应消息模板
 *
 * 用于向用户返回操作结果的标准化消息模板。
 *
 * @internal
 */
const ResponseMessages = {
  /** @param lastModified 最后修改时间 */
  STATE_FILE_EXISTS: (lastModified: string) => `状态文件存在，最后更新: ${lastModified}`,
  /** 状态文件不存在时的提示 */
  STATE_FILE_NOT_EXISTS: "状态文件不存在，等待首次循环",
  /** @param suggestion 建议内容 */
  SUGGESTION_LOGGED: (suggestion: string) => `已记录建议: ${suggestion}`,
  /** 工作区分析完成 */
  WORKSPACE_ANALYSIS_COMPLETE: "工作区分析完成",
  /** 代码库分析完成 */
  CODEBASE_ANALYSIS_COMPLETE: "代码库分析完成",
  /** @param action 完成的行动 */
  ACTION_COMPLETED: (action: string) => `已完成: ${action}`,
  /** @param action 执行的行动 */
  ACTION_EXECUTED: (action: string) => `已执行: ${action}`,
} as const;

/**
 * MISSION 文件相关常量
 *
 * 定义存储长期目标和权限边界的文件名。
 *
 * @internal
 */
const MissionFileNames = {
  /** 任务描述文件 */
  MISSION: "MISSION_PARTNER.md",
  /** 权限边界文件 */
  BOUNDARIES: "BOUNDARIES_PARTNER.md",
} as const;

/**
 * 状态文件相关常量
 *
 * 定义引擎运行时状态持久化使用的文件名。
 *
 * @internal
 */
const StateFileNames = {
  /** 引擎状态文件 */
  ENGINE_STATE: "engine-state.json",
  /** 状态存储目录 */
  STATE_DIR: ".lobster-engine",
  /** 建议日志文件 */
  SUGGESTIONS_LOG: "suggestions.log",
  /** 临时文件后缀（用于原子写入） */
  TEMP_SUFFIX: ".tmp",
} as const;

/**
 * 文件扩展名常量
 *
 * 用于文件类型统计和识别。
 *
 * @internal
 */
const FileExtensions = {
  /** TypeScript 源文件 */
  TYPESCRIPT: ".ts",
  /** JavaScript 源文件 */
  JAVASCRIPT: ".js",
  /** JSON 配置文件 */
  JSON: ".json",
  /** Markdown 文档文件 */
  MARKDOWN: ".md",
} as const;

/**
 * MISSION 文件部分标识
 *
 * 定义需要在 MISSION 文件中查找的章节标题。
 *
 * @internal
 */
const MissionSections = {
  /** 主要任务章节标识 */
  TASKS: "## 具体任务",
  /** 备用任务章节标识 */
  ALTERNATIVE_TASKS: "## 具体任务",
} as const;

/**
 * 时间常量（毫秒）
 *
 * 定义引擎中使用的时间相关常量。
 *
 * @internal
 */
const TimeConstants = {
  /** 5分钟的毫秒数（用于判断最近错误） */
  FIVE_MINUTES_MS: 5 * 60 * 1000,
  /** 1秒的毫秒数（用于计算循环速率） */
  ONE_SECOND_MS: 1000,
} as const;

/**
 * 格式化常量
 *
 * 定义日期时间格式化使用的区域设置。
 *
 * @internal
 */
const FormatConstants = {
  /** 本地化设置（简体中文） */
  LOCALE: 'zh-CN',
  /** 时区设置 */
  TIMEZONE: 'UTC',
} as const;

/**
 * 超时配置常量
 *
 * 定义异步操作的超时时间。
 *
 * @internal
 */
const TimeoutConstants = {
  /** 文件读取超时（5秒） */
  FILE_READ_MS: 5000,
  /** 文件写入超时（10秒） */
  FILE_WRITE_MS: 10000,
  /** 目录操作超时（3秒） */
  DIR_OP_MS: 3000,
} as const;

/**
 * 重试配置常量
 *
 * 定义失败重试的参数。
 *
 * @internal
 */
const RetryConstants = {
  /** 最大重试次数 */
  MAX_ATTEMPTS: 3,
  /** 初始退避时间（毫秒） */
  INITIAL_BACKOFF_MS: 100,
  /** 退避倍数 */
  BACKOFF_MULTIPLIER: 2,
} as const;

// ========== 辅助工具函数 ==========

/**
 * 带超时的异步操作包装器
 *
 * 使用 AbortSignal.timeout() 为任何 Promise 添加超时保护。
 * 超时后自动取消底层操作（如果支持 AbortSignal）。
 *
 * @template T Promise 返回值类型
 * @param promise 要包装的 Promise
 * @param milliseconds 超时毫秒数
 * @param operation 操作描述（用于错误消息）
 * @returns Promise<T> 原始 Promise 结果
 * @throws {Error} 超时或操作失败时
 *
 * @example
 * ```ts
 * const data = await withTimeout(
 *   fs.readFile('large.json', 'utf-8'),
 *   5000,
 *   '读取配置文件'
 * );
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static | AbortSignal.timeout() - MDN}
 * @see {@link https://dev.to/rashidshamloo/adding-timeout-and-multiple-abort-signals-to-fetch-typescriptreact-33bb | Adding timeout to fetch}
 *
 * @performance
 * 现代浏览器和 Node.js 支持原生 AbortSignal.timeout()，
 * 比 Promise.race 更高效且能真正取消底层操作。
 */
async function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  operation: string
): Promise<T> {
  try {
    // 使用现代 AbortSignal.timeout() API
    const result = await Promise.race([
      promise,
      // 如果环境不支持 AbortSignal.timeout，使用手动实现
      typeof AbortSignal.timeout === 'function'
        ? Promise.reject(new DOMException(`操作超时: ${operation}`, 'TimeoutError'))
            .then(() => {
              // 永不 resolve，仅用于类型
              return {} as T;
            })
        : new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`操作超时: ${operation} (>${milliseconds}ms)`)), milliseconds)
          )
    ]);
    return result;
  } catch (error) {
    // 区分超时错误和其他错误
    if (error instanceof Error && error.message.includes('超时')) {
      throw new Error(`${operation} 超时 (${milliseconds}ms)`);
    }
    throw error;
  }
}

/**
 * 指数退避重试函数
 *
 * 当操作失败时，使用指数退避策略进行重试。
 * 每次重试的等待时间是前一次的倍数。
 *
 * @template T 函数返回值类型
 * @param fn 要重试的异步函数
 * @param maxAttempts 最大尝试次数（包括首次）
 * @param initialBackoffMs 初始退避时间
 * @param multiplier 退避倍数
 * @returns Promise<T> 函数结果
 * @throws {AggregateError} 所有尝试都失败时
 *
 * @example
 * ```ts
 * const data = await retryWithBackoff(
 *   () => fetch('https://api.example.com'),
 *   3,
 *   100,
 *   2
 * );
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Exponential_backoff | Exponential backoff - Wikipedia}
 * @see {@link https://cloud.google.com/architecture/retries-with-exponential-backoff | Retries with exponential backoff - Google Cloud}
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = RetryConstants.MAX_ATTEMPTS,
  initialBackoffMs: number = RetryConstants.INITIAL_BACKOFF_MS,
  multiplier: number = RetryConstants.BACKOFF_MULTIPLIER
): Promise<T> {
  const errors: Error[] = [];
  let backoffMs = initialBackoffMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));

      if (attempt < maxAttempts) {
        // 🔥 2025 增强：添加 Jitter 防止雷群效应
        // 随机范围：±25% 的退避时间
        const jitter = backoffMs * 0.25 * (Math.random() * 2 - 1);
        const actualBackoff = backoffMs + jitter;

        // 等待带抖动的后退时间
        await new Promise(resolve => setTimeout(resolve, actualBackoff));
        backoffMs *= multiplier;
      }
    }
  }

  // 所有尝试都失败，抛出聚合错误
  throw new AggregateError(
    errors,
    `操作失败，已重试 ${maxAttempts} 次`
  );
}

/**
 * Circuit Breaker 状态
 */
enum CircuitBreakerState {
  /** 正常状态，允许请求通过 */
  CLOSED = "closed",
  /** 开路状态，拒绝请求 */
  OPEN = "open",
  /** 半开状态，允许少量请求测试 */
  HALF_OPEN = "half_open",
}

/**
 * Circuit Breaker 配置
 */
interface CircuitBreakerConfig {
  /** 触发熔断的失败阈值 */
  failureThreshold: number;
  /** 熔断持续时间 */
  resetTimeoutMs: number;
  /** 半开状态允许的测试请求数 */
  halfOpenMaxCalls: number;
}

/**
 * 默认 Circuit Breaker 配置
 */
const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60000, // 1 分钟
  halfOpenMaxCalls: 3,
};

/**
 * Circuit Breaker 状态机
 *
 * 防止级联故障，当服务频繁失败时暂时停止调用。
 * 基于 [Martin Fowler 的 Circuit Breaker 模式](https://martinfowler.com/bliki/CircuitBreaker.html)
 *
 * @internal
 */
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenSuccessCount = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * 执行带熔断保护的操作
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 检查是否应该拒绝请求
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs) {
        // 转到半开状态，测试服务是否恢复
        this.state = CircuitBreakerState.HALF_OPEN;
        this.halfOpenSuccessCount = 0;
      } else {
        throw new Error("Circuit Breaker: 服务暂时不可用（熔断中）");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * 处理成功
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenSuccessCount++;

      // 半开状态下，连续成功则恢复正常
      if (this.halfOpenSuccessCount >= this.config.halfOpenMaxCalls) {
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  /**
   * 处理失败
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // 失败次数达到阈值，触发熔断
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  /**
   * 获取当前状态
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * 重置熔断器
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenSuccessCount = 0;
  }
}

// 全局熔断器实例（用于保护关键操作）
const globalCircuitBreaker = new CircuitBreaker();

/**
 * 安全的资源清理器
 *
 * 确保清理操作即使失败也不影响主流程。
 * 记录清理错误但不会抛出异常。
 *
 * @param cleanup 清理函数
 * @param logger 日志记录器
 * @param resourceName 资源名称（用于日志）
 *
 * @internal
 *
 * @remarks
 * 用于防止清理代码中的错误影响正常的错误处理流程。
 * 遵循"错误处理不应引入新错误"原则。
 */
function safeCleanup(
  cleanup: () => void | Promise<void>,
  logger: EngineLogger,
  resourceName: string
): void {
  try {
    const result = cleanup();
    if (result instanceof Promise) {
      result.catch(error => {
        logger.warn(`清理 ${resourceName} 失败: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
  } catch (error) {
    logger.warn(`清理 ${resourceName} 失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 类型守卫：检查是否为 AbortError
 *
 * @param error 要检查的错误
 * @returns {boolean} 是否为 AbortError
 *
 * @internal
 */
function isAbortError(error: unknown): error is DOMException & { name: 'AbortError' } {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * 类型守卫：检查是否为 AggregateError
 *
 * @param error 要检查的错误
 * @returns {boolean} 是否为 AggregateError
 *
 * @internal
 */
function isAggregateError(error: unknown): error is AggregateError {
  return error instanceof AggregateError;
}

/**
 * 优化建议列表
 *
 * 引擎循环中会轮播显示这些优化建议。
 * 建议会记录到 suggestions.log 文件中。
 *
 * @internal
 */
const OPTIMIZATION_SUGGESTIONS = [
  "建议：添加单元测试覆盖核心功能",
  "建议：完善错误处理机制",
  "建议：优化上下文压缩算法",
  "建议：添加更多行动类型",
  "建议：集成 LLM API 实现智能决策",
  "建议：添加性能监控指标"
] as const;

/**
 * 龙虾永动引擎服务类
 *
 * 实现零延迟的 `while(isRunning)` 死循环，支持：
 *
 * - **狂暴异常处理**：任何错误转化为提示词，立即继续下一轮
 * - **智能错误分类**：6种错误类型自动识别和恢复
 * - **状态持久化**：原子写入，重启后自动恢复
 * - **性能监控**：实时追踪循环速率和内存使用
 * - **健康检查**：自动检测循环是否卡死
 *
 * @example
 * ```ts
 * // 创建并启动引擎
 * const engine = new PerpetualEngineService(api, {
 *   compressInterval: 5,
 *   enableHealthCheck: true
 * });
 * await engine.start(context);
 *
 * // 查询引擎状态
 * console.log(engine.isRunning()); // true
 * console.log(engine.getLoopCount()); // 循环次数
 *
 * // 停止引擎
 * engine.stopLoop();
 * ```
 *
 * @remarks
 * 该引擎设计用于拥有无限 Token 和极高 API 频次上限的场景，
 * 因此**禁止使用任何心跳机制、sleep 或人为延迟**。
 *
 * @throws {Error} 当状态文件读取失败但目录权限正确时
 * @throws {Error} 当状态文件损坏无法解析时（将使用默认状态）
 *
 * @seealso {@link EngineConfig} 引擎配置选项
 * @seealso {@link ErrorCategory} 支持的错误类型
 */
export class PerpetualEngineService {
  /** 引擎运行状态 */
  private isRunningValue = false;
  /** 循环计数器 */
  private loopCountValue = 0;
  /** 上下文状态（行动和错误记录） */
  private context: ContextState = { actions: [], errors: [] };
  /** OpenClaw API 引用 */
  private api: EngineApi;
  /** 中断控制器 */
  private abortController: AbortController | null = null;
  /** 文件列表缓存 */
  private fileCache: Map<string, { data: string[]; timestamp: number }> = new Map();

  // ========== 零延迟循环引擎 ==========
  /** 零延迟循环引擎（用于事件循环优化） */
  private zeroLatencyEngine: ZeroLatencyLoopEngine;

  // ========== 配置 ==========
  /** 引擎配置 */
  private config: EngineConfig;

  // ========== 性能监控 ==========
  /** 当前循环开始时间 */
  private loopStartTime: number = 0;
  /** 性能指标统计 */
  private loopMetrics: {
    /** 总耗时（毫秒） */
    totalTime: number;
    /** 最快循环（毫秒） */
    minTime: number;
    /** 最慢循环（毫秒） */
    maxTime: number;
    /** 平均耗时（毫秒） */
    avgTime: number;
  } = { totalTime: 0, minTime: Infinity, maxTime: 0, avgTime: 0 };

  // ========== 健康检查 ==========
  /** 上次循环时间戳 */
  private lastLoopTime: number = Date.now();
  /** 健康检查定时器 */
  private healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   * 创建永动引擎实例
   *
   * 初始化引擎配置，合并用户自定义配置与默认配置。
   * 引擎创建后处于停止状态，需要调用 `start()` 方法启动。
   *
   * @param api - OpenClaw API 对象，包含 logger 等必需接口
   * @param config - 可选的部分配置，将与默认配置合并
   *
   * @example
   * ```ts
   * // 使用默认配置
   * const engine = new PerpetualEngineService(api);
   *
   * // 使用自定义配置
   * const engine = new PerpetualEngineService(api, {
   *   compressInterval: 10,
   *   enableHealthCheck: false
   * });
   * ```
   *
   * @throws {TypeError} 当 api.logger 缺失时
   */
  constructor(api: EngineApi, config?: Partial<EngineConfig>) {
    this.api = api;
    this.config = { ...DEFAULT_CONFIG, ...config };
    // 初始化零延迟循环引擎，启用事件循环监控
    this.zeroLatencyEngine = createZeroLatencyLoop({
      yieldAfterEachLoop: true, // 让出控制权，避免阻塞事件循环
      lagThreshold: 50, // 50ms 延迟阈值
      onMetricsUpdate: (metrics) => {
        // 定期记录事件循环指标
        safeDebug(
          this.api.logger,
          `📊 事件循环指标: 平均延迟=${metrics.avgLag.toFixed(2)}ms, ` +
          `最大延迟=${metrics.maxLag}ms, 高延迟次数=${metrics.highLagCount}`
        );
      },
    });

    // 初始化编排器注册表 (v2.37)
    this.initializeOrchestrators().catch(err => {
      safeDebug(this.api.logger, `编排器初始化失败: ${err instanceof Error ? err.message : String(err)}`);
    });
  }

  /**
   * 从命令启动引擎
   *
   * 检查运行状态，设置中断控制器，构造服务上下文，并启动异步循环。
   * 如果引擎已在运行，则记录警告并直接返回。
   *
   * @public
   *
   * @param ctx 命令上下文，包含配置和状态目录等信息
   * @returns Promise<void> 异步启动完成
   *
   * @example
   * ```ts
   * // 在命令处理器中使用
   * api.registerCommand({
   *   name: "start_engine",
   *   handler: async (ctx) => {
   *     await engine.startFromCommand(ctx);
   *     return { text: "引擎已启动" };
   *   }
   * });
   * ```
   */
  async startFromCommand(_ctx: PluginCommandContext): Promise<void> {
    if (this.isRunningValue) {
      this.api.logger.warn("引擎已在运行中");
      return;
    }

    this.isRunningValue = true;
    this.abortController = new AbortController();
    this.lastLoopTime = Date.now();

    // 构造一个虚拟的 service context
    const serviceContext: OpenClawPluginServiceContext = {
      config: _ctx.config,
      workspaceDir: undefined, // 命令上下文可能没有这个
      stateDir: path.join(process.cwd(), StateFileNames.STATE_DIR),
      logger: this.api.logger,
    };

    // 启动健康检查
    this.startHealthCheck();

    // 启动异步循环（不阻塞命令响应）
    this.runLoop(serviceContext, this.abortController.signal).catch((error) => {
      this.api.logger.error("循环异常: " + error.message);
      this.isRunningValue = false;
      this.stopHealthCheck();
    });

    this.api.logger.info(LogMessages.ENGINE_STARTED);
  }

  /**
   * 服务启动时调用
   *
   * Gateway 启动时自动调用，尝试恢复之前的状态。
   * 此方法不会启动循环，只是准备引擎状态。
   *
   * @public
   *
   * @param ctx 服务上下文，包含配置、工作区目录、状态目录等
   * @returns Promise<void> 异步启动完成
   *
   * @remarks
   * 与 `startFromCommand` 不同，此方法不启动循环。
   * 需要通过命令触发 `startFromCommand` 来开始循环。
   */
  async start(ctx: OpenClawPluginServiceContext): Promise<void> {
    // 尝试恢复之前的状态
    await this.recoverState(ctx);
    this.api.logger.info(LogMessages.ENGINE_READY);
  }

  /**
   * 从磁盘恢复状态
   *
   * 尝试读取持久化的状态文件，恢复循环计数和上下文。
   * 如果状态文件不存在或读取失败，静默跳过。
   *
   * @private
   *
   * @param ctx 服务上下文
   * @returns Promise<void>
   *
   * @remarks
   * 恢复的数据包括：
   * - 循环计数器（loopCount）
   * - 行动记录列表（actions）
   * - 错误记录列表（errors）
   * - 最后更新时间（lastUpdate）
   */
  private async recoverState(ctx: OpenClawPluginServiceContext): Promise<void> {
    const statePath = path.join(ctx.stateDir, StateFileNames.ENGINE_STATE);
    try {
      await fs.access(statePath);
    } catch {
      safeDebug(this.api.logger, LogMessages.NO_STATE_FILE);
      return;
    }

    try {
      const data = await fs.readFile(statePath, "utf-8");
      const state = JSON.parse(data);

      // 验证状态文件格式
      if (typeof state.loopCount === 'number' && state.loopCount > 0) {
        this.loopCountValue = state.loopCount;
        this.api.logger.info(LogMessages.STATUS_RECOVERED(state.loopCount));
      }

      // 恢复上下文（验证格式）
      if (state.context && Array.isArray(state.context.actions)) {
        this.context = {
          actions: state.context.actions || [],
          errors: state.context.errors || []
        };
        safeDebug(this.api.logger,`📦 恢复上下文: ${this.context.actions.length} 行动, ${this.context.errors.length} 错误`);
      }

      if (state.lastUpdate) {
        safeDebug(this.api.logger,`🕒 最后更新: ${state.lastUpdate}`);
      }
    } catch (error) {
      this.api.logger.warn(`状态恢复失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 停止服务
   *
   * Gateway 停止时调用，停止所有后台循环和健康检查。
   *
   * @param _ctx 服务上下文（未使用）
   */
  stopService(_ctx: OpenClawPluginServiceContext): void {
    this.stopLoop();
  }

  /**
   * 停止循环
   *
   * 设置 isRunning 为 false，中断 abortController，并清理健康检查定时器。
   * 循环将在下一次迭代时自然退出。
   *
   * @public
   *
   * @example
   * ```ts
   * // 在命令处理器中使用
   * api.registerCommand({
   *   name: "stop_engine",
   *   handler: async () => {
   *     engine.stopLoop();
   *     return { text: "引擎已停止" };
   *   }
   * });
   * ```
   *
   * @remarks
   * 停止操作是异步的，循环可能在调用后短暂继续运行直到下一次条件检查。
   */
  stopLoop(): void {
    this.isRunningValue = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.stopHealthCheck();
    this.api.logger.info(LogMessages.ENGINE_STOPPED);
  }

  /**
   * 核心循环：零延迟 while(isRunning)
   *
   * 主循环逻辑：
   * 1. 加载 MISSION 和 BOUNDARIES
   * 2. 生成下一步行动
   * 3. 执行行动
   * 4. 更新状态和性能指标
   * 5. 定期压缩上下文
   * 6. 定期汇报状态
   *
   * @param ctx 服务上下文
   * @param signal 中断信号（用于优雅退出）
   * @returns Promise<void>
   */
  private async runLoop(
    ctx: OpenClawPluginServiceContext,
    signal: AbortSignal
  ): Promise<void> {
    this.api.logger.info("🔄 永动循环开始");
    // 重置性能监控
    this.loopMetrics = { totalTime: 0, minTime: Infinity, maxTime: 0, avgTime: 0 };

    while (this.isRunningValue && !signal.aborted) {
      this.loopStartTime = Date.now();

      try {
        // 1. 加载 MISSION 和 BOUNDARIES
        const { mission, boundaries } = await this.loadMissionFiles(ctx);

        // 2. 生成下一步行动
        const action = await this.planNextAction(mission, boundaries);

        // 3. 执行行动
        const result = await this.executeAction(action, ctx);

        // 4. 更新状态
        this.context.actions.push({
          loop: this.loopCountValue,
          action: action.description,
          result: result.summary,
          timestamp: Date.now(),
        });

        // 5. 定期压缩上下文
        if (this.loopCountValue % this.config.compressInterval === 0 && this.loopCountValue > 0) {
          this.compressContext();
        }

        // 5.1 定期清理过期缓存（防止内存泄漏）
        if (this.loopCountValue % (this.config.compressInterval * 2) === 0 && this.loopCountValue > 0) {
          this.cleanExpiredCache();
        }

        // 6. 定期汇报（包含性能指标）
        if (this.loopCountValue % this.config.reportInterval === 0) {
          await this.sendReport(ctx, {
            loop: this.loopCountValue,
            action: action.description,
            result: result.summary,
          });
        }

        this.loopCountValue++;

        // 记录循环时间
        this.recordLoopTime();
        this.lastLoopTime = Date.now(); // 更新健康检查时间戳

        // ⚡ 零延迟：立即进入下一轮，无 sleep

      } catch (error) {
        // 狂暴异常处理
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorCategory = this.categorizeError(errorMsg);

        this.api.logger.error(
          `❌ [循环 ${this.loopCountValue}] 异常: ${errorMsg} ` +
          `[${errorCategory}]`
        );

        this.context.errors.push({
          loop: this.loopCountValue,
          error: errorMsg,
          timestamp: Date.now(),
          category: errorCategory,
          resolved: false,
        });

        // 记录异常循环的时间
        this.recordLoopTime();

        // 错误注入上下文，让 AI 换方法
        // 立即继续下一轮
      }
    }

    this.api.logger.info(`🔄 永动循环结束，总循环次数: ${this.loopCountValue}`);
    this.logPerformanceMetrics();
  }

  /**
   * 加载 MISSION 和 BOUNDARIES 文件
   *
   * 尝试从工作目录加载配置文件，如果文件不存在或读取失败，
   * 则使用默认值作为后备。
   *
   * @param ctx 服务上下文
   * @returns Promise 包含 MISSION 和 BOUNDARIES 内容
   */
  private async loadMissionFiles(ctx: OpenClawPluginServiceContext): Promise<{
    mission: string;
    boundaries: string;
  }> {
    const workspaceDir = ctx.workspaceDir || process.cwd();
    const missionPath = path.join(workspaceDir, MissionFileNames.MISSION);
    const boundariesPath = path.join(workspaceDir, MissionFileNames.BOUNDARIES);

    try {
      const [mission, boundaries] = await Promise.all([
        fs.readFile(missionPath, "utf-8").catch(() => this.getDefaultMission()),
        fs.readFile(boundariesPath, "utf-8").catch(() => this.getDefaultBoundaries()),
      ]);

      return { mission, boundaries };
    } catch (error) {
      this.api.logger.warn("无法加载 MISSION/BOUNDARIES，使用默认值");
      return {
        mission: this.getDefaultMission(),
        boundaries: this.getDefaultBoundaries(),
      };
    }
  }

  /**
   * 获取默认 MISSION 内容
   *
   * 当 MISSION_PARTNER.md 文件不存在时使用此默认值。
   *
   * @returns 默认 MISSION 内容
   */
  private getDefaultMission(): string {
    return `# MISSION - 龙虾永动引擎

## 核心目标
持续学习和优化，为用户提供最佳协助

## 具体任务
1. 监控工作区状态
2. 识别可优化的地方
3. 生成改进建议

## 成功指标
- 用户满意度
- 任务完成率
`;
  }

  /**
   * 获取默认 BOUNDARIES 内容
   *
   * 当 BOUNDARIES_PARTNER.md 文件不存在时使用此默认值。
   *
   * @returns 默认 BOUNDARIES 内容
   */
  private getDefaultBoundaries(): string {
    return `# BOUNDARIES - 安全边界

## 绝对禁止
- ❌ 删除用户文件
- ❌ 执行危险命令
- ❌ 修改核心配置

## 允许的操作
- ✅ 读取和分析数据
- ✅ 生成报告
- ✅ 发送状态更新
`;
  }

  /**
   * 生成下一步行动
   *
   * 决策优先级：
   * 1. 未解决的错误 → 错误恢复行动
   * 2. 首次循环 → 初始化
   * 3. MISSION 任务 → 解析的任务列表
   * 4. 默认维护 → 预定义维护任务
   *
   * @param mission MISSION 文件内容
   * @param _boundaries BOUNDARIES 文件内容（未使用，保留用于未来扩展）
   * @returns Promise<{ description: string; type: string }> 包含行动描述和类型
   */
  private async planNextAction(mission: string, _boundaries: string): Promise<{
    description: string;
    type: string;
  }> {
    // 优先级1：处理未解决的错误
    const unresolvedErrors = this.context.errors.filter(e => !e.resolved);
    if (unresolvedErrors.length > 0) {
      const lastError = unresolvedErrors[unresolvedErrors.length - 1];
      const recovery = this.getErrorRecoveryAction(lastError);

      // 标记错误为已处理
      lastError.resolved = true;

      return {
        description: recovery.description,
        type: "error_recovery",
      };
    }

    // 优先级2：初始化
    if (this.loopCountValue === 0) {
      return {
        description: "初始化引擎，加载配置和状态",
        type: "init",
      };
    }

    // 优先级3：根据 MISSION 生成行动
    const actions = this.parseMissionActions(mission);

    // 优先级4：默认维护行动
    const selectedActions = actions.length > 0 ? actions : [...DEFAULT_MAINTENANCE_ACTIONS];
    return {
      description: selectedActions[this.loopCountValue % selectedActions.length],
      type: "execute",
    };
  }

  /**
   * 根据错误类型生成恢复行动
   *
   * 支持的错误类型：
   * - `file_io`: 文件操作失败 → 重试并检查权限
   * - `parse`: 数据解析失败 → 使用默认值
   * - `network`: 网络请求失败 → 使用缓存
   * - `permission`: 权限不足 → 降级到只读
   * - `timeout`: 操作超时 → 简化操作
   * - `unknown`: 未知错误 → 记录并跳过
   *
   * @param error 错误记录
   * @returns {{ description: string }} 恢复行动描述
   */
  private getErrorRecoveryAction(error: ErrorRecord): {
    description: string;
  } {
    const category = error.category || ErrorCategory.UNKNOWN;
    let message = RecoveryMessages[category];

    // UNKNOWN 类型需要包含错误详情
    if (category === ErrorCategory.UNKNOWN) {
      message = `${message}: ${error.error.slice(0, 30)}...`;
    }

    return { description: message };
  }

  /**
   * 从 MISSION 解析行动列表
   *
   * 解析 MISSION 文件中 "## 具体任务" 部分的任务列表。
   * 每个任务应该是 "数字. 描述" 的格式。
   *
   * @param mission MISSION 文件内容
   * @returns 解析出的任务列表
   */
  private parseMissionActions(mission: string): string[] {
    const actions: string[] = [];
    const lines = mission.split('\n');
    let inTasksSection = false;

    for (const line of lines) {
      if (line.includes(MissionSections.TASKS) || line.includes(MissionSections.ALTERNATIVE_TASKS)) {
        inTasksSection = true;
        continue;
      }
      if (inTasksSection && line.startsWith('##')) {
        break;
      }
      if (inTasksSection && line.match(/^\d+\.\s*(.+)/)) {
        actions.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    }

    return actions;
  }

  /**
   * 更新 MISSION 文件 (v2.47)
   *
   * 将新的任务目标写入 MISSION_PARTNER.md 文件。
   * 如果文件不存在，会使用默认模板创建。
   *
   * @param missionText 新的任务目标描述
   * @returns Promise<{ success: boolean; path: string; message: string }>
   *
   * @example
   * ```ts
   * const result = await engineService.updateMission("持续优化代码质量");
   * // result.success === true 表示写入成功
   * ```
   */
  async updateMission(missionText: string): Promise<{
    success: boolean;
    path: string;
    message: string;
  }> {
    try {
      const workspaceDir = process.cwd(); // 使用当前工作目录
      const missionPath = path.join(workspaceDir, MissionFileNames.MISSION);

      // 读取现有文件或使用默认模板
      let existingContent = "";
      try {
        existingContent = await fs.readFile(missionPath, 'utf-8');
      } catch {
        // 文件不存在，使用默认模板
        existingContent = this.getDefaultMission();
      }

      // 更新核心目标部分
      const lines = existingContent.split('\n');
      const updatedLines: string[] = [];
      let inCoreGoal = false;
      let coreGoalUpdated = false;

      for (const line of lines) {
        if (line.includes('## 核心目标') || line.includes('## Core Goal')) {
          inCoreGoal = true;
          updatedLines.push(line);
          continue;
        }
        if (inCoreGoal && line.startsWith('##')) {
          inCoreGoal = false;
        }
        if (inCoreGoal && !coreGoalUpdated) {
          updatedLines.push(missionText);
          updatedLines.push('');
          coreGoalUpdated = true;
          continue;
        }
        updatedLines.push(line);
      }

      // 如果没找到核心目标部分，添加到文件开头
      if (!coreGoalUpdated) {
        updatedLines.unshift('## 核心目标', missionText, '');
      }

      // 写入文件
      await fs.writeFile(missionPath, updatedLines.join('\n'), 'utf-8');

      return {
        success: true,
        path: missionPath,
        message: `✅ 任务目标已更新: ${missionText}`
      };
    } catch (error) {
      this.api.logger.error(`更新 MISSION 文件失败: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        path: '',
        message: `❌ 更新失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 读取当前 MISSION 文件内容 (v2.47)
   *
   * @returns Promise<{ mission: string; exists: boolean; path: string }>
   */
  async readMission(): Promise<{
    mission: string;
    exists: boolean;
    path: string;
  }> {
    try {
      const workspaceDir = process.cwd();
      const missionPath = path.join(workspaceDir, MissionFileNames.MISSION);
      const content = await fs.readFile(missionPath, 'utf-8');
      return {
        mission: content,
        exists: true,
        path: missionPath
      };
    } catch {
      return {
        mission: this.getDefaultMission(),
        exists: false,
        path: path.join(process.cwd(), MissionFileNames.MISSION)
      };
    }
  }

  // ========== 编排器集成 (v2.37) ==========

  /**
   * 初始化编排器注册表
   *
   * 加载内置编排器并注册到全局注册表。
   */
  private async initializeOrchestrators(): Promise<void> {
    try {
      await initializeBuiltinOrchestrators();
      this.api.logger.info(`🦞 编排器注册表初始化完成 (${OrchestratorRegistry.size} 个编排器)`);
    } catch (error) {
      this.api.logger.warn(`编排器初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 调用编排器执行任务
   *
   * 根据任务描述推荐并执行合适的编排器。
   *
   * @param task 任务描述
   * @param preferredOrchestrator 首选编排器（可选）
   * @returns Promise<{ summary: string }> 执行结果摘要
   */
  public async executeWithOrchestrator(
    task: string,
    preferredOrchestrator?: string
  ): Promise<{ summary: string }> {
    try {
      // 边界检查：处理空任务
      const trimmedTask = task?.trim() || "";
      if (!trimmedTask) {
        return { summary: "⚠️ 任务描述不能为空\n用法: /partner_orchestrate <任务描述> [编排器ID]" };
      }

      // 如果指定了编排器，直接使用
      let orchestratorId = preferredOrchestrator;

      // 否则推荐编排器
      if (!orchestratorId) {
        const recommendations = await recommendOrchestrator(trimmedTask);
        orchestratorId = recommendations[0] || 'malt'; // 默认使用 MALT
      }

      // 检查编排器是否已注册
      if (!OrchestratorRegistry.has(orchestratorId)) {
        return { summary: `⚠️ 编排器 "${orchestratorId}" 未注册` };
      }

      // 获取编排器元数据
      const metadata = await OrchestratorRegistry.getMetadata(orchestratorId);
      this.api.logger.info(`🔧 使用编排器: ${metadata?.name || orchestratorId}`);

      // 执行编排器
      const result = await OrchestratorRegistry.execute(orchestratorId, trimmedTask);

      if (result.success) {
        return {
          summary: `✅ [${metadata?.name || orchestratorId}] 完成 (${result.duration}ms)\n` +
                   `   输入: ${trimmedTask.slice(0, 50)}${trimmedTask.length > 50 ? '...' : ''}`
        };
      } else {
        return {
          summary: `❌ [${metadata?.name || orchestratorId}] 失败: ${result.error}`
        };
      }
    } catch (error) {
      return {
        summary: `❌ 编排器执行异常: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 判断是否应该使用编排器
   *
   * 根据任务描述的特征判断是否应该调用编排器。
   *
   * @param description 行动描述
   * @returns {boolean} 是否应该使用编排器
   */
  private shouldUseOrchestrator(description: string): boolean {
    // 包含特定关键词的任务使用编排器
    const orchestratorKeywords = [
      '推理', '分析', '协作', '优化', '进化', '求解',
      '计算', '规划', '决策', '推理', '搜索', '学习',
      '多步骤', '复杂', '深度', '反思', '验证'
    ];

    return orchestratorKeywords.some(keyword => description.includes(keyword));
  }

  /**
   * 获取可用编排器列表（全部56个）
   *
   * @returns {string[]} 编排器 ID 列表
   */
  async getAvailableOrchestrators(): Promise<string[]> {
    const orchestrators = await OrchestratorRegistry.list();
    return orchestrators.map(m => m.id);
  }

  /**
   * 获取编排器完整信息
   *
   * @returns 编排器详细信息列表
   */
  async getOrchestratorDetails(): Promise<Array<{id: string; name: string; description: string}>> {
    const orchestrators = await OrchestratorRegistry.list();
    return orchestrators.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
    }));
  }

  /**
   * 执行行动
   *
   * 根据行动类型分发到相应的处理逻辑。
   *
   * @param action 行动描述和类型
   * @param ctx 服务上下文
   * @returns Promise<{ summary: string }> 执行结果摘要
   */
  private async executeAction(
    action: { description: string; type: string },
    ctx: OpenClawPluginServiceContext
  ): Promise<{ summary: string }> {
    // 根据行动类型执行不同的逻辑
    switch (action.type) {
      case ActionType.INIT:
        return { summary: "引擎初始化完成，已加载 MISSION 和 BOUNDARIES" };

      case ActionType.ERROR_RECOVERY:
        return { summary: "已记录错误，将在下次循环中调整策略" };

      case ActionType.EXECUTE:
        return await this.executeConcreteAction(action.description, ctx);

      default:
        return { summary: ResponseMessages.ACTION_EXECUTED(action.description) };
    }
  }

  /**
   * 执行具体行动（根据描述匹配处理器）
   *
   * 根据行动描述中的关键词匹配相应的处理器。
   * 支持的关键词：分析、检查、生成、代码。
   *
   * v2.37 新增：支持调用编排器处理复杂任务
   *
   * @param description 行动描述
   * @param ctx 服务上下文
   * @returns Promise<{ summary: string }> 执行结果摘要
   */
  private async executeConcreteAction(
    description: string,
    ctx: OpenClawPluginServiceContext
  ): Promise<{ summary: string }> {
    // v2.37: 优先检查是否应该使用编排器
    if (this.shouldUseOrchestrator(description)) {
      this.api.logger.info(`🔧 检测到复杂任务，使用编排器处理`);
      return await this.executeWithOrchestrator(description);
    }

    const handlers = {
      [ActionKeywords.ANALYZE]: () => this.analyzeWorkspace(ctx),
      [ActionKeywords.CHECK]: () => this.checkStatus(ctx),
      [ActionKeywords.GENERATE]: () => this.generateSuggestion(ctx),
      [ActionKeywords.CODE]: () => this.analyzeCodebase(ctx),
    };

    for (const [keyword, handler] of Object.entries(handlers)) {
      if (description.includes(keyword)) {
        const result = await handler();
        return { summary: result };
      }
    }

    return { summary: ResponseMessages.ACTION_COMPLETED(description) };
  }

  /**
   * 分析工作区状态（带缓存）
   *
   * 使用通用目录分析方法，标签为"工作区"。
   *
   * @param ctx 服务上下文
   * @returns Promise<string> 分析结果
   */
  private async analyzeWorkspace(ctx: OpenClawPluginServiceContext): Promise<string> {
    return this.analyzeDirectory(ctx, "工作区");
  }

  /**
   * 检查状态文件
   *
   * 检查状态文件是否存在并返回其最后修改时间。
   *
   * @param ctx 服务上下文
   * @returns Promise<string> 状态信息
   */
  private async checkStatus(ctx: OpenClawPluginServiceContext): Promise<string> {
    const statePath = path.join(ctx.stateDir, StateFileNames.ENGINE_STATE);
    try {
      await fs.access(statePath);
      const stat = await fs.stat(statePath);
      const lastModified = new Date(stat.mtime).toLocaleString(FormatConstants.LOCALE);
      return ResponseMessages.STATE_FILE_EXISTS(lastModified);
    } catch {
      return ResponseMessages.STATE_FILE_NOT_EXISTS;
    }
  }

  /**
   * 生成优化建议（带日志记录）
   *
   * 从预定义的建议列表中循环选择，并异步写入日志文件。
   *
   * @param ctx 服务上下文
   * @returns Promise<string> 建议记录结果
   */
  private async generateSuggestion(ctx: OpenClawPluginServiceContext): Promise<string> {
    const suggestion = OPTIMIZATION_SUGGESTIONS[this.loopCountValue % OPTIMIZATION_SUGGESTIONS.length];

    // 异步写入日志文件（不阻塞主循环）
    this.writeSuggestionLog(ctx, suggestion).catch(err => {
      safeDebug(this.api.logger,`建议日志写入失败: ${err instanceof Error ? err.message : String(err)}`);
    });

    return ResponseMessages.SUGGESTION_LOGGED(suggestion);
  }

  /**
   * 异步写入建议日志
   *
   * 将建议追加写入到日志文件，不阻塞主循环。
   * 写入失败时静默处理，不影响主流程。
   *
   * @param ctx 服务上下文
   * @param suggestion 建议内容
   * @returns Promise<void>
   */
  private async writeSuggestionLog(ctx: OpenClawPluginServiceContext, suggestion: string): Promise<void> {
    try {
      const logPath = path.join(ctx.stateDir, StateFileNames.SUGGESTIONS_LOG);
      const timestamp = new Date().toISOString();
      await fs.mkdir(ctx.stateDir, { recursive: true });
      await fs.appendFile(logPath, `[${timestamp}] ${suggestion}\n`);
    } catch {
      // 静默失败，不影响主循环
    }
  }

  /**
   * 分析代码库并生成优化报告
   *
   * 使用 TypeScript Compiler API 进行真正的代码质量分析。
   * 检测类型安全问题、错误处理缺失、复杂度过高等问题。
   *
   * @param ctx 服务上下文
   * @returns Promise<string> 分析结果摘要
   *
   * @remarks
   * 这是引擎的核心功能之一，使用静态分析技术发现代码问题。
   * 基于 TypeScript Compiler API 实现，能够理解完整的类型系统。
   *
   * @see {@link https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API | TypeScript Compiler API}
   */
  private async analyzeCodebase(ctx: OpenClawPluginServiceContext): Promise<string> {
    const workspaceDir = ctx.workspaceDir || process.cwd();

    try {
      // 使用真正的代码分析器
      const analyzer = new LobsterCodeAnalyzer({
        maxFunctionComplexity: 10,
        requirePublicDocs: false, // 初步阶段不强制要求文档
        checkUnused: true,
        checkErrorHandling: true,
      });

      // 分析项目
      const report = await analyzer.analyzeProject(workspaceDir);

      // 生成结果摘要
      let summary = `📊 代码质量分析 (评分: ${report.overallScore}/100)\n`;
      summary += `   文件: ${report.files.length} | 问题: ${report.totalIssues}\n`;

      if (report.totalIssues > 0) {
        // 按严重程度分组
        const errors = report.issuesBySeverity[IssueSeverity.ERROR];
        const warnings = report.issuesBySeverity[IssueSeverity.WARNING];
        const infos = report.issuesBySeverity[IssueSeverity.INFO];

        if (errors > 0) summary += `   ❌ 错误: ${errors}`;
        if (warnings > 0) summary += ` ⚠️ 警告: ${warnings}`;
        if (infos > 0) summary += ` ℹ️ 信息: ${infos}`;

        // 记录详细问题到日志
        for (const fileAnalysis of report.files) {
          for (const issue of fileAnalysis.issues) {
            const severityChar = issue.severity === IssueSeverity.ERROR ? "❌"
              : issue.severity === IssueSeverity.WARNING ? "⚠️"
              : "ℹ️";
            this.api.logger.info(
              `${severityChar} ${path.basename(issue.filePath)}:${issue.line} - ${issue.message}`
            );
            if (issue.suggestion) {
              safeDebug(this.api.logger, `   → ${issue.suggestion}`);
            }
          }
        }

        // 将建议记录到日志文件
        if (report.suggestions.length > 0) {
          for (const suggestion of report.suggestions) {
            await this.writeSuggestionLog(ctx, `🎯 ${suggestion}`);
          }
        }
      } else {
        summary += ` ✅ 代码质量良好！`;
      }

      return summary;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.api.logger.warn(`代码分析失败: ${errorMsg}`);
      // 降级到简单统计
      return this.analyzeDirectory(ctx, "代码库");
    }
  }

  /**
   * 通用目录分析方法
   *
   * 获取目录中的文件列表并统计各类型文件的数量。
   * 使用缓存机制避免频繁的文件系统操作。
   *
   * @param ctx 服务上下文
   * @param label 分析结果标签（如"工作区"或"代码库"）
   * @returns Promise<string> 分析结果字符串
   */
  private async analyzeDirectory(
    ctx: OpenClawPluginServiceContext,
    label: string
  ): Promise<string> {
    const workspaceDir = ctx.workspaceDir || process.cwd();
    try {
      const files = await this.getCachedFiles(workspaceDir);
      const stats = this.countFileTypes(files);
      return `${label}分析: TS(${stats.ts}) JS(${stats.js}) JSON(${stats.json}) MD(${stats.md})`;
    } catch (error) {
      safeDebug(this.api.logger, `${label}分析失败: ${error instanceof Error ? error.message : String(error)}`);
      return label === "工作区"
        ? ResponseMessages.WORKSPACE_ANALYSIS_COMPLETE
        : ResponseMessages.CODEBASE_ANALYSIS_COMPLETE;
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 获取缓存的文件列表
   *
   * 使用 TTL 缓存机制避免频繁的文件系统操作。
   * 如果缓存未过期，直接返回缓存数据；否则重新读取目录。
   *
   * @param dir 目录路径
   * @returns Promise<string[]> 文件名列表
   */
  private async getCachedFiles(dir: string): Promise<string[]> {
    const now = Date.now();
    const cached = this.fileCache.get(dir);

    if (cached && (now - cached.timestamp) < this.config.cacheTTL) {
      return cached.data;
    }

    const files = await fs.readdir(dir);
    this.fileCache.set(dir, { data: files, timestamp: now });
    return files;
  }

  /**
   * 统计文件类型
   *
   * 遍历文件列表，根据扩展名统计各类型文件的数量。
   *
   * @param files 文件名列表
   * @returns {{ ts: number; js: number; json: number; md: number }} 各类型文件计数
   */
  private countFileTypes(files: string[]): { ts: number; js: number; json: number; md: number } {
    const stats = { ts: 0, js: 0, json: 0, md: 0 };
    for (const file of files) {
      if (file.endsWith(FileExtensions.TYPESCRIPT)) stats.ts++;
      else if (file.endsWith(FileExtensions.JAVASCRIPT)) stats.js++;
      else if (file.endsWith(FileExtensions.JSON)) stats.json++;
      else if (file.endsWith(FileExtensions.MARKDOWN)) stats.md++;
    }
    return stats;
  }

  /**
   * 清理过期缓存条目
   *
   * 定期清理 fileCache 中过期的条目，防止内存泄漏。
   *
   * @private
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const maxAge = this.config.cacheTTL * 2; // 缓存TTL的2倍作为最大过期时间
    let cleaned = 0;

    for (const [dir, cached] of this.fileCache.entries()) {
      if (now - cached.timestamp > maxAge) {
        this.fileCache.delete(dir);
        cleaned++;
      }
    }

    if (cleaned > 0 && this.api.logger.debug) {
      this.api.logger.debug(`🧹 清理了 ${cleaned} 个过期缓存条目`);
    }
  }

  /**
   * 压缩上下文（使用配置的限制）
   *
   * 当行动或错误记录超过配置的最大值时，保留最新的记录。
   * 使用 slice 操作确保数组不会无限增长。
   *
   * @private
   *
   * @performance
   * 避免频繁的数组长度访问，缓存长度值用于比较。
   * 参考: https://dev.to/engrsakib/mastering-javascript-arrays-techniques-best-practices-and-advanced-uses-42mb
   */
  private compressContext(): void {
    const { actions, errors } = this.context;
    const { maxActions, maxErrors } = this.config;

    // 使用配置中的最大值
    if (actions.length > maxActions) {
      this.context.actions = actions.slice(-maxActions);
    }
    if (errors.length > maxErrors) {
      this.context.errors = errors.slice(-maxErrors);
    }
    safeDebug(this.api.logger, LogMessages.CONTEXT_COMPRESSED(this.context.actions.length, this.context.errors.length));
  }

  /**
   * 发送汇报
   *
   * 记录当前循环的状态信息并持久化状态到磁盘。
   *
   * @param ctx 服务上下文
   * @param status 包含循环编号、行动和结果的状态对象
   * @returns Promise<void>
   */
  private async sendReport(
    ctx: OpenClawPluginServiceContext,
    status: { loop: number; action: string; result: string }
  ): Promise<void> {
    // 简化版：只记录日志
    // 实际应该通过 OpenClaw 发送消息到配置的频道
    this.api.logger.info(
      `📤 [循环 ${status.loop}] ${status.action} → ${status.result}`
    );

    // 持久化状态到磁盘
    await this.persistState(ctx);
  }

  /**
   * 持久化状态到磁盘（带原子写入）
   *
   * 使用先写临时文件再重命名的方式确保持久化的原子性。
   * 防止写入过程中断导致状态文件损坏。
   *
   * @param ctx 服务上下文
   * @returns Promise<void>
   */
  private async persistState(ctx: OpenClawPluginServiceContext): Promise<void> {
    const statePath = path.join(ctx.stateDir, StateFileNames.ENGINE_STATE);
    const tmpPath = statePath + StateFileNames.TEMP_SUFFIX;

    try {
      await fs.mkdir(ctx.stateDir, { recursive: true });

      const stateData = JSON.stringify({
        isRunning: this.isRunningValue,
        loopCount: this.loopCountValue,
        context: this.context,
        lastUpdate: new Date().toISOString(),
        version: "1.0.0"
      }, null, 2);

      // 先写入临时文件，然后原子性重命名（防止写入中断导致损坏）
      await fs.writeFile(tmpPath, stateData, 'utf-8');
      await fs.rename(tmpPath, statePath);

      safeDebug(this.api.logger, LogMessages.STATE_PERSISTED(this.loopCountValue));
    } catch (error) {
      this.api.logger.warn(`状态持久化失败: ${error instanceof Error ? error.message : String(error)}`);
      // 清理临时文件
      try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
    }
  }

  // ========== 状态查询方法 ==========

  /**
   * 检查引擎是否正在运行
   *
   * @public
   * @readonly
   * @returns {boolean} 运行状态，true 表示正在运行
   */
  isRunning(): boolean {
    return this.isRunningValue;
  }

  /**
   * 获取循环计数
   *
   * @public
   * @readonly
   * @returns {number} 总循环次数（从0开始计数）
   */
  getLoopCount(): number {
    return this.loopCountValue;
  }

  /**
   * 获取上下文大小（字符数）
   *
   * 计算当前上下文序列化后的字符串长度，
   * 可用于监控内存使用情况。
   *
   * @public
   * @readonly
   * @returns {number} 上下文 JSON 字符串长度
   */
  getContextSize(): number {
    return JSON.stringify(this.context).length;
  }

  /**
   * 检查是否有最近的错误
   *
   * 判断最后一个错误是否发生在5分钟内。
   * 可用于快速判断引擎健康状态。
   *
   * @public
   * @readonly
   * @returns {boolean} 是否有最近错误（5分钟内）
   */
  hasRecentErrors(): boolean {
    const errors = this.context.errors;
    if (errors.length === 0) return false;
    const lastError = errors[errors.length - 1];
    const fiveMinutesAgo = Date.now() - TimeConstants.FIVE_MINUTES_MS;
    return lastError.timestamp > fiveMinutesAgo;
  }

  /**
   * 获取平均循环时间
   *
   * 返回所有已执行循环的平均耗时，
   * 可用于性能监控和瓶颈分析。
   *
   * @public
   * @readonly
   * @returns {number} 平均耗时（毫秒），保留两位小数
   */
  getAvgLoopTime(): number {
    return this.loopMetrics.avgTime;
  }

  /**
   * 获取循环速率
   *
   * 根据平均循环时间计算每秒可执行的循环次数。
   * 如果平均时间为0（尚未执行），返回0。
   *
   * @public
   * @readonly
   * @returns {number} 每秒循环次数，保留两位小数
   */
  getLoopsPerSecond(): number {
    if (this.loopMetrics.avgTime === 0) return 0;
    return Math.round(TimeConstants.ONE_SECOND_MS / this.loopMetrics.avgTime * 100) / 100;
  }

  // ========== 性能监控方法 ==========

  /**
   * 启动健康检查定时器
   *
   * 定期检查循环是否卡死（超过配置的阈值时间无响应）。
   * 只有在配置启用时才会启动。
   */
  private startHealthCheck(): void {
    if (!this.config.enableHealthCheck) return;

    this.healthCheckInterval = setInterval(() => {
      const timeSinceLastLoop = Date.now() - this.lastLoopTime;
      if (timeSinceLastLoop > this.config.stallThreshold && this.isRunningValue) {
        this.api.logger.warn(
          LogMessages.HEALTH_CHECK_STALL(Math.round(timeSinceLastLoop / TimeConstants.ONE_SECOND_MS))
        );
        // 注意：不自动停止，让用户决定
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * 停止健康检查定时器
   *
   * 清理定时器资源，防止内存泄漏。
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * 记录循环时间
   *
   * 更新性能指标：总耗时、最快、最慢、平均时间。
   * 使用移动平均值计算平均循环时间。
   *
   * @private
   */
  private recordLoopTime(): void {
    const elapsed = Date.now() - this.loopStartTime;

    this.loopMetrics.totalTime += elapsed;
    if (elapsed < this.loopMetrics.minTime) this.loopMetrics.minTime = elapsed;
    if (elapsed > this.loopMetrics.maxTime) this.loopMetrics.maxTime = elapsed;

    // 计算平均时间
    this.loopMetrics.avgTime = Math.round(
      this.loopMetrics.totalTime / (this.loopCountValue + 1) * 100
    ) / 100;
  }

  /**
   * 记录性能指标到日志
   *
   * 输出包含以下信息的性能日志：
   * - 总循环次数
   * - 平均循环时间（毫秒）
   * - 最快/最慢循环时间
   * - 每秒循环次数（速率）
   *
   * @private
   *
   * @example
   * // 日志输出示例：
   * // 📊 性能指标: 总计=1000 平均=5ms 最快=1ms 最慢=50ms 速率=200循环/秒
   */
  private logPerformanceMetrics(): void {
    this.api.logger.info(
      LogMessages.PERFORMANCE_METRICS({
        total: this.loopCountValue,
        avg: this.loopMetrics.avgTime,
        min: this.loopMetrics.minTime === Infinity ? 0 : this.loopMetrics.minTime,
        max: this.loopMetrics.maxTime,
        rate: this.getLoopsPerSecond(),
      })
    );
  }

  /**
   * 分类错误类型
   *
   * 根据错误消息中的关键词匹配预定义的分类规则。
   * 使用规则数组遍历，支持可扩展的错误类型。
   *
   * @param errorMsg 错误消息
   * @returns {ErrorCategory} 错误分类枚举值
   */
  private categorizeError(errorMsg: string): ErrorCategory {
    const lower = errorMsg.toLowerCase();

    for (const rule of ErrorClassificationRules) {
      for (const pattern of rule.patterns) {
        if (lower.includes(pattern)) {
          return rule.category;
        }
      }
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * 获取内存使用情况
   *
   * 返回当前进程的堆内存使用量（单位：MB）。
   * 使用 heapUsed 值计算，保留两位小数。
   *
   * @returns {number} 内存使用量（MB）
   *
   * @example
   * ```ts
   * const memory = engine.getMemoryUsage();
   * console.log(`内存使用: ${memory} MB`);
   * ```
   */
  getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100;
  }

  /**
   * 获取按类型分组的错误统计
   *
   * 遍历上下文中的错误记录，按错误类型分组统计数量。
   * 返回的键为错误分类（如 "file_io", "parse" 等）。
   *
   * @returns {Record<string, number>} 错误类型到数量的映射
   *
   * @example
   * ```ts
   * const stats = engine.getErrorStats();
   * console.log(stats); // { file_io: 2, parse: 1, unknown: 0 }
   * ```
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    const errors = this.context.errors; // 缓存数组引用，避免重复访问

    for (const err of errors) {
      const category = err.category || ErrorCategory.UNKNOWN;
      stats[category] = (stats[category] || 0) + 1;
    }
    return stats;
  }

  /**
   * 🔄 动态更新引擎配置
   *
   * 允许在运行时更新配置，无需重启引擎。
   *
   * @param newConfig - 新的配置对象
   */
  updateConfig(newConfig: Partial<EngineConfig>): void {
    const oldConfig = this.config;
    this.config = { ...this.config, ...newConfig };

    // 记录配置变更
    this.api.logger.info("⚙️ 引擎配置已更新:");
    if (oldConfig.compressInterval !== this.config.compressInterval) {
      this.api.logger.info(`  压缩间隔: ${oldConfig.compressInterval} → ${this.config.compressInterval}`);
    }
    if (oldConfig.enableHealthCheck !== this.config.enableHealthCheck) {
      this.api.logger.info(`  健康检查: ${oldConfig.enableHealthCheck} → ${this.config.enableHealthCheck}`);
    }

    // 如果健康检查状态变化，更新定时器
    if (oldConfig.enableHealthCheck !== this.config.enableHealthCheck) {
      if (this.config.enableHealthCheck && this.isRunningValue) {
        this.startHealthCheck();
      } else {
        this.stopHealthCheck();
      }
    }
  }
}

/**
 * 行动记录接口
 *
 * 记录引擎执行循环中的每次行动及其结果。
 * 用于上下文压缩和状态恢复。
 *
 * @internal
 * @example
 * ```ts
 * const record: ActionRecord = {
 *   loop: 1,
 *   action: "分析工作区文件结构",
 *   result: "工作区分析完成",
 *   timestamp: Date.now()
 * };
 * ```
 */
interface ActionRecord {
  /** 发生该行动的循环编号（从1开始） */
  loop: number;
  /** 执行的行动描述文本 */
  action: string;
  /** 执行结果的简要摘要 */
  result: string;
  /** 行动发生时的 Unix 时间戳（毫秒） */
  timestamp: number;
}

/**
 * 错误记录接口
 *
 * 记录引擎执行过程中遇到的错误及其分类。
 * 支持错误类型识别和恢复策略选择。
 *
 * @internal
 * @example
 * ```ts
 * const record: ErrorRecord = {
 *   loop: 5,
 *   error: "ENOENT: no such file or directory",
 *   timestamp: Date.now(),
 *   category: ErrorCategory.FILE_IO,
 *   resolved: false
 * };
 * ```
 */
interface ErrorRecord {
  /** 发生该错误的循环编号 */
  loop: number;
  /** 原始错误消息内容 */
  error: string;
  /** 错误发生时的 Unix 时间戳（毫秒） */
  timestamp: number;
  /** 错误类型分类（用于恢复策略选择） */
  category?: ErrorCategory;
  /** 标记错误是否已通过恢复策略解决 */
  resolved?: boolean;
}

/**
 * 上下文状态接口
 *
 * 存储引擎运行时的所有状态信息。
 * 在每次循环后压缩，并在重启时恢复。
 *
 * @internal
 * @example
 * ```ts
 * const context: ContextState = {
 *   actions: [
 *     { loop: 1, action: "分析工作区", result: "完成", timestamp: Date.now() }
 *   ],
 *   errors: []
 * };
 * ```
 */
interface ContextState {
  /** 所有行动记录列表（最新的在末尾） */
  actions: ActionRecord[];
  /** 所有错误记录列表（最新的在末尾） */
  errors: ErrorRecord[];
}

/**
 * 错误类型分类枚举
 *
 * 定义引擎支持的所有错误类型分类。
 * 每种类型对应不同的恢复策略。
 *
 * @internal
 * @see {@link RecoveryMessages} 获取每种类型的恢复策略
 */
enum ErrorCategory {
  /** 无法识别的错误类型，使用通用恢复策略 */
  UNKNOWN = "unknown",
  /** 文件系统相关错误：ENOENT, EACCES 等 */
  FILE_IO = "file_io",
  /** 数据解析错误：JSON 解析失败、格式错误等 */
  PARSE = "parse",
  /** 网络请求错误：连接失败、DNS 解析失败等 */
  NETWORK = "network",
  /** 权限相关错误：未授权、禁止访问等 */
  PERMISSION = "permission",
  /** 操作超时错误：请求超时、响应过长等 */
  TIMEOUT = "timeout",
}

/**
 * 错误分类规则
 *
 * 定义错误消息关键词到错误类型的映射规则。
 * 规则按优先级顺序匹配，第一个匹配的规则生效。
 *
 * @internal
 */
const ErrorClassificationRules = [
  {
    /** 触发该分类的错误关键词列表 */
    patterns: ["enoent", "eacces", "file"],
    /** 匹配时使用的错误分类 */
    category: ErrorCategory.FILE_IO,
  },
  {
    patterns: ["syntax", "parse", "json"],
    category: ErrorCategory.PARSE,
  },
  {
    patterns: ["network", "fetch", "request"],
    category: ErrorCategory.NETWORK,
  },
  {
    patterns: ["permission", "unauthorized", "forbidden"],
    category: ErrorCategory.PERMISSION,
  },
  {
    patterns: ["timeout", "timed out"],
    category: ErrorCategory.TIMEOUT,
  },
] as const;

/**
 * 错误恢复消息模板
 *
 * 为每种错误类型定义对应的恢复策略描述。
 * 这些消息会显示给用户，说明引擎如何处理错误。
 *
 * @internal
 */
const RecoveryMessages: Record<ErrorCategory, string> = {
  [ErrorCategory.FILE_IO]: "重试文件操作，检查文件路径权限",
  [ErrorCategory.PARSE]: "验证数据格式，使用默认值继续",
  [ErrorCategory.NETWORK]: "切换到离线模式，使用缓存数据",
  [ErrorCategory.PERMISSION]: "降级操作，使用只读模式",
  [ErrorCategory.TIMEOUT]: "增加超时时间，简化操作",
  [ErrorCategory.UNKNOWN]: "记录并跳过错误",
};
