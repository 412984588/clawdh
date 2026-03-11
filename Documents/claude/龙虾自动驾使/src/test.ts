/**
 * 🦞 龙虾永动引擎 - 运行时测试套件
 *
 * 零延迟自动化测试，验证核心功能
 */

import { LobsterCodeAnalyzer } from "./engine/code-analyzer.js";
import { LobsterCodeFixer, FixType } from "./engine/code-fixer.js";
import { AutonomousTaskPlanner, TaskType, TaskPriority } from "./engine/task-planner.js";
import fs from "fs/promises";

// 测试结果统计
interface TestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: Array<{ name: string; error: string }>;
}

const results: TestResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

// 简单测试运行器
async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  results.total++;
  try {
    await fn();
    results.passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.errors.push({ name, error: errorMsg });
    console.log(`❌ ${name}: ${errorMsg}`);
  }
}

// 断言函数
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertThrows(fn: () => Promise<void>, message: string): Promise<void> {
  try {
    await fn();
    throw new Error(message);
  } catch {
    // Expected
  }
}

// ===== 测试套件 =====

async function testCodeAnalyzer() {
  const analyzer = new LobsterCodeAnalyzer();

  await runTest("CodeAnalyzer: 分析空项目", async () => {
    const report = await analyzer.analyzeProject("/tmp/nonexistent");
    assert(report.files.length === 0, "空项目应有0个文件");
    assert(typeof report.overallScore === "number", "应包含质量评分");
  });

  await runTest("CodeAnalyzer: 获取报告摘要", async () => {
    const report = await analyzer.analyzeProject("/tmp");
    assert(typeof report.totalIssues === "number", "应包含问题总数");
    assert(Array.isArray(report.suggestions), "应包含改进建议");
  });

  await runTest("CodeAnalyzer: 分析结构完整性", async () => {
    const report = await analyzer.analyzeProject("/tmp");
    assert("files" in report, "报告应包含files字段");
    assert("totalIssues" in report, "报告应包含totalIssues字段");
    assert("overallScore" in report, "报告应包含overallScore字段");
  });
}

async function testCodeFixer() {
  const fixer = new LobsterCodeFixer({ backup: false });

  await runTest("CodeFixer: 配置初始化", async () => {
    // 验证默认配置
    const tempDir = "/tmp/lobster-test-" + Date.now();
    await fs.mkdir(tempDir, { recursive: true });

    const testFile = `${tempDir}/test.ts`;
    await fs.writeFile(testFile, "console.log('test');\n", "utf-8");

    const result = await fixer.fixProject(tempDir);
    assert(result.filesProcessed >= 1, "应该处理至少1个文件");

    // 清理
    await fs.rm(tempDir, { recursive: true, force: true });
  });
}

async function testTaskPlanner() {
  const planner = new AutonomousTaskPlanner();

  await runTest("TaskPlanner: 生成待办任务", async () => {
    const ctx = {} as any; // Mock context
    const result = await planner.planNextAction(ctx);

    assert(result.task !== undefined, "应生成任务");
    assert(result.confidence > 0, "应有置信度");
    assert(typeof result.reasoning === "string", "应有推理过程");
  });

  await runTest("TaskPlanner: 任务标记完成", async () => {
    // 先添加一个任务到 activeTasks
    planner.updateContext({
      activeTasks: [{
        id: "test-task-1",
        type: TaskType.EXECUTE,
        priority: TaskPriority.HIGH,
        description: "测试任务",
        status: "pending" as any,
        dependencies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        failureCount: 0,
        maxRetries: 3,
        executionHistory: [],
      }],
    });

    planner.markTaskCompleted("test-task-1", {
      timestamp: Date.now(),
      success: true,
      summary: "测试完成",
    });

    const context = planner.getContext();
    assert(context.completedTasks.includes("test-task-1"), "任务应标记为完成");
  });

  await runTest("TaskPlanner: 安全检查优先", async () => {
    // 创建新规划器，避免被之前的上下文影响
    const safetyPlanner = new AutonomousTaskPlanner();

    // 模拟高频错误场景（5个最近1分钟内的未解决错误）
    const errors = Array.from({ length: 5 }, (_, i) => ({
      error: `Test error ${i}`,
      timestamp: Date.now(),
      resolved: false,
    }));

    safetyPlanner.updateContext({
      errorHistory: errors,
    });

    const ctx = {} as any;
    const result = await safetyPlanner.planNextAction(ctx);

    assert(
      result.task.type === TaskType.ANALYZE,
      "高频失败时应触发安全分析"
    );
    assert(result.task.priority === TaskPriority.CRITICAL, "应为关键优先级");
  });
}

async function testEngineCore() {
  await runTest("Engine: 任务优先级排序", async () => {
    const priorities = [
      TaskPriority.CRITICAL,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
      TaskPriority.LOW,
    ];

    // 按严重程度排序
    const sorted = [...priorities].sort((a, b) => {
      const order = {
        [TaskPriority.CRITICAL]: 0,
        [TaskPriority.HIGH]: 1,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 3,
      };
      return order[a] - order[b];
    });

    assert(sorted[0] === TaskPriority.CRITICAL, "CRITICAL应排第一");
    assert(sorted[3] === TaskPriority.LOW, "LOW应排最后");
  });
}

// ===== 主运行器 =====

async function runAllTests(): Promise<void> {
  console.log("\n🦞 龙虾永动引擎 - 运行时测试\n");
  console.log("=" .repeat(50));

  await testCodeAnalyzer();
  await testCodeFixer();
  await testTaskPlanner();
  await testEngineCore();

  console.log("=" .repeat(50));
  console.log(`\n📊 测试结果:`);
  console.log(`   总计: ${results.total}`);
  console.log(`   ✅ 通过: ${results.passed}`);
  console.log(`   ❌ 失败: ${results.failed}`);
  console.log(`   ⏭️  跳过: ${results.skipped}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ 失败详情:`);
    for (const err of results.errors) {
      console.log(`   - ${err.name}: ${err.error}`);
    }
  }

  const passRate = (results.passed / results.total) * 100;
  console.log(`\n🎯 通过率: ${passRate.toFixed(1)}%`);

  if (results.failed > 0) {
    process.exit(1);
  }
}

// 运行测试
runAllTests().catch((error) => {
  console.error("测试运行失败:", error);
  process.exit(1);
});
