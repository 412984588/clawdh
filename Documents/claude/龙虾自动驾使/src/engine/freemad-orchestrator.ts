/**
 * 🗣️ Free-MAD: Consensus-Free Multi-Agent Debate 编排器
 *
 * 基于 arXiv:2509.11035 "Free-MAD: Consensus-Free Multi-Agent Debate"
 *
 * 核心思想：消除多智能体辩论中达成共识的需求，通过评分机制和反从众行为提升推理能力
 *
 * 关键创新：
 * - 无共识辩论：无需多轮交互达成共识
 * - 基于轨迹的评分：评估整个辩论过程而非仅最后一轮
 * - 推理演化追踪：监控每个智能体的推理演变
 * - 反从众机制：智能体可缓解多数派的不当影响
 * - 单轮辩论：降低 token 成本
 *
 * @see {@link https://arxiv.org/abs/2509.11035} - Free-MAD Paper
 *
 * @version 2.31.0
 * @since 2025-03-11
 */

/**
 * 辩论阶段
 */
export enum DebatePhase {
  /** 初始化 */
  INITIALIZATION = "initialization",
  /** 独立推理 */
  INDEPENDENT_REASONING = "independent_reasoning",
  /** 反从众辩论 */
  ANTI_CONFORMITY_DEBATE = "anti_conformity_debate",
  /** 轨迹评分 */
  TRAJECTORY_SCORING = "trajectory_scoring",
  /** 最终选择 */
  FINAL_SELECTION = "final_selection",
}

/**
 * 智能体状态
 */
export enum FreeMADAgentState {
  /** 空闲 */
  IDLE = "idle",
  /** 推理中 */
  REASONING = "reasoning",
  /** 辩论中 */
  DEBATING = "debating",
  /** 已完成 */
  COMPLETED = "completed",
  /** 受影响（从众行为） */
  INFLUENCED = "influenced",
  /** 反从众 */
  ANTI_CONFORMING = "anti_conforming",
}

/**
 * 推理轨迹点
 */
export interface ReasoningTrajectoryPoint {
  /** 时间戳 */
  timestamp: number;
  /** 智能体 ID */
  agentId: string;
  /** 推理内容 */
  reasoning: string;
  /** 置信度 */
  confidence: number;
  /** 与初始回答的一致性 */
  consistency: number;
  /** 状态 */
  state: FreeMADAgentState;
}

/**
 * 智能体回答
 */
export interface FreeMADAgentResponse {
  /** 智能体 ID */
  agentId: string;
  /** 初始回答 */
  initialAnswer: string;
  /** 当前回答 */
  currentAnswer: string;
  /** 推理轨迹 */
  trajectory: ReasoningTrajectoryPoint[];
  /** 初始置信度 */
  initialConfidence: number;
  /** 当前置信度 */
  currentConfidence: number;
  /** 一致性得分 */
  consistencyScore: number;
  /** 创新性得分 */
  innovationScore: number;
  /** 反从众强度 */
  antiConformityStrength: number;
}

/**
 * 轨迹评分
 */
export interface TrajectoryScore {
  /** 智能体 ID */
  agentId: string;
  /** 总分 */
  totalScore: number;
  /** 一致性得分 */
  consistencyScore: number;
  /** 演化质量得分 */
  evolutionQuality: number;
  /** 独立性得分 */
  independenceScore: number;
  /** 初始正确性得分 */
  initialCorrectness: number;
  /** 最终质量得分 */
  finalQuality: number;
}

/**
 * 评分权重配置
 */
export interface ScoringWeights {
  /** 一致性权重 */
  consistencyWeight?: number;
  /** 演化质量权重 */
  evolutionWeight?: number;
  /** 独立性权重 */
  independenceWeight?: number;
  /** 初始正确性权重 */
  initialCorrectnessWeight?: number;
  /** 最终质量权重 */
  finalQualityWeight?: number;
}

/**
 * 反从众机制
 */
export interface AntiConformityMechanism {
  /** 机制类型 */
  type: "random" | "minority_bias" | "confidence_threshold";
  /** 触发阈值 */
  threshold: number;
  /** 强度 */
  strength: number;
  /** 启用状态 */
  enabled: boolean;
}

/**
 * 辩论轮次
 */
