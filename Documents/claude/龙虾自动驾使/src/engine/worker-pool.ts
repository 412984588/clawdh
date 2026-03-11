/**
 * 🦞 龙虾 Worker 线程池
 *
 * 将 CPU 密集型任务卸载到 worker 线程，避免阻塞事件循环
 * 基于 Node.js worker_threads 实现
 *
 * @see {@link https://nodejs.org/api/worker_threads.html}
 * @see {@link https://medium.com/@hadiyolworld007/node-js-performance-tuning-in-2026-event-loop-lag-fetch-backpressure-and-the-metrics-that-dff27b319415}
 */

import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Worker 任务
 */
export interface WorkerTask<T = any> {
  /** 任务 ID */
  id: string;
  /** 任务类型 */
  type: string;
  /** 任务数据 */
  data: any;
  /** 解析函数 */
  resolve: (value: T) => void;
  /** 拒绝函数 */
  reject: (error: Error) => void;
}

/**
 * Worker 线程池配置
 */
export interface WorkerPoolConfig {
  /** Worker 数量 (默认: CPU 核心数 - 1) */
  poolSize?: number;
  /** 任务超时时间 (毫秒) */
  taskTimeout?: number;
  /** Worker 最大任务数 (超过后重启 worker) */
  maxTasksPerWorker?: number;
}

/**
 * 默认配置
 */
const DEFAULT_WORKER_CONFIG: Required<WorkerPoolConfig> = {
  poolSize: Math.max(1, (() => {
    try {
      // Node.js 环境
      const os = require("os");
      return (os.cpus().length || 4) - 1;
    } catch {
      // 浏览器环境或其他
      return 3;
    }
  })()),
  taskTimeout: 30000, // 30 秒
  maxTasksPerWorker: 1000,
};

