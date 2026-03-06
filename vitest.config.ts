import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

function fromRoot(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url));
}

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@voice-hub/audio-engine",
        replacement: fromRoot("./packages/audio-engine/src/index.ts"),
      },
      {
        find: "@voice-hub/backend-dispatcher",
        replacement: fromRoot("./packages/backend-dispatcher/src/index.ts"),
      },
      {
        find: "@voice-hub/claude-marketplace",
        replacement: fromRoot("./packages/claude-marketplace/src/index.ts"),
      },
      {
        find: "@voice-hub/claude-mcp-server",
        replacement: fromRoot("./packages/claude-mcp-server/src/index.ts"),
      },
      {
        find: "@voice-hub/core-runtime",
        replacement: fromRoot("./packages/core-runtime/src/index.ts"),
      },
      {
        find: "@voice-hub/memory-bank",
        replacement: fromRoot("./packages/memory-bank/src/index.ts"),
      },
      {
        find: "@voice-hub/openclaw-plugin",
        replacement: fromRoot("./packages/openclaw-plugin/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-azure-voice-live",
        replacement: fromRoot(
          "./packages/provider-azure-voice-live/src/index.ts",
        ),
      },
      {
        find: "@voice-hub/provider-contracts",
        replacement: fromRoot("./packages/provider-contracts/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-gemini-live",
        replacement: fromRoot("./packages/provider-gemini-live/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-hume-evi",
        replacement: fromRoot("./packages/provider-hume-evi/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-local-mock",
        replacement: fromRoot("./packages/provider-local-mock/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-local-pipeline",
        replacement: fromRoot(
          "./packages/provider-local-pipeline/src/index.ts",
        ),
      },
      {
        find: "@voice-hub/provider-openai-realtime",
        replacement: fromRoot(
          "./packages/provider-openai-realtime/src/index.ts",
        ),
      },
      {
        find: "@voice-hub/provider-registry",
        replacement: fromRoot("./packages/provider-registry/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-test-kit",
        replacement: fromRoot("./packages/provider-test-kit/src/index.ts"),
      },
      {
        find: "@voice-hub/provider-volcengine-realtime",
        replacement: fromRoot(
          "./packages/provider-volcengine-realtime/src/index.ts",
        ),
      },
      {
        find: "@voice-hub/provider",
        replacement: fromRoot("./packages/provider/src/index.ts"),
      },
      {
        find: "@voice-hub/shared-config/constants",
        replacement: fromRoot("./packages/shared-config/src/constants.ts"),
      },
      {
        find: "@voice-hub/shared-config/schema",
        replacement: fromRoot("./packages/shared-config/src/schema.ts"),
      },
      {
        find: "@voice-hub/shared-config",
        replacement: fromRoot("./packages/shared-config/src/index.ts"),
      },
      {
        find: "@voice-hub/shared-types/audio",
        replacement: fromRoot("./packages/shared-types/src/audio.ts"),
      },
      {
        find: "@voice-hub/shared-types/memory",
        replacement: fromRoot("./packages/shared-types/src/memory.ts"),
      },
      {
        find: "@voice-hub/shared-types/provider",
        replacement: fromRoot("./packages/shared-types/src/provider.ts"),
      },
      {
        find: "@voice-hub/shared-types/realtime-provider",
        replacement: fromRoot(
          "./packages/shared-types/src/realtime-provider.ts",
        ),
      },
      {
        find: "@voice-hub/shared-types/session",
        replacement: fromRoot("./packages/shared-types/src/session.ts"),
      },
      {
        find: "@voice-hub/shared-types",
        replacement: fromRoot("./packages/shared-types/src/index.ts"),
      },
    ],
  },
});
