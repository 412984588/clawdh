import path from "node:path";
import { EmailConfig, RuntimeConfig, TelegramConfig } from "./types.js";

function splitCsv(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadTelegramConfig(env: NodeJS.ProcessEnv): TelegramConfig | undefined {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return undefined;
  }

  return { botToken, chatId };
}

function loadEmailConfig(env: NodeJS.ProcessEnv): EmailConfig | undefined {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.trim();
  const from = env.SMTP_FROM?.trim();
  const to = env.SMTP_TO?.trim();

  if (!host || !user || !pass || !from || !to) {
    return undefined;
  }

  const port = Number.parseInt(env.SMTP_PORT ?? "587", 10);
  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT 不是合法数字");
  }

  return {
    host,
    port,
    secure: env.SMTP_SECURE === "true",
    user,
    pass,
    from,
    to,
  };
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const subreddits = splitCsv(env.SUBREDDITS);
  if (subreddits.length === 0) {
    throw new Error("SUBREDDITS 不能为空，例如：programming,technology");
  }

  const keywords = splitCsv(env.KEYWORDS).map((word) => word.toLowerCase());
  const postLimitPerSubreddit = Number.parseInt(env.POST_LIMIT_PER_SUBREDDIT ?? "30", 10);
  if (Number.isNaN(postLimitPerSubreddit) || postLimitPerSubreddit <= 0) {
    throw new Error("POST_LIMIT_PER_SUBREDDIT 必须是正整数");
  }

  // 使用本地日期作为日报维度，避免 UTC 跨日导致摘要错位。
  const digestDate = env.DIGEST_DATE?.trim() || new Date().toISOString().slice(0, 10);

  const outputDir = env.OUTPUT_DIR?.trim()
    ? path.resolve(env.OUTPUT_DIR)
    : path.resolve(process.cwd(), "output");

  return {
    digest: {
      subreddits,
      keywords,
      postLimitPerSubreddit,
      digestDate,
      outputDir,
    },
    telegram: loadTelegramConfig(env),
    email: loadEmailConfig(env),
  };
}
