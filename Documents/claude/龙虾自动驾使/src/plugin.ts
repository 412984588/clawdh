/**
 * 🦞 龙虾永动引擎 - OpenClaw 插件
 *
 * 核心特性：
 * - 零延迟 while(isRunning) 死循环
 * - 狂暴异常处理（错误→提示词→继续）
 * - /start_partner 和 /stop_partner 命令
 */

import type { OpenClawPluginApi } from "./types.js";
import { PerpetualEngineService } from "./engine/service.js";
import { loadConfig } from "./config.js";

export default function register(api: OpenClawPluginApi) {
  const logger = api.logger;
  const config = loadConfig();
  const engineService = new PerpetualEngineService(api, config);

  logger.info(`🦞 龙虾永动引擎配置加载: ` +
    `压缩间隔=${config.compressInterval}, ` +
    `健康检查=${config.enableHealthCheck}`
  );

  // 注册后台服务
  api.registerService({
    id: "lobster-perpetual-engine",
    start: (ctx) => {
      logger.info("🦞 龙虾永动引擎服务启动");
      engineService.start(ctx);
    },
    stop: (ctx) => {
      logger.info("🦞 龙虾永动引擎服务停止");
      engineService.stopService(ctx);
    },
  });

  // 注册 /start_partner 命令
  api.registerCommand({
    name: "start_partner",
    description: "启动零延迟永动循环引擎",
    requireAuth: true,
    handler: async (ctx) => {
      logger.info("🚀 收到启动命令");
      await engineService.startFromCommand(ctx);
      return {
        text: "🦞 永动引擎已启动\n\n" +
              "状态: " + (engineService.isRunning() ? "运行中" : "启动中...") + "\n" +
              "循环次数: " + engineService.getLoopCount() + "\n\n" +
              "使用 /stop_partner 停止引擎"
      };
    },
  });

  // 注册 /stop_partner 命令
  api.registerCommand({
    name: "stop_partner",
    description: "停止永动循环引擎",
    requireAuth: true,
    handler: async (ctx) => {
      logger.info("🛑 收到停止命令");
      engineService.stopLoop();
      return {
        text: "🛑 永动引擎已停止\n\n" +
              "总循环次数: " + engineService.getLoopCount() + "\n" +
              "使用 /start_partner 重新启动"
      };
    },
  });

  // 注册 /partner_status 命令
  api.registerCommand({
    name: "partner_status",
    description: "查看永动引擎状态",
    requireAuth: true,
    handler: async () => {
      const avgTime = engineService.getAvgLoopTime();
      const loopsPerSec = engineService.getLoopsPerSecond();
      const memory = engineService.getMemoryUsage();
      const errorStats = engineService.getErrorStats();
      const errorStatsText = Object.entries(errorStats)
        .map(([cat, count]) => `${cat}: ${count}`)
        .join(', ') || '无';

      return {
        text: "🦞 永动引擎状态\n\n" +
              "运行中: " + (engineService.isRunning() ? "是" : "否") + "\n" +
              "循环次数: " + engineService.getLoopCount() + "\n" +
              "平均耗时: " + avgTime + "ms\n" +
              "循环速率: " + loopsPerSec + " 循环/秒\n" +
              "内存使用: " + memory + " MB\n" +
              "错误统计: " + errorStatsText + "\n" +
              "上下文大小: " + engineService.getContextSize() + " 字符"
      };
    },
  });

  // 注册 gateway_start 钩子
  api.on("gateway_start", async (event, ctx) => {
    logger.info("🦞 Gateway 启动，永动引擎就绪");
  }, { priority: 100 });

  logger.info("🦞 龙虾永动引擎插件已加载");
}
