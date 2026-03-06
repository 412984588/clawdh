#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const result = spawnSync(
  process.execPath,
  [resolve(root, "apps/voice-hub-app/dist/cli.js")],
  {
    stdio: "inherit",
  },
);
process.exit(result.status ?? 1);
