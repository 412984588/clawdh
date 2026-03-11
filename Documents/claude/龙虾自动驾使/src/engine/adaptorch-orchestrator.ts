/**
 * 🔄 AdaptOrch - 任务自适应多智能体编排器
 *
 * 基于 arXiv:2602.16873 "AdaptOrch: Task-Adaptive Multi-Agent Orchestration
 * in the Era of LLM Performance Convergence"
 *
 * 核心思想：当 LLM 性能收敛时，编排拓扑比模型选择更重要
 *
 * @see {@link https://arxiv.org/abs/2602.16873} - AdaptOrch Paper
 * @see {@link https://arxiv.org/html/2602.16873} - HTML Version
 *
 * @version 2.12.0
 * @since 2025-03-11
 */

/**
 * 规范拓扑类型
 */
export enum CanonicalTopology {
  /** 并行 - 所有子任务并发执行，输出事后合并 */
  PARALLEL = "parallel",
  /** 顺序 - 子任务按拓扑顺序执行，每个接收前置上下文 */
  SEQUENTIAL = "sequential",
  /** 层次 - 主导智能体分解并委派，子智能体回报 */
  HIERARCHICAL = "hierarchical",
  /** 混合 - DAG 分割为并行组，按顺序连接 */
  HYBRID = "hybrid",
}

/**
 * 耦合强度级别
 */
export enum CouplingStrength {
  /** 无耦合 - 输出完全独立 */
  NONE = 0.0,
  /** 弱耦合 - 共享上下文有帮助但非必需 */
  WEAK = 0.3,
  /** 强耦合 - u 的输出是 v 的直接输入 */
  STRONG = 0.7,
  /** 关键耦合 - 需要语义一致性 */
  CRITICAL = 1.0,
}

/**
 * 子任务定义
 */
export interface Subtask {
  /** 子任务标识符 */
  id: string;
  /** 自然语言描述 */
  description: string;
  /** 预计计算成本（token） */
  estimatedCost: number;
  /** 所需的上下文大小 */
  contextSize?: number;
  /** 子任务类型/领域 */
  domain?: string;
  /** 状态 */
  status: "pending" | "in_progress" | "completed" | "failed";
  /** 执行结果 */
  result?: any;
}

/**
 * 任务依赖边
 */
export interface DependencyEdge {
  /** 源子任务 ID */
  source: string;
  /** 目标子任务 ID */
  target: string;
  /** 耦合强度 */
  coupling: CouplingStrength;
}

/**
 * 任务依赖 DAG
 */
export interface TaskDependencyDAG {
  /** 子任务节点集合 */
  vertices: Map<string, Subtask>;
  /** 依赖边集合 */
  edges: Map<string, DependencyEdge>;
  /** 顶点权重函数 */
  weights: Map<string, number>;
  /** 边耦合函数 */
  couplings: Map<string, CouplingStrength>;
}

/**
 * DAG 结构属性
 */
export interface DAGStructure {
  /** 并行宽度 - 最大反链大小 */
  parallelismWidth: number;
  /** 关键路径深度 */
  criticalPathDepth: number;
  /** 耦合密度 */
  couplingDensity: number;
  /** 顶点数量 */
  vertexCount: number;
  /** 边数量 */
  edgeCount: number;
}

/**
 * 拓扑路由决策
 */
export interface TopologyRouteDecision {
  /** 选择的拓扑 */
  topology: CanonicalTopology;
  /** 置信度分数 */
  confidence: number;
  /** 决策理由 */
  reasoning: string;
  /** 计算的 DAG 属性 */
  dagProperties: DAGStructure;
}

/**
 * 执行计划
 */
export interface ExecutionPlan {
  /** 使用的拓扑 */
  topology: CanonicalTopology;
  /** 执行阶段 */
  stages: ExecutionStage[];
  /** 预计总成本 */
  estimatedTotalCost: number;
  /** 预计执行时间（相对于顺序执行） */
  estimatedSpeedup: number;
}

/**
 * 执行阶段
 */
export interface ExecutionStage {
  /** 阶段 ID */
  id: number;
  /** 并行执行的子任务 */
  subtasks: Subtask[];
  /** 阶段类型 */
  type: "parallel" | "sequential" | "hierarchical";
}

