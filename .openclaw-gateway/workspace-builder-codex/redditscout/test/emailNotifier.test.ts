import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail } from "../src/notifiers/email.js";
import { EmailConfig } from "../src/types.js";

const emailConfig: EmailConfig = {
  host: "smtp.example.com",
  port: 587,
  secure: false,
  user: "bot@example.com",
  pass: "secret",
  from: "bot@example.com",
  to: "me@example.com",
};

test("SMTP 临时错误应重试并最终成功", async () => {
  let attempts = 0;
  let closes = 0;

  await sendEmail(emailConfig, "日报", "digest", {
    maxRetries: 2,
    baseDelayMs: 0,
    timeoutMs: 100,
    createTransport: () => ({
      sendMail: async () => {
        attempts += 1;

        if (attempts === 1) {
          throw Object.assign(new Error("connection dropped"), {
            code: "ECONNECTION",
          });
        }
      },
      close: () => {
        closes += 1;
      },
    }),
  });

  assert.equal(attempts, 2);
  assert.equal(closes, 2);
});

test("SMTP 鉴权错误不应重试", async () => {
  let attempts = 0;

  await assert.rejects(
    () =>
      sendEmail(emailConfig, "日报", "digest", {
        maxRetries: 3,
        baseDelayMs: 0,
        timeoutMs: 100,
        createTransport: () => ({
          sendMail: async () => {
            attempts += 1;
            throw Object.assign(new Error("auth failed"), {
              code: "EAUTH",
            });
          },
        }),
      }),
    /auth failed/i,
  );

  assert.equal(attempts, 1);
});

test("单次发送超时应按 ETIMEDOUT 抛错", async () => {
  await assert.rejects(
    () =>
      sendEmail(emailConfig, "日报", "digest", {
        maxRetries: 0,
        timeoutMs: 10,
        createTransport: () => ({
          sendMail: async () => {
            await new Promise((resolve) => setTimeout(resolve, 30));
          },
        }),
      }),
    /超时|ETIMEDOUT/i,
  );
});
