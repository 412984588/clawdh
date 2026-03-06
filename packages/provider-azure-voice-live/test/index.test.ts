import { describe, expect, it } from "vitest";
import { createAzureVoiceLiveProvider } from "../src/index.ts";

describe("provider-azure-voice-live", () => {
  it("reports explicit capabilities", () => {
    const provider = createAzureVoiceLiveProvider({
      url: "wss://example.com/azure",
      apiKey: "test-key",
    });

    expect(provider.id).toBe("azure-voice-live");
    expect(provider.getCapabilities().serverEchoCancellation).toBe(true);
  });
});
