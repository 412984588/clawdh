import { describe, expect, it } from "vitest";
import { createHumeEviProvider } from "../src/index.ts";

describe("provider-hume-evi", () => {
  it("reports explicit capabilities", () => {
    const provider = createHumeEviProvider({
      url: "wss://example.com/evi",
      apiKey: "test-key",
    });

    expect(provider.id).toBe("hume-evi");
    expect(provider.getCapabilities().textReasoningInjection).toBe(false);
  });
});
