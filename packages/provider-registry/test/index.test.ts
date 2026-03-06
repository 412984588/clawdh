import { describe, expect, it } from "vitest";
import { ProviderRegistry } from "../src/index.ts";
import { createLocalMockProvider } from "../../provider-local-mock/src/index.ts";

describe("provider registry", () => {
  it("registers providers and produces a capability matrix", () => {
    const registry = new ProviderRegistry();
    const provider = createLocalMockProvider();

    registry.register({
      id: provider.id,
      create: () => createLocalMockProvider(),
      capabilities: provider.getCapabilities(),
    });

    expect(registry.has("local-mock")).toBe(true);
    expect(registry.capabilityMatrix()).toHaveLength(1);
  });
});
