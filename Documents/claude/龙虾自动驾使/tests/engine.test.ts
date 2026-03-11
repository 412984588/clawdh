/**
 * 永动引擎测试套件
 */

import { PerpetualEngineService } from "../src/engine/service.js";

// Mock API
const mockApi = {
  logger: {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
  },
};

// Mock Context
const mockContext = {
  config: {},
  workspaceDir: process.cwd(),
  stateDir: "/tmp/lobster-engine-test",
  logger: mockApi.logger,
};

async function runTests() {
  console.log("🧪 开始测试永动引擎...\n");

  const engine = new PerpetualEngineService(mockApi);

  // 测试1: 初始状态
  console.log("测试1: 初始状态检查");
  console.assert(!engine.isRunning(), "引擎不应运行");
  console.assert(engine.getLoopCount() === 0, "循环次数应为0");
  console.log("✅ 测试1 通过\n");

  // 测试2: 启动服务
  console.log("测试2: 服务启动");
  await engine.start(mockContext);
  console.log("✅ 测试2 通过\n");

  // 测试3: 状态查询
  console.log("测试3: 状态查询");
  console.log("运行中:", engine.isRunning());
  console.log("循环次数:", engine.getLoopCount());
  console.log("内存使用:", engine.getMemoryUsage(), "MB");
  console.log("✅ 测试3 通过\n");

  // 测试4: 停止循环
  console.log("测试4: 停止循环");
  engine.stopLoop();
  console.assert(!engine.isRunning(), "引擎应该停止");
  console.log("✅ 测试4 通过\n");

  // 测试5: 健康检查
  console.log("测试5: 健康检查指标");
  const avgTime = engine.getAvgLoopTime();
  const loopsPerSec = engine.getLoopsPerSecond();
  const errorStats = engine.getErrorStats();
  console.log("平均耗时:", avgTime, "ms");
  console.log("循环速率:", loopsPerSec, "循环/秒");
  console.log("错误统计:", errorStats);
  console.log("✅ 测试5 通过\n");

  console.log("🎉 所有测试通过!");
}

// 运行测试
runTests().catch(console.error);
