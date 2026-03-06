import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseManager } from "../src/database.js";

describe("DatabaseManager", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it("initializes sqlite schema with WAL enabled", () => {
    const dir = mkdtempSync(join(tmpdir(), "voice-hub-memory-bank-"));
    tempDirs.push(dir);

    const manager = new DatabaseManager({
      dbPath: join(dir, "memory-bank.db"),
      walEnabled: true,
      busyTimeout: 5000,
      foreignKeys: true,
      logLevel: "info",
    });

    manager.init();

    expect(manager.isOpen()).toBe(true);
    expect(manager.tableExists("sessions")).toBe(true);
    expect(manager.tableExists("memories")).toBe(true);
    expect(manager.getStats().walMode).toBe(true);

    manager.close();
    expect(manager.isOpen()).toBe(false);
  });
});
