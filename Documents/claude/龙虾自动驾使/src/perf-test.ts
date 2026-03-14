/**
 * 🦞 龙虾零延迟循环引擎 - 性能测试
 *
 * 验证零延迟循环的性能特性
 */

import { createZeroLatencyLoop, createMicrotaskBatcher, EventLoopMetrics } from "./engine/zero-latency-loop.js";

/**
 * 简单测试运行器
 */
async function runPerformanceTests(): Promise<void> {
  console.log("\n🦞 零延迟循环引擎 - 性能测试\n");
  console.log("=" .repeat(50));

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failed++;
      console.log(`❌ ${name}: ${error}`);
    }
  }

  // 测试1: 基本循环执行
  await test("基本循环执行", async () => {
    const engine = createZeroLatencyLoop({
      yieldAfterEachLoop: false,
    });

    let count = 0;
    await engine.start(async () => {
      count++;
      return count < 10;
    });

    // loopCount 在循环体之后递增，当 count=10 返回 false 时 loopCount=9
    const expectedLoops = 9; // count 从 0 增加到 10，但 loopCount 只递增 9 次
    if (engine.getLoopCount() !== expectedLoops) {
      throw new Error(`预期${expectedLoops}次循环，实际${engine.getLoopCount()}次`);
    }
  });

  // 测试2: 异常处理
  await test("异常处理与继续运行", async () => {
    const engine = createZeroLatencyLoop({
      yieldAfterEachLoop: false,
    });

    let errorCount = 0;
    await engine.start(async () => {
      const loop = engine.getLoopCount();
      if (loop < 3) {
        throw new Error("Test error");
      }
      errorCount++;
      return loop < 5;
    });

    if (engine.getLoopCount() < 5) {
      throw new Error("异常后循环应该继续");
    }
  });

  // 测试3: 性能测试（50次循环应该在100ms内）
  await test("性能: 50次循环 < 100ms", async () => {
    const engine = createZeroLatencyLoop({
      yieldAfterEachLoop: false,
    });

    const startTime = Date.now();
    let count = 0;

    await engine.start(async () => {
      count++;
      return count < 50;
    });

    const elapsed = Date.now() - startTime;
    if (elapsed >= 100) {
      throw new Error(`性能不达标: ${elapsed}ms >= 100ms`);
    }
  });

  // 测试4: 事件循环指标
  await test("事件循环指标收集", async () => {
    let metricsCollected = false;

    const engine = createZeroLatencyLoop({
      yieldAfterEachLoop: false,
      lagThreshold: 10,
      onMetricsUpdate: (metrics: EventLoopMetrics) => {
        if (metrics.sampleCount > 0) {
          metricsCollected = true;
        }
      },
    });

    await engine.start(async () => {
      const count = engine.getLoopCount();
      return count < 120; // 足够触发指标更新（每100次触发一次）
    });

    if (!metricsCollected) {
      throw new Error("指标未收集");
    }

    const metrics = engine.getMetrics();
    if (metrics.sampleCount === 0) {
      throw new Error("指标样本数为0");
    }
  });

  // 测试5: 微任务批处理器
  await test("微任务批处理器", async () => {
    const batcher = createMicrotaskBatcher();
    const results: number[] = [];

    for (let i = 0; i < 10; i++) {
      batcher.add(() => {
        results.push(i);
      });
    }

    // 等待微任务
    await new Promise(resolve => setTimeout(resolve, 10));

    if (results.length !== 10) {
      throw new Error(`预期10个结果，实际${results.length}个`);
    }
  });

  console.log("=" .repeat(50));
  console.log(`\n📊 测试结果:`);
  console.log(`   ✅ 通过: ${passed}`);
  console.log(`   ❌ 失败: ${failed}`);
  console.log(`   🎯 通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    process.exit(1);
  }
}

// 运行测试
runPerformanceTests().catch((error) => {
  console.error("测试运行失败:", error);
  process.exit(1);
});
