/**
 * 🐜 MyAntFarm 多代理决策支持编排器
 *
 * 基于 arXiv:2511.15755 "Multi-Agent LLM Orchestration Achieves Deterministic,
 * High-Quality Decision Support for Incident Response"
 *
 * 核心思想：通过专业化代理分解实现确定性、高质量的决策支持
 *
 * 关键创新：
 * - Decision Quality (DQ): 多维评估指标（有效性、特异性、正确性）
 * - 三代理协作：诊断专家、补救规划者、风险评估者
 * - 顺序组合：输出依赖链确保上下文流转
 * - 零方差：所有 trials 中产生相同质量的输出
 * - 100% 可操作率：多代理 vs 单代理 1.7%
 *
 * @see {@link https://arxiv.org/abs/2511.15755} - MyAntFarm Paper
 * @see {@link https://github.com/Phildram1/myantfarm-ai} - Reference Implementation
 *
 * @version 2.26.0
 * @since 2025-03-11
 */

/**
 * 决策质量维度
 */
export enum DQDimension {
  /** 有效性 - 技术可行性 */
  VALIDITY = "validity",
  /** 特异性 - 具体标识符（版本号、命令） */
  SPECIFICITY = "specificity",
  /** 正确性 - 与已知解决方案对齐 */
  CORRECTNESS = "correctness",
}

/**
 * 代理类型
 */
export enum MyAntFarmAgentType {
  /** 诊断专家 - 分析遥测数据识别根本原因 */
  DIAGNOSIS = "diagnosis",
  /** 补救规划者 - 生成具体补救步骤 */
  REMEDIATION = "remediation",
  /** 风险评估者 - 评估拟议行动的风险 */
  RISK_ASSESSMENT = "risk_assessment",
  /** 协调器 - 聚合代理输出 */
  COORDINATOR = "coordinator",
}

/**
 * 代理状态
 */
export enum MyAntFarmAgentState {
  /** 空闲 */
  IDLE = "idle",
  /** 处理中 */
  PROCESSING = "processing",
  /** 完成 */
  COMPLETED = "completed",
  /** 失败 */
  FAILED = "failed",
}

/**
 * 决策质量分数
 */
export interface DecisionQualityScore {
  /** 分数 ID */
  scoreId: string;
  /** 有效性分数 (0-1) */
  validity: number;
  /** 特异性分数 (0-1) */
  specificity: number;
  /** 正确性分数 (0-1) */
  correctness: number;
  /** 综合决策质量分数 (0-1) */
  dq: number;
  /** 是否可操作 (DQ > 0.5) */
  actionable: boolean;
}

/**
 * 代理输出
 */
export interface AgentOutput {
  /** 输出 ID */
  outputId: string;
  /** 代理类型 */
  agentType: MyAntFarmAgentType;
  /** 原始响应 */
  rawResponse: string;
  /** 结构化内容 */
  structuredContent: Record<string, unknown>;
  /** 置信度 */
  confidence: number;
  /** 生成时间戳 */
  timestamp: number;
  /** 状态 */
  state: MyAntFarmAgentState;
}

/**
 * 诊断结果
 */
export interface DiagnosisResult {
  /** 根本原因 */
  rootCause: string;
  /** 影响范围 */
  impactScope: string[];
  /** 严重程度 */
  severity: "low" | "medium" | "high" | "critical";
  /** 置信度 */
  confidence: number;
}

/**
 * 补救计划
 */
export interface RemediationPlan {
  /** 计划 ID */
  planId: string;
  /** 步骤列表 */
  steps: RemediationStep[];
  /** 预计影响 */
  expectedImpact: string;
  /** 回滚计划 */
  rollbackPlan?: string;
}

/**
 * 补救步骤
 */
export interface RemediationStep {
  /** 步骤序号 */
  order: number;
  /** 描述 */
  description: string;
  /** 具体命令 */
  command?: string;
  /** 目标版本 */
  targetVersion?: string;
  /** 预计时间 */
  estimatedDuration?: number;
  /** 依赖 */
  dependencies?: string[];
}

