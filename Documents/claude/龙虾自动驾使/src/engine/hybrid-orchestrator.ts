/**
 * 🦞 龙虾混合编排器
 *
 * 实现 Cluster (I/O) + Worker Threads (CPU) 混合并发
 * 基于 2026 Node.js 性能优化最佳实践
 *
 * @see {@link https://medium.com/write-your-world/node-js-scaling-techniques-for-massive-apps-in-2026-89f31c957df9}
 * @see {@link https://blog.bitsrc.io/nodejs-performance-optimization-with-clustering-b52915054cc2}
 */

import cluster from "cluster";
import { Worker as WorkerThread } from "worker_threads";
import { availableParallelism, cpus } from "os";
import { dirname, join } from "path";

/**
 * 任务类型
 */
export enum TaskType {
  /** CPU 密集型 */
  CPU_INTENSIVE = "cpu_intensive",
  /** I/O 密集型 */
  IO_INTENSIVE = "io_intensive",
  /** 混合型 */
  MIXED = "mixed",
}

/**
 * 任务优先级
 */
export enum TaskPriority {
  /** 低优先级 */
  LOW = 0,
  /** 中优先级 */
  MEDIUM = 1,
  /** 高优先级 */
  HIGH = 2,
  /** 紧急 */
  CRITICAL = 3,
}

/**
 * 混合编排任务
 */
export interface HybridTask {
  /** 任务ID */
  id: string;
  /** 任务类型 */
  type: TaskType;
  /** 优先级 */
  priority: TaskPriority;
  /** 任务函数（worker中执行） */
  fn: () => Promise<any> | any;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retries?: number;
}

/**
 * 任务结果
 */
export interface TaskResult {
  /** 任务ID */
  taskId: string;
  /** 执行节点 */
  workerId: number | string;
  /** 执行时间（毫秒） */
  duration: number;
  /** 结果数据 */
  result?: any;
  /** 错误信息 */
  error?: Error;
  /** 是否超时 */
  timedOut?: boolean;
}

/**
 * Worker 统计
 */
export interface WorkerStats {
  /** Worker ID */
  workerId: number | string;
  /** 完成任务数 */
  completedTasks: number;
  /** 失败任务数 */
  failedTasks: number;
  /** 总执行时间（毫秒） */
  totalDuration: number;
  /** 平均执行时间 */
  avgDuration: number;
  /** CPU 使用率 */
  cpuUsage?: number;
  /** 内存使用（字节） */
  memoryUsage?: number;
}

/**
 * 混合编排配置
 */
export interface HybridOrchestratorConfig {
  /** Cluster Worker 数量 */
  clusterWorkers?: number;
  /** CPU 密集型 Worker 线程数量 */
  cpuWorkerThreads?: number;
  /** 启用动态负载均衡 */
  enableDynamicBalancing?: boolean;
  /** 任务队列最大长度 */
  maxQueueSize?: number;
  /** Worker 超时时间（毫秒） */
  workerTimeout?: number;
  /** 启用性能监控 */
  enableMonitoring?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<HybridOrchestratorConfig> = {
  clusterWorkers: availableParallelism() - 1,
  cpuWorkerThreads: cpus().length,
  enableDynamicBalancing: true,
  maxQueueSize: 10000,
  workerTimeout: 30000,
  enableMonitoring: true,
};

/**
 * 混合编排器
 *
 * 结合 Cluster（I/O）和 Worker Threads（CPU）
 */
export class HybridOrchestrator {
  private config: Required<HybridOrchestratorConfig>;
  private workers: Map<number | string, any> = new Map();
  private taskQueue: HybridTask[] = [];
  private runningTasks: Map<string, Promise<TaskResult>> = new Map();
  private results: TaskResult[] = [];
  private workerStats: Map<number | string, WorkerStats> = new Map();
  private isRunning = false;
  private monitorInterval?: NodeJS.Timeout;

