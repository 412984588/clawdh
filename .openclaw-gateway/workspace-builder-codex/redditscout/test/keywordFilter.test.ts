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

test("支持排除关键词过滤", () => {
  const posts: RedditPost[] = [
    {
      ...basePost,
      id: "3",
      title: "Rust backend hiring thread",
      selftext: "remote job",
    },
  ];

  const matched = filterPostsByKeywords(posts, {
    includeKeywords: ["rust"],
    excludeKeywords: ["hiring", "job"],
  });

  assert.equal(matched.length, 0);
});

test("支持最小分数过滤", () => {
  const posts: RedditPost[] = [
    basePost,
    {
      ...basePost,
      id: "4",
      score: 25,
      title: "Rust async tips",
    },
  ];

  const matched = filterPostsByKeywords(posts, {
    includeKeywords: ["rust"],
    minScore: 20,
  });

  assert.equal(matched.length, 1);
  assert.equal(matched[0]?.post.id, "4");
});

test("全量模式下也应应用排除关键词和分数阈值", () => {
  const posts: RedditPost[] = [
    {
      ...basePost,
      id: "5",
      score: 30,
      title: "General update",
      selftext: "no keyword",
    },
    {
      ...basePost,
      id: "6",
      score: 30,
      title: "Job thread",
      selftext: "hiring now",
    },
  ];

  const matched = filterPostsByKeywords(posts, {
    includeKeywords: [],
    excludeKeywords: ["hiring"],
    minScore: 20,
  });

  assert.equal(matched.length, 1);
  assert.equal(matched[0]?.post.id, "5");
  assert.deepEqual(matched[0]?.matchedKeywords, []);
});
