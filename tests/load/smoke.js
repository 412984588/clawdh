import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, SLAS, generateThresholds, testData } from "./config.js";

export const options = {
  scenarios: {
    mixed_load: {
      executor: "constant-vus",
      vus: 30,
      duration: "3m",
      gracefulStop: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.02"],
  },
};

export default function () {
  const scenario = Math.random();

  if (scenario < 0.3) {
    runHealthCheck();
  } else if (scenario < 0.5) {
    runSessionLifecycle();
  } else if (scenario < 0.7) {
    runStatusCheck();
  } else if (scenario < 0.85) {
    runWebhookTest();
  } else {
    runReadOperations();
  }

  sleep(Math.random() * 0.5 + 0.1);
}

function runHealthCheck() {
  const res = http.get(`${CONFIG.baseUrl}/health`, {
    timeout: CONFIG.timeouts.http,
  });
  check(res, { "health ok": (r) => r.status === 200 });
}

function runSessionLifecycle() {
  const createRes = http.post(
    `${CONFIG.baseUrl}/api/sessions`,
    JSON.stringify({
      userId: testData.userId(),
      channelId: testData.channelId(),
    }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: CONFIG.timeouts.http,
    },
  );

  const sessionId = createRes.json("sessionId");
  if (sessionId) {
    http.delete(`${CONFIG.baseUrl}/api/sessions/${sessionId}`);
  }
}

function runStatusCheck() {
  http.get(`${CONFIG.baseUrl}/api/status`, { timeout: CONFIG.timeouts.http });
}

function runWebhookTest() {
  const payload = testData.webhookPayload();
  http.post(
    `${CONFIG.baseUrl}/webhook/openclaw_callback`,
    JSON.stringify(payload),
    {
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": __ENV.WEBHOOK_SECRET || "test-secret",
      },
      timeout: CONFIG.timeouts.webhook,
    },
  );
}

function runReadOperations() {
  http.get(`${CONFIG.baseUrl}/api/sessions`, { timeout: CONFIG.timeouts.http });
  http.get(`${CONFIG.baseUrl}/ready`, { timeout: CONFIG.timeouts.http });
}
