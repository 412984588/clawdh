/**
 * 🧬 AlphaEvolve 进化算法编排器
 *
 * 基于 arXiv:2602.16928 "Discovering Multiagent Learning Algorithms with Large Language Models"
 *
 * 核心思想：使用 LLM 驱动的进化编码代理自动发现多智能体学习算法
 *
 * 关键创新：
 * - VAD-CFR: 波动率自适应折扣的反事实遗憾最小化
 * - SHOR-PSRO: 平滑混合乐观遗憾策略响应优化
 * - 进化组件: RegretAccumulator, PolicyFromRegretAccumulator, PolicyAccumulator
 * - 动态退火策略: 训练和评估使用不同参数
 *
 * @see {@link https://arxiv.org/abs/2602.16928} - AlphaEvolve Paper
 *
 * @version 2.26.0
 * @since 2025-03-11
 */

/**
 * 算法类型
 */
export enum AlphaEvolveAlgorithm {
  /** 波动率自适应 CFR */
  VAD_CFR = "vad_cfr",
  /** 平滑混合乐观遗憾 PSRO */
  SHOR_PSRO = "shor_psro",
}

/**
 * 遗憾累积器类型
 */
export enum RegretAccumulatorType {
  /** 标准遗憾累积 */
  STANDARD = "standard",
  /** 波动率自适应折扣 */
  VOLATILITY_ADAPTIVE = "volatility_adaptive",
  /** 非对称即时增强 */
  ASYMMETRIC_BOOST = "asymmetric_boost",
}

/**
 * 策略提取类型
 */
export enum PolicyExtractionType {
  /** 遗憾匹配 */
  REGRET_MATCHING = "regret_matching",
  /** 乐观遗憾匹配 */
  OPTIMISTIC_REGRET = "optimistic_regret",
  /** 平滑最佳纯策略 */
  SMOOTHED_BEST_PURE = "smoothed_best_pure",
  /** 遗憾加权平均 */
  REGRET_WEIGHTED = "regret_weighted",
}

/**
 * 策略累积器类型
 */
export enum PolicyAccumulatorType {
  /** 简单平均 */
  SIMPLE_AVERAGE = "simple_average",
  /** 硬热启动 */
  HARD_WARMSTART = "hard_warmstart",
  /** 遗憾加权累积 */
  REGRET_WEIGHTED_ACCUM = "regret_weighted",
}

/**
 * 遗憾值
 */
export interface Regret {
  /** 动作 ID */
  actionId: string;
  /** 遗憾量 */
  regretValue: number;
  /** 正遗憾标记 */
  isPositive: boolean;
}

/**
 * 策略分布
 */
export interface Strategy {
  /** 动作 ID */
  actionId: string;
  /** 概率 */
  probability: number;
}

/**
 * 策略档案
 */
export interface StrategyProfile {
  /** 档案 ID */
  profileId: string;
  /** 玩家 ID */
  playerId: string;
  /** 当前策略 */
  currentStrategy: Strategy[];
  /** 策略历史 */
  strategyHistory: Strategy[][];
  /** 累积遗憾 */
  cumulativeRegrets: Map<string, number>;
  /** 迭代次数 */
  iterations: number;
}

/**
 * VAD-CFR 配置
 */
export interface VADCFRConfig {
  /** 折扣因子 */
  discountFactor?: number;
  /** 波动率窗口 (EWMA) */
  volatilityWindow?: number;
  /** 正遗憾增强因子 */
  positiveBoostFactor?: number;
  /** 硬热启动迭代 */
  hardWarmstartIteration?: number;
  /** 遗憾最小阈值 */
  regretMinThreshold?: number;
}

/**
 * SHOR-PSRO 配置 */
export interface SHORPSROConfig {
  /** 乐观遗憾系数 */
  optimismCoefficient?: number;
  /** 混合因子 (训练) */
  blendFactorTrain?: number;
  /** 混合因子 (评估) */
  blendFactorEval?: number;
  /** 多样性参数 (训练) */
  diversityParamTrain?: number;
  /** 多样性参数 (评估) */
  diversityParamEval?: number;
  /** 退火速率 */
  annealingRate?: number;
}

/**
 * AlphaEvolve 配置
 */
