# 🦞 龙虾永动引擎 - OpenClaw 插件

> 零延迟 while(isRunning) 死循环，24/7/365 自治运行

## 特性

### 核心功能
- **零延迟永动循环** - 真正的 `while(isRunning)` 死循环，无心跳、无 sleep
- **狂暴异常处理** - 任何错误都转化为提示词，立即继续下一轮
- **智能错误分类** - 按类型（文件IO、解析、网络、权限、超时）分类处理
- **自适应错误恢复** - 根据错误类型采取不同的恢复策略
- **状态持久化** - 定期保存状态到磁盘（原子写入，防止损坏）
- **状态恢复** - 重启后恢复之前的循环计数和上下文

### 高级引擎模块 (v2.0)
- **事件循环监控** - P50/P95/P99 延迟追踪、健康状态评估
- **自适应调度** - 基于负载动态调整并发和优先级
- **熔断器模式** - 防止级联失败，自动恢复
- **智能重试** - 指数退避 + 抖动，避免惊群效应
- **Worker 线程池** - CPU 密集型任务卸载，避免阻塞事件循环
- **遥测导出** - JSON/Prometheus/StatsD 多格式支持

## 安装

### 作为 OpenClaw 插件

```bash
# 复制到 OpenClaw workspace 插件目录
cp -r /path/to/lobster-perpetual-engine ~/.openclaw/workspace/plugins/

# 或创建符号链接
ln -s /path/to/lobster-perpetual-engine ~/.openclaw/workspace/plugins/lobster-perpetual-engine
```

### 重启 Gateway

```bash
openclaw restart gateway
```

## 使用

### 在 Telegram/Discord 中

```
/start_partner   启动永动循环
/stop_partner    停止永动循环
/partner_status  查看引擎状态
```

### 状态输出示例

```
🦞 永动引擎状态

运行中: 是
循环次数: 1234
平均耗时: 5ms
循环速率: 200 循环/秒
内存使用: 12.5 MB
错误统计: file_io: 2, parse: 1
上下文大小: 2048 字符
```

## 配置

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LOBSTER_COMPRESS_INTERVAL` | 3 | 上下文压缩间隔（循环数） |
| `LOBSTER_PERSIST_INTERVAL` | 10 | 状态持久化间隔（循环数） |
| `LOBSTER_CACHE_TTL` | 5000 | 缓存生存时间（毫秒） |
| `LOBSTER_HEALTH_CHECK` | true | 启用健康检查 |
| `LOBSTER_METRICS` | true | 启用性能指标 |
| `LOBSTER_CACHE` | true | 启用文件缓存 |

### 代码配置

```typescript
import { PerpetualEngineService, DEFAULT_CONFIG } from "./engine/service.js";

const engine = new PerpetualEngineService(api, {
  ...DEFAULT_CONFIG,
  compressInterval: 5,
  enableHealthCheck: true,
});
```

## 架构

```
src/
├── plugin.ts              # 插件入口，注册命令和服务
├── types.ts               # OpenClaw 类型定义
├── config.ts              # 引擎配置系统
├── test.ts                # 单元测试
├── perf-test.ts           # 性能测试
└── engine/
    ├── index.ts           # 模块统一导出入口
    ├── service.ts        # 永动引擎核心逻辑
    │   ├── runLoop()              # while(isRunning) 主循环
    │   ├── planNextAction()       # 从 MISSION 解析任务
    │   ├── executeAction()        # 执行具体操作
    │   ├── categorizeError()      # 错误分类
    │   ├── getErrorRecoveryAction() # 错误恢复策略
    │   ├── compressContext()      # 上下文压缩
    │   └── persistState()         # 状态持久化（原子写入）
    ├── zero-latency-loop.ts      # 零延迟循环引擎
    ├── advanced-metrics.ts       # 高级指标监控 (P50/P95/P99)
    ├── adaptive-scheduler.ts     # 自适应任务调度器
    ├── circuit-breaker.ts        # 熔断器模式
    ├── retry-manager.ts          # 智能重试管理器
    ├── worker-pool.ts            # Worker 线程池
    ├── telemetry.ts              # 遥测数据导出
    ├── code-analyzer.ts          # 代码质量分析器
    ├── code-fixer.ts             # 代码自动修复器
    ├── task-planner.ts           # 任务规划器
    └── ast-cache.ts               # AST 缓存和 memoization
```

## 模块说明

### 高级指标监控 (advanced-metrics.ts)
- **功能**: P50/P95/P99 延迟统计、内存使用监控、CPU 使用率、背压检测
- **健康状态**: healthy / degraded / unhealthy 三级评估
- **参考**: [Node.js Performance Monitoring Best Practices](https://dev.to/olivia_madison_b0ad7090ad/nodejs-performance-monitoring-best-practices-5gep)

### 自适应调度器 (adaptive-scheduler.ts)
- **功能**: 基于系统负载动态调整并发数、优先级队列、紧急降级
- **负载等级**: IDLE / NORMAL / HIGH / OVERLOAD
- **参考**: [How to Prevent Event Loop Blocking](https://www.linkedin.com/pulse/how-prevent-event-loop-blocking-nodejs-high-traffic-systems-n2fqc)

### 熔断器模式 (circuit-breaker.ts)
- **功能**: 防止级联失败、自动恢复、滑动窗口统计
- **状态**: CLOSED → OPEN → HALF_OPEN
- **参考**: [Circuit Breaker Pattern](https://docs.aws.amazon.com/wellarchitected/reliability/pattern-circuit-breaker.html)

### 智能重试管理器 (retry-manager.ts)
- **功能**: 指数退避 + 抖动、多种重试策略
- **策略**: FIXED / LINEAR / EXPONENTIAL / EXPONENTIAL_WITH_JITTER
- **参考**: [Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter.html)

### Worker 线程池 (worker-pool.ts)
- **功能**: CPU 密集型任务卸载、任务队列、Worker 自动重启
- **参考**: [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)

### 遥测数据导出 (telemetry.ts)
- **功能**: JSON / Prometheus / StatsD 格式导出、批量写入、采样控制
- **参考**: [Monitoring the Node.js Event Loop](https://medium.com/@atatus/monitoring-the-node-js-event-loop-why-its-essential-35512c36cdd5)

## 使用示例

### 零延迟循环引擎
```typescript
import { ZeroLatencyLoopEngine, createZeroLatencyLoop } from "./engine/index.js";

