/**
 * 🎼 AgentOrchestra 分层多代理编排器
 *
 * 基于 arXiv:2506.12508 "A Hierarchical Multi-Agent Framework for General-Purpose Task Solving"
 *
 * 核心思想：通过分层架构实现通用任务求解
 *
 * 关键创新：
 * - 中心规划器：协调整体任务执行
 * - 模块化子代理：专门化角色（搜索、推理、工具使用）
 * - TEA 协议：工具-环境-代理统一交互框架
 * - 适应多模态推理：处理复杂真实世界任务
 *
 * @see {@link https://arxiv.org/abs/2506.12508} - AgentOrchestra Paper
 * @see {@link https://arxiv.org/html/2506.12508v1} - HTML Version
 *
 * @version 2.16.0
 * @since 2025-03-11
 */

/**
 * 代理角色类型
 */
export enum OrchestraRole {
  /** 中心规划器 - 高层任务分解与协调 */
  PLANNER = "planner",
  /** 搜索代理 - 信息检索 */
  SEARCHER = "searcher",
  /** 推理代理 - 逻辑推理 */
  REASONER = "reasoner",
  /** 工具代理 - 工具调用 */
  TOOL_USER = "tool_user",
  /** 验证代理 - 结果验证 */
  VERIFIER = "verifier",
  /** 综合代理 - 答案综合 */
  SYNTHESIZER = "synthesizer",
}

/**
 * Orchestra 任务状态
 */
export enum OrchestraTaskStatus {
  /** 待处理 */
  PENDING = "pending",
  /** 进行中 */
  IN_PROGRESS = "in_progress",
  /** 已完成 */
  COMPLETED = "completed",
  /** 失败 */
  FAILED = "failed",
  /** 阻塞 */
  BLOCKED = "blocked",
}

/**
 * 模态类型
 */
export enum ModalityType {
  /** 文本 */
  TEXT = "text",
  /** 图像 */
  IMAGE = "image",
  /** 音频 */
  AUDIO = "audio",
  /** 视频 */
  VIDEO = "video",
  /** 结构化数据 */
  STRUCTURED = "structured",
  /** 代码 */
  CODE = "code",
}

/**
 * TEA 协议动作
 */
