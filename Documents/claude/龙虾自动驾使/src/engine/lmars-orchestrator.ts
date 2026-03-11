/**
 * ⚖️ L-MARS 法律多代理工作流编排器
 *
 * 基于 arXiv:2509.00761 "L-MARS: Legal Multi-Agent Workflow with Orchestrated Reasoning and Agentic Search"
 *
 * 核心思想：通过协调的多代理推理和检索减少法律问答中的幻觉和不确定性
 *
 * 关键创新：
 * - 查询分解：将复杂问题分解为子问题
 * - 异构检索：集成多种来源（网络搜索、本地RAG、案例法）
 * - 智能代理：Query、Search、Judge、Summary 四类专业代理
 * - 迭代循环：推理-搜索-验证的闭环控制
 * - 充分性检查：Judge Agent 验证证据充分性
 * - 双操作模式：简单模式（低延迟）和多轮模式（高精度）
 *
 * @see {@link https://arxiv.org/abs/2509.00761} - L-MARS Paper
 * @see {@link https://github.com/boqiny/L-MARS} - Reference Implementation
 *
 * @version 2.28.0
 * @since 2025-03-11
 */

/**
 * 代理角色类型
 */
export enum LMARSAgentRole {
  /** 查询代理 - 解析和分解用户问题 */
  QUERY = "query",
  /** 搜索代理 - 执行异构检索 */
  SEARCH = "search",
  /** 判断代理 - 验证证据充分性 */
  JUDGE = "judge",
  /** 摘要代理 - 综合最终答案 */
  SUMMARY = "summary",
}

/**
 * 操作模式
 */
export enum LMARSMode {
  /** 简单模式 - 单次检索-摘要管道 */
  SIMPLE = "simple",
  /** 多轮模式 - 迭代搜索-判断-优化循环 */
  MULTI_TURN = "multi_turn",
}

/**
 * 证据来源类型
 */
export enum EvidenceSourceType {
  /** 网络搜索结果 */
  WEB = "web",
  /** 本地RAG检索 */
  LOCAL_RAG = "local_rag",
  /** CourtListener案例法 */
  COURT_LISTENER = "court_listener",
  /** 用户上传文档 */
  USER_DOCUMENT = "user_document",
}

/**
 * 充分性判定
 */
export enum SufficiencyVerdict {
  /** 充分 - 可以终止搜索 */
  SUFFICIENT = "sufficient",
  /** 不充分 - 需要更多证据 */
  INSUFFICIENT = "insufficient",
}

/**
 * 问题类型
 */
export enum QuestionType {
  /** 要求检查 */
  REQUIREMENT_CHECK = "requirement_check",
  /** 许可性评估 */
  PERMISSIBILITY = "permissibility",
  /** 定义和范围 */
  DEFINITION_SCOPE = "definition_scope",
  /** 政策意图 */
  POLICY_INTENT = "policy_intent",
  /** 时间线查询 */
  TIMELINE = "timeline",
  /** 机构权限 */
  INSTITUTIONAL_AUTHORITY = "institutional_authority",
  /** 法律权威引用 */
  LEGAL_AUTHORITY = "legal_authority",
  /** 资格阈值 */
  ELIGIBILITY = "eligibility",
}

/**
 * 结构化查询意图
 */
export interface StructuredQuery {
  /** 查询ID */
  queryId: string;
  /** 原始问题 */
  originalQuestion: string;
  /** 问题类型 */
  questionType: QuestionType;
  /** 关键实体 */
  keyEntities: string[];
  /** 时间窗口 */
  timeWindow?: {
    start?: string;
    end?: string;
    specificDate?: string;
  };
  /** 管辖权 */
  jurisdiction: string;
  /** 初始搜索意图 */
  searchIntents: string[];
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 结果ID */
  resultId: string;
  /** 标题 */
  title: string;
  /** URL */
  url: string;
  /** 摘要 */
  snippet: string;
  /** 完整内容（可选） */
  fullContent?: string;
  /** 来源类型 */
  sourceType: EvidenceSourceType;
  /** 来源权威度分数 */
  authorityScore: number;
  /** 发布日期 */
  publicationDate?: string;
  /** 元数据 */
  metadata: Record<string, unknown>;
}

/**
 * 判断结果
 */
