/**
 * 🏭 MASFactory 图中心多代理编排框架
 *
 * 基于 arXiv:2603.06007 "MASFactory: A Graph-centric Framework for Orchestrating LLM-Based Multi-Agent Systems with Vibe Graphing"
 *
 * 核心思想：通过有向计算图建模多代理工作流，支持 Vibe Graphing 将自然语言意图编译为可执行图
 *
 * 关键创新：
 * - Vibe Graphing：人机协作的意图到工作流编译
 * - 图中心编排：Node（计算单元）+ Edge（依赖和消息传递）
 * - 三流分离：控制流、消息流、状态流
 * - 可重用组件：NodeTemplate 和 ComposedGraph
 * - 即插式上下文：Context Adapter 屏蔽异构数据源
 * - 可视化：拓扑预览、运行时跟踪、人机交互
 *
 * @see {@link https://arxiv.org/abs/2603.06007} - MASFactory Paper
 * @see {@link https://github.com/BUPT-GAMMA/MASFactory} - Official Code
 *
 * @version 2.35.0
 * @since 2025-03-11
 */

/**
 * 节点类型
 */
export enum MASFactoryNodeType {
  /** 图节点 - DAG 工作流 */
  GRAPH = "graph",
  /** 循环节点 - 迭代协作 */
  LOOP = "loop",
  /** 代理节点 - 感知-推理-行动 */
  AGENT = "agent",
  /** 自定义节点 */
  CUSTOM = "custom",
  /** 交互节点 - 人机协作入口 */
  INTERACTION = "interaction",
  /** 开关节点 - 控制流路由 */
  SWITCH = "switch",
  /** 模板节点 - 可重用结构模板 */
  TEMPLATE = "template",
}

/**
 * 节点状态
 */
export enum MASFactoryNodeState {
  /** 等待中 */
  PENDING = "pending",
  /** 就绪 */
  READY = "ready",
  /** 运行中 */
  RUNNING = "running",
  /** 完成 */
  COMPLETED = "completed",
  /** 失败 */
  FAILED = "failed",
  /** 跳过 */
  SKIPPED = "skipped",
}

/**
 * 流类型
 */
export enum MASFactoryFlowType {
  /** 控制流 - 调度和依赖 */
  CONTROL = "control",
  /** 消息流 - 节点间数据传递 */
  MESSAGE = "message",
  /** 状态流 - 图层级同步 */
  STATE = "state",
}

/**
 * 编排接口类型
 */
export enum MASFactoryInterfaceType {
  /** Vibe Graphing - 自动化意图编译 */
  VIBE_GRAPHING = "vibe_graphing",
  /** Imperative - 命令式编程 */
  IMPERATIVE = "imperative",
  /** Declarative - 声明式配置 */
  DECLARATIVE = "declarative",
}

/**
 * Vibe Graphing 阶段
 */
export enum VibeGraphingStage {
  /** 角色分配 */
  ROLE_ASSIGNMENT = "role_assignment",
  /** 结构设计 */
  STRUCTURE_DESIGN = "structure_design",
  /** 语义补全 */
  SEMANTIC_COMPLETION = "semantic_completion",
}

/**
 * 图节点
 */
export interface MASFactoryGraphNode {
  /** 节点 ID */
  id: string;
  /** 节点类型 */
  type: MASFactoryNodeType;
  /** 节点名称 */
  name: string;
  /** 配置 */
  config: MASFactoryNodeConfig;
  /** 输入字段 */
  inputFields: string[];
  /** 输出字段 */
  outputFields: string[];
  /** 状态 */
  state: MASFactoryNodeState;
  /** 入边 */
  inEdges: string[];
  /** 出边 */
  outEdges: string[];
}

/**
 * 图边
 */
export interface MASFactoryGraphEdge {
  /** 源节点 */
  source: string;
  /** 目标节点 */
  target: string;
  /** 边类型 */
  flowType: MASFactoryFlowType;
  /** 条件表达式（用于 Switch） */
  condition?: string;
  /** 数据映射 */
  dataMapping?: Record<string, string>;
}

/**
 * 节点配置
 */