/**
 * 一致性分数
 */
export interface ConsistencyScore {
  /** 分数值 0-1 */
  score: number;
  /** 评估详情 */
  details: {
    totalPairs: number;
    consistentPairs: number;
    averageSimilarity: number;
  };
}

/**
 * 合成结果
 */
export interface SynthesisResult {
  /** 合成后的最终输出 */
  output: any;
  /** 一致性分数 */
  consistency: ConsistencyScore;
  /** 使用的迭代次数 */
  iterations: number;
  /** 是否成功收敛 */
  converged: boolean;
}

/**
 * 拓扑执行结果
 */
export interface TopologyExecutionResult {
  /** 是否成功 */
  success: boolean;
  /** 各子任务结果 */
  subtaskResults: Map<string, any>;
  /** 执行计划 */
  plan: ExecutionPlan;
  /** 实际执行时间（ms） */
  executionTime: number;
  /** 使用的拓扑 */
  topology: CanonicalTopology;
}

/**
 * AdaptOrch 配置
 */
export interface AdaptOrchConfig {
  /** 并行度阈值 (0-1) */
  parallelismThreshold?: number;
  /** 耦合密度阈值 (0-1) */
  couplingThreshold?: number;
  /** 层次最小子任务数 */
  hierarchicalMinTasks?: number;
  /** 一致性分数阈值 (0-1) */
  consistencyThreshold?: number;
  /** 最大重路由次数 */
  maxReroutingAttempts?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<AdaptOrchConfig> = {
  parallelismThreshold: 0.5,
  couplingThreshold: 0.6,
  hierarchicalMinTasks: 5,
  consistencyThreshold: 0.7,
  maxReroutingAttempts: 3,
  enableDetailedLogging: false,
};

/**
 * 🔄 AdaptOrch 编排器
 *
 * 根据任务 DAG 结构属性自动选择最优执行拓扑
 */
export class AdaptOrchOrchestrator {
  private config: Required<AdaptOrchConfig>;
  private executionHistory: Array<{
    taskId: string;
    topology: CanonicalTopology;
    result: TopologyExecutionResult;
    timestamp: number;
  }> = [];

  constructor(config: AdaptOrchConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log(`🔄 AdaptOrch 编排器初始化 (并行阈值: ${this.config.parallelismThreshold}, 耦合阈值: ${this.config.couplingThreshold})`);
  }

  /**
   * 阶段 1: 任务分解
   */
  async decomposeTask(taskDescription: string, context?: any): Promise<Subtask[]> {
    console.log(`📋 阶段 1: 任务分解 - "${taskDescription.substring(0, 50)}..."`);

    // 模拟 LLM 分解过程
    const subtasks: Subtask[] = [
      {
        id: "subtask_1",
        description: "分析任务需求",
        estimatedCost: 1000,
        contextSize: 2000,
        status: "pending",
      },
      {
        id: "subtask_2",
        description: "制定执行计划",
        estimatedCost: 1500,
        contextSize: 3000,
        status: "pending",
      },
      {
        id: "subtask_3",
        description: "执行核心操作",
        estimatedCost: 5000,
        contextSize: 5000,
        status: "pending",
      },
      {
        id: "subtask_4",
        description: "验证结果",
        estimatedCost: 1000,
        contextSize: 2000,
        status: "pending",
      },
    ];

    console.log(`   ✅ 分解为 ${subtasks.length} 个子任务`);
    return subtasks;
  }