/**
 * 风险评估
 */
export interface RiskAssessment {
  /** 总体风险等级 */
  overallRisk: "low" | "medium" | "high" | "critical";
  /** 风险列表 */
  risks: IdentifiedRisk[];
  /** 缓解建议 */
  mitigations: string[];
  /** 执行条件 */
  executionConditions?: string[];
}

/**
 * 已识别风险
 */
export interface IdentifiedRisk {
  /** 风险类型 */
  riskType: string;
  /** 描述 */
  description: string;
  /** 可能性 */
  likelihood: "low" | "medium" | "high";
  /** 影响 */
  impact: "low" | "medium" | "high" | "critical";
  /** 缓解措施 */
  mitigation: string;
}

/**
 * 事故简报
 */
export interface IncidentBrief {
  /** 简 ID */
  briefId: string;
  /** 任务描述 */
  taskDescription: string;
  /** 诊断结果 */
  diagnosis: DiagnosisResult;
  /** 补救计划 */
  remediation: RemediationPlan;
  /** 风险评估 */
  riskAssessment: RiskAssessment;
  /** 决策质量分数 */
  dqScore: DecisionQualityScore;
  /** 协调器元数据 */
  coordinatorMetadata: {
    /** 开始时间 */
    startTime: number;
    /** 结束时间 */
    endTime: number;
    /** 总耗时 */
    totalDuration: number;
    /** 代理调用次数 */
    agentCalls: number;
  };
}

/**
 * MyAntFarm 配置
 */
export interface MyAntFarmConfig {
  /** 可用 LLM 模型 */
  availableModels: string[];
  /** 默认模型 */
  defaultModel?: string;
  /** 超时设置 (秒) */
  timeout?: number;
  /** 温度参数 */
  temperature?: number;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 基础真值（用于正确性计算） */
  groundTruth?: string[];
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<Omit<MyAntFarmConfig, 'availableModels'>> = {
  defaultModel: "gpt-4",
  timeout: 300,
  temperature: 0.7,
  maxRetries: 3,
  enableDetailedLogging: false,
  groundTruth: [],
};

/**
 * 默认模型列表
 */
const DEFAULT_MODELS = ["gpt-4", "claude-3", "llama-3", "gemini-pro"] as const;

/**
 * DQ 评分权重
 */
const DQ_WEIGHTS = {
  validity: 0.40,
  specificity: 0.30,
  correctness: 0.30,
} as const;

/**
 * 🐜 MyAntFarm 多代理决策支持编排器
 *
 * 实现确定性、高质量的多代理 LLM 决策支持
 */
export class MyAntFarmOrchestrator {
  private config: Required<MyAntFarmConfig>;
  private briefHistory: Map<string, IncidentBrief> = new Map();

  constructor(config: MyAntFarmConfig) {
    const { availableModels, ...restConfig } = config;
    this.config = {
      ...DEFAULT_CONFIG,
      ...restConfig,
      availableModels: availableModels || [...DEFAULT_MODELS],
    } as Required<MyAntFarmConfig>;

    console.log(`🐜 MyAntFarm 编排器初始化`);
    console.log(`   LLM 模型: ${this.config.availableModels.length} 个`);
  }