export interface MASFactoryNodeConfig {
  /** 提示词 */
  prompt?: string;
  /** 系统角色 */
  systemRole?: string;
  /** 工具列表 */
  tools?: string[];
  /** 温度参数 */
  temperature?: number;
  /** 最大重试 */
  maxRetries?: number;
  /** 超时时间 */
  timeout?: number;
  /** 自定义配置 */
  customConfig?: Record<string, unknown>;
}

/**
 * 工作流图
 */
export interface MASFactoryWorkflowGraph {
  /** 图 ID */
  graphId: string;
  /** 图名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 节点集合 */
  nodes: Map<string, MASFactoryGraphNode>;
  /** 边集合 */
  edges: MASFactoryGraphEdge[];
  /** 入口节点 */
  entryNodes: string[];
  /** 出口节点 */
  exitNodes: string[];
  /** 全局状态 */
  globalState: Map<string, unknown>;
  /** 执行跟踪 */
  executionTrace: MASFactoryExecutionTrace[];
}

/**
 * 执行跟踪
 */
export interface MASFactoryExecutionTrace {
  /** 跟踪 ID */
  traceId: string;
  /** 时间戳 */
  timestamp: number;
  /** 节点 ID */
  nodeId: string;
  /** 事件类型 */
  eventType: "node_enter" | "node_exit" | "message_sent" | "message_received" | "error";
  /** 数据 */
  data?: Record<string, unknown>;
}

/**
 * Vibe Graphing 结果
 */
export interface VibeGraphingResult {
  /** 结果 ID */
  resultId: string;
  /** 原始意图 */
  originalIntent: string;
  /** 分配的角色 */
  assignedRoles: MASFactoryAgentRole[];
  /** 生成的拓扑 */
  generatedTopology: MASFactoryGraphTopology;
  /** 语义补全的配置 */
  semanticCompletion: Map<string, MASFactoryNodeConfig>;
  /** 最终工作流 */
  finalWorkflow: MASFactoryWorkflowGraph;
  /** 编译阶段 */
  stages: VibeGraphingStage[];
  /** 用户反馈历史 */
  feedbackHistory: VibeGraphingFeedback[];
}

/**
 * 代理角色
 */
export interface MASFactoryAgentRole {
  /** 角色 ID */
  roleId: string;
  /** 角色名称 */
  name: string;
  /** 职责描述 */
  responsibility: string;
  /** 能力要求 */
  capabilities: string[];
  /** 关联的节点 */
  nodeIds: string[];
}

/**
 * 图拓扑
 */
export interface MASFactoryGraphTopology {
  /** 拓扑结构 */
  structure: "sequential" | "parallel" | "hierarchical" | "cyclic" | "mixed";
  /** 节点连接关系 */
  connections: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
  /** 控制流约束 */
  constraints?: string[];
}

/**
 * Vibe Graphing 反馈
 */
export interface VibeGraphingFeedback {
  /** 反馈 ID */
  feedbackId: string;
  /** 阶段 */
  stage: VibeGraphingStage;
  /** 反馈内容 */
  content: string;
  /** 是否接受 */
  accepted: boolean;
  /** 建议修改 */
  suggestions?: string[];
}

/**
 * 节点模板
 */
export interface MASFactoryNodeTemplate {
  /** 模板 ID */
  templateId: string;
  /** 模板名称 */
  name: string;
  /** 模板类型 */
  type: MASFactoryNodeType;
  /** 基础配置 */
  baseConfig: MASFactoryNodeConfig;
  /** 可变参数 */
  parameters: string[];
  /** 实例计数 */
  instanceCount: number;
}

/**
 * 组合图
 */
export interface MASFactoryComposedGraph {
  /** 组合图 ID */
  composedId: string;
  /** 名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 内部节点（模板） */
  internalNodes: MASFactoryNodeTemplate[];
  /** 内部边 */
  internalEdges: Array<{
    from: string;
    to: string;
  }>;
  /** 暴露参数 */
  exposedParameters: Map<string, unknown>;
}

/**
 * 上下文适配器
 */
export interface MASFactoryContextAdapter {
  /** 适配器名称 */
  name: string;
  /** 上下文类型 */
  contextType: "memory" | "rag" | "mcp" | "custom";
  /** 转换函数 */
  transform: (data: unknown) => Record<string, unknown>;
  /** 逆转换 */
  inverse?: (data: Record<string, unknown>) => unknown;
}

