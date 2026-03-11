/**
 * 🦞 龙虾永动引擎 - 核心模块导出
 *
 * 完整的引擎功能集合：
 * - 零延迟循环引擎
 * - 高级指标监控
 * - 自适应调度器
 * - 熔断器
 * - 重试管理器
 * - Worker 线程池
 * - 遥测数据导出
 * - 火焰图收集器 (v2.1)
 * - 监督者代理 (v2.1)
 * - 黑板模式 (v2.1)
 * - 群体智能代理 (v2.1)
 *
 * @version 2.1.0
 * @since 2025-03-11
 * @author Claude Code
 */

// ========== 类和类型导入 ==========
import type { AdvancedEventLoopMetrics } from "./advanced-metrics.js";
import type { FlameGraphData } from "./flame-graph-collector.js";
import { ZeroLatencyLoopEngine } from "./zero-latency-loop.js";
import { AdvancedMetricsCollector } from "./advanced-metrics.js";
import { AdaptiveScheduler, LoadLevel } from "./adaptive-scheduler.js";
import { CircuitBreaker, CircuitState, CircuitBreakerConfig } from "./circuit-breaker.js";
import { RetryManager, RetryStrategy } from "./retry-manager.js";
import { WorkerPool } from "./worker-pool.js";
import { TelemetryCollector, TelemetryConfig } from "./telemetry.js";
import { FlameGraphCollector } from "./flame-graph-collector.js";
import { SupervisorAgent, AgentStatus, AgentType } from "./supervisor-agent.js";
import { Blackboard, createBlackboard } from "./blackboard.js";
import { SwarmAgent } from "./swarm-agent.js";

// ========== 零延迟循环引擎 ==========
export {
  ZeroLatencyLoopEngine,
  EventLoopMetrics,
  ZeroLatencyLoopOptions,
  createZeroLatencyLoop,
  MicrotaskBatcher,
  createMicrotaskBatcher,
  NonBlockingExecutor,
} from "./zero-latency-loop.js";

// ========== 高级指标监控 ==========
export {
  AdvancedMetricsCollector,
  AdvancedEventLoopMetrics,
  ThresholdConfig,
  createAdvancedMetricsCollector,
} from "./advanced-metrics.js";

// ========== 自适应调度器 ==========
export {
  AdaptiveScheduler,
  ScheduledTask,
  SchedulerConfig,
  TaskPriority as SchedulerTaskPriority,
  LoadLevel,
  createAdaptiveScheduler,
} from "./adaptive-scheduler.js";

// ========== 熔断器 ==========
export {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerConfig,
  CircuitBreakerStats,
  CircuitBreakerManager,
  getGlobalCircuitBreakerManager,
} from "./circuit-breaker.js";

// ========== 重试管理器 ==========
export {
  RetryManager,
  RetryConfig,
  RetryResult,
  RetryStrategy,
  createRetryManager,
  withRetry,
} from "./retry-manager.js";

// ========== Worker 线程池 ==========
export {
  WorkerPool,
  WorkerTask,
  WorkerPoolConfig,
  getGlobalWorkerPool,
  shutdownGlobalWorkerPool,
} from "./worker-pool.js";

// ========== 遥测数据导出 ==========
export {
  TelemetryCollector,
  TelemetryMetrics,
  TelemetryConfig,
  createTelemetryCollector,
  getGlobalTelemetryCollector,
  shutdownGlobalTelemetryCollector,
} from "./telemetry.js";

// ========== 代码分析器（原有模块）==========
export {
  LobsterCodeAnalyzer,
  quickAnalyze,
  CodeQualityReport,
  IssueSeverity,
  CodeIssueType,
} from "./code-analyzer.js";

// ========== 任务规划器（原有模块）==========
export {
  AutonomousTaskPlanner,
  AutonomousTask,
  TaskExecution,
  PlanningResult,
  createPlanner,
} from "./task-planner.js";

// ========== 代码修复器（原有模块）==========
export {
  LobsterCodeFixer,
  FixType,
  FixResult,
  FixReport,
} from "./code-fixer.js";

// ========== AST 缓存（原有模块）==========
export {
  LRUCache,
  FileAnalysisCache,
  memoize,
  memoizeAsync,
  IncrementalAnalysisConfig,
  createIncrementalConfig,
} from "./ast-cache.js";

// ========== 引擎服务（原有模块）==========
export {
  PerpetualEngineService,
} from "./service.js";

/**
 * 🦞 引擎版本信息
 */
export const ENGINE_VERSION = "2.1.0";

/**
 * 🦞 引擎功能矩阵
 */
export const ENGINE_FEATURES = {
  zeroLatencyLoop: true,
  advancedMetrics: true,
  adaptiveScheduling: true,
  circuitBreaker: true,
  retryWithBackoff: true,
  workerThreads: true,
  telemetryExport: true,
  codeAnalysis: true,
  autoFixing: true,
  contextCompression: true,
  // v2.1 新增
  flameGraphCollector: true,
  supervisorAgent: true,
  blackboard: true,
  swarmAgent: true,
} as const;

