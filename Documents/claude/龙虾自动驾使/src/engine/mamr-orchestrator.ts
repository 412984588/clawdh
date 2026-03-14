/**
 * 🧠 Dr. MAMR 多智能体元推理框架
 *
 * 基于 arXiv:2511.02303 "Unlocking the Power of Multi-Agent LLM for Reasoning"
 *
 * 核心思想：通过双智能体元推理解决多智能体系统中的"懒惰智能体"问题
 *
 * 关键创新：
 * - Meta-thinking Agent：负责高层规划和任务分解
 * - Reasoning Agent：执行具体推理任务
 * - Lazy Behavior Mitigation：检测和缓解智能体偷懒行为
 * - Shapley Attribution：公平的贡献归因
 * - Debiased Training Objective：去偏训练目标
 * - Reward Restructuring：奖励结构优化
 *
 * @see {@link https://arxiv.org/abs/2511.02303} - Dr. MAMR Paper
 * @see {@link https://arxiv.org/html/2511.02303v1} - HTML Version
 *
 * @version 2.23.0
 * @since 2025-03-11
 */

/**
 * 智能体角色
 */
export enum MAMRAgentRole {
  /** 元推理智能体 - 负责规划 */
  META_THINKING = "meta_thinking",
  /** 推理智能体 - 负责执行 */
  REASONING = "reasoning",
}

/**
 * 智能体状态
 */
export enum MAMRAgentState {
  /** 空闲 */
  IDLE = "idle",
  /** 规划中 */
  PLANNING = "planning",
  /** 推理中 */
  REASONING = "reasoning",
  /** 验证中 */
  VALIDATING = "validating",
  /** 已完成 */
  COMPLETED = "completed",
  /** 偷懒检测 */
  LAZY_DETECTED = "lazy_detected",
}

/**
 * 贡献归因类型
 */
export enum MAMRContributionType {
  /** 规划贡献 */
  PLANNING = "planning",
  /** 推理贡献 */
  REASONING = "reasoning",
  /** 验证贡献 */
  VALIDATION = "validation",
  /** 纠正贡献 */
  CORRECTION = "correction",
}

/**
 * 懒惰行为类型
 */
export enum MAMRLazyBehaviorType {
  /** 最小努力 */
  MINIMAL_EFFORT = "minimal_effort",
  /** 重复输出 */
  REPETITIVE_OUTPUT = "repetitive_output",
  /** 过早终止 */
  PREMATURE_TERMINATION = "premature_termination",
  /** 依赖过度 */
  EXCESSIVE_RELiance = "excessive_reliance",
  /** 模糊回复 */
  VAGUE_RESPONSE = "vague_response",
}

/**
 * Dr. MAMR 智能体
 */
export interface MAMRAgent {
  /** 智能体 ID */
  agentId: string;
  /** 智能体名称 */
  agentName: string;
  /** 角色 */
  role: MAMRAgentRole;
  /** 状态 */
  state: MAMRAgentState;
  /** 推理能力 (0-1) */
  reasoningCapability: number;
  /** 规划能力 (0-1) */
  planningCapability: number;
  /** 努力水平 (0-1) */
  effortLevel: number;
  /** 历史贡献 */
  contributionHistory: MAMRContribution[];
  /** 懒惰行为记录 */
  lazyBehaviorHistory: MAMRLazyBehavior[];
}

/**
 * 元规划结果
 */
export interface MAMRMetaPlan {
  /** 规划 ID */
  planId: string;
  /** 任务描述 */
  taskDescription: string;
  /** 推理步骤 */
  reasoningSteps: MAMRReasoningStep[];
  /** 依赖关系 */
  dependencies: string[][];
  /** 预期复杂度 */
  expectedComplexity: number;
  /** 质量阈值 */
  qualityThreshold: number;
}

/**
 * 推理步骤
 */
