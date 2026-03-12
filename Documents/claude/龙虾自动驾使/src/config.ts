/**
 * 引擎配置
 */

/**
 * 配置验证错误
 */
export class ConfigValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly invalidValue: unknown,
    message: string
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/**
 * 验证配置值范围
 */
export function validateConfig(config: EngineConfig): void {
  const errors: string[] = [];

  // 验证循环间隔
  if (config.compressInterval < 1 || config.compressInterval > 100) {
    errors.push(`compressInterval 必须在 1-100 之间，当前: ${config.compressInterval}`);
  }
  if (config.persistInterval < 1 || config.persistInterval > 1000) {
    errors.push(`persistInterval 必须在 1-1000 之间，当前: ${config.persistInterval}`);
  }
  if (config.reportInterval < 1 || config.reportInterval > 1000) {
    errors.push(`reportInterval 必须在 1-1000 之间，当前: ${config.reportInterval}`);
  }

  // 验证时间阈值
  if (config.cacheTTL < 100 || config.cacheTTL > 60000) {
    errors.push(`cacheTTL 必须在 100-60000ms 之间，当前: ${config.cacheTTL}`);
  }
  if (config.stallThreshold < 1000 || config.stallThreshold > 300000) {
    errors.push(`stallThreshold 必须在 1000-300000ms 之间，当前: ${config.stallThreshold}`);
  }
  if (config.healthCheckInterval < 1000 || config.healthCheckInterval > 300000) {
    errors.push(`healthCheckInterval 必须在 1000-300000ms 之间，当前: ${config.healthCheckInterval}`);
  }

  // 验证数量限制
  if (config.maxActions < 1 || config.maxActions > 1000) {
    errors.push(`maxActions 必须在 1-1000 之间，当前: ${config.maxActions}`);
  }
  if (config.maxErrors < 1 || config.maxErrors > 500) {
    errors.push(`maxErrors 必须在 1-500 之间，当前: ${config.maxErrors}`);
  }

  if (errors.length > 0) {
    throw new ConfigValidationError("multiple", config, errors.join("; "));
  }
}

export interface EngineConfig {
  // 循环配置
  readonly compressInterval: number;    // 上下文压缩间隔（循环数）
  readonly persistInterval: number;     // 状态持久化间隔（循环数）
  readonly reportInterval: number;      // 汇报间隔（循环数）

  // 性能配置
  readonly cacheTTL: number;            // 缓存生存时间（毫秒）
  readonly stallThreshold: number;      // 卡死检测阈值（毫秒）
  readonly healthCheckInterval: number; // 健康检查间隔（毫秒）

  // 上下文限制
  readonly maxActions: number;          // 最大行动记录数
  readonly maxErrors: number;           // 最大错误记录数

  // 功能开关
  readonly enableHealthCheck: boolean;  // 启用健康检查
  readonly enableMetrics: boolean;      // 启用性能指标
  readonly enableCache: boolean;        // 启用文件缓存
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: EngineConfig = {
  compressInterval: 3,
  persistInterval: 10,
  reportInterval: 10,
  cacheTTL: 5000,
  stallThreshold: 30000,
  healthCheckInterval: 15000,
  maxActions: 50,
  maxErrors: 20,
  enableHealthCheck: true,
  enableMetrics: true,
  enableCache: true,
};

/**
 * 从环境变量加载配置
 */
export function loadConfig(openclawConfig?: Record<string, unknown>): EngineConfig {
  const config = openclawConfig || {};
  const loadedConfig: EngineConfig = {
    ...DEFAULT_CONFIG,
    // 优先使用OpenClaw配置，其次环境变量，最后默认值
    compressInterval: (config.compressInterval as number) ?? parseInt(process.env.LOBSTER_COMPRESS_INTERVAL || '') ?? DEFAULT_CONFIG.compressInterval,
    persistInterval: (config.persistInterval as number) ?? parseInt(process.env.LOBSTER_PERSIST_INTERVAL || '') ?? DEFAULT_CONFIG.persistInterval,
    reportInterval: (config.reportInterval as number) ?? parseInt(process.env.LOBSTER_REPORT_INTERVAL || '') ?? DEFAULT_CONFIG.reportInterval,
    cacheTTL: (config.cacheTTL as number) ?? parseInt(process.env.LOBSTER_CACHE_TTL || '') ?? DEFAULT_CONFIG.cacheTTL,
    stallThreshold: (config.stallThreshold as number) ?? parseInt(process.env.LOBSTER_STALL_THRESHOLD || '') ?? DEFAULT_CONFIG.stallThreshold,
    healthCheckInterval: (config.healthCheckInterval as number) ?? parseInt(process.env.LOBSTER_HEALTH_CHECK_INTERVAL || '') ?? DEFAULT_CONFIG.healthCheckInterval,
    maxActions: (config.maxActions as number) ?? parseInt(process.env.LOBSTER_MAX_ACTIONS || '') ?? DEFAULT_CONFIG.maxActions,
    maxErrors: (config.maxErrors as number) ?? parseInt(process.env.LOBSTER_MAX_ERRORS || '') ?? DEFAULT_CONFIG.maxErrors,
    enableHealthCheck: (config.enableHealthCheck as boolean) ?? process.env.LOBSTER_HEALTH_CHECK !== 'false',
    enableMetrics: (config.enableMetrics as boolean) ?? process.env.LOBSTER_METRICS !== 'false',
    enableCache: (config.enableCache as boolean) ?? process.env.LOBSTER_CACHE !== 'false',
  };

  // 验证配置值范围
  try {
    validateConfig(loadedConfig);
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      console.warn(`⚠️ 配置验证失败，使用默认值: ${error.message}`);
      // 返回安全的默认配置
      return { ...DEFAULT_CONFIG };
    }
    throw error;
  }

  return loadedConfig;
}
