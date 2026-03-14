import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, generateThresholds, testData } from "../config.js";

export const options = {
  scenarios: {
    webhook_burst: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "30s", target: 10 },
      ],
    },
  },
  thresholds: generateThresholds("webhook"),
};

const WEBHOOK_SECRET = __ENV.WEBHOOK_SECRET || "test-secret";

export default function () {
  const payload = testData.webhookPayload();
  const timestamp = Date.now().toString();
  const body = JSON.stringify(payload);

  const res = http.post(`${CONFIG.baseUrl}/webhook/openclaw_callback`, body, {
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": WEBHOOK_SECRET,
      "x-webhook-timestamp": timestamp,
      "x-webhook-id": payload.id,
    },
    timeout: CONFIG.timeouts.webhook,
  });

  check(res, {
    "webhook accepted": (r) => r.status === 200 || r.status === 202,
    "has success": (r) => r.json("success") === true,
  });

  sleep(0.1);
}
