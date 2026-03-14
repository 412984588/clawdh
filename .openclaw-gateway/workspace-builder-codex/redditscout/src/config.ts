import path from "node:path";
import { EmailConfig, RuntimeConfig, TelegramConfig } from "./types.js";

function splitCsv(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadTelegramConfig(
  env: NodeJS.ProcessEnv,
): TelegramConfig | undefined {
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

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeConfig {
  const subreddits = splitCsv(env.SUBREDDITS);
  if (subreddits.length === 0) {
    throw new Error("SUBREDDITS 不能为空，例如：programming,technology");
  }

  const keywords = splitCsv(env.KEYWORDS).map((word) => word.toLowerCase());
  const excludeKeywords = splitCsv(env.EXCLUDE_KEYWORDS).map((word) =>
    word.toLowerCase(),
  );

  const minScore = Number.parseInt(env.MIN_SCORE ?? "0", 10);
  if (Number.isNaN(minScore) || minScore < 0) {
    throw new Error("MIN_SCORE 必须是非负整数");
  }

  const minComments = Number.parseInt(env.MIN_COMMENTS ?? "0", 10);
  if (Number.isNaN(minComments) || minComments < 0) {
    throw new Error("MIN_COMMENTS 必须是非负整数");
  }

  const postLimitPerSubreddit = Number.parseInt(
    env.POST_LIMIT_PER_SUBREDDIT ?? "30",
    10,
  );
  if (Number.isNaN(postLimitPerSubreddit) || postLimitPerSubreddit <= 0) {
    throw new Error("POST_LIMIT_PER_SUBREDDIT 必须是正整数");
  }

  const maxPostAgeHours = Number.parseInt(env.MAX_POST_AGE_HOURS ?? "24", 10);
  if (Number.isNaN(maxPostAgeHours) || maxPostAgeHours <= 0) {
    throw new Error("MAX_POST_AGE_HOURS 必须是正整数");
  }

  const maxMatches = Number.parseInt(env.MAX_MATCHES ?? "50", 10);
  if (Number.isNaN(maxMatches) || maxMatches <= 0) {
    throw new Error("MAX_MATCHES 必须是正整数");
  }

  // 使用本地日期作为日报维度，避免 UTC 跨日导致摘要错位。
  const digestDate = env.DIGEST_DATE?.trim() || formatLocalDate(new Date());

  const outputDir = env.OUTPUT_DIR?.trim()
    ? path.resolve(env.OUTPUT_DIR)
    : path.resolve(process.cwd(), "output");

  return {
    digest: {
      subreddits,
      keywords,
      excludeKeywords,
      minScore,
      minComments,
      postLimitPerSubreddit,
      maxPostAgeHours,
      maxMatches,
      digestDate,
      outputDir,
    },
    telegram: loadTelegramConfig(env),
    email: loadEmailConfig(env),
  };
}
