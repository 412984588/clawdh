/**
 * 🧠 RAPO 推理感知提示编排器
 *
 * 基于 arXiv:2510.00326 "Reasoning-Aware Prompt Orchestration: A Foundation Model for Multi-Agent Language Model Coordination"
 *
 * 核心思想：通过推理感知的动态提示编排增强多代理 LLM 的推理能力
 *
 * 关键创新：
 * - 状态空间形式化：使用形式化状态空间作为理论基础
 * - 动态提示编排：根据推理状态动态调整提示
 * - 自适应路由：智能路由到最合适的专门代理
 * - 共识机制：多代理间达成推理共识
 * - 推理感知：跟踪和评估推理过程质量
 *
 * @see {@link https://arxiv.org/abs/2510.00326} - RAPO Paper
 *
 * @version 2.29.0
 * @since 2025-03-11
 */

/**
 * RAPO 推理状态
 */
export enum RAPOReasoningState {
  /** 初始化 */
  INITIALIZING = "initializing",
  /** 分析中 */
  ANALYZING = "analyzing",
  /** 推理中 */
  REASONING = "reasoning",
  /** 验证中 */
  VERIFYING = "verifying",
  /** 综合中 */
  SYNTHESIZING = "synthesizing",
  /** 完成 */
  COMPLETED = "completed",
  /** 失败 */
  FAILED = "failed",
}

/**
 * 提示类型
 */
export enum PromptType {
  /** 分析提示 */
  ANALYSIS = "analysis",
  /** 推理提示 */
  REASONING = "reasoning",
  /** 验证提示 */
  VERIFICATION = "verification",
  /** 综合提示 */
  SYNTHESIS = "synthesis",
  /** 共识提示 */
  CONSENSUS = "consensus",
}

/**
 * 代理专长领域
 */
export enum AgentExpertise {
  /** 逻辑推理 */
  LOGICAL_REASONING = "logical_reasoning",
  /** 知识检索 */
  KNOWLEDGE_RETRIEVAL = "knowledge_retrieval",
  /** 创造性思维 */
  CREATIVE_THINKING = "creative_thinking",
  /** 批判性分析 */
  CRITICAL_ANALYSIS = "critical_analysis",
  /** 数学计算 */
  MATHEMATICAL = "mathematical",
  /** 语言理解 */
  LANGUAGE_UNDERSTANDING = "language_understanding",
  /** 事实核查 */
  FACT_CHECKING = "fact_checking",
  /** 系统思维 */
  SYSTEMS_THINKING = "systems_thinking",
}

/**
 * 状态空间坐标
 */
export interface StateSpaceCoordinate {
  /** 推理深度 (0-1) */
  reasoningDepth: number;
  /** 置信度 (0-1) */
  confidence: number;
  /** 信息密度 (0-1) */
  informationDensity: number;
  /** 复杂度 (0-1) */
  complexity: number;
  /** 共识度 (0-1) */
  consensusLevel: number;
}

/**
 * 推理轨迹
 */
export interface ReasoningTrace {
  /** 轨迹 ID */
  traceId: string;
  /** 时间戳 */
  timestamp: number;
  /** 状态 */
  state: RAPOReasoningState;
  /** 坐标 */
  coordinate: StateSpaceCoordinate;
  /** 源代理 */
  sourceAgent: string;
  /** 提示类型 */
  promptType: PromptType;
  /** 输入 */
  input: string;
  /** 输出 */
  output: string;
  /** 元数据 */
  metadata: Record<string, unknown>;
}

/**
 * 提示模板
 */
export interface PromptTemplate {
  /** 模板 ID */
  templateId: string;
  /** 类型 */
  type: PromptType;
  /** 目标专长 */
  targetExpertise: AgentExpertise;
  /** 模板内容 */
  template: string;
  /** 参数 */
  parameters: string[];
  /** 优先级 */
  priority: number;
}

/**
 * 代理配置
 */
export interface AgentConfig {
  /** 代理 ID */
  agentId: string;
  /** 代理名称 */
  agentName: string;
  /** 专长领域 */
  expertise: AgentExpertise[];
  /** 能力评分 (0-1) */
  capabilityScore: number;
  /** 可用性 (0-1) */
  availability: number;
}

/**
 * 路由决策
 */
export interface RoutingDecision {
  /** 目标代理 */
  targetAgent: string;
  /** 理由 */
  rationale: string;
  /** 期望收益 */
  expectedBenefit: number;
  /** 替代代理 */
  alternatives: string[];
}