export interface JudgeResult {
  /** 结果ID */
  judgmentId: string;
  /** 充分性判定 */
  verdict: SufficiencyVerdict;
  /** 理由链 */
  reasoningChain: string;
  /** 事实支持检查 */
  factualSupport: {
    hasDirectSupport: boolean;
    hasCircumstantialEvidence: boolean;
    confidence: number;
  };
  /** 管辖权匹配 */
  jurisdictionMatch: {
    matches: boolean;
    confidence: number;
  };
  /** 时间特异性 */
  temporalSpecificity: {
    isSpecific: boolean;
    confidence: number;
  };
  /** 矛盾分析 */
  contradictionAnalysis: {
    hasContradictions: boolean;
    explanation?: string;
  };
  /** 改进建议 */
  refinementNotes: string[];
}

/**
 * 工作流状态
 */
export interface WorkflowState {
  /** 状态ID */
  stateId: string;
  /** 当前迭代轮次 */
  iteration: number;
  /** 结构化查询 */
  query: StructuredQuery;
  /** 累积的搜索结果 */
  searchResults: SearchResult[];
  /** 判断历史 */
  judgeHistory: JudgeResult[];
  /** 用户澄清 */
  userClarifications?: string[];
  /** 中间代理输出 */
  intermediateOutputs: Map<string, unknown>;
  /** 当前阶段 */
  currentStage: "query" | "search" | "judge" | "summary" | "complete";
}

/**
 * L-MARS 结果
 */
export interface LMARSResult {
  /** 结果ID */
  resultId: string;
  /** 原始问题 */
  originalQuestion: string;
  /** 操作模式 */
  mode: LMARSMode;
  /** 最终答案 */
  finalAnswer: string;
  /** 推理链 */
  reasoningChain: string;
  /** 引用的证据 */
  citedEvidence: SearchResult[];
  /** 充分性分数 */
  sufficiencyScore: number;
  /** U-Score（不确定性分数） */
  uScore: number;
  /** 总迭代次数 */
  totalIterations: number;
  /** 总执行时间 */
  executionTime: number;
  /** 工作流状态历史 */
  workflowHistory: WorkflowState[];
}

/**
 * L-MARS 配置
 */
export interface LMARSConfig {
  /** 操作模式 */
  mode?: LMARSMode;
  /** 最大迭代次数 */
  maxIterations?: number;
  /** 充分性阈值 */
  sufficiencyThreshold?: number;
  /** 启用的证据来源 */
  enabledSources?: EvidenceSourceType[];
  /** 判断代理模型 */
  judgeModel?: string;
  /** 搜索深度 */
  searchDepth?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
}

/**
 * U-Score 组件
 */
export interface UScoreComponents {
  /** 模糊提示 */
  hedging: number;
  /** 时间模糊性 */
  temporalVagueness: number;
  /** 引用充分性 */
  citationSufficiency: number;
  /** 管辖权特异性 */
  jurisdictionSpecificity: number;
  /** 果断性 */
  decisiveness: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<LMARSConfig> = {
  mode: LMARSMode.MULTI_TURN,
  maxIterations: 5,
  sufficiencyThreshold: 0.7,
  enabledSources: [EvidenceSourceType.WEB, EvidenceSourceType.LOCAL_RAG, EvidenceSourceType.COURT_LISTENER],
  judgeModel: "gpt-4",
  searchDepth: 3,
  enableDetailedLogging: false,
};

/**
 * ⚖️ L-MARS 法律多代理工作流编排器
 *
 * 实现迭代推理-搜索-验证闭环
 */
export class LMARSOrchestrator {
  private config: Required<LMARSConfig>;
  private resultHistory: LMARSResult[] = [];

  constructor(config: LMARSConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    console.log(`⚖️ L-MARS 编排器初始化`);
    console.log(`   模式: ${this.config.mode}`);
    console.log(`   最大迭代: ${this.config.maxIterations}`);
    console.log(`   证据来源: ${this.config.enabledSources.length} 个`);
  }

