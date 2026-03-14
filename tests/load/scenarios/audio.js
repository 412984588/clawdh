import http from "k6/http";
import { check, sleep } from "k6";
import { CONFIG, generateThresholds, testData } from "../config.js";
import encoding from "k6/encoding";

export const options = {
  scenarios: {
    audio_streaming: {
      executor: "constant-vus",
      vus: 10,
      duration: "1m",
      gracefulStop: "10s",
    },
  },
  thresholds: generateThresholds("audio"),
};

function generateSilentAudio(
  durationMs = 100,
  sampleRate = 24000,
  channels = 1,
) {
  const sampleCount = Math.floor((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(sampleCount * channels * 2);
  return encoding.b64encode(buffer);
}

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

  for (let i = 0; i < 5; i++) {
    const audioRes = http.post(
      `${CONFIG.baseUrl}/api/sessions/${sessionId}/audio`,
      JSON.stringify({
        audioBase64: generateSilentAudio(100),
        sampleRate: 24000,
        channels: 1,
      }),
      {
        headers: { "Content-Type": "application/json" },
        timeout: CONFIG.timeouts.audio,
      },
    );

    check(audioRes, {
      "audio accepted": (r) => r.status === 200,
      "has samples count": (r) => r.json("samples") !== undefined,
    });

    sleep(0.2);
  }

  http.delete(`${CONFIG.baseUrl}/api/sessions/${sessionId}`);
  sleep(0.5);
}
