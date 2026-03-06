import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export interface BridgeDaemonHealth {
  status: "idle" | "running";
  providerCount: number;
  pid?: number;
}

export interface ProviderDoctorRecord {
  id: string;
  requiredEnv: string[];
  implementation: "production-local" | "adapter-skeleton" | "skeleton";
  runtimeSupport: "server" | "server-or-browser";
}

export const providerCatalog: ProviderDoctorRecord[] = [
  {
    id: "local-mock",
    requiredEnv: [],
    implementation: "production-local",
    runtimeSupport: "server-or-browser",
  },
  {
    id: "local-pipeline",
    requiredEnv: [],
    implementation: "skeleton",
    runtimeSupport: "server",
  },
  {
    id: "openai-realtime",
    requiredEnv: ["OPENAI_REALTIME_WS_URL", "OPENAI_API_KEY"],
    implementation: "adapter-skeleton",
    runtimeSupport: "server",
  },
  {
    id: "gemini-live",
    requiredEnv: ["GEMINI_LIVE_WS_URL", "GEMINI_API_KEY"],
    implementation: "adapter-skeleton",
    runtimeSupport: "server",
  },
  {
    id: "hume-evi",
    requiredEnv: ["HUME_EVI_WS_URL", "HUME_API_KEY"],
    implementation: "adapter-skeleton",
    runtimeSupport: "server",
  },
  {
    id: "azure-voice-live",
    requiredEnv: ["AZURE_VOICE_LIVE_WS_URL", "AZURE_VOICE_LIVE_API_KEY"],
    implementation: "adapter-skeleton",
    runtimeSupport: "server",
  },
  {
    id: "volcengine-realtime",
    requiredEnv: [
      "VOLCENGINE_REALTIME_WS_URL",
      "VOLCENGINE_APP_ID",
      "VOLCENGINE_ACCESS_TOKEN",
    ],
    implementation: "adapter-skeleton",
    runtimeSupport: "server",
  },
];

export function getPidFilePath(): string {
  return join(homedir(), ".voice-hub", "bridge-daemon.pid");
}

export function getBridgeDaemonStatus(): BridgeDaemonHealth {
  const pidFile = getPidFilePath();
  if (!existsSync(pidFile)) {
    return {
      status: "idle",
      providerCount: providerCatalog.length,
    };
  }

  const pid = Number(readFileSync(pidFile, "utf8").trim());
  if (!Number.isFinite(pid) || pid <= 0) {
    return {
      status: "idle",
      providerCount: providerCatalog.length,
    };
  }

  try {
    process.kill(pid, 0);
    return {
      status: "running",
      providerCount: providerCatalog.length,
      pid,
    };
  } catch {
    return {
      status: "idle",
      providerCount: providerCatalog.length,
    };
  }
}

export function writePidFile(pid: number): void {
  const pidFile = getPidFilePath();
  mkdirSync(dirname(pidFile), { recursive: true });
  writeFileSync(pidFile, `${pid}\n`, "utf8");
}

export function clearPidFile(): void {
  rmSync(getPidFilePath(), { force: true });
}

export function createBridgeDaemonHealth(
  providerCount: number,
): BridgeDaemonHealth {
  return {
    status: providerCount > 0 ? "running" : "idle",
    providerCount,
  };
}