// ========== 火焰图收集器 (v2.1) ==========
export {
  FlameGraphCollector,
  FlameGraphNode,
  FlameGraphData,
  FunctionStats,
  createFlameGraphCollector,
  flameGraph,
  getGlobalFlameGraphCollector,
  startGlobalFlameGraphCollection,
  stopGlobalFlameGraphCollection,
} from "./flame-graph-collector.js";

// ========== 监督者代理 (v2.1) ==========
export {
  SupervisorAgent,
  AgentStatus,
  AgentType,
  AgentTask,
  SupervisorConfig,
  SupervisorStatus,
  SupervisorEvent,
  AssignmentStrategy,
  createSupervisorAgent,
  createAgentConfig,
} from "./supervisor-agent.js";

// ========== 黑板模式 (v2.1) ==========
export {
  Blackboard,
  BlackboardEntry,
  BlackboardEvent,
  BlackboardConfig,
  QueryOptions,
  createBlackboard,
  getGlobalBlackboard,
  closeGlobalBlackboard,
} from "./blackboard.js";

// ========== 群体智能代理 (v2.1) ==========
export {
  SwarmAgent,
  AgentMessage,
  SwarmMemberState,
  SwarmConfig,
  SwarmTask,
  SwarmStatistics,
  createSwarmAgent,
} from "./swarm-agent.js";

/**
 * 🦞 创建完整引擎（包含所有组件）
 */
export interface FullEngineConfig {
  enableWorkerPool?: boolean;
  enableTelemetry?: boolean;
  telemetryFormat?: "json" | "prometheus" | "statsd";
  enableAdaptiveScheduler?: boolean;
  enableCircuitBreaker?: boolean;
  enableRetryManager?: boolean;
}

/**
 * 完整引擎实例
 */
export interface FullEngine {
  loop: ZeroLatencyLoopEngine;
  metrics?: AdvancedMetricsCollector;
  scheduler?: AdaptiveScheduler;
  circuitBreaker?: CircuitBreaker;
  retryManager?: RetryManager;
  workerPool?: WorkerPool;
  telemetry?: TelemetryCollector;
}

/**
 * 创建完整引擎
 */
export function createFullEngine(config: FullEngineConfig = {}): FullEngine {
  const engine: FullEngine = {
    loop: new ZeroLatencyLoopEngine(),
  };

  // 高级指标收集器
  if (config.enableTelemetry || config.enableAdaptiveScheduler) {
    engine.metrics = new AdvancedMetricsCollector();
  }

  // 自适应调度器
  if (config.enableAdaptiveScheduler && engine.metrics) {
    engine.scheduler = new AdaptiveScheduler();
    engine.metrics.setUpdateCallback((metrics: AdvancedEventLoopMetrics) => {
      engine.scheduler!.updateLoadLevel(metrics);
    });
  }

  // 熔断器
  if (config.enableCircuitBreaker) {
    const breakerConfig: Partial<CircuitBreakerConfig> = {
      failureThreshold: 5,
      timeout: 60000,
    };
    engine.circuitBreaker = new CircuitBreaker("default", breakerConfig);
  }

  // 重试管理器
  if (config.enableRetryManager) {
    engine.retryManager = new RetryManager({
      maxRetries: 3,
      strategy: RetryStrategy.EXPONENTIAL_WITH_JITTER,
    });
  }

  // Worker 线程池
  if (config.enableWorkerPool) {
    engine.workerPool = new WorkerPool();
  }

  // 遥测收集器
  if (config.enableTelemetry) {
    const telemetryConfig: Partial<TelemetryConfig> = {
      format: config.telemetryFormat || "json",
    };
    engine.telemetry = new TelemetryCollector(telemetryConfig);
  }

  return engine;
}

/**
 * 🦞 引擎健康检查
 */
export async function healthCheck(engine: FullEngine): Promise<{
  healthy: boolean;
  components: Record<string, boolean>;
}> {
  const components: Record<string, boolean> = {
    loop: engine.loop.running ? engine.loop.running() : false,
  };

  if (engine.metrics) {
    const metrics = engine.metrics.getFullMetrics();
    components.metrics = metrics.healthStatus === "healthy";
  }

  if (engine.scheduler) {
    components.scheduler = engine.scheduler.getLoadLevel() !== LoadLevel.OVERLOAD;
  }

  if (engine.circuitBreaker) {
    components.circuitBreaker = engine.circuitBreaker.getState() !== CircuitState.OPEN;
  }

  if (engine.workerPool) {
    const stats = engine.workerPool.getStats();
    components.workerPool = stats.totalWorkers > 0;
  }

  const healthy = Object.values(components).every(Boolean);
  return { healthy, components };
}

/**
 * 🦞 关闭引擎（释放所有资源）
 */
export async function shutdownEngine(engine: FullEngine): Promise<void> {
  if (engine.loop.stop) {
    engine.loop.stop();
  }

  if (engine.workerPool) {
    await engine.workerPool.shutdown();
  }

  if (engine.telemetry) {
    await engine.telemetry.shutdown();
  }

  if (engine.metrics) {
    engine.metrics.shutdown();
  }
}
