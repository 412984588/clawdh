import test from "node:test";
import assert from "node:assert/strict";
import { sendTelegramMessage } from "../src/notifiers/telegram.js";

const config = {
  botToken: "token",
  chatId: "chat",
};

test("Telegram 429 时应按重试策略恢复", async () => {
  let callCount = 0;

  const fetchImpl: typeof fetch = async () => {
    callCount += 1;
    if (callCount === 1) {
      return new Response("rate limited", {
        status: 429,
        headers: {
          "retry-after": "0",
        },
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  await sendTelegramMessage(config, "hello", {
    fetchImpl,
    maxRetries: 2,
    baseDelayMs: 0,
    timeoutMs: 200,
  });

  assert.equal(callCount, 2);
});

test("Telegram 400 不应重试", async () => {
  let callCount = 0;

  const fetchImpl: typeof fetch = async () => {
    callCount += 1;
    return new Response("bad request", { status: 400 });
  };

  await assert.rejects(
    () =>
      sendTelegramMessage(config, "hello", {
        fetchImpl,
        maxRetries: 3,
        baseDelayMs: 0,
      }),
    /400 bad request/i,
  );

  assert.equal(callCount, 1);
});

test("超长文本应按块拆分发送", async () => {
  const sentChunks: string[] = [];

  const fetchImpl: typeof fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as { text?: string };
    sentChunks.push(body.text ?? "");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  const text = "x".repeat(8001);
  await sendTelegramMessage(config, text, {
    fetchImpl,
    maxRetries: 0,
    baseDelayMs: 0,
  });

  assert.equal(sentChunks.length, 3);
  assert.equal(sentChunks.join(""), text);
  assert.ok(sentChunks.every((chunk) => chunk.length <= 3800));
});