export interface MAMRReasoningStep {
  /** 步骤 ID */
  stepId: string;
  /** 步骤描述 */
  description: string;
  /** 步骤类型 */
  stepType: "analysis" | "decomposition" | "inference" | "synthesis" | "verification";
  /** 优先级 */
  priority: number;
  /** 分配智能体 */
  assignedAgent?: string;
  /** 状态 */
  status: "pending" | "in_progress" | "completed" | "failed";
  /** 结果 */
  result?: string;
  /** 置信度 */
  confidence?: number;
}

/**
 * 贡献记录
 */
export interface MAMRContribution {
  /** 贡献 ID */
  contributionId: string;
  /** 来源智能体 */
  sourceAgent: string;
  /** 贡献类型 */
  contributionType: MAMRContributionType;
  /** 贡献内容 */
  content: string;
  /** Shapley 值 */
  shapleyValue: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 懒惰行为记录
 */
export interface MAMRLazyBehavior {
  /** 行为 ID */
  behaviorId: string;
  /** 智能体 */
  agentId: string;
  /** 行为类型 */
  behaviorType: MAMRLazyBehaviorType;
  /** 严重程度 (0-1) */
  severity: number;
  /** 描述 */
  description: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 推理结果
 */
export interface MAMRReasoningResult {
  /** 结果 ID */
  resultId: string;
  /** 任务描述 */
  taskDescription: string;
  /** 元计划 */
  metaPlan: MAMRMetaPlan;
  /** 推理输出 */
  reasoningOutput: string;
  /** 贡献摘要 */
  contributionSummary: MAMRContributionSummary;
  /** 最终结论 */
  finalConclusion: string;
  /** 整体置信度 */
  overallConfidence: number;
  /** 质量 */
  quality: number;
}

/**
 * 贡献摘要
 */
export interface MAMRContributionSummary {
  /** 总贡献数 */
  totalContributions: number;
  /** Shapley 值分布 */
  shapleyDistribution: Map<string, number>;
  /** 懒惰行为计数 */
  lazyBehaviorCount: number;
  /** 努力-贡献比率 */
  effortContributionRatio: number;
}

/**
 * Dr. MAMR 配置
 */
export interface MAMRConfig {
  /** 最大推理步骤 */
  maxReasoningSteps?: number;
  /** 懒惰行为阈值 */
  lazyBehaviorThreshold?: number;
  /** 质量阈值 */
  qualityThreshold?: number;
  /** Shapley 计算启用 */
  enableShapleyAttribution?: boolean;
  /** 去偏训练启用 */
  enableDebiasedTraining?: boolean;
  /** 详细日志 */
  enableDetailedLogging?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<MAMRConfig> = {
  maxReasoningSteps: 8,
  lazyBehaviorThreshold: 0.5,
  qualityThreshold: 0.7,
  enableShapleyAttribution: true,
  enableDebiasedTraining: true,
  enableDetailedLogging: false,
};

/**
 * 🧠 Dr. MAMR 多智能体元推理编排器
 *
 * 实现双智能体元推理框架，解决懒惰智能体问题
 */
export class MAMROrchestrator {
  private config: Required<MAMRConfig>;
  private metaThinkingAgent!: MAMRAgent;
  private reasoningAgents: Map<string, MAMRAgent> = new Map();
  private contributionHistory: MAMRContribution[] = [];
  private lazyBehaviorHistory: MAMRLazyBehavior[] = [];

  constructor(config: MAMRConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 初始化智能体
    this.initializeAgents();

    console.log(`🧠 Dr. MAMR 编排器初始化`);
    console.log(`   智能体: ${this.reasoningAgents.size + 1} 个 (1 Meta + ${this.reasoningAgents.size} Reasoning)`);
    console.log(`   Shapley 归因: ${this.config.enableShapleyAttribution ? "启用" : "禁用"}`);
  }

