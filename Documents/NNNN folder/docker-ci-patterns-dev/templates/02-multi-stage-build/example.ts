/**
 * Docker Multi-Stage Build Patterns
 * TypeScript/Node.js multi-stage Dockerfiles for minimal production images
 */
import { writeFileSync } from "fs";

// ── Node.js + Prisma multi-stage ──────────────────────────────────────────────

export const PRISMA_DOCKERFILE = `# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Builder: compile TypeScript ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Generate Prisma client in builder
RUN npx prisma generate

# ── Production: only what's needed ────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Prisma client needs the generated files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \\
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
`;

// ── Next.js multi-stage ────────────────────────────────────────────────────────

export const NEXTJS_DOCKERFILE = `# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs \\
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
`;

// ── Python (FastAPI) multi-stage ──────────────────────────────────────────────

export const FASTAPI_DOCKERFILE = `# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder
WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/app/packages -r requirements.txt

FROM python:3.12-slim AS production
WORKDIR /app

COPY --from=builder /app/packages ./packages
ENV PYTHONPATH=/app/packages
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY src/ ./src/

RUN useradd --no-create-home --shell /bin/false appuser
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

// ── Dockerfile writer utility ─────────────────────────────────────────────────

export type ProjectType = "node-ts" | "prisma" | "nextjs" | "fastapi";

export function getDockerfile(type: ProjectType): string {
  const map: Record<ProjectType, string> = {
    "node-ts": PRISMA_DOCKERFILE.replace(/prisma/gi, ""),
    "prisma": PRISMA_DOCKERFILE,
    "nextjs": NEXTJS_DOCKERFILE,
    "fastapi": FASTAPI_DOCKERFILE,
  };
  return map[type];
}

export function writeDockerfile(type: ProjectType, path = "Dockerfile"): void {
  const content = getDockerfile(type);
  writeFileSync(path, content);
  console.log(`[Docker] Wrote ${type} Dockerfile to ${path}`);
}

// ── Image size analysis ────────────────────────────────────────────────────────

export interface LayerInfo {
  stage: string;
  estimatedSizeMb: number;
  packages: string[];
}

export function analyzeDockerfile(content: string): LayerInfo[] {
  const stages: LayerInfo[] = [];
  const lines = content.split("\n");

  let currentStage = "";
  let packages: string[] = [];

  for (const line of lines) {
    const fromMatch = line.match(/^FROM\s+\S+\s+AS\s+(\w+)/i);
    if (fromMatch) {
      if (currentStage) {
        stages.push({ stage: currentStage, estimatedSizeMb: 0, packages });
      }
      currentStage = fromMatch[1];
      packages = [];
    }

    const installMatch = line.match(/npm (ci|install|i)\s*(.*)/);
    if (installMatch) packages.push(`npm: ${installMatch[2] || "dependencies"}`);

    const pipMatch = line.match(/pip install\s+(.*)/);
    if (pipMatch) packages.push(`pip: ${pipMatch[1]}`);
  }

  if (currentStage) {
    stages.push({ stage: currentStage, estimatedSizeMb: 0, packages });
  }

  return stages;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Multi-Stage Docker Build Patterns ===\n");

  console.log("Prisma (TypeScript + Prisma):");
  console.log(PRISMA_DOCKERFILE);

  const stages = analyzeDockerfile(PRISMA_DOCKERFILE);
  console.log("\nStages found:", stages.map((s) => s.stage).join(" → "));
}

main();