  /**
   * 阶段 2: 构建 DAG
   */
  async buildDAG(
    subtasks: Subtask[],
    dependencies: Array<{ from: string; to: string; coupling: CouplingStrength }>
  ): Promise<TaskDependencyDAG> {
    console.log(`🔗 阶段 2: 构建 DAG (${subtasks.length} 个顶点, ${dependencies.length} 条边)`);

    const vertices = new Map<string, Subtask>();
    const edges = new Map<string, DependencyEdge>();
    const weights = new Map<string, number>();
    const couplings = new Map<string, CouplingStrength>();

    // 添加顶点
    for (const subtask of subtasks) {
      vertices.set(subtask.id, subtask);
      weights.set(subtask.id, subtask.estimatedCost);
    }

    // 添加边
    for (const dep of dependencies) {
      const edgeKey = `${dep.from}->${dep.to}`;
      edges.set(edgeKey, {
        source: dep.from,
        target: dep.to,
        coupling: dep.coupling,
      });
      const couplingKey = `${dep.from}:${dep.to}`;
      couplings.set(couplingKey, dep.coupling);
    }

    const dag: TaskDependencyDAG = {
      vertices,
      edges,
      weights,
      couplings,
    };

    // 验证 DAG 有效性
    const hasCycle = this.detectCycle(dag);
    if (hasCycle) {
      throw new Error("任务依赖包含循环，无法构建有效 DAG");
    }

    console.log(`   ✅ DAG 构建完成 (无环)`);
    return dag;
  }

  /**
   * 阶段 3: 拓扑路由
   */
  async routeTopology(dag: TaskDependencyDAG): Promise<TopologyRouteDecision> {
    console.log(`🧭 阶段 3: 拓扑路由`);

    // 计算 DAG 结构属性
    const structure = this.analyzeDAGStructure(dag);

    // 应用路由算法
    const topology = this.selectTopology(structure);

    const decision: TopologyRouteDecision = {
      topology: topology.topology,
      confidence: topology.confidence,
      reasoning: topology.reasoning,
      dagProperties: structure,
    };

    console.log(`   ✅ 选择拓扑: ${decision.topology} (置信度: ${decision.confidence.toFixed(2)})`);
    console.log(`   📊 DAG 属性: ω=${structure.parallelismWidth}, δ=${structure.criticalPathDepth}, γ=${structure.couplingDensity.toFixed(2)}`);

    return decision;
  }

  /**
   * 阶段 4: 拓扑特定执行
   */
  async executeTopology(
    dag: TaskDependencyDAG,
    decision: TopologyRouteDecision
  ): Promise<TopologyExecutionResult> {
    console.log(`⚡ 阶段 4: 执行拓扑 (${decision.topology})`);

    const startTime = Date.now();

    // 生成执行计划
    const plan = this.generateExecutionPlan(dag, decision);

    // 执行计划
    const subtaskResults = new Map<string, any>();

    for (const stage of plan.stages) {
      if (stage.type === "parallel") {
        // 并行执行
        const results = await Promise.all(
          stage.subtasks.map(async (subtask) => {
            return await this.executeSubtask(subtask);
          })
        );
        for (let i = 0; i < stage.subtasks.length; i++) {
          subtaskResults.set(stage.subtasks[i].id, results[i]);
        }
      } else if (stage.type === "sequential") {
        // 顺序执行
        let accumulatedContext = "";
        for (const subtask of stage.subtasks) {
          const result = await this.executeSubtask(subtask, accumulatedContext);
          subtaskResults.set(subtask.id, result);
          accumulatedContext += this.truncateContext(JSON.stringify(result), 1000);
        }
      } else if (stage.type === "hierarchical") {
        // 层次执行
        await this.executeHierarchical(dag, stage, subtaskResults);
      }
    }

    const executionTime = Date.now() - startTime;

    const result: TopologyExecutionResult = {
      success: true,
      subtaskResults,
      plan,
      executionTime,
      topology: decision.topology,
    };

    console.log(`   ✅ 执行完成 (${executionTime}ms)`);

    return result;
  }

  /**
   * 阶段 5: 自适应合成
   */
  async synthesize(
    outputs: Map<string, any>,
    topology: CanonicalTopology
  ): Promise<SynthesisResult> {
    console.log(`🔀 阶段 5: 自适应合成`);

    let iteration = 0;
    let currentCoupling = this.estimateCoupling(outputs);
    let converged = false;
    let finalOutput: any = null;

    while (iteration < this.config.maxReroutingAttempts && !converged) {
      iteration++;

      // 计算一致性分数
      const consistency = this.computeConsistencyScore(outputs);

      console.log(`   迭代 ${iteration}: CS=${consistency.score.toFixed(2)}, γ=${currentCoupling.toFixed(2)}`);

      if (topology === CanonicalTopology.SEQUENTIAL) {
        // 顺序拓扑：最后输出即最终输出
        const lastKey = Array.from(outputs.keys()).pop()!;
        finalOutput = outputs.get(lastKey);
        converged = true;
      } else if (consistency.score >= this.config.consistencyThreshold) {
        // 一致性足够高：合并输出
        finalOutput = await this.mergeOutputs(outputs);
        converged = true;
      } else {
        // 一致性不足：增加耦合并重路由
        currentCoupling = Math.min(1.0, currentCoupling + 0.2);
        console.log(`   ⚠️ 一致性不足，增加耦合至 ${currentCoupling.toFixed(2)} 并重路由`);
      }

      if (converged) {
        console.log(`   ✅ 合成收敛 (${iteration} 次迭代)`);
        break;
      }
    }

    const result: SynthesisResult = {
      output: finalOutput,
      consistency: this.computeConsistencyScore(outputs),
      iterations: iteration,
      converged,
    };

    return result;
  }

