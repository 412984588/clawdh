/**
 * 性能基准测试
 */

import { PerpetualEngineService } from "../src/engine/service.js";

const mockApi = {
  logger: {
    info: (msg: string) => {}, // 静默
    warn: (msg: string) => {},
    error: (msg: string) => {},
    debug: (msg: string) => {},
  },
};

const mockContext = {
  config: {},
  workspaceDir: process.cwd(),
  stateDir: "/tmp/lobster-engine-bench",
  logger: mockApi.logger,
};

async function benchmark() {
  console.log("🏃 性能基准测试\n");

  const engine = new PerpetualEngineService(mockApi);
  await engine.start(mockContext);

  const iterations = 1000;
  const startTime = Date.now();

  // 模拟循环
  for (let i = 0; i < iterations; i++) {
    // 这里我们只测试状态查询，不启动实际循环
    engine.getLoopCount();
    engine.getMemoryUsage();
    engine.getErrorStats();
  }

  const elapsed = Date.now() - startTime;
  const opsPerSec = Math.round(iterations / elapsed * 1000);

  console.log(`迭代次数: ${iterations}`);
  console.log(`总耗时: ${elapsed}ms`);
  console.log(`吞吐量: ${opsPerSec} 次/秒`);
  console.log(`平均延迟: ${(elapsed / iterations).toFixed(3)}ms`);

  engine.stopLoop();
}

benchmark().catch(console.error);
