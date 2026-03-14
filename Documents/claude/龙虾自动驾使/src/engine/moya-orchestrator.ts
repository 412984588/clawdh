/**
 * 🧙 MOYA 元编排器 (Meta Orchestrator Of Your Agents)
 *
 * 基于 arXiv:2501.08243 "Engineering LLM Powered Multi-agent Framework for Autonomous CloudOps"
 *
 * 核心思想：提供规范化的方法来构建和编排自治智能体系统
 *
 * 关键创新：
 * - 元编排器模式：编排器的编排器，管理多个子编排器
 * - Human-in-the-Loop：人工监督与干预机制
 * - 领域驱动设计：基于 DDD 的智能体组织
 * - 自适应工作流：根据任务复杂度动态调整
 * - 可扩展架构：支持插件式智能体注册
 *
 * @see {@link https://arxiv.org/abs/2501.08243} - MOYA Paper
 * @see {@link https://www.researchgate.net/publication/388029620} - ResearchGate
 *
 * @version 2.20.0
 * @since 2025-03-11
 */

/**
 * 智能体能力等级
 */
export enum MOYAAgentCapabilityLevel {
  /** 基础 - 执行预定义任务 */
  BASIC = "basic",
  /** 中级 - 可处理复杂任务 */
  INTERMEDIATE = "intermediate",
  /** 高级 - 可自主决策 */
  ADVANCED = "advanced",
  /** 专家 - 可处理领域专精问题 */
  EXPERT = "expert",
}

/**
 * 智能体领域
 */
export enum MOYADomain {
  /** 运维领域 */
  CLOUDOPS = "cloudops",
  /** 开发领域 */
  DEVELOPMENT = "development",
  /** 安全领域 */
  SECURITY = "security",
  /** 数据领域 */
  DATA = "data",
  /** 业务领域 */
  BUSINESS = "business",
  /** 监控领域 */
  MONITORING = "monitoring",
}

/**
 * 工作流状态
 */
export enum MOYAWorkflowState {
  /** 初始化 */
  INITIALIZED = "initialized",
  /** 规划中 */
  PLANNING = "planning",
  /** 执行中 */
  EXECUTING = "executing",
  /** 等待人工确认 */
  WAITING_HUMAN = "waiting_human",
  /** 已完成 */
  COMPLETED = "completed",
  /** 已取消 */
  CANCELLED = "cancelled",
  /** 失败 */
  FAILED = "failed",
}

/**
 * 人工干预类型
 */
export enum MOYAHumanInterventionType {
  /** 审批 */
  APPROVAL = "approval",
  /** 纠正 */
  CORRECTION = "correction",
  /** 指导 */
  GUIDANCE = "guidance",
  /** 验证 */
  VERIFICATION = "verification",
  /** 紧急停止 */
  EMERGENCY_STOP = "emergency_stop",
}

/**
 * MOYA 智能体定义
 */
export interface MOYAAgentDefinition {
  /** 智能体 ID */
  agentId: string;
  /** 智能体名称 */
  agentName: string;
  /** 能力等级 */
  capabilityLevel: MOYAAgentCapabilityLevel;
  /** 所属领域 */
  domain: MOYADomain;
  /** 能力描述 */
  capabilities: string[];
  /** 可用性 (0-1) */
  availability: number;
  /** 信任分数 (0-1) */
  trustScore: number;
  /** 负载 (0-1) */
  load: number;
}

/**
 * 子编排器
 */
export interface SubOrchestrator {
  /** 编排器 ID */
  orchestratorId: string;
  /** 编排器类型 */
  type: string;
  /** 当前管理的智能体 */
  managedAgents: string[];
  /** 负载 (0-1) */
  load: number;
  /** 性能指标 */
  performance: {
    /** 成功任务数 */
    completedTasks: number;
    /** 失败任务数 */
    failedTasks: number;
    /** 平均完成时间 (ms) */
    avgCompletionTime: number;
  };
}

/**
 * 工作流定义
 */
