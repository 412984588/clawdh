import { describe, expect, it } from "vitest";
import { assertProviderConformance } from "../src/index.ts";
import { createLocalMockProvider } from "../../provider-local-mock/src/index.ts";

describe("provider-test-kit", () => {
  it("validates canonical provider basics", () => {
    expect(() =>
      assertProviderConformance(createLocalMockProvider()),
    ).not.toThrow();
  });
});