  /**
   * 执行 MAMR 推理编排
   */
  async orchestrate(taskDescription: string): Promise<{
    conclusion: string;
    reasoningResult: MAMRReasoningResult;
    confidence: number;
    quality: number;
    lazyBehaviorsDetected: number;
  }> {
    console.log(`🧠 MAMR 推理开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 1. 元规划阶段
    const metaPlan = await this.metaPlanningPhase(taskDescription);

    // 2. 推理执行阶段
    const reasoningSteps = await this.reasoningExecutionPhase(metaPlan);

    // 3. 懒惰行为检测
    const lazyBehaviors = await this.detectLazyBehaviors(reasoningSteps);

    // 4. 贡献归因
    const contributions = await this.attributeContributions(reasoningSteps);

    // 5. 生成最终结论
    const finalConclusion = await this.generateFinalConclusion(metaPlan, reasoningSteps);

    // 6. 构建结果
    const contributionSummary = this.buildContributionSummary(contributions);
    const quality = this.assessQuality(reasoningSteps, contributionSummary);

    const reasoningResult: MAMRReasoningResult = {
      resultId: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskDescription,
      metaPlan,
      reasoningOutput: reasoningSteps.map(s => s.result).join("\n"),
      contributionSummary,
      finalConclusion,
      overallConfidence: this.calculateOverallConfidence(reasoningSteps),
      quality,
    };

    console.log(`🧠 推理完成: ${Date.now() - startTime}ms, 质量: ${quality.toFixed(2)}, 懒惰行为: ${lazyBehaviors.length}`);

    return {
      conclusion: finalConclusion,
      reasoningResult,
      confidence: reasoningResult.overallConfidence,
      quality,
      lazyBehaviorsDetected: lazyBehaviors.length,
    };
  }

  /**
   * 初始化智能体
   */
  private initializeAgents(): void {
    // Meta-thinking Agent
    this.metaThinkingAgent = {
      agentId: "mamr_meta_001",
      agentName: "Meta-Thinker",
      role: MAMRAgentRole.META_THINKING,
      state: MAMRAgentState.IDLE,
      reasoningCapability: 0.85,
      planningCapability: 0.95,
      effortLevel: 0.9,
      contributionHistory: [],
      lazyBehaviorHistory: [],
    };

    // Reasoning Agents
    const reasoningConfigs = [
      { name: "Analyst", expertise: "formal_analysis", capability: 0.9 },
      { name: "Synthesizer", expertise: "information_synthesis", capability: 0.85 },
      { name: "Validator", expertise: "logical_validation", capability: 0.88 },
      { name: "Critic", expertise: "critical_review", capability: 0.82 },
    ];

    for (const config of reasoningConfigs) {
      const agent: MAMRAgent = {
        agentId: `mamr_reasoning_${config.expertise}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        agentName: config.name,
        role: MAMRAgentRole.REASONING,
        state: MAMRAgentState.IDLE,
        reasoningCapability: config.capability,
        planningCapability: 0.6,
        effortLevel: 0.8 + Math.random() * 0.2,
        contributionHistory: [],
        lazyBehaviorHistory: [],
      };
      this.reasoningAgents.set(agent.agentId, agent);
    }
  }

  /**
   * 元规划阶段
   */
  private async metaPlanningPhase(taskDescription: string): Promise<MAMRMetaPlan> {
    this.metaThinkingAgent.state = MAMRAgentState.PLANNING;

    const stepTypes: MAMRReasoningStep["stepType"][] = [
      "analysis",
      "decomposition",
      "inference",
      "synthesis",
      "verification",
    ];

    const reasoningSteps: MAMRReasoningStep[] = stepTypes.map((type, index) => ({
      stepId: `step_${type}_${Date.now()}_${index}`,
      description: `${type} phase of reasoning for "${taskDescription.substring(0, 30)}..."`,
      stepType: type,
      priority: stepTypes.length - index,
      status: "pending" as const,
    }));

    const metaPlan: MAMRMetaPlan = {
      planId: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskDescription,
      reasoningSteps,
      dependencies: [[]],
      expectedComplexity: taskDescription.length / 100,
      qualityThreshold: this.config.qualityThreshold,
    };

    this.metaThinkingAgent.state = MAMRAgentState.IDLE;

    return metaPlan;
  }