  /**
   * 执行 MyAntFarm 推理
   */
  async orchestrate(taskDescription: string): Promise<IncidentBrief> {
    console.log(`🐜 MyAntFarm 推理开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    const briefId = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 阶段 1: 诊断专家分析
    const diagnosisOutput = await this.executeAgent(
      MyAntFarmAgentType.DIAGNOSIS,
      this.createDiagnosisPrompt(taskDescription),
      briefId
    );

    // 阶段 2: 补救规划者基于诊断生成计划
    const remediationOutput = await this.executeAgent(
      MyAntFarmAgentType.REMEDIATION,
      this.createRemediationPrompt(diagnosisOutput.structuredContent.rootCause as string),
      briefId,
      diagnosisOutput
    );

    // 阶段 3: 风险评估者评估计划风险
    const riskOutput = await this.executeAgent(
      MyAntFarmAgentType.RISK_ASSESSMENT,
      this.createRiskAssessmentPrompt(remediationOutput.structuredContent),
      briefId,
      remediationOutput
    );

    // 聚合结果
    const endTime = Date.now();
    const coordinatorMetadata = {
      startTime,
      endTime,
      totalDuration: endTime - startTime,
      agentCalls: 3,
    };

    // 计算 DQ 分数
    const dqScore = this.calculateDecisionQuality(
      diagnosisOutput,
      remediationOutput,
      riskOutput
    );

    // 构建事故简报
    const brief: IncidentBrief = {
      briefId,
      taskDescription,
      diagnosis: this.parseDiagnosis(diagnosisOutput),
      remediation: this.parseRemediation(remediationOutput),
      riskAssessment: this.parseRiskAssessment(riskOutput),
      dqScore,
      coordinatorMetadata,
    };

    this.briefHistory.set(briefId, brief);

    console.log(`🐜 推理完成: ${endTime - startTime}ms, DQ: ${dqScore.dq.toFixed(3)}, 可操作: ${dqScore.actionable ? "是" : "否"}`);

    return brief;
  }

  /**
   * 创建诊断提示词
   */
  private createDiagnosisPrompt(taskDescription: string): string {
    return `You are a diagnostic specialist. Analyze the following incident and identify the root cause:

${taskDescription}

What is the root cause? Provide:
1. Root cause identification
2. Affected components/services
3. Severity assessment
4. Any contributing factors`;
  }

  /**
   * 创建补救提示词
   */
  private createRemediationPrompt(rootCause: string): string {
    return `You are a remediation planner. Given this root cause:

"${rootCause}"

Create step-by-step remediation actions with:
- Specific commands (e.g., kubectl, docker, systemctl)
- Version numbers
- Configuration parameters
- Expected outcomes

Be concrete and actionable. Format as a numbered list.`;
  }

  /**
   * 创建风险评估提示词
   */
  private createRiskAssessmentPrompt(actions: unknown): string {
    return `You are a risk assessor. Evaluate the risks of these proposed actions:

${JSON.stringify(actions, null, 2)}

Context:
- Production environment
- Peak traffic hours
- Previous stable version deployed 48h ago

Assess risks and suggest mitigations. Provide:
1. Overall risk level (low/medium/high/critical)
2. Specific risks identified
3. Mitigation strategies for each risk`;
  }

  /**
   * 执行代理
   */
  private async executeAgent(
    agentType: MyAntFarmAgentType,
    prompt: string,
    briefId: string,
    previousOutput?: AgentOutput
  ): Promise<AgentOutput> {
    const outputId = `${agentType}_${briefId}_${Date.now()}`;

    console.log(`   🤖 执行 ${agentType}...`);

    try {
      // 模拟 LLM 调用
      const startTime = Date.now();
      const response = await this.simulateLLMCall(prompt, agentType);
      const latency = Date.now() - startTime;

      const structuredContent = this.parseResponse(response, agentType);

      return {
        outputId,
        agentType,
        rawResponse: response,
        structuredContent,
        confidence: 0.7 + Math.random() * 0.2,
        timestamp: startTime,
        state: MyAntFarmAgentState.COMPLETED,
      };
    } catch (error) {
      console.error(`   ❌ ${agentType} 失败:`, error);
      return {
        outputId,
        agentType,
        rawResponse: "",
        structuredContent: {},
        confidence: 0,
        timestamp: Date.now(),
        state: MyAntFarmAgentState.FAILED,
      };
    }
  }

  /**
   * 模拟 LLM 调用
   */
  private async simulateLLMCall(prompt: string, agentType: MyAntFarmAgentType): Promise<string> {
    // 模拟网络延迟
    await this.delay(30 + Math.random() * 50);

    // 根据代理类型生成模拟响应
    const responses: Record<MyAntFarmAgentType, string> = {
      [MyAntFarmAgentType.DIAGNOSIS]: `Root Cause Analysis:

Based on the telemetry and logs, I have identified the following:

1. **Primary Issue**: Database connection pool exhaustion due to connection leak in the recently deployed version (v2.4.0).

2. **Contributing Factors**:
   - Connection pool saturation at 85% utilization
   - No connection release in code paths for high-frequency API endpoints
   - Database connections not properly closed in error handling paths

3. **Affected Components**:
   - /api/v1/login endpoint (45% error rate)
   - /api/v1/token/refresh endpoint (similar error pattern)
   - Authentication service overall

4. **Severity**: **HIGH** - Impacting user authentication and session management

5. **Recommendation**: Immediate rollback to v2.3.0 is advised.`,

      [MyAntFarmAgentType.REMEDIATION]: `Remediation Plan:

**Step 1: Immediate Rollback**
Command: \`kubectl rollout undo deployment/auth-service\`
Target Version: v2.3.0
Estimated Duration: 30-45 seconds
Dependencies: None

**Step 2: Verify Rollback**
Command: \`kubectl rollout status deployment/auth-service\`
Expected: "deployment auth-service successfully rolled out"
Verification: Check error rates drop below 1%

**Step 3: Database Connection Pool Configuration**
Command: \`kubectl set env deployment/auth-service DB_MAX_CONNECTIONS=50\`
Reason: Configure explicit maximum to prevent unbounded growth

**Step 4: Update Application Code**
Action: Deploy fix for connection leak in error handlers
Target: Next deployment cycle
Verification: Monitor connection pool utilization stays < 70%

**Step 5: Monitoring and Validation**
Command: \`kubectl logs -f deployment/auth-service --tail=100 | grep -i "connection"\`
Duration: Monitor for 5-10 minutes post-rollback
Expected: Connection errors eliminated`,

      [MyAntFarmAgentType.RISK_ASSESSMENT]: `Risk Assessment:

**Overall Risk Level**: **MEDIUM**

**Specific Risks**:

1. **Service Disruption Risk** (HIGH likelihood, HIGH impact)
   - Description: Rollback may cause brief service interruption (30-60s)
   - Mitigation: Execute during off-peak hours if possible
   - Alternative: Gradual rollout of fixed version alongside rollback

2. **Configuration Drift Risk** (LOW likelihood, MEDIUM impact)
   - Description: Manual DB config changes may not persist across deployments
   - Mitigation: Add configuration to ConfigMap/Secrets
   - Validation: Review deployment manifests for DB settings

3. **Rollback Failure Risk** (LOW likelihood, HIGH impact)
   - Description: Previous version (v2.3.0) may have unknown issues
   - Mitigation: Have manual rollback procedure ready
   - Validation: Pre-test rollback in staging environment

4. **Connection Pool Configuration Risk** (MEDIUM likelihood, LOW impact)
   - Description: Setting fixed max may cause connection starvation under load
   - Mitigation: Monitor and adjust based on traffic patterns
   - Validation: Load test with increased concurrency

**Execution Conditions**:
- NOT during active ongoing attack or security incident
- Database backup available before configuration changes
- On-call team available for escalation

**Recommended Approach**: Proceed with rollback (Step 1) first, then address configuration in next deployment cycle (Steps 3-4).`,

      [MyAntFarmAgentType.COORDINATOR]: `Coordinator Summary:

**Incident Summary**: Database connection pool exhaustion in auth-service v2.4.0

**Decision Quality Assessment**:
- Validity: 0.92 (Technically sound, executable commands)
- Specificity: 0.88 (Specific versions, commands, and configurations)
- Correctness: 0.85 (Aligned with database connection leak resolution)
- **DQ Score: 0.886** ✅ Actionable

**Recommended Action Sequence**:
1. IMMEDIATE: Rollback to v2.3.0 (30-45s)
2. SHORT-TERM: Configure DB connection limits (Step 3)
3. MEDIUM-TERM: Deploy connection leak fix (Step 4)

**Risk-Adjusted Recommendation**: Proceed with confidence - High DQ score with acceptable risk profile.`,
    };

    return responses[agentType] || "No response generated.";
  }

