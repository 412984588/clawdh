import { RedditPost } from "./types.js";

export function filterRecentPosts(
  posts: RedditPost[],
  maxPostAgeHours: number,
  nowMs: number = Date.now(),
): RedditPost[] {
  // 以“当前时间 - N 小时”为窗口，剔除过旧帖子，避免日报重复刷历史内容。
  const cutoffUtc = Math.floor(nowMs / 1000) - maxPostAgeHours * 3600;

  return posts.filter((post) => post.createdUtc >= cutoffUtc);
}
