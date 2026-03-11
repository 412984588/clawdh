/**
 * 🤝 Croto 跨团队编排器
 *
 * 基于 arXiv:2406.08979 "Multi-Agent Collaboration via Cross-Team Orchestration"
 *
 * 核心思想：可扩展的多团队协作框架，实现跨团队的智能体编排
 *
 * 关键创新：
 * - 多团队组织：将智能体组织成多个专业团队
 * - 跨团队协作：团队间共享洞察和联合决策
 * - 自组织行为：团队以自组织方式交互
 * - 并发推理：多个团队同时处理不同方面
 * - 跨团队提案：团队共同提出面向任务的解决方案
 *
 * @see {@link https://arxiv.org/abs/2406.08979} - Croto Paper
 * @see {@link https://arxiv.org/html/2406.08979v2} - HTML Version
 *
 * @version 2.21.0
 * @since 2025-03-11
 */

/**
 * 团队类型
 */
export enum CrotoTeamType {
  /** 分析团队 */
  ANALYSIS = "analysis",
  /** 设计团队 */
  DESIGN = "design",
  /** 开发团队 */
  DEVELOPMENT = "development",
  /** 测试团队 */
  TESTING = "testing",
  /** 部署团队 */
  DEPLOYMENT = "deployment",
  /** 维护团队 */
  MAINTENANCE = "maintenance",
}

/**
 * 团队状态
 */
export enum CrotoTeamState {
  /** 空闲 */
  IDLE = "idle",
  /** 工作中 */
  WORKING = "working",
  /** 等待协作 */
  WAITING_COLLABORATION = "waiting_collaboration",
  /** 已完成 */
  COMPLETED = "completed",
}

/**
 * 智能体角色
 */
export enum CrotoAgentRole {
  /** 团队领导 */
  TEAM_LEAD = "team_lead",
  /** 领域专家 */
  DOMAIN_EXPERT = "domain_expert",
  /** 协调者 */
  COORDINATOR = "coordinator",
  /** 执行者 */
  EXECUTOR = "executor",
  /** 审查者 */
  REVIEWER = "reviewer",
}

/**
 * Croto 智能体
 */
export interface CrotoAgent {
  /** 智能体 ID */
  agentId: string;
  /** 智能体名称 */
  agentName: string;
  /** 角色 */
  role: CrotoAgentRole;
  /** 所属团队 */
  teamId: string;
  /** 技能 */
  skills: string[];
  /** 可用性 (0-1) */
  availability: number;
}

/**
 * Croto 团队
 */
export interface CrotoTeam {
  /** 团队 ID */
  teamId: string;
  /** 团队名称 */
  teamName: string;
  /** 团队类型 */
  teamType: CrotoTeamType;
  /** 状态 */
  state: CrotoTeamState;
  /** 成员 */
  members: CrotoAgent[];
  /** 当前任务 */
  currentTask?: CrotoTask;
  /** 提案 */
  proposals: CrotoProposal[];
  /** 协作记录 */
  collaborations: CrotoCollaboration[];
}

/**
 * Croto 任务
 */
export interface CrotoTask {
  /** 任务 ID */
  taskId: string;
  /** 任务描述 */
  description: string;
  /** 任务阶段 */
  phase: string;
  /** 优先级 */
  priority: number;
  /** 所需团队类型 */
  requiredTeams: CrotoTeamType[];
  /** 状态 */
  status: CrotoTeamState;
  /** 子任务 */
  subtasks: CrotoSubtask[];
}

/**
 * Croto 子任务
 */
export interface CrotoSubtask {
  /** 子任务 ID */
  subtaskId: string;
  /** 描述 */
  description: string;
  /** 分配团队 */
  assignedTeam: string;
  /** 状态 */
  status: CrotoTeamState;
  /** 依赖 */
  dependencies: string[];
}

/**
 * 提案
 */
