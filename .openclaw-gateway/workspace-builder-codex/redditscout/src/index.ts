import fs from "node:fs/promises";
import path from "node:path";
import { loadRuntimeConfig } from "./config.js";
import { renderDigest } from "./digest.js";
import { notifyDigest } from "./notifiers/index.js";
import { filterPostsByKeywords } from "./keywordFilter.js";
import { applyMatchLimit } from "./matchLimiter.js";
import { filterRecentPosts } from "./postAgeFilter.js";
import { fetchSubredditPosts } from "./redditClient.js";
import { RedditPost } from "./types.js";

interface CollectPostsResult {
  posts: RedditPost[];
  failedSubreddits: string[];
}

function dedupePosts(posts: RedditPost[]): RedditPost[] {
  const byStableKey = new Map<string, RedditPost>();

  for (const post of posts) {
    // 优先 permalink，其次 url，最后兜底到 id，避免跨板块重复转发刷屏。
    const stableKey = post.permalink || post.url || post.id;
    const existed = byStableKey.get(stableKey);

    if (!existed || post.createdUtc > existed.createdUtc) {
      byStableKey.set(stableKey, post);
    }
  }

  return [...byStableKey.values()];
}

async function collectPosts(
  subreddits: string[],
  limit: number,
): Promise<CollectPostsResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const tasks = subreddits.map((subreddit) =>
      fetchSubredditPosts(subreddit, limit, controller.signal).then(
        (posts) => ({ subreddit, posts }),
      ),
    );

    const settled = await Promise.allSettled(tasks);
    const failedSubreddits: string[] = [];
    const posts: RedditPost[] = [];

    settled.forEach((result, index) => {
      if (result.status === "fulfilled") {
        posts.push(...result.value.posts);
        return;
      }

      // 尽量降级运行：局部板块失败不影响整份日报产出。
      const failedSubreddit = subreddits[index];
      if (failedSubreddit) {
        failedSubreddits.push(failedSubreddit);
      }
    });

    return {
      posts: dedupePosts(posts),
      failedSubreddits,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function persistDigest(
  outputDir: string,
  digestDate: string,
  digestText: string,
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  const filename = `digest-${digestDate}.txt`;
  const outputPath = path.join(outputDir, filename);
  await fs.writeFile(outputPath, digestText, "utf8");
}

export async function run(): Promise<void> {
  const config = loadRuntimeConfig(process.env);

  const { posts, failedSubreddits } = await collectPosts(
    config.digest.subreddits,
    config.digest.postLimitPerSubreddit,
  );

  if (failedSubreddits.length > 0) {
    console.warn(
      `[RedditScout] 部分板块抓取失败：${failedSubreddits.join(", ")}`,
    );
  }

  const recentPosts = filterRecentPosts(posts, config.digest.maxPostAgeHours);
  const filtered = filterPostsByKeywords(recentPosts, {
    includeKeywords: config.digest.keywords,
    excludeKeywords: config.digest.excludeKeywords,
    minScore: config.digest.minScore,
    minComments: config.digest.minComments,
  });
  filtered.sort((a, b) => b.post.createdUtc - a.post.createdUtc);

  const limited = applyMatchLimit(filtered, config.digest.maxMatches);

  const outdatedCount = posts.length - recentPosts.length;
  if (outdatedCount > 0) {
    console.log(
      `[RedditScout] 已过滤 ${outdatedCount} 条超过 ${config.digest.maxPostAgeHours} 小时的历史帖子`,
    );
  }

  if (limited.truncatedCount > 0) {
    console.warn(
      `[RedditScout] 命中 ${filtered.length} 条，受 MAX_MATCHES=${config.digest.maxMatches} 限制，仅推送前 ${limited.items.length} 条`,
    );
  }

  const digestText = renderDigest(limited.items, config.digest.digestDate, {
    truncatedCount: limited.truncatedCount,
  });

  await persistDigest(
    config.digest.outputDir,
    config.digest.digestDate,
    digestText,
  );
  await notifyDigest(
    {
      telegram: config.telegram,
      email: config.email,
    },
    config.digest.digestDate,
    digestText,
  );

  console.log(
    `[RedditScout] 摘要完成：推送 ${limited.items.length} 条（总命中 ${filtered.length}）`,
  );
}

run().catch((error: unknown) => {
  console.error("[RedditScout] 执行失败", error);
  process.exitCode = 1;
});
