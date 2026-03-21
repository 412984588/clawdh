/**
 * Hono.js — Streaming & Server-Sent Events (SSE)
 * streamText, streamSSE, readable streams, progressive responses
 */
import { Hono } from "hono";
import { stream, streamText, streamSSE } from "hono/streaming";

const app = new Hono();

// ── 1. Server-Sent Events — real-time updates ─────────────────────────────────

// Live notifications stream
app.get("/events/notifications", (c) =>
  streamSSE(c, async (stream) => {
    let count = 0;

    // Emit heartbeat every 5 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: "heartbeat", data: String(Date.now()) }).catch(() => {
        clearInterval(heartbeat);
      });
    }, 5000);

    // Simulate incoming notifications
    const events = [
      { type: "info", message: "Your export is ready" },
      { type: "success", message: "Payment processed" },
      { type: "warning", message: "Storage almost full (85%)" },
    ];

    for (const event of events) {
      await stream.writeSSE({
        id: String(++count),
        event: event.type,
        data: JSON.stringify(event),
        retry: 3000, // reconnect after 3 seconds if disconnected
      });
      await stream.sleep(1000); // 1 second between events
    }

    clearInterval(heartbeat);
    // Client auto-reconnects unless we close explicitly
  })
);

// Progress stream for long-running operations
app.post("/jobs/process", async (c) => {
  const { items } = await c.req.json<{ items: string[] }>();

  return streamSSE(c, async (stream) => {
    const total = items.length;

    for (let i = 0; i < total; i++) {
      await stream.writeSSE({
        event: "progress",
        data: JSON.stringify({
          current: i + 1,
          total,
          item: items[i],
          percent: Math.round(((i + 1) / total) * 100),
        }),
      });
      // Simulate work
      await stream.sleep(200);
    }

    await stream.writeSSE({ event: "complete", data: JSON.stringify({ processed: total }) });
  });
});

// ── 2. Text streaming — for LLM outputs, large text ─────────────────────────

app.get("/stream/text", (c) =>
  streamText(c, async (stream) => {
    const words = "Hono is a fast, lightweight, multi-runtime web framework.".split(" ");
    for (const word of words) {
      await stream.write(word + " ");
      await stream.sleep(100); // simulate token-by-token streaming
    }
  })
);

// LLM response streaming (wraps OpenAI/Anthropic SDK)
app.post("/ai/chat", async (c) => {
  const { messages } = await c.req.json<{ messages: Array<{ role: string; content: string }> }>();

  return streamSSE(c, async (stream) => {
    // Simulate token streaming (replace with actual AI SDK call)
    const response = "This is a simulated AI response. In production, stream tokens from OpenAI or Anthropic.";
    const tokens = response.split(" ");

    for (const token of tokens) {
      await stream.writeSSE({
        event: "delta",
        data: JSON.stringify({ token: token + " " }),
      });
      await stream.sleep(50);
    }

    await stream.writeSSE({
      event: "done",
      data: JSON.stringify({ usage: { inputTokens: messages.length * 10, outputTokens: tokens.length } }),
    });
  });
});

// ── 3. Binary streaming — files, video chunks ────────────────────────────────

app.get("/stream/file", (c) =>
  stream(c, async (stream) => {
    // Stream a large file in chunks
    const chunkSize = 65536; // 64KB chunks
    const totalSize = 1024 * 1024; // 1MB simulated file
    let sent = 0;

    c.header("Content-Type", "application/octet-stream");
    c.header("Content-Disposition", "attachment; filename=data.bin");
    c.header("Content-Length", String(totalSize));

    while (sent < totalSize) {
      const chunk = new Uint8Array(Math.min(chunkSize, totalSize - sent));
      await stream.write(chunk);
      sent += chunk.length;
      await stream.sleep(0); // yield to event loop
    }
  })
);

// ── 4. Abort signal — cleanup when client disconnects ────────────────────────

app.get("/stream/long-poll", (c) =>
  streamSSE(c, async (stream) => {
    const signal = c.req.raw.signal;

    const timer = setInterval(async () => {
      if (signal.aborted) {
        clearInterval(timer);
        return;
      }
      await stream.writeSSE({
        event: "tick",
        data: JSON.stringify({ time: new Date().toISOString() }),
      });
    }, 1000);

    // Wait for disconnect
    await new Promise<void>((resolve) => {
      signal.addEventListener("abort", () => { clearInterval(timer); resolve(); });
    });
  })
);

export default app;