  /**
   * 完整流程：处理任务
   */
  async processTask(taskDescription: string): Promise<{
    decomposition: Subtask[];
    dag: TaskDependencyDAG;
    routeDecision: TopologyRouteDecision;
    execution: TopologyExecutionResult;
    synthesis: SynthesisResult;
  }> {
    // Phase 1: 分解
    const subtasks = await this.decomposeTask(taskDescription);

    // Phase 2: 构建默认依赖（简单顺序依赖）
    const dependencies = subtasks.slice(0, -1).map((st, i) => ({
      from: st.id,
      to: subtasks[i + 1].id,
      coupling: CouplingStrength.WEAK,
    }));

    // Phase 3: 构建 DAG
    const dag = await this.buildDAG(subtasks, dependencies);

    // Phase 4: 拓扑路由
    const routeDecision = await this.routeTopology(dag);

    // Phase 5: 执行
    const execution = await this.executeTopology(dag, routeDecision);

    // Phase 6: 合成
    const synthesis = await this.synthesize(execution.subtaskResults, routeDecision.topology);

    // 记录历史
    this.executionHistory.push({
      taskId: `task_${Date.now()}`,
      topology: routeDecision.topology,
      result: execution,
      timestamp: Date.now(),
    });

    return {
      decomposition: subtasks,
      dag,
      routeDecision,
      execution,
      synthesis,
    };
  }

  /**
   * 分析 DAG 结构属性
   */
  private analyzeDAGStructure(dag: TaskDependencyDAG): DAGStructure {
    const vertexCount = dag.vertices.size;
    const edgeCount = dag.edges.size;

    // 计算并行宽度（最大反链大小）
    const parallelismWidth = this.computeParallelismWidth(dag);

    // 计算关键路径深度
    const criticalPathDepth = this.computeCriticalPathDepth(dag);

    // 计算耦合密度
    let totalCoupling = 0;
    for (const coupling of dag.couplings.values()) {
      totalCoupling += coupling;
    }
    const couplingDensity = edgeCount > 0 ? totalCoupling / edgeCount : 0;

    return {
      parallelismWidth,
      criticalPathDepth,
      couplingDensity,
      vertexCount,
      edgeCount,
    };
  }

  /**
   * 计算并行宽度（Dilworth 定理）
   */
  private computeParallelismWidth(dag: TaskDependencyDAG): number {
    // 简化实现：通过拓扑排序计算最大层宽度
    const inDegree = new Map<string, number>();
    for (const vertex of dag.vertices.keys()) {
      inDegree.set(vertex, 0);
    }
    for (const edge of dag.edges.values()) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // 拓扑排序并计算每层宽度
    const layers: string[][] = [];
    const visited = new Set<string>();

    while (visited.size < dag.vertices.size) {
      const currentLayer: string[] = [];

      for (const [vertex, degree] of inDegree) {
        if (degree === 0 && !visited.has(vertex)) {
          currentLayer.push(vertex);
          visited.add(vertex);
        }
      }

      if (currentLayer.length === 0) {
        break; // 剩余顶点形成环（已在 buildDAG 中检查）
      }

      layers.push(currentLayer);

      // 更新入度
      for (const vertex of currentLayer) {
        inDegree.delete(vertex);
        for (const edge of dag.edges.values()) {
          if (edge.source === vertex) {
            const newDegree = (inDegree.get(edge.target) || 0) - 1;
            inDegree.set(edge.target, newDegree);
          }
        }
      }
    }

    // 返回最大层宽度
    return Math.max(...layers.map((l) => l.length), 1);
  }

