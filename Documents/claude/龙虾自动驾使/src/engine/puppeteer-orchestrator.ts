/**
 * 🎭 Puppeteer 演化编排器
 *
 * 基于 arXiv:2505.19591 "Multi-Agent Collaboration via Evolving Orchestration"
 *
 * 核心思想：通过类似木偶戏的集中式编排器动态协调多个专业代理
 *
 * 关键创新：
 * - Puppeteer 风格范式：中心编排器（"木偶师"）动态指挥代理
 * - 强化学习训练：编排器通过 RL 学习最优代理调度策略
 * - 状态驱动编排：根据任务状态动态选择哪个代理推理
 * - 计算效率：用更少计算量获得更好的任务解决效果
 * - 灵活集体推理：可演化和自适应的协作机制
 *
 * @see {@link https://arxiv.org/abs/2505.19591} - Puppeteer Paper
 * @see {@link https://arxiv.org/html/2505.19591v2} - HTML Version
 *
 * @version 2.17.0
 * @since 2025-03-11
 */

/**
 * 代理角色类型（木偶/专用代理）
 */
export enum PuppetRole {
  /** 规划者 - 任务分解与规划 */
  PLANNER = "planner",
  /** 研究者 - 信息检索与收集 */
  RESEARCHER = "researcher",
  /** 分析师 - 数据分析与推理 */
  ANALYST = "analyst",
  /** 创作者 - 内容生成 */
  CREATOR = "creator",
  /** 审查者 - 质量检查与验证 */
  REVIEWER = "reviewer",
  /** 综合者 - 结果整合 */
  SYNTHESIZER = "synthesizer",
  /** 调试者 - 问题诊断与修复 */
  DEBUGGER = "debugger",
}

/**
 * 编排动作类型
 */
export enum OrchestrationAction {
  /** 选择代理 */
  SELECT_AGENT = "select_agent",
  /** 传递控制权 */
  PASS_CONTROL = "pass_control",
  /** 收集结果 */
  COLLECT_RESULT = "collect_result",
  /** 重新规划 */
  REPLAN = "replan",
  /** 终止 */
  TERMINATE = "terminate",
}

/**
 * 任务状态
 */
export enum PuppetTaskState {
  /** 待处理 */
  PENDING = "pending",
  /** 规划中 */
  PLANNING = "planning",
  /** 执行中 */
  EXECUTING = "executing",
  /** 审查中 */
  REVIEWING = "reviewing",
  /** 综合中 */
  SYNTHESIZING = "synthesizing",
  /** 已完成 */
  COMPLETED = "completed",
  /** 失败 */
  FAILED = "failed",
}

/**
 * 代理执行动作
 */
export interface AgentAction {
  /** 动作 ID */
  actionId: string;
  /** 执行的代理角色 */
  agentRole: PuppetRole;
  /** 动作描述 */
  description: string;
  /** 输入参数 */
  inputs: Record<string, any>;
  /** 输出结果 */
  outputs?: Record<string, any>;
  /** 执行时间戳 */
  timestamp: number;
  /** 执行耗时（ms） */
  duration?: number;
  /** 成功标志 */
  success?: boolean;
}

/**
 * Puppeteer 编排状态
 */