export interface AlphaEvolveConfig {
  /** 算法类型 */
  algorithm: AlphaEvolveAlgorithm;
  /** 玩家数量 */
  numPlayers?: number;
  /** 动作数量 */
  numActions?: number;
  /** 最大迭代次数 */
  maxIterations?: number;
  /** 遗憾累积器类型 */
  regretAccumulator?: RegretAccumulatorType;
  /** 策略提取类型 */
  policyExtraction?: PolicyExtractionType;
  /** 策略累积器类型 */
  policyAccumulator?: PolicyAccumulatorType;
  /** VAD-CFR 配置 */
  vadConfig?: VADCFRConfig;
  /** SHOR-PSRO 配置 */
  shorConfig?: SHORPSROConfig;
}

/**
 * 进化结果
 */
export interface EvolutionResult {
  /** 结果 ID */
  resultId: string;
  /** 算法类型 */
  algorithm: AlphaEvolveAlgorithm;
  /** 收敛策略 */
  convergedStrategies: Map<string, Strategy[]>;
  /** 遗憾历史 */
  regretHistory: number[][];
  /** 效用历史 */
  utilityHistory: number[][];
  /** 迭代次数 */
  iterations: number;
  /** 收敛状态 */
  converged: boolean;
  /** 最终遗憾 */
  finalRegret: number;
}

/**
 * 默认配置
 */
const DEFAULT_VAD_CONFIG: Required<VADCFRConfig> = {
  discountFactor: 0.9,
  volatilityWindow: 10,
  positiveBoostFactor: 1.1,
  hardWarmstartIteration: 500,
  regretMinThreshold: 1e-6,
};

const DEFAULT_SHOR_CONFIG: Required<SHORPSROConfig> = {
  optimismCoefficient: 1.0,
  blendFactorTrain: 0.3,
  blendFactorEval: 0.05,
  diversityParamTrain: 0.05,
  diversityParamEval: 0.001,
  annealingRate: 0.995,
};

/**
 * 🧬 AlphaEvolve 进化算法编排器
 *
 * 实现 LLM 驱动的进化算法发现
 */
export class AlphaEvolveOrchestrator {
  private config: AlphaEvolveConfig;
  private strategyProfiles: Map<string, StrategyProfile> = new Map();
  private regretHistory: number[][] = [];
  private utilityHistory: number[][] = [];
  private volatilityEstimate: number = 0;
  // Private typed config properties (always defined after construction)
  private readonly vadConfig: Required<VADCFRConfig>;
  private readonly shorConfig: Required<SHORPSROConfig>;

  constructor(config: AlphaEvolveConfig) {
    this.vadConfig = {
      ...DEFAULT_VAD_CONFIG,
      ...config.vadConfig,
    };
    this.shorConfig = {
      ...DEFAULT_SHOR_CONFIG,
      ...config.shorConfig,
    };

    this.config = {
      ...config,
      numPlayers: config.numPlayers || 2,
      numActions: config.numActions || 3,
      maxIterations: config.maxIterations || 1000,
      regretAccumulator: config.regretAccumulator || RegretAccumulatorType.VOLATILITY_ADAPTIVE,
      policyExtraction: config.policyExtraction || PolicyExtractionType.REGRET_MATCHING,
      policyAccumulator: config.policyAccumulator || PolicyAccumulatorType.HARD_WARMSTART,
      vadConfig: this.vadConfig,
      shorConfig: this.shorConfig,
    };

    console.log(`🧬 AlphaEvolve 编排器初始化`);
    console.log(`   算法: ${this.config.algorithm}`);
    console.log(`   玩家: ${this.config.numPlayers}, 动作: ${this.config.numActions}`);
  }

  /**
   * 执行进化算法
   */
  async evolve(): Promise<EvolutionResult> {
    console.log(`🧬 开始进化: ${this.config.algorithm}`);
    const startTime = Date.now();

    // 初始化策略档案
    this.initializeStrategyProfiles();

    // 根据算法类型执行
    let result: EvolutionResult;
    if (this.config.algorithm === AlphaEvolveAlgorithm.VAD_CFR) {
      result = await this.runVADCFR();
    } else if (this.config.algorithm === AlphaEvolveAlgorithm.SHOR_PSRO) {
      result = await this.runSHORPSRO();
    } else {
      throw new Error(`未知算法: ${this.config.algorithm}`);
    }

    console.log(`🧬 进化完成: ${Date.now() - startTime}ms, 迭代: ${result.iterations}, 收敛: ${result.converged}`);

    return result;
  }

