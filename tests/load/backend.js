import http from "k6/http";
import { check } from "k6";
import { CONFIG } from "./config.js";

export const options = {
  scenarios: {
    backend_health: {
      executor: "per-vu-iterations",
      vus: 5,
      iterations: 10,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<100", "p(99)<200"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${CONFIG.backendUrl}/health`, {
    timeout: CONFIG.timeouts.http,
  });

  check(res, {
    "backend health 200": (r) => r.status === 200,
    "backend has status": (r) => {
      const body = r.json();
      return body.status === "ok" || body.status === "healthy";
    },
  });
}
