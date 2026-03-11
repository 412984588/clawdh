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
import { ReActAgent, createReActAgent, ReActTools } from "./react-agent.js";
import { RecursiveSelfImprovement, createRecursiveSelfImprovement, selfImproving } from "./recursive-self-improvement.js";
import { HybridOrchestrator, createHybridOrchestrator, AutoScalingHybridOrchestrator, createAutoScalingOrchestrator } from "./hybrid-orchestrator.js";
import { AsyncContextTracker, createAsyncTracker, getGlobalTracker, trackAsync, limitAsyncDepth } from "./async-context-tracker.js";
import { ChainOfThought, TreeOfThought, GraphChainOfThought, DynamicRecursiveCoT, createChainOfThought, createTreeOfThought, withCoT, ReasoningState, ChainConfig } from "./chain-of-thought.js";
import { ReflectedMetadata, RegisterMetadata, LogCalls, ValidateParams, EnableValidation, Cache, Measure, RetryOnFailure, AutoBind, Decorators, getMetrics, createDecoratorComposer } from "./decorator-metadata.js";
import { HTNPlanner, createHTNPlanner, createHTNMethod, createHTNTask, GENERAL_DOMAIN, TaskStatus, HTNTaskType } from "./htn-planner.js";
import {
  IncrementalLearningEngine,
  createIncrementalLearningEngine,
  globalIncrementalLearner,
  LearningType,
  MemoryType,
  LearningState,
  ExperienceEntry,
  IncrementalLearningConfig,
} from "./incremental-learning.js";
import {
  AgentCard,
  AgentFormatParser,
  ConstraintManifoldProjector,
  createAgentCard,
  createCodeReviewerAgent,
  AgentFormatUtils,
  ConstraintType,
  ConstraintPredicate,
  ConstraintManifold,
  ContractSchema,
  MCPServerBinding,
  LocalAgentRef,
  ActionSpace,
  ExecutionPolicy,
  BudgetConfig,
  AgentMetadata,
  AgentInterface,
} from "./agent-format.js";

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
export const ENGINE_VERSION = "2.8.0";

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
  // v2.2 新增
  reactAgent: true,
  recursiveSelfImprovement: true,
  hybridOrchestrator: true,
  autoScaling: true,
  // v2.3 新增
  asyncContextTracker: true,
  chainOfThought: true,
  treeOfThought: true,
  graphChainOfThought: true,
  dynamicRecursiveCoT: true,
  decoratorMetadata: true,
  // v2.4 新增
  htnPlanner: true,
  // v2.5 新增
  incrementalLearning: true,
  // v2.6 新增
  agenticFormat: true,
  // v2.7 新增
  teaOrchestrator: true,
  // v2.8 新增
  sclOrchestrator: true,
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

// ========== ReAct 智能体 (v2.2) ==========
export {
  ReActAgent,
  ThoughtStep,
  ReActTool,
  ReActState,
  createReActAgent,
  ReActTools,
} from "./react-agent.js";

// ========== 递归自我改进 (v2.2) ==========
export {
  RecursiveSelfImprovement,
  ImprovementProposal,
  PerformanceMetrics,
  ImprovementHistory,
  createRecursiveSelfImprovement,
  selfImproving,
} from "./recursive-self-improvement.js";

// ========== 混合编排器 (v2.2) ==========
export {
  HybridOrchestrator,
  HybridTask,
  TaskResult,
  TaskType,
  TaskPriority,
  WorkerStats,
  createHybridOrchestrator,
  AutoScalingHybridOrchestrator,
  createAutoScalingOrchestrator,
} from "./hybrid-orchestrator.js";

// ========== 异步上下文追踪器 (v2.3) ==========
export {
  AsyncContextTracker,
  ContextInfo,
  AsyncResourceStats,
  AsyncTrackerConfig,
  createAsyncTracker,
  getGlobalTracker,
  trackAsync,
  limitAsyncDepth,
} from "./async-context-tracker.js";

// ========== 思维链推理器 (v2.3) ==========
export {
  ChainOfThought,
  TreeOfThought,
  GraphChainOfThought,
  DynamicRecursiveCoT,
  ThoughtStep as CoTThoughtStep,
  ReasoningState,
  ReasoningResult,
  ChainConfig,
  createChainOfThought,
  createTreeOfThought,
  withCoT,
} from "./chain-of-thought.js";

// ========== 装饰器元数据 (v2.3) ==========
export {
  ReflectedMetadata,
  TypeMetadata,
  DecoratorMetadata,
  RegisterMetadata,
  LogCalls,
  ValidateParams,
  EnableValidation,
  Cache,
  Measure,
  RetryOnFailure,
  AutoBind,
  Decorators,
  getMetrics,
  createDecoratorComposer,
  createDecoratedClass,
} from "./decorator-metadata.js";

// ========== 分层任务网络规划器 (v2.4) ==========
export {
  HTNPlanner,
  createHTNPlanner,
  createHTNMethod,
  createHTNTask,
  GENERAL_DOMAIN,
  TaskStatus,
  HTNTaskType,
  HTNMethod,
  HTNDomain,
  HTNTask,
  HTNPlan,
  HTNExecutionResult,
  HTNPlannerConfig,
} from "./htn-planner.js";

// ========== 增量学习引擎 (v2.5) ==========
export {
  IncrementalLearningEngine,
  createIncrementalLearningEngine,
  globalIncrementalLearner,
  LearningType,
  MemoryType,
  LearningState,
  ExperienceEntry,
  IncrementalLearningConfig,
} from "./incremental-learning.js";

// ========== AgenticFormat 标准 (v2.6) ==========
export {
  AgentCard,
  AgentFormatParser,
  ConstraintManifoldProjector,
  createAgentCard,
  createCodeReviewerAgent,
  AgentFormatUtils,
  ConstraintType,
  ConstraintPredicate,
  ConstraintManifold,
  ContractSchema,
  MCPServerBinding,
  LocalAgentRef,
  ActionSpace,
  ExecutionPolicy,
  BudgetConfig,
  AgentMetadata,
  AgentInterface,
} from "./agent-format.js";

// ========== TEA Protocol 编排器 (v2.7) ==========
export {
  TEAOrchestrator,
  createTEAOrchestrator,
  DecompositionStrategies,
  AgentRole as TEAAgentRole,
  TaskPriority as TEATaskPriority,
  TaskState as TEATaskState,
  AgentState as TEAAgentState,
  Layer,
  TEATask,
  TEAAgent,
  ExecutionPlan as TEAExecutionPlan,
  OrchestrationStats,
} from "./tea-orchestrator.js";
import {
  StructuredCognitiveLoop,
  createStructuredCognitiveLoop,
  CognitiveModules,
  CognitivePhase,
  ReasoningMode,
  MemoryType as SCLMemoryType,
  CognitiveState,
  PerceptionInput,
  RetrievalResult,
  ReasoningResult,
  ActionPlan,
  ReflectionResult,
  SCLConfig,
} from "./structured-cognitive-loop.js";

// ========== 结构化认知循环 (v2.8) ==========
export {
  StructuredCognitiveLoop,
  createStructuredCognitiveLoop,
  CognitiveModules,
  CognitivePhase,
  ReasoningMode,
  MemoryType as SCLMemoryType,
  CognitiveState,
  PerceptionInput,
  RetrievalResult as SCLRetrievalResult,
  ActionPlan as SCLActionPlan,
  ReflectionResult as SCLReflectionResult,
  ReasoningResult as SCLReasoningResult,
} from "./structured-cognitive-loop.js";

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
