import test from "node:test";
import assert from "node:assert/strict";
import { notifyDigest } from "../src/notifiers/index.js";

test("未配置渠道时应输出到日志", async () => {
  const logs: string[] = [];

  await notifyDigest({}, "2026-03-01", "digest-body", {
    logger: {
      log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
      warn: () => undefined,
    },
  });

  assert.ok(logs.some((line) => line.includes("未配置 Telegram/Email")));
  assert.ok(logs.some((line) => line.includes("digest-body")));
});

test("部分渠道失败时应告警但不中断", async () => {
  const warns: string[] = [];
  let telegramCalls = 0;
  let emailCalls = 0;

  await notifyDigest(
    {
      telegram: { botToken: "token", chatId: "chat" },
      email: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        user: "user",
        pass: "pass",
        from: "bot@example.com",
        to: "me@example.com",
      },
    },
    "2026-03-01",
    "digest-body",
    {
      sendTelegramMessage: async () => {
        telegramCalls += 1;
        throw new Error("rate limited");
      },
      sendEmail: async () => {
        emailCalls += 1;
      },
      logger: {
        log: () => undefined,
        warn: (...args: unknown[]) => warns.push(args.map(String).join(" ")),
      },
    },
  );

  assert.equal(telegramCalls, 1);
  assert.equal(emailCalls, 1);
  assert.ok(warns.some((line) => line.includes("部分推送渠道失败")));
  assert.ok(warns.some((line) => line.includes("Telegram: rate limited")));
});

test("全部渠道失败时应抛错", async () => {
  await assert.rejects(
    () =>
      notifyDigest(
        {
          telegram: { botToken: "token", chatId: "chat" },
          email: {
            host: "smtp.example.com",
            port: 587,
            secure: false,
            user: "user",
            pass: "pass",
            from: "bot@example.com",
            to: "me@example.com",
          },
        },
        "2026-03-01",
        "digest-body",
        {
          sendTelegramMessage: async () => {
            throw new Error("timeout");
          },
          sendEmail: async () => {
            throw new Error("auth failed");
          },
          logger: {
            log: () => undefined,
            warn: () => undefined,
          },
        },
      ),
    /所有推送渠道都失败.*Telegram: timeout.*Email: auth failed/i,
  );
});
