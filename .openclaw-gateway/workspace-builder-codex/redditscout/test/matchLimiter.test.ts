import test from "node:test";
import assert from "node:assert/strict";
import { applyMatchLimit } from "../src/matchLimiter.js";

const buildItem = (id: string) => ({
  post: {
    id,
    title: `post-${id}`,
    selftext: "",
    url: "https://example.com",
    permalink: `https://reddit.com/r/programming/${id}`,
    subreddit: "programming",
    author: "alice",
    score: 1,
    numComments: 0,
    createdUtc: Number(id),
  },
  matchedKeywords: ["ai"],
});

test("命中数不超过上限时不应截断", () => {
  const input = [buildItem("1"), buildItem("2")];
  const result = applyMatchLimit(input, 5);

  assert.equal(result.truncatedCount, 0);
  assert.deepEqual(result.items, input);
});

test("命中数超过上限时应按顺序截断", () => {
  const input = [buildItem("1"), buildItem("2"), buildItem("3")];
  const result = applyMatchLimit(input, 2);

  assert.equal(result.truncatedCount, 1);
  assert.deepEqual(
    result.items.map((item) => item.post.id),
    ["1", "2"],
  );
});
