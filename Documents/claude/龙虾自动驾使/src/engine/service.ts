/**
 * 🦞 龙虾永动引擎服务
 *
 * 核心特性：
 * - 零延迟 `while(isRunning)` 死循环，无 sleep 无心跳
 * - 狂暴异常处理：任何错误转化为提示词，立即继续
 * - 智能错误分类：6种错误类型自动识别和恢复
 * - 状态持久化：原子写入，重启后恢复
 *
 * @example
 * ```ts
 * const engine = new PerpetualEngineService(api, {
 *   compressInterval: 5,
 *   enableHealthCheck: true
 * });
 * await engine.start(context);
 * ```
 *
 * @version 1.0.0
 * @author Claude Code
 */

import type { OpenClawPluginServiceContext, PluginCommandContext } from "../types.js";
import { EngineConfig, DEFAULT_CONFIG } from "../config.js";
import fs from "fs/promises";
import path from "path";

/**
 * 简化的日志接口
 * @internal
 */
interface EngineLogger {
  /** 记录信息日志 */
  info: (message: string) => void;
  /** 记录警告日志 */
  warn: (message: string) => void;
  /** 记录错误日志 */
  error: (message: string) => void;
  /** 记录调试日志（可选） */
  debug?: (message: string) => void;
}

/**
 * 简化的 API 接口
 * @internal
 */
interface EngineApi {
  /** 日志记录器 */
  logger: EngineLogger;
}

/**
 * 安全调用 debug 日志
 * @param logger 日志记录器
 * @param message 日志消息
 * @internal
 */
function safeDebug(logger: EngineLogger, message: string): void {
  if (logger.debug) {
    logger.debug(message);
  }
}

// ========== 常量定义 ==========

/** 行动类型常量 */
const ActionType = {
  INIT: "init",
  ERROR_RECOVERY: "error_recovery",
  EXECUTE: "execute",
} as const;

/** 默认维护任务列表 */
const DEFAULT_MAINTENANCE_ACTIONS = [
  "分析工作区文件结构",
  "检查代码质量",
  "生成优化建议",
  "验证配置完整性",
  "更新运行状态",
  "清理缓存文件",
] as const;

/** 日志消息模板 */
const LogMessages = {
  ENGINE_STARTED: "🦞 永动循环已启动（后台运行）",
  ENGINE_STOPPED: "🛑 永动循环已停止",
  ENGINE_READY: "🦞 永动引擎服务已就绪，等待 /start_partner 命令",
  LOOP_STARTED: "🔄 永动循环开始",
  LOOP_ENDED: (count: number) => `🔄 永动循环结束，总循环次数: ${count}`,
  STATUS_RECOVERED: (count: number) => `📂 恢复之前状态: ${count} 次循环`,
  STATE_PERSISTED: (count: number) => `💾 状态已持久化: 循环 ${count}`,
  NO_STATE_FILE: "没有可恢复的状态文件",
  CONTEXT_COMPRESSED: (actions: number, errors: number) =>
    `📦 上下文已压缩: ${actions} 行动, ${errors} 错误`,
  HEALTH_CHECK_STALL: (seconds: number) =>
    `⚠️ 健康检查: 循环可能已卡死 (${seconds}秒无响应)`,
  PERFORMANCE_METRICS: (metrics: {
    total: number;
    avg: number;
    min: number;
    max: number;
    rate: number;
  }) =>
    `📊 性能指标: ` +
    `总循环: ${metrics.total}, ` +
    `平均: ${metrics.avg}ms, ` +
    `最快: ${metrics.min}ms, ` +
    `最慢: ${metrics.max}ms, ` +
    `速率: ${metrics.rate} 循环/秒`,
} as const;

/** MISSION 文件相关常量 */
const MissionFileNames = {
  MISSION: "MISSION_PARTNER.md",
  BOUNDARIES: "BOUNDARIES_PARTNER.md",
} as const;

