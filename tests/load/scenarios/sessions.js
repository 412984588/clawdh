import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, generateThresholds, testData } from "../config.js";

export const options = {
  scenarios: {
    session_lifecycle: {
      executor: "per-vu-iterations",
      vus: 20,
      iterations: 50,
      maxDuration: "2m",
    },
  },
  thresholds: generateThresholds("write"),
};

export default function () {
  const userId = testData.userId();
  const channelId = testData.channelId();

  const createRes = http.post(
    `${CONFIG.baseUrl}/api/sessions`,
    JSON.stringify({ userId, channelId }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: CONFIG.timeouts.http,
    },
  );

  check(createRes, {
    "session created": (r) => r.status === 200 || r.status === 201,
    "has sessionId": (r) => r.json("sessionId") !== undefined,
  });

  const sessionId = createRes.json("sessionId");
  if (!sessionId) {
    sleep(0.5);
    return;
  }

  const statusRes = http.get(
    `${CONFIG.baseUrl}/api/sessions/${sessionId}/status`,
    {
      timeout: CONFIG.timeouts.http,
    },
  );

  check(statusRes, {
    "status retrieved": (r) => r.status === 200,
    "has state": (r) => r.json("state") !== undefined,
  });

  const deleteRes = http.delete(
    `${CONFIG.baseUrl}/api/sessions/${sessionId}`,
    null,
    {
      timeout: CONFIG.timeouts.http,
    },
  );

  check(deleteRes, {
    "session deleted": (r) => r.status === 200,
  });

  sleep(0.5);
}