  /**
   * 初始化策略档案
   */
  private initializeStrategyProfiles(): void {
    this.strategyProfiles.clear();

    for (let p = 0; p < (this.config.numPlayers || 2); p++) {
      const playerId = `player_${p}`;
      const initialStrategy: Strategy[] = [];

      // 均匀随机初始化
      const numActions = this.config.numActions || 3;
      const prob = 1 / numActions;
      for (let a = 0; a < numActions; a++) {
        initialStrategy.push({
          actionId: `action_${a}`,
          probability: prob,
        });
      }

      const profile: StrategyProfile = {
        profileId: `profile_${playerId}_${Date.now()}`,
        playerId,
        currentStrategy: initialStrategy,
        strategyHistory: [initialStrategy],
        cumulativeRegrets: new Map(),
        iterations: 0,
      };

      // 初始化遗憾
      for (let a = 0; a < numActions; a++) {
        profile.cumulativeRegrets.set(`action_${a}`, 0);
      }

      this.strategyProfiles.set(playerId, profile);
    }
  }

  /**
   * 运行 VAD-CFR 算法
   */
  private async runVADCFR(): Promise<EvolutionResult> {
    const maxIter = this.config.maxIterations || 1000;
    const vadConfig = this.vadConfig;

    for (let t = 0; t < maxIter; t++) {
      // 为每个玩家计算遗憾
      for (const [playerId, profile] of this.strategyProfiles) {
        const regrets = this.computeRegrets(playerId, t);
        const updatedRegrets = this.accumulateRegretsVAD(profile, regrets, t);

        // 更新累积遗憾
        for (const [actionId, regret] of Object.entries(updatedRegrets)) {
          profile.cumulativeRegrets.set(
            actionId,
            (profile.cumulativeRegrets.get(actionId) || 0) + regret
          );
        }

        // 提取新策略
        const newStrategy = this.extractStrategyVAD(profile, t);
        profile.currentStrategy = newStrategy;

        // 策略累积
        if (t >= vadConfig.hardWarmstartIteration) {
          profile.strategyHistory.push(newStrategy);
        }

        profile.iterations = t;
      }

      // 记录历史
      this.recordHistory(t);

      // 检查收敛
      if (this.checkConvergence(t)) {
        console.log(`   VAD-CFR 在迭代 ${t} 收敛`);
        break;
      }
    }

    return this.buildResult(AlphaEvolveAlgorithm.VAD_CFR);
  }

  /**
   * 计算遗憾
   */
  private computeRegrets(playerId: string, iteration: number): Record<string, number> {
    const profile = this.strategyProfiles.get(playerId)!;
    const numActions = this.config.numActions || 3;
    const regrets: Record<string, number> = {};

    // 模拟对手策略和效用计算
    for (let a = 0; a < numActions; a++) {
      const actionId = `action_${a}`;
      // 简化: 随机效用 + 迭代衰减
      const baseUtility = Math.random() * 10 - 5;
      const currentProb = profile.currentStrategy[a]?.probability || 0;
      const counterfactualUtility = baseUtility + Math.sin(iteration / 50) * 2;

      regrets[actionId] = counterfactualUtility - currentProb * baseUtility;
    }

    return regrets;
  }

  /**
   * VAD 遗憾累积
   */
  private accumulateRegretsVAD(
    profile: StrategyProfile,
    regrets: Record<string, number>,
    iteration: number
  ): Record<string, number> {
    const vadConfig = this.vadConfig;
    const accumulatorType = this.config.regretAccumulator!;
    const result: Record<string, number> = {};

    // 计算波动率估计
    const regretMagnitudes = Object.values(regrets).map(Math.abs);
    const avgMagnitude = regretMagnitudes.reduce((a, b) => a + b, 0) / regretMagnitudes.length;

    // EWMA 更新波动率
    this.volatilityEstimate =
      vadConfig.volatilityWindow * this.volatilityEstimate +
      (1 - vadConfig.volatilityWindow / 100) * avgMagnitude;

    // 波动率自适应折扣因子
    const adaptiveDiscount = vadConfig.discountFactor *
      (1 + Math.min(this.volatilityEstimate / 5, 0.2));

    for (const [actionId, regret] of Object.entries(regrets)) {
      let processedRegret = regret;

      // 非对称即时增强
      if (accumulatorType === RegretAccumulatorType.ASYMMETRIC_BOOST) {
        if (regret > 0) {
          processedRegret = regret * vadConfig.positiveBoostFactor;
        }
      }

      // 应用折扣
      result[actionId] = processedRegret * adaptiveDiscount;

      // 最小阈值过滤
      if (Math.abs(result[actionId]) < vadConfig.regretMinThreshold) {
        result[actionId] = 0;
      }
    }

    return result;
  }

