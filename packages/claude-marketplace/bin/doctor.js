#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const result = spawnSync(
  process.execPath,
  [resolve(root, "scripts/doctor.js"), ...process.argv.slice(2)],
  {
    stdio: "inherit",
  },
);
process.exit(result.status ?? 1);
