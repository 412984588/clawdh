/**
 * Docker Compose Patterns
 * Generate docker-compose.yml for Node.js + PostgreSQL + Redis + nginx stacks
 */
import { writeFileSync } from "fs";

// ── Basic Node.js + PostgreSQL ────────────────────────────────────────────────

export const BASIC_COMPOSE = `version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB:-myapp}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
`;

// ── Full stack: Node + PostgreSQL + Redis + nginx ─────────────────────────────

export const FULL_STACK_COMPOSE = `version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB:-myapp}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "\${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - app-network

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
`;

// ── Development compose (with hot reload) ─────────────────────────────────────

export const DEV_COMPOSE = `version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "9229:9229"  # Node.js debugger
    volumes:
      - .:/app
      - /app/node_modules  # anonymous volume to preserve node_modules
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:dev@db:5432/myapp_dev
      REDIS_URL: redis://redis:6379
    command: npm run dev
    depends_on:
      - db
      - redis
    networks:
      - dev-network

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: myapp_dev
    ports:
      - "5432:5432"  # expose for local tools (DBeaver, etc.)
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
    networks:
      - dev-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - dev-network

volumes:
  postgres-dev-data:

networks:
  dev-network:
`;

// ── .env.example ─────────────────────────────────────────────────────────────

export const ENV_EXAMPLE = `# Database
POSTGRES_PASSWORD=changeme
POSTGRES_DB=myapp

# Redis
REDIS_PASSWORD=changeme

# Auth
JWT_SECRET=your-256-bit-secret-here

# App
NODE_ENV=production
PORT=3000
`;

// ── Compose file writer ───────────────────────────────────────────────────────

export type ComposeType = "basic" | "full-stack" | "development";

export function writeComposeFile(type: ComposeType, path = "docker-compose.yml"): void {
  const map: Record<ComposeType, string> = {
    "basic": BASIC_COMPOSE,
    "full-stack": FULL_STACK_COMPOSE,
    "development": DEV_COMPOSE,
  };
  writeFileSync(path, map[type]);
  console.log(`[Docker] Wrote ${type} compose to ${path}`);
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Docker Compose Patterns ===\n");
  console.log("Basic (Node + PostgreSQL):");
  console.log(BASIC_COMPOSE);
}

main();
