-- Migration: Add payment retry fields to tickets table
-- Created: 2026-03-21

-- Add retry tracking fields
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_next_retry_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_last_error TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;

-- Create index for cron job to efficiently find retryable payments
CREATE INDEX IF NOT EXISTS idx_tickets_payment_retry 
  ON tickets(status, payment_next_retry_at) 
  WHERE status = 'invoiced' AND payment_retry_count > 0;

-- Create index for finding tickets in final failed state
CREATE INDEX IF NOT EXISTS idx_tickets_payment_failed_final
  ON tickets(status, payment_failed_at)
  WHERE payment_retry_count >= 3;
