import test from "node:test";
import assert from "node:assert/strict";
import { filterRecentPosts } from "../src/postAgeFilter.js";
import { RedditPost } from "../src/types.js";

const nowMs = Date.parse("2026-03-01T20:00:00Z");

function createPost(id: string, createdUtc: number): RedditPost {
  return {
    id,
    title: `post-${id}`,
    selftext: "",
    url: `https://example.com/${id}`,
    permalink: `https://reddit.com/r/programming/${id}`,
    subreddit: "programming",
    author: "alice",
    score: 10,
    numComments: 0,
    createdUtc,
  };
}

test("应过滤超过时间窗口的历史帖子", () => {
  const posts = [
    createPost("new", Math.floor(nowMs / 1000) - 3600),
    createPost("old", Math.floor(nowMs / 1000) - 60 * 60 * 30),
  ];

  const recent = filterRecentPosts(posts, 24, nowMs);
  assert.deepEqual(
    recent.map((post) => post.id),
    ["new"],
  );
});

test("边界时间点(刚好等于窗口下限)应保留", () => {
  const cutoffUtc = Math.floor(nowMs / 1000) - 24 * 3600;
  const posts = [createPost("edge", cutoffUtc)];

  const recent = filterRecentPosts(posts, 24, nowMs);
  assert.equal(recent.length, 1);
  assert.equal(recent[0]?.id, "edge");
});
