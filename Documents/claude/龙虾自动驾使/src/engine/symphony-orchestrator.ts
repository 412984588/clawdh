/**
 * 🎼 Symphony 去中心化编排器
 *
 * 基于 arXiv:2508.20019 "Symphony: A Decentralized Multi-Agent Framework"
 *
 * 核心思想：完全去中心化的多智能体协作，无需中央编排器
 *
 * 关键创新：
 * - 去中心化架构：智能体自主决策，无单点故障
 * - 共识协议：通过智能体间通信达成一致
 * - 自组织网络：智能体动态发现和协作
 * - 弹性扩展：智能体可随时加入/离开
 * - 性能超越：优于 AutoGen 和 CrewAI 等集中式框架
 *
 * @see {@link https://arxiv.org/abs/2508.20019} - Symphony Paper
 *
 * @version 2.19.0
 * @since 2025-03-11
 */

/**
 * 智能体类型（Symphony 角色）
 */
export enum SymphonyAgentType {
  /** 协调者 - 帮助其他智能体协作 */
  COORDINATOR = "coordinator",
  /** 执行者 - 执行具体任务 */
  EXECUTOR = "executor",
  /** 验证者 - 验证结果质量 */
  VALIDATOR = "validator",
  /** 观察者 - 监控系统状态 */
  OBSERVER = "observer",
  /** 学习者 - 从经验中学习 */
  LEARNER = "learner",
}

/**
 * 智能体状态
 */
export enum SymphonyAgentState {
  /** 空闲 */
  IDLE = "idle",
  /** 工作中 */
  WORKING = "working",
  /** 等待响应 */
  WAITING = "waiting",
  /** 完成 */
  DONE = "done",
  /** 错误 */
  ERROR = "error",
}

/**
 * 消息类型
 */
export enum SymphonyMessageType {
  /** 任务分配 */
  TASK_ASSIGN = "task_assign",
  /** 任务完成 */
  TASK_COMPLETE = "task_complete",
  /** 请求帮助 */
  REQUEST_HELP = "request_help",
  /** 提供帮助 */
  OFFER_HELP = "offer_help",
  /** 状态更新 */
  STATUS_UPDATE = "status_update",
  /** 共识请求 */
  CONSENSUS_REQUEST = "consensus_request",
  /** 共识响应 */
  CONSENSUS_RESPONSE = "consensus_response",
  /** 发现广播 */
  DISCOVERY_BROADCAST = "discovery_broadcast",
  /** 发现确认 */
  DISCOVERY_ACK = "discovery_ack",
}

/**
 * Symphony 智能体信息
 */
export interface SymphonyAgentInfo {
  /** 智能体 ID */
  agentId: string;
  /** 智能体类型 */
  agentType: SymphonyAgentType;
  /** 智能体状态 */
  state: SymphonyAgentState;
  /** 能力集合 */
  capabilities: string[];
  /** 当前负载 (0-1) */
  currentLoad: number;
  /** 可信度分数 (0-1) */
  trustScore: number;
  /** 最后活跃时间 */
  lastActiveTime: number;
  /** 通信地址 */
  address: string;
}

/**
 * Symphony 消息
 */
export interface SymphonyMessage {
  /** 消息 ID */
  messageId: string;
  /** 发送者 ID */
  senderId: string;
  /** 接收者 ID */
  receiverId: string;
  /** 消息类型 */
  messageType: SymphonyMessageType;
  /** 消息内容 */
  content: any;
  /** 时间戳 */
  timestamp: number;
  /** TTL */
  ttl: number;
}

/**
 * Symphony 任务
 */
export interface SymphonyTask {
  /** 任务 ID */
  taskId: string;
  /** 任务描述 */
  description: string;
  /** 所需能力 */
  requiredCapabilities: string[];
  /** 任务优先级 */
  priority: number;
  /** 任务状态 */
  status: SymphonyAgentState;
  /** 分配的智能体 */
  assignedAgents: string[];
  /** 子任务 */
  subtasks: SymphonyTask[];
  /** 创建时间 */
  createdAt: number;
  /** 截止时间 */
  deadline?: number;
}

/**
 * 共识结果
 */
export interface ConsensusResult {
  /** 是否达成共识 */
  agreed: boolean;
  /** 同意的智能体数 */
  agreeCount: number;
  /** 不同意的智能体数 */
  disagreeCount: number;
  /** 共识值 */
  consensusValue: any;
  /** 参与的智能体 */
  participants: string[];
  /** 讨论记录 */
  discussionLog: SymphonyMessage[];
}