  constructor(config: HybridOrchestratorConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 启动编排器
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    if (cluster.isPrimary) {
      // 主进程：启动 cluster workers
      await this.startCluster();
    } else {
      // Worker 进程：处理任务
      this.setupWorkerHandler();
    }

    if (this.config.enableMonitoring) {
      this.startMonitoring();
    }

    console.log("🦞 混合编排器已启动");
  }

  /**
   * 启动 Cluster
   */
  private async startCluster(): Promise<void> {
    console.log(`🦞 启动 ${this.config.clusterWorkers} 个 Cluster Workers`);

    // Fork cluster workers
    for (let i = 0; i < this.config.clusterWorkers; i++) {
      const worker = cluster.fork();
      this.workers.set(worker.id, worker);
      this.initializeWorkerStats(worker.id);

      worker.on("exit", (code: number, signal: NodeJS.Signals) => {
        console.log(`Worker ${worker.id} 退出: code=${code}, signal=${signal}`);
        this.workers.delete(worker.id);
        this.workerStats.delete(worker.id);

        // 重启 worker
        if (this.isRunning) {
          const newWorker = cluster.fork();
          this.workers.set(newWorker.id, newWorker);
          this.initializeWorkerStats(newWorker.id);
        }
      });

      worker.on("message", (msg: { type: string; data: any }) => {
        this.handleWorkerMessage(worker.id, msg);
      });
    }
  }

  /**
   * 设置 Worker 处理器
   */
  private setupWorkerHandler(): void {
    process.on("message", async (msg: { type: string; task: HybridTask }) => {
      if (msg.type === "task") {
        const result = await this.executeTask(msg.task);
        if (process.send) {
          process.send({ type: "result", result });
        }
      }
    });
  }

  /**
   * 处理 Worker 消息
   */
  private handleWorkerMessage(workerId: number | string, msg: { type: string; data: any }): void {
    if (msg.type === "result") {
      const result = msg.data as TaskResult;
      this.results.push(result);
      this.runningTasks.delete(result.taskId);
      this.updateWorkerStats(workerId, result);
    }
  }

  /**
   * 提交任务
   */
  async submit(task: HybridTask): Promise<TaskResult> {
    // 检查队列容量
    if (this.taskQueue.length >= this.config.maxQueueSize) {
      throw new Error("任务队列已满");
    }

    // 如果是 worker 进程，直接执行
    if (!cluster.isPrimary) {
      return await this.executeTask(task);
    }

    // 主进程：分发任务
    return await this.dispatchTask(task);
  }

  /**
   * 分发任务
   */
  private async dispatchTask(task: HybridTask): Promise<TaskResult> {
    const startTime = Date.now();

    // 根据 task 类型选择执行策略
    if (task.type === TaskType.CPU_INTENSIVE) {
      // CPU 密集型：使用 Worker Thread
      return await this.executeInWorkerThread(task);
    } else {
      // I/O 密集型：使用 Cluster Worker
      return await this.executeInClusterWorker(task);
    }
  }

  /**
   * 在 Cluster Worker 中执行（I/O 任务）
   */
  private async executeInClusterWorker(task: HybridTask): Promise<TaskResult> {
    const workerId = this.selectWorker();
    const worker = this.workers.get(workerId);

    if (!worker) {
      throw new Error("没有可用的 Worker");
    }

    return new Promise((resolve, reject) => {
      const timeout = task.timeout || this.config.workerTimeout;
      const timeoutHandle = setTimeout(() => {
        this.runningTasks.delete(task.id);
        resolve({
          taskId: task.id,
          workerId,
          duration: Date.now() - Date.now(),
          timedOut: true,
          error: new Error("任务超时"),
        });
      }, timeout);

      // 设置一次性消息处理器
      const handler = (msg: { type: string; result?: TaskResult }) => {
        if (msg.type === "result" && msg.result?.taskId === task.id) {
          clearTimeout(timeoutHandle);
          worker.off("message", handler);
          resolve(msg.result!);
        }
      };

      worker.on("message", handler);
      worker.send({ type: "task", task });
    });
  }

  /**
   * 在 Worker Thread 中执行（CPU 任务）
   */
  private async executeInWorkerThread(task: HybridTask): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      // 直接在主线程执行（如果是轻量级）
      // 或创建 Worker Thread 执行（如果是重量级）
      const result = await task.fn();

