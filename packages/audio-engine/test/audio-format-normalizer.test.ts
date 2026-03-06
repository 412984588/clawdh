import { describe, expect, it } from "vitest";
import { AudioFormatNormalizer } from "../src/audio-format-normalizer.js";

describe("AudioFormatNormalizer", () => {
  it("downmixes stereo and resamples to target format", () => {
    const frame = AudioFormatNormalizer.normalizeFrame(
      {
        data: new Int16Array(480).map((_, index) =>
          index % 2 === 0 ? 1000 : -1000,
        ),
        sampleRate: 48000,
        channels: 2,
        source: "discord",
      },
      {
        targetSampleRate: 16000,
        targetChannels: 1,
        sequence: 9,
        timestamp: 123,
      },
    );

    expect(frame.channels).toBe(1);
    expect(frame.sampleRate).toBe(16000);
    expect(frame.encoding).toBe("pcm16");
    expect(frame.littleEndian).toBe(true);
    expect(frame.source).toBe("discord");
    expect(frame.sequence).toBe(9);
    expect(frame.timestamp).toBe(123);
    expect(frame.data.length).toBeGreaterThan(0);
  });

  it("round-trips base64 pcm16 payloads", () => {
    const original = new Int16Array([0, 1024, -1024, 32000, -32000]);
    const encoded = AudioFormatNormalizer.toBase64Pcm16(original);
    const decoded = AudioFormatNormalizer.decodeBase64Pcm16(encoded);

    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it("creates fixed-duration chunks", () => {
    const frame = AudioFormatNormalizer.normalizeFrame(
      {
        data: new Int16Array(1600),
        sampleRate: 16000,
        channels: 1,
      },
      {
        targetSampleRate: 16000,
        targetChannels: 1,
      },
    );

    const chunks = AudioFormatNormalizer.chunkFrame(frame, {
      chunkDurationMs: 20,
      startSequence: 40,
    });

    expect(chunks.length).toBe(5);
    expect(chunks[0]?.data.length).toBe(320);
    expect(chunks[4]?.data.length).toBe(320);
    expect(chunks[0]?.sequence).toBe(40);
    expect(chunks[4]?.sequence).toBe(44);
  });

  it("rejects malformed base64 input", () => {
    expect(() => AudioFormatNormalizer.decodeBase64Pcm16("not-base64")).toThrow(
      "Invalid base64 PCM16 payload",
    );
  });
});
