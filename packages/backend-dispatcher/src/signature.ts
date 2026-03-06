import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookPayload } from "@voice-hub/shared-types";

export const DEFAULT_WEBHOOK_MAX_SKEW_MS = 5 * 60 * 1000;

function buildSigningMessage(
  payload: WebhookPayload,
  timestamp: string,
): string {
  return `${timestamp}.${JSON.stringify(payload)}`;
}

function buildSigningMessageFromRawBody(
  rawBody: string,
  timestamp: string,
): string {
  return `${timestamp}.${rawBody}`;
}

export function signWebhookPayload(
  payload: WebhookPayload,
  secret: string,
  timestamp: string,
): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(buildSigningMessage(payload, timestamp));
  return `sha256=${hmac.digest("hex")}`;
}

export function verifyWebhookSignature(
  payload: WebhookPayload,
  secret: string,
  signature: string,
  timestamp: string,
): boolean {
  return verifyWebhookSignatureMessage(
    JSON.stringify(payload),
    secret,
    signature,
    timestamp,
  );
}

export function verifyWebhookSignatureMessage(
  rawBody: string,
  secret: string,
  signature: string,
  timestamp: string,
): boolean {
  if (!signature.startsWith("sha256=")) {
    return false;
  }

  const hmac = createHmac("sha256", secret);
  hmac.update(buildSigningMessageFromRawBody(rawBody, timestamp));
  const expected = `sha256=${hmac.digest("hex")}`;
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function isWebhookTimestampFresh(
  timestamp: string,
  now = Date.now(),
  maxSkewMs = DEFAULT_WEBHOOK_MAX_SKEW_MS,
): boolean {
  const parsed = Number(timestamp);

  if (!Number.isFinite(parsed)) {
    return false;
  }

  return Math.abs(now - parsed) <= maxSkewMs;
}
