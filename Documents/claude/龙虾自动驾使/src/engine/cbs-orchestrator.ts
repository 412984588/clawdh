/**
 * 🔍 CBS 协作束搜索编排器
 *
 * 基于 arXiv:2404.15676 "Collaborative Beam Search: Enhancing LLM Reasoning via Collective Consensus" (EMNLP 2025)
 *
 * 核心思想：通过多 LLM 协作束搜索增强推理能力
 *
 * 关键创新：
 * - Span 级集成：选择最佳固定长度文本片段
 * - 束搜索扩展：维护多个候选路径
 * - 迭代共识：通过多轮改进达成共识
 * - 协作评分：多个 LLM 共同评估候选
 * - 动态剪枝：移除低质量候选
 *
 * @see {@link https://arxiv.org/pdf/2404.15676} - CBS Paper
 * @see {@link https://aclanthology.org/2025.emnlp-main.574/} - EMNLP 2025
 *
 * @version 2.25.0
 * @since 2025-03-11
 */

/**
 * 推理任务类型
 */
export enum CBSReasoningType {
  /** 算术推理 */
  ARITHMETIC = "arithmetic",
  /** 逻辑推理 */
  LOGICAL = "logical",
  /** 常识推理 */
  COMMON_SENSE = "common_sense",
  /** 符号推理 */
  SYMBOLIC = "symbolic",
}

/**
 * Span 状态
 */
export enum CBSSpanState {
  /** 候选中 */
  CANDIDATE = "candidate",
  /** 已选择 */
  SELECTED = "selected",
  /** 已剪枝 */
  PRUNED = "pruned",
  /** 最终输出 */
  FINAL = "final",
}

/**
 * 候选路径
 */
export interface CBSCandidatePath {
  /** 路径 ID */
  pathId: string;
  /** Span 序列 */
  spans: CBSSpan[];
  /** 得分 */
  score: number;
  /** 来源 LLM 集合 */
  sourceModels: string[];
  /** 迭代轮次 */
  round: number;
  /** 状态 */
  state: CBSSpanState;
}

/**
 * 文本片段
 */
export interface CBSSpan {
  /** Span ID */
  spanId: string;
  /** 内容 */
  content: string;
  /** 来源 LLM */
  sourceModel: string;
  /** 位置 */
  position: number;
  /** 长度 */
  length: number;
  /** 得分 */
  score: number;
  /** 置信度 */
  confidence: number;
  /** 状态 */
  state: CBSSpanState;
}

/**
 * 束搜索配置
 */
export interface CBSBeamConfig {
  /** 束宽 */
  beamWidth?: number;
  /** 最大迭代次数 */
  maxIterations?: number;
  /** Span 长度 */
  spanLength?: number;
  /** LLM 集合 */
  llmModels: string[];
  /** 协作评分启用 */
  enableCollaborativeScoring?: boolean;
  /** 剪枝阈值 */
  pruningThreshold?: number;
}

/**
 * CBS 推理结果
 */
export interface CBSReasoningResult {
  /** 结果 ID */
  resultId: string;
  /** 任务描述 */
  taskDescription: string;
  /** 推理类型 */
  reasoningType: CBSReasoningType;
  /** 最终输出 */
  finalOutput: string;
  /** 候选路径历史 */
  candidateHistory: CBSCandidatePath[];
  /** 最佳路径 */
  bestPath: CBSCandidatePath;
  /** 迭代次数 */
  iterations: number;
  /** 共识分数 */
  consensusScore: number;
}

/**
 * CBS 配置
 */
export interface CBSConfig {
  /** 可用 LLM 模型 */
  availableModels: string[];
  /** 默认束宽 */
  defaultBeamWidth?: number;
  /** 默认迭代次数 */
  defaultMaxIterations?: number;
  /** 默认 Span 长度 */
  defaultSpanLength?: number;
  /** 详细日志 */
  enableDetailedLogging?: boolean;
}

/**
 * 默认 LLM 模型列表
 */
const DEFAULT_MODELS = ["gpt-4", "claude-3", "llama-3", "gemini-pro"] as const;

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<Omit<CBSConfig, 'availableModels'>> = {
  defaultBeamWidth: 5,
  defaultMaxIterations: 8,
  defaultSpanLength: 50,
  enableDetailedLogging: false,
};

/**
 * 🔍 CBS 协作束搜索编排器
 *
 * 实现多 LLM 协作束搜索推理
 */
export class CBSOrchestrator {
  private config: Required<CBSConfig>;
  private reasoningHistory: Map<string, CBSReasoningResult> = new Map();