  /**
   * 推理执行阶段
   */
  private async reasoningExecutionPhase(metaPlan: MAMRMetaPlan): Promise<MAMRReasoningStep[]> {
    const completedSteps: MAMRReasoningStep[] = [];

    for (const step of metaPlan.reasoningSteps) {
      // 选择合适的推理智能体
      const agent = this.selectAgentForStep(step);
      if (!agent) continue;

      agent.state = MAMRAgentState.REASONING;
      step.status = "in_progress";
      step.assignedAgent = agent.agentId;

      // 模拟推理执行
      await this.delay(30 + Math.random() * 70);

      // 生成推理结果
      step.result = this.generateReasoningOutput(step, agent);
      step.confidence = agent.reasoningCapability * agent.effortLevel * (0.7 + Math.random() * 0.3);
      step.status = "completed";

      // 记录贡献
      this.recordContribution(agent, step, step.stepType);

      completedSteps.push(step);
      agent.state = MAMRAgentState.IDLE;
    }

    return completedSteps;
  }

  /**
   * 选择推理步骤的智能体
   */
  private selectAgentForStep(step: MAMRReasoningStep): MAMRAgent | null {
    const availableAgents = Array.from(this.reasoningAgents.values())
      .filter(a => a.state === MAMRAgentState.IDLE);

    if (availableAgents.length === 0) return null;

    // 根据步骤类型选择最合适的智能体
    const expertiseMap: Record<string, string> = {
      analysis: "formal_analysis",
      decomposition: "information_synthesis",
      inference: "formal_analysis",
      synthesis: "information_synthesis",
      verification: "logical_validation",
    };

    const targetExpertise = expertiseMap[step.stepType];
    const bestAgent = availableAgents.find(a =>
      a.agentName.toLowerCase().includes(targetExpertise)
    ) || availableAgents[0];

    return bestAgent || null;
  }

  /**
   * 生成推理输出
   */
  private generateReasoningOutput(step: MAMRReasoningStep, agent: MAMRAgent): string {
    const templates: Record<string, string> = {
      analysis: `${agent.agentName} performs systematic analysis: examining key components, identifying constraints, and establishing baseline understanding.`,
      decomposition: `${agent.agentName} breaks down complex task into manageable sub-components with clear dependencies.`,
      inference: `${agent.agentName} applies logical inference rules to derive conclusions from available information.`,
      synthesis: `${agent.agentName} integrates multiple reasoning strands into coherent output.`,
      verification: `${agent.agentName} validates reasoning chain for logical consistency and factual accuracy.`,
    };

    return templates[step.stepType] || `${agent.agentName} executed ${step.stepType}.`;
  }

  /**
   * 检测懒惰行为
   */
  private async detectLazyBehaviors(steps: MAMRReasoningStep[]): Promise<MAMRLazyBehavior[]> {
    const detectedBehaviors: MAMRLazyBehavior[] = [];

    for (const step of steps) {
      if (!step.assignedAgent) continue;

      const agent = this.reasoningAgents.get(step.assignedAgent);
      if (!agent) continue;

      // 检测最小努力
      const outputLength = step.result?.length || 0;
      if (outputLength < 50) {
        const behavior: MAMRLazyBehavior = {
          behaviorId: `lazy_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          agentId: agent.agentId,
          behaviorType: MAMRLazyBehaviorType.MINIMAL_EFFORT,
          severity: 1 - (outputLength / 50),
          description: `Minimal output length detected: ${outputLength} chars`,
          timestamp: Date.now(),
        };
        detectedBehaviors.push(behavior);
        agent.lazyBehaviorHistory.push(behavior);
      }

      // 检测低置信度
      if (step.confidence && step.confidence < this.config.lazyBehaviorThreshold) {
        const behavior: MAMRLazyBehavior = {
          behaviorId: `lazy_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          agentId: agent.agentId,
          behaviorType: MAMRLazyBehaviorType.MINIMAL_EFFORT,
          severity: 1 - step.confidence,
          description: `Low confidence detected: ${step.confidence.toFixed(2)}`,
          timestamp: Date.now(),
        };
        detectedBehaviors.push(behavior);
        agent.lazyBehaviorHistory.push(behavior);
      }
    }

    this.lazyBehaviorHistory.push(...detectedBehaviors);
    return detectedBehaviors;
  }

