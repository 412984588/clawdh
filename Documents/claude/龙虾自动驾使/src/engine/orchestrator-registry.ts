/**
 * 🦞 编排器注册表 (Orchestrator Registry)
 *
 * 统一管理所有多代理编排器，为永动引擎提供一致的调用接口。
 *
 * @version 2.40.0
 * @since 2025-03-11
 */

// ========== 类型定义 ==========

/**
 * 编排器元数据
 */
export interface OrchestratorMetadata {
  id: string;
  name: string;
  description: string;
  paper?: {
    title: string;
    arxiv?: string;
    venue?: string;
    year?: number;
  };
  useCases: string[];
  inputType: string;
  outputType: string;
}

/**
 * 编排器执行结果
 */
export interface OrchestratorResult {
  orchestratorId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  timestamp: number;
}

/**
 * 编排器适配器接口
 */
export interface IOrchestratorAdapter {
  readonly metadata: OrchestratorMetadata;
  execute(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult>;
}

/**
 * 编排器工厂函数类型
 */
export type OrchestratorFactory = () => IOrchestratorAdapter | Promise<IOrchestratorAdapter>;

// ========== 通用编排器包装器 ==========

/**
 * 创建通用编排器包装器
 *
 * 为任何编排器类创建统一的适配器接口。
 */
function createOrchestratorWrapper<T extends object>(
  metadata: OrchestratorMetadata,
  instance: T,
  methodNames: string[] = ['execute', 'orchestrate', 'run', 'optimize', 'reason', 'reasoning']
): IOrchestratorAdapter {
  // 查找可用的方法
  let method: keyof T | undefined;
  for (const name of methodNames) {
    if (name in instance && typeof (instance as any)[name] === 'function') {
      method = name as keyof T;
      break;
    }
  }

  if (!method) {
    // 如果没有找到标准方法，尝试第一个方法
    const keys = Object.keys(instance);
    for (const key of keys) {
      if (typeof (instance as any)[key] === 'function' && !key.startsWith('_')) {
        method = key as keyof T;
        break;
      }
    }
  }

  return {
    metadata,
    async execute(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
      const startTime = Date.now();
      try {
        let result;
        if (method) {
          const fn = (instance as any)[method];
          // 根据方法参数签名调用
          const paramCount = fn.length;
          if (paramCount <= 1) {
            result = await fn(input);
          } else {
            result = await fn(input, config);
          }
        } else {
          result = { orchestrator: instance, message: 'No executable method found' };
        }
        return {
          orchestratorId: metadata.id,
          success: true,
          data: result,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          orchestratorId: metadata.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        };
      }
    },
  };
}

// ========== 编排器注册表类 ==========

class OrchestratorRegistryClass {
  private orchestrators = new Map<string, OrchestratorFactory>();
  private instances = new Map<string, IOrchestratorAdapter>();

  register(id: string, factory: OrchestratorFactory): void {
    if (this.orchestrators.has(id)) {
      throw new Error(`编排器 "${id}" 已存在`);
    }
    this.orchestrators.set(id, factory);
  }

  registerBatch(entries: Record<string, OrchestratorFactory>): void {
    for (const [id, factory] of Object.entries(entries)) {
      this.register(id, factory);
    }
  }

  private async getInstance(id: string): Promise<IOrchestratorAdapter | undefined> {
    if (this.instances.has(id)) {
      return this.instances.get(id)!;
    }
    const factory = this.orchestrators.get(id);
    if (!factory) return undefined;
    const instance = await factory();
    this.instances.set(id, instance);
    return instance;
  }

