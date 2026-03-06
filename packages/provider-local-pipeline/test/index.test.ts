import { describe, expect, it } from "vitest";
import { createLocalPipelineProvider } from "../src/index.ts";

describe("provider-local-pipeline", () => {
  it("marks text announcements unsupported", async () => {
    const provider = createLocalPipelineProvider();
    const seen: string[] = [];

    provider.on("*", (event) => {
      seen.push(event.type);
    });

    await provider.connect({
      sessionId: "session-1",
      providerId: "local-pipeline",
      sampleRate: 16000,
      channels: 1,
    });
    await provider.injectTextForAnnouncement("hello", "queued");

    expect(seen).toContain("ERROR");
  });
});