  /**
   * 计算关键路径深度
   */
  private computeCriticalPathDepth(dag: TaskDependencyDAG): number {
    // 使用 DP 计算最长路径
    const dist = new Map<string, number>();
    for (const vertex of dag.vertices.keys()) {
      dist.set(vertex, dag.weights.get(vertex) || 0);
    }

    // 按拓扑顺序处理
    const sorted = this.topologicalSort(dag);
    for (const vertex of sorted) {
      for (const edge of dag.edges.values()) {
        if (edge.source === vertex) {
          const newDist = dist.get(vertex)! + (dag.weights.get(edge.target) || 0);
          if (newDist > (dist.get(edge.target) || 0)) {
            dist.set(edge.target, newDist);
          }
        }
      }
    }

    return Math.max(...Array.from(dist.values()), 0);
  }

  /**
   * 拓扑排序
   */
  private topologicalSort(dag: TaskDependencyDAG): string[] {
    const inDegree = new Map<string, number>();
    for (const vertex of dag.vertices.keys()) {
      inDegree.set(vertex, 0);
    }
    for (const edge of dag.edges.values()) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    const result: string[] = [];
    const queue: string[] = [];

    for (const [vertex, degree] of inDegree) {
      if (degree === 0) {
        queue.push(vertex);
      }
    }

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      result.push(vertex);

      for (const edge of dag.edges.values()) {
        if (edge.source === vertex) {
          const newDegree = (inDegree.get(edge.target) || 0) - 1;
          inDegree.set(edge.target, newDegree);
          if (newDegree === 0) {
            queue.push(edge.target);
          }
        }
      }
    }

    return result;
  }

  /**
   * 拓扑选择算法
   */
  private selectTopology(structure: DAGStructure): {
    topology: CanonicalTopology;
    confidence: number;
    reasoning: string;
  } {
    const {
      parallelismWidth,
      criticalPathDepth,
      couplingDensity,
      vertexCount,
      edgeCount,
    } = structure;

    const r = parallelismWidth / vertexCount; // 并行比例

    // 规则 1: 无依赖 -> 并行
    if (edgeCount === 0) {
      return {
        topology: CanonicalTopology.PARALLEL,
        confidence: 0.95,
        reasoning: "无依赖边，完全并行",
      };
    }

    // 规则 2: 完全顺序 -> 顺序
    if (parallelismWidth === 1) {
      return {
        topology: CanonicalTopology.SEQUENTIAL,
        confidence: 0.95,
        reasoning: "完全依赖链，顺序执行",
      };
    }

    // 规则 3: 高耦合 + 多任务 -> 层次
    if (
      couplingDensity > this.config.couplingThreshold &&
      vertexCount > this.config.hierarchicalMinTasks
    ) {
      return {
        topology: CanonicalTopology.HIERARCHICAL,
        confidence: 0.8,
        reasoning: `高耦合 (${couplingDensity.toFixed(2)}) + 多任务 (${vertexCount})`,
      };
    }

    // 规则 4: 宽 DAG + 低耦合 -> 并行
    if (
      r > this.config.parallelismThreshold &&
      couplingDensity <= this.config.couplingThreshold
    ) {
      return {
        topology: CanonicalTopology.PARALLEL,
        confidence: 0.85,
        reasoning: `宽并行 DAG (r=${r.toFixed(2)}) + 低耦合`,
      };
    }

    // 规则 5: 默认 -> 混合
    return {
      topology: CanonicalTopology.HYBRID,
      confidence: 0.75,
      reasoning: "混合拓扑，平衡并行与依赖",
    };
  }