/**
 * RAPO 共识结果
 */
export interface RAPOConsensusResult {
  /** 达成共识 */
  achieved: boolean;
  /** 共识内容 */
  content: string;
  /** 参与代理 */
  participants: string[];
  /** 同意度 */
  agreementLevel: number;
  /** 迭代次数 */
  iterations: number;
}

/**
 * RAPO 配置
 */
export interface RAPOConfig {
  /** 可用代理 */
  availableAgents?: AgentConfig[];
  /** 最大推理深度 */
  maxReasoningDepth?: number;
  /** 最小共识阈值 */
  minConsensusThreshold?: number;
  /** 启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 提示模板库 */
  promptTemplates?: PromptTemplate[];
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<Omit<RAPOConfig, 'availableAgents' | 'promptTemplates'>> = {
  maxReasoningDepth: 5,
  minConsensusThreshold: 0.75,
  enableDetailedLogging: false,
};

/**
 * 默认代理配置
 */
const DEFAULT_AGENTS: AgentConfig[] = [
  {
    agentId: "logical_reasoner",
    agentName: "Logical Reasoner",
    expertise: [AgentExpertise.LOGICAL_REASONING, AgentExpertise.MATHEMATICAL],
    capabilityScore: 0.9,
    availability: 0.95,
  },
  {
    agentId: "knowledge_retriever",
    agentName: "Knowledge Retriever",
    expertise: [AgentExpertise.KNOWLEDGE_RETRIEVAL, AgentExpertise.FACT_CHECKING],
    capabilityScore: 0.85,
    availability: 0.9,
  },
  {
    agentId: "creative_thinker",
    agentName: "Creative Thinker",
    expertise: [AgentExpertise.CREATIVE_THINKING, AgentExpertise.LANGUAGE_UNDERSTANDING],
    capabilityScore: 0.8,
    availability: 0.85,
  },
  {
    agentId: "critical_analyzer",
    agentName: "Critical Analyzer",
    expertise: [AgentExpertise.CRITICAL_ANALYSIS, AgentExpertise.SYSTEMS_THINKING],
    capabilityScore: 0.88,
    availability: 0.92,
  },
];

/**
 * 默认提示模板
 */
const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    templateId: "analysis_template",
    type: PromptType.ANALYSIS,
    targetExpertise: AgentExpertise.LOGICAL_REASONING,
    template: "Analyze the following task systematically: {task}. Identify key components, constraints, and potential approaches.",
    parameters: ["task"],
    priority: 1,
  },
  {
    templateId: "reasoning_template",
    type: PromptType.REASONING,
    targetExpertise: AgentExpertise.LOGICAL_REASONING,
    template: "Given the analysis: {analysis}, provide a detailed reasoning chain to address: {question}. Consider multiple perspectives.",
    parameters: ["analysis", "question"],
    priority: 1,
  },
  {
    templateId: "verification_template",
    type: PromptType.VERIFICATION,
    targetExpertise: AgentExpertise.CRITICAL_ANALYSIS,
    template: "Critically evaluate the following reasoning: {reasoning}. Identify potential flaws, assumptions, and areas for improvement.",
    parameters: ["reasoning"],
    priority: 1,
  },
  {
    templateId: "synthesis_template",
    type: PromptType.SYNTHESIS,
    targetExpertise: AgentExpertise.SYSTEMS_THINKING,
    template: "Synthesize the following viewpoints into a coherent response: {viewpoints}. Highlight areas of agreement and disagreement.",
    parameters: ["viewpoints"],
    priority: 1,
  },
  {
    templateId: "consensus_template",
    type: PromptType.CONSENSUS,
    targetExpertise: AgentExpertise.CRITICAL_ANALYSIS,
    template: "Review the following agent responses and identify areas of consensus: {responses}. What conclusions can be jointly affirmed?",
    parameters: ["responses"],
    priority: 1,
  },
];

/**
 * 🧠 RAPO 推理感知提示编排器
 *
 * 实现动态提示编排增强多代理推理能力
 */
export class RAPOOrchestrator {
  private config: Required<RAPOConfig>;
  private reasoningHistory: Map<string, ReasoningTrace[]> = new Map();
  private currentState: Map<string, StateSpaceCoordinate> = new Map();

  constructor(config: RAPOConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      availableAgents: config.availableAgents || DEFAULT_AGENTS,
      promptTemplates: config.promptTemplates || DEFAULT_TEMPLATES,
    };