export interface TEAAction {
  /** 动作 ID */
  actionId: string;
  /** 动作类型 */
  actionType: "tool_use" | "environment_observation" | "agent_communication" | "synthesis";
  /** 执行者角色 */
  agentRole: OrchestraRole;
  /** 动作参数 */
  parameters: Record<string, any>;
  /** 目标模态 */
  targetModality?: ModalityType;
  /** 前置条件 */
  preconditions?: string[];
  /** 预期结果 */
  expectedOutcome?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 子任务定义
 */
export interface OrchestraSubTask {
  /** 任务 ID */
  taskId: string;
  /** 父任务 ID */
  parentTaskId?: string;
  /** 任务描述 */
  description: string;
  /** 分配的角色 */
  assignedRole: OrchestraRole;
  /** 任务状态 */
  status: OrchestraTaskStatus;
  /** 优先级 (1-10) */
  priority: number;
  /** 所需模态 */
  requiredModalities: ModalityType[];
  /** 依赖任务 ID */
  dependencies: string[];
  /** 结果数据 */
  resultData?: any;
  /** 开始时间 */
  startTime?: number;
  /** 结束时间 */
  endTime?: number;
}

/**
 * 规划节点
 */
export interface PlanningNode {
  /** 节点 ID */
  nodeId: string;
  /** 任务描述 */
  taskDescription: string;
  /** 子节点 */
  children: PlanningNode[];
  /** 所需技能 */
  requiredSkills: string[];
  /** 估计难度 */
  estimatedDifficulty: number;
  /** 是否终端节点 */
  isTerminal: boolean;
}

/**
 * Orchestra 代理消息
 */
export interface OrchestraAgentMessage {
  /** 发送者角色 */
  fromRole: OrchestraRole;
  /** 接收者角色 */
  toRole: OrchestraRole;
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  messageType: "request" | "response" | "notification" | "coordination";
  /** 关联数据 */
  attachedData?: any;
  /** 时间戳 */
  timestamp: number;
}

/**
 * AgentOrchestra 输出
 */
export interface OrchestraOutput {
  /** 最终答案 */
  finalAnswer: string;
  /** 任务分解树 */
  taskDecomposition: PlanningNode;
  /** 子任务列表 */
  subtasks: OrchestraSubTask[];
  /** TEA 动作序列 */
  teaActions: TEAAction[];
  /** 代理消息历史 */
  agentMessages: OrchestraAgentMessage[];
  /** 总耗时（ms） */
  executionTime: number;
  /** 性能指标 */
  performanceMetrics: {
    taskSuccessRate: number;
    averageTaskDuration: number;
    coordinationOverhead: number;
  };
}

/**
 * AgentOrchestra 配置
 */
export interface OrchestraConfig {
  /** 最大子任务数 */
  maxSubTasks?: number;
  /** 最大规划深度 */
  maxPlanningDepth?: number;
  /** 超时时间（ms） */
  timeout?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 代理数量 */
  numAgents?: number;
  /** 是否启用 TEA 协议 */
  enableTEAProtocol?: boolean;
  /** 是否启用多模态支持 */
  enableMultimodal?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<OrchestraConfig> = {
  maxSubTasks: 10,
  maxPlanningDepth: 5,
  timeout: 180000,
  enableDetailedLogging: false,
  numAgents: 6,
  enableTEAProtocol: true,
  enableMultimodal: true,
};

/**
 * 角色能力矩阵
 */
const ROLE_CAPABILITIES: Record<OrchestraRole, string[]> = {
  [OrchestraRole.PLANNER]: ["task_decomposition", "dependency_analysis", "coordination"],
  [OrchestraRole.SEARCHER]: ["web_search", "information_retrieval", "fact_checking"],
  [OrchestraRole.REASONER]: ["logical_reasoning", "step_by_step_analysis", "inference"],
  [OrchestraRole.TOOL_USER]: ["api_call", "code_execution", "data_processing"],
  [OrchestraRole.VERIFIER]: ["result_validation", "consistency_check", "quality_assessment"],
  [OrchestraRole.SYNTHESIZER]: ["answer_integration", "summary_generation", "final_output"],
};

/**
 * 🎼 AgentOrchestra 分层编排器
 *
 * 实现基于 TEA 协议的多代理协调框架
 */
export class AgentOrchestrator {
  private config: Required<OrchestraConfig>;
  private currentSubtasks: Map<string, OrchestraSubTask> = new Map();
  private teaActions: TEAAction[] = [];
  private agentMessages: OrchestraAgentMessage[] = [];
  private planningRoot: PlanningNode | null = null;

  constructor(config: OrchestraConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log(`🎼 AgentOrchestra 编排器初始化 (${this.config.numAgents} 代理, TEA: ${this.config.enableTEAProtocol})`);
  }