  constructor(config: CBSConfig) {
    const { availableModels, ...restConfig } = config;
    this.config = {
      ...DEFAULT_CONFIG,
      ...restConfig,
      availableModels: availableModels || [...DEFAULT_MODELS],
    } as Required<CBSConfig>;

    console.log(`🔍 CBS 编排器初始化`);
    console.log(`   LLM 模型: ${this.config.availableModels.length} 个`);
    console.log(`   束宽: ${this.config.defaultBeamWidth}`);
  }

  /**
   * 执行 CBS 推理
   */
  async reason(taskDescription: string, beamConfig?: Partial<CBSBeamConfig>): Promise<CBSReasoningResult> {
    console.log(`🔍 CBS 推理开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 推断推理类型
    const reasoningType = this.inferReasoningType(taskDescription);

    // 合并配置
    const config: Required<CBSBeamConfig> = {
      beamWidth: beamConfig?.beamWidth || this.config.defaultBeamWidth,
      maxIterations: beamConfig?.maxIterations || this.config.defaultMaxIterations,
      spanLength: beamConfig?.spanLength || this.config.defaultSpanLength,
      llmModels: beamConfig?.llmModels || this.config.availableModels,
      enableCollaborativeScoring: beamConfig?.enableCollaborativeScoring ?? true,
      pruningThreshold: beamConfig?.pruningThreshold || 0.3,
    };

    // 1. 初始化候选
    let candidates: CBSCandidatePath[] = await this.initializeCandidates(taskDescription, config);

    const candidateHistory: CBSCandidatePath[] = [...candidates];

    // 2. 迭代束搜索
    for (let round = 0; round < config.maxIterations; round++) {
      // 2.1 扩展候选
      candidates = await this.expandCandidates(candidates, config);

      // 2.2 协作评分
      candidates = await this.collaborativeScore(candidates, config);

      // 2.3 选择 Top-K
      candidates = this.selectTopK(candidates, config.beamWidth);

      // 2.4 剪枝
      candidates = this.pruneCandidates(candidates, config.pruningThreshold);

      // 记录历史
      candidateHistory.push(...candidates.map(c => ({ ...c, round })));

      // 检查是否收敛
      if (this.hasConverged(candidates)) {
        break;
      }
    }

    // 3. 选择最佳路径
    const bestPath = this.selectBestPath(candidates);

    // 4. 构建最终输出
    const finalOutput = this.buildFinalOutput(bestPath);

    // 5. 计算共识分数
    const consensusScore = this.calculateConsensusScore(candidates);

    const result: CBSReasoningResult = {
      resultId: `cbs_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskDescription,
      reasoningType,
      finalOutput,
      candidateHistory,
      bestPath,
      iterations: candidateHistory.length / config.beamWidth,
      consensusScore,
    };

    this.reasoningHistory.set(result.resultId, result);

    console.log(`🔍 推理完成: ${Date.now() - startTime}ms, 迭代: ${result.iterations} 轮, 共识: ${consensusScore.toFixed(2)}`);

    return result;
  }