  /**
   * 生成执行计划
   */
  private generateExecutionPlan(
    dag: TaskDependencyDAG,
    decision: TopologyRouteDecision
  ): ExecutionPlan {
    const stages: ExecutionStage[] = [];
    const subtasks = Array.from(dag.vertices.values());

    switch (decision.topology) {
      case CanonicalTopology.PARALLEL:
        stages.push({
          id: 1,
          subtasks,
          type: "parallel",
        });
        break;

      case CanonicalTopology.SEQUENTIAL:
        stages.push({
          id: 1,
          subtasks: this.topologicalSort(dag).map((id) => dag.vertices.get(id)!),
          type: "sequential",
        });
        break;

      case CanonicalTopology.HIERARCHICAL:
        stages.push({
          id: 1,
          subtasks: [subtasks[0]], // 主导智能体
          type: "hierarchical",
        });
        break;

      case CanonicalTopology.HYBRID:
        // 按拓扑层分组
        const layers = this.groupByTopologicalLayers(dag);
        for (let i = 0; i < layers.length; i++) {
          stages.push({
            id: i + 1,
            subtasks: layers[i].map((id) => dag.vertices.get(id)!),
            type: "parallel",
          });
        }
        break;
    }

    // 估算加速比
    const sequentialCost = Array.from(dag.weights.values()).reduce((a, b) => a + b, 0);
    const parallelCost = decision.topology === CanonicalTopology.PARALLEL
      ? Math.max(...Array.from(dag.weights.values()))
      : sequentialCost;
    const estimatedSpeedup = sequentialCost / parallelCost;

    return {
      topology: decision.topology,
      stages,
      estimatedTotalCost: sequentialCost,
      estimatedSpeedup,
    };
  }

  /**
   * 按拓扑层分组
   */
  private groupByTopologicalLayers(dag: TaskDependencyDAG): string[][] {
    const inDegree = new Map<string, number>();
    for (const vertex of dag.vertices.keys()) {
      inDegree.set(vertex, 0);
    }
    for (const edge of dag.edges.values()) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    const layers: string[][] = [];
    const visited = new Set<string>();

    while (visited.size < dag.vertices.size) {
      const currentLayer: string[] = [];

      for (const [vertex, degree] of inDegree) {
        if (degree === 0 && !visited.has(vertex)) {
          currentLayer.push(vertex);
          visited.add(vertex);
        }
      }

      if (currentLayer.length > 0) {
        layers.push(currentLayer);

        for (const vertex of currentLayer) {
          inDegree.delete(vertex);
          for (const edge of dag.edges.values()) {
            if (edge.source === vertex) {
              const newDegree = (inDegree.get(edge.target) || 0) - 1;
              inDegree.set(edge.target, newDegree);
            }
          }
        }
      } else {
        break;
      }
    }

    return layers;
  }

  /**
   * 执行单个子任务
   */
  private async executeSubtask(subtask: Subtask, context?: string): Promise<any> {
    subtask.status = "in_progress";

    // 模拟执行
    await new Promise((resolve) => setTimeout(resolve, 50));

    subtask.status = "completed";
    return {
      subtaskId: subtask.id,
      result: `Result for ${subtask.description}`,
      timestamp: Date.now(),
    };
  }

  /**
   * 执行层次拓扑
   */
  private async executeHierarchical(
    dag: TaskDependencyDAG,
    stage: ExecutionStage,
    results: Map<string, any>
  ): Promise<void> {
    // 主导智能体协调
    const leadTask = stage.subtasks[0];

    for (const [id, subtask] of dag.vertices) {
      if (id === leadTask.id) continue;
      const result = await this.executeSubtask(subtask);
      results.set(id, result);
    }
  }