export interface MOYAWorkflow {
  /** 工作流 ID */
  workflowId: string;
  /** 工作流名称 */
  workflowName: string;
  /** 描述 */
  description: string;
  /** 状态 */
  state: MOYAWorkflowState;
  /** 优先级 */
  priority: number;
  /** 复杂度 (1-10) */
  complexity: number;
  /** 所需领域 */
  requiredDomains: MOYADomain[];
  /** 所需能力等级 */
  requiredCapabilityLevel: MOYAAgentCapabilityLevel;
  /** 任务步骤 */
  steps: MOYAWorkflowStep[];
  /** 分配的编排器 */
  assignedOrchestrator?: string;
  /** 创建时间 */
  createdAt: number;
  /** 开始时间 */
  startedAt?: number;
  /** 完成时间 */
  completedAt?: number;
}

/**
 * 工作流步骤
 */
export interface MOYAWorkflowStep {
  /** 步骤 ID */
  stepId: string;
  /** 步骤名称 */
  stepName: string;
  /** 步骤描述 */
  description: string;
  /** 状态 */
  status: MOYAWorkflowState;
  /** 执行智能体 */
  assignedAgent?: string;
  /** 输入 */
  inputs: Record<string, any>;
  /** 输出 */
  outputs: Record<string, any>;
  /** 依赖步骤 */
  dependencies: string[];
  /** 是否需要人工干预 */
  requiresHumanIntervention: boolean;
  /** 人工干预类型 */
  interventionType?: MOYAHumanInterventionType;
}

/**
 * 人工干预请求
 */
export interface HumanInterventionRequest {
  /** 请求 ID */
  requestId: string;
  /** 工作流 ID */
  workflowId: string;
  /** 步骤 ID */
  stepId: string;
  /** 干预类型 */
  interventionType: MOYAHumanInterventionType;
  /** 上下文信息 */
  context: {
    /** 当前状态 */
    currentState: any;
    /** 建议操作 */
    suggestedActions: string[];
    /** 风险评估 */
    riskLevel: "low" | "medium" | "high" | "critical";
  };
  /** 创建时间 */
  createdAt: number;
  /** 响应 */
  response?: {
    /** 响应时间 */
    timestamp: number;
    /** 响应内容 */
    content: string;
    /** 响应者 */
    responder: string;
  };
}

/**
 * MOYA 配置
 */
export interface MOYAConfig {
  /** 最大并发工作流 */
  maxConcurrentWorkflows?: number;
  /** 人工干预超时 (ms) */
  humanInterventionTimeout?: number;
  /** 默认优先级 */
  defaultPriority?: number;
  /** 启用的领域 */
  enabledDomains?: MOYADomain[];
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 子编排器列表 */
  subOrchestrators?: SubOrchestrator[];
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<MOYAConfig> = {
  maxConcurrentWorkflows: 10,
  humanInterventionTimeout: 300000, // 5 minutes
  defaultPriority: 50,
  enabledDomains: [
    MOYADomain.CLOUDOPS,
    MOYADomain.DEVELOPMENT,
    MOYADomain.SECURITY,
    MOYADomain.DATA,
    MOYADomain.BUSINESS,
    MOYADomain.MONITORING,
  ],
  enableDetailedLogging: false,
  subOrchestrators: [],
};

/**
 * 🧙 MOYA 元编排器
 *
 * 实现智能体的编排器，支持人工干预和自适应工作流
 */
export class MOYAOrchestrator {
  private config: Required<MOYAConfig>;
  private agents: Map<string, MOYAAgentDefinition> = new Map();
  private workflows: Map<string, MOYAWorkflow> = new Map();
  private subOrchestrators: Map<string, SubOrchestrator> = new Map();
  private interventionRequests: Map<string, HumanInterventionRequest> = new Map();
  private interventionTimer?: NodeJS.Timeout;

  constructor(config: MOYAConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 初始化子编排器
    for (const sub of this.config.subOrchestrators) {
      this.subOrchestrators.set(sub.orchestratorId, sub);
    }

    // 初始化默认智能体
    this.initializeDefaultAgents();

    // 启动人工干预检查
    this.startInterventionChecker();

    console.log(`🧙 MOYA 元编排器初始化`);
    console.log(`   智能体: ${this.agents.size} 个`);
    console.log(`   子编排器: ${this.subOrchestrators.size} 个`);
    console.log(`   启用领域: ${this.config.enabledDomains.join(", ")}`);
  }