/**
 * 消息适配器
 */
export interface MASFactoryMessageAdapter {
  /** 适配器名称 */
  name: string;
  /** 协议类型 */
  protocolType: "json_schema" | "markdown" | "plain_text" | "custom";
  /** 格式化函数 */
  format: (message: unknown) => string;
  /** 解析函数 */
  parse: (data: string) => unknown;
}

/**
 * 调度结果
 */
export interface MASFactoryScheduleResult {
  /** 调度的节点 */
  scheduledNodes: string[];
  /** 就绪节点 */
  readyNodes: string[];
  /** 阻塞节点 */
  blockedNodes: string[];
}

/**
 * 执行结果
 */
export interface MASFactoryExecutionResult {
  /** 结果 ID */
  resultId: string;
  /** 工作流 ID */
  workflowId: string;
  /** 执行状态 */
  status: "success" | "failure" | "partial";
  /** 输出数据 */
  outputs: Map<string, unknown>;
  /** 执行跟踪 */
  trace: MASFactoryExecutionTrace[];
  /** 总耗时 */
  duration: number;
  /** 错误信息 */
  errors: string[];
}

/**
 * MASFactory 配置
 */
export interface MASFactoryConfig {
  /** 最大并行节点数 */
  maxParallelNodes?: number;
  /** 默认节点超时 */
  defaultNodeTimeout?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 是否启用可视化 */
  enableVisualization?: boolean;
  /** 上下文适配器 */
  contextAdapters?: MASFactoryContextAdapter[];
  /** 消息适配器 */
  messageAdapters?: MASFactoryMessageAdapter[];
  /** 内置组合图 */
  composedGraphs?: Map<string, MASFactoryComposedGraph>;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Omit<MASFactoryConfig, 'contextAdapters' | 'messageAdapters' | 'composedGraphs'> = {
  maxParallelNodes: 5,
  defaultNodeTimeout: 30000,
  enableDetailedLogging: false,
  enableVisualization: false,
};

/**
 * 🏭 MASFactory 图中心多代理编排框架
 *
 * 实现有向计算图建模和 Vibe Graphing 意图编译
 */
export class MASFactoryOrchestrator {
  private config: Omit<MASFactoryConfig, 'contextAdapters' | 'messageAdapters' | 'composedGraphs'> & {
    contextAdapters: MASFactoryContextAdapter[];
    messageAdapters: MASFactoryMessageAdapter[];
    composedGraphs: Map<string, MASFactoryComposedGraph>;
  };
  private workflows: Map<string, MASFactoryWorkflowGraph> = new Map();
  private templates: Map<string, MASFactoryNodeTemplate> = new Map();
  private vibeGraphingHistory: VibeGraphingResult[] = [];

  constructor(config: MASFactoryConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      contextAdapters: config.contextAdapters || [],
      messageAdapters: config.messageAdapters || [],
      composedGraphs: config.composedGraphs || new Map(),
    };

    // 初始化内置组合图
    this.initializeBuiltinComposedGraphs();

    console.log(`🏭 MASFactory 编排器初始化`);
    console.log(`   最大并行节点: ${this.config.maxParallelNodes}`);
    console.log(`   可视化: ${this.config.enableVisualization ? "启用" : "禁用"}`);
  }

