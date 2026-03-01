import test from "node:test";
import assert from "node:assert/strict";
import { renderDigest } from "../src/digest.js";

const item = {
  post: {
    id: "1",
    title: "A very long post title about shipping reliable digest systems",
    selftext: "",
    url: "https://example.com",
    permalink: "https://reddit.com/r/technology/1",
    subreddit: "technology",
    author: "bob",
    score: 99,
    createdUtc: 1700000000,
  },
  matchedKeywords: ["digest", "reliable"],
};

test("日报渲染应包含分组和关键词", () => {
  const text = renderDigest([item], "2026-03-01");

  assert.match(text, /# RedditScout 日报 \(2026-03-01\)/);
  assert.match(text, /## r\/technology（1）/);
  assert.match(text, /关键词: digest, reliable/);
});

test("空结果应返回无命中提示", () => {
  const text = renderDigest([], "2026-03-01");
  assert.match(text, /今天没有命中关键词的新帖/);
});