export interface PuppeteerOrchestrationState {
  /** 当前任务描述 */
  taskDescription: string;
  /** 任务阶段 */
  taskPhase: PuppetTaskState;
  /** 活跃代理列表 */
  activeAgents: PuppetRole[];
  /** 已执行的动作序列 */
  actionHistory: AgentAction[];
  /** 当前累积上下文 */
  accumulatedContext: string;
  /** 质量分数 */
  qualityScore: number;
  /** 计算预算使用 */
  budgetUsed: number;
  /** 预算上限 */
  budgetLimit: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 代理能力定义
 */
export interface AgentCapability {
  /** 代理角色 */
  role: PuppetRole;
  /** 擅长任务类型 */
  strengths: string[];
  /** 弱点任务类型 */
  weaknesses: string[];
  /** 计算成本（相对值） */
  computeCost: number;
  /** 平均执行时间（ms） */
  avgDuration: number;
  /** 成功率（0-1） */
  successRate: number;
}

/**
 * 编排决策
 */
export interface OrchestrationDecision {
  /** 决策 ID */
  decisionId: string;
  /** 选择编排动作 */
  action: OrchestrationAction;
  /** 目标代理角色 */
  targetRole: PuppetRole;
  /** 决策理由 */
  reasoning: string;
  /** 预期质量提升 */
  expectedQualityGain: number;
  /** 预期计算成本 */
  expectedCost: number;
  /** 置信度（0-1） */
  confidence: number;
}

/**
 * Puppeteer 配置
 */
export interface PuppeteerConfig {
  /** 最大轮数 */
  maxRounds?: number;
  /** 计算预算限制（token 数） */
  budgetLimit?: number;
  /** 质量阈值 */
  qualityThreshold?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 可用代理列表 */
  availableAgents?: PuppetRole[];
  /** 是否启用强化学习优化 */
  enableRL?: boolean;
  /** 学习率 */
  learningRate?: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<PuppeteerConfig> = {
  maxRounds: 15,
  budgetLimit: 100000,
  qualityThreshold: 0.8,
  enableDetailedLogging: false,
  availableAgents: [
    PuppetRole.PLANNER,
    PuppetRole.RESEARCHER,
    PuppetRole.ANALYST,
    PuppetRole.CREATOR,
    PuppetRole.REVIEWER,
    PuppetRole.SYNTHESIZER,
    PuppetRole.DEBUGGER,
  ],
  enableRL: false,
  learningRate: 0.01,
};

/**
 * 代理能力矩阵（默认值）
 */
const AGENT_CAPABILITIES: Map<PuppetRole, AgentCapability> = new Map([
  [PuppetRole.PLANNER, {
    role: PuppetRole.PLANNER,
    strengths: ["task_decomposition", "goal_formulation", "dependency_analysis"],
    weaknesses: ["detailed_execution", "creative_writing"],
    computeCost: 1.0,
    avgDuration: 2000,
    successRate: 0.95,
  }],
  [PuppetRole.RESEARCHER, {
    role: PuppetRole.RESEARCHER,
    strengths: ["information_retrieval", "fact_checking", "source_verification"],
    weaknesses: ["creative_synthesis", "strategic_planning"],
    computeCost: 1.5,
    avgDuration: 3000,
    successRate: 0.90,
  }],
  [PuppetRole.ANALYST, {
    role: PuppetRole.ANALYST,
    strengths: ["data_analysis", "logical_reasoning", "pattern_recognition"],
    weaknesses: ["creative_content", "subjective_judgment"],
    computeCost: 2.0,
    avgDuration: 4000,
    successRate: 0.88,
  }],
  [PuppetRole.CREATOR, {
    role: PuppetRole.CREATOR,
    strengths: ["content_generation", "creative_writing", "problem_solving"],
    weaknesses: ["fact_verification", "rigorous_analysis"],
    computeCost: 1.8,
    avgDuration: 3500,
    successRate: 0.85,
  }],
  [PuppetRole.REVIEWER, {
    role: PuppetRole.REVIEWER,
    strengths: ["quality_assessment", "error_detection", "consistency_check"],
    weaknesses: ["creative_generation", "speculative_analysis"],
    computeCost: 1.2,
    avgDuration: 2500,
    successRate: 0.92,
  }],
  [PuppetRole.SYNTHESIZER, {
    role: PuppetRole.SYNTHESIZER,
    strengths: ["result_integration", "summary_generation", "consensus_building"],
    weaknesses: ["deep_analysis", "original_research"],
    computeCost: 1.5,
    avgDuration: 3000,
    successRate: 0.90,
  }],
  [PuppetRole.DEBUGGER, {
    role: PuppetRole.DEBUGGER,
    strengths: ["error_diagnosis", "root_cause_analysis", "fix_proposal"],
    weaknesses: ["creative_solutions", "high_level_planning"],
    computeCost: 1.8,
    avgDuration: 3500,
    successRate: 0.87,
  }],
]);

/**
 * 🎭 Puppeteer 演化编排器
 *
 * 实现基于强化学习的多代理动态编排
 */
export class PuppeteerOrchestrator {
  private config: Required<PuppeteerConfig>;
  private state: PuppeteerOrchestrationState;
  private actionHistory: AgentAction[] = [];
  private agentCapabilities: Map<PuppetRole, AgentCapability>;
  // RL 相关组件
  private qTable: Map<string, number[]> = new Map(); // 状态 -> 每个 action 的 Q 值
  private learningEnabled: boolean;

