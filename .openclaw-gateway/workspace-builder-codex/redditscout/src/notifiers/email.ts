import nodemailer from "nodemailer";
import { EmailConfig } from "../types.js";

const RETRYABLE_ERROR_CODES = new Set([
  "ECONNECTION",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ETIMEDOUT",
  "ESOCKET",
  "EAI_AGAIN",
]);

interface EmailTransporter {
  sendMail: (mail: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }) => Promise<unknown>;
  close?: () => void;
}

interface EmailSendOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  createTransport?: (config: {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
  }) => EmailTransporter;
  signal?: AbortSignal;
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = Reflect.get(error, "code");
  if (typeof code !== "string") {
    return false;
  }

  return RETRYABLE_ERROR_CODES.has(code.toUpperCase());
}

async function waitFor(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return;
  }

  if (signal?.aborted) {
    throw new Error("Email 推送已取消");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Email 推送已取消"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function sendMailWithTimeout(
  transporter: EmailTransporter,
  message: {
    from: string;
    to: string;
    subject: string;
    text: string;
  },
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted) {
    throw new Error("Email 推送已取消");
  }

  let abortCleanup = (): void => undefined;

  const abortPromise = new Promise<never>((_, reject) => {
    if (!signal) {
      return;
    }

    const onAbort = (): void => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Email 推送已取消"));
    };

    signal.addEventListener("abort", onAbort, { once: true });
    abortCleanup = () => signal.removeEventListener("abort", onAbort);
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeout = setTimeout(() => {
      reject(
        Object.assign(new Error(`Email 推送超时（>${timeoutMs}ms）`), {
          code: "ETIMEDOUT",
        }),
      );
    }, timeoutMs);

    const originalCleanup = abortCleanup;
    abortCleanup = () => {
      clearTimeout(timeout);
      originalCleanup();
    };
  });

  try {
    await Promise.race([
      transporter.sendMail(message),
      timeoutPromise,
      abortPromise,
    ]);
  } finally {
    abortCleanup();
  }
}

export async function sendEmail(
  config: EmailConfig,
  subject: string,
  body: string,
  options: EmailSendOptions = {},
): Promise<void> {
  const resolved = {
    maxRetries: options.maxRetries ?? 2,
    baseDelayMs: options.baseDelayMs ?? 500,
    timeoutMs: options.timeoutMs ?? 10000,
    createTransport: options.createTransport ?? nodemailer.createTransport,
    signal: options.signal,
  };

  for (let attempt = 0; attempt <= resolved.maxRetries; attempt += 1) {
    const transporter = resolved.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    try {
      await sendMailWithTimeout(
        transporter,
        {
          from: config.from,
          to: config.to,
          subject,
          text: body,
        },
        resolved.timeoutMs,
        resolved.signal,
      );
      return;
    } catch (error) {
      const exhausted = attempt >= resolved.maxRetries;
      const aborted = resolved.signal?.aborted;
      if (aborted || exhausted || !isRetryableError(error)) {
        throw error;
      }

      // SMTP 临时错误（网络抖动/超时）按指数退避重试，避免日报遗漏。
      await waitFor(resolved.baseDelayMs * 2 ** attempt, resolved.signal);
    } finally {
      transporter.close?.();
    }
  }
}