/**
 * Worker 线程池
 *
 * 管理 worker 线程生命周期，分配任务到空闲 worker
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private idleWorkers: Set<Worker> = new Set();
  private busyWorkers: Set<Worker> = new Set();
  private taskQueue: WorkerTask[] = [];
  private workerTaskCount: Map<Worker, number> = new Map();
  private config: Required<WorkerPoolConfig>;

  constructor(config: WorkerPoolConfig = {}) {
    this.config = { ...DEFAULT_WORKER_CONFIG, ...config };
  }

  /**
   * 初始化 Worker 池
   */
  async initialize(): Promise<void> {
    const workerScriptPath = join(__dirname, "worker-script.js");

    for (let i = 0; i < this.config.poolSize; i++) {
      const worker = new Worker(workerScriptPath);
      this.workers.push(worker);
      this.idleWorkers.add(worker);
      this.workerTaskCount.set(worker, 0);

      // 设置消息处理
      worker.on("message", (result) => this.handleWorkerMessage(worker, result));
      worker.on("error", (error) => this.handleWorkerError(worker, error));
      worker.on("exit", (code) => this.handleWorkerExit(worker, code));
    }

    console.log(`🦞 Worker 池初始化完成: ${this.config.poolSize} 个 worker`);
  }

  /**
   * 提交任务到 Worker 池
   */
  async execute<T = any>(type: string, data: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task: WorkerTask<T> = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        resolve,
        reject,
      };

      // 尝试分配到空闲 worker
      const worker = this.acquireWorker();
      if (worker) {
        this.dispatchToWorker(worker, task);
      } else {
        // 没有空闲 worker，加入队列
        this.taskQueue.push(task);
      }

      // 设置超时
      const timeout = setTimeout(() => {
        reject(new Error(`任务超时: ${type}`));
      }, this.config.taskTimeout);

      // 清理超时（当任务完成时）
      task.reject = ((originalReject) => {
        return (error: Error) => {
          clearTimeout(timeout);
          originalReject(error);
        };
      })(task.reject);
    });
  }

  /**
   * 获取空闲 Worker
   */
  private acquireWorker(): Worker | undefined {
    if (this.idleWorkers.size === 0) {
      return undefined;
    }

    const worker = this.idleWorkers.values().next().value;
    if (worker) {
      this.idleWorkers.delete(worker);
      this.busyWorkers.add(worker);
      return worker;
    }

    return undefined;
  }

  /**
   * 分发任务到 Worker
   */
  private dispatchToWorker(worker: Worker, task: WorkerTask): void {
    const taskCount = this.workerTaskCount.get(worker) || 0;

    // 检查是否需要重启 worker
    if (taskCount >= this.config.maxTasksPerWorker) {
      this.restartWorker(worker);
      // 重新分配任务
      const newWorker = this.acquireWorker();
      if (newWorker) {
        this.dispatchToWorker(newWorker, task);
      } else {
        this.taskQueue.push(task);
      }
      return;
    }

    try {
      worker.postMessage({
        id: task.id,
        type: task.type,
        data: task.data,
      });
      this.workerTaskCount.set(worker, taskCount + 1);
    } catch (error) {
      task.reject(error as Error);
      this.releaseWorker(worker);
    }
  }

  /**
   * 处理 Worker 消息
   */
  private handleWorkerMessage(worker: Worker, result: any): void {
    // result 格式: { id, success, value, error }
    if (result.id) {
      // 这里需要维护一个 task ID 到 task 的映射
      // 简化处理：假设 worker 按顺序返回结果
      // 实际实现需要更复杂的任务追踪
    }

    this.releaseWorker(worker);
    this.processQueue();
  }

  /**
   * 处理 Worker 错误
   */
  private handleWorkerError(worker: Worker, error: Error): void {
    console.error(`🦞 Worker 错误:`, error);
    this.restartWorker(worker);
  }

  /**
   * 处理 Worker 退出
   */
  private handleWorkerExit(worker: Worker, code: number): void {
    if (code !== 0) {
      console.warn(`🦞 Worker 异常退出: code ${code}`);
    }
    this.restartWorker(worker);
  }

  /**
   * 释放 Worker
   */
  private releaseWorker(worker: Worker): void {
    this.busyWorkers.delete(worker);
    this.idleWorkers.add(worker);
  }

  /**
   * 重启 Worker
   */
  private restartWorker(worker: Worker): void {
    try {
      worker.terminate();
    } catch (e) {
      // 忽略错误
    }

    this.workers = this.workers.filter(w => w !== worker);
    this.idleWorkers.delete(worker);
    this.busyWorkers.delete(worker);
    this.workerTaskCount.delete(worker);

    // 创建新 worker
    const workerScriptPath = join(__dirname, "worker-script.js");
    const newWorker = new Worker(workerScriptPath);
    this.workers.push(newWorker);
    this.idleWorkers.add(newWorker);
    this.workerTaskCount.set(newWorker, 0);

    newWorker.on("message", (result) => this.handleWorkerMessage(newWorker, result));
    newWorker.on("error", (error) => this.handleWorkerError(newWorker, error));
    newWorker.on("exit", (code) => this.handleWorkerExit(newWorker, code));
  }

  /**
   * 处理任务队列
   */
  private processQueue(): void {
    while (this.taskQueue.length > 0) {
      const worker = this.acquireWorker();
      if (!worker) {
        break;
      }

      const task = this.taskQueue.shift();
      if (task) {
        this.dispatchToWorker(worker, task);
      }
    }
  }

  /**
   * 获取池统计信息
   */
  getStats(): { totalWorkers: number; idleWorkers: number; busyWorkers: number; queuedTasks: number } {
    return {
      totalWorkers: this.workers.length,
      idleWorkers: this.idleWorkers.size,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
    };
  }

  /**
   * 关闭 Worker 池
   */
  async shutdown(): Promise<void> {
    console.log(`🦞 关闭 Worker 池...`);

    const terminatePromises = this.workers.map(worker =>
      Promise.race([
        worker.terminate(),
        new Promise(resolve => setTimeout(resolve, 5000)), // 5 秒超时
      ])
    );

    await Promise.all(terminatePromises);

    this.workers = [];
    this.idleWorkers.clear();
    this.busyWorkers.clear();
    this.taskQueue = [];
    this.workerTaskCount.clear();

    console.log(`🦞 Worker 池已关闭`);
  }
}

/**
 * 全局 Worker 池单例
 */
let globalWorkerPool: WorkerPool | null = null;

/**
 * 获取全局 Worker 池
 */
export function getGlobalWorkerPool(): WorkerPool {
  if (!globalWorkerPool) {
    globalWorkerPool = new WorkerPool();
  }
  return globalWorkerPool;
}

/**
 * 关闭全局 Worker 池
 */
export async function shutdownGlobalWorkerPool(): Promise<void> {
  if (globalWorkerPool) {
    await globalWorkerPool.shutdown();
    globalWorkerPool = null;
  }
}
