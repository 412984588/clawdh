import { describe, expect, it } from "vitest";
import { createLocalMockProvider } from "../src/index.ts";

describe("provider-local-mock", () => {
  it("emits transcript events on sendAudio", async () => {
    const provider = createLocalMockProvider();
    const seen: string[] = [];

    provider.on("*", (event) => {
      seen.push(event.type);
    });

    await provider.connect({
      sessionId: "session-1",
      providerId: "local-mock",
      sampleRate: 16000,
      channels: 1,
    });
    await provider.sendAudio({
      data: new Int16Array([1, 2, 3]),
      sampleRate: 16000,
      channels: 1,
      timestamp: Date.now(),
      sequence: 1,
      encoding: "pcm16",
      littleEndian: true,
      source: "local",
    });

    expect(seen).toContain("TRANSCRIPT_PARTIAL");
    expect(seen).toContain("MODEL_AUDIO_CHUNK");
  });
});