  /**
   * 执行 AgentOrchestra 编排任务
   */
  async orchestrate(taskDescription: string): Promise<OrchestraOutput> {
    console.log(`🎼 AgentOrchestra 编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // Phase 1: 高层规划 - 任务分解
    this.planningRoot = await this.highLevelPlanning(taskDescription);

    // Phase 2: 子任务生成
    const subtasks = this.generateSubTasks(this.planningRoot);

    // 存储子任务
    for (const task of subtasks) {
      this.currentSubtasks.set(task.taskId, task);
    }

    console.log(`   📋 生成 ${subtasks.length} 个子任务`);

    // Phase 3: TEA 协议执行
    await this.executeTEAProtocol(subtasks);

    // Phase 4: 代理协调与消息传递
    await this.coordinateAgents(subtasks);

    // Phase 5: 结果综合
    const finalAnswer = await this.synthesizeResults(subtasks);

    const executionTime = Date.now() - startTime;

    // 计算性能指标
    const performanceMetrics = this.calculatePerformanceMetrics(subtasks, executionTime);

    const result: OrchestraOutput = {
      finalAnswer,
      taskDecomposition: this.planningRoot!,
      subtasks: Array.from(this.currentSubtasks.values()),
      teaActions: this.teaActions,
      agentMessages: this.agentMessages,
      executionTime,
      performanceMetrics,
    };

    console.log(
      `🎼 编排完成: ${result.subtasks.length} 子任务, ${result.teaActions.length} 动作, ` +
      `${executionTime}ms, 成功率: ${(performanceMetrics.taskSuccessRate * 100).toFixed(1)}%`
    );

    return result;
  }

  /**
   * Phase 1: 高层规划 - 构建任务分解树
   */
  private async highLevelPlanning(taskDescription: string): Promise<PlanningNode> {
    console.log(`   📊 Phase 1: 高层规划 - 任务分解`);

    // 分析任务类型
    const taskType = this.analyzeTaskType(taskDescription);

    // 构建规划树
    const root: PlanningNode = {
      nodeId: "root",
      taskDescription,
      children: [],
      requiredSkills: this.identifyRequiredSkills(taskType),
      estimatedDifficulty: this.estimateDifficulty(taskType),
      isTerminal: false,
    };

    // 递归分解任务
    this.decomposeTask(root, 0);

    return root;
  }

  /**
   * 分析任务类型
   */
  private analyzeTaskType(taskDescription: string): string {
    const lowerDesc = taskDescription.toLowerCase();

    if (lowerDesc.includes("code") || lowerDesc.includes("implement") || lowerDesc.includes("function")) {
      return "code_generation";
    }
    if (lowerDesc.includes("prove") || lowerDesc.includes("why") || lowerDesc.includes("analyze")) {
      return "reasoning";
    }
    if (lowerDesc.includes("search") || lowerDesc.includes("find") || lowerDesc.includes("information")) {
      return "retrieval";
    }
    if (lowerDesc.includes("write") || lowerDesc.includes("summarize") || lowerDesc.includes("explain")) {
      return "synthesis";
    }

    return "general";
  }

  /**
   * 识别所需技能
   */
  private identifyRequiredSkills(taskType: string): string[] {
    const skillMap: Record<string, string[]> = {
      code_generation: ["coding", "design", "testing"],
      reasoning: ["logic", "math", "analysis"],
      retrieval: ["search", "filtering", "verification"],
      synthesis: ["writing", "structuring", "formatting"],
      general: ["analysis", "planning", "coordination"],
    };

    return skillMap[taskType] || skillMap.general;
  }

  /**
   * 估计难度
   */
  private estimateDifficulty(taskType: string): number {
    const difficultyMap: Record<string, number> = {
      code_generation: 7,
      reasoning: 8,
      retrieval: 4,
      synthesis: 5,
      general: 6,
    };

    return difficultyMap[taskType] || 6;
  }

  /**
   * 递归分解任务
   */
  private decomposeTask(node: PlanningNode, currentDepth: number): void {
    if (currentDepth >= this.config.maxPlanningDepth || node.isTerminal) {
      return;
    }

    // 基于任务描述生成子任务
    const subTaskDescriptions = this.generateSubTaskDescriptions(node.taskDescription);

    for (const desc of subTaskDescriptions) {
      const childNode: PlanningNode = {
        nodeId: `${node.nodeId}_${node.children.length}`,
        taskDescription: desc,
        children: [],
        requiredSkills: [],
        estimatedDifficulty: node.estimatedDifficulty * 0.8,
        isTerminal: currentDepth >= this.config.maxPlanningDepth - 1,
      };

      node.children.push(childNode);
      this.decomposeTask(childNode, currentDepth + 1);
    }
  }

  /**
   * 生成子任务描述
   */
  private generateSubTaskDescriptions(parentTask: string): string[] {
    const type = this.analyzeTaskType(parentTask);

    const templates: Record<string, string[]> = {
      code_generation: [
        "Understand requirements and constraints",
        "Design solution architecture",
        "Implement core functionality",
        "Write test cases",
        "Verify and validate",
      ],
      reasoning: [
        "Parse problem statement",
        "Identify key variables and constraints",
        "Apply reasoning method",
        "Verify logic consistency",
      ],
      retrieval: [
        "Identify search queries",
        "Execute information retrieval",
        "Filter and validate results",
        "Synthesize findings",
      ],
      synthesis: [
        "Gather relevant information",
        "Structure content",
        "Generate output",
        "Review and refine",
      ],
      general: [
        "Analyze problem context",
        "Identify solution approach",
        "Execute solution",
        "Validate results",
      ],
    };

    return templates[type] || templates.general;
  }

  /**
   * 生成子任务列表
   */
  private generateSubTasks(planningRoot: PlanningNode): OrchestraSubTask[] {
    const subtasks: OrchestraSubTask[] = [];
    const taskQueue: PlanningNode[] = [planningRoot];

    while (taskQueue.length > 0 && subtasks.length < this.config.maxSubTasks) {
      const node = taskQueue.shift()!;

      if (!node.isTerminal) {
        // 将子节点加入队列
        for (const child of node.children) {
          taskQueue.push(child);
        }
      } else {
        // 为终端节点创建子任务
        const role = this.assignRole(node);
        const subtask: OrchestraSubTask = {
          taskId: node.nodeId,
          description: node.taskDescription,
          assignedRole: role,
          status: OrchestraTaskStatus.PENDING,
          priority: this.calculatePriority(node),
          requiredModalities: this.identifyModalities(node),
          dependencies: [],
        };
        subtasks.push(subtask);
      }
    }

    // 按优先级排序
    subtasks.sort((a, b) => b.priority - a.priority);

    return subtasks;
  }

  /**
   * 为节点分配角色
   */
  private assignRole(node: PlanningNode): OrchestraRole {
    const skills = node.requiredSkills;

    // 基于技能匹配角色
    if (skills.some(s => s.includes("search") || s.includes("retrieval"))) {
      return OrchestraRole.SEARCHER;
    }
    if (skills.some(s => s.includes("coding") || s.includes("design"))) {
      return OrchestraRole.TOOL_USER;
    }
    if (skills.some(s => s.includes("logic") || s.includes("reasoning"))) {
      return OrchestraRole.REASONER;
    }
    if (skills.some(s => s.includes("test") || s.includes("verify"))) {
      return OrchestraRole.VERIFIER;
    }
    if (skills.some(s => s.includes("write") || s.includes("synthesis"))) {
      return OrchestraRole.SYNTHESIZER;
    }

    return OrchestraRole.PLANNER;
  }

  /**
   * 计算优先级
   */
  private calculatePriority(node: PlanningNode): number {
    // 基于难度和深度计算优先级
    const depthScore = 10 - this.getNodeDepth(node);
    const difficultyScore = 10 - node.estimatedDifficulty;
    return Math.round((depthScore + difficultyScore) / 2);
  }

  /**
   * 获取节点深度
   */
  private getNodeDepth(node: PlanningNode): number {
    let depth = 0;
    let current: PlanningNode | null = node;

    // 向上遍历到根节点（这里简化处理）
    while (current && current.nodeId !== "root") {
      depth++;
      // 实际应用中需要维护父节点引用
      break;
    }

    return depth;
  }

  /**
   * 识别所需模态
   */
  private identifyModalities(node: PlanningNode): ModalityType[] {
    const desc = node.taskDescription.toLowerCase();

    const modalities: ModalityType[] = [];
    if (desc.includes("image") || desc.includes("visual")) {
      modalities.push(ModalityType.IMAGE);
    }
    if (desc.includes("audio") || desc.includes("speech")) {
      modalities.push(ModalityType.AUDIO);
    }
    if (desc.includes("video")) {
      modalities.push(ModalityType.VIDEO);
    }
    if (desc.includes("data") || desc.includes("json")) {
      modalities.push(ModalityType.STRUCTURED);
    }
    if (desc.includes("code") || desc.includes("function")) {
      modalities.push(ModalityType.CODE);
    }

    // 默认包含文本
    if (modalities.length === 0) {
      modalities.push(ModalityType.TEXT);
    }

    return modalities;
  }

  /**
   * Phase 3: 执行 TEA 协议
   */
  private async executeTEAProtocol(subtasks: OrchestraSubTask[]): Promise<void> {
    console.log(`   🫖 Phase 3: TEA 协议执行`);

    for (const task of subtasks) {
      // 检查依赖是否满足
      if (!this.areDependenciesMet(task, subtasks)) {
        task.status = OrchestraTaskStatus.BLOCKED;
        continue;
      }

      task.status = OrchestraTaskStatus.IN_PROGRESS;
      task.startTime = Date.now();

      // 创建 TEA 动作
      const teaAction: TEAAction = {
        actionId: `tea_${task.taskId}_${Date.now()}`,
        actionType: this.determineActionType(task),
        agentRole: task.assignedRole,
        parameters: { taskId: task.taskId, description: task.description },
        targetModality: task.requiredModalities[0],
        timestamp: Date.now(),
      };

      this.teaActions.push(teaAction);

      // 模拟执行
      await this.simulateTEAAction(teaAction);

      task.status = OrchestraTaskStatus.COMPLETED;
      task.endTime = Date.now();
      task.resultData = `Completed: ${task.description}`;

      console.log(`   ✅ ${task.taskId} (${task.assignedRole})`);
    }
  }

  /**
   * 检查依赖是否满足
   */
  private areDependenciesMet(task: OrchestraSubTask, allTasks: OrchestraSubTask[]): boolean {
    for (const depId of task.dependencies) {
      const depTask = allTasks.find(t => t.taskId === depId);
      if (!depTask || depTask.status !== OrchestraTaskStatus.COMPLETED) {
        return false;
      }
    }
    return true;
  }

  /**
   * 确定动作类型
   */
  private determineActionType(task: OrchestraSubTask): TEAAction["actionType"] {
    switch (task.assignedRole) {
      case OrchestraRole.SEARCHER:
        return "environment_observation";
      case OrchestraRole.TOOL_USER:
        return "tool_use";
      case OrchestraRole.SYNTHESIZER:
        return "synthesis";
      default:
        return "agent_communication";
    }
  }

  /**
   * 模拟 TEA 动作执行
   */
  private async simulateTEAAction(action: TEAAction): Promise<void> {
    // 模拟执行延迟
    const delay = 50 + Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 记录消息
    const message: OrchestraAgentMessage = {
      fromRole: OrchestraRole.PLANNER,
      toRole: action.agentRole,
      content: `执行动作: ${action.actionId}`,
      messageType: "request",
      timestamp: Date.now(),
    };
    this.agentMessages.push(message);

    // 模拟响应
    const response: OrchestraAgentMessage = {
      fromRole: action.agentRole,
      toRole: OrchestraRole.PLANNER,
      content: `动作完成: ${action.actionId}`,
      messageType: "response",
      timestamp: Date.now(),
    };
    this.agentMessages.push(response);
  }

  /**
   * Phase 4: 代理协调
   */
  private async coordinateAgents(subtasks: OrchestraSubTask[]): Promise<void> {
    console.log(`   🤝 Phase 4: 代理协调`);

    // 按角色分组任务
    const roleTasks = new Map<OrchestraRole, OrchestraSubTask[]>();
    for (const task of subtasks) {
      if (!roleTasks.has(task.assignedRole)) {
        roleTasks.set(task.assignedRole, []);
      }
      roleTasks.get(task.assignedRole)!.push(task);
    }

    // 协调每个角色的任务
    for (const [role, tasks] of roleTasks.entries()) {
      if (tasks.length > 1) {
        // 多个任务需要协调
        await this.coordinateRoleTasks(role, tasks);
      }
    }
  }

  /**
   * 协调角色内的多个任务
   */
  private async coordinateRoleTasks(role: OrchestraRole, tasks: OrchestraSubTask[]): Promise<void> {
    // 按优先级排序
    tasks.sort((a, b) => a.priority - b.priority);

    // 生成协调消息
    const coordMessage: OrchestraAgentMessage = {
      fromRole: OrchestraRole.PLANNER,
      toRole: role,
      content: `协调 ${tasks.length} 个任务: ${tasks.map(t => t.taskId).join(", ")}`,
      messageType: "coordination",
      attachedData: { taskIds: tasks.map(t => t.taskId) },
      timestamp: Date.now(),
    };
    this.agentMessages.push(coordMessage);

    // 模拟协调延迟
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  /**
   * Phase 5: 结果综合
   */
  private async synthesizeResults(subtasks: OrchestraSubTask[]): Promise<string> {
    console.log(`   📝 Phase 5: 结果综合`);

    // 收集所有任务结果
    const completedTasks = subtasks.filter(t => t.status === OrchestraTaskStatus.COMPLETED);
    const failedTasks = subtasks.filter(t => t.status === OrchestraTaskStatus.FAILED);

    let synthesis = "";

    synthesis += `## AgentOrchestra 任务执行报告\n\n`;
    synthesis += `总任务数: ${subtasks.length}\n`;
    synthesis += `成功: ${completedTasks.length}\n`;
    synthesis += `失败: ${failedTasks.length}\n\n`;

    synthesis += `### 执行摘要\n\n`;
    for (const task of completedTasks) {
      synthesis += `- [${task.taskId}] ${task.description} (${task.assignedRole})\n`;
    }

    if (failedTasks.length > 0) {
      synthesis += `\n### 失败任务\n\n`;
      for (const task of failedTasks) {
        synthesis += `- [${task.taskId}] ${task.description} (${task.status})\n`;
      }
    }

    synthesis += `\n### TEA 协议统计\n\n`;
    synthesis += `总动作数: ${this.teaActions.length}\n`;
    synthesis += `消息数: ${this.agentMessages.length}\n`;

    return synthesis;
  }

  /**
   * 计算性能指标
   */
  private calculatePerformanceMetrics(subtasks: OrchestraSubTask[], totalTime: number): any {
    const completedTasks = subtasks.filter(t => t.status === OrchestraTaskStatus.COMPLETED);
    const taskSuccessRate = subtasks.length > 0 ? completedTasks.length / subtasks.length : 0;

    let totalTaskDuration = 0;
    for (const task of completedTasks) {
      if (task.startTime && task.endTime) {
        totalTaskDuration += task.endTime - task.startTime;
      }
    }

    const averageTaskDuration = completedTasks.length > 0
      ? totalTaskDuration / completedTasks.length
      : 0;

    const coordinationOverhead = totalTime - totalTaskDuration;

    return {
      taskSuccessRate,
      averageTaskDuration,
      coordinationOverhead,
    };
  }

  /**
   * 获取规划树
   */
  getPlanningTree(): PlanningNode | null {
    return this.planningRoot;
  }

  /**
   * 获取 TEA 动作历史
   */
  getTEAActions(): TEAAction[] {
    return [...this.teaActions];
  }

  /**
   * 获取代理消息历史
   */
  getOrchestraAgentMessages(): OrchestraAgentMessage[] {
    return [...this.agentMessages];
  }
}

/**
 * 工厂函数：创建 AgentOrchestra 编排器
 */
export function createAgentOrchestrator(config?: OrchestraConfig): AgentOrchestrator {
  return new AgentOrchestrator(config);
}

/**
 * 任务模板
 */
export const OrchestraTemplates = {
  /** 代码生成任务 */
  codeGeneration: {
    description: "分层多代理协作生成代码",
    recommendedConfig: {
      maxSubTasks: 15,
      maxPlanningDepth: 6,
      enableTEAProtocol: true,
      enableMultimodal: false,
    },
  },

  /** 推理任务 */
  reasoning: {
    description: "分层多代理协作进行逻辑推理",
    recommendedConfig: {
      maxSubTasks: 12,
      maxPlanningDepth: 8,
      enableTEAProtocol: true,
      enableMultimodal: false,
    },
  },

  /** 检索任务 */
  retrieval: {
    description: "分层多代理协作进行信息检索",
    recommendedConfig: {
      maxSubTasks: 8,
      maxPlanningDepth: 4,
      enableTEAProtocol: true,
      enableMultimodal: true,
    },
  },
};
