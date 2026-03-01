import { EmailConfig, TelegramConfig } from "../types.js";
import { sendEmail } from "./email.js";
import { sendTelegramMessage } from "./telegram.js";

export interface NotifyTargets {
  telegram?: TelegramConfig;
  email?: EmailConfig;
}

export async function notifyDigest(targets: NotifyTargets, digestDate: string, digestText: string): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (targets.telegram) {
    tasks.push(sendTelegramMessage(targets.telegram, digestText));
  }

  if (targets.email) {
    tasks.push(sendEmail(targets.email, `RedditScout 日报 ${digestDate}`, digestText));
  }

  if (tasks.length === 0) {
    // 未配置推送渠道时不中断流程，先输出到控制台，便于本地调试。
    console.log("[RedditScout] 未配置 Telegram/Email，改为控制台输出：\n");
    console.log(digestText);
    return;
  }

  await Promise.all(tasks);
}