  /**
   * Vibe Graphing: 将自然语言意图编译为可执行工作流
   */
  async vibeGraphing(intent: string): Promise<VibeGraphingResult> {
    console.log(`🏭 Vibe Graphing 开始: "${intent.substring(0, 50)}..."`);
    const startTime = Date.now();

    const stages: VibeGraphingStage[] = [
      VibeGraphingStage.ROLE_ASSIGNMENT,
      VibeGraphingStage.STRUCTURE_DESIGN,
      VibeGraphingStage.SEMANTIC_COMPLETION,
    ];

    const result: VibeGraphingResult = {
      resultId: `vibe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalIntent: intent,
      assignedRoles: [],
      generatedTopology: { structure: "sequential", connections: [] },
      semanticCompletion: new Map(),
      finalWorkflow: this.createEmptyWorkflow(),
      stages,
      feedbackHistory: [],
    };

    // 阶段 1: 角色分配
    result.assignedRoles = await this.roleAssignment(intent);
    if (this.config.enableDetailedLogging) {
      console.log(`   角色分配: ${result.assignedRoles.length} 个角色`);
    }

    // 阶段 2: 结构设计
    result.generatedTopology = await this.structureDesign(intent, result.assignedRoles);
    if (this.config.enableDetailedLogging) {
      console.log(`   结构设计: ${result.generatedTopology.structure}`);
    }

    // 阶段 3: 语义补全
    for (const role of result.assignedRoles) {
      const config = await this.semanticCompletion(intent, role);
      result.semanticCompletion.set(role.roleId, config);
    }

    // 生成最终工作流
    result.finalWorkflow = this.generateWorkflow(result);

    this.vibeGraphingHistory.push(result);

    console.log(`🏭 Vibe Graphing 完成: ${Date.now() - startTime}ms`);

    return result;
  }

  /**
   * 角色分配阶段
   */
  private async roleAssignment(intent: string): Promise<MASFactoryAgentRole[]> {
    // 分析意图，识别所需角色
    const roles: MASFactoryAgentRole[] = [];

    // 根据意图关键词推断角色
    const intentLower = intent.toLowerCase();

    if (intentLower.includes("代码") || intentLower.includes("开发") || intentLower.includes("code")) {
      roles.push({
        roleId: "coder",
        name: "编码专家",
        responsibility: "负责代码生成和实现",
        capabilities: ["编程", "调试", "代码审查"],
        nodeIds: [],
      });
    }

    if (intentLower.includes("测试") || intentLower.includes("test")) {
      roles.push({
        roleId: "tester",
        name: "测试工程师",
        responsibility: "负责测试用例编写和验证",
        capabilities: ["测试设计", "测试执行", "缺陷分析"],
        nodeIds: [],
      });
    }

    if (intentLower.includes("审查") || intentLower.includes("review")) {
      roles.push({
        roleId: "reviewer",
        name: "审查员",
        responsibility: "负责代码和质量审查",
        capabilities: ["静态分析", "规范检查", "安全审计"],
        nodeIds: [],
      });
    }

    if (intentLower.includes("文档") || intentLower.includes("document")) {
      roles.push({
        roleId: "documenter",
        name: "文档工程师",
        responsibility: "负责文档编写和维护",
        capabilities: ["技术写作", "API文档", "用户手册"],
        nodeIds: [],
      });
    }

    // 默认添加协调者
    if (roles.length > 1) {
      roles.push({
        roleId: "coordinator",
        name: "协调者",
        responsibility: "协调整个流程，分配任务和汇总结果",
        capabilities: ["任务分配", "进度跟踪", "结果汇总"],
        nodeIds: [],
      });
    }

    return roles;
  }

  /**
   * 结构设计阶段
   */
  private async structureDesign(
    intent: string,
    roles: MASFactoryAgentRole[]
  ): Promise<MASFactoryGraphTopology> {
    // 根据角色数量和意图推断拓扑结构
    const roleCount = roles.length;

    if (roleCount <= 1) {
      const roleId = roles[0]?.roleId || "main";
      return {
        structure: "sequential",
        connections: [
          { from: "START", to: roleId },
          { from: roleId, to: "END" },
        ],
      };
    }

    // 检测是否需要并行执行
    const intentLower = intent.toLowerCase();
    const needsParallel = intentLower.includes("并行") || intentLower.includes("同时") || intentLower.includes("parallel");

    if (needsParallel && roleCount > 2) {
      // 并行结构
      const workerRoles = roles.filter(r => r.roleId !== "coordinator");
      const connections: Array<{ from: string; to: string }> = [
        { from: "START", to: "coordinator" },
      ];

      for (const role of workerRoles) {
        connections.push({ from: "coordinator", to: role.roleId });
        connections.push({ from: role.roleId, to: "coordinator" });
      }

      connections.push({ from: "coordinator", to: "END" });

      return { structure: "hierarchical", connections };
    }

    // 默认顺序结构
    const connections: Array<{ from: string; to: string }> = [
      { from: "START", to: roles[0].roleId },
    ];

    for (let i = 0; i < roles.length - 1; i++) {
      connections.push({ from: roles[i].roleId, to: roles[i + 1].roleId });
    }

    connections.push({ from: roles[roles.length - 1].roleId, to: "END" });

    return { structure: "sequential", connections };
  }

  /**
   * 语义补全阶段
   */
  private async semanticCompletion(
    intent: string,
    role: MASFactoryAgentRole
  ): Promise<MASFactoryNodeConfig> {
    const config: MASFactoryNodeConfig = {
      systemRole: `你是${role.name}，${role.responsibility}。`,
      prompt: `任务: ${intent}\n\n请根据你的职责${role.responsibility}完成任务。`,
      temperature: 0.7,
      maxRetries: 3,
      timeout: this.config.defaultNodeTimeout,
    };

    // 根据角色添加特定配置
    if (role.capabilities.includes("编程")) {
      config.tools = ["code_editor", "linter", "debugger"];
    }

    if (role.capabilities.includes("测试")) {
      config.tools = ["test_runner", "coverage_analyzer"];
    }

    if (role.capabilities.includes("文档")) {
      config.tools = ["markdown_editor", "doc_generator"];
    }

    return config;
  }

  /**
   * 生成工作流
   */
  private generateWorkflow(vibeResult: VibeGraphingResult): MASFactoryWorkflowGraph {
    const workflow: MASFactoryWorkflowGraph = {
      graphId: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `VibeGraphing_${Date.now()}`,
      description: vibeResult.originalIntent,
      nodes: new Map(),
      edges: [],
      entryNodes: ["START"],
      exitNodes: ["END"],
      globalState: new Map(),
      executionTrace: [],
    };

    // 创建节点
    const entryNode: MASFactoryGraphNode = {
      id: "START",
      type: MASFactoryNodeType.CUSTOM,
      name: "开始",
      config: {},
      inputFields: [],
      outputFields: ["intent"],
      state: MASFactoryNodeState.PENDING,
      inEdges: [],
      outEdges: [vibeResult.assignedRoles[0]?.roleId || "main"],
    };
    workflow.nodes.set("START", entryNode);

    for (const role of vibeResult.assignedRoles) {
      const nodeConfig = vibeResult.semanticCompletion.get(role.roleId) || {};
      const node: MASFactoryGraphNode = {
        id: role.roleId,
        type: MASFactoryNodeType.AGENT,
        name: role.name,
        config: nodeConfig,
        inputFields: [],
        outputFields: [],
        state: MASFactoryNodeState.PENDING,
        inEdges: [],
        outEdges: [],
      };
      workflow.nodes.set(role.roleId, node);
      role.nodeIds.push(role.roleId);
    }

    const exitNode: MASFactoryGraphNode = {
      id: "END",
      type: MASFactoryNodeType.CUSTOM,
      name: "结束",
      config: {},
      inputFields: [],
      outputFields: ["result"],
      state: MASFactoryNodeState.PENDING,
      inEdges: [vibeResult.assignedRoles[vibeResult.assignedRoles.length - 1]?.roleId || "main"],
      outEdges: [],
    };
    workflow.nodes.set("END", exitNode);

    // 创建边
    for (const conn of vibeResult.generatedTopology.connections) {
      workflow.edges.push({
        source: conn.from,
        target: conn.to,
        flowType: MASFactoryFlowType.CONTROL,
      });
    }

    return workflow;
  }

  /**
   * 执行工作流
   */
  async execute(workflow: MASFactoryWorkflowGraph): Promise<MASFactoryExecutionResult> {
    console.log(`🏭 执行工作流: ${workflow.name}`);
    const startTime = Date.now();

    const result: MASFactoryExecutionResult = {
      resultId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.graphId,
      status: "success",
      outputs: new Map(),
      trace: [],
      duration: 0,
      errors: [],
    };

    try {
      // 初始化就绪节点
      let readyNodes = this.getReadyNodes(workflow);

      while (readyNodes.length > 0) {
        // 并发执行就绪节点（受 maxParallelNodes 限制）
        const batch = readyNodes.slice(0, this.config.maxParallelNodes);

        for (const nodeId of batch) {
          await this.executeNode(workflow, nodeId, result);
        }

        // 获取下一批就绪节点
        readyNodes = this.getReadyNodes(workflow);
      }

      // 检查所有节点是否完成
      const allCompleted = Array.from(workflow.nodes.values())
        .every(n => n.state === MASFactoryNodeState.COMPLETED || n.state === MASFactoryNodeState.SKIPPED);

      result.status = allCompleted ? "success" : "partial";

    } catch (error) {
      result.status = "failure";
      result.errors = [error instanceof Error ? error.message : String(error)];
    }

    result.duration = Date.now() - startTime;

    console.log(`🏭 工作流执行完成: ${result.status}, 耗时: ${result.duration}ms`);

    return result;
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    workflow: MASFactoryWorkflowGraph,
    nodeId: string,
    result: MASFactoryExecutionResult
  ): Promise<void> {
    const node = workflow.nodes.get(nodeId);
    if (!node) return;

    // 更新节点状态
    node.state = MASFactoryNodeState.RUNNING;

    // 记录跟踪
    result.trace.push({
      traceId: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      nodeId,
      eventType: "node_enter",
    });

    try {
      // 根据节点类型执行
      switch (node.type) {
        case MASFactoryNodeType.AGENT:
          await this.executeAgentNode(node, workflow);
          break;
        case MASFactoryNodeType.GRAPH:
          // 递归执行子图
          break;
        case MASFactoryNodeType.LOOP:
          // 执行循环逻辑
          break;
        case MASFactoryNodeType.SWITCH:
          // 执行路由逻辑
          break;
        default:
          // 默认执行
          await this.delay(10 + Math.random() * 20);
      }

      node.state = MASFactoryNodeState.COMPLETED;

    } catch (error) {
      node.state = MASFactoryNodeState.FAILED;
      result.errors.push(`${nodeId}: ${error}`);
    }

    // 记录退出跟踪
    result.trace.push({
      traceId: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      nodeId,
      eventType: "node_exit",
    });
  }

  /**
   * 执行代理节点
   */
  private async executeAgentNode(node: MASFactoryGraphNode, workflow: MASFactoryWorkflowGraph): Promise<void> {
    const config = node.config as MASFactoryNodeConfig;

    // 聚合输入消息
    const inputs = this.aggregateInputs(node, workflow);

    // 执行代理逻辑
    if (this.config.enableDetailedLogging) {
      console.log(`   ${node.name}: 执行代理逻辑`);
    }

    // 模拟执行延迟
    await this.delay(50 + Math.random() * 100);

    // 设置输出
    const outputKey = `${node.id}_output`;
    workflow.globalState.set(outputKey, `Output from ${node.name}`);

    // 发送消息到下游节点
    this.dispatchMessages(node, workflow);
  }

  /**
   * 聚合输入消息
   */
  private aggregateInputs(node: MASFactoryGraphNode, workflow: MASFactoryWorkflowGraph): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    for (const inEdgeId of node.inEdges) {
      const edge = workflow.edges.find(e => e.source === inEdgeId);
      if (edge) {
        inputs[edge.source] = workflow.globalState.get(`${edge.source}_output`);
      }
    }

    return inputs;
  }

  /**
   * 分发消息到下游节点
   */
  private dispatchMessages(node: MASFactoryGraphNode, workflow: MASFactoryWorkflowGraph): void {
    for (const outEdgeId of node.outEdges) {
      // 消息已通过全局状态传递
    }
  }

  /**
   * 获取就绪节点
   */
  private getReadyNodes(workflow: MASFactoryWorkflowGraph): string[] {
    const readyNodes: string[] = [];

    for (const [nodeId, node] of workflow.nodes) {
      if (node.state === MASFactoryNodeState.PENDING) {
        // 检查所有入边节点是否完成
        const dependenciesReady = node.inEdges.every(inEdgeId => {
          const inNode = workflow.nodes.get(inEdgeId);
          return inNode?.state === MASFactoryNodeState.COMPLETED;
        });

        if (dependenciesReady) {
          readyNodes.push(nodeId);
        }
      }
    }

    return readyNodes;
  }

  /**
   * 创建空工作流
   */
  private createEmptyWorkflow(): MASFactoryWorkflowGraph {
    return {
      graphId: `empty_${Date.now()}`,
      name: "Empty Workflow",
      nodes: new Map(),
      edges: [],
      entryNodes: [],
      exitNodes: [],
      globalState: new Map(),
      executionTrace: [],
    };
  }

  /**
   * 调度节点
   */
  schedule(workflow: MASFactoryWorkflowGraph): MASFactoryScheduleResult {
    const readyNodes = this.getReadyNodes(workflow);
    const blockedNodes = Array.from(workflow.nodes.keys()).filter(
      id => !readyNodes.includes(id) && workflow.nodes.get(id)?.state === MASFactoryNodeState.PENDING
    );

    return {
      scheduledNodes: [...readyNodes, ...blockedNodes],
      readyNodes,
      blockedNodes,
    };
  }

  /**
   * 初始化内置组合图
   */
  private initializeBuiltinComposedGraphs(): void {
    // 并行审稿组合图
    const parallelReview: MASFactoryComposedGraph = {
      composedId: "parallel_review",
      name: "并行审稿",
      description: "多个审稿者并行审查，然后汇总",
      internalNodes: [
        {
          templateId: "reviewer_template",
          name: "审稿人模板",
          type: MASFactoryNodeType.AGENT,
          baseConfig: {
            systemRole: "你是专业的审稿人",
            prompt: "请审查输入内容",
          },
          parameters: ["reviewer_name"],
          instanceCount: 0,
        },
      ],
      internalEdges: [],
      exposedParameters: new Map<string, unknown>([
        ["reviewer_count", 3],
        ["reviewer_names", ["reviewer_1", "reviewer_2", "reviewer_3"]],
      ]),
    };

    this.config.composedGraphs.set("parallel_review", parallelReview);
  }

  /**
   * 创建节点模板
   */
  createNodeTemplate(
    type: MASFactoryNodeType,
    baseConfig: MASFactoryNodeConfig,
    parameters: string[]
  ): MASFactoryNodeTemplate {
    const template: MASFactoryNodeTemplate = {
      templateId: `template_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      name: `${type}_template`,
      baseConfig,
      parameters,
      instanceCount: 0,
    };

    this.templates.set(template.templateId, template);

    return template;
  }