    console.log(`🧠 RAPO 编排器初始化`);
    console.log(`   可用代理: ${this.config.availableAgents.length} 个`);
    console.log(`   提示模板: ${this.config.promptTemplates.length} 个`);
  }

  /**
   * 执行 RAPO 编排
   */
  async orchestrate(task: string, expertise?: AgentExpertise): Promise<{
    result: string;
    traces: ReasoningTrace[];
    consensus: RAPOConsensusResult;
    reasoningDepth: number;
    confidence: number;
  }> {
    console.log(`🧠 RAPO 编排开始: "${task.substring(0, 50)}..."`);
    const startTime = Date.now();

    const sessionId = `rapo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const traces: ReasoningTrace[] = [];

    // 1. 初始化状态空间
    const initialState = this.initializeStateSpace();
    this.currentState.set(sessionId, initialState);

    // 2. 分析阶段
    const analysisTrace = await this.executePhase(
      sessionId,
      PromptType.ANALYSIS,
      task,
      AgentExpertise.LOGICAL_REASONING,
      initialState
    );
    traces.push(analysisTrace);

    // 3. 推理阶段（多轮）
    const reasoningTraces = await this.executeReasoningPhase(
      sessionId,
      task,
      analysisTrace.output,
      expertise || AgentExpertise.LOGICAL_REASONING,
      1
    );
    traces.push(...reasoningTraces);

    // 4. 验证阶段
    const verificationTrace = await this.executePhase(
      sessionId,
      PromptType.VERIFICATION,
      reasoningTraces[reasoningTraces.length - 1]?.output || task,
      AgentExpertise.CRITICAL_ANALYSIS,
      this.currentState.get(sessionId)!
    );
    traces.push(verificationTrace);

    // 5. 共识阶段
    const consensus = await this.achieveConsensus(
      sessionId,
      traces,
      this.currentState.get(sessionId)!
    );

    // 6. 综合阶段
    const synthesisTrace = await this.executePhase(
      sessionId,
      PromptType.SYNTHESIS,
      this.formatViewpoints(traces),
      AgentExpertise.SYSTEMS_THINKING,
      this.currentState.get(sessionId)!
    );
    traces.push(synthesisTrace);

    this.reasoningHistory.set(sessionId, traces);

    const finalCoordinate = this.currentState.get(sessionId)!;
    const duration = Date.now() - startTime;

    console.log(`🧠 编排完成: ${duration}ms, 推理深度: ${this.calculateReasoningDepth(traces)}, 置信度: ${finalCoordinate.confidence.toFixed(2)}`);

    return {
      result: synthesisTrace.output,
      traces,
      consensus,
      reasoningDepth: this.calculateReasoningDepth(traces),
      confidence: finalCoordinate.confidence,
    };
  }

  /**
   * 初始化状态空间
   */
  private initializeStateSpace(): StateSpaceCoordinate {
    return {
      reasoningDepth: 0,
      confidence: 0.5,
      informationDensity: 0.3,
      complexity: 0.5,
      consensusLevel: 0,
    };
  }

  /**
   * 执行编排阶段
   */
  private async executePhase(
    sessionId: string,
    promptType: PromptType,
    input: string,
    targetExpertise: AgentExpertise,
    currentCoordinate: StateSpaceCoordinate
  ): Promise<ReasoningTrace> {
    // 路由决策
    const routing = this.routeToAgent(input, promptType, targetExpertise, currentCoordinate);
    const agent = this.config.availableAgents.find(a => a.agentId === routing.targetAgent);

    if (!agent) {
      throw new Error(`Agent not found: ${routing.targetAgent}`);
    }

    // 生成提示
    const template = this.selectPromptTemplate(promptType, targetExpertise);
    const prompt = this.generatePrompt(template, { input, context: this.getSessionContext(sessionId) });

    // 模拟执行
    const output = await this.simulateAgentExecution(prompt, agent);

    // 更新状态空间
    const newCoordinate = this.updateStateSpace(currentCoordinate, output, agent);

    const trace: ReasoningTrace = {
      traceId: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      state: this.inferStateFromPhase(promptType),
      coordinate: newCoordinate,
      sourceAgent: agent.agentId,
      promptType,
      input,
      output,
      metadata: {
        routingDecision: routing,
        template: template.templateId,
      },
    };

    this.currentState.set(sessionId, newCoordinate);

    if (this.config.enableDetailedLogging) {
      console.log(`   [${promptType}] ${agent.agentName}: 置信度 ${newCoordinate.confidence.toFixed(2)}`);
    }

    return trace;
  }

  /**
   * 执行推理阶段（多轮）
   */
  private async executeReasoningPhase(
    sessionId: string,
    task: string,
    analysis: string,
    expertise: AgentExpertise,
    startDepth: number
  ): Promise<ReasoningTrace[]> {
    const traces: ReasoningTrace[] = [];
    const maxDepth = Math.min(this.config.maxReasoningDepth, 5);

    for (let depth = startDepth; depth <= maxDepth; depth++) {
      const currentCoordinate = this.currentState.get(sessionId)!;

      // 检查是否达到足够的推理深度
      if (currentCoordinate.reasoningDepth >= this.config.maxReasoningDepth * 0.9) {
        break;
      }

      // 选择代理
      const routing = this.routeToAgent(
        `Reason about: ${task} based on: ${analysis}`,
        PromptType.REASONING,
        expertise,
        currentCoordinate
      );

      const agent = this.config.availableAgents.find(a => a.agentId === routing.targetAgent);
      if (!agent) break;

      // 生成提示和输出
      const template = this.selectPromptTemplate(PromptType.REASONING, expertise);
      const prompt = this.generatePrompt(template, {
        analysis,
        question: task,
        depth: depth.toString(),
      });

      const output = await this.simulateAgentExecution(prompt, agent);

      const trace: ReasoningTrace = {
        traceId: `trace_reasoning_${depth}_${Date.now()}`,
        timestamp: Date.now(),
        state: RAPOReasoningState.REASONING,
        coordinate: this.updateStateSpace(currentCoordinate, output, agent),
        sourceAgent: agent.agentId,
        promptType: PromptType.REASONING,
        input: prompt,
        output,
        metadata: { depth },
      };

      traces.push(trace);
      this.currentState.set(sessionId, trace.coordinate);

      // 检查收敛
      if (trace.coordinate.confidence > 0.9) {
        break;
      }
    }

    return traces;
  }

  /**
   * 路由到代理
   */
  private routeToAgent(
    input: string,
    promptType: PromptType,
    targetExpertise: AgentExpertise,
    currentCoordinate: StateSpaceCoordinate
  ): RoutingDecision {
    // 获取候选代理
    const candidates = this.config.availableAgents.filter(agent => {
      // 检查专长匹配
      const hasExpertise = agent.expertise.some(exp => this.isExpertiseRelevant(exp, promptType));
      // 检查可用性
      const isAvailable = agent.availability > 0.5;
      return hasExpertise && isAvailable;
    });

    if (candidates.length === 0) {
      // 返回第一个可用代理
      return {
        targetAgent: this.config.availableAgents[0].agentId,
        rationale: "No specialized agent available, using default",
        expectedBenefit: 0.5,
        alternatives: [],
      };
    }

    // 根据能力评分排序
    candidates.sort((a, b) => {
      // 专长匹配度优先
      const aMatch = a.expertise.includes(targetExpertise) ? 1 : 0;
      const bMatch = b.expertise.includes(targetExpertise) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;

      // 能力评分次之
      return b.capabilityScore - a.capabilityScore;
    });

    const selected = candidates[0];
    const alternatives = candidates.slice(1, 3).map(a => a.agentId);

    return {
      targetAgent: selected.agentId,
      rationale: `Selected ${selected.agentName} for expertise in ${targetExpertise}`,
      expectedBenefit: selected.capabilityScore * selected.availability,
      alternatives,
    };
  }

  /**
   * 检查专长是否相关
   */
  private isExpertiseRelevant(expertise: AgentExpertise, promptType: PromptType): boolean {
    const relevanceMap: Record<AgentExpertise, PromptType[]> = {
      [AgentExpertise.LOGICAL_REASONING]: [PromptType.ANALYSIS, PromptType.REASONING],
      [AgentExpertise.CRITICAL_ANALYSIS]: [PromptType.VERIFICATION, PromptType.CONSENSUS],
      [AgentExpertise.SYSTEMS_THINKING]: [PromptType.SYNTHESIS, PromptType.CONSENSUS],
      [AgentExpertise.CREATIVE_THINKING]: [PromptType.REASONING, PromptType.SYNTHESIS],
      [AgentExpertise.KNOWLEDGE_RETRIEVAL]: [PromptType.ANALYSIS, PromptType.VERIFICATION],
      [AgentExpertise.FACT_CHECKING]: [PromptType.VERIFICATION],
      [AgentExpertise.MATHEMATICAL]: [PromptType.REASONING],
      [AgentExpertise.LANGUAGE_UNDERSTANDING]: [PromptType.ANALYSIS, PromptType.SYNTHESIS],
    };

    return relevanceMap[expertise]?.includes(promptType) || false;
  }

  /**
   * 选择提示模板
   */
  private selectPromptTemplate(promptType: PromptType, expertise: AgentExpertise): PromptTemplate {
    const candidates = this.config.promptTemplates.filter(
      t => t.type === promptType && t.targetExpertise === expertise
    );

    return candidates[0] || this.config.promptTemplates[0];
  }

  /**
   * 生成提示
   */
  private generatePrompt(template: PromptTemplate, params: Record<string, string>): string {
    let prompt = template.template;
    for (const param of template.parameters) {
      const value = params[param] || `{${param}}`;
      prompt = prompt.replace(`{${param}}`, value);
    }
    return prompt;
  }

  /**
   * 模拟代理执行
   */
  private async simulateAgentExecution(prompt: string, agent: AgentConfig): Promise<string> {
    // 模拟处理延迟
    await this.delay(10 + Math.random() * 20);

    // 根据代理专长生成模拟输出
    const outputs: Record<AgentExpertise, string> = {
      [AgentExpertise.LOGICAL_REASONING]: `${agent.agentName}: Analyzed the problem systematically. Key observations: task complexity is moderate, requires step-by-step decomposition. Suggested approach: break into sub-problems and solve sequentially.`,
      [AgentExpertise.KNOWLEDGE_RETRIEVAL]: `${agent.agentName}: Retrieved relevant information from knowledge base. Found 3 key concepts and 2 relevant examples that can guide the solution.`,
      [AgentExpertise.CREATIVE_THINKING]: `${agent.agentName}: Generated alternative approach considering unconventional angles. Suggested exploring metaphorical reasoning and cross-domain analogies.`,
      [AgentExpertise.CRITICAL_ANALYSIS]: `${agent.agentName}: Evaluated the reasoning chain for potential fallacies. Identified 2 areas requiring additional evidence and 1 assumption that needs verification.`,
      [AgentExpertise.MATHEMATICAL]: `${agent.agentName}: Performed quantitative analysis. Calculated probability distributions and confidence intervals for key variables.`,
      [AgentExpertise.LANGUAGE_UNDERSTANDING]: `${agent.agentName}: Analyzed semantic structure and identified key concepts. Extracted main entities and relationships from the input.`,
      [AgentExpertise.FACT_CHECKING]: `${agent.agentName}: Verified factual claims against available knowledge sources. All claims appear verifiable with proper citation.`,
      [AgentExpertise.SYSTEMS_THINKING]: `${agent.agentName}: Analyzed system-level interactions and feedback loops. Identified 2 leverage points for intervention and potential second-order effects.`,
    };

    const defaultOutput = `${agent.agentName}: Processed the input and generated analysis based on expertise in ${agent.expertise[0]}.`;

    return outputs[agent.expertise[0]] || defaultOutput;
  }

  /**
   * 更新状态空间
   */
  private updateStateSpace(
    current: StateSpaceCoordinate,
    output: string,
    agent: AgentConfig
  ): StateSpaceCoordinate {
    return {
      reasoningDepth: Math.min(1, current.reasoningDepth + 0.15),
      confidence: Math.min(1, current.confidence + (agent.capabilityScore * 0.1)),
      informationDensity: Math.min(1, current.informationDensity + (output.length > 100 ? 0.1 : 0.05)),
      complexity: Math.min(1, current.complexity + (output.split(',').length > 3 ? 0.05 : 0)),
      consensusLevel: current.consensusLevel,
    };
  }

  /**
   * 从阶段推断状态
   */
  private inferStateFromPhase(promptType: PromptType): RAPOReasoningState {
    const stateMap: Record<PromptType, RAPOReasoningState> = {
      [PromptType.ANALYSIS]: RAPOReasoningState.ANALYZING,
      [PromptType.REASONING]: RAPOReasoningState.REASONING,
      [PromptType.VERIFICATION]: RAPOReasoningState.VERIFYING,
      [PromptType.SYNTHESIS]: RAPOReasoningState.SYNTHESIZING,
      [PromptType.CONSENSUS]: RAPOReasoningState.COMPLETED,
    };
    return stateMap[promptType] || RAPOReasoningState.INITIALIZING;
  }

  /**
   * 达成共识
   */
  private async achieveConsensus(
    sessionId: string,
    traces: ReasoningTrace[],
    currentCoordinate: StateSpaceCoordinate
  ): Promise<RAPOConsensusResult> {
    const participants = Array.from(new Set(traces.map(t => t.sourceAgent)));

    if (participants.length <= 1) {
      return {
        achieved: true,
        content: traces[0]?.output || "",
        participants,
        agreementLevel: 1,
        iterations: 0,
      };
    }

    // 模拟共识迭代
    let agreementLevel = 0.5;
    let iterations = 0;
    const maxIterations = 5;

    while (agreementLevel < this.config.minConsensusThreshold && iterations < maxIterations) {
      // 模拟一轮共识达成
      agreementLevel += 0.1 + Math.random() * 0.15;
      iterations++;

      await this.delay(5);
    }

    return {
      achieved: agreementLevel >= this.config.minConsensusThreshold,
      content: this.synthesizeOutputs(traces),
      participants,
      agreementLevel: Math.min(1, agreementLevel),
      iterations,
    };
  }

  /**
   * 综合输出
   */
  private synthesizeOutputs(traces: ReasoningTrace[]): string {
    const outputs = traces.map(t => t.output);
    if (outputs.length === 0) return "";

    // 简单综合：合并所有输出
    return `RAPO Synthesis:\n\n${outputs.join('\n\n---\n\n')}\n\nConfidence: ${this.calculateAverageConfidence(traces).toFixed(2)}`;
  }

  /**
   * 格式化观点
   */
  private formatViewpoints(traces: ReasoningTrace[]): string {
    return traces.map(t => `[${t.sourceAgent}]: ${t.output}`).join('\n\n');
  }

  /**
   * 计算推理深度
   */
  private calculateReasoningDepth(traces: ReasoningTrace[]): number {
    return traces.filter(t => t.state === RAPOReasoningState.REASONING).length;
  }

  /**
   * 计算平均置信度
   */
  private calculateAverageConfidence(traces: ReasoningTrace[]): number {
    if (traces.length === 0) return 0.5;
    const sum = traces.reduce((acc, t) => acc + t.coordinate.confidence, 0);
    return sum / traces.length;
  }

  /**
   * 获取会话上下文
   */
  private getSessionContext(sessionId: string): string {
    const traces = this.reasoningHistory.get(sessionId) || [];
    if (traces.length === 0) return "";

    return `Previous reasoning: ${traces.slice(-2).map(t => t.sourceAgent).join(', ')}`;
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取推理历史
   */
  getReasoningHistory(): ReasoningTrace[][] {
    return Array.from(this.reasoningHistory.values());
  }

  /**
   * 获取当前状态
   */
  getCurrentState(sessionId: string): StateSpaceCoordinate | undefined {
    return this.currentState.get(sessionId);
  }

  /**
   * 重置状态
   */
  resetState(sessionId: string): void {
    this.currentState.delete(sessionId);
    this.reasoningHistory.delete(sessionId);
  }
}

/**
 * 工厂函数：创建 RAPO 编排器
 */
export function createRAPOOrchestrator(config?: RAPOConfig): RAPOOrchestrator {
  return new RAPOOrchestrator(config);
}

/**
 * 任务模板
 */
export const RAPOTemplates = {
  /** 复杂推理任务 */
  complexReasoning: {
    description: "需要深度推理的复杂任务",
    recommendedConfig: {
      maxReasoningDepth: 7,
      minConsensusThreshold: 0.8,
      expertise: AgentExpertise.LOGICAL_REASONING,
    },
  },

  /** 快速分析任务 */
  quickAnalysis: {
    description: "快速分析和响应",
    recommendedConfig: {
      maxReasoningDepth: 3,
      minConsensusThreshold: 0.6,
      expertise: AgentExpertise.KNOWLEDGE_RETRIEVAL,
    },
  },

  /** 创造性任务 */
  creativeTask: {
    description: "需要创造性思维的任务",
    recommendedConfig: {
      maxReasoningDepth: 5,
      minConsensusThreshold: 0.7,
      expertise: AgentExpertise.CREATIVE_THINKING,
    },
  },

  /** 验证任务 */
  verification: {
    description: "逻辑验证和事实检查",
    recommendedConfig: {
      maxReasoningDepth: 4,
      minConsensusThreshold: 0.85,
      expertise: AgentExpertise.CRITICAL_ANALYSIS,
    },
  },
};