  /**
   * 解析响应为结构化内容
   */
  private parseResponse(response: string, agentType: MyAntFarmAgentType): Record<string, unknown> {
    switch (agentType) {
      case MyAntFarmAgentType.DIAGNOSIS:
        return {
          rootCause: response.includes("Root Cause:") ? response.split("Root Cause:")[1]?.trim() : response,
          severity: "high",
          confidence: 0.85,
        };

      case MyAntFarmAgentType.REMEDIATION:
        return {
          steps: this.extractRemediationSteps(response),
          commandCount: (response.match(/kubectl|docker|systemctl/g) || []).length,
          estimatedDuration: this.extractDuration(response),
        };

      case MyAntFarmAgentType.RISK_ASSESSMENT:
        return {
          overallRisk: response.includes("HIGH") ? "high" : response.includes("LOW") ? "low" : "medium",
          risks: this.extractRisks(response),
          mitigations: this.extractMitigations(response),
        };

      default:
        return {};
    }
  }

  /**
   * 解析诊断结果
   */
  private parseDiagnosis(output: AgentOutput): DiagnosisResult {
    const content = output.rawResponse;
    return {
      rootCause: this.extractRootCause(content),
      impactScope: this.extractImpactScope(content),
      severity: this.extractSeverity(content),
      confidence: output.confidence,
    };
  }

