/**
 * 引擎配置
 */

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
  return {
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
}
