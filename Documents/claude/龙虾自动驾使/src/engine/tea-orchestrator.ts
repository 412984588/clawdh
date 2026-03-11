/**
 * 🦞 TEA Protocol 层级多智能体编排器
 *
 * 基于 AGENTORCHESTRA 框架的 TEA Protocol
 * T - Task Decomposition (任务分解)
 * E - Execution (执行)
 * A - Adaptation (适应)
 *
 * @see {@link https://openreview.net/pdf/4967a6e0001e9c13cec8d73db97143a3da3a55f2.pdf} - AGENTORCHESTRA
 * @see {@link https://arxiv.org/html/2601.13671v1} - Multi-Agent Systems Orchestration
 * @see {@link https://www.ai-agentsplus.com/blog/multi-agent-orchestration-patterns-2026} - 2026 Orchestration Patterns
 */

/**
 * 智能体角色类型
 */
export enum AgentRole {
  /** 战略层 - 高层规划和决策 */
  STRATEGIC = "strategic",
  /** 战术层 - 中层任务分配和协调 */
  TACTICAL = "tactical",
  /** 操作层 - 具体任务执行 */
  OPERATIONAL = "operational",
  /** 监督者 - 监控和审计 */
  SUPERVISOR = "supervisor",
  /** 专家 - 特定领域知识 */
  SPECIALIST = "specialist",
}

/**
 * 任务优先级
 */
export enum TaskPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

/**
 * 任务状态
 */
export enum TaskState {
  PENDING = "pending",
  DECOMPOSED = "decomposed",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * 智能体状态
 */
export enum AgentState {
  IDLE = "idle",
  BUSY = "busy",
  UNAVAILABLE = "unavailable",
  ERROR = "error",
}

/**
 * 层级定义
 */
export enum Layer {
  STRATEGIC = "strategic",
  TACTICAL = "tactical",
  OPERATIONAL = "operational",
}

/**
 * TEA 任务定义
 */
export interface TEATask {
  /** 任务ID */
  id: string;
  /** 父任务ID */
  parentId?: string;
  /** 任务描述 */
  description: string;
  /** 任务状态 */
  state: TaskState;
  /** 任务优先级 */
  priority: TaskPriority;
  /** 目标层级 */
  targetLayer: Layer;
  /** 分配的智能体ID */
  assignedAgentId?: string;
  /** 子任务 */
  subtasks: TEATask[];
  /** 执行结果 */
  result?: any;
  /** 错误信息 */
  error?: string;
  /** 创建时间 */
  createdAt: number;
  /** 开始时间 */
  startedAt?: number;
  /** 完成时间 */
  completedAt?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 依赖任务ID */
  dependencies: string[];
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 智能体定义
 */
export interface TEAAgent {
  /** 智能体ID */
  id: string;
  /** 智能体名称 */
  name: string;
  /** 角色 */
  role: AgentRole;
  /** 所属层级 */
  layer: Layer;
  /** 能力列表 */
  capabilities: string[];
  /** 状态 */
  state: AgentState;
  /** 当前任务ID */
  currentTaskId?: string;
  /** 已完成任务数 */
  completedTasks: number;
  /** 失败任务数 */
  failedTasks: number;
  /** 最后活跃时间 */
  lastActiveAt: number;
  /** 配置 */
  config?: Record<string, any>;
}

/**
 * 任务分解策略
 */
export interface DecompositionStrategy {
  /** 策略名称 */
  name: string;
  /** 目标层级 */
  targetLayer: Layer;
  /** 最大分解深度 */
  maxDepth: number;
  /** 分支因子 */
  branchingFactor: number;
  /** 是否允许并行 */
  allowParallel: boolean;
}

/**
 * 执行计划
 */
export interface ExecutionPlan {
  /** 计划ID */
  id: string;
  /** 根任务 */
  rootTask: TEATask;
  /** 任务图（扁平化） */
  taskGraph: Map<string, TEATask>;
  /** 智能体分配 */
  agentAssignments: Map<string, string[]>; // agentId -> taskIds
  /** 执行顺序 */
  executionOrder: string[];
  /** 创建时间 */
  createdAt: number;
}

/**
 * 编排配置
 */
export interface TEAOrchestratorConfig {
  /** 最大并行任务数 */
  maxParallelTasks?: number;
  /** 默认超时时间（毫秒） */
  defaultTimeout?: number;
  /** 启用自适应调度 */
  enableAdaptiveScheduling?: boolean;
  /** 启用失败恢复 */
  enableFailureRecovery?: boolean;
  /** 任务检查间隔（毫秒） */
  taskCheckInterval?: number;
}

/**
 * 编编排统计
 */
export interface OrchestrationStats {
  /** 总任务数 */
  totalTasks: number;
  /** 完成任务数 */
  completedTasks: number;
  /** 失败任务数 */
  failedTasks: number;
  /** 平均任务时长 */
  averageTaskDuration: number;
  /** 智能体利用率 */
  agentUtilization: Map<string, number>;
  /** 编排开始时间 */
  startedAt: number;
  /** 编排结束时间 */
  endedAt?: number;
}

/**
 * 事件类型
 */
export enum OrchestratorEvent {
  TASK_CREATED = "task_created",
  TASK_ASSIGNED = "task_assigned",
  TASK_STARTED = "task_started",
  TASK_COMPLETED = "task_completed",
  TASK_FAILED = "task_failed",
  AGENT_REGISTERED = "agent_registered",
  AGENT_UNREGISTERED = "agent_unregistered",
  PLAN_CREATED = "plan_created",
  PLAN_EXECUTED = "plan_executed",
}

/**
 * 事件监听器
 */
export type EventListener = (event: OrchestratorEvent, data: any) => void;

/**
 * TEA Protocol 编排器
 *
 * 实现三层架构：
 * - Strategic Layer: 高层规划，战略决策
 * - Tactical Layer: 任务分配，资源协调
 * - Operational Layer: 具体执行，任务完成
 */
export class TEAOrchestrator {
  private config: Required<TEAOrchestratorConfig>;
  private agents: Map<string, TEAAgent> = new Map();
  private tasks: Map<string, TEATask> = new Map();
  private plans: Map<string, ExecutionPlan> = new Map();
  private stats: OrchestrationStats;
  private eventListeners: Map<OrchestratorEvent, EventListener[]> = new Map();
  private executionTimer?: NodeJS.Timeout;
  private isRunning = false;