export interface CrotoProposal {
  /** 提案 ID */
  proposalId: string;
  /** 来源团队 */
  sourceTeam: string;
  /** 提案内容 */
  content: string;
  /** 评分 */
  score: number;
  /** 支持团队 */
  supporters: string[];
  /** 反对团队 */
  opponents: string[];
  /** 时间戳 */
  timestamp: number;
}

/**
 * 协作记录
 */
export interface CrotoCollaboration {
  /** 协作 ID */
  collaborationId: string;
  /** 参与团队 */
  participants: string[];
  /** 协作类型 */
  type: "proposal_sharing" | "joint_decision" | "resource_sharing";
  /** 内容 */
  content: any;
  /** 结果 */
  outcome: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 跨团队编排结果
 */
export interface CrotoOrchestrationResult {
  /** 任务 ID */
  taskId: string;
  /** 最终方案 */
  finalProposal: string;
  /** 参与团队 */
  participatingTeams: string[];
  /** 协作次数 */
  collaborationCount: number;
  /** 总耗时 (ms) */
  executionTime: number;
  /** 成功标志 */
  success: boolean;
}

/**
 * Croto 配置
 */
export interface CrotoConfig {
  /** 最大团队数 */
  maxTeams?: number;
  /** 每团队最大智能体数 */
  maxAgentsPerTeam?: number;
  /** 提案超时 (ms) */
  proposalTimeout?: number;
  /** 协作轮数 */
  collaborationRounds?: number;
  /** 是否启用详细日志 */
  enableDetailedLogging?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<CrotoConfig> = {
  maxTeams: 6,
  maxAgentsPerTeam: 5,
  proposalTimeout: 30000,
  collaborationRounds: 3,
  enableDetailedLogging: false,
};

/**
 * 🤝 Croto 跨团队编排器
 *
 * 实现多团队协作编排框架
 */
export class CrotoOrchestrator {
  private config: Required<CrotoConfig>;
  private teams: Map<string, CrotoTeam> = new Map();
  private tasks: Map<string, CrotoTask> = new Map();
  private proposals: Map<string, CrotoProposal> = new Map();
  private collaborations: Map<string, CrotoCollaboration> = new Map();

  constructor(config: CrotoConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 初始化默认团队
    this.initializeTeams();

    console.log(`🤝 Croto 跨团队编排器初始化`);
    console.log(`   团队: ${this.teams.size} 个`);
    console.log(`   最大团队数: ${this.config.maxTeams}`);
  }

  /**
   * 执行跨团队编排
   */
  async orchestrate(taskDescription: string): Promise<CrotoOrchestrationResult> {
    console.log(`🤝 跨团队编排开始: "${taskDescription.substring(0, 50)}..."`);
    const startTime = Date.now();

    // 1. 创建任务
    const task = this.createTask(taskDescription);
    this.tasks.set(task.taskId, task);

    // 2. 分配任务到团队
    const assignedTeams = this.assignTaskToTeams(task);

    // 3. 团队并行工作
    const teamProposals = await this.parallelTeamWork(task, assignedTeams);

    // 4. 跨团队协作
    const collaborationCount = await this.crossTeamCollaboration(task, teamProposals);

    // 5. 选择最佳提案
    const finalProposal = this.selectBestProposal(teamProposals);

    // 6. 生成最终结果
    const result = this.generateResult(task, finalProposal, assignedTeams);

    const executionTime = Date.now() - startTime;

    console.log(`🤝 编排完成: ${executionTime}ms, 协作: ${collaborationCount} 次`);

    return {
      taskId: task.taskId,
      finalProposal: result,
      participatingTeams: assignedTeams,
      collaborationCount,
      executionTime,
      success: true,
    };
  }