  /**
   * 计算一致性分数
   */
  private computeConsistencyScore(outputs: Map<string, any>): ConsistencyScore {
    const outputArray = Array.from(outputs.values());
    const n = outputArray.length;

    if (n <= 1) {
      return {
        score: 1.0,
        details: {
          totalPairs: 0,
          consistentPairs: 0,
          averageSimilarity: 1.0,
        },
      };
    }

    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const similarity = this.computeSimilarity(outputArray[i], outputArray[j]);
        totalSimilarity += similarity;
        pairCount++;
      }
    }

    const score = pairCount > 0 ? totalSimilarity / pairCount : 1.0;

    return {
      score,
      details: {
        totalPairs: pairCount,
        consistentPairs: Math.floor(score * pairCount),
        averageSimilarity: score,
      },
    };
  }

  /**
   * 计算两个输出的语义相似度
   */
  private computeSimilarity(output1: any, output2: any): number {
    // 简化实现：基于 JSON 字符串相似度
    const str1 = JSON.stringify(output1);
    const str2 = JSON.stringify(output2);

    // 余弦相似度
    const intersection = this.intersectionSize(str1, str2);
    const union = this.unionSize(str1, str2);

    return union > 0 ? intersection / union : 1.0;
  }

  /**
   * 计算交集大小（字符级别）
   */
  private intersectionSize(str1: string, str2: string): number {
    const set1 = new Set(str1);
    const set2 = new Set(str2);
    let count = 0;
    for (const char of set1) {
      if (set2.has(char)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 计算并集大小
   */
  private unionSize(str1: string, str2: string): number {
    const set1 = new Set(str1);
    const set2 = new Set(str2);
    return new Set([...set1, ...set2]).size;
  }

  /**
   * 估算耦合度
   */
  private estimateCoupling(outputs: Map<string, any>): number {
    const outputArray = Array.from(outputs.values());
    if (outputArray.length <= 1) return 0;

    let totalCoupling = 0;
    let pairCount = 0;

    for (let i = 0; i < outputArray.length; i++) {
      for (let j = i + 1; j < outputArray.length; j++) {
        const similarity = this.computeSimilarity(outputArray[i], outputArray[j]);
        totalCoupling += similarity;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalCoupling / pairCount : 0;
  }

  /**
   * 合并输出
   */
  private async mergeOutputs(outputs: Map<string, any>): Promise<any> {
    // 简化实现：返回合并的结果
    const results = Array.from(outputs.values());
    return {
      merged: true,
      resultCount: results.length,
      summary: `Merged ${results.length} outputs`,
    };
  }

  /**
   * 截断上下文
   */
  private truncateContext(context: string, maxLength: number): string {
    if (context.length <= maxLength) {
      return context;
    }
    return context.substring(0, maxLength) + "...";
  }

  /**
   * 检测环
   */
  private detectCycle(dag: TaskDependencyDAG): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (vertex: string): boolean => {
      visited.add(vertex);
      recStack.add(vertex);

      for (const edge of dag.edges.values()) {
        if (edge.source === vertex) {
          if (!visited.has(edge.target) && dfs(edge.target)) {
            return true;
          } else if (recStack.has(edge.target)) {
            return true;
          }
        }
      }

      recStack.delete(vertex);
      return false;
    };

    for (const vertex of dag.vertices.keys()) {
      if (!visited.has(vertex)) {
        if (dfs(vertex)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(): typeof this.executionHistory {
    return [...this.executionHistory];
  }

  /**
   * 获取拓扑选择统计
   */
  getTopologyStats(): Map<CanonicalTopology, number> {
    const stats = new Map<CanonicalTopology, number>();
    stats.set(CanonicalTopology.PARALLEL, 0);
    stats.set(CanonicalTopology.SEQUENTIAL, 0);
    stats.set(CanonicalTopology.HIERARCHICAL, 0);
    stats.set(CanonicalTopology.HYBRID, 0);

    for (const record of this.executionHistory) {
      stats.set(record.topology, (stats.get(record.topology) || 0) + 1);
    }

    return stats;
  }
}

/**
 * 工厂函数：创建 AdaptOrch 编排器
 */
export function createAdaptOrchOrchestrator(
  config?: AdaptOrchConfig
): AdaptOrchOrchestrator {
  return new AdaptOrchOrchestrator(config);
}

/**
 * 任务模板
 */
export const AdaptOrchTemplates = {
  /** 编码任务（高并行度） */
  coding: {
    description: "实现一个新功能模块",
    expectedParallelism: 3,
    expectedCoupling: 0.35,
    recommendedTopology: CanonicalTopology.PARALLEL,
  },

  /** 推理任务（高耦合） */
  reasoning: {
    description: "解决复杂的科学问题",
    expectedParallelism: 1,
    expectedCoupling: 0.55,
    recommendedTopology: CanonicalTopology.SEQUENTIAL,
  },

  /** 混合任务（平衡） */
  hybrid: {
    description: "分析文档并生成报告",
    expectedParallelism: 2,
    expectedCoupling: 0.45,
    recommendedTopology: CanonicalTopology.HYBRID,
  },
};
