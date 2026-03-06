import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import {
  clearPidFile,
  getBridgeDaemonStatus,
  providerCatalog,
  writePidFile,
} from "./index.js";

function rootPath(...segments: string[]): string {
  return resolve(import.meta.dirname, "../../..", ...segments);
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function envHas(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

function providerStatus(providerId?: string): Array<{
  id: string;
  configured: boolean;
  missing: string[];
  implementation: string;
  runtimeSupport: string;
}> {
  return providerCatalog
    .filter((provider) => !providerId || provider.id === providerId)
    .map((provider) => {
      const missing = provider.requiredEnv.filter((key) => !envHas(key));
      return {
        id: provider.id,
        configured: missing.length === 0,
        missing,
        implementation: provider.implementation,
        runtimeSupport: provider.runtimeSupport,
      };
    });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const [command, subcommand] = args;

  if (!command || command === "help" || command === "--help") {
    process.stdout.write(
      "voice-hub-bridge <doctor|status|start|stop|config-validate|self-test|provider>\n",
    );
    process.exit(0);
  }

  if (command === "doctor") {
    const result = spawnSync(
      process.execPath,
      [rootPath("scripts/doctor.js"), ...args.slice(1)],
      {
        stdio: "inherit",
      },
    );
    process.exit(result.status ?? 1);
  }

  if (command === "status") {
    printJson(getBridgeDaemonStatus());
    return;
  }

  if (command === "start") {
    const current = getBridgeDaemonStatus();
    if (current.status === "running") {
      printJson(current);
      return;
    }

    const child = spawn(
      process.execPath,
      [rootPath("apps/voice-hub-app/dist/cli.js")],
      {
        detached: true,
        stdio: "ignore",
      },
    );
    if (typeof child.pid !== "number") {
      throw new Error("bridge-daemon failed to acquire child pid");
    }
    child.unref();
    writePidFile(child.pid);
    printJson({
      status: "running",
      pid: child.pid,
      mode: "detached",
    });
    return;
  }

  if (command === "stop") {
    const current = getBridgeDaemonStatus();
    if (current.status !== "running" || !current.pid) {
      printJson({ status: "idle" });
      return;
    }

    process.kill(current.pid, "SIGTERM");
    clearPidFile();
    printJson({ status: "stopped", pid: current.pid });
    return;
  }

  if (command === "config-validate") {
    const selected = process.env.VOICE_PROVIDER || "disabled";
    const record = providerStatus(
      selected === "disabled" ? undefined : selected,
    );
    printJson({
      selectedProvider: selected,
      providers: record,
      discordConfigured: [
        "DISCORD_BOT_TOKEN",
        "DISCORD_GUILD_ID",
        "DISCORD_VOICE_CHANNEL_ID",
      ].every(envHas),
    });
    return;
  }

  if (command === "self-test") {
    printJson({
      status: "environment-blocked",
      reason:
        "Discord live self-test requires a configured voice target and real credentials.",
    });
    return;
  }

  if (command === "provider" && subcommand === "list") {
    printJson(providerCatalog);
    return;
  }

  if (command === "provider" && subcommand === "status") {
    printJson(providerStatus(args[2]));
    return;
  }

  if (command === "provider" && subcommand === "config-validate") {
    printJson(providerStatus(args[2]));
    return;
  }

  process.stderr.write(`Unknown command: ${args.join(" ")}\n`);
  process.exit(1);
}

main().catch((error) => {
  const detail =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`bridge-daemon failed: ${detail}\n`);
  process.exit(1);
});
