import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, generateThresholds, testData } from "../config.js";

export const options = {
  scenarios: {
    tts_requests: {
      executor: "per-vu-iterations",
      vus: 5,
      iterations: 20,
      maxDuration: "2m",
    },
  },
  thresholds: generateThresholds("audio"),
};

export default function () {
  const createRes = http.post(
    `${CONFIG.baseUrl}/api/sessions`,
    JSON.stringify({ userId: testData.userId() }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: CONFIG.timeouts.http,
    },
  );

  const sessionId = createRes.json("sessionId");
  if (!sessionId) {
    sleep(0.5);
    return;
  }

  const ttsRes = http.post(
    `${CONFIG.baseUrl}/api/sessions/${sessionId}/tts`,
    JSON.stringify({ text: testData.ttsText() }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: CONFIG.timeouts.audio,
    },
  );

  check(ttsRes, {
    "tts success": (r) => r.status === 200,
    "has source": (r) => r.json("source") !== undefined,
    "has samples": (r) => r.json("samples") !== undefined,
  });

  http.delete(`${CONFIG.baseUrl}/api/sessions/${sessionId}`);
  sleep(0.5);
}