  /**
   * 初始化默认团队
   */
  private initializeTeams(): void {
    const teamTypes: CrotoTeamType[] = [
      CrotoTeamType.ANALYSIS,
      CrotoTeamType.DESIGN,
      CrotoTeamType.DEVELOPMENT,
      CrotoTeamType.TESTING,
      CrotoTeamType.DEPLOYMENT,
      CrotoTeamType.MAINTENANCE,
    ];

    for (const type of teamTypes) {
      const teamId = `team_${type}`;
      const team = this.createTeam(teamId, type);
      this.teams.set(teamId, team);
    }
  }

  /**
   * 创建团队
   */
  private createTeam(teamId: string, teamType: CrotoTeamType): CrotoTeam {
    const memberCount = 3 + Math.floor(Math.random() * 3); // 3-5 members
    const members: CrotoAgent[] = [];

    // 团队领导
    members.push({
      agentId: `${teamId}_lead`,
      agentName: `${teamType} Lead`,
      role: CrotoAgentRole.TEAM_LEAD,
      teamId,
      skills: this.getSkillsForRole(CrotoAgentRole.TEAM_LEAD, teamType),
      availability: 0.9 + Math.random() * 0.1,
    });

    // 专家和执行者
    for (let i = 0; i < memberCount - 1; i++) {
      const role = i === 0 ? CrotoAgentRole.DOMAIN_EXPERT : CrotoAgentRole.EXECUTOR;
      members.push({
        agentId: `${teamId}_member_${i}`,
        agentName: `${teamType} ${role} ${i}`,
        role,
        teamId,
        skills: this.getSkillsForRole(role, teamType),
        availability: 0.7 + Math.random() * 0.3,
      });
    }

    return {
      teamId,
      teamName: `${teamType} Team`,
      teamType,
      state: CrotoTeamState.IDLE,
      members,
      proposals: [],
      collaborations: [],
    };
  }

  /**
   * 根据角色获取技能
   */
  private getSkillsForRole(role: CrotoAgentRole, teamType: CrotoTeamType): string[] {
    const skillMap: Record<CrotoAgentRole, string[]> = {
      [CrotoAgentRole.TEAM_LEAD]: ["coordination", "planning", "decision_making"],
      [CrotoAgentRole.DOMAIN_EXPERT]: [`expert_${teamType}`, "analysis", "consultation"],
      [CrotoAgentRole.COORDINATOR]: ["communication", "negotiation", "integration"],
      [CrotoAgentRole.EXECUTOR]: ["execution", "implementation", "testing"],
      [CrotoAgentRole.REVIEWER]: ["review", "validation", "quality_assurance"],
    };
    return skillMap[role] || ["general"];
  }

  /**
   * 创建任务
   */
  private createTask(description: string): CrotoTask {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 推断所需团队
    const requiredTeams = this.inferRequiredTeams(description);

    // 创建子任务
    const subtasks: CrotoSubtask[] = [];
    for (const teamType of requiredTeams) {
      subtasks.push({
        subtaskId: `${taskId}_${teamType}`,
        description: `${teamType} phase of task`,
        assignedTeam: `team_${teamType}`,
        status: CrotoTeamState.IDLE,
        dependencies: [],
      });
    }

    return {
      taskId,
      description,
      phase: "execution",
      priority: Math.floor(Math.random() * 100),
      requiredTeams,
      status: CrotoTeamState.IDLE,
      subtasks,
    };
  }

