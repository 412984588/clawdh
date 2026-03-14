import { TelegramConfig } from "../types.js";

const TELEGRAM_CHUNK_SIZE = 3800;

interface TelegramSendOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

function isRetryableStatus(status: number): boolean {
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const asSeconds = Number.parseInt(value, 10);
  if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
    return asSeconds * 1000;
  }

  const at = Date.parse(value);
  if (Number.isNaN(at)) {
    return undefined;
  }

  return Math.max(0, at - Date.now());
}

async function waitFor(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return;
  }

  if (signal?.aborted) {
    throw new Error("推送已取消");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("推送已取消"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function buildChunks(text: string): string[] {
  if (text.length === 0) {
    return [""];
  }

  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += TELEGRAM_CHUNK_SIZE) {
    chunks.push(text.slice(i, i + TELEGRAM_CHUNK_SIZE));
  }

  return chunks;
}

async function sendChunkWithRetry(
  config: TelegramConfig,
  chunk: string,
  options: Required<
    Pick<
      TelegramSendOptions,
      "maxRetries" | "baseDelayMs" | "timeoutMs" | "fetchImpl"
    >
  > &
    Pick<TelegramSendOptions, "signal">,
): Promise<void> {
  const endpoint = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    let response: Response;
    const controller = new AbortController();

    // 合并外部取消信号和单次请求超时，避免网络挂死导致任务卡住。
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    const forwardAbort = (): void => controller.abort();
    options.signal?.addEventListener("abort", forwardAbort, { once: true });

    try {
      response = await options.fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: chunk,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", forwardAbort);

      const exhausted = attempt >= options.maxRetries;
      const aborted = options.signal?.aborted || controller.signal.aborted;
      if (aborted || exhausted) {
        throw error;
      }

      // 网络闪断时指数退避重试，避免偶发失败导致整份日报丢失。
      await waitFor(options.baseDelayMs * 2 ** attempt, options.signal);
      continue;
    }

    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", forwardAbort);

    if (response.ok) {
      return;
    }

    const canRetry =
      isRetryableStatus(response.status) && attempt < options.maxRetries;
    if (!canRetry) {
      const reason = await response.text();
      throw new Error(
        `Telegram 推送失败: ${response.status} ${reason || response.statusText}`,
      );
    }

    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    const delayMs = retryAfterMs ?? options.baseDelayMs * 2 ** attempt;
    await waitFor(delayMs, options.signal);
  }

  throw new Error("Telegram 推送失败: 超出重试次数");
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  text: string,
  options: TelegramSendOptions = {},
): Promise<void> {
  const chunks = buildChunks(text);
  const resolved = {
    maxRetries: options.maxRetries ?? 2,
    baseDelayMs: options.baseDelayMs ?? 500,
    timeoutMs: options.timeoutMs ?? 10000,
    fetchImpl: options.fetchImpl ?? fetch,
    signal: options.signal,
  };

  for (const chunk of chunks) {
    await sendChunkWithRetry(config, chunk, resolved);
  }
}
