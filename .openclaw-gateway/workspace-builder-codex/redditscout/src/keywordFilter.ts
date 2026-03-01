import { MatchedPost, RedditPost } from "./types.js";

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

export function filterPostsByKeywords(posts: RedditPost[], keywords: string[]): MatchedPost[] {
  // 关键词为空时直接透传，便于冷启动先观察社区数据。
  if (keywords.length === 0) {
    return posts.map((post) => ({ post, matchedKeywords: [] }));
  }

  return posts
    .map((post) => {
      const haystack = `${post.title}\n${post.selftext}`.toLowerCase();
      const matchedKeywords = unique(keywords.filter((keyword) => haystack.includes(keyword)));
      return {
        post,
        matchedKeywords,
      };
    })
    .filter((item) => item.matchedKeywords.length > 0);
}