const engine = new ZeroLatencyLoopEngine();
await engine.start(async () => {
  // 你的循环逻辑
  return true; // 返回 false 停止循环
});

// 使用工厂函数
const loop = createZeroLatencyLoop({ yieldAfterEachLoop: true });
```

### 高级指标监控
```typescript
import { AdvancedMetricsCollector } from "./engine/index.js";

const metrics = new AdvancedMetricsCollector({
  p95LagWarning: 50,
  p95LagCritical: 100,
});

// 获取完整指标
const fullMetrics = metrics.getFullMetrics();
console.log(`健康状态: ${fullMetrics.healthStatus}`);
console.log(`P95 延迟: ${fullMetrics.p95Lag}ms`);
console.log(`背压等级: ${fullMetrics.backpressureLevel}/10`);
```

### 自适应调度器
```typescript
import { AdaptiveScheduler, TaskPriority, LoadLevel } from "./engine/index.js";

const scheduler = new AdaptiveScheduler({
  maxConcurrent: 10,
  maxQueueSize: 1000,
});

// 添加任务
scheduler.schedule({
  name: "重要任务",
  priority: TaskPriority.HIGH,
  fn: async () => { /* 任务逻辑 */ },
  canDegrade: true,
});

// 检查负载等级
if (scheduler.getLoadLevel() === LoadLevel.OVERLOAD) {
  console.log("系统过载！");
}
```

### 熔断器
```typescript
import { CircuitBreaker, CircuitState } from "./engine/index.js";

const breaker = new CircuitBreaker("api-service", {
  failureThreshold: 5,
  timeout: 60000,
});

try {
  const result = await breaker.execute(async () => {
    return await riskyApiCall();
  });
} catch (error) {
  if (breaker.getState() === CircuitState.OPEN) {
    console.log("熔断器已开启");
  }
}
```

### 智能重试
```typescript
import { RetryManager, RetryStrategy } from "./engine/index.js";

const retryManager = new RetryManager({
  maxRetries: 3,
  strategy: RetryStrategy.EXPONENTIAL_WITH_JITTER,
});

const result = await retryManager.execute(async () => {
  return await flakyApiCall();
});
```

### Worker 线程池
```typescript
import { WorkerPool } from "./engine/index.js";

const pool = new WorkerPool({
  poolSize: 4,
  taskTimeout: 30000,
});

await pool.initialize();
const result = await pool.execute("cpu-intensive-task", { data: 123 });
```

### 遥测导出
```typescript
import { TelemetryCollector } from "./engine/index.js";

const telemetry = new TelemetryCollector({
  format: "prometheus",
  sampleRate: 1.0,
  batchSize: 100,
});

telemetry.record({
  eventLoop: {
    avgLag: 5.2,
    maxLag: 42.1,
    p95Lag: 12.5,
    healthStatus: "healthy",
  },
  system: {
    cpuUsage: 0.35,
    memoryUsage: {
      rss: 128 * 1024 * 1024,
      heapUsed: 64 * 1024 * 1024,
      heapTotal: 128 * 1024 * 1024,
    },
  },
});
```

### 完整引擎组合
```typescript
import { createFullEngine, healthCheck, shutdownEngine } from "./engine/index.js";

const engine = createFullEngine({
  enableWorkerPool: true,
  enableTelemetry: true,
  telemetryFormat: "json",
  enableAdaptiveScheduler: true,
  enableCircuitBreaker: true,
  enableRetryManager: true,
});

// 健康检查
const { healthy, components } = await healthCheck(engine);
console.log(`引擎健康: ${healthy}`, components);

// 关闭引擎
await shutdownEngine(engine);
```

## 错误分类与恢复

引擎会自动分类错误并采取相应的恢复策略：

| 错误类型 | 恢复策略 |
|---------|---------|
| `file_io` | 重试文件操作，检查文件路径权限 |
| `parse` | 验证数据格式，使用默认值继续 |
| `network` | 切换到离线模式，使用缓存数据 |
| `permission` | 降级操作，使用只读模式 |
| `timeout` | 增加超时时间，简化操作 |
| `unknown` | 记录并跳过 |

## 状态文件

运行时状态保存在：
- `~/.openclaw/.lobster-engine/engine-state.json` - 引擎状态
- `~/.openclaw/.lobster-engine/suggestions.log` - 优化建议日志

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build

# 监听模式
npm run dev

# 清理
npm run clean

# 运行测试
npx tsx tests/engine.test.ts

# 运行基准测试
npx tsx tests/benchmark.ts
```

## 性能

- 吞吐量: >1,000,000 次/秒（状态查询）
- 内存占用: ~8-15 MB（取决于上下文大小）
- 零延迟循环: 无 sleep，无心跳间隔

## License

MIT