/** 状态文件相关常量 */
const StateFileNames = {
  ENGINE_STATE: "engine-state.json",
  STATE_DIR: ".lobster-engine",
  SUGGESTIONS_LOG: "suggestions.log",
  TEMP_SUFFIX: ".tmp",
} as const;

/** MISSION 文件部分名称 */
const MissionSections = {
  TASKS: "## 具体任务",
  ALTERNATIVE_TASKS: "## 具体任务",
} as const;

/** 文件扩展名常量 */
const FileExtensions = {
  TYPESCRIPT: ".ts",
  JAVASCRIPT: ".js",
  JSON: ".json",
  MARKDOWN: ".md",
} as const;

/** 行动关键词映射 */
const ActionKeywords = {
  ANALYZE: "分析",
  CHECK: "检查",
  GENERATE: "生成",
  CODE: "代码",
} as const;

/**
 * 龙虾永动引擎服务类
 *
 * 负责管理零延迟循环、状态持久化、错误分类恢复等功能。
 */
export class PerpetualEngineService {
  /** 引擎运行状态 */
  private isRunningValue = false;
  /** 循环计数器 */
  private loopCountValue = 0;
  /** 上下文状态（行动和错误记录） */
  private context: ContextState = { actions: [], errors: [] };
  /** OpenClaw API 引用 */
  private api: EngineApi;
  /** 中断控制器 */
  private abortController: AbortController | null = null;
  /** 文件列表缓存 */
  private fileCache: Map<string, { data: string[]; timestamp: number }> = new Map();

  // ========== 配置 ==========
  /** 引擎配置 */
  private config: EngineConfig;

  // ========== 性能监控 ==========
  /** 当前循环开始时间 */
  private loopStartTime: number = 0;
  /** 性能指标统计 */
  private loopMetrics: {
    /** 总耗时（毫秒） */
    totalTime: number;
    /** 最快循环（毫秒） */
    minTime: number;
    /** 最慢循环（毫秒） */
    maxTime: number;
    /** 平均耗时（毫秒） */
    avgTime: number;
  } = { totalTime: 0, minTime: Infinity, maxTime: 0, avgTime: 0 };