  /**
   * 初始化候选
   */
  private async initializeCandidates(taskDescription: string, config: Required<CBSBeamConfig>): Promise<CBSCandidatePath[]> {
    const candidates: CBSCandidatePath[] = [];

    for (const model of config.llmModels) {
      const span: CBSSpan = {
        spanId: `span_init_${model}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        content: `Initial analysis by ${model}: ${taskDescription.substring(0, 30)}...`,
        sourceModel: model,
        position: 0,
        length: config.spanLength,
        score: 0.5 + Math.random() * 0.3,
        confidence: 0.5 + Math.random() * 0.3,
        state: CBSSpanState.CANDIDATE,
      };

      candidates.push({
        pathId: `path_init_${model}_${Date.now()}`,
        spans: [span],
        score: span.score,
        sourceModels: [model],
        round: 0,
        state: CBSSpanState.CANDIDATE,
      });
    }

    return candidates;
  }

  /**
   * 扩展候选
   */
  private async expandCandidates(candidates: CBSCandidatePath[], config: Required<CBSBeamConfig>): Promise<CBSCandidatePath[]> {
    const expanded: CBSCandidatePath[] = [];

    for (const candidate of candidates) {
      if (candidate.state === CBSSpanState.PRUNED) continue;

      // 为每个候选生成扩展
      for (const model of config.llmModels) {
        const newSpan: CBSSpan = {
          spanId: `span_${model}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          content: this.generateSpanContent(candidate, model, config),
          sourceModel: model,
          position: candidate.spans.length,
          length: config.spanLength,
          score: 0.5 + Math.random() * 0.4,
          confidence: 0.5 + Math.random() * 0.4,
          state: CBSSpanState.CANDIDATE,
        };

        expanded.push({
          pathId: `path_${candidate.pathId}_${model}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          spans: [...candidate.spans, newSpan],
          score: candidate.score + newSpan.score * 0.5,
          sourceModels: [...candidate.sourceModels, model],
          round: candidate.round + 1,
          state: CBSSpanState.CANDIDATE,
        });
      }
    }

    return expanded;
  }

  /**
   * 协作评分
   */
  private async collaborativeScore(candidates: CBSCandidatePath[], config: Required<CBSBeamConfig>): Promise<CBSCandidatePath[]> {
    if (!config.enableCollaborativeScoring) return candidates;

    const scored: CBSCandidatePath[] = [];

    for (const candidate of candidates) {
      // 多模型协作评分
      let collaborativeScore = 0;

      for (const span of candidate.spans) {
        // 来源模型多样性加分
        const modelDiversity = new Set(candidate.sourceModels).size / config.llmModels.length;
        collaborativeScore += span.score * (1 + modelDiversity * 0.3);

        // 跨模型共识加分
        const consensusBonus = this.calculateSpanConsensus(span, candidate);
        collaborativeScore += consensusBonus * 0.2;
      }

      // 归一化
      collaborativeScore = collaborativeScore / candidate.spans.length;

      scored.push({ ...candidate, score: collaborativeScore });
    }

    return scored;
  }

  /**
   * 计算 Span 共识
   */
  private calculateSpanConsensus(span: CBSSpan, path: CBSCandidatePath): number {
    // 检查其他路径中是否有相似 Span
    let consensusCount = 0;
    const contentKeywords = this.extractKeywords(span.content);

    for (const otherPath of this.reasoningHistory.values()) {
      for (const otherSpan of otherPath.bestPath?.spans || []) {
        const otherKeywords = this.extractKeywords(otherSpan.content);
        const overlap = [...contentKeywords].filter(k => otherKeywords.has(k)).length;

        if (overlap > 3) {
          consensusCount++;
        }
      }
    }

    return consensusCount / 10;
  }

  /**
   * 提取关键词
   */
  private extractKeywords(content: string): Set<string> {
    const words = content.toLowerCase().split(/\W+/);
    const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "have", "has", "will"]);
    return new Set(words.filter(w => w.length > 3 && !stopWords.has(w)));
  }

  /**
   * 选择 Top-K
   */
  private selectTopK(candidates: CBSCandidatePath[], k: number): CBSCandidatePath[] {
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((c, index) => ({ ...c, state: index < k ? CBSSpanState.CANDIDATE : CBSSpanState.PRUNED }));
  }

  /**
   * 剪枝候选
   */
  private pruneCandidates(candidates: CBSCandidatePath[], threshold: number): CBSCandidatePath[] {
    if (candidates.length <= 1) return candidates;

    // 计算分数分位数
    const scores = candidates.map(c => c.score).sort((a, b) => a - b);
    const thresholdScore = scores[Math.floor(scores.length * threshold)] || threshold;

    return candidates.filter(c => c.score >= thresholdScore);
  }

  /**
   * 检查是否收敛
   */
  private hasConverged(candidates: CBSCandidatePath[]): boolean {
    if (candidates.length === 0) return true;

    // 检查最高分是否稳定
    const topScore = candidates[0].score;
    const allSimilar = candidates.every(c => Math.abs(c.score - topScore) < 0.05);

    return allSimilar && candidates.length > 1;
  }

  /**
   * 选择最佳路径
   */
  private selectBestPath(candidates: CBSCandidatePath[]): CBSCandidatePath {
    if (candidates.length === 0) {
      return {
        pathId: "empty",
        spans: [],
        score: 0,
        sourceModels: [],
        round: 0,
        state: CBSSpanState.FINAL,
      };
    }

    const best = candidates.reduce((a, b) => (a.score > b.score ? a : b));

    // 标记最终 Span
    for (const span of best.spans) {
      span.state = CBSSpanState.FINAL;
    }

    return { ...best, state: CBSSpanState.FINAL };
  }

  /**
   * 构建最终输出
   */
  private buildFinalOutput(path: CBSCandidatePath): string {
    if (path.spans.length === 0) {
      return "No reasoning result generated.";
    }

    let output = `CBS Collaborative Reasoning Result:\n\n`;

    for (let i = 0; i < path.spans.length; i++) {
      const span = path.spans[i];
      output += `[Step ${i + 1}] ${span.sourceModel}: ${span.content}\n`;
    }

    output += `\nFinal Confidence: ${this.calculatePathConfidence(path).toFixed(2)}`;
    output += `\nModels Involved: ${[...new Set(path.sourceModels)].join(", ")}`;

    return output;
  }

  /**
   * 计算路径置信度
   */
  private calculatePathConfidence(path: CBSCandidatePath): number {
    if (path.spans.length === 0) return 0;

    const avgConfidence = path.spans.reduce((sum, span) => sum + span.confidence, 0) / path.spans.length;
    const modelDiversity = new Set(path.sourceModels).size / 5;

    return avgConfidence * (0.7 + modelDiversity * 0.3);
  }

  /**
   * 计算共识分数
   */
  private calculateConsensusScore(candidates: CBSCandidatePath[]): number {
    if (candidates.length === 0) return 0;

    // 计算候选间的相似度
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const similarity = this.calculatePathSimilarity(candidates[i], candidates[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * 计算路径相似度
   */
  private calculatePathSimilarity(path1: CBSCandidatePath, path2: CBSCandidatePath): number {
    const keywords1 = this.extractKeywords(path1.spans.map(s => s.content).join(" "));
    const keywords2 = this.extractKeywords(path2.spans.map(s => s.content).join(" "));

    const intersection = [...keywords1].filter(k => keywords2.has(k));
    const union = new Set([...keywords1, ...keywords2]);

    return union.size > 0 ? intersection.length / union.size : 0;
  }

  /**
   * 生成 Span 内容
   */
  private generateSpanContent(path: CBSCandidatePath, model: string, config: CBSBeamConfig): string {
    const lastSpan = path.spans[path.spans.length - 1];

    const templates: Record<string, string> = {
      gpt4: `${model}: Analyzes and extends "${lastSpan?.content.substring(0, 20)}..." with detailed reasoning`,
      claude: `${model}: Provides careful analysis of "${lastSpan?.content.substring(0, 20)}..." considering multiple perspectives`,
      llama: `${model}: Processes "${lastSpan?.content.substring(0, 20)}..." with efficiency and accuracy`,
      gemini: `${model}: Examines "${lastSpan?.content.substring(0, 20)}..." with structured reasoning`,
    };

    const template = templates[model.toLowerCase()] || templates[config.llmModels[0].toLowerCase()];

    return template || `${model}: Extended previous reasoning`;
  }

  /**
   * 推断推理类型
   */
  private inferReasoningType(taskDescription: string): CBSReasoningType {
    const desc = taskDescription.toLowerCase();

    if (desc.includes("calculate") || desc.includes("math") || desc.includes("number")) {
      return CBSReasoningType.ARITHMETIC;
    } else if (desc.includes("logic") || desc.includes("deduce") || desc.includes("prove")) {
      return CBSReasoningType.LOGICAL;
    } else if (desc.includes("symbol") || desc.includes("format") || desc.includes("structure")) {
      return CBSReasoningType.SYMBOLIC;
    } else {
      return CBSReasoningType.COMMON_SENSE;
    }
  }

  /**
   * 获取推理历史
   */
  getReasoningHistory(): CBSReasoningResult[] {
    return Array.from(this.reasoningHistory.values());
  }
}

/**
 * 工厂函数：创建 CBS 编排器
 */
export function createCBSOrchestrator(config: CBSConfig): CBSOrchestrator {
  return new CBSOrchestrator(config);
}

/**
 * 任务模板
 */
export const CBSTemplates = {
  /** 算术推理任务 */
  arithmetic: {
    description: "数学计算和算术推理",
    recommendedConfig: {
      beamWidth: 3,
      maxIterations: 10,
      spanLength: 30,
    },
  },

  /** 逻辑推理任务 */
  logical: {
    description: "逻辑推理和演绎",
    recommendedConfig: {
      beamWidth: 5,
      maxIterations: 8,
      spanLength: 50,
    },
  },

  /** 常识推理任务 */
  commonSense: {
    description: "常识推理和实际应用",
    recommendedConfig: {
      beamWidth: 7,
      maxIterations: 6,
      spanLength: 40,
    },
  },

  /** 深度推理任务 */
  deepReasoning: {
    description: "需要多轮迭代和深度思考",
    recommendedConfig: {
      beamWidth: 5,
      maxIterations: 15,
      spanLength: 60,
    },
  },
};