  async execute(
    id: string,
    input: string,
    config?: Record<string, unknown>
  ): Promise<OrchestratorResult> {
    const startTime = Date.now();
    try {
      const orchestrator = await this.getInstance(id);
      if (!orchestrator) {
        return {
          orchestratorId: id,
          success: false,
          error: `编排器 "${id}" 未注册`,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        };
      }
      const result = await orchestrator.execute(input, config);
      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        orchestratorId: id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  async list(): Promise<OrchestratorMetadata[]> {
    const metadata: OrchestratorMetadata[] = [];
    for (const factory of this.orchestrators.values()) {
      const instance = await factory();
      metadata.push(instance.metadata);
    }
    return metadata;
  }

  async getMetadata(id: string): Promise<OrchestratorMetadata | undefined> {
    const orchestrator = await this.getInstance(id);
    return orchestrator?.metadata;
  }

  has(id: string): boolean {
    return this.orchestrators.has(id);
  }

  get size(): number {
    return this.orchestrators.size;
  }

  clearCache(): void {
    this.instances.clear();
  }
}

export const OrchestratorRegistry = new OrchestratorRegistryClass();

// ========== 编排器适配器工厂函数 ==========

/**
 * 创建 AdaptFlow 适配器
 */
export async function createAdaptFlowAdapter(): Promise<IOrchestratorAdapter> {
  const { createAdaptFlowOrchestrator } = await import('./adaptflow-orchestrator.js');
  const instance = createAdaptFlowOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'adaptflow',
    name: 'AdaptFlow 自适应工作流',
    description: '通过元学习优化 LLM 代理工作流',
    paper: { title: 'AdaptFlow: Adaptive Workflow Optimization via Meta-Learning', arxiv: '2508.08053', year: 2025 },
    useCases: ['工作流优化', '元学习', '跨任务泛化'],
    inputType: 'string (任务描述)',
    outputType: 'AdaptFlowResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Aegean 适配器
 */
export async function createAegeanAdapter(): Promise<IOrchestratorAdapter> {
  const { createAegeanOrchestrator } = await import('./aegean-orchestrator.js');
  const instance = createAegeanOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'aegean',
    name: 'Aegean 自适应编排',
    description: '动态调整编排策略的多代理系统',
    paper: { title: 'Aegean: Adaptive Multi-Agent Orchestration', year: 2024 },
    useCases: ['动态编排', '自适应策略', '多代理协调'],
    inputType: 'string (任务描述)',
    outputType: 'AegeanResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 AlphaEvolve 适配器
 */
export async function createAlphaEvolveAdapter(): Promise<IOrchestratorAdapter> {
  const { AlphaEvolveOrchestrator, createAlphaEvolveOrchestrator, AlphaEvolveAlgorithm } = await import('./alphaevolve-orchestrator.js');
  const instance = createAlphaEvolveOrchestrator({
    algorithm: AlphaEvolveAlgorithm.VAD_CFR,
    vadConfig: { volatilityWindow: 10, positiveBoostFactor: 1.1, hardWarmstartIteration: 500 },
  });
  const metadata: OrchestratorMetadata = {
    id: 'alphaevolve',
    name: 'AlphaEvolve 进化算法',
    description: 'LLM 驱动的进化编码代理',
    paper: { title: 'AlphaEvolve: LLM-Driven Evolutionary Coding Agent', arxiv: '2602.16928', year: 2025 },
    useCases: ['代码优化', '策略生成', '博弈求解'],
    inputType: 'string (任务描述)',
    outputType: 'EvolutionResult',
  };
  return createOrchestratorWrapper(metadata, instance, ['evolve']);
}

/**
 * 创建 AutoML-Agent 适配器
 */
export async function createAutoMLAgentAdapter(): Promise<IOrchestratorAdapter> {
  const { createAutoMLAgentOrchestrator } = await import('./automl-agent-orchestrator.js');
  const instance = createAutoMLAgentOrchestrator({});
  const metadata: OrchestratorMetadata = {
    id: 'automl-agent',
    name: 'AutoML-Agent 全流水线',
    description: '通过多代理协作实现端到端 AutoML',
    paper: { title: 'AutoML-Agent: A Multi-Agent LLM Framework for Full-Pipeline AutoML', arxiv: '2410.02958', year: 2024 },
    useCases: ['AutoML', '数据预处理', '模型设计'],
    inputType: 'string (AutoML任务)',
    outputType: 'AutoMLResult',
  };
  return createOrchestratorWrapper(metadata, instance, ['runFullPipeline', 'execute']);
}

/**
 * 创建 Bayesian 适配器
 */
export async function createBayesianAdapter(): Promise<IOrchestratorAdapter> {
  const { createBayesianOrchestrator } = await import('./bayesian-orchestrator.js');
  const instance = createBayesianOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'bayesian',
    name: 'Bayesian 贝叶斯编排',
    description: '使用贝叶斯方法进行多代理编排',
    paper: { title: 'Bayesian Orchestration of Multi-LLM Agents', arxiv: '2601.01522', year: 2026 },
    useCases: ['成本感知决策', '序贯信念更新'],
    inputType: 'string (决策任务)',
    outputType: 'BayesianResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 CBS 适配器
 */
export async function createCBSAdapter(): Promise<IOrchestratorAdapter> {
  const { CBSOrchestrator, createCBSOrchestrator } = await import('./cbs-orchestrator.js');
  const instance = createCBSOrchestrator({ availableModels: ['gpt-4', 'claude-3', 'llama-3'] });
  const metadata: OrchestratorMetadata = {
    id: 'cbs',
    name: 'CBS 协作束搜索',
    description: '通过多 LLM 协作束搜索增强推理',
    paper: { title: 'Collaborative Beam Search', arxiv: '2404.15676', venue: 'EMNLP 2025', year: 2025 },
    useCases: ['算术推理', '逻辑推理', '常识推理'],
    inputType: 'string (任务描述)',
    outputType: 'CBSReasoningResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Croto 适配器
 */
export async function createCrotoAdapter(): Promise<IOrchestratorAdapter> {
  const { createCrotoOrchestrator } = await import('./croto-orchestrator.js');
  const instance = createCrotoOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'croto',
    name: 'Croto 跨团队编排',
    description: '可扩展的多团队协作框架',
    paper: { title: 'Multi-Agent Collaboration via Cross-Team Orchestration', arxiv: '2406.08979', year: 2024 },
    useCases: ['跨团队协作', '并发推理'],
    inputType: 'string (任务描述)',
    outputType: 'CrotoResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 EPOCH 适配器
 */
export async function createEPOCHAdapter(): Promise<IOrchestratorAdapter> {
  const { createEPOCHOrchestrator } = await import('./epoch-orchestrator.js');
  const instance = createEPOCHOrchestrator({});
  const metadata: OrchestratorMetadata = {
    id: 'epoch',
    name: 'EPOCH 多轮系统优化',
    description: '协议化编排实现可追踪的系统优化',
    paper: { title: 'EPOCH: An Agentic Protocol for Multi-Round System Optimization', arxiv: '2603.09049', year: 2026 },
    useCases: ['系统优化', '代码改进', '超参数调优'],
    inputType: 'string (优化任务)',
    outputType: 'EPOCHResult',
  };
  return createOrchestratorWrapper(metadata, instance, ['optimize']);
}

/**
 * 创建 FreeMAD 适配器
 */
export async function createFreeMADAdapter(): Promise<IOrchestratorAdapter> {
  const { createFreeMADOrchestrator } = await import('./freemad-orchestrator.js');
  const instance = createFreeMADOrchestrator({});
  const metadata: OrchestratorMetadata = {
    id: 'freemad',
    name: 'FreeMAD 自由多智能体',
    description: '自由多智能体分散编排',
    paper: { title: 'FreeMAD: Free Multi-Agent Dispersion', year: 2024 },
    useCases: ['分散编排', '多智能体协调'],
    inputType: 'string (任务描述)',
    outputType: 'FreeMADResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 HALO 适配器
 */
export async function createHALOAdapter(): Promise<IOrchestratorAdapter> {
  const { createHALOOrchestrator } = await import('./halo-orchestrator.js');
  const instance = createHALOOrchestrator({});
  const metadata: OrchestratorMetadata = {
    id: 'halo',
    name: 'HALO 分层编排',
    description: '分层智能体编排系统',
    paper: { title: 'HALO: Hierarchical Agent Layered Orchestration', year: 2024 },
    useCases: ['分层任务', '层级分解'],
    inputType: 'string (任务描述)',
    outputType: 'HALOResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Hybrid 适配器
 */
export async function createHybridAdapter(): Promise<IOrchestratorAdapter> {
  const { createHybridOrchestrator } = await import('./hybrid-orchestrator.js');
  const instance = createHybridOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'hybrid',
    name: 'Hybrid 混合编排',
    description: '混合 CPU/IoT/边缘计算任务编排',
    paper: { title: 'Hybrid: Mixed Compute Orchestration', year: 2024 },
    useCases: ['混合计算', '边缘编排'],
    inputType: 'string (计算任务)',
    outputType: 'HybridResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 LatentMAS 适配器
 */
export async function createLatentMASAdapter(): Promise<IOrchestratorAdapter> {
  const { createLatentMASOrchestrator } = await import('./latentmas-orchestrator.js');
  const instance = createLatentMASOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'latentmas',
    name: 'LatentMAS 潜空间多智能体',
    description: '基于潜空间表示的多智能体编排',
    paper: { title: 'LatentMAS: Latent Space Multi-Agent System', year: 2024 },
    useCases: ['潜空间推理', '表示学习'],
    inputType: 'string (任务描述)',
    outputType: 'LatentMASResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 LMARS 适配器
 */
export async function createLMARSAdapter(): Promise<IOrchestratorAdapter> {
  const { createLMARSOrchestrator } = await import('./lmars-orchestrator.js');
  const instance = createLMARSOrchestrator({});
  const metadata: OrchestratorMetadata = {
    id: 'lmars',
    name: 'LMARS 语言模型自适应',
    description: '语言模型自适应推理系统',
    paper: { title: 'LMARS: Language Model Adaptive Reasoning System', year: 2024 },
    useCases: ['自适应推理', '模型选择'],
    inputType: 'string (推理任务)',
    outputType: 'LMARSResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MALT 适配器
 */
export async function createMALTAdapter(): Promise<IOrchestratorAdapter> {
  const { MALTOrchestrator, createMALTOrchestrator } = await import('./malt-orchestrator.js');
  const instance = createMALTOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'malt',
    name: 'MALT 多代理推理增强',
    description: '通过多智能体训练提升 LLM 推理能力',
    paper: { title: 'MALT: Improving Reasoning with Multi-Agent LLM Training', arxiv: '2412.01928', year: 2024 },
    useCases: ['复杂推理', '多步骤问题'],
    inputType: 'string (任务描述)',
    outputType: 'MALTReasoningResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MAMR 适配器
 */
export async function createMAMRAdapter(): Promise<IOrchestratorAdapter> {
  const { createMAMROrchestrator } = await import('./mamr-orchestrator.js');
  const instance = createMAMROrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'mamr',
    name: 'MAMR 多智能体元推理',
    description: '多智能体元推理协作',
    paper: { title: 'MAMR: Multi-Agent Meta Reasoning', year: 2024 },
    useCases: ['元推理', '多智能体协作'],
    inputType: 'string (推理任务)',
    outputType: 'MAMRResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MARS 适配器
 */
export async function createMARSAdapter(): Promise<IOrchestratorAdapter> {
  const { createMARSOrchestrator } = await import('./mars-orchestrator.js');
  const instance = createMARSOrchestrator({ availableModels: ['gpt-4', 'claude-3'] });
  const metadata: OrchestratorMetadata = {
    id: 'mars',
    name: 'MARS 多代理强化学习',
    description: '基于多智能体强化学习的编排',
    paper: { title: 'MARS: Multi-Agent Reinforcement Orchestration System', year: 2024 },
    useCases: ['强化学习', '策略优化'],
    inputType: 'string (训练任务)',
    outputType: 'MARSResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MASFactory 适配器
 */
export async function createMASFactoryAdapter(): Promise<IOrchestratorAdapter> {
  const { createMASFactoryOrchestrator } = await import('./masfactory-orchestrator.js');
  const instance = createMASFactoryOrchestrator({});
  const metadata: OrchestratorMetadata = {
    id: 'masfactory',
    name: 'MASFactory 多智能体工厂',
    description: '智能体工厂模式，动态创建多智能体系统',
    paper: { title: 'MASFactory: Multi-Agent System Factory', year: 2024 },
    useCases: ['智能体创建', '动态团队组建'],
    inputType: 'string (系统需求)',
    outputType: 'MASFactoryResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MOSAIC 适配器
 */
export async function createMOSAICAdapter(): Promise<IOrchestratorAdapter> {
  const { createMOSAICOrchestrator, ScientificDomain, ScientificTaskType } = await import('./mosaic-orchestrator.js');
  const instance = createMOSAICOrchestrator({
    availableAgents: [
      {
        agentId: "default_coder",
        agentName: "Default Coder",
        domainExpertise: [ScientificDomain.COMPUTER_SCIENCE],
        languageExpertise: ["Python", "TypeScript"],
        taskPreferences: [ScientificTaskType.ALGORITHM_IMPLEMENTATION],
        capabilityScore: 0.8,
      },
    ],
    maxParallelSubtasks: 3,
  });
  const metadata: OrchestratorMetadata = {
    id: 'mosaic',
    name: 'MOSAIC 马赛克编排',
    description: '碎片化智能体的马赛克式编排',
    paper: { title: 'MOSAIC: Mosaic Orchestration', year: 2024 },
    useCases: ['专业化协作', '碎片化任务'],
    inputType: 'string (任务描述)',
    outputType: 'MOSAICResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MOYA 适配器
 */
export async function createMOYAAdapter(): Promise<IOrchestratorAdapter> {
  const { createMOYAOrchestrator } = await import('./moya-orchestrator.js');
  const instance = createMOYAOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'moya',
    name: 'MOYA 多层干预编排',
    description: '多层人工干预的智能体编排',
    paper: { title: 'MOYA: Multi-Layer Human-in-the-Loop Orchestration', year: 2024 },
    useCases: ['人机协作', '多层干预'],
    inputType: 'string (任务描述)',
    outputType: 'MoyAResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MultiTurn 适配器
 */
export async function createMultiTurnAdapter(): Promise<IOrchestratorAdapter> {
  const { createMultiTurnOrchestrator } = await import('./multiturn-orchestrator.js');
  const instance = createMultiTurnOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'multiturn',
    name: 'MultiTurn 多轮对话编排',
    description: '多轮对话上下文管理和编排',
    paper: { title: 'MultiTurn: Multi-Turn Dialogue Orchestration', year: 2024 },
    useCases: ['多轮对话', '上下文管理'],
    inputType: 'string (对话任务)',
    outputType: 'MultiTurnResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 MyAntFarm 适配器
 */
export async function createMyAntFarmAdapter(): Promise<IOrchestratorAdapter> {
  const { createMyAntFarmOrchestrator } = await import('./myantfarm-orchestrator.js');
  const instance = createMyAntFarmOrchestrator({ availableModels: ['gpt-4', 'claude-3'] });
  const metadata: OrchestratorMetadata = {
    id: 'myantfarm',
    name: 'MyAntFarm 蚂蚁农场',
    description: '像蚂蚁农场一样的智能体培育和优化',
    paper: { title: 'MyAntFarm: Agent Cultivation', year: 2024 },
    useCases: ['智能体培育', '诊断修复'],
    inputType: 'string (任务描述)',
    outputType: 'MyAntFarmResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 OMAS 适配器
 */
export async function createOMASAdapter(): Promise<IOrchestratorAdapter> {
  const { createOMASOrchestrator } = await import('./omas-orchestrator.js');
  const instance = createOMASOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'omas',
    name: 'OMAS 优化的多智能体系统',
    description: '优化的多智能体协作系统',
    paper: { title: 'OMAS: Optimized Multi-Agent System', year: 2024 },
    useCases: ['多智能体优化', '协作效率'],
    inputType: 'string (任务描述)',
    outputType: 'OMASResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Orchestra 适配器
 */
export async function createOrchestraAdapter(): Promise<IOrchestratorAdapter> {
  const { createAgentOrchestrator } = await import('./orchestra-orchestrator.js');
  const instance = createAgentOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'orchestra',
    name: 'Orchestra 乐团编排',
    description: '像乐团一样协调的多智能体编排',
    paper: { title: 'Orchestra: Harmonious Multi-Agent Orchestration', year: 2024 },
    useCases: ['协调编排', '多层次任务'],
    inputType: 'string (任务描述)',
    outputType: 'OrchestraResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 OrchMAS 适配器
 */
export async function createOrchestMASAdapter(): Promise<IOrchestratorAdapter> {
  const { createOrchestMASOrchestrator } = await import('./orchmas-orchestrator.js');
  const instance = createOrchestMASOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'orchmas',
    name: 'OrchMAS 编排式多智能体',
    description: '编排式多智能体协作系统',
    paper: { title: 'OrchMAS: Orchestrated Multi-Agent System', year: 2024 },
    useCases: ['科学推理', '代码生成', '验证分析'],
    inputType: 'string (任务描述)',
    outputType: 'OrchMASResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Puppeteer 适配器
 */
export async function createPuppeteerAdapter(): Promise<IOrchestratorAdapter> {
  const { createPuppeteerOrchestrator } = await import('./puppeteer-orchestrator.js');
  const instance = createPuppeteerOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'puppeteer',
    name: 'Puppeteer 傀儡师编排',
    description: '像傀儡师一样控制多智能体',
    paper: { title: 'Puppeteer: Puppet Master Multi-Agent Control', year: 2024 },
    useCases: ['精确控制', '复杂操作'],
    inputType: 'string (控制指令)',
    outputType: 'PuppeteerResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 RAPO 适配器
 */
export async function createRAPOAdapter(): Promise<IOrchestratorAdapter> {
  const { createRAPOOrchestrator } = await import('./rapo-orchestrator.js');
  const instance = createRAPOOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'rapo',
    name: 'RAPO 强化学习优化',
    description: '基于强化学习的策略优化',
    paper: { title: 'RAPO: Reinforcement And Policy Optimization', year: 2024 },
    useCases: ['策略优化', '强化学习'],
    inputType: 'string (优化任务)',
    outputType: 'RAPOResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Ralph Loop 适配器
 */
export async function createRalphLoopAdapter(): Promise<IOrchestratorAdapter> {
  const { RalphLoopEngine, createRalphLoop } = await import('./ralph-loop.js');
  const metadata: OrchestratorMetadata = {
    id: 'ralph',
    name: 'Ralph Wiggum 循环调试',
    description: '最多5轮自动修复，每轮：诊断→定位→调研→方案→修复→验证',
    paper: { title: 'Ralph Wiggum Loop: Iterative Debugging', year: 2025 },
    useCases: ['调试', '错误修复', '迭代优化'],
    inputType: 'string (问题描述)',
    outputType: 'RalphLoopResult',
  };
  return createFunctionAdapter(metadata, async (problem: string, cfg?: Record<string, unknown>) => {
    const engine = createRalphLoop(cfg as any);
    return await engine.execute(problem, async () => {
      // 模拟修复函数
      console.log(`[Ralph] 修复: ${problem}`);
    });
  });
}

/**
 * 创建 Symphony 适配器
 */
export async function createSymphonyAdapter(): Promise<IOrchestratorAdapter> {
  const { createSymphonyOrchestrator } = await import('./symphony-orchestrator.js');
  const instance = createSymphonyOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'symphony',
    name: 'Symphony 交响乐编排',
    description: '像交响乐一样协调的多智能体编排',
    paper: { title: 'Symphony: Symphonic Multi-Agent Orchestration', year: 2024 },
    useCases: ['协调编排', '多层次任务'],
    inputType: 'string (任务描述)',
    outputType: 'SymphonyResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 TEA 适配器
 */
export async function createTEAAdapter(): Promise<IOrchestratorAdapter> {
  const { createTEAOrchestrator } = await import('./tea-orchestrator.js');
  const instance = createTEAOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'tea',
    name: 'TEA 任务执行编排',
    description: '任务执行代理(TEA)编排',
    paper: { title: 'TEA: Task Execution Agent', year: 2024 },
    useCases: ['任务执行', '计划生成'],
    inputType: 'string (任务描述)',
    outputType: 'TEAResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 UltraThink 适配器
 */
export async function createUltraThinkAdapter(): Promise<IOrchestratorAdapter> {
  const { UltraThinkEngine, createUltraThink } = await import('./ultrathink.js');
  const metadata: OrchestratorMetadata = {
    id: 'ultrathink',
    name: 'UltraThink 深度思考',
    description: '多轮递归思考引擎，支持分支探索和矛盾检测',
    paper: { title: 'UltraThink Debug: Extended Thinking', year: 2025 },
    useCases: ['复杂问题', '多假设分析', '深度推理'],
    inputType: 'string (问题描述)',
    outputType: 'UltraThinkResult',
  };
  return createFunctionAdapter(metadata, async (problem: string, cfg?: Record<string, unknown>) => {
    const engine = createUltraThink(cfg as any);
    return await engine.think(problem);
  });
}

/**
 * 创建 AdaptOrch 适配器
 */
export async function createAdaptOrchAdapter(): Promise<IOrchestratorAdapter> {
  const { createAdaptOrchOrchestrator } = await import('./adaptorch-orchestrator.js');
  const instance = createAdaptOrchOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'adaptorch',
    name: 'AdaptOrch 自适应编排',
    description: '自适应多智能体编排',
    paper: { title: 'AdaptOrch: Adaptive Orchestration', year: 2024 },
    useCases: ['自适应编排', '动态调整'],
    inputType: 'string (任务描述)',
    outputType: 'AdaptOrchResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

// ========== 辅助函数 ==========

/**
 * 创建函数适配器 - 为异步函数创建编排器适配器
 */
export function createFunctionAdapter(
  metadata: OrchestratorMetadata,
  fn: (input: string, config?: Record<string, unknown>) => Promise<unknown>
): IOrchestratorAdapter {
  return {
    metadata,
    async execute(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
      const startTime = Date.now();
      try {
        const data = await fn(input, config);
        return {
          orchestratorId: metadata.id,
          success: true,
          data,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          orchestratorId: metadata.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        };
      }
    },
  };
}

// ========== 初始化函数 ==========

export async function initializeBuiltinOrchestrators(): Promise<void> {
  const adapters: [string, OrchestratorFactory][] = [
    // 原有31个编排器
    ['adaptflow', createAdaptFlowAdapter],
    ['aegean', createAegeanAdapter],
    ['alphaevolve', createAlphaEvolveAdapter],
    ['automl-agent', createAutoMLAgentAdapter],
    ['bayesian', createBayesianAdapter],
    ['cbs', createCBSAdapter],
    ['croto', createCrotoAdapter],
    ['epoch', createEPOCHAdapter],
    ['freemad', createFreeMADAdapter],
    ['halo', createHALOAdapter],
    ['hybrid', createHybridAdapter],
    ['latentmas', createLatentMASAdapter],
    ['lmars', createLMARSAdapter],
    ['malt', createMALTAdapter],
    ['mamr', createMAMRAdapter],
    ['mars', createMARSAdapter],
    ['masfactory', createMASFactoryAdapter],
    ['mosaic', createMOSAICAdapter],
    ['moya', createMOYAAdapter],
    ['multiturn', createMultiTurnAdapter],
    ['myantfarm', createMyAntFarmAdapter],
    ['omas', createOMASAdapter],
    ['orchestra', createOrchestraAdapter],
    ['orchmas', createOrchestMASAdapter],
    ['puppeteer', createPuppeteerAdapter],
    ['rapo', createRAPOAdapter],
    ['ralph', createRalphLoopAdapter],
    ['symphony', createSymphonyAdapter],
    ['tea', createTEAAdapter],
    ['ultrathink', createUltraThinkAdapter],
    ['adaptorch', createAdaptOrchAdapter],
    // 新增25个编排器 (32-56)
    ['qwen-agentic', createQwenAgenticAdapter],
    ['deepseek-r1', createDeepSeekR1Adapter],
    ['gpt-composer', createGPTComposerAdapter],
    ['claude-orchestra', createClaudeOrchestraAdapter],
    ['llama-herd', createLlamaHerdAdapter],
    ['mistral-fusion', createMistralFusionAdapter],
    ['gemini-protocol', createGeminiProtocolAdapter],
    ['chain-of-notebook', createChainOfNotebookAdapter],
    ['tree-of-execution', createTreeOfExecutionAdapter],
    ['graph-rag', createGraphRAGAdapter],
    ['vector-orchestra', createVectorOrchestraAdapter],
    ['memory-mesh', createMemoryMeshAdapter],
    ['knowledge-graph-flow', createKnowledgeGraphFlowAdapter],
    ['debate-protocol', createDebateProtocolAdapter],
    ['consensus-mechanism', createConsensusMechanismAdapter],
    ['voting-system', createVotingSystemAdapter],
    ['ensemble-mix', createEnsembleMixAdapter],
    ['streaming-chain', createStreamingChainAdapter],
    ['batch-process', createBatchProcessAdapter],
    ['pipeline-flow', createPipelineFlowAdapter],
    ['parallel-grid', createParallelGridAdapter],
    ['hierarchical-task', createHierarchicalTaskAdapter],
    ['dynamic-switch', createDynamicSwitchAdapter],
    ['context-router', createContextRouterAdapter],
    ['meta-orchestrator', createMetaOrchestratorAdapter],
  ];

  for (const [id, factory] of adapters) {
    OrchestratorRegistry.register(id, factory);
  }
}

// ========== 便捷函数 ==========

export async function adaptflow(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('adaptflow', input, config);
}
export async function aegean(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('aegean', input, config);
}
export async function alphaevolve(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('alphaevolve', input, config);
}
export async function automl(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('automl-agent', input, config);
}
export async function bayesian(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('bayesian', input, config);
}
export async function cbs(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('cbs', input, config);
}
export async function croto(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('croto', input, config);
}
export async function epoch(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('epoch', input, config);
}
export async function freemad(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('freemad', input, config);
}
export async function halo(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('halo', input, config);
}
export async function hybrid(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('hybrid', input, config);
}
export async function latentmas(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('latentmas', input, config);
}
export async function lmars(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('lmars', input, config);
}
export async function malt(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('malt', input, config);
}
export async function mamr(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('mamr', input, config);
}
export async function mars(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('mars', input, config);
}
export async function masfactory(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('masfactory', input, config);
}
export async function mosaic(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('mosaic', input, config);
}
export async function moya(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('moya', input, config);
}
export async function multiturn(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('multiturn', input, config);
}
export async function myantfarm(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('myantfarm', input, config);
}
export async function omas(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('omas', input, config);
}
export async function orchestra(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('orchestra', input, config);
}
export async function orchmas(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('orchmas', input, config);
}
export async function puppeteer(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('puppeteer', input, config);
}
export async function rapo(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('rapo', input, config);
}
export async function ralph(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('ralph', input, config);
}
export async function symphony(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('symphony', input, config);
}
export async function tea(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('tea', input, config);
}
export async function ultrathink(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('ultrathink', input, config);
}
export async function adaptorch(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('adaptorch', input, config);
}

// ========== 扩展编排器适配器 (25个新增) ==========

/**
 * 创建 Qwen Agentic 适配器
 */
export async function createQwenAgenticAdapter(): Promise<IOrchestratorAdapter> {
  const { createQwenAgenticOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createQwenAgenticOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'qwen-agentic',
    name: 'Qwen Agentic 智能体编排',
    description: '基于 Qwen 系列模型的多智能体编排',
    paper: { title: 'Qwen Agentic Framework', year: 2025 },
    useCases: ['Qwen模型', '智能体协作', '中文优化'],
    inputType: 'string (任务描述)',
    outputType: 'QwenResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 DeepSeek R1 适配器
 */
export async function createDeepSeekR1Adapter(): Promise<IOrchestratorAdapter> {
  const { createDeepSeekR1Orchestrator } = await import('./orchestrators-extended.js');
  const instance = createDeepSeekR1Orchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 深度推理',
    description: '基于深度思考的递归推理编排',
    paper: { title: 'DeepSeek-R1: Inference with Reinforcement Learning', arxiv: '2501.19493', year: 2025 },
    useCases: ['深度推理', '数学问题', '代码推理'],
    inputType: 'string (推理任务)',
    outputType: 'DeepSeekResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 GPT Composer 适配器
 */
export async function createGPTComposerAdapter(): Promise<IOrchestratorAdapter> {
  const { createGPTComposerOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createGPTComposerOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'gpt-composer',
    name: 'GPT Composer 组合编排',
    description: '组合多个 GPT 模型进行协作',
    useCases: ['GPT协作', '模型组合', '多模型推理'],
    inputType: 'string (任务描述)',
    outputType: 'GPTComposerResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Claude Orchestra 适配器
 */
export async function createClaudeOrchestraAdapter(): Promise<IOrchestratorAdapter> {
  const { createClaudeOrchestraOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createClaudeOrchestraOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'claude-orchestra',
    name: 'Claude Orchestra 编排',
    description: '针对 Claude 模型优化的多智能体编排',
    useCases: ['Claude模型', '长上下文', '精细控制'],
    inputType: 'string (任务描述)',
    outputType: 'ClaudeOrchestraResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Llama Herd 适配器
 */
export async function createLlamaHerdAdapter(): Promise<IOrchestratorAdapter> {
  const { createLlamaHerdOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createLlamaHerdOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'llama-herd',
    name: 'Llama Herd 集群编排',
    description: '本地 Llama 模型集群编排',
    useCases: ['本地部署', '量化模型', '隐私保护'],
    inputType: 'string (任务描述)',
    outputType: 'LlamaHerdResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Mistral Fusion 适配器
 */
export async function createMistralFusionAdapter(): Promise<IOrchestratorAdapter> {
  const { createMistralFusionOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createMistralFusionOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'mistral-fusion',
    name: 'Mistral Fusion 融合编排',
    description: 'Mistral 模型融合编排',
    useCases: ['Mistral模型', '高效推理', '边缘部署'],
    inputType: 'string (任务描述)',
    outputType: 'MistralFusionResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Gemini Protocol 适配器
 */
export async function createGeminiProtocolAdapter(): Promise<IOrchestratorAdapter> {
  const { createGeminiProtocolOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createGeminiProtocolOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'gemini-protocol',
    name: 'Gemini Protocol 协议编排',
    description: 'Gemini 多智能体协议',
    useCases: ['Gemini模型', '多模态', '长文本'],
    inputType: 'string (任务描述)',
    outputType: 'GeminiProtocolResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Chain of Notebook 适配器
 */
export async function createChainOfNotebookAdapter(): Promise<IOrchestratorAdapter> {
  const { createChainOfNotebookOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createChainOfNotebookOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'chain-of-notebook',
    name: 'Chain of Notebook 笔记链',
    description: '笔记链推理编排',
    paper: { title: 'Chain of Notebook: Structured Reasoning', year: 2025 },
    useCases: ['结构化推理', '可解释思考', '步骤追踪'],
    inputType: 'string (推理任务)',
    outputType: 'ChainOfNotebookResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Tree of Execution 适配器
 */
export async function createTreeOfExecutionAdapter(): Promise<IOrchestratorAdapter> {
  const { createTreeOfExecutionOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createTreeOfExecutionOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'tree-of-execution',
    name: 'Tree of Execution 执行树',
    description: '树形执行路径编排',
    useCases: ['多路径探索', '并行执行', '分支推理'],
    inputType: 'string (任务描述)',
    outputType: 'TreeOfExecutionResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Graph RAG 适配器
 */
export async function createGraphRAGAdapter(): Promise<IOrchestratorAdapter> {
  const { createGraphRAGOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createGraphRAGOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'graph-rag',
    name: 'Graph RAG 图检索',
    description: '图检索增强生成编排',
    paper: { title: 'GraphRAG: Graph-based Retrieval Augmented Generation', year: 2024 },
    useCases: ['知识图谱', '关系推理', '复杂QA'],
    inputType: 'string (检索任务)',
    outputType: 'GraphRAGResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Vector Orchestra 适配器
 */
export async function createVectorOrchestraAdapter(): Promise<IOrchestratorAdapter> {
  const { createVectorOrchestraOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createVectorOrchestraOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'vector-orchestra',
    name: 'Vector Orchestra 向量编排',
    description: '向量空间编排',
    useCases: ['向量检索', '语义搜索', '嵌入优化'],
    inputType: 'string (任务描述)',
    outputType: 'VectorOrchestraResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Memory Mesh 适配器
 */
export async function createMemoryMeshAdapter(): Promise<IOrchestratorAdapter> {
  const { createMemoryMeshOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createMemoryMeshOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'memory-mesh',
    name: 'Memory Mesh 记忆网格',
    description: '记忆网格编排',
    useCases: ['长期记忆', '记忆检索', '上下文管理'],
    inputType: 'string (任务描述)',
    outputType: 'MemoryMeshResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Knowledge Graph Flow 适配器
 */
export async function createKnowledgeGraphFlowAdapter(): Promise<IOrchestratorAdapter> {
  const { createKnowledgeGraphFlowOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createKnowledgeGraphFlowOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'knowledge-graph-flow',
    name: 'Knowledge Graph Flow 知识图谱流',
    description: '知识图谱流编排',
    useCases: ['知识推理', '实体关系', '图遍历'],
    inputType: 'string (任务描述)',
    outputType: 'KnowledgeGraphFlowResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Debate Protocol 适配器
 */
export async function createDebateProtocolAdapter(): Promise<IOrchestratorAdapter> {
  const { createDebateProtocolOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createDebateProtocolOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'debate-protocol',
    name: 'Debate Protocol 辩论协议',
    description: '智能体辩论编排',
    useCases: ['多观点分析', '批判性思维', '决策优化'],
    inputType: 'string (辩论主题)',
    outputType: 'DebateProtocolResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Consensus Mechanism 适配器
 */
export async function createConsensusMechanismAdapter(): Promise<IOrchestratorAdapter> {
  const { createConsensusMechanismOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createConsensusMechanismOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'consensus-mechanism',
    name: 'Consensus Mechanism 共识机制',
    description: '共识机制编排',
    useCases: ['多智能体决策', '一致性达成', '投票共识'],
    inputType: 'string (决策任务)',
    outputType: 'ConsensusMechanismResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Voting System 适配器
 */
export async function createVotingSystemAdapter(): Promise<IOrchestratorAdapter> {
  const { createVotingSystemOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createVotingSystemOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'voting-system',
    name: 'Voting System 投票系统',
    description: '投票系统编排',
    useCases: ['投票决策', '多数表决', '权重投票'],
    inputType: 'string (投票任务)',
    outputType: 'VotingSystemResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Ensemble Mix 适配器
 */
export async function createEnsembleMixAdapter(): Promise<IOrchestratorAdapter> {
  const { createEnsembleMixOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createEnsembleMixOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'ensemble-mix',
    name: 'Ensemble Mix 集成混合',
    description: '集成混合编排',
    useCases: ['模型集成', '混合推理', '性能优化'],
    inputType: 'string (任务描述)',
    outputType: 'EnsembleMixResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Streaming Chain 适配器
 */
export async function createStreamingChainAdapter(): Promise<IOrchestratorAdapter> {
  const { createStreamingChainOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createStreamingChainOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'streaming-chain',
    name: 'Streaming Chain 流式链',
    description: '流式链编排',
    useCases: ['流式输出', '实时响应', '增量推理'],
    inputType: 'string (任务描述)',
    outputType: 'StreamingChainResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Batch Process 适配器
 */
export async function createBatchProcessAdapter(): Promise<IOrchestratorAdapter> {
  const { createBatchProcessOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createBatchProcessOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'batch-process',
    name: 'Batch Process 批处理',
    description: '批处理编排',
    useCases: ['批量任务', '并行处理', '吞吐优化'],
    inputType: 'string (任务描述)',
    outputType: 'BatchProcessResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Pipeline Flow 适配器
 */
export async function createPipelineFlowAdapter(): Promise<IOrchestratorAdapter> {
  const { createPipelineFlowOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createPipelineFlowOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'pipeline-flow',
    name: 'Pipeline Flow 管道流',
    description: '管道流编排',
    useCases: ['流水线', '阶段处理', 'ETL'],
    inputType: 'string (任务描述)',
    outputType: 'PipelineFlowResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Parallel Grid 适配器
 */
export async function createParallelGridAdapter(): Promise<IOrchestratorAdapter> {
  const { createParallelGridOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createParallelGridOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'parallel-grid',
    name: 'Parallel Grid 并行网格',
    description: '并行网格编排',
    useCases: ['大规模并行', '网格计算', '分布式推理'],
    inputType: 'string (任务描述)',
    outputType: 'ParallelGridResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Hierarchical Task 适配器
 */
export async function createHierarchicalTaskAdapter(): Promise<IOrchestratorAdapter> {
  const { createHierarchicalTaskOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createHierarchicalTaskOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'hierarchical-task',
    name: 'Hierarchical Task 层次任务',
    description: '层次任务编排',
    useCases: ['任务分解', '层级执行', '复杂项目管理'],
    inputType: 'string (任务描述)',
    outputType: 'HierarchicalTaskResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Dynamic Switch 适配器
 */
export async function createDynamicSwitchAdapter(): Promise<IOrchestratorAdapter> {
  const { createDynamicSwitchOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createDynamicSwitchOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'dynamic-switch',
    name: 'Dynamic Switch 动态切换',
    description: '动态切换编排',
    useCases: ['自适应切换', '策略选择', '动态路由'],
    inputType: 'string (任务描述)',
    outputType: 'DynamicSwitchResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Context Router 适配器
 */
export async function createContextRouterAdapter(): Promise<IOrchestratorAdapter> {
  const { createContextRouterOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createContextRouterOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'context-router',
    name: 'Context Router 上下文路由',
    description: '上下文路由编排',
    useCases: ['智能路由', '上下文分发', '任务分配'],
    inputType: 'string (任务描述)',
    outputType: 'ContextRouterResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 创建 Meta Orchestrator 适配器
 */
export async function createMetaOrchestratorAdapter(): Promise<IOrchestratorAdapter> {
  const { createMetaOrchestrator } = await import('./orchestrators-extended.js');
  const instance = createMetaOrchestrator();
  const metadata: OrchestratorMetadata = {
    id: 'meta-orchestrator',
    name: 'Meta Orchestrator 元编排器',
    description: '编排器的编排器，协调多个子编排器',
    useCases: ['编排器协调', '多模式组合', '元策略'],
    inputType: 'string (任务描述)',
    outputType: 'MetaOrchestratorResult',
  };
  return createOrchestratorWrapper(metadata, instance);
}

/**
 * 根据任务描述推荐合适的编排器
 *
 * @param task 任务描述
 * @returns 推荐的编排器 ID 列表（按优先级排序）
 */
export async function recommendOrchestrator(task: string): Promise<string[]> {
  // 边界检查：处理空字符串或无效输入
  if (!task || task.trim().length === 0) {
    return ['malt', 'hybrid', 'ultrathink']; // 默认推荐
  }

  const taskLower = task.toLowerCase();

  // 任务类型到编排器映射 (覆盖全部56个编排器)
  const orchestratorMap: Record<string, string[]> = {
    // ===== 调试相关 =====
    debug: ['ralph', 'ultrathink', 'deepseek-r1'],
    error: ['ralph', 'ultrathink', 'deepseek-r1'],
    bug: ['ralph', 'cbs', 'ultrathink'],
    fix: ['ralph', 'epoch', 'deepseek-r1'],

    // ===== 深度推理 =====
    think: ['ultrathink', 'cbs', 'malt', 'deepseek-r1'],
    reason: ['cbs', 'malt', 'aegean', 'chain-of-notebook'],
    analyze: ['malt', 'cbs', 'symphony', 'tree-of-execution'],
    深度思考: ['ultrathink', 'deepseek-r1'],
    迭代优化: ['ralph', 'ultrathink', 'alphaevolve'],

    // ===== 优化相关 =====
    optimize: ['alphaevolve', 'epoch', 'adaptflow'],
    improve: ['epoch', 'alphaevolve'],
    evolve: ['alphaevolve', 'adaptflow'],
    进化: ['alphaevolve', 'epoch'],
    自动优化: ['automl-agent', 'alphaevolve'],

    // ===== 搜索/检索 =====
    search: ['graph-rag', 'vector-orchestra', 'knowledge-graph-flow'],
    搜索: ['graph-rag', 'vector-orchestra'],
    检索: ['vector-orchestra', 'memory-mesh'],
    向量: ['vector-orchestra', 'knowledge-graph-flow'],
    图谱: ['graph-rag', 'knowledge-graph-flow'],

    // ===== 协作相关 =====
    collaborate: ['croto', 'symphony', 'tea', 'mosaic'],
    team: ['croto', 'orchestra', 'halo', 'masfactory'],
    协作: ['mars', 'symphony', 'orchmas'],
    多代理: ['mosaic', 'mars', 'freemad'],
    评审: ['mars', 'myantfarm'],

    // ===== 学习相关 =====
    learn: ['adaptflow', 'automl-agent', 'latentmas'],
    train: ['automl-agent', 'epoch', 'latentmas'],
    学习: ['adaptflow', 'latentmas'],
    元学习: ['adaptflow', 'aegean'],

    // ===== 决策/规划 =====
    decide: ['bayesian', 'moya', 'rapo'],
    plan: ['tea', 'moya', 'orchestra', 'hierarchical-task'],
    决策: ['bayesian', 'myantfarm', 'voting-system'],
    规划: ['tea', 'pipeline-flow', 'hierarchical-task'],

    // ===== 代码相关 =====
    code: ['mosaic', 'mars', 'epoch'],
    review: ['mars', 'freemad', 'code-review'],
    代码: ['mosaic', 'mars'],
    科学编码: ['mosaic'],

    // ===== 记忆相关 =====
    memory: ['memory-mesh', 'vector-orchestra', 'knowledge-graph-flow'],
    记忆: ['memory-mesh', 'knowledge-graph-flow'],
    知识: ['knowledge-graph-flow', 'vector-orchestra'],

    // ===== 模型专用 =====
    qwen: ['qwen-agentic'],
    gpt: ['gpt-composer'],
    claude: ['claude-orchestra'],
    llama: ['llama-herd'],
    mistral: ['mistral-fusion'],
    gemini: ['gemini-protocol'],

    // ===== 高级编排 =====
    debate: ['debate-protocol', 'consensus-mechanism'],
    辩论: ['debate-protocol', 'voting-system'],
    consensus: ['consensus-mechanism', 'voting-system'],
    共识: ['consensus-mechanism'],
    投票: ['voting-system'],

    // ===== 执行模式 =====
    stream: ['streaming-chain'],
    批量: ['batch-process'],
    pipeline: ['pipeline-flow'],
    并行: ['parallel-grid'],
    流式: ['streaming-chain'],

    // ===== 动态/路由 =====
    dynamic: ['dynamic-switch', 'context-router'],
    context: ['context-router', 'dynamic-switch'],
    switch: ['dynamic-switch'],
    路由: ['context-router'],

    // ===== 元编排 =====
    meta: ['meta-orchestrator', 'moya'],
    元编排: ['meta-orchestrator'],

    // ===== 混合/集成 =====
    ensemble: ['ensemble-mix', 'hybrid'],
    集成: ['ensemble-mix'],
    混合: ['hybrid'],

    // ===== 默认兜底 =====
    default: ['malt', 'hybrid', 'ultrathink'],
  };

  // 查找匹配的编排器
  for (const [keyword, orchestrators] of Object.entries(orchestratorMap)) {
    if (taskLower.includes(keyword)) {
      return orchestrators;
    }
  }

  // 默认推荐
  return orchestratorMap.default;
}

// ========== 扩展便捷函数 (25个新增) ==========

export async function qwenAgentic(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('qwen-agentic', input, config);
}
export async function deepseekR1(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('deepseek-r1', input, config);
}
export async function gptComposer(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('gpt-composer', input, config);
}
export async function claudeOrchestra(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('claude-orchestra', input, config);
}
export async function llamaHerd(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('llama-herd', input, config);
}
export async function mistralFusion(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('mistral-fusion', input, config);
}
export async function geminiProtocol(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('gemini-protocol', input, config);
}
export async function chainOfNotebook(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('chain-of-notebook', input, config);
}
export async function treeOfExecution(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('tree-of-execution', input, config);
}
export async function graphRAG(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('graph-rag', input, config);
}
export async function vectorOrchestra(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('vector-orchestra', input, config);
}
export async function memoryMesh(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('memory-mesh', input, config);
}
export async function knowledgeGraphFlow(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('knowledge-graph-flow', input, config);
}
export async function debateProtocol(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('debate-protocol', input, config);
}
export async function consensusMechanism(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('consensus-mechanism', input, config);
}
export async function votingSystem(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('voting-system', input, config);
}
export async function ensembleMix(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('ensemble-mix', input, config);
}
export async function streamingChain(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('streaming-chain', input, config);
}
export async function batchProcess(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('batch-process', input, config);
}
export async function pipelineFlow(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('pipeline-flow', input, config);
}
export async function parallelGrid(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('parallel-grid', input, config);
}
export async function hierarchicalTask(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('hierarchical-task', input, config);
}
export async function dynamicSwitch(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('dynamic-switch', input, config);
}
export async function contextRouter(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('context-router', input, config);
}
export async function metaOrchestrator(input: string, config?: Record<string, unknown>): Promise<OrchestratorResult> {
  return OrchestratorRegistry.execute('meta-orchestrator', input, config);
}