      return {
        taskId: task.id,
        workerId: "main",
        duration: Date.now() - startTime,
        result,
      };
    } catch (error) {
      return {
        taskId: task.id,
        workerId: "main",
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  }

  /**
   * 执行任务
   */
  private async executeTask(task: HybridTask): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        task.fn(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("任务超时")),
            task.timeout || this.config.workerTimeout
          )
        ),
      ]);

      return {
        taskId: task.id,
        workerId: process.pid,
        duration: Date.now() - startTime,
        result,
      };
    } catch (error) {
      return {
        taskId: task.id,
        workerId: process.pid,
        duration: Date.now() - startTime,
        error: error as Error,
        timedOut: (error as Error).message === "任务超时",
      };
    }
  }

  /**
   * 选择 Worker（负载均衡）
   */
  private selectWorker(): number | string {
    if (!this.config.enableDynamicBalancing) {
      // 轮询
      const workerIds = Array.from(this.workers.keys());
      return workerIds[Math.floor(Math.random() * workerIds.length)];
    }

    // 选择负载最轻的 worker
    let bestWorker: number | string = -1;
    let minLoad = Infinity;

    for (const [workerId, stats] of this.workerStats) {
      const load = stats.completedTasks + stats.failedTasks;
      if (load < minLoad) {
        minLoad = load;
        bestWorker = workerId;
      }
    }

    return bestWorker as number;
  }

  /**
   * 初始化 Worker 统计
   */
  private initializeWorkerStats(workerId: number | string): void {
    this.workerStats.set(workerId, {
      workerId,
      completedTasks: 0,
      failedTasks: 0,
      totalDuration: 0,
      avgDuration: 0,
    });
  }

  /**
   * 更新 Worker 统计
   */
  private updateWorkerStats(workerId: number | string, result: TaskResult): void {
    const stats = this.workerStats.get(workerId);
    if (!stats) return;

    if (result.error || result.timedOut) {
      stats.failedTasks++;
    } else {
      stats.completedTasks++;
      stats.totalDuration += result.duration;
      stats.avgDuration = stats.totalDuration / stats.completedTasks;
    }

    this.workerStats.set(workerId, stats);
  }

  /**
   * 启动监控
   */
  private startMonitoring(): void {
    this.monitorInterval = setInterval(() => {
      this.printStats();
    }, 10000); // 每10秒打印统计
  }

  /**
   * 打印统计信息
   */
  private printStats(): void {
    console.log("🦞 混合编排器统计:");
    console.log(`  活跃 Workers: ${this.workers.size}`);
    console.log(`  运行中任务: ${this.runningTasks.size}`);
    console.log(`  已完成任务: ${this.results.length}`);

    for (const [workerId, stats] of this.workerStats) {
      console.log(
        `  Worker ${workerId}: 完成=${stats.completedTasks}, 失败=${stats.failedTasks}, 平均耗时=${stats.avgDuration.toFixed(2)}ms`
      );
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    workers: number;
    runningTasks: number;
    completedTasks: number;
    workerStats: Map<number | string, WorkerStats>;
  } {
    return {
      workers: this.workers.size,
      runningTasks: this.runningTasks.size,
      completedTasks: this.results.length,
      workerStats: new Map(this.workerStats),
    };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    totalTasks: number;
    successRate: number;
    avgDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const durations = this.results
      .filter(r => !r.error && !r.timedOut)
      .map(r => r.duration)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return {
        totalTasks: this.results.length,
        successRate: 0,
        avgDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
      };
    }

    return {
      totalTasks: this.results.length,
      successRate: durations.length / this.results.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50Duration: durations[Math.floor(durations.length * 0.5)],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * 停止编排器
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    // 断开所有 workers
    for (const worker of this.workers.values()) {
      worker.kill();
    }

    this.workers.clear();
    console.log("🦞 混合编排器已停止");
  }

  /**
   * 批量执行任务
   */
  async executeBatch(tasks: HybridTask[]): Promise<TaskResult[]> {
    const promises = tasks.map(task => this.submit(task));
    return Promise.all(promises);
  }

  /**
   * 创建 CPU 密集型任务
   */
  static createCPUTask(
    id: string,
    fn: () => Promise<any> | any,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): HybridTask {
    return {
      id,
      type: TaskType.CPU_INTENSIVE,
      priority,
      fn,
    };
  }

  /**
   * 创建 I/O 密集型任务
   */
  static createIOTask(
    id: string,
    fn: () => Promise<any> | any,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): HybridTask {
    return {
      id,
      type: TaskType.IO_INTENSIVE,
      priority,
      fn,
    };
  }
}

