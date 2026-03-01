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

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  // 支持 Retry-After: 秒数 或 HTTP-date，两种都能识别。
  const asSeconds = Number.parseInt(value, 10);
  if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
    return asSeconds * 1000;
  }

  const targetAt = Date.parse(value);
  if (Number.isNaN(targetAt)) {
    return undefined;
  }

  return Math.max(0, targetAt - Date.now());
}

async function waitFor(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return;
  }

  if (signal?.aborted) {
    throw new Error("请求已取消");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("请求已取消"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function fetchWithRetry(
  endpoint: string,
  init: RequestInit,
  subreddit: string,
  options: Required<RetryOptions>,
): Promise<Response> {
  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(endpoint, init);
    } catch (error) {
      const isAbort = init.signal instanceof AbortSignal && init.signal.aborted;
      if (isAbort || attempt >= options.maxRetries) {
        throw error;
      }

      // 网络抖动也重试，和 5xx 共用退避策略。
      await waitFor(options.baseDelayMs * 2 ** attempt, init.signal as AbortSignal | undefined);
      continue;
    }

    if (response.ok) {
      return response;
    }

    const canRetry = isRetryableStatus(response.status) && attempt < options.maxRetries;
    if (!canRetry) {
      const reason = await response.text();
      const detail = reason || response.statusText;
      throw new Error(`抓取 r/${subreddit} 失败: ${response.status} ${detail}`);
    }

    // 429 / 5xx 走指数退避，优先尊重服务端给的 Retry-After。
    const fallbackDelay = options.baseDelayMs * 2 ** attempt;
    const retryAfterDelay = parseRetryAfterMs(response.headers.get("retry-after"));
    const delayMs = retryAfterDelay ?? fallbackDelay;
    await waitFor(delayMs, init.signal as AbortSignal | undefined);
  }

  throw new Error(`抓取 r/${subreddit} 失败: 超出重试次数`);
}

export async function fetchSubredditPosts(
  subreddit: string,
  limit: number,
  signal?: AbortSignal,
  retryOptions: RetryOptions = {},
): Promise<RedditPost[]> {
  const endpoint = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/new.json?limit=${limit}&raw_json=1`;
  const response = await fetchWithRetry(
    endpoint,
    {
      headers: {
        // Reddit 对匿名请求也建议带 UA，减少风控误伤。
        "User-Agent": "RedditScout/0.1 (+digest-bot)",
      },
      signal,
    },
    subreddit,
    {
      maxRetries: retryOptions.maxRetries ?? 2,
      baseDelayMs: retryOptions.baseDelayMs ?? 400,
    },
  );

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
