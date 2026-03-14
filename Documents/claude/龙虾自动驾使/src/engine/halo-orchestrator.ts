/**
 * 🌟 HALO 分层自主逻辑导向编排器
 *
 * 基于 arXiv:2505.13516 "HALO: Hierarchical Autonomous Logic-Oriented Orchestration for Multi-Agent LLM Systems"
 *
 * 核心思想：通过分层推理架构实现多智能体协作
 *
 * 三层架构:
 * 1. High-Level Planning Agent - 任务分解
 * 2. Mid-Level Role-Design Agents - 子任务特定代理实例化
 * 3. Low-Level Inference Agents - 子任务执行
 *
 * 关键创新：
 * - MCTS 工作流搜索：系统化探索代理行动空间
 * - 自适应提示优化：将原始查询转换为任务特定提示
 * - 动态角色分配：根据子任务需求实例化代理
 *
 * @see {@link https://arxiv.org/abs/2505.13516} - HALO Paper
 * @see {@link https://github.com/23japhone/HALO} - Reference Implementation
 *
 * @version 2.15.0
 * @since 2025-03-11
 */

/**
 * 代理层级
 */
export enum AgentLevel {
  /** 高层规划 - 任务分解 */
  HIGH_LEVEL = "high_level",
  /** 中层设计 - 角色分配 */
  MID_LEVEL = "mid_level",
  /** 低层推理 - 子任务执行 */
  LOW_LEVEL = "low_level",
}

/**
 * MCTS 节点类型
 */
export enum MCTSNodeType {
  /** 根节点 - 初始状态 */
  ROOT = "root",
  /** 决策节点 - 选择行动 */
  DECISION = "decision",
  /** 终端节点 - 最终状态 */
  TERMINAL = "terminal",
}

/**
 * 工作流动作类型
 */
export enum WorkflowActionType {
  /** 思维链推理 */
  REASONING = "reasoning",
  /** 工具调用 */
  TOOL_USE = "tool_use",
  /** 信息检索 */
  RETRIEVAL = "retrieval",
  /** 验证 */
  VERIFICATION = "verification",
  /** 综合 */
  SYNTHESIS = "synthesis",
}

/**
 * 子任务定义
 */
export interface SubTask {
  /** 子任务 ID */
  taskId: string;
  /** 父任务 ID */
  parentTaskId?: string;
  /** 任务描述 */
  description: string;
  /** 任务类型 */
  taskType: string;
  /** 所需技能 */
  requiredSkills: string[];
  /** 优先级 */
  priority: number;
  /** 状态 */
  status: "pending" | "assigned" | "in_progress" | "completed" | "failed";
  /** 分配的代理角色 */
  assignedAgentRole?: string;
}

/**
 * 代理角色配置
 */
export interface AgentRole {
  /** 角色名称 */
  roleName: string;
  /** 角色描述 */
  description: string;
  /** 角色能力 */
  capabilities: string[];
  /** 提示词模板 */
  promptTemplate: string;
  /** 层级 */
  level: AgentLevel;
}

/**
 * MCTS 节点
 */
export interface MCTSNode {
  /** 节点 ID */
  nodeId: string;
  /** 父节点 ID */
  parentId?: string;
  /** 节点类型 */
  nodeType: MCTSNodeType;
  /** 状态表示 */
  state: any;
  /** 到此节点的动作序列 */
  actionPath: WorkflowAction[];
  /** 访问次数 */
  visitCount: number;
  /** 累积奖励 */
  totalReward: number;
  /** 平均奖励 (UCB1) */
  averageReward: number;
  /** 子节点 */
  children: MCTSNode[];
}

/**
 * 工作流动作
 */
export interface WorkflowAction {
  /** 动作 ID */
  actionId: string;
  /** 动作类型 */
  actionType: WorkflowActionType;
  /** 动作参数 */
  parameters: Record<string, any>;
  /** 前置条件 */
  preconditions?: string[];
  /** 预期结果 */
  expectedOutcome?: string;
}

/**
 * 提示优化结果
 */
export interface PromptRefinement {
  /** 原始查询 */
  originalQuery: string;
  /** 优化后的提示 */
  refinedPrompt: string;
  /** 任务类型推断 */
  inferredTaskType: string;
  /** 所需技能推断 */
  requiredSkills: string[];
  /** 置信度 */
  confidence: number;
}

/**
 * HALO 输出
 */