  /**
   * 解析补救计划
   */
  private parseRemediation(output: AgentOutput): RemediationPlan {
    const structured = output.structuredContent as {
      steps?: RemediationStep[];
      commandCount?: number;
      estimatedDuration?: number;
    };

    return {
      planId: output.outputId,
      steps: structured.steps || [],
      expectedImpact: "Error rates reduced to < 1%",
      rollbackPlan: "kubectl rollout undo deployment/auth-service",
    };
  }

  /**
   * 解析风险评估
   */
  private parseRiskAssessment(output: AgentOutput): RiskAssessment {
    const structured = output.structuredContent as {
      overallRisk?: string;
      risks?: IdentifiedRisk[];
      mitigations?: string[];
    };

    return {
      overallRisk: (structured.overallRisk || "medium") as RiskAssessment["overallRisk"],
      risks: structured.risks || [],
      mitigations: structured.mitigations || [],
    };
  }

  /**
   * 计算 Decision Quality 分数
   */
  private calculateDecisionQuality(
    diagnosis: AgentOutput,
    remediation: AgentOutput,
    risk: AgentOutput
  ): DecisionQualityScore {
    // 计算有效性
    const validity = this.calculateValidity(diagnosis, remediation);

    // 计算特异性
    const specificity = this.calculateSpecificity(remediation);

    // 计算正确性
    const correctness = this.calculateCorrectness(remediation);

    // 计算综合 DQ
    const dq =
      DQ_WEIGHTS.validity * validity +
      DQ_WEIGHTS.specificity * specificity +
      DQ_WEIGHTS.correctness * correctness;

    return {
      scoreId: `dq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      validity,
      specificity,
      correctness,
      dq,
      actionable: dq > 0.5,
    };
  }

  /**
   * 计算有效性
   */
  private calculateValidity(diagnosis: AgentOutput, remediation: AgentOutput): number {
    // 检查是否存在不可能的值
    const invalidPatterns = [
      /CPU at 500%/i,
      /\-1.*\+.*\d+/i,  // 负数加正数
      /restart and rollback simultaneously/i,
    ];

    const remediationText = remediation.rawResponse;
    for (const pattern of invalidPatterns) {
      if (pattern.test(remediationText)) {
        return 0.1; // 低有效性
      }
    }

    // 检查是否有合理的命令
    const hasValidCommand = /[a-z]+(?: rollout|set|apply|describe|get|logs)/i.test(remediationText);
    return hasValidCommand ? 1.0 : 0.5;
  }

  /**
   * 计算特异性
   */
  private calculateSpecificity(remediation: AgentOutput): number {
    const text = remediation.rawResponse;
    let score = 0;

    // 版本号模式 (v1.2.3)
    const versionPattern = /v?\d+\.\d+\.\d+/;
    if (versionPattern.test(text)) {
      score += 0.4;
    }

    // 具体命令 (kubectl, docker, systemctl)
    const commandPattern = /(?:kubectl|docker|systemctl|git)\s+\w+/;
    if (commandPattern.test(text)) {
      score += 0.4;
    }

    // 服务名称
    const servicePattern = /\b(?:auth-service|payment-service|api|database)\b/i;
    if (servicePattern.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 计算正确性
   */
  private calculateCorrectness(remediation: AgentOutput): number {
    const text = remediation.rawResponse.toLowerCase();

    // 基础真值关键词
    const groundTruthKeywords = [
      "rollback", "auth-service", "v2.3.0", "connection", "pool",
      "database", "deployment"
    ];

    const matchedKeywords = groundTruthKeywords.filter(kw => text.includes(kw));
    const overlapRatio = matchedKeywords.length / groundTruthKeywords.length;

    // 根据重叠比例计算分数
    if (overlapRatio >= 0.7) return 1.0;
    if (overlapRatio >= 0.5) return 0.75;
    if (overlapRatio >= 0.3) return 0.50;
    if (overlapRatio >= 0.1) return 0.25;
    return 0.0;
  }

  /**
   * 提取根本原因
   */
  private extractRootCause(content: string): string {
    const match = content.match(/(?:Root Cause:|Primary Issue:)\s*([^\n]+)/i);
    return match ? match[1].trim() : "Unknown root cause";
  }

  /**
   * 提取影响范围
   */
  private extractImpactScope(content: string): string[] {
    const scopes: string[] = [];
    const servicePattern = /(?:endpoint|service|component):\s*([a-zA-Z-\/]+)/g;
    let match;

    while ((match = servicePattern.exec(content)) !== null) {
      scopes.push(match[1]);
    }

    return scopes.length > 0 ? scopes : ["Unknown scope"];
  }

  /**
   * 提取严重程度
   */
  private extractSeverity(content: string): DiagnosisResult["severity"] {
    const criticalMatch = /critical/i.test(content);
    const highMatch = /high/i.test(content);
    const mediumMatch = /medium/i.test(content);

    return criticalMatch ? "critical" : highMatch ? "high" : mediumMatch ? "medium" : "low";
  }

  /**
   * 提取补救步骤
   */
  private extractRemediationSteps(content: string): RemediationStep[] {
    const steps: RemediationStep[] = [];
    const stepPattern = /\*\*Step (\d+):\*\*([^\n]+)/gi;
    let match;

    while ((match = stepPattern.exec(content)) !== null) {
      const stepNumber = parseInt(match[1], 10);
      const stepDescription = match[2].trim();

      // 提取命令
      const commandMatch = /Command:\s*`([^`]+)`/i.exec(stepDescription);
      const command = commandMatch ? commandMatch[1] : undefined;

      // 提取版本
      const versionMatch = /Version:\s*v?[\d.]+/i.exec(stepDescription);

      steps.push({
        order: stepNumber,
        description: stepDescription,
        command,
        targetVersion: versionMatch ? versionMatch[0].replace(/v/, "") : undefined,
      });
    }

    return steps.sort((a, b) => a.order - b.order);
  }

  /**
   * 提取持续时间
   */
  private extractDuration(content: string): number {
    const durationMatch = /(?:Duration|Estimated):\s*(\d+)\s*(second|minute|hour)/i.exec(content);
    if (!durationMatch) return 0;

    const value = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();

    switch (unit) {
      case "second": return value;
      case "minute": return value * 60;
      case "hour": return value * 3600;
      default: return 0;
    }
  }

  /**
   * 提取风险
   */
  private extractRisks(content: string): IdentifiedRisk[] {
    const risks: IdentifiedRisk[] = [];
    const riskPattern = /\*\*(\d+\.?\*)\*\*\s*(LOW|MEDIUM|HIGH|CRITICAL).*?Likelihood:\s*(LOW|MEDIUM|HIGH).*?Impact:\s*(LOW|MEDIUM|HIGH|CRITICAL).*?\n([^*]+)\n/gi;
    let match;

    while ((match = riskPattern.exec(content)) !== null) {
      const likelihoodRaw = (match[2] || "MEDIUM").toLowerCase();
      const impactRaw = (match[3] || "MEDIUM").toLowerCase();

      risks.push({
        riskType: "Operational",
        description: match[4]?.trim() || "Risk identified",
        likelihood: (likelihoodRaw === "low" || likelihoodRaw === "medium" || likelihoodRaw === "high")
          ? likelihoodRaw as "low" | "medium" | "high"
          : "medium",
        impact: (impactRaw === "low" || impactRaw === "medium" || impactRaw === "high" || impactRaw === "critical")
          ? impactRaw as "low" | "medium" | "high" | "critical"
          : "medium",
        mitigation: "Monitor and validate",
      });
    }

    return risks;
  }

  /**
   * 提取缓解措施
   */
  private extractMitigations(content: string): string[] {
    const mitigations: string[] = [];
    const mitigationPattern = /-\s+([^\n]+)/g;
    let match;

    while ((match = mitigationPattern.exec(content)) !== null) {
      mitigations.push(match[1].trim());
    }

    return mitigations;
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取简报历史
   */
  getBriefHistory(): IncidentBrief[] {
    return Array.from(this.briefHistory.values());
  }

  /**
   * 计算平均 DQ
   */
  getAverageDQ(): { avgDQ: number; actionableRate: number } {
    const briefs = this.getBriefHistory();
    if (briefs.length === 0) {
      return { avgDQ: 0, actionableRate: 0 };
    }

    const avgDQ = briefs.reduce((sum, b) => sum + b.dqScore.dq, 0) / briefs.length;
    const actionableRate = briefs.filter(b => b.dqScore.actionable).length / briefs.length;

    return { avgDQ, actionableRate };
  }
}

/**
 * 工厂函数：创建 MyAntFarm 编排器
 */
export function createMyAntFarmOrchestrator(config: MyAntFarmConfig): MyAntFarmOrchestrator {
  return new MyAntFarmOrchestrator(config);
}

/**
 * 事故模板
 */
export const MyAntFarmTemplates = {
  /** 认证服务事故 */
  authIncident: {
    description: "Authentication service regression post-deployment",
    taskTemplate: `
Service: auth-service v2.4.0
Error rate: 45% on /api/v1/login, /api/v1/token/refresh
Database: 85% connection pool utilization
Recent deployment: v2.4.0 at 14:23 UTC

Context:
- Previous stable version: v2.3.0 (deployed 48h ago)
- Peak traffic hours
- p95 response time degraded 13x
- Multiple user complaints about login failures
`,
  },

  /** 数据库事故 */
  databaseIncident: {
    description: "Database connection pool exhaustion",
    taskTemplate: `
Service: payment-service v3.1.0
Error: Database connection timeout
Database: 95% connection pool utilization
Recent change: New deployment 2 hours ago

Context:
- Payment processing failing
- Users unable to complete transactions
- Connection pool not releasing connections
- Multiple timeout errors in logs
`,
  },

  /** 网络分区事故 */
  networkPartitionIncident: {
    description: "Network partition affecting service communication",
    taskTemplate: `
Services: api-gateway, user-service, payment-service
Error: Intermittent connection failures between services
Network: High packet loss between availability zones
Recent change: Infrastructure maintenance activity

Context:
- Services partially accessible
- Some requests succeeding, others failing
- Health checks showing inconsistent results
- Load balancer reporting backend health issues
`,
  },
};