  /**
   * 从模板实例化节点
   */
  instantiateTemplate(
    templateId: string,
    params: Record<string, unknown>
  ): MASFactoryGraphNode {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    template.instanceCount++;

    const node: MASFactoryGraphNode = {
      id: `${template.templateId}_instance_${template.instanceCount}`,
      type: template.type,
      name: `${template.name}_${template.instanceCount}`,
      config: { ...template.baseConfig, customConfig: params },
      inputFields: [],
      outputFields: [],
      state: MASFactoryNodeState.PENDING,
      inEdges: [],
      outEdges: [],
    };

    return node;
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取 Vibe Graphing 历史
   */
  getVibeGraphingHistory(): VibeGraphingResult[] {
    return [...this.vibeGraphingHistory];
  }

  /**
   * 获取所有工作流
   */
  getWorkflows(): MASFactoryWorkflowGraph[] {
    return Array.from(this.workflows.values());
  }

  /**
   * 获取所有模板
   */
  getTemplates(): MASFactoryNodeTemplate[] {
    return Array.from(this.templates.values());
  }
}

/**
 * 工厂函数：创建 MASFactory 编排器
 */
export function createMASFactoryOrchestrator(config: MASFactoryConfig): MASFactoryOrchestrator {
  return new MASFactoryOrchestrator(config);
}

/**
 * 任务模板
 */
export const MASFactoryTemplates = {
  /** 并行审稿 */
  parallelReview: {
    description: "多个审稿者并行审查，然后汇总意见",
    recommendedConfig: {
      maxParallelNodes: 5,
      enableVisualization: true,
    },
  },

  /** 迭代优化 */
  iterativeOptimization: {
    description: "多轮迭代优化工作流",
    recommendedConfig: {
      maxParallelNodes: 1,
      enableDetailedLogging: true,
    },
  },

  /** 分层开发 */
  tieredDevelopment: {
    description: "分层开发流程，如架构设计、编码、测试",
    recommendedConfig: {
      maxParallelNodes: 3,
      enableDetailedLogging: true,
    },
  },

  /** Vibe Graphing 全流程 */
  vibeGraphingFull: {
    description: "使用 Vibe Graphing 从意图生成完整工作流",
    recommendedConfig: {
      maxParallelNodes: 3,
      enableVisualization: true,
      enableDetailedLogging: true,
    },
  },
};