export interface HALOOutput {
  /** 最终答案 */
  finalAnswer: string;
  /** 推理轨迹 */
  reasoningTrajectory: string[];
  /** 工作流历史 */
  workflowHistory: WorkflowAction[];
  /** 子任务列表 */
  subtasks: SubTask[];
  /** 使用的代理角色 */
  agentRoles: string[];
  /** 总耗时（ms） */
  executionTime: number;
  /** MCTS 搜索统计 */
  mctsStats: {
    totalNodes: number;
    searchDepth: number;
    bestPathReward: number;
  };
}

/**
 * HALO 配置
 */
export interface HALOConfig {
  /** MCTS 迭代次数 */
  mctsIterations?: number;
  /** MCTS 探索常数 (UCB1) */
  mctsExplorationConstant?: number;
  /** 最大工作流深度 */
  maxWorkflowDepth?: number;
  /** 最大子任务数 */
  maxSubTasks?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 代理数量 */
  numAgents?: number;
  /** 自适应提示优化启用 */
  enablePromptRefinement?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<HALOConfig> = {
  mctsIterations: 100,
  mctsExplorationConstant: 1.414,
  maxWorkflowDepth: 5,
  maxSubTasks: 10,
  enableDetailedLogging: false,
  numAgents: 3,
  enablePromptRefinement: true,
};

/**
 * 预定义代理角色库
 */
const AGENT_ROLE_REGISTRY: AgentRole[] = [
  {
    roleName: "planner",
    description: "高层规划代理，负责任务分解",
    capabilities: ["task_decomposition", "dependency_analysis", "priority_planning"],
    promptTemplate: "You are a planning agent. Analyze the task and decompose it into subtasks.",
    level: AgentLevel.HIGH_LEVEL,
  },
  {
    roleName: "coder",
    description: "代码生成代理",
    capabilities: ["code_generation", "debugging", "code_review"],
    promptTemplate: "You are a coding agent. Write clean, efficient, well-documented code.",
    level: AgentLevel.LOW_LEVEL,
  },
  {
    roleName: "reasoner",
    description: "逻辑推理代理",
    capabilities: ["logical_reasoning", "mathematical_proof", "step_by_step_analysis"],
    promptTemplate: "You are a reasoning agent. Think step by step and show your work.",
    level: AgentLevel.LOW_LEVEL,
  },
  {
    roleName: "researcher",
    description: "信息检索代理",
    capabilities: ["information_retrieval", "fact_checking", "knowledge_synthesis"],
    promptTemplate: "You are a research agent. Find and verify relevant information.",
    level: AgentLevel.LOW_LEVEL,
  },
  {
    roleName: "verifier",
    description: "结果验证代理",
    capabilities: ["answer_verification", "consistency_check", "quality_assessment"],
    promptTemplate: "You are a verification agent. Check the correctness and completeness of answers.",
    level: AgentLevel.LOW_LEVEL,
  },
  {
    roleName: "coordinator",
    description: "中层协调代理，分配子任务给代理",
    capabilities: ["role_assignment", "resource_allocation", "progress_tracking"],
    promptTemplate: "You are a coordinator agent. Assign tasks to appropriate agents.",
    level: AgentLevel.MID_LEVEL,
  },
];

/**
 * 🌟 HALO 分层编排器
 *
 * 实现基于 MCTS 的工作流搜索和分层代理协作
 */
export class HALOOrchestrator {
  private config: Required<HALOConfig>;
  private roleRegistry: AgentRole[] = [];
  private currentSubtasks: Map<string, SubTask> = new Map();
  private mctsRoot: MCTSNode | null = null;

  constructor(config: HALOConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.roleRegistry = [...AGENT_ROLE_REGISTRY];
    console.log(`🌟 HALO 编排器初始化 (MCTS: ${this.config.mctsIterations} 迭代)`);
  }

