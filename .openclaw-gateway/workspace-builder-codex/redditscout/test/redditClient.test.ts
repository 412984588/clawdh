import test from "node:test";
import assert from "node:assert/strict";
import { fetchSubredditPosts } from "../src/redditClient.js";

function createListingResponse(postId: string): Response {
  return new Response(
    JSON.stringify({
      data: {
        children: [
          {
            data: {
              id: postId,
              title: `title-${postId}`,
              selftext: "hello",
              permalink: `/r/programming/${postId}`,
              subreddit: "programming",
              author: "alice",
              score: 42,
              created_utc: 1700000000,
            },
          },
        ],
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

test("Reddit 503 后应自动重试并成功返回", async () => {
  const realFetch = globalThis.fetch;
  let callCount = 0;

  globalThis.fetch = async () => {
    callCount += 1;
    if (callCount === 1) {
      return new Response("service unavailable", { status: 503 });
    }

    return createListingResponse("p1");
  };

  try {
    const posts = await fetchSubredditPosts("programming", 1, undefined, {
      maxRetries: 2,
      baseDelayMs: 0,
    });

    assert.equal(callCount, 2);
    assert.equal(posts.length, 1);
    assert.equal(posts[0]?.id, "p1");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("Reddit 404 不应重试并直接抛错", async () => {
  const realFetch = globalThis.fetch;
  let callCount = 0;

  globalThis.fetch = async () => {
    callCount += 1;
    return new Response("not found", { status: 404 });
  };

  try {
    await assert.rejects(
      () =>
        fetchSubredditPosts("programming", 1, undefined, {
          maxRetries: 2,
          baseDelayMs: 0,
        }),
      /404 not found/i,
    );
    assert.equal(callCount, 1);
  } finally {
    globalThis.fetch = realFetch;
  }
});
