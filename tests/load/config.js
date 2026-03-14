/**
 * Load Testing Configuration for Voice Hub
 *
 * This file defines the base configuration, SLAs, and thresholds for load tests.
 */

export const CONFIG = {
  // Default target - can be overridden via environment variables
  baseUrl: __ENV.BASE_URL || "http://localhost:8911",
  backendUrl: __ENV.BACKEND_URL || "http://localhost:8000",

  // Default durations
  shortDuration: "30s",
  mediumDuration: "2m",
  longDuration: "5m",

  // Virtual user presets
  vus: {
    light: 10,
    moderate: 50,
    heavy: 200,
    stress: 500,
  },

  // Timeouts (ms)
  timeouts: {
    http: 5000,
    websocket: 10000,
    webhook: 3000,
  },
};

/**
 * Performance SLAs (Service Level Agreements)
 *
 * These define acceptable performance thresholds for different endpoint categories.
 */
export const SLAS = {
  // Health endpoints - must be very fast
  health: {
    p95: 50, // 95th percentile under 50ms
    p99: 100, // 99th percentile under 100ms
    max: 200, // No request should exceed 200ms
  },

  // Read operations - moderate performance
  read: {
    p95: 200,
    p99: 500,
    max: 1000,
  },

  // Write operations - can be slower
  write: {
    p95: 500,
    p99: 1000,
    max: 2000,
  },

  // Audio processing - higher latency acceptable
  audio: {
    p95: 1000,
    p99: 2000,
    max: 5000,
  },

  // Webhook processing - must be fast for async handling
  webhook: {
    p95: 300,
    p99: 500,
    max: 1000,
  },

  // WebSocket - connection establishment
  websocket: {
    connect: 500,
    message: 100,
  },

  // Error rate thresholds
  errorRate: {
    acceptable: 0.01, // < 1% errors acceptable
    warning: 0.05, // 1-5% warnings
    critical: 0.1, // > 10% critical
  },
};

/**
 * Convert SLA to k6 threshold format
 */
export function thresholdsFromSla(sla, prefix = "http_req_duration") {
  return {
    [`${prefix}`]: [`p(95)<${sla.p95}`, `p(99)<${sla.p99}`],
    [`${prefix}`]: [`max<${sla.max}`],
  };
}

/**
 * Generate k6 thresholds for a scenario
 */
export function generateThresholds(category) {
  const sla = SLAS[category] || SLAS.read;
  return {
    http_req_duration: [`p(95)<${sla.p95}`, `p(99)<${sla.p99}`],
    http_req_failed: [`rate<${SLAS.errorRate.acceptable}`],
    iterations: [`count > 0`], // Ensure at least some iterations completed
  };
}

/**
 * Test data generators
 */
export const testData = {
  // Generate a random session ID
  sessionId: () =>
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Generate random user ID
  userId: () => `user-${Math.random().toString(36).substr(2, 9)}`,

  // Generate random channel ID
  channelId: () => `channel-${Math.random().toString(36).substr(2, 9)}`,

  // Generate sample audio base64 (1KB of silence)
  audioBase64: () => Buffer.alloc(1024, 0).toString("base64"),

  // Generate sample text for TTS
  ttsText: () => `Test message ${Math.random().toString(36).substr(2, 9)}`,

  // Generate webhook payload
  webhookPayload: (eventId = null) => ({
    id:
      eventId || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    event: "custom.notification",
    timestamp: Date.now(),
    data: {
      text: "Load test notification",
    },
  }),
};

/**
 * Check functions for k6
 */
export const checks = {
  health: (res) => ({
    "status is 200": () => res.status === 200,
    "has status field": () => res.json("status") !== undefined,
    "has timestamp": () => res.json("timestamp") !== undefined,
  }),

  session: (res) => ({
    "status is 200 or 201": () => [200, 201].includes(res.status),
    "has sessionId": () => res.json("sessionId") !== undefined,
  }),

  success: (res) => ({
    "status is 2xx": () => res.status >= 200 && res.status < 300,
  }),

  webhook: (res) => ({
    "status is 202 or 200": () => [200, 202].includes(res.status),
    "has success field": () => res.json("success") === true,
  }),
};

export default { CONFIG, SLAS, testData, checks, generateThresholds };
