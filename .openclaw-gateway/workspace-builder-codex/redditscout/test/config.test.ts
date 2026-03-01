import test from "node:test";
import assert from "node:assert/strict";
import { loadRuntimeConfig } from "../src/config.js";

test("未指定 DIGEST_DATE 时应使用本地日期", () => {
  const RealDate = Date;
  const fixedIso = "2026-03-01T23:30:00-05:00";

  globalThis.Date = class extends RealDate {
    constructor(...args: ConstructorParameters<typeof Date>) {
      if (args.length === 0) {
        super(fixedIso);
        return;
      }

      super(...args);
    }

    static now(): number {
      return new RealDate(fixedIso).getTime();
    }
  } as DateConstructor;

  try {
    const config = loadRuntimeConfig({
      SUBREDDITS: "programming",
      KEYWORDS: "",
    });

    assert.equal(config.digest.digestDate, "2026-03-01");
  } finally {
    globalThis.Date = RealDate;
  }
});
