import fs from "node:fs/promises";
import path from "node:path";
import { loadRuntimeConfig } from "./config.js";
import { renderDigest } from "./digest.js";
import { notifyDigest } from "./notifiers/index.js";
import { filterPostsByKeywords } from "./keywordFilter.js";
import { fetchSubredditPosts } from "./redditClient.js";
import { RedditPost } from "./types.js";

async function collectPosts(subreddits: string[], limit: number): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const groups = await Promise.all(
      subreddits.map((subreddit) => fetchSubredditPosts(subreddit, limit, controller.signal)),
    );

    return groups.flat();
  } finally {
    clearTimeout(timeout);
  }
}

async function persistDigest(outputDir: string, digestDate: string, digestText: string): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  const filename = `digest-${digestDate}.txt`;
  const outputPath = path.join(outputDir, filename);
  await fs.writeFile(outputPath, digestText, "utf8");
}

export async function run(): Promise<void> {
  const config = loadRuntimeConfig(process.env);

  const posts = await collectPosts(
    config.digest.subreddits,
    config.digest.postLimitPerSubreddit,
  );

  const filtered = filterPostsByKeywords(posts, config.digest.keywords);
  filtered.sort((a, b) => b.post.createdUtc - a.post.createdUtc);

  const digestText = renderDigest(filtered, config.digest.digestDate);

  await persistDigest(config.digest.outputDir, config.digest.digestDate, digestText);
  await notifyDigest(
    {
      telegram: config.telegram,
      email: config.email,
    },
    config.digest.digestDate,
    digestText,
  );

  console.log(`[RedditScout] 摘要完成：${filtered.length} 条命中`);
}

run().catch((error: unknown) => {
  console.error("[RedditScout] 执行失败", error);
  process.exitCode = 1;
});