export interface DebateRound {
  /** 轮次 ID */
  roundId: string;
  /** 轮次编号 */
  roundNumber: number;
  /** 所有回答 */
  responses: FreeMADAgentResponse[];
  /** 阶段 */
  phase: DebatePhase;
  /** 多数派观点 */
  majorityView: string;
  /** 少数派观点 */
  minorityViews: string[];
}

/**
 * Free-MAD 配置
 */
export interface FreeMADConfig {
  /** 智能体数量 */
  numAgents?: number;
  /** 反从众阈值 (0-1) */
  antiConformityThreshold?: number;
  /** 最小置信度阈值 */
  minConfidenceThreshold?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 模型列表 */
  models?: string[];
}

/**
 * 辩论结果
 */
export interface FreeMADResult {
  /** 结果 ID */
  resultId: string;
  /** 任务描述 */
  taskDescription: string;
  /** 最终答案 */
  finalAnswer: string;
  /** 获胜智能体 ID */
  winnerAgentId: string;
  /** 所有智能体回答 */
  allResponses: FreeMADAgentResponse[];
  /** 辩论轮次 */
  debateRounds: DebateRound[];
  /** 轨迹评分 */
  trajectoryScores: TrajectoryScore[];
  /** 一致性分析 */
  consistencyAnalysis: {
    /** 初始一致性 */
    initialConsistency: number;
    /** 最终一致性 */
    finalConsistency: number;
    /** 一致性变化 */
    consistencyChange: number;
  };
  /** 总迭代次数 */
  totalIterations: number;
  /** 处理时间 */
  processingTime: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<Omit<FreeMADConfig, 'models'>> = {
  numAgents: 5,
  antiConformityThreshold: 0.6,
  minConfidenceThreshold: 0.5,
  enableDetailedLogging: false,
};

/**
 * 默认模型列表
 */
const DEFAULT_MODELS = [
  "gpt-4o",
  "claude-3.5-sonnet",
  "gemini-1.5-pro",
  "llama-3.1-70b",
  "mistral-large",
] as const;

/**
 * 🗣️ Free-MAD 编排器
 *
 * 实现无共识多智能体辩论框架
 */
export class FreeMADOrchestrator {
  private config: Required<FreeMADConfig>;
  private debateHistory: Map<string, FreeMADResult> = new Map();

  constructor(config: FreeMADConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      models: config.models || [...DEFAULT_MODELS],
      ...config,
      numAgents: config.numAgents ?? DEFAULT_CONFIG.numAgents,
      antiConformityThreshold: config.antiConformityThreshold ?? DEFAULT_CONFIG.antiConformityThreshold,
      minConfidenceThreshold: config.minConfidenceThreshold ?? DEFAULT_CONFIG.minConfidenceThreshold,
      enableDetailedLogging: config.enableDetailedLogging ?? DEFAULT_CONFIG.enableDetailedLogging,
    };

    console.log(`🗣️ Free-MAD 编排器初始化`);
    console.log(`   智能体数量: ${this.config.numAgents}`);
    console.log(`   反从众阈值: ${this.config.antiConformityThreshold}`);
  }