  /**
   * 执行 MOYA 编排
   */
  async orchestrate(taskDescription: string): Promise<{
    result: string;
    workflowId: string;
    steps: number;
    interventions: number;
    executionTime: number;
  }> {
    console.log(`🧙 MOYA 编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 1. 分析任务并创建工作流
    const workflow = this.createWorkflow(taskDescription);
    this.workflows.set(workflow.workflowId, workflow);

    // 2. 分配子编排器
    const orchestratorId = this.assignOrchestrator(workflow);
    workflow.assignedOrchestrator = orchestratorId;

    // 3. 执行工作流
    const result = await this.executeWorkflow(workflow);

    const executionTime = Date.now() - startTime;
    const interventions = Array.from(this.interventionRequests.values()).filter(
      r => r.workflowId === workflow.workflowId
    ).length;

    console.log(`🧙 编排完成: ${executionTime}ms, 步骤: ${workflow.steps.length}, 干预: ${interventions}`);

    return {
      result,
      workflowId: workflow.workflowId,
      steps: workflow.steps.length,
      interventions,
      executionTime,
    };
  }

  /**
   * 初始化默认智能体
   */
  private initializeDefaultAgents(): void {
    const defaultAgents: Omit<MOYAAgentDefinition, "agentId">[] = [
      {
        agentName: "CloudOps Expert",
        capabilityLevel: MOYAAgentCapabilityLevel.EXPERT,
        domain: MOYADomain.CLOUDOPS,
        capabilities: ["deployment", "monitoring", "scaling", "incident_response"],
        availability: 0.95,
        trustScore: 0.95,
        load: 0,
      },
      {
        agentName: "Security Analyst",
        capabilityLevel: MOYAAgentCapabilityLevel.ADVANCED,
        domain: MOYADomain.SECURITY,
        capabilities: ["vulnerability_scan", "compliance_check", "threat_detection"],
        availability: 0.9,
        trustScore: 0.92,
        load: 0,
      },
      {
        agentName: "Data Engineer",
        capabilityLevel: MOYAAgentCapabilityLevel.ADVANCED,
        domain: MOYADomain.DATA,
        capabilities: ["etl", "data_validation", "pipeline_orchestration"],
        availability: 0.88,
        trustScore: 0.88,
        load: 0,
      },
      {
        agentName: "Developer Assistant",
        capabilityLevel: MOYAAgentCapabilityLevel.INTERMEDIATE,
        domain: MOYADomain.DEVELOPMENT,
        capabilities: ["code_review", "unit_testing", "documentation"],
        availability: 0.92,
        trustScore: 0.85,
        load: 0,
      },
      {
        agentName: "Business Analyst",
        capabilityLevel: MOYAAgentCapabilityLevel.INTERMEDIATE,
        domain: MOYADomain.BUSINESS,
        capabilities: ["requirement_analysis", "stakeholder_communication", "risk_assessment"],
        availability: 0.85,
        trustScore: 0.8,
        load: 0,
      },
    ];

    for (const agent of defaultAgents) {
      this.registerAgent(agent);
    }
  }

  /**
   * 注册智能体
   */
  registerAgent(agent: Omit<MOYAAgentDefinition, "agentId">): string {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullAgent: MOYAAgentDefinition = {
      ...agent,
      agentId,
    };

    this.agents.set(agentId, fullAgent);
    return agentId;
  }

  /**
   * 创建工作流
   */
  private createWorkflow(description: string): MOYAWorkflow {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 分析任务复杂度
    const complexity = this.assessComplexity(description);
    const requiredDomains = this.inferDomains(description);
    const requiredCapabilityLevel = this.inferRequiredCapability(complexity);

    // 创建工作流步骤
    const steps = this.createWorkflowSteps(description, complexity);

    return {
      workflowId,
      workflowName: `Workflow ${Date.now()}`,
      description,
      state: MOYAWorkflowState.INITIALIZED,
      priority: this.config.defaultPriority,
      complexity,
      requiredDomains,
      requiredCapabilityLevel,
      steps,
      createdAt: Date.now(),
    };
  }

  /**
   * 评估任务复杂度
   */
  private assessComplexity(description: string): number {
    let complexity = 1;
    const lowerDesc = description.toLowerCase();

    // 关键词增加复杂度
    const complexityKeywords: Record<string, number> = {
      "部署": 3,
      "deploy": 3,
      "迁移": 4,
      "migration": 4,
      "重构": 5,
      "refactor": 5,
      "集成": 3,
      "integration": 3,
      "监控": 2,
      "monitoring": 2,
      "安全": 4,
      "security": 4,
      "分析": 2,
      "analysis": 2,
      "优化": 3,
      "optimization": 3,
    };

    for (const [keyword, value] of Object.entries(complexityKeywords)) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        complexity = Math.max(complexity, value);
      }
    }

    return Math.min(10, complexity);
  }

  /**
   * 推断所需领域
   */
  private inferDomains(description: string): MOYADomain[] {
    const domains: MOYADomain[] = [];
    const lowerDesc = description.toLowerCase();

    const domainKeywords: Record<string, MOYADomain> = {
      "部署": MOYADomain.CLOUDOPS,
      "deploy": MOYADomain.CLOUDOPS,
      "cloud": MOYADomain.CLOUDOPS,
      "云": MOYADomain.CLOUDOPS,
      "代码": MOYADomain.DEVELOPMENT,
      "code": MOYADomain.DEVELOPMENT,
      "开发": MOYADomain.DEVELOPMENT,
      "security": MOYADomain.SECURITY,
      "安全": MOYADomain.SECURITY,
      "数据": MOYADomain.DATA,
      "data": MOYADomain.DATA,
      "业务": MOYADomain.BUSINESS,
      "business": MOYADomain.BUSINESS,
      "监控": MOYADomain.MONITORING,
      "monitor": MOYADomain.MONITORING,
    };

    for (const [keyword, domain] of Object.entries(domainKeywords)) {
      if (lowerDesc.includes(keyword) && !domains.includes(domain)) {
        domains.push(domain);
      }
    }

    return domains.length > 0 ? domains : [MOYADomain.DEVELOPMENT];
  }

  /**
   * 推断所需能力等级
   */
  private inferRequiredCapability(complexity: number): MOYAAgentCapabilityLevel {
    if (complexity >= 8) return MOYAAgentCapabilityLevel.EXPERT;
    if (complexity >= 5) return MOYAAgentCapabilityLevel.ADVANCED;
    if (complexity >= 3) return MOYAAgentCapabilityLevel.INTERMEDIATE;
    return MOYAAgentCapabilityLevel.BASIC;
  }

  /**
   * 创建工作流步骤
   */
  private createWorkflowSteps(description: string, complexity: number): MOYAWorkflowStep[] {
    const steps: MOYAWorkflowStep[] = [];

    // 步骤 1: 任务分析
    steps.push({
      stepId: `${Date.now()}_1`,
      stepName: "Task Analysis",
      description: `Analyze requirements for: ${description}`,
      status: MOYAWorkflowState.INITIALIZED,
      inputs: { description },
      outputs: {},
      dependencies: [],
      requiresHumanIntervention: false,
    });

    // 步骤 2: 规划
    steps.push({
      stepId: `${Date.now()}_2`,
      stepName: "Planning",
      description: "Create execution plan",
      status: MOYAWorkflowState.INITIALIZED,
      inputs: {},
      outputs: {},
      dependencies: [steps[0].stepId],
      requiresHumanIntervention: complexity >= 7,
      interventionType: MOYAHumanInterventionType.APPROVAL,
    });

    // 步骤 3: 执行
    steps.push({
      stepId: `${Date.now()}_3`,
      stepName: "Execution",
      description: "Execute the plan",
      status: MOYAWorkflowState.INITIALIZED,
      inputs: {},
      outputs: {},
      dependencies: [steps[1].stepId],
      requiresHumanIntervention: false,
    });

    // 步骤 4: 验证（高复杂度需要人工验证）
    steps.push({
      stepId: `${Date.now()}_4`,
      stepName: "Verification",
      description: "Verify results",
      status: MOYAWorkflowState.INITIALIZED,
      inputs: {},
      outputs: {},
      dependencies: [steps[2].stepId],
      requiresHumanIntervention: complexity >= 5,
      interventionType: MOYAHumanInterventionType.VERIFICATION,
    });

    return steps;
  }

  /**
   * 分配编排器
   */
  private assignOrchestrator(workflow: MOYAWorkflow): string {
    // 简化实现：选择负载最低的编排器
    let bestOrchestrator: [string, SubOrchestrator] | null = null;

    for (const [id, orch] of this.subOrchestrators.entries()) {
      if (!bestOrchestrator || orch.load < bestOrchestrator[1].load) {
        bestOrchestrator = [id, orch];
      }
    }

    // 如果没有子编排器，使用默认
    if (!bestOrchestrator) {
      const defaultId = "moya_default_orchestrator";
      if (!this.subOrchestrators.has(defaultId)) {
        this.subOrchestrators.set(defaultId, {
          orchestratorId: defaultId,
          type: "default",
          managedAgents: [],
          load: 0,
          performance: {
            completedTasks: 0,
            failedTasks: 0,
            avgCompletionTime: 0,
          },
        });
      }
      bestOrchestrator = [defaultId, this.subOrchestrators.get(defaultId)!];
    }

    // 更新负载
    bestOrchestrator[1].load += 0.1;

    return bestOrchestrator[0];
  }

  /**
   * 执行工作流
   */
  private async executeWorkflow(workflow: MOYAWorkflow): Promise<string> {
    workflow.state = MOYAWorkflowState.EXECUTING;
    workflow.startedAt = Date.now();

    // 执行每个步骤
    for (const step of workflow.steps) {
      // 检查依赖
      const dependenciesMet = step.dependencies.every(depId => {
        const depStep = workflow.steps.find(s => s.stepId === depId);
        return depStep && depStep.status === MOYAWorkflowState.COMPLETED;
      });

      if (!dependenciesMet) {
        step.status = MOYAWorkflowState.FAILED;
        continue;
      }

      // 检查是否需要人工干预
      if (step.requiresHumanIntervention) {
        const request = this.createInterventionRequest(workflow, step);
        this.interventionRequests.set(request.requestId, request);
        step.status = MOYAWorkflowState.WAITING_HUMAN;

        // 模拟人工响应
        await this.simulateHumanResponse(request);

        if (request.response) {
          step.status = MOYAWorkflowState.COMPLETED;
          step.outputs = { humanResponse: request.response.content };
        } else {
          step.status = MOYAWorkflowState.FAILED;
        }
      } else {
        // 自动执行
        await this.executeStep(step, workflow);
        step.status = MOYAWorkflowState.COMPLETED;
      }

      // 模拟执行延迟
      await this.delay(50 + Math.random() * 100);
    }

    // 检查所有步骤是否完成
    const allCompleted = workflow.steps.every(
      s => s.status === MOYAWorkflowState.COMPLETED
    );

    workflow.state = allCompleted
      ? MOYAWorkflowState.COMPLETED
      : MOYAWorkflowState.FAILED;
    workflow.completedAt = Date.now();

    return this.generateWorkflowResult(workflow);
  }

  /**
   * 创建干预请求
   */
  private createInterventionRequest(
    workflow: MOYAWorkflow,
    step: MOYAWorkflowStep
  ): HumanInterventionRequest {
    const requestId = `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      requestId,
      workflowId: workflow.workflowId,
      stepId: step.stepId,
      interventionType: step.interventionType || MOYAHumanInterventionType.APPROVAL,
      context: {
        currentState: {
          workflow: workflow.workflowName,
          step: step.stepName,
        },
        suggestedActions: [
          "Approve to continue",
          "Modify and resubmit",
          "Cancel workflow",
        ],
        riskLevel: workflow.complexity >= 7 ? "high" : "medium",
      },
      createdAt: Date.now(),
    };
  }

