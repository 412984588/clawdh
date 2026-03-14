/**
 * 🔄 Multi-Turn Multi-Agent Orchestration Framework
 *
 * 基于 arXiv:2509.23537 "Beyond the Strongest LLM: Multi-Turn Multi-Agent Orchestration"
 *
 * 核心思想：异构LLM代理通过结构化协议协调，迭代提出答案或投票
 *
 * 三阶段协调：
 * 1. Agent Action - 代理异步操作（生成新答案 or 投票）
 * 2. Consensus - 多数投票选择获胜者
 * 3. Final Presentation - 获胜者综合最终答案
 *
 * 关键创新：
 * - 互斥动作约束：每个代理只能投票或生成答案（不能同时）
 * - 动态重启：新答案出现时触发所有代理重置
 * - 投票策略可配置：身份披露、投票可见性
 *
 * @see {@link https://arxiv.org/abs/2509.23537} - Multi-Turn Orchestration Paper
 *
 * @version 2.14.0
 * @since 2025-03-11
 */

/**
 * 动作类型
 */
export enum ActionType {
  /** 生成新答案 */
  ANSWER = "answer",
  /** 投票 */
  VOTE = "vote",
}

/**
 * 投票身份披露策略
 */
export enum VotingIdentityDisclosure {
  /** 匿名投票 - 使用 agent_1, agent_2 */
  ANONYMOUS = "anonymous",
  /** 实名投票 - 使用真实模型名称 */
  IDENTIFIED = "identified",
}

/**
 * 投票计票可见性
 */
export enum VoteTallyVisibility {
  /** 隐藏投票 - 代理看不到其他人的投票 */
  HIDDEN = "hidden",
  /** 可见投票 - 代理可以看到所有已投的票 */
  VISIBLE = "visible",
}

/**
 * 代理状态
 */
export interface AgentState {
  /** 代理ID */
  agentId: string;
  /** 答案内容 */
  answer: string;
  /** 是否已投票 */
  hasVoted: boolean;
  /** 投票记录 [targetAgentId, reason] */
  votes: Array<[string, string]>;
  /** 是否等待重启 */
  restartPending: boolean;
  /** 是否被终止 */
  isKilled: boolean;
  /** 超时原因 */
  timeoutReason?: string;
}

/**
 * 编排器状态
 */
export interface OrchestratorState {
  /** 工作流阶段 */
  workflowPhase: "action" | "consensus" | "final";
  /** 当前任务 */
  currentTask?: string;
  /** 选中的获胜代理 */
  selectedAgent?: string;
  /** 总Token数 */
  totalTokens: number;
  /** 协调开始时间 */
  coordinationStartTime: number;
}

/**
 * 投票记录
 */
export interface VoteRecord {
  /** 投票者ID */
  voterId: string;
  /** 目标代理ID（被投给的答案） */
  targetAgentId: string;
  /** 投票理由 */
  reason: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 动态事件
 */
export interface DynamicEvent {
  /** 事件类型 */
  type: "answer_generated" | "vote_cast" | "restart_triggered" | "consensus_reached";
  /** 代理ID */
  agentId: string;
  /** 数据 */
  data?: any;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 最终输出
 */
export interface MultiTurnOutput {
  /** 最终答案 */
  finalAnswer: string;
  /** 获胜代理 */
  winner: string;
  /** 总轮数 */
  totalRounds: number;
  /** 总耗时（ms） */
  executionTime: number;
  /** 是否达成共识 */
  consensusReached: boolean;
  /** 代理统计 */
  agentStats: {
    totalAgents: number;
    activeAgents: number;
    votesCast: number;
    answersGenerated: number;
  };
  /** 事件历史 */
  eventHistory: DynamicEvent[];
}

/**
 * Multi-Turn 配置
 */
export interface MultiTurnConfig {
  /** 投票身份披露策略 */
  votingIdentityDisclosure?: VotingIdentityDisclosure;
  /** 投票计票可见性 */
  voteTallyVisibility?: VoteTallyVisibility;
  /** 最大轮数限制 */
  maxRounds?: number;
  /** 每轮超时时间（ms） */
  roundTimeout?: number;
  /** 总超时时间（ms） */
  totalTimeout?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
  /** 代理数量 */
  numAgents?: number;
  /** 是否启用动态重启 */
  enableDynamicRestart?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<MultiTurnConfig> = {
  votingIdentityDisclosure: VotingIdentityDisclosure.ANONYMOUS,
  voteTallyVisibility: VoteTallyVisibility.HIDDEN,
  maxRounds: 10,
  roundTimeout: 60000,
  totalTimeout: 300000,
  enableDetailedLogging: false,
  numAgents: 4,
  enableDynamicRestart: true,
};

/**
 * 🔄 Multi-Turn 编排器
 *
 * 实现基于互斥动作约束的多智能体协调
 */
export class MultiTurnOrchestrator {
  private config: Required<MultiTurnConfig>;
  private agents: Map<string, AgentState> = new Map();
  private orchestratorState: OrchestratorState;
  private eventHistory: DynamicEvent[] = [];
  private currentRound = 0;
  private latestAnswerSet: Map<string, string> = new Map(); // agentId -> answer
  private voteRecords: VoteRecord[] = [];