  /**
   * 执行 HALO 编排任务
   */
  async orchestrate(taskDescription: string): Promise<HALOOutput> {
    console.log(`🌟 HALO 编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // Phase 1: 自适应提示优化
    const promptRefinement = this.config.enablePromptRefinement
      ? await this.refinePrompt(taskDescription)
      : {
          originalQuery: taskDescription,
          refinedPrompt: taskDescription,
          inferredTaskType: "general",
          requiredSkills: [],
          confidence: 0.5,
        };

    // Phase 2: 高层规划 - 任务分解
    const subtasks = await this.highLevelPlanning(promptRefinement);

    // Phase 3: 中层协调 - 角色分配
    const assignedTasks = await this.midLevelCoordination(subtasks);

    // Phase 4: MCTS 工作流搜索
    const { bestPath, mctsStats } = await this.mctsWorkflowSearch(
      assignedTasks,
      promptRefinement
    );

    // Phase 5: 低层推理 - 执行工作流
    const executionResults = await this.lowLevelExecution(bestPath);

    const executionTime = Date.now() - startTime;

    const result: HALOOutput = {
      finalAnswer: executionResults.finalAnswer,
      reasoningTrajectory: executionResults.trajectory,
      workflowHistory: bestPath,
      subtasks: Array.from(subtasks.values()),
      agentRoles: Array.from(new Set(assignedTasks.map(t => t.assignedAgentRole!))),
      executionTime,
      mctsStats,
    };

    console.log(
      `🌟 HALO 编排完成: ${result.workflowHistory.length} 步, ${executionTime}ms, ` +
      `MCTS 节点: ${mctsStats.totalNodes}`
    );

    return result;
  }

  /**
   * Phase 1: 自适应提示优化
   */
  private async refinePrompt(
    rawQuery: string
  ): Promise<PromptRefinement> {
    console.log(`   📝 Phase 1: 自适应提示优化`);

    // 简化实现：基于关键词推断任务类型和技能
    const taskTypePatterns = [
      { type: "code_generation", keywords: ["code", "function", "implement", "write"], skills: ["coding"] },
      { type: "reasoning", keywords: ["prove", "why", "explain", "analyze"], skills: ["reasoning", "math"] },
      { type: "research", keywords: ["find", "search", "what", "information"], skills: ["retrieval"] },
      { type: "verification", keywords: ["check", "verify", "correct", "valid"], skills: ["verification"] },
    ];

    let inferredType = "general";
    const detectedSkills: string[] = [];

    for (const pattern of taskTypePatterns) {
      if (pattern.keywords.some(kw => rawQuery.toLowerCase().includes(kw))) {
        inferredType = pattern.type;
        detectedSkills.push(...pattern.skills);
        break;
      }
    }

    // 优化后的提示：添加结构化指令
    const refinedPrompt = `
Task: ${rawQuery}

Role: You are an expert in ${inferredType}.
Required Skills: ${detectedSkills.join(", ") || "general problem solving"}

Instructions:
- Think step by step
- Show your work clearly
- Verify your answer
- Provide detailed explanations
`;

    return {
      originalQuery: rawQuery,
      refinedPrompt: refinedPrompt.trim(),
      inferredTaskType: inferredType,
      requiredSkills: detectedSkills,
      confidence: 0.8,
    };
  }

  /**
   * Phase 2: 高层规划 - 任务分解
   */
  private async highLevelPlanning(promptRefinement: PromptRefinement): Promise<SubTask[]> {
    console.log(`   📋 Phase 2: 高层规划 - 任务分解`);

    const subtasks: SubTask[] = [];

    // 简化实现：基于任务类型生成子任务
    const taskType = promptRefinement.inferredTaskType;

    switch (taskType) {
      case "code_generation":
        subtasks.push(
          { taskId: "t1", description: "Understand requirements", taskType: "analysis", requiredSkills: [], priority: 1, status: "pending" },
          { taskId: "t2", description: "Design solution", taskType: "design", requiredSkills: ["design"], priority: 2, status: "pending" },
          { taskId: "t3", description: "Implement code", taskType: "implementation", requiredSkills: ["coding"], priority: 3, status: "pending" },
          { taskId: "t4", description: "Verify solution", taskType: "verification", requiredSkills: ["testing"], priority: 4, status: "pending" }
        );
        break;
      case "reasoning":
        subtasks.push(
          { taskId: "t1", description: "Parse problem", taskType: "analysis", requiredSkills: ["parsing"], priority: 1, status: "pending" },
          { taskId: "t2", description: "Apply reasoning method", taskType: "inference", requiredSkills: ["reasoning", "math"], priority: 2, status: "pending" },
          { taskId: "t3", description: "Verify logic", taskType: "verification", requiredSkills: ["verification"], priority: 3, status: "pending" }
        );
        break;
      default:
        subtasks.push(
          { taskId: "t1", description: "Analyze problem", taskType: "analysis", requiredSkills: [], priority: 1, status: "pending" },
          { taskId: "t2", description: "Generate solution", taskType: "generation", requiredSkills: [], priority: 2, status: "pending" },
          { taskId: "t3", description: "Verify answer", taskType: "verification", requiredSkills: [], priority: 3, status: "pending" }
        );
    }

    // 存储子任务
    for (const task of subtasks) {
      this.currentSubtasks.set(task.taskId, task);
    }

    console.log(`   ✅ 生成 ${subtasks.length} 个子任务`);
    return subtasks;
  }

  /**
   * Phase 3: 中层协调 - 角色分配
   */
  private async midLevelCoordination(subtasks: SubTask[]): Promise<SubTask[]> {
    console.log(`   🎯 Phase 3: 中层协调 - 角色分配`);

    const assignedTasks: SubTask[] = [];

    for (const task of subtasks) {
      // 根据任务类型和所需技能分配角色
      const suitableRoles = this.roleRegistry.filter(role =>
        role.capabilities.some(cap => task.requiredSkills.includes(cap))
      );

      // 选择最佳匹配角色
      const assignedRole = suitableRoles.length > 0
        ? suitableRoles[0]
        : this.roleRegistry.find(r => r.level === AgentLevel.LOW_LEVEL)!; // 默认低层代理

      task.assignedAgentRole = assignedRole.roleName;
      task.status = "assigned";

      assignedTasks.push(task);

      console.log(`   📌 ${task.taskId} → ${assignedRole.roleName}`);
    }

    return assignedTasks;
  }

  /**
   * Phase 4: MCTS 工作流搜索
   */
  private async mctsWorkflowSearch(
    subtasks: SubTask[],
    promptRefinement: PromptRefinement
  ): Promise<{ bestPath: WorkflowAction[]; mctsStats: any }> {
    console.log(`   🌳 Phase 4: MCTS 工作流搜索`);

    // 初始化 MCTS 根节点
    this.mctsRoot = {
      nodeId: "root",
      nodeType: MCTSNodeType.ROOT,
      state: { currentTaskIndex: 0, subtasks },
      actionPath: [],
      visitCount: 0,
      totalReward: 0,
      averageReward: 0,
      children: [],
    };

    // MCTS 迭代
    for (let i = 0; i < this.config.mctsIterations; i++) {
      const node = this.selectNode(this.mctsRoot);
      const childNode = this.expandNode(node, promptRefinement);
      this.backpropagate(node, childNode);
    }

    // 提取最佳路径
    const bestPath = this.extractBestPath(this.mctsRoot);
    const stats = {
      totalNodes: this.countNodes(this.mctsRoot),
      searchDepth: bestPath.length,
      bestPathReward: this.calculatePathReward(bestPath),
    };

    console.log(`   ✅ MCTS 完成: ${stats.totalNodes} 节点, 深度 ${stats.searchDepth}`);

    return { bestPath, mctsStats: stats };
  }

  /**
   * MCTS: 选择节点 (UCB1)
   */
  private selectNode(root: MCTSNode): MCTSNode {
    let node = root;
    while (node.children.length > 0) {
      // UCB1 公式
      const bestChild = node.children.reduce((best, child) => {
        const uctValue = child.averageReward +
          this.config.mctsExplorationConstant *
          Math.sqrt(Math.log(node.visitCount) / (child.visitCount + 1));
        return uctValue > (best.averageReward +
          this.config.mctsExplorationConstant *
          Math.sqrt(Math.log(best.visitCount) / (best.visitCount + 1))
        ) ? child : best;
      }, node.children[0]);
      node = bestChild;
    }
    return node;
  }

  /**
   * MCTS: 扩展节点
   */
  private expandNode(node: MCTSNode, promptRefinement: PromptRefinement): MCTSNode {
    if (node.nodeType === MCTSNodeType.TERMINAL) {
      return node;
    }

    // 生成可能的后续动作
    const possibleActions = this.generatePossibleActions(node, promptRefinement);

    const childNodes: MCTSNode[] = [];

    for (const action of possibleActions) {
      const newState = this.simulateAction(node.state, action);
      const isTerminal = this.isTerminal(newState);

      const childNode: MCTSNode = {
        nodeId: `${node.nodeId}_${action.actionId}`,
        parentId: node.nodeId,
        nodeType: isTerminal ? MCTSNodeType.TERMINAL : MCTSNodeType.DECISION,
        state: newState,
        actionPath: [...node.actionPath, action],
        visitCount: 0,
        totalReward: 0,
        averageReward: 0,
        children: [],
      };

      childNodes.push(childNode);
    }

    node.children = childNodes;
    node.visitCount++;

    // 返回第一个子节点用于 rollout
    return childNodes[0];
  }

  /**
   * MCTS: 反向传播
   */
  private backpropagate(node: MCTSNode, childNode: MCTSNode): void {
    let reward = this.calculateReward(childNode);
    childNode.visitCount++;
    childNode.totalReward += reward;
    childNode.averageReward = childNode.totalReward / childNode.visitCount;

    while (node.parentId) {
      node.totalReward += reward;
      node.visitCount++;
      node.averageReward = node.totalReward / node.visitCount;

      // 向上遍历
      let parent = this.findNode(this.mctsRoot!, node.parentId);
      if (parent) {
        node = parent;
      } else {
        break;
      }
    }
  }

  /**
   * 提取最佳路径
   */
  private extractBestPath(root: MCTSNode): WorkflowAction[] {
    let node: MCTSNode | null = root;
    const path: WorkflowAction[] = [];

    while (node) {
      path.push(...node.actionPath.slice(path.length));

      if (node.children.length > 0) {
        // 选择平均奖励最高的子节点
        node = node.children.reduce((best, child) =>
          child.averageReward > best.averageReward ? child : best
        );
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * 生成可能的动作
   */
  private generatePossibleActions(
    node: MCTSNode,
    promptRefinement: PromptRefinement
  ): WorkflowAction[] {
    const actions: WorkflowAction[] = [];
    const state = node.state;

    if (!state.subtasks || state.currentTaskIndex >= state.subtasks.length) {
      return [];
    }

    const currentTask = state.subtasks[state.currentTaskIndex];

    // 为当前任务生成动作
    actions.push({
      actionId: `reason_${state.currentTaskIndex}`,
      actionType: WorkflowActionType.REASONING,
      parameters: { taskId: currentTask.taskId },
      expectedOutcome: `${currentTask.description} 完成`,
    });

    actions.push({
      actionId: `retrieve_${state.currentTaskIndex}`,
      actionType: WorkflowActionType.RETRIEVAL,
      parameters: { query: currentTask.description },
      expectedOutcome: `获取相关信息`,
    });

    if (state.currentTaskIndex < state.subtasks.length - 1) {
      actions.push({
        actionId: `verify_${state.currentTaskIndex}`,
        actionType: WorkflowActionType.VERIFICATION,
        parameters: { taskId: currentTask.taskId },
        expectedOutcome: `验证当前任务`,
      });
    }

    return actions;
  }

  /**
   * 模拟动作执行
   */
  private simulateAction(state: any, action: WorkflowAction): any {
    // 简化实现：基于当前状态和动作生成新状态
    const newState = { ...state };

    if (action.actionType === WorkflowActionType.REASONING) {
      // 推理动作保持状态不变
    } else if (action.actionType === WorkflowActionType.RETRIEVAL) {
      // 检索动作添加信息
      newState.hasRetrieved = true;
    } else if (action.actionType === WorkflowActionType.VERIFICATION) {
      // 验证动作更新验证状态
      newState.verifiedTasks = [...(state.verifiedTasks || []), action.parameters.taskId];
    }

    // 移动到下一个任务
    if (action.actionType === WorkflowActionType.VERIFICATION ||
        (action.actionType === WorkflowActionType.SYNTHESIS && state.currentTaskIndex === state.subtasks?.length - 1)) {
      newState.currentTaskIndex = (state.currentTaskIndex || 0) + 1;
    }

    return newState;
  }

  /**
   * 检查是否终端状态
   */
  private isTerminal(state: any): boolean {
    return !state.subtasks || state.currentTaskIndex >= state.subtasks.length;
  }

  /**
   * 计算奖励
   */
  private calculateReward(node: MCTSNode): number {
    // 简化实现：基于路径深度和完成度
    let reward = 0;
    const state = node.state;

    if (state.subtasks) {
      reward = (state.currentTaskIndex || 0) / state.subtasks.length;
    }

    // 额外奖励：完成更多任务
    if (state.verifiedTasks) {
      reward += state.verifiedTasks.length * 0.1;
    }

    // 深度惩罚：避免过长路径
    reward -= node.actionPath.length * 0.01;

    return Math.max(0, reward);
  }

  /**
   * 计算路径奖励
   */
  private calculatePathReward(path: WorkflowAction[]): number {
    let reward = 0;
    for (const action of path) {
      if (action.actionType === WorkflowActionType.SYNTHESIS) {
        reward += 1.0;
      } else if (action.actionType === WorkflowActionType.VERIFICATION) {
        reward += 0.5;
      } else {
        reward += 0.1;
      }
    }
    return reward;
  }

  /**
   * 查找节点
   */
  private findNode(root: MCTSNode, nodeId: string): MCTSNode | null {
    if (root.nodeId === nodeId) {
      return root;
    }
    for (const child of root.children) {
      const found = this.findNode(child, nodeId);
      if (found) return found;
    }
    return null;
  }

  /**
   * 统计节点数
   */
  private countNodes(root: MCTSNode): number {
    let count = 1;
    for (const child of root.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Phase 5: 低层推理 - 执行工作流
   */
  private async lowLevelExecution(
    workflowPath: WorkflowAction[]
  ): Promise<{ finalAnswer: string; trajectory: string[] }> {
    console.log(`   ⚙️  Phase 5: 低层推理 - 执行工作流`);

    const trajectory: string[] = [];

    for (const action of workflowPath) {
      const step = await this.executeAction(action);
      trajectory.push(step);

      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // 生成最终答案
    const finalAnswer = this.synthesizeAnswer(workflowPath, trajectory);

    return { finalAnswer, trajectory };
  }

  /**
   * 执行单个动作
   */
  private async executeAction(action: WorkflowAction): Promise<string> {
    const stepDescriptions = {
      [WorkflowActionType.REASONING]: `🧠 推理: ${action.parameters.taskId}`,
      [WorkflowActionType.RETRIEVAL]: `🔍 检索: ${action.parameters.query?.substring(0, 30)}...`,
      [WorkflowActionType.VERIFICATION]: `✅ 验证: ${action.parameters.taskId}`,
      [WorkflowActionType.SYNTHESIS]: `📝 综合: 生成最终答案`,
      [WorkflowActionType.TOOL_USE]: `🔧 工具: ${action.actionId}`,
    };

    return stepDescriptions[action.actionType] || `执行: ${action.actionId}`;
  }

  /**
   * 综合答案
   */
  private synthesizeAnswer(
    workflowPath: WorkflowAction[],
    trajectory: string[]
  ): string {
    const reasoningSteps = trajectory.filter(t => t.startsWith("🧠"));
    const retrievalSteps = trajectory.filter(t => t.startsWith("🔍"));
    const verificationSteps = trajectory.filter(t => t.startsWith("✅"));

    return `经过 ${workflowPath.length} 步工作流执行:\n\n` +
      `推理步骤 (${reasoningSteps.length}):\n${reasoningSteps.join("\n")}\n\n` +
      `检索步骤 (${retrievalSteps.length}):\n${retrievalSteps.join("\n")}\n\n` +
      `验证步骤 (${verificationSteps.length}):\n${verificationSteps.join("\n")}\n\n` +
      `最终答案: 基于分层推理和 MCTS 优化的综合解决方案`;
  }

  /**
   * 获取编排器状态
   */
  getState(): { subtasks: SubTask[]; mctsRoot: MCTSNode | null } {
    return {
      subtasks: Array.from(this.currentSubtasks.values()),
      mctsRoot: this.mctsRoot,
    };
  }
}

/**
 * 工厂函数：创建 HALO 编排器
 */
export function createHALOOrchestrator(config?: HALOConfig): HALOOrchestrator {
  return new HALOOrchestrator(config);
}

/**
 * 任务模板
 */
export const HALOTemplates = {
  /** 代码生成任务 */
  codeGeneration: {
    description: "多代理协作生成高质量代码",
    recommendedConfig: {
      mctsIterations: 150,
      maxWorkflowDepth: 6,
      enablePromptRefinement: true,
    },
  },

  /** 数学推理任务 */
  mathematical: {
    description: "多代理协作解决数学问题",
    recommendedConfig: {
      mctsIterations: 200,
      maxWorkflowDepth: 8,
      enablePromptRefinement: true,
    },
  },

  /** 研究任务 */
  research: {
    description: "多代理协作进行信息检索和综合",
    recommendedConfig: {
      mctsIterations: 100,
      maxWorkflowDepth: 5,
      enablePromptRefinement: true,
    },
  },
};
