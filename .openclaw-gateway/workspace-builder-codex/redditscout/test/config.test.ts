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

test("应加载排除关键词和最小分数配置", () => {
  const config = loadRuntimeConfig({
    SUBREDDITS: "programming,technology",
    KEYWORDS: "rust,ai",
    EXCLUDE_KEYWORDS: "hiring,job",
    MIN_SCORE: "15",
  });

  assert.deepEqual(config.digest.keywords, ["rust", "ai"]);
  assert.deepEqual(config.digest.excludeKeywords, ["hiring", "job"]);
  assert.equal(config.digest.minScore, 15);
});

test("MIN_SCORE 非法时应抛错", () => {
  assert.throws(
    () =>
      loadRuntimeConfig({
        SUBREDDITS: "programming",
        KEYWORDS: "rust",
        MIN_SCORE: "-1",
      }),
    /MIN_SCORE 必须是非负整数/,
  );
});
