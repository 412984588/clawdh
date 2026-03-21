/**
 * Multi-Service Stack Patterns
 * Full microservice docker-compose with message queue, caching, monitoring
 */
import { writeFileSync } from "fs";

// ── Full microservice stack ───────────────────────────────────────────────────

export const MICROSERVICE_COMPOSE = `version: "3.9"

# ── Shared network ─────────────────────────────────────────────────────────────
networks:
  backend:
    driver: bridge
  frontend:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  rabbitmq-data:
  elasticsearch-data:

services:

  # ── API Gateway / Load balancer ───────────────────────────────────────────────
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
      - auth-service
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s

  # ── Main API service ──────────────────────────────────────────────────────────
  api:
    build:
      context: ./services/api
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      RABBITMQ_URL: amqp://\${RABBITMQ_USER}:\${RABBITMQ_PASSWORD}@rabbitmq:5672
      AUTH_SERVICE_URL: http://auth-service:3001
      JWT_SECRET: \${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - backend
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ── Auth microservice ─────────────────────────────────────────────────────────
  auth-service:
    build:
      context: ./services/auth
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD}@postgres:5432/auth_db
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: \${JWT_SECRET}
      JWT_REFRESH_SECRET: \${JWT_REFRESH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"]
      interval: 30s

  # ── Worker service (async job processing) ─────────────────────────────────────
  worker:
    build:
      context: ./services/worker
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      RABBITMQ_URL: amqp://\${RABBITMQ_USER}:\${RABBITMQ_PASSWORD}@rabbitmq:5672
    depends_on:
      rabbitmq:
        condition: service_healthy
    networks:
      - backend
    deploy:
      replicas: 2

  # ── PostgreSQL ────────────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_MULTIPLE_DATABASES: \${POSTGRES_DB},auth_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init-multiple-dbs.sh:/docker-entrypoint-initdb.d/init-dbs.sh:ro
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── Redis (cache + sessions + queues) ─────────────────────────────────────────
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD} --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "\${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── RabbitMQ (message broker) ─────────────────────────────────────────────────
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: \${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: \${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    ports:
      - "15672:15672"   # management UI (dev only)
    networks:
      - backend
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 30s
      retries: 3

  # ── Elasticsearch (search + analytics) ───────────────────────────────────────
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "curl -s http://localhost:9200/_cluster/health | grep -q 'status.*green\\|status.*yellow'"]
      interval: 30s
      timeout: 10s
      retries: 5
`;

// ── Service mesh with Traefik ─────────────────────────────────────────────────

export const TRAEFIK_COMPOSE = `version: "3.9"

networks:
  traefik:
    external: true

services:
  traefik:
    image: traefik:v3
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"   # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./acme.json:/acme.json
    networks:
      - traefik

  api:
    image: my-api:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(\`api.example.com\`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=3000"
      - "traefik.http.middlewares.api-ratelimit.ratelimit.average=100"
    networks:
      - traefik
`;

// ── Multi-service environment template ────────────────────────────────────────

export const MULTI_SERVICE_ENV = `# ─── Shared ────────────────────────────────────────────────────────────────────
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-here
JWT_REFRESH_SECRET=another-256-bit-secret-here

# ─── PostgreSQL ─────────────────────────────────────────────────────────────────
POSTGRES_PASSWORD=changeme
POSTGRES_DB=myapp

# ─── Redis ─────────────────────────────────────────────────────────────────────
REDIS_PASSWORD=changeme

# ─── RabbitMQ ───────────────────────────────────────────────────────────────────
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=changeme

# ─── External Services ──────────────────────────────────────────────────────────
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
SENTRY_DSN=
`;

// ── Inter-service communication pattern ───────────────────────────────────────

export interface ServiceClient {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export async function callService(
  client: ServiceClient,
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<unknown> {
  const url = `${client.baseUrl}${path}`;
  const { method = "GET", body, headers = {} } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= client.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), client.timeout);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Service ${client.baseUrl} returned ${response.status}`);
      }

      return response.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < client.retries) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 100));
      }
    }
  }

  throw new Error(`All ${client.retries + 1} attempts failed: ${lastError?.message}`);
}

// ── Write helpers ─────────────────────────────────────────────────────────────

export function writeMicroserviceCompose(path = "docker-compose.microservices.yml"): void {
  writeFileSync(path, MICROSERVICE_COMPOSE);
  console.log(`[Docker] Wrote microservice compose to ${path}`);
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Multi-Service Stack Patterns ===\n");
  console.log("Full microservice docker-compose (services: nginx, api, auth-service, worker, postgres, redis, rabbitmq, elasticsearch)");
  console.log("Services count:", MICROSERVICE_COMPOSE.match(/^\s{2}\w[\w-]*:/gm)?.length ?? 0);
  console.log("\nTraefik service mesh with automatic TLS:");
  console.log(TRAEFIK_COMPOSE.slice(0, 200) + "...");
}

main();