/**
 * 网络拓扑状态
 */
export interface NetworkTopology {
  /** 所有智能体 */
  agents: Map<string, SymphonyAgentInfo>;
  /** 连接关系 (agentId -> connected agentIds) */
  connections: Map<string, Set<string>>;
  /** 消息队列 */
  messageQueues: Map<string, SymphonyMessage[]>;
}

/**
 * Symphony 编排配置
 */
export interface SymphonyConfig {
  /** 最大智能体数量 */
  maxAgents?: number;
  /** 消息 TTL (ms) */
  messageTtl?: number;
  /** 共识超时 (ms) */
  consensusTimeout?: number;
  /** 心跳间隔 (ms) */
  heartbeatInterval?: number;
  /** 最小可信度 */
  minTrustScore?: number;
  /** 最大任务优先级 */
  maxPriority?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 网络发现端口 */
  discoveryPort?: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<SymphonyConfig> = {
  maxAgents: 50,
  messageTtl: 30000,
  consensusTimeout: 10000,
  heartbeatInterval: 5000,
  minTrustScore: 0.3,
  maxPriority: 100,
  enableDetailedLogging: false,
  discoveryPort: 8765,
};

/**
 * 🎼 Symphony 去中心化编排器
 *
 * 实现完全去中心化的多智能体协作框架
 */
export class SymphonyOrchestrator {
  private config: Required<SymphonyConfig>;
  private network: NetworkTopology;
  private localAgentId: string;
  private localAgentType: SymphonyAgentType;
  private tasks: Map<string, SymphonyTask> = new Map();
  private messageHistory: SymphonyMessage[] = [];
  private heartbeatTimer?: NodeJS.Timeout;
  private discoveryTimer?: NodeJS.Timeout;

  constructor(
    agentType: SymphonyAgentType = SymphonyAgentType.EXECUTOR,
    config: SymphonyConfig = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.localAgentId = this.generateAgentId();
    this.localAgentType = agentType;

    // 初始化网络拓扑
    this.network = {
      agents: new Map(),
      connections: new Map(),
      messageQueues: new Map(),
    };

    // 注册本地智能体
    this.registerLocalAgent();

    // 启动心跳
    this.startHeartbeat();

    // 启动网络发现
    this.startDiscovery();

    console.log(`🎼 Symphony 编排器初始化 (${this.localAgentId})`);
    console.log(`   智能体类型: ${this.localAgentType}`);
    console.log(`   最大智能体: ${this.config.maxAgents}`);
  }