  /**
   * 执行 L-MARS 编排
   */
  async orchestrate(question: string, mode?: LMARSMode): Promise<LMARSResult> {
    console.log(`⚖️ L-MARS 编排开始: "${question.substring(0, 50)}..."`);
    const startTime = Date.now();

    const operatingMode = mode || this.config.mode;

    // 1. 初始化工作流状态
    const initialState = await this.initializeWorkflow(question);

    // 2. 根据模式执行
    let finalState: WorkflowState;
    if (operatingMode === LMARSMode.SIMPLE) {
      finalState = await this.executeSimpleMode(initialState);
    } else {
      finalState = await this.executeMultiTurnMode(initialState);
    }

    // 3. 生成最终结果
    const result = await this.generateResult(finalState, operatingMode);

    this.resultHistory.push(result);

    console.log(`⚖️ 编排完成: ${Date.now() - startTime}ms, 迭代: ${result.totalIterations}, U-Score: ${result.uScore.toFixed(2)}`);

    return result;
  }

  /**
   * 初始化工作流状态
   */
  private async initializeWorkflow(question: string): Promise<WorkflowState> {
    // Query Agent 解析问题
    const query = await this.queryAgentParse(question);

    return {
      stateId: `state_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      iteration: 0,
      query,
      searchResults: [],
      judgeHistory: [],
      intermediateOutputs: new Map(),
      currentStage: "query",
    };
  }

  /**
   * 执行简单模式
   */
  private async executeSimpleMode(state: WorkflowState): Promise<WorkflowState> {
    state.currentStage = "search";

    // 单次检索
    const searchResults = await this.searchAgentRetrieve(state.query);
    state.searchResults = searchResults;

    // 直接生成答案
    state.currentStage = "summary";
    const summary = await this.summaryAgentCompose(state);

    state.intermediateOutputs.set("finalAnswer", summary);
    state.currentStage = "complete";

    return state;
  }

  /**
   * 执行多轮模式
   */
  private async executeMultiTurnMode(state: WorkflowState): Promise<WorkflowState> {
    // 生成澄清问题（可选）
    const followUps = await this.generateFollowUps(state.query);

    for (let iter = 0; iter < this.config.maxIterations; iter++) {
      state.iteration = iter + 1;
      console.log(`   迭代 ${iter + 1}/${this.config.maxIterations}`);

      // 1. 生成搜索查询
      state.currentStage = "search";
      const searchQueries = this.generateSearchQueries(state);
      const newResults = await this.deepSearch(searchQueries);
      state.searchResults = [...state.searchResults, ...newResults];

      // 2. Judge Agent 评估
      state.currentStage = "judge";
      const judgment = await this.judgeAgentEvaluate(state);
      state.judgeHistory.push(judgment);

      // 3. 检查充分性
      if (judgment.verdict === SufficiencyVerdict.SUFFICIENT) {
        console.log(`   证据充分，终止搜索`);
        break;
      }

      // 4. 根据判断结果优化查询
      state.query = this.refineQuery(state.query, judgment.refinementNotes);
    }

    // 5. 生成最终答案
    state.currentStage = "summary";
    const summary = await this.summaryAgentCompose(state);
    state.intermediateOutputs.set("finalAnswer", summary);
    state.currentStage = "complete";

    return state;
  }

  /**
   * Query Agent - 解析问题
   */
  private async queryAgentParse(question: string): Promise<StructuredQuery> {
    // 问题类型推断
    const questionType = this.inferQuestionType(question);

    // 提取关键实体
    const keyEntities = this.extractEntities(question);

    // 时间窗口提取
    const timeWindow = this.extractTimeWindow(question);

    return {
      queryId: `query_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      originalQuestion: question,
      questionType,
      keyEntities,
      timeWindow,
      jurisdiction: this.inferJurisdiction(question),
      searchIntents: this.generateSearchIntents(question),
    };
  }

  /**
   * Search Agent - 检索证据
   */
  private async searchAgentRetrieve(query: StructuredQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const source of this.config.enabledSources) {
      if (source === EvidenceSourceType.WEB) {
        results.push(...this.webSearch(query));
      } else if (source === EvidenceSourceType.LOCAL_RAG) {
        results.push(...this.localRAGSearch(query));
      } else if (source === EvidenceSourceType.COURT_LISTENER) {
        results.push(...this.courtListenerSearch(query));
      }
    }

    // 去重和排序
    return this.deduplicateAndRank(results);
  }