  /**
   * 执行 Free-MAD 辩论
   */
  async debate(taskDescription: string, config?: Partial<FreeMADConfig>): Promise<FreeMADResult> {
    console.log(`🗣️ Free-MAD 辩论开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 合并配置
    const mergedConfig = { ...this.config, ...config };

    // 1. 初始化阶段
    const initialRound = await this.executeInitialization(taskDescription, mergedConfig);

    // 2. 独立推理阶段
    const reasoningRound = await this.executeIndependentReasoning(initialRound, mergedConfig);

    // 3. 反从众辩论阶段
    const debateRound = await this.executeAntiConformityDebate(reasoningRound, mergedConfig);

    // 4. 轨迹评分阶段
    const scores = await this.executeTrajectoryScoring(debateRound, mergedConfig);

    // 5. 最终选择阶段
    const finalResult = await this.executeFinalSelection(debateRound, scores, mergedConfig);

    const processingTime = Date.now() - startTime;
    finalResult.processingTime = processingTime;
    finalResult.debateRounds = [initialRound, reasoningRound, debateRound];

    this.debateHistory.set(finalResult.resultId, finalResult);

    console.log(`🗣️ 辩论完成: ${processingTime}ms, 轮次: ${finalResult.totalIterations}, 获胜者: ${finalResult.winnerAgentId}`);

    return finalResult;
  }

  /**
   * 执行初始化阶段
   */
  private async executeInitialization(
    taskDescription: string,
    config: Required<FreeMADConfig>
  ): Promise<DebateRound> {
    const roundId = `init_${Date.now()}`;

    // 为每个智能体创建初始响应
    const responses: FreeMADAgentResponse[] = [];
    for (let i = 0; i < config.numAgents; i++) {
      const agentId = `agent_${i}`;
      const model = config.models[i % config.models.length];

      const initialPoint: ReasoningTrajectoryPoint = {
        timestamp: Date.now(),
        agentId,
        reasoning: `${model}: Initial analysis of "${taskDescription.substring(0, 30)}..."`,
        confidence: 0.5 + Math.random() * 0.4,
        consistency: 1.0,
        state: FreeMADAgentState.IDLE,
      };

      responses.push({
        agentId,
        initialAnswer: this.generateInitialAnswer(taskDescription, model),
        currentAnswer: "",
        trajectory: [initialPoint],
        initialConfidence: initialPoint.confidence,
        currentConfidence: initialPoint.confidence,
        consistencyScore: 1.0,
        innovationScore: Math.random(),
        antiConformityStrength: 0,
      });
    }

    return {
      roundId,
      roundNumber: 0,
      responses,
      phase: DebatePhase.INITIALIZATION,
      majorityView: "",
      minorityViews: [],
    };
  }

  /**
   * 执行独立推理阶段
   */
  private async executeIndependentReasoning(
    initRound: DebateRound,
    config: Required<FreeMADConfig>
  ): Promise<DebateRound> {
    const roundId = `reasoning_${Date.now()}`;

    const responses: FreeMADAgentResponse[] = initRound.responses.map((agent) => {
      const model = config.models[parseInt(agent.agentId.split("_")[1]) % config.models.length];

      // 更新轨迹
      const reasoningPoint: ReasoningTrajectoryPoint = {
        timestamp: Date.now(),
        agentId: agent.agentId,
        reasoning: this.generateReasoning(agent.initialAnswer, model, "independent"),
        confidence: agent.initialConfidence * (0.9 + Math.random() * 0.2),
        consistency: 1.0,
        state: FreeMADAgentState.REASONING,
      };

      // 计算创新性得分
      const innovationScore = this.calculateInnovationScore(agent, reasoningPoint);

      return {
        ...agent,
        currentAnswer: agent.initialAnswer,
        trajectory: [...agent.trajectory, reasoningPoint],
        currentConfidence: reasoningPoint.confidence,
        innovationScore,
      };
    });

    // 分析多数派和少数派观点
    const { majorityView, minorityViews } = this.analyzeViews(responses);

    return {
      roundId,
      roundNumber: 1,
      responses,
      phase: DebatePhase.INDEPENDENT_REASONING,
      majorityView,
      minorityViews,
    };
  }

  /**
   * 执行反从众辩论阶段
   */
  private async executeAntiConformityDebate(
    reasoningRound: DebateRound,
    config: Required<FreeMADConfig>
  ): Promise<DebateRound> {
    const roundId = `debate_${Date.now()}`;

    const responses = reasoningRound.responses.map((agent) => {
      const model = config.models[parseInt(agent.agentId.split("_")[1]) % config.models.length];
      const isMajority = agent.currentAnswer === reasoningRound.majorityView;

      // 计算反从众强度
      let antiConformityStrength = 0;
      let newState = FreeMADAgentState.DEBATING;

      if (!isMajority) {
        // 少数派智能体具有更强的反从众倾向
        antiConformityStrength = 0.5 + Math.random() * 0.5;
        newState = FreeMADAgentState.ANTI_CONFORMING;
      } else {
        // 多数派智能体可能受到影响
        const influenceRisk = Math.random();
        if (influenceRisk > config.antiConformityThreshold) {
          antiConformityStrength = 0.3 + Math.random() * 0.4;
          newState = FreeMADAgentState.INFLUENCED;
        }
      }

      // 生成反从众推理
      const debatePoint: ReasoningTrajectoryPoint = {
        timestamp: Date.now(),
        agentId: agent.agentId,
        reasoning: this.generateReasoning(agent.currentAnswer, model, "anti_conformity"),
        confidence: agent.currentConfidence * (1 + antiConformityStrength * 0.2),
        consistency: isMajority ? 0.8 : 0.95, // 少数派保持更高一致性
        state: newState,
      };

      // 计算一致性得分
      const consistencyScore = this.calculateConsistencyScore(agent);

      return {
        ...agent,
        trajectory: [...agent.trajectory, debatePoint],
        currentConfidence: debatePoint.confidence,
        consistencyScore,
        antiConformityStrength,
      };
    });

    // 重新分析多数派和少数派
    const { majorityView, minorityViews } = this.analyzeViews(responses);

    return {
      roundId,
      roundNumber: 2,
      responses,
      phase: DebatePhase.ANTI_CONFORMITY_DEBATE,
      majorityView,
      minorityViews,
    };
  }

  /**
   * 执行轨迹评分阶段
   */
  private async executeTrajectoryScoring(
    debateRound: DebateRound,
    config: Required<FreeMADConfig>
  ): Promise<TrajectoryScore[]> {
    const scores: TrajectoryScore[] = debateRound.responses.map((agent) => {
      // 1. 一致性得分：评估推理的一致性
      const consistencyScore = agent.consistencyScore;

      // 2. 演化质量得分：评估推理的改进程度
      const evolutionQuality = this.calculateEvolutionQuality(agent);

      // 3. 独立性得分：评估与多数派的独立性
      const independenceScore = agent.currentAnswer === debateRound.majorityView ? 0.3 : 0.9;

      // 4. 初始正确性得分
      const initialCorrectness = agent.initialConfidence;

      // 5. 最终质量得分：结合当前置信度和创新性
      const finalQuality = agent.currentConfidence * 0.6 + agent.innovationScore * 0.4;

      // 计算总分
      const totalScore =
        consistencyScore * 0.25 +
        evolutionQuality * 0.25 +
        independenceScore * 0.2 +
        initialCorrectness * 0.15 +
        finalQuality * 0.15;

      return {
        agentId: agent.agentId,
        totalScore,
        consistencyScore,
        evolutionQuality,
        independenceScore,
        initialCorrectness,
        finalQuality,
      };
    });

    return scores;
  }

  /**
   * 执行最终选择阶段
   */
  private async executeFinalSelection(
    debateRound: DebateRound,
    scores: TrajectoryScore[],
    config: Required<FreeMADConfig>
  ): Promise<FreeMADResult> {
    // 选择得分最高的智能体
    const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);
    const winnerScore = sortedScores[0];
    const winnerAgent = debateRound.responses.find((r) => r.agentId === winnerScore.agentId);

    if (!winnerAgent) {
      throw new Error(`Winner agent ${winnerScore.agentId} not found`);
    }

    // 计算一致性分析
    const initialConsistencies = debateRound.responses.map((r) => r.initialConfidence);
    const finalConsistencies = debateRound.responses.map((r) => r.currentConfidence);

    const initialConsistency = initialConsistencies.reduce((a, b) => a + b, 0) / initialConsistencies.length;
    const finalConsistency = finalConsistencies.reduce((a, b) => a + b, 0) / finalConsistencies.length;

    return {
      resultId: `freemad_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskDescription: "",
      finalAnswer: winnerAgent.currentAnswer,
      winnerAgentId: winnerScore.agentId,
      allResponses: debateRound.responses,
      debateRounds: [],
      trajectoryScores: scores,
      consistencyAnalysis: {
        initialConsistency,
        finalConsistency,
        consistencyChange: finalConsistency - initialConsistency,
      },
      totalIterations: debateRound.roundNumber + 1,
      processingTime: 0,
    };
  }

