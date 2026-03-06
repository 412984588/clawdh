import { describe, expect, it } from "vitest";
import { createBridgeDaemonHealth, providerCatalog } from "../src/index.ts";

describe("bridge-daemon", () => {
  it("creates a daemon health summary", () => {
    expect(createBridgeDaemonHealth(2)).toEqual({
      status: "running",
      providerCount: 2,
    });
  });

  it("exposes provider catalog metadata", () => {
    expect(
      providerCatalog.some((provider) => provider.id === "openai-realtime"),
    ).toBe(true);
    expect(
      providerCatalog.some((provider) => provider.id === "local-mock"),
    ).toBe(true);
  });
});
