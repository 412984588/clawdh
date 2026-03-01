import test from "node:test";
import assert from "node:assert/strict";
import { filterPostsByKeywords } from "../src/keywordFilter.js";
import { RedditPost } from "../src/types.js";

const basePost: RedditPost = {
  id: "1",
  title: "Rust performance trick",
  selftext: "This post discusses async runtime tuning.",
  url: "https://example.com",
  permalink: "https://reddit.com/r/programming/1",
  subreddit: "programming",
  author: "alice",
  score: 10,
  createdUtc: 1700000000,
};

test("关键词过滤应支持大小写不敏感", () => {
  const posts: RedditPost[] = [basePost];
  const matched = filterPostsByKeywords(posts, ["RUST", "k8s"].map((k) => k.toLowerCase()));

  assert.equal(matched.length, 1);
  assert.deepEqual(matched[0]?.matchedKeywords, ["rust"]);
});

test("关键词在正文命中时也应返回", () => {
  const posts: RedditPost[] = [
    {
      ...basePost,
      id: "2",
      title: "Deploying backend",
      selftext: "Using Kubernetes and ArgoCD",
    },
  ];

  const matched = filterPostsByKeywords(posts, ["kubernetes"]);
  assert.equal(matched.length, 1);
  assert.deepEqual(matched[0]?.matchedKeywords, ["kubernetes"]);
});
