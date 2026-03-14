import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, SLAS, testData } from "./config.js";

export const options = {
  scenarios: {
    stress_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 50 },
        { duration: "2m", target: 100 },
        { duration: "2m", target: 200 },
        { duration: "2m", target: 300 },
        { duration: "1m", target: 500 },
        { duration: "2m", target: 500 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const action = Math.random();

  if (action < 0.4) {
    const res = http.get(`${CONFIG.baseUrl}/health`);
    check(res, { "health check passed": (r) => r.status === 200 });
  } else if (action < 0.7) {
    const res = http.get(`${CONFIG.baseUrl}/api/status`);
    check(res, { "status check passed": (r) => r.status === 200 });
  } else {
    const createRes = http.post(
      `${CONFIG.baseUrl}/api/sessions`,
      JSON.stringify({ userId: testData.userId() }),
      { headers: { "Content-Type": "application/json" } },
    );

    const sessionId = createRes.json("sessionId");
    if (sessionId) {
      const listenRes = http.post(
        `${CONFIG.baseUrl}/api/sessions/${sessionId}/listening`,
      );
      check(listenRes, { "listening started": (r) => r.status === 200 });
      http.delete(`${CONFIG.baseUrl}/api/sessions/${sessionId}/listening`);
      http.delete(`${CONFIG.baseUrl}/api/sessions/${sessionId}`);
    }
  }

  sleep(Math.random() * 0.3);
}