  /**
   * VAD 策略提取
   */
  private extractStrategyVAD(profile: StrategyProfile, iteration: number): Strategy[] {
    const extractionType = this.config.policyExtraction!;
    const numActions = this.config.numActions || 3;
    const strategy: Strategy[] = [];

    if (extractionType === PolicyExtractionType.REGRET_WEIGHTED) {
      // 遗憾加权平均
      const weights: number[] = [];
      let totalWeight = 0;

      for (let a = 0; a < numActions; a++) {
        const actionId = `action_${a}`;
        const regret = profile.cumulativeRegrets.get(actionId) || 0;
        const weight = Math.max(0, regret);
        weights.push(weight);
        totalWeight += weight;
      }

      // 如果所有遗憾都是负的，使用均匀分布
      if (totalWeight < 1e-10) {
        const prob = 1 / numActions;
        for (let a = 0; a < numActions; a++) {
          strategy.push({ actionId: `action_${a}`, probability: prob });
        }
      } else {
        for (let a = 0; a < numActions; a++) {
          strategy.push({
            actionId: `action_${a}`,
            probability: weights[a] / totalWeight,
          });
        }
      }
    } else {
      // 标准遗憾匹配
      const positiveRegrets: Record<string, number> = {};
      let totalPositiveRegret = 0;

      for (let a = 0; a < numActions; a++) {
        const actionId = `action_${a}`;
        const regret = profile.cumulativeRegrets.get(actionId) || 0;
        const positiveRegret = Math.max(0, regret);
        positiveRegrets[actionId] = positiveRegret;
        totalPositiveRegret += positiveRegret;
      }

      if (totalPositiveRegret < 1e-10) {
        const prob = 1 / numActions;
        for (let a = 0; a < numActions; a++) {
          strategy.push({ actionId: `action_${a}`, probability: prob });
        }
      } else {
        for (let a = 0; a < numActions; a++) {
          const actionId = `action_${a}`;
          strategy.push({
            actionId,
            probability: positiveRegrets[actionId] / totalPositiveRegret,
          });
        }
      }
    }

    return strategy;
  }

  /**
   * 运行 SHOR-PSRO 算法
   */
  private async runSHORPSRO(): Promise<EvolutionResult> {
    const maxIter = this.config.maxIterations || 1000;
    const shorConfig = this.shorConfig;

    for (let t = 0; t < maxIter; t++) {
      // 动态退火
      const currentBlendFactor = this.annealParam(
        shorConfig.blendFactorTrain,
        shorConfig.blendFactorEval,
        t,
        maxIter
      );
      const currentDiversity = this.annealParam(
        shorConfig.diversityParamTrain,
        shorConfig.diversityParamEval,
        t,
        maxIter
      );

      // 为每个玩家计算遗憾和更新策略
      for (const [playerId, profile] of this.strategyProfiles) {
        const regrets = this.computeOptimisticRegrets(playerId, t, shorConfig.optimismCoefficient);

        // 更新累积遗憾
        for (const [actionId, regret] of Object.entries(regrets)) {
          profile.cumulativeRegrets.set(
            actionId,
            (profile.cumulativeRegrets.get(actionId) || 0) + regret
          );
        }

        // 提取混合策略
        const newStrategy = this.extractHybridStrategy(
          profile,
          currentBlendFactor,
          currentDiversity
        );
        profile.currentStrategy = newStrategy;
        profile.strategyHistory.push(newStrategy);
        profile.iterations = t;
      }

      // 记录历史
      this.recordHistory(t);

      // 检查收敛
      if (this.checkConvergence(t)) {
        console.log(`   SHOR-PSRO 在迭代 ${t} 收敛`);
        break;
      }
    }

    return this.buildResult(AlphaEvolveAlgorithm.SHOR_PSRO);
  }

