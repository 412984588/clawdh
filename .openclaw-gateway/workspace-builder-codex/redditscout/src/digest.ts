import { MatchedPost } from "./types.js";

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}

function formatPostLine(item: MatchedPost, index: number): string {
  const { post, matchedKeywords } = item;
  const keywordLabel = matchedKeywords.length > 0 ? ` | 关键词: ${matchedKeywords.join(", ")}` : "";
  return `${index + 1}. [r/${post.subreddit}] ${truncate(post.title, 120)}${keywordLabel}\n   ${post.permalink || post.url}`;
}

export function renderDigest(items: MatchedPost[], digestDate: string): string {
  if (items.length === 0) {
    return `# RedditScout 日报 (${digestDate})\n\n今天没有命中关键词的新帖。`;
  }

  // 先按 subreddit 聚合，推送时阅读压力更小。
  const bySubreddit = new Map<string, MatchedPost[]>();
  for (const item of items) {
    const key = item.post.subreddit;
    const bucket = bySubreddit.get(key) ?? [];
    bucket.push(item);
    bySubreddit.set(key, bucket);
  }

  const lines: string[] = [`# RedditScout 日报 (${digestDate})`, ""];
  for (const [subreddit, posts] of bySubreddit.entries()) {
    lines.push(`## r/${subreddit}（${posts.length}）`);
    posts.forEach((item, idx) => lines.push(formatPostLine(item, idx)));
    lines.push("");
  }

  return lines.join("\n").trim();
}