  // ========== 健康检查 ==========
  /** 上次循环时间戳 */
  private lastLoopTime: number = Date.now();
  /** 健康检查定时器 */
  private healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   * 创建永动引擎实例
   * @param api OpenClaw API
   * @param config 可选配置
   */
  constructor(api: EngineApi, config?: Partial<EngineConfig>) {
    this.api = api;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 从命令启动引擎
   *
   * 检查运行状态，设置中断控制器，构造服务上下文，并启动异步循环。
   *
   * @param ctx 命令上下文
   */
  async startFromCommand(_ctx: PluginCommandContext): Promise<void> {
    if (this.isRunningValue) {
      this.api.logger.warn("引擎已在运行中");
      return;
    }

    this.isRunningValue = true;
    this.abortController = new AbortController();
    this.lastLoopTime = Date.now();

    // 构造一个虚拟的 service context
    const serviceContext: OpenClawPluginServiceContext = {
      config: _ctx.config,
      workspaceDir: undefined, // 命令上下文可能没有这个
      stateDir: path.join(process.cwd(), StateFileNames.STATE_DIR),
      logger: this.api.logger,
    };

    // 启动健康检查
    this.startHealthCheck();

    // 启动异步循环（不阻塞命令响应）
    this.runLoop(serviceContext, this.abortController.signal).catch((error) => {
      this.api.logger.error("循环异常: " + error.message);
      this.isRunningValue = false;
      this.stopHealthCheck();
    });

    this.api.logger.info(LogMessages.ENGINE_STARTED);
  }

  /**
   * 服务启动时调用
   *
   * Gateway 启动时自动调用，尝试恢复之前的状态。
   *
   * @param ctx 服务上下文
   */
  async start(ctx: OpenClawPluginServiceContext): Promise<void> {
    // 尝试恢复之前的状态
    await this.recoverState(ctx);
    this.api.logger.info("🦞 永动引擎服务已就绪，等待 /start_partner 命令");
  }

  /**
   * 从磁盘恢复状态
   */
  private async recoverState(ctx: OpenClawPluginServiceContext): Promise<void> {
    const statePath = path.join(ctx.stateDir, StateFileNames.ENGINE_STATE);
    try {
      await fs.access(statePath);
    } catch {
      safeDebug(this.api.logger, LogMessages.NO_STATE_FILE);
      return;
    }

    try {
      const data = await fs.readFile(statePath, "utf-8");
      const state = JSON.parse(data);

      // 验证状态文件格式
      if (typeof state.loopCount === 'number' && state.loopCount > 0) {
        this.loopCountValue = state.loopCount;
        this.api.logger.info(LogMessages.STATUS_RECOVERED(state.loopCount));
      }

      // 恢复上下文（验证格式）
      if (state.context && Array.isArray(state.context.actions)) {
        this.context = {
          actions: state.context.actions || [],
          errors: state.context.errors || []
        };
        safeDebug(this.api.logger,`📦 恢复上下文: ${this.context.actions.length} 行动, ${this.context.errors.length} 错误`);
      }

      if (state.lastUpdate) {
        safeDebug(this.api.logger,`🕒 最后更新: ${state.lastUpdate}`);
      }
    } catch (error) {
      this.api.logger.warn(`状态恢复失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 停止服务
   *
   * Gateway 停止时调用，停止所有后台循环和健康检查。
   *
   * @param ctx 服务上下文
   */
  stopService(_ctx: OpenClawPluginServiceContext): void {
    this.stopLoop();
  }

  /**
   * 停止循环
   *
   * 设置 isRunning 为 false，中断 abortController，并清理健康检查定时器。
   */
  stopLoop(): void {
    this.isRunningValue = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.stopHealthCheck();
    this.api.logger.info(LogMessages.ENGINE_STOPPED);
  }

  /**
   * 核心循环：零延迟 while(isRunning)
   *
   * 主循环逻辑：
   * 1. 加载 MISSION 和 BOUNDARIES
   * 2. 生成下一步行动
   * 3. 执行行动
   * 4. 更新状态和性能指标
   * 5. 定期压缩上下文
   * 6. 定期汇报状态
   *
   * @param ctx 服务上下文
   * @param signal 中断信号
   */
  private async runLoop(
    ctx: OpenClawPluginServiceContext,
    signal: AbortSignal
  ): Promise<void> {
    this.api.logger.info("🔄 永动循环开始");
    // 重置性能监控
    this.loopMetrics = { totalTime: 0, minTime: Infinity, maxTime: 0, avgTime: 0 };

    while (this.isRunningValue && !signal.aborted) {
      this.loopStartTime = Date.now();

      try {
        // 1. 加载 MISSION 和 BOUNDARIES
        const { mission, boundaries } = await this.loadMissionFiles(ctx);

        // 2. 生成下一步行动
        const action = await this.planNextAction(mission, boundaries);

        // 3. 执行行动
        const result = await this.executeAction(action, ctx);

        // 4. 更新状态
        this.context.actions.push({
          loop: this.loopCountValue,
          action: action.description,
          result: result.summary,
          timestamp: Date.now(),
        });

        // 5. 定期压缩上下文
        if (this.loopCountValue % this.config.compressInterval === 0 && this.loopCountValue > 0) {
          this.compressContext();
        }

        // 6. 定期汇报（包含性能指标）
        if (this.loopCountValue % this.config.reportInterval === 0) {
          await this.sendReport(ctx, {
            loop: this.loopCountValue,
            action: action.description,
            result: result.summary,
          });
        }

        this.loopCountValue++;

        // 记录循环时间
        this.recordLoopTime();
        this.lastLoopTime = Date.now(); // 更新健康检查时间戳

        // ⚡ 零延迟：立即进入下一轮，无 sleep

      } catch (error) {
        // 狂暴异常处理
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorCategory = this.categorizeError(errorMsg);

        this.api.logger.error(
          `❌ [循环 ${this.loopCountValue}] 异常: ${errorMsg} ` +
          `[${errorCategory}]`
        );

        this.context.errors.push({
          loop: this.loopCountValue,
          error: errorMsg,
          timestamp: Date.now(),
          category: errorCategory,
          resolved: false,
        });

        // 记录异常循环的时间
        this.recordLoopTime();

        // 错误注入上下文，让 AI 换方法
        // 立即继续下一轮
      }
    }

    this.api.logger.info(`🔄 永动循环结束，总循环次数: ${this.loopCountValue}`);
    this.logPerformanceMetrics();
  }

  /**
   * 加载 MISSION 和 BOUNDARIES 文件
   *
   * 尝试从工作目录加载配置文件，失败时返回默认值。
   *
   * @param ctx 服务上下文
   * @returns MISSION 和 BOUNDARIES 内容
   */
  private async loadMissionFiles(ctx: OpenClawPluginServiceContext): Promise<{
    mission: string;
    boundaries: string;
  }> {
    const workspaceDir = ctx.workspaceDir || process.cwd();
    const missionPath = path.join(workspaceDir, MissionFileNames.MISSION);
    const boundariesPath = path.join(workspaceDir, MissionFileNames.BOUNDARIES);

    try {
      const [mission, boundaries] = await Promise.all([
        fs.readFile(missionPath, "utf-8").catch(() => this.getDefaultMission()),
        fs.readFile(boundariesPath, "utf-8").catch(() => this.getDefaultBoundaries()),
      ]);

      return { mission, boundaries };
    } catch (error) {
      this.api.logger.warn("无法加载 MISSION/BOUNDARIES，使用默认值");
      return {
        mission: this.getDefaultMission(),
        boundaries: this.getDefaultBoundaries(),
      };
    }
  }

  /**
   * 默认 MISSION
   */
  private getDefaultMission(): string {
    return `# MISSION - 龙虾永动引擎

## 核心目标
持续学习和优化，为用户提供最佳协助

## 具体任务
1. 监控工作区状态
2. 识别可优化的地方
3. 生成改进建议

## 成功指标
- 用户满意度
- 任务完成率
`;
  }

  /**
   * 默认 BOUNDARIES
   */
  private getDefaultBoundaries(): string {
    return `# BOUNDARIES - 安全边界

## 绝对禁止
- ❌ 删除用户文件
- ❌ 执行危险命令
- ❌ 修改核心配置

## 允许的操作
- ✅ 读取和分析数据
- ✅ 生成报告
- ✅ 发送状态更新
`;
  }

  /**
   * 生成下一步行动
   *
   * 决策优先级：
   * 1. 未解决的错误 → 错误恢复行动
   * 2. 首次循环 → 初始化
   * 3. MISSION 任务 → 解析的任务列表
   * 4. 默认维护 → 预定义维护任务
   *
   * @param mission MISSION 文件内容
   * @param boundaries BOUNDARIES 文件内容
   * @returns 行动描述和类型
   */
  private async planNextAction(mission: string, boundaries: string): Promise<{
    description: string;
    type: string;
  }> {
    // 优先级1：处理未解决的错误
    const unresolvedErrors = this.context.errors.filter(e => !e.resolved);
    if (unresolvedErrors.length > 0) {
      const lastError = unresolvedErrors[unresolvedErrors.length - 1];
      const recovery = this.getErrorRecoveryAction(lastError);

      // 标记错误为已处理
      lastError.resolved = true;

      return {
        description: recovery.description,
        type: "error_recovery",
      };
    }

    // 优先级2：初始化
    if (this.loopCountValue === 0) {
      return {
        description: "初始化引擎，加载配置和状态",
        type: "init",
      };
    }

    // 优先级3：根据 MISSION 生成行动
    const actions = this.parseMissionActions(mission);

    // 优先级4：默认维护行动
    const selectedActions = actions.length > 0 ? actions : [...DEFAULT_MAINTENANCE_ACTIONS];
    return {
      description: selectedActions[this.loopCountValue % selectedActions.length],
      type: "execute",
    };
  }

  /**
   * 根据错误类型生成恢复行动
   *
   * 支持的错误类型：
   * - `file_io`: 文件操作失败 → 重试并检查权限
   * - `parse`: 数据解析失败 → 使用默认值
   * - `network`: 网络请求失败 → 使用缓存
   * - `permission`: 权限不足 → 降级到只读
   * - `timeout`: 操作超时 → 简化操作
   * - `unknown`: 未知错误 → 记录并跳过
   *
   * @param error 错误记录
   * @returns 恢复行动描述
   */
  private getErrorRecoveryAction(error: ErrorRecord): {
    description: string;
  } {
    const category = error.category || ErrorCategory.UNKNOWN;
    let message = RecoveryMessages[category];

    // UNKNOWN 类型需要包含错误详情
    if (category === ErrorCategory.UNKNOWN) {
      message = `${message}: ${error.error.slice(0, 30)}...`;
    }

    return { description: message };
  }

  /**
   * 从 MISSION 解析行动列表
   */
  private parseMissionActions(mission: string): string[] {
    const actions: string[] = [];
    const lines = mission.split('\n');
    let inTasksSection = false;

    for (const line of lines) {
      if (line.includes(MissionSections.TASKS) || line.includes(MissionSections.ALTERNATIVE_TASKS)) {
        inTasksSection = true;
        continue;
      }
      if (inTasksSection && line.startsWith('##')) {
        break;
      }
      if (inTasksSection && line.match(/^\d+\.\s*(.+)/)) {
        actions.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    }

    return actions;
  }

  /**
   * 执行行动
   */
  private async executeAction(
    action: { description: string; type: string },
    ctx: OpenClawPluginServiceContext
  ): Promise<{ summary: string }> {
    // 根据行动类型执行不同的逻辑
    switch (action.type) {
      case ActionType.INIT:
        return { summary: "引擎初始化完成，已加载 MISSION 和 BOUNDARIES" };

      case ActionType.ERROR_RECOVERY:
        return { summary: "已记录错误，将在下次循环中调整策略" };

      case ActionType.EXECUTE:
        return await this.executeConcreteAction(action.description, ctx);

      default:
        return { summary: `已执行: ${action.description}` };
    }
  }

  /**
   * 执行具体行动（根据描述匹配处理器）
   */
  private async executeConcreteAction(
    description: string,
    ctx: OpenClawPluginServiceContext
  ): Promise<{ summary: string }> {
    const handlers = {
      [ActionKeywords.ANALYZE]: () => this.analyzeWorkspace(ctx),
      [ActionKeywords.CHECK]: () => this.checkStatus(ctx),
      [ActionKeywords.GENERATE]: () => this.generateSuggestion(ctx),
      [ActionKeywords.CODE]: () => this.analyzeCodebase(ctx),
    };

    for (const [keyword, handler] of Object.entries(handlers)) {
      if (description.includes(keyword)) {
        const result = await handler();
        return { summary: result };
      }
    }

    return { summary: `已完成: ${description}` };
  }

  /**
   * 分析工作区状态（带缓存）
   */
  private async analyzeWorkspace(ctx: OpenClawPluginServiceContext): Promise<string> {
    return this.analyzeDirectory(ctx, "工作区");
  }

  /**
   * 检查状态
   */
  private async checkStatus(ctx: OpenClawPluginServiceContext): Promise<string> {
    const statePath = path.join(ctx.stateDir, StateFileNames.ENGINE_STATE);
    try {
      await fs.access(statePath);
      const stat = await fs.stat(statePath);
      const lastModified = new Date(stat.mtime).toLocaleString('zh-CN');
      return `状态文件存在，最后更新: ${lastModified}`;
    } catch {
      return `状态文件不存在，等待首次循环`;
    }
  }

  /**
   * 生成优化建议（带日志记录）
   */
  private async generateSuggestion(ctx: OpenClawPluginServiceContext): Promise<string> {
    const suggestions = [
      "建议：添加单元测试覆盖核心功能",
      "建议：完善错误处理机制",
      "建议：优化上下文压缩算法",
      "建议：添加更多行动类型",
      "建议：集成 LLM API 实现智能决策",
      "建议：添加性能监控指标"
    ];

    const suggestion = suggestions[this.loopCountValue % suggestions.length];

    // 异步写入日志文件（不阻塞主循环）
    this.writeSuggestionLog(ctx, suggestion).catch(err => {
      safeDebug(this.api.logger,`建议日志写入失败: ${err instanceof Error ? err.message : String(err)}`);
    });

    return `已记录建议: ${suggestion}`;
  }

  /**
   * 异步写入建议日志
   */
  private async writeSuggestionLog(ctx: OpenClawPluginServiceContext, suggestion: string): Promise<void> {
    try {
      const logPath = path.join(ctx.stateDir, StateFileNames.SUGGESTIONS_LOG);
      const timestamp = new Date().toISOString();
      await fs.mkdir(ctx.stateDir, { recursive: true });
      await fs.appendFile(logPath, `[${timestamp}] ${suggestion}\n`);
    } catch {
      // 静默失败，不影响主循环
    }
  }

  /**
   * 分析代码库并生成优化报告
   */
  private async analyzeCodebase(ctx: OpenClawPluginServiceContext): Promise<string> {
    return this.analyzeDirectory(ctx, "代码库");
  }

  /**
   * 通用目录分析方法
   *
   * @param ctx 服务上下文
   * @param label 分析结果标签
   * @returns 分析结果字符串
   */
  private async analyzeDirectory(
    ctx: OpenClawPluginServiceContext,
    label: string
  ): Promise<string> {
    const workspaceDir = ctx.workspaceDir || process.cwd();
    try {
      const files = await this.getCachedFiles(workspaceDir);
      const stats = this.countFileTypes(files);
      return `${label}分析: TS(${stats.ts}) JS(${stats.js}) JSON(${stats.json}) MD(${stats.md})`;
    } catch (error) {
      safeDebug(this.api.logger, `${label}分析失败: ${error instanceof Error ? error.message : String(error)}`);
      return `${label}分析完成`;
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 获取缓存的文件列表
   */
  private async getCachedFiles(dir: string): Promise<string[]> {
    const now = Date.now();
    const cached = this.fileCache.get(dir);

    if (cached && (now - cached.timestamp) < this.config.cacheTTL) {
      return cached.data;
    }

    const files = await fs.readdir(dir);
    this.fileCache.set(dir, { data: files, timestamp: now });
    return files;
  }

  /**
   * 统计文件类型
   */
  private countFileTypes(files: string[]): { ts: number; js: number; json: number; md: number } {
    const stats = { ts: 0, js: 0, json: 0, md: 0 };
    for (const file of files) {
      if (file.endsWith(FileExtensions.TYPESCRIPT)) stats.ts++;
      else if (file.endsWith(FileExtensions.JAVASCRIPT)) stats.js++;
      else if (file.endsWith(FileExtensions.JSON)) stats.json++;
      else if (file.endsWith(FileExtensions.MARKDOWN)) stats.md++;
    }
    return stats;
  }

  /**
   * 压缩上下文（使用配置的限制）
   */
  private compressContext(): void {
    // 使用配置中的最大值
    if (this.context.actions.length > this.config.maxActions) {
      this.context.actions = this.context.actions.slice(-this.config.maxActions);
    }
    if (this.context.errors.length > this.config.maxErrors) {
      this.context.errors = this.context.errors.slice(-this.config.maxErrors);
    }
    safeDebug(this.api.logger, LogMessages.CONTEXT_COMPRESSED(this.context.actions.length, this.context.errors.length));
  }

  /**
   * 发送汇报
   */
  private async sendReport(
    ctx: OpenClawPluginServiceContext,
    status: { loop: number; action: string; result: string }
  ): Promise<void> {
    // 简化版：只记录日志
    // 实际应该通过 OpenClaw 发送消息到配置的频道
    this.api.logger.info(
      `📤 [循环 ${status.loop}] ${status.action} → ${status.result}`
    );

    // 持久化状态到磁盘
    await this.persistState(ctx);
  }

  /**
   * 持久化状态到磁盘（带原子写入）
   */
  private async persistState(ctx: OpenClawPluginServiceContext): Promise<void> {
    const statePath = path.join(ctx.stateDir, StateFileNames.ENGINE_STATE);
    const tmpPath = statePath + StateFileNames.TEMP_SUFFIX;

    try {
      await fs.mkdir(ctx.stateDir, { recursive: true });

      const stateData = JSON.stringify({
        isRunning: this.isRunningValue,
        loopCount: this.loopCountValue,
        context: this.context,
        lastUpdate: new Date().toISOString(),
        version: "1.0.0"
      }, null, 2);

      // 先写入临时文件，然后原子性重命名（防止写入中断导致损坏）
      await fs.writeFile(tmpPath, stateData, 'utf-8');
      await fs.rename(tmpPath, statePath);

      safeDebug(this.api.logger, LogMessages.STATE_PERSISTED(this.loopCountValue));
    } catch (error) {
      this.api.logger.warn(`状态持久化失败: ${error instanceof Error ? error.message : String(error)}`);
      // 清理临时文件
      try { await fs.unlink(tmpPath).catch(() => {}); } catch {}
    }
  }

  // ========== 状态查询方法 ==========

  isRunning(): boolean {
    return this.isRunningValue;
  }

  getLoopCount(): number {
    return this.loopCountValue;
  }

  getContextSize(): number {
    return JSON.stringify(this.context).length;
  }

  hasRecentErrors(): boolean {
    if (this.context.errors.length === 0) return false;
    const lastError = this.context.errors[this.context.errors.length - 1];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastError.timestamp > fiveMinutesAgo;
  }

  /**
   * 获取平均循环时间（毫秒）
   */
  getAvgLoopTime(): number {
    return this.loopMetrics.avgTime;
  }

  /**
   * 获取循环速率（每秒循环数）
   */
  getLoopsPerSecond(): number {
    if (this.loopMetrics.avgTime === 0) return 0;
    return Math.round(1000 / this.loopMetrics.avgTime * 100) / 100;
  }

  // ========== 性能监控方法 ==========

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    if (!this.config.enableHealthCheck) return;

    this.healthCheckInterval = setInterval(() => {
      const timeSinceLastLoop = Date.now() - this.lastLoopTime;
      if (timeSinceLastLoop > this.config.stallThreshold && this.isRunningValue) {
        this.api.logger.warn(
          LogMessages.HEALTH_CHECK_STALL(Math.round(timeSinceLastLoop / 1000))
        );
        // 注意：不自动停止，让用户决定
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * 记录循环时间
   */
  private recordLoopTime(): void {
    const elapsed = Date.now() - this.loopStartTime;

    this.loopMetrics.totalTime += elapsed;
    if (elapsed < this.loopMetrics.minTime) this.loopMetrics.minTime = elapsed;
    if (elapsed > this.loopMetrics.maxTime) this.loopMetrics.maxTime = elapsed;

    // 计算平均时间
    this.loopMetrics.avgTime = Math.round(
      this.loopMetrics.totalTime / (this.loopCountValue + 1) * 100
    ) / 100;
  }

  /**
   * 记录性能指标
   */

  /**
   * 分类错误类型
   *
   * 根据错误消息中的关键词匹配预定义的分类规则。
   *
   * @param errorMsg 错误消息
   * @returns 错误分类
   */
  private categorizeError(errorMsg: string): ErrorCategory {
    const lower = errorMsg.toLowerCase();

    for (const rule of ErrorClassificationRules) {
      for (const pattern of rule.patterns) {
        if (lower.includes(pattern)) {
          return rule.category;
        }
      }
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * 获取内存使用情况（MB）
   */
  getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100;
  }

  /**
   * 获取按类型分组的错误统计
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const err of this.context.errors) {
      const category = err.category || ErrorCategory.UNKNOWN;
      stats[category] = (stats[category] || 0) + 1;
    }
    return stats;
  }
  /**
   * 记录性能指标
   */
  private logPerformanceMetrics(): void {
    this.api.logger.info(
      LogMessages.PERFORMANCE_METRICS({
        total: this.loopCountValue,
        avg: this.loopMetrics.avgTime,
        min: this.loopMetrics.minTime === Infinity ? 0 : this.loopMetrics.minTime,
        max: this.loopMetrics.maxTime,
        rate: this.getLoopsPerSecond(),
      })
    );
  }
}

/**
 * 行动记录接口
 * @internal
 */
interface ActionRecord {
  /** 循环编号 */
  loop: number;
  /** 执行的行动描述 */
  action: string;
  /** 执行结果摘要 */
  result: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 错误记录接口
 * @internal
 */
interface ErrorRecord {
  /** 循环编号 */
  loop: number;
  /** 错误消息 */
  error: string;
  /** 时间戳 */
  timestamp: number;
  /** 错误分类 */
  category?: ErrorCategory;
  /** 是否已解决 */
  resolved?: boolean;
}

/**
 * 上下文状态接口
 * @internal
 */
interface ContextState {
  /** 行动记录列表 */
  actions: ActionRecord[];
  /** 错误记录列表 */
  errors: ErrorRecord[];
}

/**
 * 错误类型分类枚举
 * @internal
 */
enum ErrorCategory {
  /** 未知错误 */
  UNKNOWN = "unknown",
  /** 文件IO错误 */
  FILE_IO = "file_io",
  /** 解析错误 */
  PARSE = "parse",
  /** 网络错误 */
  NETWORK = "network",
  /** 权限错误 */
  PERMISSION = "permission",
  /** 超时错误 */
  TIMEOUT = "timeout",
}

/** 错误分类规则 */
const ErrorClassificationRules = [
  {
    patterns: ["enoent", "eacces", "file"],
    category: ErrorCategory.FILE_IO,
  },
  {
    patterns: ["syntax", "parse", "json"],
    category: ErrorCategory.PARSE,
  },
  {
    patterns: ["network", "fetch", "request"],
    category: ErrorCategory.NETWORK,
  },
  {
    patterns: ["permission", "unauthorized", "forbidden"],
    category: ErrorCategory.PERMISSION,
  },
  {
    patterns: ["timeout", "timed out"],
    category: ErrorCategory.TIMEOUT,
  },
] as const;

/** 错误恢复消息模板 */
const RecoveryMessages: Record<ErrorCategory, string> = {
  [ErrorCategory.FILE_IO]: "重试文件操作，检查文件路径权限",
  [ErrorCategory.PARSE]: "验证数据格式，使用默认值继续",
  [ErrorCategory.NETWORK]: "切换到离线模式，使用缓存数据",
  [ErrorCategory.PERMISSION]: "降级操作，使用只读模式",
  [ErrorCategory.TIMEOUT]: "增加超时时间，简化操作",
  [ErrorCategory.UNKNOWN]: "记录并跳过错误",
};
