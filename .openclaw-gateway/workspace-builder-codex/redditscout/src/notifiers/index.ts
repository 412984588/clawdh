import { EmailConfig, TelegramConfig } from "../types.js";
import { sendEmail } from "./email.js";
import { sendTelegramMessage } from "./telegram.js";

export interface NotifyTargets {
  telegram?: TelegramConfig;
  email?: EmailConfig;
}

interface NotifyDependencies {
  sendTelegramMessage?: typeof sendTelegramMessage;
  sendEmail?: typeof sendEmail;
  logger?: Pick<Console, "log" | "warn">;
}

function formatErrorReason(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === "string") {
    return reason;
  }

  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

export async function notifyDigest(
  targets: NotifyTargets,
  digestDate: string,
  digestText: string,
  dependencies: NotifyDependencies = {},
): Promise<void> {
  const resolved = {
    sendTelegramMessage: dependencies.sendTelegramMessage ?? sendTelegramMessage,
    sendEmail: dependencies.sendEmail ?? sendEmail,
    logger: dependencies.logger ?? console,
  };

  const tasks: Array<{ channel: "Telegram" | "Email"; promise: Promise<void> }> = [];

  if (targets.telegram) {
    tasks.push({
      channel: "Telegram",
      promise: resolved.sendTelegramMessage(targets.telegram, digestText),
    });
  }

  if (targets.email) {
    tasks.push({
      channel: "Email",
      promise: resolved.sendEmail(targets.email, `RedditScout 日报 ${digestDate}`, digestText),
    });
  }

  if (tasks.length === 0) {
    // 未配置推送渠道时不中断流程，先输出到控制台，便于本地调试。
    resolved.logger.log("[RedditScout] 未配置 Telegram/Email，改为控制台输出：\n");
    resolved.logger.log(digestText);
    return;
  }

  const settled = await Promise.allSettled(tasks.map((task) => task.promise));
  const failed: Array<{ channel: string; reason: string }> = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      return;
    }

    failed.push({
      channel: tasks[index]?.channel ?? "Unknown",
      reason: formatErrorReason(result.reason),
    });
  });

  if (failed.length === 0) {
    return;
  }

  const failedMessage = failed.map((item) => `${item.channel}: ${item.reason}`).join("; ");

  if (failed.length === tasks.length) {
    throw new Error(`[RedditScout] 所有推送渠道都失败: ${failedMessage}`);
  }

  // 至少有一个渠道成功时保留成功结果，避免单点故障导致整次任务失败。
  resolved.logger.warn(`[RedditScout] 部分推送渠道失败: ${failedMessage}`);
}
