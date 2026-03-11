/**
 * 🎲 贝叶斯编排器
 *
 * 基于 arXiv:2601.01522 "Bayesian Orchestration of Multi-LLM Agents for Cost-Aware Sequential Decision-Making"
 *
 * 核心思想：将 LLM 视为近似似然模型，使用贝叶斯方法进行多代理编排
 *
 * 关键创新：
 * - 生成建模视角：将 LLM 输出视为概率分布而非确定性分类
 * - 序贯信念更新：随着证据累积正确更新后验信念
 * - 成本感知决策：在多 LLM 工作流中优化成本-性能权衡
 * - 近似似然模型：处理 LLM 作为概率模型的不确定性
 * - 智能路由：根据成本和性能动态选择 LLM
 *
 * @see {@link https://arxiv.org/abs/2601.01522} - Bayesian Orchestration Paper
 * @see {@link https://arxiv.org/html/2601.01522v1} - HTML Version
 *
 * @version 2.18.0
 * @since 2025-03-11
 */

/**
 * LLM 模型规格
 */
export interface LLMModelSpec {
  /** 模型 ID */
  modelId: string;
  /** 模型名称 */
  modelName: string;
  /** 每百万 token 成本 */
  costPerMillionTokens: number;
  /** 平均延迟（ms） */
  avgLatency: number;
  /** 质量分数（0-1） */
  qualityScore: number;
  /** 可靠性分数（0-1） */
  reliabilityScore: number;
  /** 上下文窗口 */
  contextWindow: number;
}

/**
 * 贝叶斯信念状态
 */
export interface BayesianBelief {
  /** 假设 ID */
  hypothesisId: string;
  /** 后验概率 */
  posterior: number;
  /** 似然值 */
  likelihood: number;
  /** 先验概率 */
  prior: number;
  /** 置信度区间 */
  confidenceInterval: [number, number];
  /** 证据累积计数 */
  evidenceCount: number;
  /** 最后更新时间 */
  lastUpdate: number;
}

/**
 * 成本-收益权衡
 */
export interface CostBenefitTradeoff {
  /** 预期收益 */
  expectedBenefit: number;
  /** 预期成本 */
  expectedCost: number;
  /** 风险调整收益 */
  riskAdjustedBenefit: number;
  /** 效用分数（收益/成本比） */
  utilityScore: number;
  /** 不确定性度量 */
  uncertainty: number;
}

/**
 * 代理决策
 */
export interface AgentDecision {
  /** 决策 ID */
  decisionId: string;
  /** 选择的模型 */
  selectedModel: LLMModelSpec;
  /** 决策类型 */
  decisionType: "explore" | "exploit" | "verify" | "terminate";
  /** 目标假设 */
  targetHypothesis: string;
  /** 成本-收益分析 */
  costBenefit: CostBenefitTradeoff;
  /** 贝叶斯信念 */
  belief: BayesianBelief;
  /** 决策理由 */
  reasoning: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 编排结果
 */
export interface BayesianOrchestrationResult {
  /** 最终推荐 */
  finalRecommendation: string;
  /** 选定的模型序列 */
  selectedModels: LLMModelSpec[];
  /** 总成本（tokens） */
  totalCost: number;
  /** 总耗时（ms） */
  totalDuration: number;
  /** 最终质量分数 */
  finalQualityScore: number;
  /** 收敛标志 */
  converged: boolean;
  /** 迭代次数 */
  iterations: number;
  /** 信念历史 */
  beliefHistory: BayesianBelief[];
}

/**
 * 贝叶斯编排配置
 */
export interface BayesianConfig {
  /** 可用模型列表 */
  availableModels?: LLMModelSpec[];
  /** 最大迭代次数 */
  maxIterations?: number;
  /** 成本预算限制（tokens） */
  costBudget?: number;
  /** 目标质量阈值 */
  qualityThreshold?: number;
  /** 探索-利用权衡（0-1） */
  exploreExploitTradeoff?: number;
  /** 信念更新阈值 */
  beliefUpdateThreshold?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<BayesianConfig> = {
  availableModels: [
    {
      modelId: "gpt-4",
      modelName: "GPT-4",
      costPerMillionTokens: 30,
      avgLatency: 5000,
      qualityScore: 0.95,
      reliabilityScore: 0.98,
      contextWindow: 128000,
    },
    {
      modelId: "claude-opus",
      modelName: "Claude Opus",
      costPerMillionTokens: 15,
      avgLatency: 4000,
      qualityScore: 0.93,
      reliabilityScore: 0.97,
      contextWindow: 200000,
    },
    {
      modelId: "gpt-3.5-turbo",
      modelName: "GPT-3.5 Turbo",
      costPerMillionTokens: 2,
      avgLatency: 1000,
      qualityScore: 0.75,
      reliabilityScore: 0.90,
      contextWindow: 16000,
    },
  ],
  maxIterations: 20,
  costBudget: 500000,
  qualityThreshold: 0.85,
  exploreExploitTradeoff: 0.3,
  beliefUpdateThreshold: 0.05,
  enableDetailedLogging: false,
};

/**
 * 🎲 贝叶斯编排器
 *
 * 实现基于贝叶斯推理的多 LLM 成本感知编排
 */
export class BayesianOrchestrator {
  private config: Required<BayesianConfig>;
  private beliefs: Map<string, BayesianBelief> = new Map();
  private decisionHistory: AgentDecision[] = [];
  private currentIteration = 0;
  private totalCost = 0;
  private totalDuration = 0;