  /**
   * 模拟人工响应
   */
  private async simulateHumanResponse(request: HumanInterventionRequest): Promise<void> {
    // 模拟延迟
    await this.delay(100);

    // 自动批准（实际应用中需要等待真实人工响应）
    request.response = {
      timestamp: Date.now(),
      content: "Approved",
      responder: "human_operator",
    };
  }

  /**
   * 执行步骤
   */
  private async executeStep(step: MOYAWorkflowStep, workflow: MOYAWorkflow): Promise<void> {
    // 选择合适的智能体
    const agentId = this.selectAgentForStep(step, workflow);

    if (agentId) {
      step.assignedAgent = agentId;
      step.outputs = {
        executedBy: agentId,
        result: `Executed ${step.stepName}`,
      };

      // 更新智能体负载
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.load = Math.min(1, agent.load + 0.2);
      }
    }
  }

  /**
   * 为步骤选择智能体
   */
  private selectAgentForStep(step: MOYAWorkflowStep, workflow: MOYAWorkflow): string | null {
    const capableAgents: Array<{ id: string; score: number }> = [];

    for (const [id, agent] of this.agents.entries()) {
      // 检查领域匹配
      const domainMatch = workflow.requiredDomains.includes(agent.domain);

      // 检查能力等级
      const capabilityMatch = this.compareCapabilityLevels(
        agent.capabilityLevel,
        workflow.requiredCapabilityLevel
      ) >= 0;

      // 检查可用性
      const available = agent.availability > 0.5;

      // 检查负载
      const hasCapacity = agent.load < 0.8;

      if (domainMatch && capabilityMatch && available && hasCapacity) {
        capableAgents.push({
          id,
          score: agent.trustScore - agent.load,
        });
      }
    }

    if (capableAgents.length === 0) return null;

    // 返回得分最高的智能体
    capableAgents.sort((a, b) => b.score - a.score);
    return capableAgents[0].id;
  }

