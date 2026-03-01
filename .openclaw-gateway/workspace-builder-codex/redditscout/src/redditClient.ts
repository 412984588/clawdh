import { RedditPost } from "./types.js";

interface RedditListingResponse {
  data?: {
    children?: Array<{
      data?: {
        id?: string;
        title?: string;
        selftext?: string;
        url?: string;
        permalink?: string;
        subreddit?: string;
        author?: string;
        score?: number;
        created_utc?: number;
      };
    }>;
  };
}

export async function fetchSubredditPosts(
  subreddit: string,
  limit: number,
  signal?: AbortSignal,
): Promise<RedditPost[]> {
  const endpoint = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/new.json?limit=${limit}&raw_json=1`;
  const response = await fetch(endpoint, {
    headers: {
      // Reddit 对匿名请求也建议带 UA，减少风控误伤。
      "User-Agent": "RedditScout/0.1 (+digest-bot)",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`抓取 r/${subreddit} 失败: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as RedditListingResponse;
  const children = payload.data?.children ?? [];

  return children
    .map((item) => item.data)
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.id && item?.title))
    .map((item) => ({
      id: item.id ?? "",
      title: item.title ?? "",
      selftext: item.selftext ?? "",
      url: item.url ?? "",
      permalink: item.permalink ? `https://www.reddit.com${item.permalink}` : "",
      subreddit: item.subreddit ?? subreddit,
      author: item.author ?? "unknown",
      score: item.score ?? 0,
      createdUtc: item.created_utc ?? 0,
    }));
}