  /**
   * 推断所需团队
   */
  private inferRequiredTeams(description: string): CrotoTeamType[] {
    const teams: CrotoTeamType[] = [];
    const lowerDesc = description.toLowerCase();

    const teamKeywords: Record<string, CrotoTeamType> = {
      "分析": CrotoTeamType.ANALYSIS,
      "analysis": CrotoTeamType.ANALYSIS,
      "设计": CrotoTeamType.DESIGN,
      "design": CrotoTeamType.DESIGN,
      "开发": CrotoTeamType.DEVELOPMENT,
      "develop": CrotoTeamType.DEVELOPMENT,
      "代码": CrotoTeamType.DEVELOPMENT,
      "code": CrotoTeamType.DEVELOPMENT,
      "测试": CrotoTeamType.TESTING,
      "test": CrotoTeamType.TESTING,
      "部署": CrotoTeamType.DEPLOYMENT,
      "deploy": CrotoTeamType.DEPLOYMENT,
      "维护": CrotoTeamType.MAINTENANCE,
      "maintain": CrotoTeamType.MAINTENANCE,
    };

    for (const [keyword, teamType] of Object.entries(teamKeywords)) {
      if (lowerDesc.includes(keyword) && !teams.includes(teamType)) {
        teams.push(teamType);
      }
    }

    return teams.length > 0 ? teams : [
      CrotoTeamType.ANALYSIS,
      CrotoTeamType.DESIGN,
      CrotoTeamType.DEVELOPMENT,
      CrotoTeamType.TESTING,
    ];
  }

  /**
   * 分配任务到团队
   */
  private assignTaskToTeams(task: CrotoTask): string[] {
    const assignedTeams: string[] = [];

    for (const teamType of task.requiredTeams) {
      const teamId = `team_${teamType}`;
      const team = this.teams.get(teamId);

      if (team) {
        team.currentTask = task;
        team.state = CrotoTeamState.WORKING;
        assignedTeams.push(teamId);
      }
    }

    return assignedTeams;
  }

  /**
   * 团队并行工作
   */
  private async parallelTeamWork(
    task: CrotoTask,
    teamIds: string[]
  ): Promise<Map<string, CrotoProposal>> {
    const proposals = new Map<string, CrotoProposal>();

    // 模拟并行工作
    const workPromises = teamIds.map(async (teamId) => {
      const team = this.teams.get(teamId);
      if (!team) return null;

      // 模拟工作延迟
      await this.delay(50 + Math.random() * 100);

      // 生成提案
      const proposal: CrotoProposal = {
        proposalId: `proposal_${teamId}_${Date.now()}`,
        sourceTeam: teamId,
        content: this.generateProposalContent(team, task),
        score: Math.random(),
        supporters: [],
        opponents: [],
        timestamp: Date.now(),
      };

      team.proposals.push(proposal);
      proposals.set(teamId, proposal);

      this.proposals.set(proposal.proposalId, proposal);

      return [teamId, proposal];
    });

    await Promise.all(workPromises);

    return proposals;
  }

  /**
   * 生成提案内容
   */
  private generateProposalContent(team: CrotoTeam, task: CrotoTask): string {
    return `${team.teamName} proposal for "${task.description}": ` +
      `Leveraging ${team.members.length} members with ${team.teamType} expertise.` +
      `Recommendation: ${this.getRecommendation(team.teamType)}`;
  }

  /**
   * 获取团队建议
   */
  private getRecommendation(teamType: CrotoTeamType): string {
    const recommendations: Record<CrotoTeamType, string> = {
      [CrotoTeamType.ANALYSIS]: "Thorough requirements analysis and stakeholder identification",
      [CrotoTeamType.DESIGN]: "User-centric design with scalability considerations",
      [CrotoTeamType.DEVELOPMENT]: "Clean architecture with comprehensive testing",
      [CrotoTeamType.TESTING]: "Multi-layer testing strategy with automation",
      [CrotoTeamType.DEPLOYMENT]: "Blue-green deployment with rollback capability",
      [CrotoTeamType.MAINTENANCE]: "Proactive monitoring with automated recovery",
    };
    return recommendations[teamType] || "Standard approach";
  }

