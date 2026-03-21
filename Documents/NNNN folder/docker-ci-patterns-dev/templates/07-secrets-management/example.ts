/**
 * Secrets Management Patterns
 * Docker secrets, environment variables, GitHub Actions secrets, secret rotation
 */
import { writeFileSync } from "fs";

// ── Docker secrets (Swarm / Compose v3.1+) ───────────────────────────────────

export const DOCKER_SECRETS_COMPOSE = `version: "3.9"

services:
  api:
    image: my-app:latest
    environment:
      NODE_ENV: production
      # Reference secrets via /run/secrets/<name> inside container
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - db_password
      - jwt_secret
    ports:
      - "3000:3000"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: myapp
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt   # local dev
    # external: true                  # production: managed by Docker Swarm
  jwt_secret:
    file: ./secrets/jwt_secret.txt
`;

// ── Reading Docker secrets in Node.js ─────────────────────────────────────────

export function readDockerSecret(secretName: string, fallbackEnvVar?: string): string {
  const secretPath = `/run/secrets/${secretName}`;

  try {
    const { readFileSync } = require("fs");
    return readFileSync(secretPath, "utf8").trim();
  } catch {
    if (fallbackEnvVar && process.env[fallbackEnvVar]) {
      return process.env[fallbackEnvVar]!;
    }
    throw new Error(`Secret '${secretName}' not found at ${secretPath} and no fallback env var`);
  }
}

// Usage pattern:
// const dbPassword = readDockerSecret("db_password", "DB_PASSWORD");
// const jwtSecret  = readDockerSecret("jwt_secret",  "JWT_SECRET");

// ── .env patterns with validation ────────────────────────────────────────────

export const ENV_SCHEMA = {
  required: ["DATABASE_URL", "JWT_SECRET", "NODE_ENV"],
  optional: ["PORT", "LOG_LEVEL", "REDIS_URL", "SENTRY_DSN"],
} as const;

export type RequiredEnvKey = (typeof ENV_SCHEMA.required)[number];

export function validateEnv(): Record<RequiredEnvKey, string> {
  const missing = ENV_SCHEMA.required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return ENV_SCHEMA.required.reduce((acc, key) => {
    acc[key] = process.env[key]!;
    return acc;
  }, {} as Record<RequiredEnvKey, string>);
}

// ── GitHub Actions secrets reference ─────────────────────────────────────────

export const SECRETS_WORKFLOW = `name: Deploy with Secrets

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      # Secrets injected as env vars — never printed to logs
      - name: Build with secrets
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          JWT_SECRET: \${{ secrets.JWT_SECRET }}
          DOCKER_TOKEN: \${{ secrets.DOCKER_TOKEN }}
        run: |
          echo "Building image..."
          docker build \\
            --secret id=npmrc,src=\$HOME/.npmrc \\
            --build-arg NODE_ENV=production \\
            -t my-app:latest .

      # Use OIDC for cloud auth (no long-lived creds)
      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions-role
          aws-region: us-east-1

      - name: Mask sensitive values in logs
        run: |
          echo "::add-mask::\${{ secrets.JWT_SECRET }}"
          echo "Deploying application..."
`;

// ── Secret rotation pattern ───────────────────────────────────────────────────

export interface SecretVersion {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export class SecretRotationManager {
  private secrets = new Map<string, SecretVersion[]>();

  addVersion(name: string, version: SecretVersion): void {
    const versions = this.secrets.get(name) ?? [];
    versions.push(version);
    this.secrets.set(name, versions);
  }

  getActive(name: string): SecretVersion | undefined {
    return this.secrets.get(name)?.find((v) => v.isActive && v.expiresAt > new Date());
  }

  rotate(name: string, newVersion: SecretVersion): void {
    const versions = this.secrets.get(name) ?? [];
    // Deactivate old versions (keep for grace period)
    versions.forEach((v) => {
      v.isActive = false;
    });
    versions.push(newVersion);
    this.secrets.set(name, versions);
  }

  pruneExpired(name: string, gracePeriodMs = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - gracePeriodMs);
    const versions = this.secrets.get(name) ?? [];
    this.secrets.set(
      name,
      versions.filter((v) => v.createdAt > cutoff || v.isActive)
    );
  }
}

// ── .env.example template ─────────────────────────────────────────────────────

export const ENV_EXAMPLE = `# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:changeme@localhost:5432/myapp

# ─── Authentication ────────────────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-256-bit-secret-here

# ─── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# ─── External Services ─────────────────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
SENTRY_DSN=https://xxxx@sentry.io/xxxxx

# ─── App ───────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
`;

// ── Write helpers ─────────────────────────────────────────────────────────────

export function writeSecretsCompose(path = "docker-compose.secrets.yml"): void {
  writeFileSync(path, DOCKER_SECRETS_COMPOSE);
  console.log(`[Docker] Wrote secrets compose to ${path}`);
  console.log("[Docker] Remember: create ./secrets/*.txt files (not committed to git)");
}

export function writeEnvExample(path = ".env.example"): void {
  writeFileSync(path, ENV_EXAMPLE);
  console.log(`[Config] Wrote .env.example to ${path}`);
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Docker Secrets Management ===\n");
  console.log("Docker Compose with secrets:");
  console.log(DOCKER_SECRETS_COMPOSE);
  console.log("\nGitHub Actions secrets workflow:");
  console.log(SECRETS_WORKFLOW);
  console.log("\nEnvironment schema:", ENV_SCHEMA);
}

main();