  // 默认配置
  private static readonly DEFAULT_CONFIG: Required<TEAOrchestratorConfig> = {
    maxParallelTasks: 10,
    defaultTimeout: 300000, // 5 minutes
    enableAdaptiveScheduling: true,
    enableFailureRecovery: true,
    taskCheckInterval: 1000,
  };

  constructor(config: TEAOrchestratorConfig = {}) {
    this.config = { ...TEAOrchestrator.DEFAULT_CONFIG, ...config };
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageTaskDuration: 0,
      agentUtilization: new Map(),
      startedAt: Date.now(),
    };
    console.log(`🍵 TEA Orchestrator 初始化 (maxParallel: ${this.config.maxParallelTasks})`);
  }

  /**
   * 注册智能体
   */
  registerAgent(agent: Omit<TEAAgent, "state" | "completedTasks" | "failedTasks" | "lastActiveAt">): void {
    const newAgent: TEAAgent = {
      ...agent,
      state: AgentState.IDLE,
      completedTasks: 0,
      failedTasks: 0,
      lastActiveAt: Date.now(),
    };
    this.agents.set(agent.id, newAgent);
    this.stats.agentUtilization.set(agent.id, 0);
    this.emit(OrchestratorEvent.AGENT_REGISTERED, newAgent);
    console.log(`🤖 注册智能体: ${agent.name} (${agent.role}@${agent.layer})`);
  }