  /**
   * 执行去中心化编排任务
   */
  async orchestrate(taskDescription: string): Promise<{
    result: string;
    consensus: ConsensusResult;
   参与者: string[];
    executionTime: number;
  }> {
    console.log(`🎼 去中心化编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 1. 创建任务
    const task = this.createTask(taskDescription);
    this.tasks.set(task.taskId, task);

    // 2. 广播任务到网络
    await this.broadcastTask(task);

    // 3. 发现有能力执行的智能体
    const capableAgents = this.discoverCapableAgents(task);

    // 4. 执行去中心化共识
    const consensus = await this.reachConsensus(task, capableAgents);

    // 5. 执行任务（如果达成共识）
    let result = "";
    if (consensus.agreed) {
      result = await this.executeTask(task, consensus.participants);
    } else {
      result = "未达成共识，任务取消";
    }

    const executionTime = Date.now() - startTime;

    console.log(`🎼 编排完成: ${executionTime}ms, 共识: ${consensus.agreed ? "是" : "否"}`);

    return {
      result,
      consensus,
      参与者: consensus.participants,
      executionTime,
    };
  }

  /**
   * 注册本地智能体
   */
  private registerLocalAgent(): void {
    const agentInfo: SymphonyAgentInfo = {
      agentId: this.localAgentId,
      agentType: this.localAgentType,
      state: SymphonyAgentState.IDLE,
      capabilities: this.getCapabilitiesForType(this.localAgentType),
      currentLoad: 0,
      trustScore: 1.0,
      lastActiveTime: Date.now(),
      address: `localhost:${this.config.discoveryPort}`,
    };

    this.network.agents.set(this.localAgentId, agentInfo);
    this.network.connections.set(this.localAgentId, new Set());
    this.network.messageQueues.set(this.localAgentId, []);
  }

  /**
   * 根据类型获取能力
   */
  private getCapabilitiesForType(type: SymphonyAgentType): string[] {
    const capabilityMap: Record<SymphonyAgentType, string[]> = {
      [SymphonyAgentType.COORDINATOR]: ["task_decomposition", "agent_matching", "conflict_resolution"],
      [SymphonyAgentType.EXECUTOR]: ["code_generation", "data_processing", "api_calls"],
      [SymphonyAgentType.VALIDATOR]: ["result_verification", "quality_check", "consensus_checking"],
      [SymphonyAgentType.OBSERVER]: ["monitoring", "logging", "analytics"],
      [SymphonyAgentType.LEARNER]: ["pattern_recognition", "knowledge_extraction", "model_improvement"],
    };
    return capabilityMap[type] || [];
  }

  /**
   * 生成智能体 ID
   */
  private generateAgentId(): string {
    return `symphony_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建任务
   */
  private createTask(description: string): SymphonyTask {
    return {
      taskId: this.generateTaskId(),
      description,
      requiredCapabilities: this.inferCapabilities(description),
      priority: Math.floor(Math.random() * this.config.maxPriority),
      status: SymphonyAgentState.IDLE,
      assignedAgents: [],
      subtasks: [],
      createdAt: Date.now(),
    };
  }

  /**
   * 生成任务 ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 推断所需能力
   */
  private inferCapabilities(description: string): string[] {
    const capabilities: string[] = [];
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes("代码") || lowerDesc.includes("code")) {
      capabilities.push("code_generation");
    }
    if (lowerDesc.includes("数据") || lowerDesc.includes("data")) {
      capabilities.push("data_processing");
    }
    if (lowerDesc.includes("验证") || lowerDesc.includes("检查")) {
      capabilities.push("result_verification");
    }
    if (lowerDesc.includes("api") || lowerDesc.includes("接口")) {
      capabilities.push("api_calls");
    }

    return capabilities.length > 0 ? capabilities : ["general"];
  }

  /**
   * 广播任务到网络
   */
  private async broadcastTask(task: SymphonyTask): Promise<void> {
    const message: SymphonyMessage = {
      messageId: this.generateMessageId(),
      senderId: this.localAgentId,
      receiverId: "broadcast",
      messageType: SymphonyMessageType.TASK_ASSIGN,
      content: task,
      timestamp: Date.now(),
      ttl: this.config.messageTtl,
    };

    // 发送给所有连接的智能体
    for (const [agentId, connections] of this.network.connections.entries()) {
      if (agentId === this.localAgentId) {
        for (const connectedId of connections) {
          this.deliverMessage(connectedId, message);
        }
      }
    }

    this.messageHistory.push(message);
  }

  /**
   * 生成消息 ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 投递消息
   */
  private deliverMessage(receiverId: string, message: SymphonyMessage): void {
    const queue = this.network.messageQueues.get(receiverId);
    if (queue) {
      queue.push(message);
    }
  }

  /**
   * 发现有能力执行的智能体
   */
  private discoverCapableAgents(task: SymphonyTask): string[] {
    const capableAgents: string[] = [];

    for (const [agentId, agentInfo] of this.network.agents) {
      // 跳过自己
      if (agentId === this.localAgentId) continue;

      // 检查能力匹配
      const hasCapability = task.requiredCapabilities.some(cap =>
        agentInfo.capabilities.includes(cap)
      );

      // 检查负载
      const hasCapacity = agentInfo.currentLoad < 0.8;

      // 检查可信度
      const isTrusted = agentInfo.trustScore >= this.config.minTrustScore;

      if (hasCapability && hasCapacity && isTrusted) {
        capableAgents.push(agentId);
      }
    }

    return capableAgents.sort((a, b) => {
      const agentA = this.network.agents.get(a)!;
      const agentB = this.network.agents.get(b)!;
      return agentB.trustScore - agentA.trustScore;
    });
  }

  /**
   * 达成共识
   */
  private async reachConsensus(
    task: SymphonyTask,
    capableAgents: string[]
  ): Promise<ConsensusResult> {
    const participants = [this.localAgentId, ...capableAgents.slice(0, 4)];
    const discussionLog: SymphonyMessage[] = [];

    // 模拟共识过程
    const agreeVotes: string[] = [];
    const disagreeVotes: string[] = [];

    // 本地智能体投票
    if (this.shouldAcceptTask(task)) {
      agreeVotes.push(this.localAgentId);
    } else {
      disagreeVotes.push(this.localAgentId);
    }

    // 收集其他智能体的投票
    for (const agentId of capableAgents.slice(0, 4)) {
      const agentInfo = this.network.agents.get(agentId);
      if (!agentInfo) continue;

      // 模拟投票延迟
      await this.delay(10 + Math.random() * 50);

      // 基于可信度和能力匹配度决定投票
      const capabilityMatch = task.requiredCapabilities.some(cap =>
        agentInfo.capabilities.includes(cap)
      );

      if (capabilityMatch && agentInfo.trustScore > 0.5) {
        agreeVotes.push(agentId);
      } else {
        disagreeVotes.push(agentId);
      }

      // 记录消息
      const message: SymphonyMessage = {
        messageId: this.generateMessageId(),
        senderId: agentId,
        receiverId: this.localAgentId,
        messageType: SymphonyMessageType.CONSENSUS_RESPONSE,
        content: {
          taskId: task.taskId,
          agree: agreeVotes.includes(agentId),
        },
        timestamp: Date.now(),
        ttl: this.config.messageTtl,
      };
      discussionLog.push(message);
    }

    // 判断是否达成共识（简单多数 + 最少参与）
    const totalVotes = agreeVotes.length + disagreeVotes.length;
    const agreed = agreeVotes.length > disagreeVotes.length && totalVotes >= 3;

    const result: ConsensusResult = {
      agreed,
      agreeCount: agreeVotes.length,
      disagreeCount: disagreeVotes.length,
      consensusValue: {
        taskId: task.taskId,
        accepted: agreed,
      },
      participants,
      discussionLog,
    };

    console.log(`   共识结果: ${agreeVotes.length}/${totalVotes} 同意`);

    return result;
  }

  /**
   * 判断是否接受任务
   */
  private shouldAcceptTask(task: SymphonyTask): boolean {
    // 基于能力匹配度和当前负载
    const localAgent = this.network.agents.get(this.localAgentId);
    if (!localAgent) return false;

    const hasCapability = task.requiredCapabilities.some(cap =>
      localAgent.capabilities.includes(cap)
    );

    const hasCapacity = localAgent.currentLoad < 0.8;

    return hasCapability && hasCapacity;
  }

  /**
   * 执行任务
   */
  private async executeTask(task: SymphonyTask, participants: string[]): Promise<string> {
    console.log(`   执行任务: ${participants.length} 个智能体协作`);

    // 更新本地智能体状态
    const localAgent = this.network.agents.get(this.localAgentId);
    if (localAgent) {
      localAgent.state = SymphonyAgentState.WORKING;
      localAgent.currentLoad = Math.min(1, localAgent.currentLoad + 0.3);
    }

    // 模拟执行延迟
    await this.delay(100 + Math.random() * 200);

    // 生成结果
    const result = this.generateExecutionResult(task, participants);

    // 恢复本地智能体状态
    if (localAgent) {
      localAgent.state = SymphonyAgentState.IDLE;
      localAgent.currentLoad = Math.max(0, localAgent.currentLoad - 0.3);
      localAgent.lastActiveTime = Date.now();
    }

    // 更新可信度（成功执行）
    for (const participantId of participants) {
      const agent = this.network.agents.get(participantId);
      if (agent && participantId !== this.localAgentId) {
        agent.trustScore = Math.min(1, agent.trustScore + 0.05);
      }
    }

    return result;
  }

  /**
   * 生成执行结果
   */
  private generateExecutionResult(task: SymphonyTask, participants: string[]): string {
    const roles = participants.map(id => {
      const agent = this.network.agents.get(id);
      return agent?.agentType || SymphonyAgentType.EXECUTOR;
    });

    return `🎼 任务完成: "${task.description}"\n` +
      `协作智能体: ${participants.length} 个\n` +
      `角色分布: ${roles.join(", ")}\n` +
      `执行时间: ${Date.now() - task.createdAt}ms`;
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const localAgent = this.network.agents.get(this.localAgentId);
      if (localAgent) {
        localAgent.lastActiveTime = Date.now();

        // 检查过期智能体
        this.cleanupStaleAgents();
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 启动网络发现
   */
  private startDiscovery(): void {
    this.discoveryTimer = setInterval(() => {
      // 模拟发现新智能体
      if (this.network.agents.size < this.config.maxAgents && Math.random() > 0.7) {
        this.discoverNewAgent();
      }
    }, 10000);
  }

  /**
   * 发现新智能体
   */
  private discoverNewAgent(): void {
    const newAgentId = this.generateAgentId();
    const types = Object.values(SymphonyAgentType);
    const randomType = types[Math.floor(Math.random() * types.length)];

    const newAgent: SymphonyAgentInfo = {
      agentId: newAgentId,
      agentType: randomType,
      state: SymphonyAgentState.IDLE,
      capabilities: this.getCapabilitiesForType(randomType),
      currentLoad: Math.random() * 0.5,
      trustScore: 0.5 + Math.random() * 0.5,
      lastActiveTime: Date.now(),
      address: `remote:${Math.floor(Math.random() * 1000)}`,
    };

    this.network.agents.set(newAgentId, newAgent);
    this.network.connections.set(newAgentId, new Set());

    // 建立随机连接
    const existingAgents = Array.from(this.network.agents.keys()).filter(id => id !== newAgentId);
    const connectionCount = Math.min(3, existingAgents.length);
    for (let i = 0; i < connectionCount; i++) {
      const targetId = existingAgents[Math.floor(Math.random() * existingAgents.length)];
      this.network.connections.get(newAgentId)!.add(targetId);
      this.network.connections.get(targetId)!.add(newAgentId);
    }

    this.network.messageQueues.set(newAgentId, []);

    if (this.config.enableDetailedLogging) {
      console.log(`   新智能体加入: ${newAgentId} (${randomType})`);
    }
  }

  /**
   * 清理过期智能体
   */
  private cleanupStaleAgents(): void {
    const now = Date.now();
    const staleThreshold = this.config.heartbeatInterval * 3;

    for (const [agentId, agent] of this.network.agents.entries()) {
      if (agentId === this.localAgentId) continue;

      if (now - agent.lastActiveTime > staleThreshold) {
        this.network.agents.delete(agentId);
        this.network.connections.delete(agentId);
        this.network.messageQueues.delete(agentId);

        if (this.config.enableDetailedLogging) {
          console.log(`   智能体离开: ${agentId}`);
        }
      }
    }
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取网络状态
   */
  getNetworkState(): {
    totalAgents: number;
    connections: number;
    messages: number;
    localAgent: SymphonyAgentInfo | undefined;
  } {
    let totalConnections = 0;
    for (const connections of this.network.connections.values()) {
      totalConnections += connections.size;
    }

    let totalMessages = 0;
    for (const queue of this.network.messageQueues.values()) {
      totalMessages += queue.length;
    }

    return {
      totalAgents: this.network.agents.size,
      connections: totalConnections,
      messages: totalMessages,
      localAgent: this.network.agents.get(this.localAgentId),
    };
  }

  /**
   * 获取所有智能体
   */
  getAgents(): SymphonyAgentInfo[] {
    return Array.from(this.network.agents.values());
  }

  /**
   * 获取消息历史
   */
  getMessageHistory(): SymphonyMessage[] {
    return [...this.messageHistory];
  }

  /**
   * 停止编排器
   */
  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
    }
    console.log(`🎼 Symphony 编排器已停止 (${this.localAgentId})`);
  }
}

/**
 * 工厂函数：创建 Symphony 编排器
 */
export function createSymphonyOrchestrator(
  agentType?: SymphonyAgentType,
  config?: SymphonyConfig
): SymphonyOrchestrator {
  return new SymphonyOrchestrator(agentType, config);
}

/**
 * 任务模板
 */
export const SymphonyTemplates = {
  /** 代码协作任务 */
  codeCollaboration: {
    description: "多智能体协作编写和审查代码",
    recommendedConfig: {
      maxAgents: 10,
      minTrustScore: 0.7,
    },
  },

  /** 数据分析任务 */
  dataAnalysis: {
    description: "分布式数据分析和处理",
    recommendedConfig: {
      maxAgents: 20,
      minTrustScore: 0.5,
    },
  },

  /** 研究任务 */
  research: {
    description: "多智能体并行研究和综合",
    recommendedConfig: {
      maxAgents: 15,
      minTrustScore: 0.6,
      consensusTimeout: 15000,
    },
  },
};