  /**
   * 比较能力等级
   */
  private compareCapabilityLevels(
    a: MOYAAgentCapabilityLevel,
    b: MOYAAgentCapabilityLevel
  ): number {
    const levels = [
      MOYAAgentCapabilityLevel.BASIC,
      MOYAAgentCapabilityLevel.INTERMEDIATE,
      MOYAAgentCapabilityLevel.ADVANCED,
      MOYAAgentCapabilityLevel.EXPERT,
    ];
    return levels.indexOf(a) - levels.indexOf(b);
  }

  /**
   * 生成工作流结果
   */
  private generateWorkflowResult(workflow: MOYAWorkflow): string {
    const completedSteps = workflow.steps.filter(
      s => s.status === MOYAWorkflowState.COMPLETED
    ).length;

    return `🧙 MOYA 工作流完成\n` +
      `工作流: ${workflow.workflowName}\n` +
      `复杂度: ${workflow.complexity}/10\n` +
      `完成步骤: ${completedSteps}/${workflow.steps.length}\n` +
      `耗时: ${workflow.completedAt! - workflow.startedAt!}ms\n` +
      `领域: ${workflow.requiredDomains.join(", ")}`;
  }

  /**
   * 启动人工干预检查器
   */
  private startInterventionChecker(): void {
    this.interventionTimer = setInterval(() => {
      const now = Date.now();

      for (const [id, request] of this.interventionRequests.entries()) {
        // 检查超时
        if (
          !request.response &&
          now - request.createdAt > this.config.humanInterventionTimeout
        ) {
          // 超时自动处理
          request.response = {
            timestamp: now,
            content: "Auto-approved (timeout)",
            responder: "system",
          };

          if (this.config.enableDetailedLogging) {
            console.log(`   人工干预超时自动处理: ${id}`);
          }
        }
      }
    }, 30000); // 每 30 秒检查一次
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取工作流状态
   */
  getWorkflowStatus(workflowId: string): MOYAWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * 获取所有工作流
   */
  getAllWorkflows(): MOYAWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * 获取所有智能体
   */
  getAllAgents(): MOYAAgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * 获取子编排器
   */
  getSubOrchestrators(): SubOrchestrator[] {
    return Array.from(this.subOrchestrators.values());
  }

  /**
   * 停止编排器
   */
  stop(): void {
    if (this.interventionTimer) {
      clearInterval(this.interventionTimer);
    }
    console.log(`🧙 MOYA 元编排器已停止`);
  }
}

/**
 * 工厂函数：创建 MOYA 编排器
 */
export function createMOYAOrchestrator(config?: MOYAConfig): MOYAOrchestrator {
  return new MOYAOrchestrator(config);
}

/**
 * 任务模板
 */
export const MOYATemplates = {
  /** CloudOps 任务 */
  cloudops: {
    description: "云运维自动化任务",
    recommendedConfig: {
      enabledDomains: [MOYADomain.CLOUDOPS, MOYADomain.MONITORING],
      maxConcurrentWorkflows: 5,
    },
  },

  /** 开发任务 */
  development: {
    description: "软件开发任务",
    recommendedConfig: {
      enabledDomains: [MOYADomain.DEVELOPMENT, MOYADomain.DATA],
      maxConcurrentWorkflows: 10,
    },
  },

  /** 安全审查任务 */
  security: {
    description: "安全审查和合规检查",
    recommendedConfig: {
      enabledDomains: [MOYADomain.SECURITY],
      humanInterventionTimeout: 600000, // 10 minutes for security review
    },
  },
};
