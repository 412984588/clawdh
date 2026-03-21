/**
 * Health Check & Monitoring Patterns
 * /health endpoints, Docker HEALTHCHECK, Prometheus metrics, alerting
 */

// ── Health check response types ────────────────────────────────────────────────

export type HealthStatus = "ok" | "degraded" | "down";

export interface ComponentHealth {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  components: Record<string, ComponentHealth>;
}

// ── Database health check ─────────────────────────────────────────────────────

export async function checkDatabaseHealth(
  query: () => Promise<unknown>
): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await query();
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : "Database unreachable",
    };
  }
}

// ── Redis health check ────────────────────────────────────────────────────────

export async function checkRedisHealth(
  ping: () => Promise<string>
): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    const result = await ping();
    if (result !== "PONG") return { status: "degraded", message: `Unexpected PING response: ${result}` };
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return { status: "down", message: err instanceof Error ? err.message : "Redis unreachable" };
  }
}

// ── Disk space check ──────────────────────────────────────────────────────────

export function checkDiskHealth(thresholdPercent = 90): ComponentHealth {
  try {
    // In real usage, use 'df' or a library like 'check-disk-space'
    const used = Math.random() * 100; // simulated
    if (used > thresholdPercent) {
      return { status: "degraded", message: `Disk usage at ${used.toFixed(1)}% (threshold: ${thresholdPercent}%)` };
    }
    return { status: "ok" };
  } catch {
    return { status: "down", message: "Cannot check disk space" };
  }
}

// ── Full health aggregation ───────────────────────────────────────────────────

export async function getHealth(
  checks: Record<string, () => Promise<ComponentHealth>>,
  version = process.env.APP_VERSION ?? "unknown"
): Promise<HealthResponse> {
  const components: Record<string, ComponentHealth> = {};

  await Promise.all(
    Object.entries(checks).map(async ([name, check]) => {
      components[name] = await check();
    })
  );

  const statuses = Object.values(components).map((c) => c.status);
  const overallStatus: HealthStatus = statuses.includes("down")
    ? "down"
    : statuses.includes("degraded")
    ? "degraded"
    : "ok";

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version,
    components,
  };
}

// ── Docker HEALTHCHECK + compose configuration ─────────────────────────────────

export const HEALTHCHECK_COMPOSE = `version: "3.9"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s    # grace period for app startup
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
`;

// ── Prometheus metrics (prom-client pattern) ──────────────────────────────────

export const PROMETHEUS_SETUP = `
// Install: npm install prom-client

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

const registry = new Registry();
collectDefaultMetrics({ register: registry });   // CPU, memory, GC, event loop

// HTTP request counter
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

// Request duration histogram
export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});

// Active connections gauge
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [registry],
});

// Fastify middleware to record metrics
export function metricsMiddleware(req: any, res: any, next: any) {
  const end = httpRequestDurationMs.startTimer({ method: req.method, route: req.routerPath });
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.routerPath, status_code: res.statusCode });
    end();
  });
  next();
}

// /metrics endpoint
export async function metricsHandler(req: any, reply: any) {
  reply.header('Content-Type', registry.contentType);
  return registry.metrics();
}
`;

// ── Prometheus + Grafana docker-compose ───────────────────────────────────────

export const MONITORING_COMPOSE = `version: "3.9"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.enable-lifecycle"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:
`;

export const PROMETHEUS_CONFIG = `# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

alerting:
  alertmanagers:
    - static_configs:
        - targets: []  # add alertmanager here

rule_files: []
`;

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Health Check & Monitoring Patterns ===\n");

  // Simulate a health check
  const health = await getHealth({
    database: async () => checkDatabaseHealth(async () => "ok"),
    redis: async () => checkRedisHealth(async () => "PONG"),
    disk: async () => checkDiskHealth(90),
  });

  console.log("Health response:", JSON.stringify(health, null, 2));
  console.log("\nDocker compose with health checks:");
  console.log(HEALTHCHECK_COMPOSE);
}

main();
