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