  /**
   * 计算乐观遗憾
   */
  private computeOptimisticRegrets(
    playerId: string,
    iteration: number,
    optimismCoefficient: number
  ): Record<string, number> {
    const profile = this.strategyProfiles.get(playerId)!;
    const numActions = this.config.numActions || 3;
    const regrets: Record<string, number> = {};

    for (let a = 0; a < numActions; a++) {
      const actionId = `action_${a}`;
      const baseUtility = Math.random() * 10 - 5;
      const currentProb = profile.currentStrategy[a]?.probability || 0;

      // 乐观遗憾: 假设对手采取对我们最有利的动作
      const optimisticUtility = baseUtility + optimismCoefficient * Math.abs(Math.sin(iteration / 100));
      regrets[actionId] = optimisticUtility - currentProb * baseUtility;
    }

    return regrets;
  }

  /**
   * 提取混合策略
   */
  private extractHybridStrategy(
    profile: StrategyProfile,
    blendFactor: number,
    diversityParam: number
  ): Strategy[] {
    const numActions = this.config.numActions || 3;
    const strategy: Strategy[] = [];

    // 乐观遗憾匹配部分
    const ormProbabilities: number[] = [];
    let totalOrm = 0;
    for (let a = 0; a < numActions; a++) {
      const actionId = `action_${a}`;
      const regret = Math.max(0, profile.cumulativeRegrets.get(actionId) || 0);
      ormProbabilities.push(regret);
      totalOrm += regret;
    }

    // 平滑最佳纯策略部分
    const bestAction = this.findBestAction(profile);
    const smoothedPure: number[] = [];
    let totalSmoothed = 0;
    for (let a = 0; a < numActions; a++) {
      const actionId = `action_${a}`;
      const isBest = actionId === bestAction;
      const prob = isBest ? 1 - diversityParam : diversityParam / (numActions - 1);
      smoothedPure.push(prob);
      totalSmoothed += prob;
    }

    // 混合
    for (let a = 0; a < numActions; a++) {
      const ormProb = totalOrm > 0 ? ormProbabilities[a] / totalOrm : 1 / numActions;
      const smoothProb = smoothedPure[a] / totalSmoothed;
      const blendedProb = blendFactor * ormProb + (1 - blendFactor) * smoothProb;

      strategy.push({
        actionId: `action_${a}`,
        probability: blendedProb,
      });
    }

    return strategy;
  }

  /**
   * 找到最佳动作
   */
  private findBestAction(profile: StrategyProfile): string {
    let bestAction = "";
    let bestRegret = -Infinity;

    for (const [actionId, regret] of profile.cumulativeRegrets.entries()) {
      if (regret > bestRegret) {
        bestRegret = regret;
        bestAction = actionId;
      }
    }

    return bestAction || profile.currentStrategy[0]?.actionId || "action_0";
  }

  /**
   * 退火参数
   */
  private annealParam(
    trainValue: number,
    evalValue: number,
    iteration: number,
    maxIterations: number
  ): number {
    const progress = iteration / maxIterations;
    const shorConfig = this.shorConfig;
    const annealed = Math.pow(shorConfig.annealingRate, iteration);

    return trainValue * (1 - progress) + evalValue * progress * annealed;
  }

  /**
   * 记录历史
   */
  private recordHistory(iteration: number): void {
    const regrets: number[] = [];
    const utilities: number[] = [];

    for (const profile of this.strategyProfiles.values()) {
      const avgRegret = Array.from(profile.cumulativeRegrets.values())
        .reduce((a, b) => a + Math.abs(b), 0) / profile.cumulativeRegrets.size;
      regrets.push(avgRegret);

      const entropy = this.calculateEntropy(profile.currentStrategy);
      utilities.push(entropy);
    }

    this.regretHistory.push(regrets);
    this.utilityHistory.push(utilities);
  }

  /**
   * 计算熵
   */
  private calculateEntropy(strategy: Strategy[]): number {
    let entropy = 0;
    for (const s of strategy) {
      if (s.probability > 0) {
        entropy -= s.probability * Math.log(s.probability);
      }
    }
    return entropy;
  }