  /**
   * 注销智能体
   */
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.stats.agentUtilization.delete(agentId);
      this.emit(OrchestratorEvent.AGENT_UNREGISTERED, agent);
      console.log(`🤖 注销智能体: ${agent.name}`);
    }
  }

  /**
   * 获取空闲智能体
   */
  private getAvailableAgents(layer: Layer, role?: AgentRole): TEAAgent[] {
    return Array.from(this.agents.values()).filter(
      agent =>
        agent.layer === layer &&
        agent.state === AgentState.IDLE &&
        (!role || agent.role === role)
    );
  }

  /**
   * TEA Phase 1: Task Decomposition (任务分解)
   */
  async decomposeTask(
    description: string,
    strategy: DecompositionStrategy
  ): Promise<TEATask> {
    console.log(`📋 TEA Phase 1: 分解任务 - ${description}`);
    console.log(`   策略: ${strategy.name}, 目标层级: ${strategy.targetLayer}`);

    const rootTask: TEATask = {
      id: this.generateId(),
      description,
      state: TaskState.PENDING,
      priority: TaskPriority.HIGH,
      targetLayer: Layer.STRATEGIC,
      subtasks: [],
      dependencies: [],
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      timeout: this.config.defaultTimeout,
    };

    this.tasks.set(rootTask.id, rootTask);
    this.stats.totalTasks++;

    // 递归分解任务
    await this.performDecomposition(rootTask, strategy, 0);

    rootTask.state = TaskState.DECOMPOSED;
    this.emit(OrchestratorEvent.TASK_CREATED, rootTask);

    console.log(`✅ 分解完成: ${this.countAllTasks(rootTask)} 个子任务`);
    return rootTask;
  }

  /**
   * 执行任务分解
   */
  private async performDecomposition(
    task: TEATask,
    strategy: DecompositionStrategy,
    currentDepth: number
  ): Promise<void> {
    // 检查是否达到目标层级
    if (task.targetLayer === strategy.targetLayer || currentDepth >= strategy.maxDepth) {
      return;
    }

    // 确定下一层级
    const nextLayer = this.getNextLayer(task.targetLayer);
    if (!nextLayer) {
      return;
    }

    // 根据分支因子创建子任务
    const numSubtasks = Math.min(strategy.branchingFactor, 5);
    for (let i = 0; i < numSubtasks; i++) {
      const subtask: TEATask = {
        id: this.generateId(),
        parentId: task.id,
        description: `${task.description} - 子任务 ${i + 1}`,
        state: TaskState.PENDING,
        priority: task.priority,
        targetLayer: nextLayer,
        subtasks: [],
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        timeout: this.config.defaultTimeout,
      };

      task.subtasks.push(subtask);
      this.tasks.set(subtask.id, subtask);
      this.stats.totalTasks++;

      // 递归分解
      await this.performDecomposition(subtask, strategy, currentDepth + 1);
    }
  }

  /**
   * 获取下一层级
   */
  private getNextLayer(currentLayer: Layer): Layer | null {
    const hierarchy = [Layer.STRATEGIC, Layer.TACTICAL, Layer.OPERATIONAL];
    const index = hierarchy.indexOf(currentLayer);
    if (index >= 0 && index < hierarchy.length - 1) {
      return hierarchy[index + 1];
    }
    return null;
  }

  /**
   * 计算所有任务数
   */
  private countAllTasks(rootTask: TEATask): number {
    let count = 1;
    for (const subtask of rootTask.subtasks) {
      count += this.countAllTasks(subtask);
    }
    return count;
  }

  /**
   * TEA Phase 2: Execution Planning (执行规划)
   */
  createExecutionPlan(rootTask: TEATask): ExecutionPlan {
    console.log(`📊 TEA Phase 2: 创建执行计划`);

    const taskGraph = new Map<string, TEATask>();
    const executionOrder: string[] = [];

    // 扁平化任务图
    const flattenTasks = (task: TEATask) => {
      taskGraph.set(task.id, task);
      executionOrder.push(task.id);
      for (const subtask of task.subtasks) {
        flattenTasks(subtask);
      }
    };
    flattenTasks(rootTask);

    // 拓扑排序（考虑依赖关系）
    const sorted = this.topologicalSort(Array.from(taskGraph.values()));

    // 分配智能体
    const agentAssignments = new Map<string, string[]>();
    for (const task of sorted) {
      const availableAgents = this.getAvailableAgents(task.targetLayer);
      if (availableAgents.length > 0) {
        // 选择利用率最低的智能体
        const agent = this.selectLeastUtilizedAgent(availableAgents);
        const currentTasks = agentAssignments.get(agent.id) || [];
        currentTasks.push(task.id);
        agentAssignments.set(agent.id, currentTasks);
        task.assignedAgentId = agent.id;
      }
    }

    const plan: ExecutionPlan = {
      id: this.generateId(),
      rootTask,
      taskGraph,
      agentAssignments,
      executionOrder: sorted.map(t => t.id),
      createdAt: Date.now(),
    };

    this.plans.set(plan.id, plan);
    this.emit(OrchestratorEvent.PLAN_CREATED, plan);

    console.log(`✅ 执行计划创建完成: ${sorted.length} 个任务, ${agentAssignments.size} 个智能体`);
    return plan;
  }

  /**
   * 拓扑排序
   */
  private topologicalSort(tasks: TEATask[]): TEATask[] {
    const sorted: TEATask[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        throw new Error(`检测到循环依赖: ${taskId}`);
      }

      visiting.add(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        for (const subtask of task.subtasks) {
          visit(subtask.id);
        }
        visited.add(taskId);
        sorted.unshift(task);
      }
      visiting.delete(taskId);
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return sorted;
  }

  /**
   * 选择利用率最低的智能体
   */
  private selectLeastUtilizedAgent(agents: TEAAgent[]): TEAAgent {
    return agents.reduce((min, agent) => {
      const minUtil = this.stats.agentUtilization.get(min.id) || 0;
      const agentUtil = this.stats.agentUtilization.get(agent.id) || 0;
      return agentUtil < minUtil ? agent : min;
    });
  }

  /**
   * TEA Phase 3: Execution (执行)
   */
  async executePlan(plan: ExecutionPlan): Promise<void> {
    console.log(`🚀 TEA Phase 3: 执行计划`);
    this.isRunning = true;
    this.stats.startedAt = Date.now();

    return new Promise((resolve, reject) => {
      const executeNext = async () => {
        if (!this.isRunning) {
          this.stats.endedAt = Date.now();
          return resolve();
        }

        // 查找待执行的任务
        const pendingTask = this.findNextPendingTask(plan);
        if (!pendingTask) {
          // 所有任务完成
          this.stats.endedAt = Date.now();
          this.emit(OrchestratorEvent.PLAN_EXECUTED, this.stats);
          console.log(`✅ 执行计划完成`);
          console.log(`   总任务: ${this.stats.totalTasks}`);
          console.log(`   完成: ${this.stats.completedTasks}`);
          console.log(`   失败: ${this.stats.failedTasks}`);
          return resolve();
        }

        // 分配并执行任务
        const agent = this.agents.get(pendingTask.assignedAgentId!);
        if (agent && agent.state === AgentState.IDLE) {
          await this.executeTask(agent, pendingTask);
        }

        // 继续下一个任务
        this.executionTimer = setTimeout(executeNext, this.config.taskCheckInterval);
      };

      executeNext();
    });
  }

  /**
   * 查找下一个待执行任务
   */
  private findNextPendingTask(plan: ExecutionPlan): TEATask | null {
    for (const taskId of plan.executionOrder) {
      const task = plan.taskGraph.get(taskId);
      if (task && task.state === TaskState.PENDING) {
        // 检查依赖是否满足
        const dependenciesMet = task.dependencies.every(depId => {
          const depTask = plan.taskGraph.get(depId);
          return depTask && depTask.state === TaskState.COMPLETED;
        });
        if (dependenciesMet) {
          return task;
        }
      }
    }
    return null;
  }

  /**
   * 执行单个任务
   */
  private async executeTask(agent: TEAAgent, task: TEATask): Promise<void> {
    // 更新状态
    agent.state = AgentState.BUSY;
    agent.currentTaskId = task.id;
    task.state = TaskState.IN_PROGRESS;
    task.startedAt = Date.now();

    this.emit(OrchestratorEvent.TASK_STARTED, { agent, task });

    try {
      console.log(`▶️ ${agent.name} 执行任务: ${task.description}`);

      // 模拟执行（实际应用中调用智能体的执行方法）
      await this.simulateExecution(task);

      // 任务完成
      task.state = TaskState.COMPLETED;
      task.completedAt = Date.now();
      task.result = { success: true };
      agent.completedTasks++;
      agent.state = AgentState.IDLE;
      agent.currentTaskId = undefined;
      agent.lastActiveAt = Date.now();

      // 更新统计
      this.stats.completedTasks++;
      const duration = task.completedAt - (task.startedAt || task.createdAt);
      this.updateAverageDuration(duration);

      // 更新智能体利用率
      const currentUtil = this.stats.agentUtilization.get(agent.id) || 0;
      this.stats.agentUtilization.set(agent.id, currentUtil + duration);

      this.emit(OrchestratorEvent.TASK_COMPLETED, { agent, task });
      console.log(`✅ 任务完成: ${task.description} (${duration}ms)`);

    } catch (error) {
      // 任务失败
      task.state = TaskState.FAILED;
      task.error = String(error);
      task.completedAt = Date.now();
      agent.failedTasks++;
      agent.state = AgentState.IDLE;
      agent.currentTaskId = undefined;

      this.stats.failedTasks++;

      // 失败恢复
      if (this.config.enableFailureRecovery && task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.state = TaskState.PENDING;
        console.log(`🔄 重试任务: ${task.description} (${task.retryCount}/${task.maxRetries})`);
      } else {
        this.emit(OrchestratorEvent.TASK_FAILED, { agent, task, error });
        console.error(`❌ 任务失败: ${task.description} - ${error}`);
      }
    }
  }

  /**
   * 模拟任务执行
   */
  private async simulateExecution(task: TEATask): Promise<void> {
    // 根据层级决定模拟执行时间
    const baseDelay = {
      [Layer.STRATEGIC]: 100,
      [Layer.TACTICAL]: 50,
      [Layer.OPERATIONAL]: 20,
    };
    const delay = baseDelay[task.targetLayer] || 50;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 更新平均执行时长
   */
  private updateAverageDuration(duration: number): void {
    const count = this.stats.completedTasks;
    const current = this.stats.averageTaskDuration;
    this.stats.averageTaskDuration = (current * (count - 1) + duration) / count;
  }

  /**
   * TEA Phase 4: Adaptation (适应)
   */
  async adapt(performanceMetrics: Record<string, number>): Promise<void> {
    console.log(`🔄 TEA Phase 4: 适应调整`);

    if (!this.config.enableAdaptiveScheduling) {
      return;
    }

    // 根据性能指标调整智能体配置
    for (const agent of this.agents.values()) {
      const utilization = this.stats.agentUtilization.get(agent.id) || 0;
      const successRate = agent.completedTasks / Math.max(1, agent.completedTasks + agent.failedTasks);

      // 适应策略：低利用率+高成功率的智能体可以承担更多任务
      if (utilization < 10000 && successRate > 0.9) {
        console.log(`   ${agent.name}: 利用率低 (${utilization}ms), 可增加负载`);
      }

      // 高失败率智能体需要调整
      if (successRate < 0.5 && agent.failedTasks > 5) {
        console.log(`   ${agent.name}: 失败率高 (${(successRate * 100).toFixed(1)}%), 建议检查能力配置`);
      }
    }
  }

  /**
   * 停止执行
   */
  stop(): void {
    console.log(`🛑 TEA Orchestrator 停止执行`);
    this.isRunning = false;
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = undefined;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): OrchestrationStats {
    return { ...this.stats };
  }

  /**
   * 添加事件监听器
   */
  on(event: OrchestratorEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  /**
   * 移除事件监听器
   */
  off(event: OrchestratorEvent, listener: EventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: OrchestratorEvent, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    for (const listener of listeners) {
      try {
        listener(event, data);
      } catch (error) {
        console.error(`事件监听器错误 (${event}):`, error);
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `tea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取智能体状态
   */
  getAgentState(): Map<string, TEAAgent> {
    return new Map(this.agents);
  }

  /**
   * 获取任务状态
   */
  getTaskState(): Map<string, TEATask> {
    return new Map(this.tasks);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop();
    this.agents.clear();
    this.tasks.clear();
    this.plans.clear();
    this.eventListeners.clear();
  }
}

/**
 * 创建 TEA 编排器
 */
export function createTEAOrchestrator(config?: TEAOrchestratorConfig): TEAOrchestrator {
  return new TEAOrchestrator(config);
}

/**
 * 预定义分解策略
 */
export const DecompositionStrategies = {
  /** 三层标准分解 */
  THREE_LAYER: {
    name: "three_layer",
    targetLayer: Layer.OPERATIONAL,
    maxDepth: 3,
    branchingFactor: 3,
    allowParallel: true,
  },
  /** 战术聚焦 */
  TACTICAL_FOCUS: {
    name: "tactical_focus",
    targetLayer: Layer.TACTICAL,
    maxDepth: 2,
    branchingFactor: 5,
    allowParallel: true,
  },
  /** 操作分解 */
  OPERATIONAL_DEEP: {
    name: "operational_deep",
    targetLayer: Layer.OPERATIONAL,
    maxDepth: 4,
    branchingFactor: 2,
    allowParallel: false,
  },
} as const;
