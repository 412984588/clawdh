/**
 * Dockerfile Optimization Patterns
 * Layer caching, BuildKit, .dockerignore, image size reduction
 */
import { writeFileSync } from "fs";

// ── Optimal layer caching order ───────────────────────────────────────────────
// Least-changed layers first → most-changed last
// Changes invalidate all subsequent layers

export const OPTIMIZED_DOCKERFILE = `# syntax=docker/dockerfile:1

# ── Stage 1: dependency installation (cached unless package.json changes) ─────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy ONLY package files first — layer is cached until these change
COPY package.json package-lock.json ./

# Use --mount=type=cache to persist npm cache across builds (BuildKit)
RUN --mount=type=cache,target=/root/.npm \\
    npm ci --only=production

# ── Stage 2: development deps + build ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN --mount=type=cache,target=/root/.npm \\
    npm ci

# Source changes here don't invalidate the npm layer above
COPY src/ ./src/

RUN npm run build

# ── Stage 3: minimal production image ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy production deps from deps stage (not builder — avoids devDeps)
COPY --from=deps /app/node_modules ./node_modules
# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Security: non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
`;

// ── Distroless for even smaller images ───────────────────────────────────────

export const DISTROLESS_DOCKERFILE = `# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build && npm prune --production

# Distroless Node.js image (~25MB vs ~180MB for node:alpine)
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["dist/index.js"]
`;

// ── Docker build analysis ─────────────────────────────────────────────────────

export interface BuildCacheAnalysis {
  recommendations: string[];
  estimatedCacheHitRate: string;
  layerOrder: string[];
}

export function analyzeDockerfileCaching(content: string): BuildCacheAnalysis {
  const recommendations: string[] = [];
  const layerOrder: string[] = [];

  const lines = content.split("\n").filter((l) => !l.startsWith("#") && l.trim());

  let foundCopyBeforePackageJson = false;
  let foundNpmAfterCopy = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("COPY")) {
      if (trimmed.includes("package") && trimmed.includes(".json")) {
        layerOrder.push("COPY package.json ✓");
      } else if (trimmed.includes("./src") || trimmed.match(/COPY \. \./)) {
        if (!foundNpmAfterCopy) {
          recommendations.push("Move COPY . . after npm install to improve layer caching");
          foundCopyBeforePackageJson = true;
        }
        layerOrder.push("COPY source");
      }
    }

    if (trimmed.includes("npm") && (trimmed.includes("ci") || trimmed.includes("install"))) {
      foundNpmAfterCopy = true;
      layerOrder.push("RUN npm install");
      if (trimmed.includes("--mount=type=cache")) {
        layerOrder[layerOrder.length - 1] += " (BuildKit cache ✓)";
      }
    }

    if (trimmed.startsWith("RUN npm run build")) {
      layerOrder.push("RUN build");
    }
  }

  if (!content.includes("--mount=type=cache")) {
    recommendations.push("Add --mount=type=cache,target=/root/.npm to RUN npm install for faster builds");
  }

  if (!content.includes("AS production") && !content.includes("AS runner")) {
    recommendations.push("Add a production stage to exclude devDependencies and build tools");
  }

  return {
    recommendations,
    estimatedCacheHitRate: recommendations.length === 0 ? "High (80-90%)" : "Medium (50-70%)",
    layerOrder,
  };
}

// ── BuildKit secrets (for build-time secrets) ─────────────────────────────────

export const BUILDKIT_SECRETS_DOCKERFILE = `# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

# Use BuildKit secret — not stored in image layers
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
    npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
`;

// Build with: docker build --secret id=npmrc,src=$HOME/.npmrc .

// ── Generate optimized Dockerfile ────────────────────────────────────────────

export function generateOptimizedDockerfile(
  useDistroless = false,
  useBuildKitSecrets = false
): string {
  if (useBuildKitSecrets) return BUILDKIT_SECRETS_DOCKERFILE;
  if (useDistroless) return DISTROLESS_DOCKERFILE;
  return OPTIMIZED_DOCKERFILE;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Dockerfile Optimization ===\n");
  console.log("Optimized Dockerfile with BuildKit caching:");
  console.log(OPTIMIZED_DOCKERFILE);

  const analysis = analyzeDockerfileCaching(OPTIMIZED_DOCKERFILE);
  console.log("\nAnalysis:");
  console.log("Layer order:", analysis.layerOrder);
  console.log("Cache hit rate:", analysis.estimatedCacheHitRate);
  console.log("Recommendations:", analysis.recommendations.length === 0 ? "None — well optimized!" : analysis.recommendations);
}

main();