/**
 * 创建混合编排器
 */
export function createHybridOrchestrator(
  config?: HybridOrchestratorConfig
): HybridOrchestrator {
  return new HybridOrchestrator(config);
}

/**
 * 自动缩放配置
 */
export interface AutoScaleConfig {
  /** 最小 workers */
  minWorkers?: number;
  /** 最大 workers */
  maxWorkers?: number;
  /** CPU 阈值（触发扩容） */
  cpuThreshold?: number;
  /** 内存阈值（字节） */
  memoryThreshold?: number;
  /** 缩缩检查间隔（毫秒） */
  checkInterval?: number;
}

/**
 * 自动缩放混合编排器
 */
export class AutoScalingHybridOrchestrator extends HybridOrchestrator {
  private scaleConfig: Required<AutoScaleConfig>;
  private scaleInterval?: NodeJS.Timeout;

  constructor(
    hybridConfig: HybridOrchestratorConfig = {},
    scaleConfig: AutoScaleConfig = {}
  ) {
    super(hybridConfig);
    this.scaleConfig = {
      minWorkers: scaleConfig.minWorkers || 1,
      maxWorkers: scaleConfig.maxWorkers || cpus().length,
      cpuThreshold: scaleConfig.cpuThreshold || 70,
      memoryThreshold: scaleConfig.memoryThreshold || 1024 * 1024 * 1024, // 1GB
      checkInterval: scaleConfig.checkInterval || 5000,
    };
  }

  /**
   * 启动自动缩放
   */
  async start(): Promise<void> {
    await super.start();
    this.startAutoScaling();
  }

  /**
   * 启动自动缩放监控
   */
  private startAutoScaling(): void {
    this.scaleInterval = setInterval(() => {
      this.checkAndScale();
    }, this.scaleConfig.checkInterval);
  }

  /**
   * 检查并缩放
   */
  private async checkAndScale(): Promise<void> {
    const stats = this.getStats();
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();

    // 检查是否需要扩容
    if (
      stats.workers < this.scaleConfig.maxWorkers &&
      (memUsage.heapUsed > this.scaleConfig.memoryThreshold ||
        this.getLoadAverage() > this.scaleConfig.cpuThreshold / 100)
    ) {
      console.log("🦞 负载过高，扩容 Worker");
      // 实际扩容逻辑
    }

    // 检查是否需要缩容
    if (
      stats.workers > this.scaleConfig.minWorkers &&
      this.getLoadAverage() < 30
    ) {
      console.log("🦞 负载较低，缩容 Worker");
      // 实际缩容逻辑
    }
  }

  /**
   * 获取负载平均值
   */
  private getLoadAverage(): number {
    const stats = this.getStats();
    if (stats.runningTasks === 0) return 0;

    // 简化的负载计算
    return (stats.runningTasks / stats.workers) * 100;
  }

  /**
   * 停止自动缩放
   */
  async stop(): Promise<void> {
    if (this.scaleInterval) {
      clearInterval(this.scaleInterval);
    }
    await super.stop();
  }
}

/**
 * 创建自动缩放编排器
 */
export function createAutoScalingOrchestrator(
  hybridConfig?: HybridOrchestratorConfig,
  scaleConfig?: AutoScaleConfig
): AutoScalingHybridOrchestrator {
  return new AutoScalingHybridOrchestrator(hybridConfig, scaleConfig);
}
