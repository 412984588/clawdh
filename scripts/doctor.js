#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const probeLive = args.has("--probe-live");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const providerCatalog = [
  {
    id: "local-mock",
    transport: "local",
    nativeFullDuplex: true,
    bargeIn: true,
    toolCalling: true,
    textAnnouncement: true,
    transcriptFinal: true,
    runtimeSupport: "server-or-browser",
    requiredEnv: [],
    implementation: "production-local",
  },
  {
    id: "local-pipeline",
    transport: "local",
    nativeFullDuplex: false,
    bargeIn: false,
    toolCalling: false,
    textAnnouncement: false,
    transcriptFinal: false,
    runtimeSupport: "server",
    requiredEnv: [],
    implementation: "skeleton",
  },
  {
    id: "openai-realtime",
    transport: "websocket",
    nativeFullDuplex: true,
    bargeIn: true,
    toolCalling: true,
    textAnnouncement: true,
    transcriptFinal: true,
    runtimeSupport: "server",
    requiredEnv: ["OPENAI_REALTIME_WS_URL", "OPENAI_API_KEY"],
    implementation: "adapter-skeleton",
  },
  {
    id: "gemini-live",
    transport: "websocket",
    nativeFullDuplex: true,
    bargeIn: true,
    toolCalling: true,
    textAnnouncement: true,
    transcriptFinal: true,
    runtimeSupport: "server",
    requiredEnv: ["GEMINI_LIVE_WS_URL", "GEMINI_API_KEY"],
    implementation: "adapter-skeleton",
  },
  {
    id: "hume-evi",
    transport: "websocket",
    nativeFullDuplex: true,
    bargeIn: true,
    toolCalling: false,
    textAnnouncement: true,
    transcriptFinal: true,
    runtimeSupport: "server",
    requiredEnv: ["HUME_EVI_WS_URL", "HUME_API_KEY"],
    implementation: "adapter-skeleton",
  },
  {
    id: "azure-voice-live",
    transport: "websocket",
    nativeFullDuplex: true,
    bargeIn: true,
    toolCalling: true,
    textAnnouncement: true,
    transcriptFinal: true,
    runtimeSupport: "server",
    requiredEnv: ["AZURE_VOICE_LIVE_WS_URL", "AZURE_VOICE_LIVE_API_KEY"],
    implementation: "adapter-skeleton",
  },
  {
    id: "volcengine-realtime",
    transport: "websocket",
    nativeFullDuplex: true,
    bargeIn: true,
    toolCalling: true,
    textAnnouncement: true,
    transcriptFinal: true,
    runtimeSupport: "server",
    requiredEnv: [
      "VOLCENGINE_REALTIME_WS_URL",
      "VOLCENGINE_APP_ID",
      "VOLCENGINE_ACCESS_TOKEN",
    ],
    implementation: "adapter-skeleton",
  },
];

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function parseEnvFile(pathname) {
  if (!existsSync(pathname)) {
    return {};
  }

  const result = {};
  for (const line of readFileSync(pathname, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    result[key] = value;
  }
  return result;
}

function compareSemver(left, right) {
  const leftParts = left
    .replace(/^v/, "")
    .split(".")
    .map((part) => Number(part) || 0);
  const rightParts = right
    .replace(/^v/, "")
    .split(".")
    .map((part) => Number(part) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index++) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue > rightValue) {
      return 1;
    }
    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

function resolveMemoryDbPath(env) {
  return env.MEMORY_DB_PATH || join(homedir(), ".voice-hub", "voice-hub.db");
}

function isRiskyDbPath(pathname) {
  const normalized = pathname.toLowerCase();
  return ["icloud", "onedrive", "dropbox", "/volumes/", "nfs", "smb"].some(
    (needle) => normalized.includes(needle),
  );
}

function readJson(pathname) {
  return JSON.parse(readFileSync(pathname, "utf8"));
}

function getProviderSelection(env) {
  return env.VOICE_PROVIDER || "disabled";
}

async function main() {
  const env = {
    ...parseEnvFile(join(rootDir, ".env")),
    ...process.env,
  };

  const failures = [];
  const warnings = [];

  console.log(`Voice Hub Doctor${probeLive ? " (probe-live)" : ""}\n`);

  if (probeLive) {
    log(
      colors.yellow,
      "!",
      "doctor --probe-live 可能消耗 token、触发限流，并且需要真实凭证。",
    );
    console.log("");
  }

  const nodePass = compareSemver(process.version, "22.12.0") >= 0;
  if (nodePass) {
    log(colors.green, "✓", `Node.js ${process.version}`);
  } else {
    failures.push("Node.js 版本低于 22.12.0");
    log(colors.red, "✗", `Node.js ${process.version}，需要 >= 22.12.0`);
  }

  try {
    const pnpmVersion = execSync("pnpm --version", {
      cwd: rootDir,
      encoding: "utf8",
    }).trim();
    if (compareSemver(pnpmVersion, "9.0.0") >= 0) {
      log(colors.green, "✓", `pnpm ${pnpmVersion}`);
    } else {
      failures.push("pnpm 版本低于 9.0.0");
      log(colors.red, "✗", `pnpm ${pnpmVersion}，需要 >= 9.0.0`);
    }
  } catch {
    failures.push("pnpm 不可用");
    log(colors.red, "✗", "pnpm 未安装或不可执行");
  }

  const requiredDiscord = [
    "DISCORD_BOT_TOKEN",
    "DISCORD_GUILD_ID",
    "DISCORD_VOICE_CHANNEL_ID",
  ];
  const missingDiscord = requiredDiscord.filter((key) => !env[key]);
  if (missingDiscord.length === 0) {
    log(colors.green, "✓", "Discord 基础配置完整");
  } else {
    failures.push(`Discord 配置缺失: ${missingDiscord.join(", ")}`);
    log(colors.red, "✗", `Discord 配置缺失: ${missingDiscord.join(", ")}`);
  }

  const selectedProvider = getProviderSelection(env);
  const providerDefinition = providerCatalog.find(
    (provider) => provider.id === selectedProvider,
  );
  if (selectedProvider === "disabled") {
    warnings.push(
      "VOICE_PROVIDER=disabled，daemon 不会建立实时语音 provider 连接。",
    );
    log(colors.yellow, "!", "VOICE_PROVIDER=disabled");
  } else if (!providerDefinition) {
    failures.push(`未知 provider: ${selectedProvider}`);
    log(colors.red, "✗", `未知 provider: ${selectedProvider}`);
  } else {
    const missingProviderEnv = providerDefinition.requiredEnv.filter(
      (key) => !env[key],
    );
    if (missingProviderEnv.length === 0) {
      log(colors.green, "✓", `Provider ${selectedProvider} 配置完整`);
    } else {
      failures.push(
        `Provider ${selectedProvider} 缺失凭证: ${missingProviderEnv.join(", ")}`,
      );
      log(
        colors.red,
        "✗",
        `Provider ${selectedProvider} 缺失凭证: ${missingProviderEnv.join(", ")}`,
      );
    }
  }

  const dbPath = resolveMemoryDbPath(env);
  if (isRiskyDbPath(dbPath)) {
    warnings.push(`MEMORY_DB_PATH 指向潜在同步盘/网络盘: ${dbPath}`);
    log(colors.yellow, "!", `MEMORY_DB_PATH 存在同步盘/网络盘风险: ${dbPath}`);
  } else {
    log(colors.green, "✓", `MEMORY_DB_PATH=${dbPath}`);
  }

  const openclawManifestPath = join(
    rootDir,
    "packages/openclaw-plugin/openclaw.plugin.json",
  );
  const openclawPackagePath = join(
    rootDir,
    "packages/openclaw-plugin/package.json",
  );
  const claudePluginPath = join(
    rootDir,
    "packages/claude-marketplace/.claude-plugin/plugin.json",
  );
  const claudeSettingsPath = join(
    rootDir,
    "packages/claude-marketplace/.claude/settings.json",
  );

  if (existsSync(openclawManifestPath)) {
    log(colors.green, "✓", "OpenClaw plugin manifest 存在");
  } else {
    failures.push("缺少 packages/openclaw-plugin/openclaw.plugin.json");
    log(colors.red, "✗", "缺少 OpenClaw plugin manifest");
  }

  if (existsSync(openclawPackagePath)) {
    const pkg = readJson(openclawPackagePath);
    const extensions = pkg["openclaw.extensions"] ?? pkg.openclaw?.extensions;
    if (Array.isArray(extensions) && extensions.length > 0) {
      log(
        colors.green,
        "✓",
        "OpenClaw package.json 已声明 openclaw.extensions",
      );
    } else {
      failures.push(
        "packages/openclaw-plugin/package.json 缺少 openclaw.extensions",
      );
      log(colors.red, "✗", "OpenClaw package.json 缺少 openclaw.extensions");
    }
  }

  if (existsSync(claudePluginPath) && existsSync(claudeSettingsPath)) {
    log(colors.green, "✓", "Claude plugin 目录完整");
  } else {
    failures.push(
      "Claude plugin 缺少 .claude-plugin/plugin.json 或 .claude/settings.json",
    );
    log(colors.red, "✗", "Claude plugin 目录不完整");
  }

  console.log("\nProvider capability matrix:");
  for (const provider of providerCatalog) {
    const missing = provider.requiredEnv.filter((key) => !env[key]);
    const readiness =
      missing.length === 0 ? "ready-config" : `missing:${missing.join("|")}`;
    console.log(
      `- ${provider.id}: transport=${provider.transport}, fullDuplex=${String(provider.nativeFullDuplex)}, ` +
        `bargeIn=${String(provider.bargeIn)}, transcriptFinal=${String(provider.transcriptFinal)}, ` +
        `textAnnouncement=${String(provider.textAnnouncement)}, runtime=${provider.runtimeSupport}, impl=${provider.implementation}, ${readiness}`,
    );
  }

  if (probeLive) {
    console.log("\nLive probe status:");
    for (const provider of providerCatalog) {
      if (provider.id === "local-mock") {
        console.log(
          `- ${provider.id}: PASS (local provider, no external credentials required)`,
        );
        continue;
      }
      if (provider.id === "local-pipeline") {
        console.log(
          `- ${provider.id}: SKIPPED (minimal scaffold, no external live endpoint)`,
        );
        continue;
      }

      const missing = provider.requiredEnv.filter((key) => !env[key]);
      if (missing.length > 0) {
        console.log(
          `- ${provider.id}: ENVIRONMENT-BLOCKED (missing ${missing.join(", ")})`,
        );
        continue;
      }

      console.log(
        `- ${provider.id}: ENVIRONMENT-BLOCKED (adapter is scaffolded; TODO(protocol-confirmation) before live probe)`,
      );
    }
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings) {
      log(colors.yellow, "!", warning);
    }
  }

  console.log("");
  if (failures.length > 0) {
    for (const failure of failures) {
      log(colors.red, "✗", failure);
    }
    process.exit(1);
  }

  log(colors.green, "✓", "doctor completed without blocking failures");
}

main().catch((error) => {
  const detail =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`doctor failed: ${detail}\n`);
  process.exit(1);
});