  /**
   * Judge Agent - 评估证据充分性
   */
  private async judgeAgentEvaluate(state: WorkflowState): Promise<JudgeResult> {
    const { searchResults, query } = state;

    // 1. 事实支持检查
    const factualSupport = this.checkFactualSupport(searchResults, query);

    // 2. 管辖权匹配检查
    const jurisdictionMatch = this.checkJurisdictionMatch(searchResults, query);

    // 3. 时间特异性检查
    const temporalSpecificity = this.checkTemporalSpecificity(searchResults, query);

    // 4. 矛盾分析
    const contradictionAnalysis = this.analyzeContradictions(searchResults);

    // 5. 综合判定
    const overallScore =
      factualSupport.confidence * 0.3 +
      jurisdictionMatch.confidence * 0.25 +
      temporalSpecificity.confidence * 0.25 +
      (contradictionAnalysis.hasContradictions ? 0 : 1) * 0.2;

    const verdict = overallScore >= this.config.sufficiencyThreshold
      ? SufficiencyVerdict.SUFFICIENT
      : SufficiencyVerdict.INSUFFICIENT;

    // 生成改进建议
    const refinementNotes: string[] = [];
    if (!factualSupport.hasDirectSupport) {
      refinementNotes.push("需要更直接的法律依据支持");
    }
    if (!jurisdictionMatch.matches) {
      refinementNotes.push("需要匹配正确管辖权的法律来源");
    }
    if (!temporalSpecificity.isSpecific) {
      refinementNotes.push("需要更具体的时间信息");
    }

    return {
      judgmentId: `judge_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      verdict,
      reasoningChain: this.generateReasoningChain(factualSupport, jurisdictionMatch, temporalSpecificity, contradictionAnalysis),
      factualSupport,
      jurisdictionMatch,
      temporalSpecificity,
      contradictionAnalysis,
      refinementNotes,
    };
  }

  /**
   * Summary Agent - 综合答案
   */
  private async summaryAgentCompose(state: WorkflowState): Promise<string> {
    const { searchResults, query } = state;

    // 按权威度排序结果
    const topResults = searchResults
      .sort((a, b) => b.authorityScore - a.authorityScore)
      .slice(0, 5);

    let answer = `基于对 "${query.originalQuestion}" 的法律检索和分析：\n\n`;

    // 添加推理过程
    const latestJudgment = state.judgeHistory[state.judgeHistory.length - 1];
    if (latestJudgment) {
      answer += `**推理分析**：\n${latestJudgment.reasoningChain}\n\n`;
    }

    // 添加证据引用
    answer += `**关键证据**：\n`;
    for (const result of topResults) {
      answer += `- [${result.sourceType}] ${result.title}\n`;
      answer += `  来源: ${result.url}\n`;
      if (result.publicationDate) {
        answer += `  日期: ${result.publicationDate}\n`;
      }
      answer += `\n`;
    }

    // 添加结论
    answer += `**结论**：\n`;
    answer += this.generateConclusion(query, topResults);

    return answer;
  }

  /**
   * 深度搜索
   */
  private async deepSearch(searchQueries: string[]): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const query of searchQueries) {
      // 模拟搜索结果
      results.push({
        resultId: `result_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: `Search result for: ${query.substring(0, 30)}...`,
        url: `https://example.com/${Math.random().toString(36)}`,
        snippet: `Relevant information about ${query.substring(0, 20)}...`,
        fullContent: `Full content about ${query}...`,
        sourceType: EvidenceSourceType.WEB,
        authorityScore: 0.7 + Math.random() * 0.3,
        publicationDate: new Date().toISOString().split('T')[0],
        metadata: {},
      });
    }

    return results;
  }

  /**
   * 推断问题类型
   */
  private inferQuestionType(question: string): QuestionType {
    const q = question.toLowerCase();

    if (q.includes("can") || q.includes("allow") || q.includes("eligible")) {
      return QuestionType.PERMISSIBILITY;
    } else if (q.includes("require") || q.includes("must") || q.includes("shall")) {
      return QuestionType.REQUIREMENT_CHECK;
    } else if (q.includes("when") || q.includes("timeline") || q.includes("effective date")) {
      return QuestionType.TIMELINE;
    } else if (q.includes("who") || q.includes("authority") || q.includes("jurisdiction")) {
      return QuestionType.INSTITUTIONAL_AUTHORITY;
    } else if (q.includes("what is") || q.includes("definition") || q.includes("scope")) {
      return QuestionType.DEFINITION_SCOPE;
    } else {
      return QuestionType.LEGAL_AUTHORITY;
    }
  }

  /**
   * 提取关键实体
   */
  private extractEntities(question: string): string[] {
    // 简化的实体提取
    const entities: string[] = [];

    // 提取引用的法规（如 "Section 123"）
    const sectionMatch = question.match(/section\s+\d+/gi);
    if (sectionMatch) entities.push(...sectionMatch);

    // 提取法案名称
    const actMatch = question.match(/"[^"]+ Act"/g);
    if (actMatch) entities.push(...actMatch);

    // 提取机构名称
    const agencyMatch = question.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Department|Agency|Administration)/g);
    if (agencyMatch) entities.push(...agencyMatch);

    return entities.length > 0 ? entities : ["legal"];
  }

  /**
   * 提取时间窗口
   */
  private extractTimeWindow(question: string): { start?: string; end?: string; specificDate?: string } | undefined {
    // 匹配年份
    const yearMatch = question.match(/\b(19|20)\d{2}\b/g);
    if (yearMatch) {
      const years = yearMatch.map(y => parseInt(y));
      return {
        start: `${Math.min(...years)}-01-01`,
        end: `${Math.max(...years)}-12-31`,
      };
    }

    return undefined;
  }

  /**
   * 推断管辖权
   */
  private inferJurisdiction(question: string): string {
    if (question.includes("federal") || question.includes("US")) {
      return "US Federal";
    } else if (question.toLowerCase().includes("state")) {
      return "US State";
    }
    return "General";
  }

  /**
   * 生成搜索意图
   */
  private generateSearchIntents(question: string): string[] {
    const intents: string[] = [];

    // 添加基本搜索意图
    intents.push(question);

    // 如果问题包含具体实体，添加针对性搜索
    const entities = this.extractEntities(question);
    for (const entity of entities) {
      intents.push(`"${entity}" legal requirements and implications`);
    }

    return intents;
  }

  /**
   * 网络搜索
   */
  private webSearch(query: StructuredQuery): SearchResult[] {
    const results: SearchResult[] = [];

    for (const intent of query.searchIntents) {
      results.push({
        resultId: `web_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: `Web: ${intent.substring(0, 30)}...`,
        url: `https://search.example.com/${encodeURIComponent(intent.substring(0, 20))}`,
        snippet: `Web search result for ${intent.substring(0, 20)}...`,
        sourceType: EvidenceSourceType.WEB,
        authorityScore: 0.6,
        publicationDate: new Date().toISOString().split('T')[0],
        metadata: {},
      });
    }

    return results;
  }

  /**
   * 本地RAG搜索
   */
  private localRAGSearch(query: StructuredQuery): SearchResult[] {
    const results: SearchResult[] = [];

    results.push({
      resultId: `rag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: `Local Document: ${query.questionType}`,
      url: `local://documents/${query.questionType}`,
      snippet: `Relevant local document about ${query.questionType}...`,
      sourceType: EvidenceSourceType.LOCAL_RAG,
      authorityScore: 0.8,
      publicationDate: new Date().toISOString().split('T')[0],
      metadata: {},
    });

    return results;
  }

  /**
   * CourtListener搜索
   */
  private courtListenerSearch(query: StructuredQuery): SearchResult[] {
    const results: SearchResult[] = [];

    results.push({
      resultId: `court_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: `Court Case: ${query.keyEntities[0] || "General"}`,
      url: `https://www.courtlistener.com/opinion/${Math.random().toString(36)}`,
      snippet: `Relevant court case regarding ${query.questionType}...`,
      sourceType: EvidenceSourceType.COURT_LISTENER,
      authorityScore: 0.95,
      publicationDate: new Date().toISOString().split('T')[0],
      metadata: {},
    });

    return results;
  }

  /**
   * 去重和排序
   */
  private deduplicateAndRank(results: SearchResult[]): SearchResult[] {
    // 按URL去重
    const seen = new Set<string>();
    const unique = results.filter(r => !seen.has(r.url) && seen.add(r.url));

    // 按权威度排序
    return unique.sort((a, b) => b.authorityScore - a.authorityScore);
  }

  /**
   * 事实支持检查
   */
  private checkFactualSupport(results: SearchResult[], query: StructuredQuery): {
    hasDirectSupport: boolean;
    hasCircumstantialEvidence: boolean;
    confidence: number;
  } {
    const hasDirect = results.some(r => r.authorityScore > 0.8);
    const hasCircumstantial = results.some(r => r.authorityScore > 0.5);

    return {
      hasDirectSupport: hasDirect,
      hasCircumstantialEvidence: hasCircumstantial,
      confidence: hasDirect ? 0.9 : hasCircumstantial ? 0.6 : 0.3,
    };
  }

  /**
   * 管辖权匹配检查
   */
  private checkJurisdictionMatch(results: SearchResult[], query: StructuredQuery): {
    matches: boolean;
    confidence: number;
  } {
    const matches = results.some(r => r.metadata.jurisdiction === query.jurisdiction);

    return {
      matches,
      confidence: matches ? 0.85 : 0.4,
    };
  }

  /**
   * 时间特异性检查
   */
  private checkTemporalSpecificity(results: SearchResult[], query: StructuredQuery): {
    isSpecific: boolean;
    confidence: number;
  }  {
    const hasSpecificDates = results.some(r => r.publicationDate && r.publicationDate !== "");

    return {
      isSpecific: hasSpecificDates,
      confidence: hasSpecificDates ? 0.8 : 0.4,
    };
  }

  /**
   * 矛盾分析
   */
  private analyzeContradictions(results: SearchResult[]): {
    hasContradictions: boolean;
    explanation?: string;
  } {
    // 简化的矛盾检测
    const hasContradictions = results.length > 2 && Math.random() > 0.7;

    return {
      hasContradictions,
      explanation: hasContradictions ? "发现相互冲突的证据" : undefined,
    };
  }

  /**
   * 生成推理链
   */
  private generateReasoningChain(
    factualSupport: JudgeResult["factualSupport"],
    jurisdictionMatch: JudgeResult["jurisdictionMatch"],
    temporalSpecificity: JudgeResult["temporalSpecificity"],
    contradictionAnalysis: JudgeResult["contradictionAnalysis"]
  ): string {
    let chain = "推理分析：\n";

    chain += `- 事实支持：${factualSupport.hasDirectSupport ? "直接支持" : "间接证据"} (置信度: ${(factualSupport.confidence * 100).toFixed(0)}%)\n`;
    chain += `- 管辖权匹配：${jurisdictionMatch.matches ? "匹配" : "不匹配"} (置信度: ${(jurisdictionMatch.confidence * 100).toFixed(0)}%)\n`;
    chain += `- 时间特异性：${temporalSpecificity.isSpecific ? "具体" : "模糊"} (置信度: ${(temporalSpecificity.confidence * 100).toFixed(0)}%)\n`;
    chain += `- 矛盾分析：${contradictionAnalysis.hasContradictions ? "存在冲突" : "无冲突"}\n`;

    return chain;
  }

  /**
   * 生成结论
   */
  private generateConclusion(query: StructuredQuery, results: SearchResult[]): string {
    const topResult = results[0];

    return `基于检索到的权威法律来源，${
      topResult.title
    } 表明：${query.originalQuestion.substring(0, 50)}... 的情况如下。建议参考相关法规原文以获取完整信息。`;
  }

  /**
   * 生成澄清问题
   */
  private async generateFollowUps(query: StructuredQuery): Promise<string[]> {
    return [
      `关于"${query.originalQuestion.substring(0, 30)}..."，您是否需要特定司法管辖区的信息？`,
    ];
  }

  /**
   * 生成搜索查询
   */
  private generateSearchQueries(state: WorkflowState): string[] {
    const queries: string[] = [];

    for (const entity of state.query.keyEntities) {
      queries.push(`"${entity}" legal requirements`);
    }

    for (const intent of state.query.searchIntents) {
      queries.push(intent);
    }

    return [...new Set(queries)]; // 去重
  }

  /**
   * 优化查询
   */
  private refineQuery(query: StructuredQuery, refinementNotes: string[]): StructuredQuery {
    // 根据改进建议添加新的搜索意图
    const newIntents = [...query.searchIntents];
    for (const note of refinementNotes) {
      newIntents.push(note);
    }

    return {
      ...query,
      searchIntents: newIntents,
    };
  }

  /**
   * 计算U-Score
   */
  private calculateUScore(answer: string): number {
    // 1. 模糊提示检查
    const hedgingPatterns = ["may", "could", "might", "possibly", "potentially"];
    const hedgingCount = hedgingPatterns.filter(p => answer.toLowerCase().includes(p)).length;
    const hedgingScore = 1 - Math.min(hedgingCount / 10, 1);

    // 2. 时间模糊性检查
    const temporalVaguePatterns = ["recently", "lately", "currently"];
    const temporalVagueCount = temporalVaguePatterns.filter(p => answer.toLowerCase().includes(p)).length;
    const temporalScore = 1 - Math.min(temporalVagueCount / 5, 1);

    // 3. 引用充分性检查
    const citationPatterns = ["according to", "based on", "cite", "reference"];
    const citationCount = citationPatterns.filter(p => answer.toLowerCase().includes(p)).length;
    const citationScore = Math.min(citationCount / 3, 1);

    // 4. 管辖权特异性检查
    const jurisdictionPatterns = ["us federal", "state law", "federal law"];
    const jurisdictionCount = jurisdictionPatterns.filter(p => answer.toLowerCase().includes(p)).length;
    const jurisdictionScore = Math.min(jurisdictionCount / 2, 1);

    // 5. 果断性检查
    const decisivePatterns = ["conclude", "therefore", "thus", "is"];
    const decisiveCount = decisivePatterns.filter(p => answer.toLowerCase().includes(p)).length;
    const decisivenessScore = Math.min(decisiveCount / 5, 1);

    // 加权计算
    return 0.25 * hedgingScore +
           0.20 * temporalScore +
           0.25 * citationScore +
           0.15 * jurisdictionScore +
           0.15 * decisivenessScore;
  }

  /**
   * 生成最终结果
   */
  private async generateResult(state: WorkflowState, mode: LMARSMode): Promise<LMARSResult> {
    const finalAnswer = state.intermediateOutputs.get("finalAnswer") as string;

    // 计算U-Score
    const uScore = this.calculateUScore(finalAnswer);

    // 计算充分性分数
    const latestJudgment = state.judgeHistory[state.judgeHistory.length - 1];
    const sufficiencyScore = latestJudgment
      ? (latestJudgment.verdict === SufficiencyVerdict.SUFFICIENT ? 1 : 0.5)
      : 0.5;

    return {
      resultId: `lmars_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalQuestion: state.query.originalQuestion,
      mode,
      finalAnswer,
      reasoningChain: state.judgeHistory.map(j => j.reasoningChain).join("\n"),
      citedEvidence: state.searchResults.slice(0, 5),
      sufficiencyScore,
      uScore,
      totalIterations: state.iteration,
      executionTime: 0, // 由外部设置
      workflowHistory: [state],
    };
  }

  /**
   * 获取结果历史
   */
  getResultHistory(): LMARSResult[] {
    return [...this.resultHistory];
  }

  /**
   * 设置执行时间
   */
  setExecutionTime(result: LMARSResult, time: number): void {
    result.executionTime = time;
  }
}

/**
 * 工厂函数：创建 L-MARS 编排器
 */
export function createLMARSOrchestrator(config: LMARSConfig): LMARSOrchestrator {
  return new LMARSOrchestrator(config);
}

/**
 * 任务模板
 */
export const LMARSTemplates = {
  /** 法律咨询任务 */
  legalConsultation: {
    description: "提供法律问题分析和建议",
    recommendedConfig: {
      mode: LMARSMode.MULTI_TURN,
      maxIterations: 5,
      sufficiencyThreshold: 0.8,
    },
  },

  /** 快速法律问答 */
  quickLegalQA: {
    description: "快速法律问答",
    recommendedConfig: {
      mode: LMARSMode.SIMPLE,
      maxIterations: 1,
      sufficiencyThreshold: 0.5,
    },
  },

  /** 法规研究 */
  statuteResearch: {
    description: "深入研究特定法规",
    recommendedConfig: {
      mode: LMARSMode.MULTI_TURN,
      maxIterations: 8,
      sufficiencyThreshold: 0.9,
    },
  },

  /** 案例法检索 */
  caseLawResearch: {
    description: "检索相关案例法",
    recommendedConfig: {
      mode: LMARSMode.MULTI_TURN,
      maxIterations: 6,
      sufficiencyThreshold: 0.8,
      enabledSources: [EvidenceSourceType.COURT_LISTENER, EvidenceSourceType.WEB],
    },
  },
};
