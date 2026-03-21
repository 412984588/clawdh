/**
 * Dockerfile Node.js Template Generator
 * Generates production-ready Dockerfiles for Node.js / TypeScript projects
 */
import { execSync } from "child_process";
import { writeFileSync } from "fs";

// ── Dockerfile templates ───────────────────────────────────────────────────────

export const NODE_DOCKERFILE = `# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies in separate layer for caching
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
`;

export const TYPESCRIPT_DOCKERFILE = `# syntax=docker/dockerfile:1

# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
`;

// ── .dockerignore ─────────────────────────────────────────────────────────────

export const DOCKERIGNORE = `node_modules
.git
.gitignore
*.md
.env*
!.env.example
dist
coverage
.nyc_output
*.log
.DS_Store
.vscode
.idea
docker-compose*.yml
Dockerfile*
.dockerignore
tests
__tests__
*.test.ts
*.spec.ts
`;

// ── Docker build helpers ───────────────────────────────────────────────────────

export interface BuildOptions {
  tag: string;
  context?: string;
  dockerfile?: string;
  buildArgs?: Record<string, string>;
  platform?: string;
  noCache?: boolean;
}

export function buildDockerCommand(options: BuildOptions): string {
  const parts = ["docker build"];

  parts.push(`-t ${options.tag}`);

  if (options.dockerfile) parts.push(`-f ${options.dockerfile}`);
  if (options.platform) parts.push(`--platform ${options.platform}`);
  if (options.noCache) parts.push("--no-cache");

  if (options.buildArgs) {
    for (const [key, value] of Object.entries(options.buildArgs)) {
      parts.push(`--build-arg ${key}=${value}`);
    }
  }

  parts.push(options.context ?? ".");
  return parts.join(" ");
}

export function buildImage(options: BuildOptions): void {
  const cmd = buildDockerCommand(options);
  console.log(`[Docker] Building: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

// ── Docker run helpers ────────────────────────────────────────────────────────

export interface RunOptions {
  image: string;
  name?: string;
  ports?: Array<[number, number]>; // [hostPort, containerPort]
  env?: Record<string, string>;
  envFile?: string;
  volumes?: Array<[string, string]>; // [host, container]
  detach?: boolean;
  rm?: boolean;
  network?: string;
}

export function buildRunCommand(options: RunOptions): string {
  const parts = ["docker run"];

  if (options.detach) parts.push("-d");
  if (options.rm) parts.push("--rm");
  if (options.name) parts.push(`--name ${options.name}`);
  if (options.network) parts.push(`--network ${options.network}`);
  if (options.envFile) parts.push(`--env-file ${options.envFile}`);

  for (const [host, container] of options.ports ?? []) {
    parts.push(`-p ${host}:${container}`);
  }

  for (const [key, value] of Object.entries(options.env ?? {})) {
    parts.push(`-e ${key}=${value}`);
  }

  for (const [host, container] of options.volumes ?? []) {
    parts.push(`-v ${host}:${container}`);
  }

  parts.push(options.image);
  return parts.join(" ");
}

// ── Generate files ────────────────────────────────────────────────────────────

export function generateDockerfiles(projectType: "node" | "typescript" = "typescript") {
  const dockerfile = projectType === "typescript" ? TYPESCRIPT_DOCKERFILE : NODE_DOCKERFILE;
  writeFileSync("Dockerfile", dockerfile);
  writeFileSync(".dockerignore", DOCKERIGNORE);
  console.log("[Docker] Generated Dockerfile and .dockerignore");
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Dockerfile Node.js Template ===\n");
  console.log("TypeScript Dockerfile:");
  console.log(TYPESCRIPT_DOCKERFILE);

  const cmd = buildDockerCommand({
    tag: "my-app:latest",
    buildArgs: { NODE_ENV: "production" },
    platform: "linux/amd64",
  });
  console.log("\nDocker build command:");
  console.log(cmd);

  const runCmd = buildRunCommand({
    image: "my-app:latest",
    name: "my-app",
    ports: [[3000, 3000]],
    env: { NODE_ENV: "production" },
    detach: true,
  });
  console.log("\nDocker run command:");
  console.log(runCmd);
}

main().catch(console.error);
