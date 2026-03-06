import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { internalConfigSchema } from "../src/schema.js";

function parseEnvFile(content: string): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    entries[key] = value;
  }

  return entries;
}

describe(".env.example compatibility", () => {
  it("parses the checked-in example env without manual cleanup", () => {
    const envExample = readFileSync(
      resolve(import.meta.dirname, "../../../.env.example"),
      "utf8",
    );

    const parsed = internalConfigSchema.parse(parseEnvFile(envExample));

    expect(parsed.webhookPath).toBe("/webhook/openclaw_callback");
    expect(parsed.voiceProvider).toBe("local-mock");
    expect(parsed.memoryDbPath).toMatch(/voice-hub\.db$/);
  });
});