  constructor(config: PuppeteerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.agentCapabilities = AGENT_CAPABILITIES;
    this.learningEnabled = this.config.enableRL;

    // 初始状态
    this.state = {
      taskDescription: "",
      taskPhase: PuppetTaskState.PENDING,
      activeAgents: [],
      actionHistory: [],
      accumulatedContext: "",
      qualityScore: 0,
      budgetUsed: 0,
      budgetLimit: this.config.budgetLimit,
      timestamp: Date.now(),
    };

    console.log(`🎭 Puppeteer 编排器初始化`);
    console.log(`   最大轮数: ${this.config.maxRounds}`);
    console.log(`   预算限制: ${this.config.budgetLimit} tokens`);
    console.log(`   可用代理: ${this.config.availableAgents.length} 个`);
    console.log(`   RL 优化: ${this.learningEnabled ? "启用" : "禁用"}`);
  }

  /**
   * 执行编排任务
   */
  async orchestrate(taskDescription: string): Promise<{
    finalResult: string;
    qualityScore: number;
    roundsUsed: number;
    executionTime: number;
    actionSequence: AgentAction[];
    totalCost: number;
  }> {
    console.log(`🎭 Puppeteer 编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 初始化状态
    this.state.taskDescription = taskDescription;
    this.state.taskPhase = PuppetTaskState.PLANNING;
    this.state.accumulatedContext = `Task: ${taskDescription}\n\n`;

    let round = 0;
    let qualityMet = false;

    // 主编排循环
    while (round < this.config.maxRounds && !qualityMet) {
      round++;
      console.log(`\n   🎭 Round ${round}/${this.config.maxRounds}`);

      // 1. Puppeteer 决策下一步动作
      const decision = this.puppeteerDecision(this.state);

      if (decision.action === OrchestrationAction.TERMINATE) {
        console.log(`   🏁 终止编排: ${decision.reasoning}`);
        break;
      }

      // 2. 执行决策
      const action = await this.executeDecision(decision);
      this.actionHistory.push(action);

      // 3. 更新状态
      this.updateState(action);

      // 4. 检查是否达到质量阈值
      if (this.state.qualityScore >= this.config.qualityThreshold) {
        qualityMet = true;
        console.log(`   ✅ 质量达标: ${this.state.qualityScore.toFixed(2)} >= ${this.config.qualityThreshold}`);
      }

      // 5. 检查预算
      if (this.state.budgetUsed >= this.state.budgetLimit) {
        console.log(`   💰 预算耗尽: ${this.state.budgetUsed}/${this.state.budgetLimit}`);
        break;
      }

      // 6. RL 更新（如果启用）
      if (this.learningEnabled) {
        this.updateQValue(this.getStateKey(this.state), decision, this.state.qualityScore);
      }
    }

    // 最终综合
    const finalResult = await this.synthesizeFinalResult();

    const executionTime = Date.now() - startTime;

    console.log(`\n🎭 编排完成:`);
    console.log(`   轮数: ${round}/${this.config.maxRounds}`);
    console.log(`   质量: ${this.state.qualityScore.toFixed(2)}`);
    console.log(`   成本: ${this.state.budgetUsed} tokens`);
    console.log(`   耗时: ${executionTime}ms`);

    return {
      finalResult,
      qualityScore: this.state.qualityScore,
      roundsUsed: round,
      executionTime,
      actionSequence: [...this.actionHistory],
      totalCost: this.state.budgetUsed,
    };
  }

  /**
   * Puppeteer 决策下一个动作
   */
  private puppeteerDecision(state: PuppeteerOrchestrationState): OrchestrationDecision {
    // 根据当前状态和 Q 表选择动作
    const stateKey = this.getStateKey(state);
    const qValues = this.getQValues(stateKey);

    // 如果有 Q 值且 RL 启用，使用 Q 学习选择
    if (this.learningEnabled && qValues.length > 0 && Math.random() > 0.1) {
      // ε-greedy: 90% 使用最优动作
      const bestActionIdx = qValues.indexOf(Math.max(...qValues));
      const action = this.getAvailableActions()[bestActionIdx];
      return {
        decisionId: `decision_${Date.now()}`,
        action: action.actionType,
        targetRole: action.targetRole,
        reasoning: `RL-based decision (Q-value: ${qValues[bestActionIdx].toFixed(3)})`,
        expectedQualityGain: 0.1,
        expectedCost: action.expectedCost,
        confidence: 0.8,
      };
    }

    // 基于规则的决策
    return this.ruleBasedDecision(state);
  }

  /**
   * 基于规则的决策
   */
  private ruleBasedDecision(state: PuppeteerOrchestrationState): OrchestrationDecision {
    const { taskPhase, qualityScore, budgetUsed, budgetLimit } = state;

    // 质量已达标 - 终止
    if (qualityScore >= this.config.qualityThreshold) {
      return {
        decisionId: `decision_${Date.now()}`,
        action: OrchestrationAction.TERMINATE,
        targetRole: PuppetRole.SYNTHESIZER,
        reasoning: "Quality threshold reached",
        expectedQualityGain: 0,
        expectedCost: 0,
        confidence: 1.0,
      };
    }

    // 预算接近耗尽 - 综合结果
    if (budgetUsed >= budgetLimit * 0.9) {
      return {
        decisionId: `decision_${Date.now()}`,
        action: OrchestrationAction.COLLECT_RESULT,
        targetRole: PuppetRole.SYNTHESIZER,
        reasoning: "Budget nearly exhausted, synthesizing final result",
        expectedQualityGain: 0.05,
        expectedCost: 1000,
        confidence: 0.9,
      };
    }

    // 根据任务阶段决策
    switch (taskPhase) {
      case PuppetTaskState.PENDING:
      case PuppetTaskState.PLANNING:
        return {
          decisionId: `decision_${Date.now()}`,
          action: OrchestrationAction.SELECT_AGENT,
          targetRole: PuppetRole.PLANNER,
          reasoning: "Initial planning phase - select planner agent",
          expectedQualityGain: 0.3,
          expectedCost: this.getAgentCost(PuppetRole.PLANNER),
          confidence: 0.95,
        };

      case PuppetTaskState.EXECUTING:
        // 检查是否需要审查
        const lastAction = this.actionHistory[this.actionHistory.length - 1];
        if (lastAction && !lastAction.success) {
          return {
            decisionId: `decision_${Date.now()}`,
            action: OrchestrationAction.SELECT_AGENT,
            targetRole: PuppetRole.DEBUGGER,
            reasoning: "Previous action failed - select debugger",
            expectedQualityGain: 0.2,
            expectedCost: this.getAgentCost(PuppetRole.DEBUGGER),
            confidence: 0.85,
          };
        }

        // 根据累积上下文长度决定下一步
        if (state.accumulatedContext.length < 1000) {
          return {
            decisionId: `decision_${Date.now()}`,
            action: OrchestrationAction.SELECT_AGENT,
            targetRole: PuppetRole.RESEARCHER,
            reasoning: "Need more information - select researcher",
            expectedQualityGain: 0.25,
            expectedCost: this.getAgentCost(PuppetRole.RESEARCHER),
            confidence: 0.9,
          };
        } else if (state.accumulatedContext.length < 3000) {
          return {
            decisionId: `decision_${Date.now()}`,
            action: OrchestrationAction.SELECT_AGENT,
            targetRole: PuppetRole.ANALYST,
            reasoning: "Sufficient data - select analyst",
            expectedQualityGain: 0.3,
            expectedCost: this.getAgentCost(PuppetRole.ANALYST),
            confidence: 0.85,
          };
        } else {
          return {
            decisionId: `decision_${Date.now()}`,
            action: OrchestrationAction.SELECT_AGENT,
            targetRole: PuppetRole.CREATOR,
            reasoning: "Ready for content generation - select creator",
            expectedQualityGain: 0.35,
            expectedCost: this.getAgentCost(PuppetRole.CREATOR),
            confidence: 0.8,
          };
        }

      case PuppetTaskState.REVIEWING:
        return {
          decisionId: `decision_${Date.now()}`,
          action: OrchestrationAction.SELECT_AGENT,
          targetRole: PuppetRole.REVIEWER,
          reasoning: "Review phase - select reviewer",
          expectedQualityGain: 0.15,
          expectedCost: this.getAgentCost(PuppetRole.REVIEWER),
          confidence: 0.9,
        };

      case PuppetTaskState.SYNTHESIZING:
        return {
          decisionId: `decision_${Date.now()}`,
          action: OrchestrationAction.COLLECT_RESULT,
          targetRole: PuppetRole.SYNTHESIZER,
          reasoning: "Synthesis complete - collect final result",
          expectedQualityGain: 0.1,
          expectedCost: this.getAgentCost(PuppetRole.SYNTHESIZER),
          confidence: 0.95,
        };

      default:
        return {
          decisionId: `decision_${Date.now()}`,
          action: OrchestrationAction.REPLAN,
          targetRole: PuppetRole.PLANNER,
          reasoning: "Unknown phase - replan",
          expectedQualityGain: 0.1,
          expectedCost: this.getAgentCost(PuppetRole.PLANNER),
          confidence: 0.5,
        };
    }
  }

  /**
   * 执行编排决策
   */
  private async executeDecision(decision: OrchestrationDecision): Promise<AgentAction> {
    const startTime = Date.now();

    // 模拟代理执行
    const result = await this.simulateAgentExecution(decision);

    const duration = Date.now() - startTime;

    return {
      actionId: `action_${Date.now()}`,
      agentRole: decision.targetRole,
      description: decision.reasoning,
      inputs: { decision },
      outputs: result,
      timestamp: Date.now(),
      duration,
      success: result.success || Math.random() > 0.2, // 模拟成功率
    };
  }

  /**
   * 模拟代理执行
   */
  private async simulateAgentExecution(decision: OrchestrationDecision): Promise<Record<string, any>> {
    // 模拟计算延迟
    const capability = this.agentCapabilities.get(decision.targetRole);
    const delay = capability ? capability.avgDuration * (0.8 + Math.random() * 0.4) : 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 模拟结果生成
    const results = {
      success: Math.random() > 0.15, // 85% 成功率基础
      content: this.generateMockContent(decision.targetRole, decision.reasoning),
      quality: 0.6 + Math.random() * 0.4, // 0.6-1.0 随机质量
      tokensUsed: Math.floor(1000 + Math.random() * 2000),
      reasoning: `${decision.targetRole} executed: ${decision.reasoning}`,
    };

    return results;
  }

  /**
   * 生成模拟内容
   */
  private generateMockContent(role: PuppetRole, context: string): string {
    const templates: Record<PuppetRole, string[]> = {
      [PuppetRole.PLANNER]: [
        "Breaking down task into sub-components: [analysis, research, creation, review]",
        "Establishing workflow: 1. Information gathering 2. Analysis 3. Solution design 4. Verification",
      ],
      [PuppetRole.RESEARCHER]: [
        "Gathered relevant information from multiple sources. Key findings: [fact1, fact2, fact3]",
        "Verified 3 data points against authoritative sources. All confirmed accurate.",
      ],
      [PuppetRole.ANALYST]: [
        "Analysis complete. Main patterns identified: [pattern A, pattern B]. Recommendations: [rec1, rec2]",
        "Logical evaluation: Premises [A, B] support conclusion [C]. Confidence: 85%",
      ],
      [PuppetRole.CREATOR]: [
        "Generated content with structure: [introduction, body, conclusion]. Tone: professional",
        "Created solution proposal with 3 alternative approaches ranked by feasibility.",
      ],
      [PuppetRole.REVIEWER]: [
        "Quality assessment: Structure (9/10), Accuracy (8/10), Clarity (9/10). Overall: 8.7/10",
        "Found 2 minor issues. Recommendations: [fix1, fix2]. Approved with revisions.",
      ],
      [PuppetRole.SYNTHESIZER]: [
        "Synthesized result combining 5 agent outputs. Key conclusion: [main point]",
        "Final summary: Consensus achieved on [topic]. Confidence: 92%",
      ],
      [PuppetRole.DEBUGGER]: [
        "Diagnosed issue: Root cause identified as [cause]. Proposed fix: [solution]",
        "Error analysis: Type III error in [module]. Fix applied and verified.",
      ],
    };

    const roleTemplates = templates[role] || ["Executed task for " + role];
    return roleTemplates[Math.floor(Math.random() * roleTemplates.length)];
  }

  /**
   * 更新编排状态
   */
  private updateState(action: AgentAction): void {
    // 更新累积上下文
    if (action.outputs?.content) {
      this.state.accumulatedContext += `\n[${action.agentRole}]: ${action.outputs.content}\n`;
    }

    // 更新预算使用
    const tokensUsed = action.outputs?.tokensUsed || this.getAgentCost(action.agentRole);
    this.state.budgetUsed += tokensUsed;

    // 更新质量分数（加权移动平均）
    const actionQuality = action.outputs?.quality || (action.success ? 0.7 : 0.3);
    this.state.qualityScore = this.state.qualityScore * 0.7 + actionQuality * 0.3;

    // 更新任务阶段
    this.state.taskPhase = this.determineNextPhase(action);

    // 更新时间戳
    this.state.timestamp = Date.now();
  }

  /**
   * 确定下一阶段
   */
  private determineNextPhase(action: AgentAction): PuppetTaskState {
    switch (action.agentRole) {
      case PuppetRole.PLANNER:
        return PuppetTaskState.EXECUTING;
      case PuppetRole.DEBUGGER:
        return action.success ? PuppetTaskState.EXECUTING : PuppetTaskState.FAILED;
      case PuppetRole.REVIEWER:
        return action.success ? PuppetTaskState.SYNTHESIZING : PuppetTaskState.EXECUTING;
      case PuppetRole.SYNTHESIZER:
        return PuppetTaskState.COMPLETED;
      default:
        // CREATOR, ANALYST, RESEARCHER 继续执行
        if (this.state.accumulatedContext.length > 2000) {
          return PuppetTaskState.REVIEWING;
        }
        return PuppetTaskState.EXECUTING;
    }
  }

  /**
   * 综合最终结果
   */
  private async synthesizeFinalResult(): Promise<string> {
    const { qualityScore, accumulatedContext, actionHistory } = this.state;

    // 综合所有代理输出
    let synthesis = `🎭 Puppeteer 编排结果\n`;
    synthesis += `=${"=".repeat(50)}\n\n`;
    synthesis += `任务: ${this.state.taskDescription}\n\n`;
    synthesis += `执行摘要:\n`;
    synthesis += `- 总轮数: ${actionHistory.length}\n`;
    synthesis += `- 质量分数: ${qualityScore.toFixed(2)}/1.0\n`;
    synthesis += `- 计算成本: ${this.state.budgetUsed} tokens\n\n`;

    // 按角色汇总动作
    const roleActions = new Map<PuppetRole, number>();
    for (const action of actionHistory) {
      roleActions.set(action.agentRole, (roleActions.get(action.agentRole) || 0) + 1);
    }

    synthesis += `代理活动统计:\n`;
    for (const [role, count] of roleActions.entries()) {
      synthesis += `- ${role}: ${count} 次调用\n`;
    }

    synthesis += `\n最终结论:\n`;
    synthesis += accumulatedContext.slice(-1000); // 取最后 1000 字符

    return synthesis;
  }

  /**
   * 获取状态键（用于 Q 学习）
   */
  private getStateKey(state: PuppeteerOrchestrationState): string {
    return `${state.taskPhase}_${Math.floor(state.qualityScore * 10)}_${Math.floor(state.budgetUsed / 10000)}`;
  }

  /**
   * 获取可用动作
   */
  private getAvailableActions(): Array<{
    actionType: OrchestrationAction;
    targetRole: PuppetRole;
    expectedCost: number;
  }> {
    const actions: Array<{
      actionType: OrchestrationAction;
      targetRole: PuppetRole;
      expectedCost: number;
    }> = [];

    // 为每个可用代理生成选择动作
    for (const role of this.config.availableAgents) {
      actions.push({
        actionType: OrchestrationAction.SELECT_AGENT,
        targetRole: role,
        expectedCost: this.getAgentCost(role),
      });
    }

    return actions;
  }

  /**
   * 获取 Q 值
   */
  private getQValues(stateKey: string): number[] {
    if (!this.qTable.has(stateKey)) {
      // 初始化为 0
      const actions = this.getAvailableActions();
      this.qTable.set(stateKey, new Array(actions.length).fill(0));
    }
    return this.qTable.get(stateKey) || [];
  }

  /**
   * 更新 Q 值（Q 学习）
   */
  private updateQValue(stateKey: string, decision: OrchestrationDecision, reward: number): void {
    const qValues = this.getQValues(stateKey);
    const actionIdx = this.getAvailableActions().findIndex(
      a => a.actionType === decision.action && a.targetRole === decision.targetRole
    );

    if (actionIdx >= 0) {
      // Q 学习更新规则
      const currentQ = qValues[actionIdx];
      const newQ = currentQ + this.config.learningRate * (reward - currentQ);
      qValues[actionIdx] = newQ;

      this.qTable.set(stateKey, qValues);
    }
  }

  /**
   * 获取代理计算成本
   */
  private getAgentCost(role: PuppetRole): number {
    const capability = this.agentCapabilities.get(role);
    return capability ? capability.computeCost * 1000 : 1000;
  }

  /**
   * 获取 Q 表（用于分析）
   */
  getQTable(): Map<string, number[]> {
    return new Map(this.qTable);
  }

  /**
   * 获取编排历史
   */
  getActionHistory(): AgentAction[] {
    return [...this.actionHistory];
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): PuppeteerOrchestrationState {
    return { ...this.state };
  }
}

/**
 * 工厂函数：创建 Puppeteer 编排器
 */
export function createPuppeteerOrchestrator(
  config?: PuppeteerConfig
): PuppeteerOrchestrator {
  return new PuppeteerOrchestrator(config);
}

/**
 * 任务模板
 */
export const PuppeteerTemplates = {
  /** 复杂问题解决 */
  complexProblemSolving: {
    description: "解决需要多步骤分析的复杂问题",
    recommendedConfig: {
      maxRounds: 20,
      budgetLimit: 150000,
      qualityThreshold: 0.85,
      availableAgents: [
        PuppetRole.PLANNER,
        PuppetRole.RESEARCHER,
        PuppetRole.ANALYST,
        PuppetRole.CREATOR,
        PuppetRole.REVIEWER,
        PuppetRole.SYNTHESIZER,
      ],
    },
  },

  /** 创意内容生成 */
  creativeContent: {
    description: "生成高质量的创意内容",
    recommendedConfig: {
      maxRounds: 12,
      budgetLimit: 80000,
      qualityThreshold: 0.75,
      availableAgents: [
        PuppetRole.PLANNER,
        PuppetRole.RESEARCHER,
        PuppetRole.CREATOR,
        PuppetRole.REVIEWER,
        PuppetRole.SYNTHESIZER,
      ],
    },
  },

  /** 数据分析任务 */
  dataAnalysis: {
    description: "深度数据分析和洞察提取",
    recommendedConfig: {
      maxRounds: 15,
      budgetLimit: 120000,
      qualityThreshold: 0.80,
      availableAgents: [
        PuppetRole.PLANNER,
        PuppetRole.RESEARCHER,
        PuppetRole.ANALYST,
        PuppetRole.SYNTHESIZER,
      ],
    },
  },

  /** 调试与修复 */
  debugging: {
    description: "诊断问题并生成解决方案",
    recommendedConfig: {
      maxRounds: 10,
      budgetLimit: 100000,
      qualityThreshold: 0.70,
      availableAgents: [
        PuppetRole.PLANNER,
        PuppetRole.ANALYST,
        PuppetRole.DEBUGGER,
        PuppetRole.REVIEWER,
      ],
    },
  },
};