  constructor(config: MultiTurnConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.orchestratorState = {
      workflowPhase: "action",
      totalTokens: 0,
      coordinationStartTime: Date.now(),
    };
    console.log(`🔄 Multi-Turn 编排器初始化 (${this.config.numAgents} agents)`);
    console.log(`   配置: ${this.config.votingIdentityDisclosure} voting, ${this.config.voteTallyVisibility} tally`);
  }

  /**
   * 执行多轮编排任务
   */
  async orchestrate(taskDescription: string): Promise<MultiTurnOutput> {
    console.log(`🔄 多轮编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 初始化代理
    this.initializeAgents();

    // Phase 1: Agent Action - 代理异步操作
    this.orchestratorState.workflowPhase = "action";
    await this.executeAgentActionPhase(taskDescription);

    // Phase 2: Consensus - 达成共识
    this.orchestratorState.workflowPhase = "consensus";
    const winner = this.executeConsensusPhase();

    // Phase 3: Final Presentation - 生成最终答案
    this.orchestratorState.workflowPhase = "final";
    const finalAnswer = await this.executeFinalPresentationPhase(winner, taskDescription);

    const executionTime = Date.now() - startTime;
    const consensusStrength = this.calculateConsensusStrength();
    const consensusReached = consensusStrength > 0.5;

    const result: MultiTurnOutput = {
      finalAnswer,
      winner,
      totalRounds: this.currentRound,
      executionTime,
      consensusReached,
      agentStats: {
        totalAgents: this.config.numAgents,
        activeAgents: this.getActiveAgentCount(),
        votesCast: this.voteRecords.length,
        answersGenerated: this.latestAnswerSet.size,
      },
      eventHistory: [...this.eventHistory],
    };

    console.log(`🔄 编排完成: ${result.totalRounds} 轮, ${executionTime}ms, 共识: ${(consensusStrength * 100).toFixed(1)}%`);

    return result;
  }

  /**
   * 初始化代理
   */
  private initializeAgents(): void {
    for (let i = 0; i < this.config.numAgents; i++) {
      const agentId = this.getAgentId(i);
      this.agents.set(agentId, {
        agentId,
        answer: "",
        hasVoted: false,
        votes: [],
        restartPending: false,
        isKilled: false,
      });
    }
  }

  /**
   * Phase 1: 代理动作阶段
   */
  private async executeAgentActionPhase(task: string): Promise<void> {
    console.log(`   🤖 Phase 1: Agent Action`);

    // 每个代理生成初始答案或投票
    for (const agentId of this.agents.keys()) {
      await this.simulateAgentAction(agentId, task);
      this.currentRound++;
    }

    console.log(`   ✅ Agent Action 完成: ${this.currentRound} 轮`);
  }

  /**
   * 模拟代理动作（投票或生成答案）
   */
  private async simulateAgentAction(agentId: string, task: string): Promise<void> {
    const state = this.agents.get(agentId)!;

    // 模拟延迟
    const delay = 50 + Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 决定动作：生成答案或投票
    const action = this.decideAgentAction(agentId);

    if (action === ActionType.ANSWER) {
      // 生成新答案
      const answer = this.generateAnswer(agentId, task);
      state.answer = answer;
      this.latestAnswerSet.set(agentId, answer);

      this.recordEvent({
        type: "answer_generated",
        agentId,
        data: { answer: answer.substring(0, 50) + "..." },
        timestamp: Date.now(),
      });

      // 触发动态重启
      if (this.config.enableDynamicRestart) {
        this.triggerDynamicRestart(agentId);
      }
    } else {
      // 投票
      const targetAgent = this.selectTargetToVote(agentId);
      if (targetAgent) {
        const reason = this.generateVoteReason(agentId, targetAgent);
        state.votes.push([targetAgent, reason]);
        state.hasVoted = true;

        this.voteRecords.push({
          voterId: agentId,
          targetAgentId: targetAgent,
          reason,
          timestamp: Date.now(),
        });

        this.recordEvent({
          type: "vote_cast",
          agentId,
          data: { targetAgent, reason },
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * 触发动态重启
   */
  private triggerDynamicRestart(triggerAgentId: string): void {
    this.recordEvent({
      type: "restart_triggered",
      agentId: triggerAgentId,
      data: { newAnswerProvidedBy: triggerAgentId },
      timestamp: Date.now(),
    });

    // 重置所有其他代理的投票状态
    for (const [agentId, state] of this.agents.entries()) {
      if (agentId !== triggerAgentId) {
        state.restartPending = true;
        state.hasVoted = false;
      }
    }

    if (this.config.enableDetailedLogging) {
      console.log(`   🔄 动态重启由 ${triggerAgentId} 触发`);
    }
  }

  /**
   * Phase 2: 共识阶段
   */
  private executeConsensusPhase(): string {
    console.log(`   🗳️  Phase 2: Consensus`);

    // 统计每个答案的投票数
    const voteCounts = new Map<string, number>();

    for (const record of this.voteRecords) {
      // 排除待重启的投票
      const voterState = this.agents.get(record.voterId);
      if (voterState?.restartPending) continue;

      voteCounts.set(
        record.targetAgentId,
        (voteCounts.get(record.targetAgentId) || 0) + 1
      );
    }

    // 找出投票最多的代理
    let winner = "";
    let maxVotes = 0;
    for (const [agentId, count] of voteCounts.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        winner = agentId;
      }
    }

    // 检查是否达到多数
    const totalValidVotes = this.voteRecords.filter(
      r => !this.agents.get(r.voterId)?.restartPending
    ).length;
    const hasMajority = maxVotes > totalValidVotes / 2;

    this.orchestratorState.selectedAgent = winner;

    console.log(
      `   📊 共识结果: ${winner} (${maxVotes}/${totalValidVotes} 票)` +
      (hasMajority ? " ✓" : " ⚠️ 未达多数")
    );

    return winner;
  }

  /**
   * Phase 3: 最终呈现阶段
   */
  private async executeFinalPresentationPhase(
    winner: string,
    task: string
  ): Promise<string> {
    console.log(`   📝 Phase 3: Final Presentation`);

    const winnerState = this.agents.get(winner);
    const winnerAnswer = this.latestAnswerSet.get(winner) || "";

    // 综合所有答案生成最终输出
    const allAnswers = Array.from(this.latestAnswerSet.entries()).map(
      ([id, answer]) => ({
        agentId: this.formatAgentId(id),
        answer: answer.substring(0, 100),
      })
    );

    const finalAnswer = this.synthesizeFinalAnswer(
      winner,
      winnerAnswer,
      allAnswers,
      task
    );

    return finalAnswer;
  }

  /**
   * 决定代理动作（投票 vs 生成答案）
   */
  private decideAgentAction(agentId: string): ActionType {
    // 简化实现：基于概率和当前状态决定
    const hasAnswers = this.latestAnswerSet.size > 0;
    const hasVotes = this.voteRecords.some(r => r.voterId === agentId);

    if (!hasAnswers) {
      return ActionType.ANSWER; // 必须先生成答案
    }

    if (!hasVotes) {
      // 60% 概率投票，40% 概率生成新答案
      return Math.random() < 0.6 ? ActionType.VOTE : ActionType.ANSWER;
    }

    // 已投票且没有重启：保持静默
    return ActionType.VOTE;
  }

  /**
   * 选择投票目标
   */
  private selectTargetToVote(agentId: string): string | null {
    const availableAnswers = Array.from(this.latestAnswerSet.keys()).filter(
      id => id !== agentId
    );

    if (availableAnswers.length === 0) return null;

    // 简化策略：随机选择
    return availableAnswers[Math.floor(Math.random() * availableAnswers.length)];
  }

  /**
   * 生成投票理由
   */
  private generateVoteReason(voterId: string, targetAgentId: string): string {
    const reasons = [
      `Agent ${this.formatAgentId(targetAgentId)} 提供了全面的分析`,
      `答案逻辑清晰，推理步骤完整`,
      `覆盖了问题的关键要点`,
      `提供了具体的解决方案`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * 生成答案
   */
  private generateAnswer(agentId: string, task: string): string {
    const approaches = [
      "基于系统性分析的方法论",
      "采用逐步推理的框架",
      "综合考虑多个因素的方法",
      "结合理论与实践的方案",
    ];
    const approach = approaches[Math.floor(Math.random() * approaches.length)];
    return `${approach} (${agentId}) 针对 "${task.substring(0, 30)}..."`;
  }

  /**
   * 综合最终答案
   */
  private synthesizeFinalAnswer(
    winner: string,
    winnerAnswer: string,
    allAnswers: Array<{ agentId: string; answer: string }>,
    task: string
  ): string {
    // 获胜者整合所有答案
    return `经过多轮协作，综合各代理分析：\n\n` +
      `主要方案: ${winnerAnswer}\n\n` +
      `其他方案考虑: ${allAnswers.map(a => a.answer).join("; ")}\n\n` +
      `最终共识由 ${this.formatAgentId(winner)} 达成。`;
  }

  /**
   * 计算共识强度
   */
  private calculateConsensusStrength(): number {
    if (this.voteRecords.length === 0) return 0;

    const voteCounts = new Map<string, number>();
    for (const record of this.voteRecords) {
      if (!this.agents.get(record.voterId)?.restartPending) {
        voteCounts.set(
          record.targetAgentId,
          (voteCounts.get(record.targetAgentId) || 0) + 1
        );
      }
    }

    const maxVotes = Math.max(...voteCounts.values(), 0);
    const totalVotes = this.voteRecords.length;

    return totalVotes > 0 ? maxVotes / totalVotes : 0;
  }

  /**
   * 获取活跃代理数
   */
  private getActiveAgentCount(): number {
    return Array.from(this.agents.values()).filter(a => !a.isKilled).length;
  }

  /**
   * 格式化代理ID（根据身份披露策略）
   */
  private formatAgentId(agentId: string): string {
    if (this.config.votingIdentityDisclosure === VotingIdentityDisclosure.ANONYMOUS) {
      return `agent_${agentId.split("_")[1] || agentId}`;
    }
    return agentId;
  }

  /**
   * 获取代理ID
   */
  private getAgentId(index: number): string {
    return `agent_${index}`;
  }

  /**
   * 记录事件
   */
  private recordEvent(event: DynamicEvent): void {
    this.eventHistory.push(event);
  }

  /**
   * 获取事件历史
   */
  getEventHistory(): DynamicEvent[] {
    return [...this.eventHistory];
  }

  /**
   * 获取编排器状态
   */
  getState(): OrchestratorState {
    return { ...this.orchestratorState };
  }
}

/**
 * 工厂函数：创建 Multi-Turn 编排器
 */
export function createMultiTurnOrchestrator(
  config?: MultiTurnConfig
): MultiTurnOrchestrator {
  return new MultiTurnOrchestrator(config);
}

/**
 * 任务模板
 */
export const MultiTurnTemplates = {
  /** 问题回答任务 */
  questionAnswering: {
    description: "多代理协作回答复杂问题",
    recommendedConfig: {
      votingIdentityDisclosure: VotingIdentityDisclosure.ANONYMOUS,
      voteTallyVisibility: VoteTallyVisibility.HIDDEN,
      enableDynamicRestart: true,
    },
  },

  /** 代码审查任务 */
  codeReview: {
    description: "多代理协作进行代码审查",
    recommendedConfig: {
      votingIdentityDisclosure: VotingIdentityDisclosure.IDENTIFIED,
      voteTallyVisibility: VoteTallyVisibility.VISIBLE,
      enableDynamicRestart: false,
    },
  },

  /** 创意写作任务 */
  creativeWriting: {
    description: "多代理协作生成创意内容",
    recommendedConfig: {
      votingIdentityDisclosure: VotingIdentityDisclosure.ANONYMOUS,
      voteTallyVisibility: VoteTallyVisibility.HIDDEN,
      enableDynamicRestart: true,
    },
  },
};
