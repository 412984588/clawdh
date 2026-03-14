import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, SLAS, generateThresholds } from "../config.js";

export const options = {
  scenarios: {
    health_spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 50 },
        { duration: "30s", target: 50 },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: generateThresholds("health"),
};

export default function () {
  const res = http.get(`${CONFIG.baseUrl}/health`, {
    timeout: CONFIG.timeouts.http,
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has status ok": (r) => r.json("status") === "ok",
    "response time < 50ms": (r) => r.timings.duration < 50,
  });

  sleep(0.1);
}