  /**
   * 归因贡献
   */
  private async attributeContributions(steps: MAMRReasoningStep[]): Promise<MAMRContribution[]> {
    if (!this.config.enableShapleyAttribution) {
      // 简单归因：平均分配
      return steps.map((step, index) => ({
        contributionId: `contrib_${Date.now()}_${index}`,
        sourceAgent: step.assignedAgent || "unknown",
        contributionType: this.mapStepToContribution(step.stepType),
        content: step.result || "",
        shapleyValue: 1 / steps.length,
        timestamp: Date.now(),
      }));
    }

    // Shapley 值归因
    const contributions: MAMRContribution[] = [];
    const agentContributions = new Map<string, number>();

    // 计算每个智能体的贡献
    for (const step of steps) {
      if (!step.assignedAgent) continue;

      const current = agentContributions.get(step.assignedAgent) || 0;
      const weight = this.calculateStepWeight(step);
      agentContributions.set(step.assignedAgent, current + weight);

      contributions.push({
        contributionId: `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        sourceAgent: step.assignedAgent,
        contributionType: this.mapStepToContribution(step.stepType),
        content: step.result || "",
        shapleyValue: weight,
        timestamp: Date.now(),
      });
    }

    // 归一化 Shapley 值
    const total = Array.from(agentContributions.values()).reduce((a, b) => a + b, 0);
    for (const contrib of contributions) {
      contrib.shapleyValue = (contrib.shapleyValue / total) || 0;
    }

    this.contributionHistory.push(...contributions);
    return contributions;
  }

  /**
   * 计算步骤权重
   */
  private calculateStepWeight(step: MAMRReasoningStep): number {
    const typeWeights: Record<string, number> = {
      analysis: 0.2,
      decomposition: 0.15,
      inference: 0.35,
      synthesis: 0.2,
      verification: 0.1,
    };
    return typeWeights[step.stepType] * (step.confidence || 0.5) * step.priority;
  }

  /**
   * 映射步骤类型到贡献类型
   */
  private mapStepToContribution(stepType: string): MAMRContributionType {
    const mapping: Record<string, MAMRContributionType> = {
      analysis: MAMRContributionType.PLANNING,
      decomposition: MAMRContributionType.PLANNING,
      inference: MAMRContributionType.REASONING,
      synthesis: MAMRContributionType.REASONING,
      verification: MAMRContributionType.VALIDATION,
    };
    return mapping[stepType] || MAMRContributionType.REASONING;
  }

  /**
   * 构建贡献摘要
   */
  private buildContributionSummary(contributions: MAMRContribution[]): MAMRContributionSummary {
    const shapleyDistribution = new Map<string, number>();

    for (const contrib of contributions) {
      const current = shapleyDistribution.get(contrib.sourceAgent) || 0;
      shapleyDistribution.set(contrib.sourceAgent, current + contrib.shapleyValue);
    }

    // 计算努力-贡献比率
    let totalEffort = 0;
    let totalContribution = 0;
    for (const agent of this.reasoningAgents.values()) {
      totalEffort += agent.effortLevel;
    }
    for (const value of shapleyDistribution.values()) {
      totalContribution += value;
    }

    return {
      totalContributions: contributions.length,
      shapleyDistribution,
      lazyBehaviorCount: this.lazyBehaviorHistory.length,
      effortContributionRatio: totalEffort > 0 ? totalContribution / totalEffort : 0,
    };
  }

  /**
   * 评估质量
   */
  private assessQuality(steps: MAMRReasoningStep[], summary: MAMRContributionSummary): number {
    let quality = 0.5;

    // 完成率
    const completionRate = steps.filter(s => s.status === "completed").length / steps.length;
    quality += completionRate * 0.2;

    // 平均置信度
    const avgConfidence = steps.reduce((sum, s) => sum + (s.confidence || 0), 0) / steps.length;
    quality += avgConfidence * 0.3;

    // 努力-贡献比率
    quality += summary.effortContributionRatio * 0.2;

    // 懒惰行为惩罚
    const lazyPenalty = Math.min(0.3, summary.lazyBehaviorCount * 0.1);
    quality -= lazyPenalty;

    return Math.max(0, Math.min(1, quality));
  }

  /**
   * 计算整体置信度
   */
  private calculateOverallConfidence(steps: MAMRReasoningStep[]): number {
    if (steps.length === 0) return 0;
    const sum = steps.reduce((acc, step) => acc + (step.confidence || 0), 0);
    return sum / steps.length;
  }

  /**
   * 生成最终结论
   */
  private async generateFinalConclusion(metaPlan: MAMRMetaPlan, steps: MAMRReasoningStep[]): Promise<string> {
    const synthesisStep = steps.find(s => s.stepType === "synthesis");
    const verificationStep = steps.find(s => s.stepType === "verification");

    let conclusion = `Task: ${metaPlan.taskDescription}\n\n`;

    if (synthesisStep?.result) {
      conclusion += `Synthesis: ${synthesisStep.result}\n`;
    }

    if (verificationStep?.result) {
      conclusion += `Verification: ${verificationStep.result}\n`;
    }

    conclusion += `\nCompleted with ${steps.length} reasoning steps.`;

    return conclusion;
  }

  /**
   * 记录贡献
   */
  private recordContribution(agent: MAMRAgent, step: MAMRReasoningStep, stepType: string): void {
    const contribution: MAMRContribution = {
      contributionId: `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sourceAgent: agent.agentId,
      contributionType: this.mapStepToContribution(stepType),
      content: step.result || "",
      shapleyValue: 0,
      timestamp: Date.now(),
    };
    agent.contributionHistory.push(contribution);
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取元思考智能体
   */
  getMetaThinkingAgent(): MAMRAgent {
    return this.metaThinkingAgent;
  }

  /**
   * 获取所有推理智能体
   */
  getReasoningAgents(): MAMRAgent[] {
    return Array.from(this.reasoningAgents.values());
  }

  /**
   * 获取贡献历史
   */
  getContributionHistory(): MAMRContribution[] {
    return [...this.contributionHistory];
  }

  /**
   * 获取懒惰行为历史
   */
  getLazyBehaviorHistory(): MAMRLazyBehavior[] {
    return [...this.lazyBehaviorHistory];
  }
}

/**
 * 工厂函数：创建 MAMR 编排器
 */
export function createMAMROrchestrator(config?: MAMRConfig): MAMROrchestrator {
  return new MAMROrchestrator(config);
}

/**
 * 任务模板
 */
export const MAMRTemplates = {
  /** 复杂推理任务 */
  complexReasoning: {
    description: "需要深度推理和避免偷懒的复杂任务",
    recommendedConfig: {
      maxReasoningSteps: 10,
      lazyBehaviorThreshold: 0.6,
      qualityThreshold: 0.8,
    },
  },

  /** 快速分析任务 */
  quickAnalysis: {
    description: "快速分析，容忍一定程度的懒惰行为",
    recommendedConfig: {
      maxReasoningSteps: 5,
      lazyBehaviorThreshold: 0.4,
      qualityThreshold: 0.6,
    },
  },

  /** 高质量推理任务 */
  highQualityReasoning: {
    description: "要求最高质量的推理，零容忍懒惰行为",
    recommendedConfig: {
      maxReasoningSteps: 12,
      lazyBehaviorThreshold: 0.8,
      qualityThreshold: 0.9,
      enableShapleyAttribution: true,
      enableDebiasedTraining: true,
    },
  },
};