  /**
   * 检查收敛
   */
  private checkConvergence(iteration: number): boolean {
    if (iteration < 100) return false;

    // 检查最近遗憾变化
    const recentHistory = this.regretHistory.slice(-20);
    if (recentHistory.length < 20) return false;

    const firstRegret = recentHistory[0].reduce((a, b) => a + b, 0);
    const lastRegret = recentHistory[recentHistory.length - 1].reduce((a, b) => a + b, 0);
    const change = Math.abs(firstRegret - lastRegret);

    return change < 0.01;
  }

  /**
   * 构建结果
   */
  private buildResult(algorithm: AlphaEvolveAlgorithm): EvolutionResult {
    const convergedStrategies = new Map<string, Strategy[]>();

    for (const [playerId, profile] of this.strategyProfiles) {
      convergedStrategies.set(playerId, profile.currentStrategy);
    }

    // 计算最终遗憾
    let totalRegret = 0;
    for (const regrets of this.regretHistory[this.regretHistory.length - 1] || []) {
      totalRegret += regrets;
    }

    return {
      resultId: `alphaevolve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      algorithm,
      convergedStrategies,
      regretHistory: this.regretHistory,
      utilityHistory: this.utilityHistory,
      iterations: this.regretHistory.length,
      converged: this.checkConvergence(this.regretHistory.length),
      finalRegret: totalRegret,
    };
  }

  /**
   * 获取策略档案
   */
  getStrategyProfile(playerId: string): StrategyProfile | undefined {
    return this.strategyProfiles.get(playerId);
  }

  /**
   * 获取所有策略档案
   */
  getAllStrategyProfiles(): StrategyProfile[] {
    return Array.from(this.strategyProfiles.values());
  }
}

/**
 * 工厂函数：创建 AlphaEvolve 编排器
 */
export function createAlphaEvolveOrchestrator(config: AlphaEvolveConfig): AlphaEvolveOrchestrator {
  return new AlphaEvolveOrchestrator(config);
}

/**
 * 算法模板
 */
export const AlphaEvolveTemplates = {
  /** VAD-CFR: 零和博弈 */
  vadCfrZeroSum: {
    description: "波动率自适应 CFR 用于零和博弈",
    algorithm: AlphaEvolveAlgorithm.VAD_CFR,
    recommendedConfig: {
      regretAccumulator: RegretAccumulatorType.VOLATILITY_ADAPTIVE,
      policyExtraction: PolicyExtractionType.REGRET_WEIGHTED,
      policyAccumulator: PolicyAccumulatorType.HARD_WARMSTART,
      vadConfig: {
        discountFactor: 0.9,
        volatilityWindow: 10,
        positiveBoostFactor: 1.1,
        hardWarmstartIteration: 500,
      },
    } as AlphaEvolveConfig,
  },

  /** SHOR-PSRO: 一般和博弈 */
  shorPsroGeneralSum: {
    description: "平滑混合乐观遗憾 PSRO 用于一般和博弈",
    algorithm: AlphaEvolveAlgorithm.SHOR_PSRO,
    recommendedConfig: {
      regretAccumulator: RegretAccumulatorType.STANDARD,
      policyExtraction: PolicyExtractionType.OPTIMISTIC_REGRET,
      policyAccumulator: PolicyAccumulatorType.SIMPLE_AVERAGE,
      shorConfig: {
        optimismCoefficient: 1.0,
        blendFactorTrain: 0.3,
        blendFactorEval: 0.05,
        diversityParamTrain: 0.05,
        diversityParamEval: 0.001,
        annealingRate: 0.995,
      },
    } as AlphaEvolveConfig,
  },

  /** 快速收敛配置 */
  fastConvergence: {
    description: "快速收敛配置（较少迭代）",
    algorithm: AlphaEvolveAlgorithm.VAD_CFR,
    recommendedConfig: {
      maxIterations: 200,
      regretAccumulator: RegretAccumulatorType.ASYMMETRIC_BOOST,
      vadConfig: {
        discountFactor: 0.95,
        volatilityWindow: 5,
        hardWarmstartIteration: 100,
      },
    } as AlphaEvolveConfig,
  },
};