  constructor(config: BayesianConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 初始化信念
    this.initializeBeliefs();

    console.log(`🎲 贝叶斯编排器初始化`);
    console.log(`   可用模型: ${this.config.availableModels.length} 个`);
    console.log(`   最大迭代: ${this.config.maxIterations}`);
    console.log(`   成本预算: ${this.config.costBudget} tokens`);
  }

  /**
   * 执行贝叶斯编排
   */
  async orchestrate(taskDescription: string): Promise<BayesianOrchestrationResult> {
    console.log(`🎲 贝叶斯编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    let converged = false;
    const beliefHistory: BayesianBelief[] = [];
    const selectedModels: LLMModelSpec[] = [];

    // 主编排循环
    while (this.currentIteration < this.config.maxIterations && !converged) {
      this.currentIteration++;

      // 1. 计算当前信念状态
      const currentBeliefs = this.computePosteriorBeliefs();

      // 2. 选择最佳动作（探索/利用）
      const decision = this.selectAction(currentBeliefs);

      // 3. 执行决策
      const result = await this.executeDecision(decision);

      // 4. 更新信念
      this.updateBeliefs(decision, result);

      // 5. 记录历史
      this.decisionHistory.push(decision);
      beliefHistory.push(...currentBeliefs);

      // 6. 检查收敛
      converged = this.checkConvergence();

      // 7. 检查预算
      if (this.totalCost >= this.config.costBudget) {
        console.log(`   💰 成本预算耗尽`);
        break;
      }

      console.log(`   迭代 ${this.currentIteration}: ${decision.decisionType} (${decision.selectedModel.modelName})`);
    }

    // 生成最终推荐
    const finalRecommendation = this.synthesizeFinalRecommendation();

    const executionTime = Date.now() - startTime;

    console.log(`\n🎲 编排完成:`);
    console.log(`   迭代: ${this.currentIteration}/${this.config.maxIterations}`);
    console.log(`   收敛: ${converged ? "是" : "否"}`);
    console.log(`   成本: ${this.totalCost} tokens`);
    console.log(`   耗时: ${executionTime}ms`);

    return {
      finalRecommendation,
      selectedModels,
      totalCost: this.totalCost,
      totalDuration: executionTime,
      finalQualityScore: this.getFinalQualityScore(),
      converged,
      iterations: this.currentIteration,
      beliefHistory,
    };
  }

  /**
   * 初始化信念
   */
  private initializeBeliefs(): void {
    for (const model of this.config.availableModels) {
      this.beliefs.set(model.modelId, {
        hypothesisId: `model_${model.modelId}_optimal`,
        posterior: 1 / this.config.availableModels.length, // 均匀先验
        likelihood: 0,
        prior: 1 / this.config.availableModels.length,
        confidenceInterval: [0, 1],
        evidenceCount: 0,
        lastUpdate: Date.now(),
      });
    }
  }

  /**
   * 计算后验信念
   */
  private computePosteriorBeliefs(): BayesianBelief[] {
    const beliefs: BayesianBelief[] = [];

    for (const [modelId, belief] of this.beliefs) {
      // 贝叶斯更新规则: P(H|E) ∝ P(E|H) × P(H)
      const likelihood = this.computeLikelihood(modelId);
      const posterior = this.normalizePosteriors();

      const updatedBelief: BayesianBelief = {
        ...belief,
        likelihood,
        posterior: posterior.get(modelId) || belief.posterior,
        lastUpdate: Date.now(),
      };

      beliefs.push(updatedBelief);
    }

    return beliefs;
  }

  /**
   * 计算似然值
   */
  private computeLikelihood(modelId: string): number {
    const belief = this.beliefs.get(modelId);
    const model = this.config.availableModels.find(m => m.modelId === modelId);

    if (!belief || !model) return 0.5;

    // 基于模型质量、可靠性和历史表现计算似然
    let likelihood = model.qualityScore * model.reliabilityScore;

    // 考虑证据权重（证据越多，似然越确定）
    const evidenceWeight = Math.min(belief.evidenceCount / 10, 1);
    likelihood = likelihood * (0.5 + evidenceWeight * 0.5);

    return likelihood;
  }

  /**
   * 标准化后验概率
   */
  private normalizePosteriors(): Map<string, number> {
    const normalized = new Map<string, number>();
    let sum = 0;

    // 计算非标准化后验
    for (const [modelId, belief] of this.beliefs) {
      const unnormalized = belief.likelihood * belief.prior;
      normalized.set(modelId, unnormalized);
      sum += unnormalized;
    }

    // 标准化
    for (const [modelId, value] of normalized) {
      normalized.set(modelId, sum > 0 ? value / sum : 0);
    }

    return normalized;
  }

  /**
   * 选择动作
   */
  private selectAction(beliefs: BayesianBelief[]): AgentDecision {
    // ε-greedy 策略
    if (Math.random() < this.config.exploreExploitTradeoff) {
      // 探索：随机选择模型
      const randomModel = this.config.availableModels[
        Math.floor(Math.random() * this.config.availableModels.length)
      ];

      return {
        decisionId: `decision_explore_${Date.now()}`,
        selectedModel: randomModel,
        decisionType: "explore",
        targetHypothesis: `model_${randomModel.modelId}_optimal`,
        costBenefit: this.computeCostBenefit(randomModel, true),
        belief: beliefs.find(b => b.hypothesisId === `model_${randomModel.modelId}_optimal`) || beliefs[0],
        reasoning: "Exploration: random model selection",
        timestamp: Date.now(),
      };
    }

    // 利用：选择后验概率最高的模型
    const bestBelief = beliefs.reduce((best, current) =>
      current.posterior > best.posterior ? current : best
    );

    const bestModel = this.config.availableModels.find(
      m => m.modelId === bestBelief.hypothesisId.replace("model_", "").replace("_optimal", "")
    ) || this.config.availableModels[0];

    return {
      decisionId: `decision_exploit_${Date.now()}`,
      selectedModel: bestModel,
      decisionType: "exploit",
      targetHypothesis: bestBelief.hypothesisId,
      costBenefit: this.computeCostBenefit(bestModel, false),
      belief: bestBelief,
      reasoning: `Exploitation: highest posterior (${bestBelief.posterior.toFixed(3)})`,
      timestamp: Date.now(),
    };
  }

  /**
   * 计算成本-收益分析
   */
  private computeCostBenefit(model: LLMModelSpec, isExploration: boolean): CostBenefitTradeoff {
    const expectedCost = model.costPerMillionTokens / 1000; // 每次调用的预期成本
    const expectedBenefit = model.qualityScore;

    // 探索的收益有折扣
    const adjustedBenefit = isExploration ? expectedBenefit * 0.7 : expectedBenefit;

    // 风险调整收益（考虑不确定性）
    const uncertainty = isExploration ? 0.3 : 0.1;
    const riskAdjustedBenefit = adjustedBenefit * (1 - uncertainty);

    // 效用分数
    const utilityScore = riskAdjustedBenefit / (expectedCost * 1000);

    return {
      expectedBenefit: adjustedBenefit,
      expectedCost,
      riskAdjustedBenefit,
      utilityScore,
      uncertainty,
    };
  }

  /**
   * 执行决策
   */
  private async executeDecision(decision: AgentDecision): Promise<{
    success: boolean;
    quality: number;
    cost: number;
    duration: number;
    tokensUsed: number;
  }> {
    // 模拟执行延迟
    const delay = decision.selectedModel.avgLatency * (0.8 + Math.random() * 0.4);
    await new Promise(resolve => setTimeout(resolve, delay));

    // 模拟结果
    const tokensUsed = Math.floor(1000 + Math.random() * 3000);
    const cost = (tokensUsed / 1000000) * decision.selectedModel.costPerMillionTokens;

    return {
      success: Math.random() > 0.2,
      quality: decision.selectedModel.qualityScore * (0.8 + Math.random() * 0.4),
      cost,
      duration: delay,
      tokensUsed,
    };
  }

  /**
   * 更新信念
   */
  private updateBeliefs(decision: AgentDecision, result: {
    success: boolean;
    quality: number;
    cost: number;
    duration: number;
    tokensUsed: number;
  }): void {
    const belief = this.beliefs.get(decision.targetHypothesis);
    if (!belief) return;

    // 更新证据计数
    belief.evidenceCount++;

    // 更新似然（基于结果质量）
    belief.likelihood = result.quality;

    // 更新后验
    const posteriors = this.normalizePosteriors();
    belief.posterior = posteriors.get(decision.targetHypothesis) || belief.posterior;

    // 更新置信区间（证据越多，区间越窄）
    const width = 1.0 / Math.sqrt(belief.evidenceCount + 1);
    belief.confidenceInterval = [
      Math.max(0, belief.posterior - width / 2),
      Math.min(1, belief.posterior + width / 2),
    ];

    this.totalCost += result.cost;
    this.totalDuration += result.duration;
  }

  /**
   * 检查收敛
   */
  private checkConvergence(): boolean {
    // 检查是否有某个模型的后验概率超过阈值
    const maxPosterior = arrayMax(Array.from(this.beliefs.values()).map(b => b.posterior));

    if (maxPosterior >= 0.95) {
      return true; // 强收敛
    }

    // 检查质量是否达标
    if (this.getFinalQualityScore() >= this.config.qualityThreshold) {
      return true; // 质量达标
    }

    return false;
  }

  /**
   * 获取最终质量分数
   */
  private getFinalQualityScore(): number {
    let weightedSum = 0;
    let weightSum = 0;

    for (const [modelId, belief] of this.beliefs) {
      const model = this.config.availableModels.find(m => m.modelId === modelId);
      if (model) {
        weightedSum += belief.posterior * model.qualityScore;
        weightSum += belief.posterior;
      }
    }

    return weightSum > 0 ? weightedSum / weightSum : 0.5;
  }

  /**
   * 综合最终推荐
   */
  private synthesizeFinalRecommendation(): string {
    const sortedBeliefs = Array.from(this.beliefs.entries())
      .sort(([, a], [, b]) => b.posterior - a.posterior);

    let recommendation = `🎲 贝叶斯编排推荐\n`;
    recommendation += `=${"=".repeat(50)}\n\n`;

    recommendation += `模型排名（按后验概率）:\n`;
    for (let i = 0; i < sortedBeliefs.length; i++) {
      const [modelId, belief] = sortedBeliefs[i];
      const model = this.config.availableModels.find(m => m.modelId === modelId);
      if (model) {
        recommendation += `${i + 1}. ${model.modelName}: ${(belief.posterior * 100).toFixed(1)}% `;
        recommendation += `(质量: ${model.qualityScore.toFixed(2)}, 成本: ${model.costPerMillionTokens})\n`;
      }
    }

    recommendation += `\n执行摘要:\n`;
    recommendation += `- 迭代次数: ${this.currentIteration}\n`;
    recommendation += `- 总成本: ${this.totalCost.toFixed(2)} tokens\n`;
    recommendation += `- 总耗时: ${this.totalDuration}ms\n`;
    recommendation += `- 最终质量: ${this.getFinalQualityScore().toFixed(2)}\n`;

    const bestModelId = sortedBeliefs[0]?.[0];
    const bestModel = this.config.availableModels.find(m => m.modelId === bestModelId);
    if (bestModel) {
      recommendation += `\n推荐模型: ${bestModel.modelName}\n`;
      recommendation += `推荐理由: 最高后验概率 (${sortedBeliefs[0][1].posterior.toFixed(3)})\n`;
    }

    return recommendation;
  }

  /**
   * 获取信念历史
   */
  getBeliefHistory(): BayesianBelief[] {
    return Array.from(this.beliefs.values());
  }

  /**
   * 获取决策历史
   */
  getDecisionHistory(): AgentDecision[] {
    return [...this.decisionHistory];
  }

  /**
   * 获取当前统计
   */
  getStats(): {
    totalCost: number;
    totalDuration: number;
    currentIteration: number;
    finalQualityScore: number;
  } {
    return {
      totalCost: this.totalCost,
      totalDuration: this.totalDuration,
      currentIteration: this.currentIteration,
      finalQualityScore: this.getFinalQualityScore(),
    };
  }
}

/**
 * 辅助函数：数组最大值
 */
function arrayMax<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Cannot get max of empty array");
  }
  return arr.reduce((max, current) => (current > max ? current : max), arr[0]);
}

/**
 * 工厂函数：创建贝叶斯编排器
 */
export function createBayesianOrchestrator(
  config?: BayesianConfig
): BayesianOrchestrator {
  return new BayesianOrchestrator(config);
}

/**
 * 任务模板
 */
export const BayesianTemplates = {
  /** 高质量任务 */
  highQuality: {
    description: "需要最高质量的输出，成本敏感度低",
    recommendedConfig: {
      availableModels: [
        {
          modelId: "gpt-4",
          modelName: "GPT-4",
          costPerMillionTokens: 30,
          avgLatency: 5000,
          qualityScore: 0.95,
          reliabilityScore: 0.98,
          contextWindow: 128000,
        },
        {
          modelId: "claude-opus",
          modelName: "Claude Opus",
          costPerMillionTokens: 15,
          avgLatency: 4000,
          qualityScore: 0.93,
          reliabilityScore: 0.97,
          contextWindow: 200000,
        },
      ],
      qualityThreshold: 0.90,
      costBudget: 1000000,
    },
  },

  /** 成本优化任务 */
  costOptimized: {
    description: "平衡质量和成本，追求最佳性价比",
    recommendedConfig: {
      qualityThreshold: 0.75,
      costBudget: 100000,
      exploreExploitTradeoff: 0.4,
    },
  },

  /** 快速响应任务 */
  fastResponse: {
    description: "优先考虑速度和延迟",
    recommendedConfig: {
      availableModels: [
        {
          modelId: "gpt-3.5-turbo",
          modelName: "GPT-3.5 Turbo",
          costPerMillionTokens: 2,
          avgLatency: 1000,
          qualityScore: 0.75,
          reliabilityScore: 0.90,
          contextWindow: 16000,
        },
      ],
      qualityThreshold: 0.70,
      costBudget: 50000,
    },
  },
};