  /**
   * 跨团队协作
   */
  private async crossTeamCollaboration(
    task: CrotoTask,
    teamProposals: Map<string, CrotoProposal>
  ): Promise<number> {
    let collaborationCount = 0;

    // 多轮协作
    for (let round = 0; round < this.config.collaborationRounds; round++) {
      // 团队间共享提案
      for (const [teamId, proposal] of teamProposals) {
        const otherTeams = Array.from(teamProposals.keys()).filter(id => id !== teamId);

        for (const otherTeamId of otherTeams) {
          const collaboration = this.createCollaboration(
            [teamId, otherTeamId],
            "proposal_sharing",
            { proposalId: proposal.proposalId }
          );

          this.collaborations.set(collaboration.collaborationId, collaboration);

          const otherTeam = this.teams.get(otherTeamId);
          if (otherTeam) {
            otherTeam.collaborations.push(collaboration);
          }
        }
      }

      // 联合决策
      if (round === this.config.collaborationRounds - 1) {
        const jointDecision = this.createCollaboration(
          Array.from(teamProposals.keys()),
          "joint_decision",
          { round, taskId: task.taskId }
        );

        this.collaborations.set(jointDecision.collaborationId, jointDecision);
        collaborationCount++;
      }

      // 模拟协作延迟
      await this.delay(30);
    }

    return collaborationCount;
  }

  /**
   * 创建协作记录
   */
  private createCollaboration(
    participants: string[],
    type: CrotoCollaboration["type"],
    content: any
  ): CrotoCollaboration {
    return {
      collaborationId: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants,
      type,
      content,
      outcome: "pending",
      timestamp: Date.now(),
    };
  }

  /**
   * 选择最佳提案
   */
  private selectBestProposal(teamProposals: Map<string, CrotoProposal>): string {
    let bestProposal: CrotoProposal | null = null;

    for (const proposal of teamProposals.values()) {
      if (!bestProposal || proposal.score > bestProposal.score) {
        bestProposal = proposal;
      }
    }

    return bestProposal ? `${bestProposal.sourceTeam}: ${bestProposal.content}` : "No proposal selected";
  }

  /**
   * 生成结果
   */
  private generateResult(task: CrotoTask, finalProposal: string, teamIds: string[]): string {
    const teamNames = teamIds.map(id => {
      const team = this.teams.get(id);
      return team?.teamName || id;
    });

    return `🤝 Croto 跨团队协作完成\n` +
      `任务: ${task.description}\n` +
      `参与团队: ${teamNames.join(", ")}\n` +
      `最终方案: ${finalProposal}\n` +
      `协作轮数: ${this.config.collaborationRounds}`;
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取所有团队
   */
  getTeams(): CrotoTeam[] {
    return Array.from(this.teams.values());
  }

  /**
   * 获取所有提案
   */
  getProposals(): CrotoProposal[] {
    return Array.from(this.proposals.values());
  }

  /**
   * 获取所有协作记录
   */
  getCollaborations(): CrotoCollaboration[] {
    return Array.from(this.collaborations.values());
  }

  /**
   * 获取团队状态
   */
  getTeamStates(): Map<string, CrotoTeamState> {
    const states = new Map<string, CrotoTeamState>();
    for (const [id, team] of this.teams.entries()) {
      states.set(id, team.state);
    }
    return states;
  }
}

/**
 * 工厂函数：创建 Croto 编排器
 */
export function createCrotoOrchestrator(config?: CrotoConfig): CrotoOrchestrator {
  return new CrotoOrchestrator(config);
}

/**
 * 任务模板
 */
export const CrotoTemplates = {
  /** 完整 SDLC 任务 */
  fullSDLC: {
    description: "完整的软件开发生命周期任务",
    recommendedConfig: {
      maxTeams: 6,
      collaborationRounds: 3,
    },
  },

  /** 快速迭代任务 */
  rapidIteration: {
    description: "快速迭代的开发任务",
    recommendedConfig: {
      maxTeams: 3,
      collaborationRounds: 2,
    },
  },

  /** 紧急修复任务 */
  emergencyFix: {
    description: "紧急问题修复任务",
    recommendedConfig: {
      maxTeams: 2,
      proposalTimeout: 10000,
      collaborationRounds: 1,
    },
  },
};
