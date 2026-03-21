# Changelog

## [1.0.0] - 2024-01-01

### Added
- 10 Stripe webhook handler templates (TypeScript)
- Starter tier (5 handlers, $19): payment-intent-succeeded/failed, subscription-created/updated/deleted
- Pro tier (10 handlers, $39): all Starter + invoice-paid, invoice-payment-failed, trial-ending, checkout-session-completed, webhook-router
- Dependency injection pattern for testability
- Idempotency guidance in every README