  /**
   * 生成初始回答
   */
  private generateInitialAnswer(taskDescription: string, model: string): string {
    const templates = [
      `${model}: Based on analysis, the answer is derived from careful consideration of "${taskDescription.substring(0, 20)}..."`,
      `${model}: After evaluating the task "${taskDescription.substring(0, 20)}...", I propose the following solution`,
      `${model}: The optimal approach to "${taskDescription.substring(0, 20)}..." involves systematic reasoning`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 生成推理内容
   */
  private generateReasoning(answer: string, model: string, phase: string): string {
    const phaseTemplates: Record<string, string[]> = {
      independent: [
        `${model} independently analyzes: Building upon "${answer.substring(0, 30)}...", my reasoning suggests`,
        `${model} provides independent analysis: The key insight from "${answer.substring(0, 30)}..." is`,
      ],
      anti_conformity: [
        `${model} critically evaluates: While others may suggest "${answer.substring(0, 30)}...", I propose an alternative`,
        `${model} challenges consensus: Contrary to the view in "${answer.substring(0, 30)}...", the evidence indicates`,
      ],
    };

    const templates = phaseTemplates[phase] || phaseTemplates.independent;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 计算创新性得分
   */
  private calculateInnovationScore(agent: FreeMADAgentResponse, newPoint: ReasoningTrajectoryPoint): number {
    // 基于推理长度和置信度变化计算创新性
    const reasoningLength = newPoint.reasoning.length;
    const confidenceChange = Math.abs(newPoint.confidence - agent.initialConfidence);

    return Math.min(1, (reasoningLength / 100) * 0.5 + confidenceChange * 0.5);
  }

  /**
   * 计算一致性得分
   */
  private calculateConsistencyScore(agent: FreeMADAgentResponse): number {
    // 计算轨迹中状态的一致性
    const influencedCount = agent.trajectory.filter((p) => p.state === FreeMADAgentState.INFLUENCED).length;
    const antiConformingCount = agent.trajectory.filter((p) => p.state === FreeMADAgentState.ANTI_CONFORMING).length;

    // 保持独立性的智能体获得更高一致性得分
    const independenceRatio = antiConformingCount / Math.max(1, influencedCount + antiConformingCount);
    return 0.5 + independenceRatio * 0.5;
  }

  /**
   * 计算演化质量得分
   */
  private calculateEvolutionQuality(agent: FreeMADAgentResponse): number {
    if (agent.trajectory.length < 2) return 0.5;

    // 分析置信度的趋势
    const confidences = agent.trajectory.map((p) => p.confidence);
    const positiveTrend = confidences[confidences.length - 1] > confidences[0] ? 1 : 0;
    const trendStrength = Math.abs(confidences[confidences.length - 1] - confidences[0]);

    return 0.5 + positiveTrend * 0.3 + Math.min(0.2, trendStrength * 0.5);
  }

  /**
   * 分析多数派和少数派观点
   */
  private analyzeViews(responses: FreeMADAgentResponse[]): {
    majorityView: string;
    minorityViews: string[];
  } {
    // 统计回答的分布
    const viewCounts = new Map<string, number>();
    for (const response of responses) {
      const view = response.currentAnswer;
      viewCounts.set(view, (viewCounts.get(view) || 0) + 1);
    }

    // 找出多数派观点
    let maxCount = 0;
    let majorityView = "";
    for (const [view, count] of viewCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        majorityView = view;
      }
    }

    // 找出少数派观点
    const minorityViews: string[] = [];
    for (const [view, count] of viewCounts.entries()) {
      if (view !== majorityView) {
        minorityViews.push(view);
      }
    }

    return { majorityView, minorityViews };
  }

  /**
   * 获取辩论历史
   */
  getDebateHistory(): FreeMADResult[] {
    return Array.from(this.debateHistory.values());
  }

  /**
   * 获取辩论结果
   */
  getDebateResult(resultId: string): FreeMADResult | undefined {
    return this.debateHistory.get(resultId);
  }
}

/**
 * 工厂函数：创建 Free-MAD 编排器
 */
export function createFreeMADOrchestrator(config?: FreeMADConfig): FreeMADOrchestrator {
  return new FreeMADOrchestrator(config);
}

/**
 * 任务模板
 */
export const FreeMADTemplates = {
  /** 逻辑推理任务 */
  logicalReasoning: {
    description: "需要逻辑推理的复杂任务",
    recommendedConfig: {
      numAgents: 5,
      antiConformityThreshold: 0.6,
      minConfidenceThreshold: 0.6,
    },
  },

  /** 创意生成任务 */
  creativeGeneration: {
    description: "需要多样化创意的任务",
    recommendedConfig: {
      numAgents: 7,
      antiConformityThreshold: 0.4, // 更低的阈值鼓励更多创新
      minConfidenceThreshold: 0.4,
    },
  },

  /** 事实验证任务 */
  factVerification: {
    description: "需要验证事实准确性的任务",
    recommendedConfig: {
      numAgents: 5,
      antiConformityThreshold: 0.7, // 更高的阈值确保可靠性
      minConfidenceThreshold: 0.8,
    },
  },

  /** 决策支持任务 */
  decisionSupport: {
    description: "需要多角度决策支持的任务",
    recommendedConfig: {
      numAgents: 6,
      antiConformityThreshold: 0.5,
      minConfidenceThreshold: 0.5,
    },
  },
};
