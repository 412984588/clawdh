# OpenAPI Spec Templates

**10 production-ready OpenAPI 3.1 specs. Start documenting APIs immediately.**

## What's Included

| # | Template | Endpoints |
|---|----------|-----------|
| 01 | REST CRUD | List, create, get, update, delete + pagination |
| 02 | Auth API | Register, login, refresh, forgot/reset password |
| 03 | E-commerce | Products, cart, orders, checkout |
| 04 | File Upload | Multipart upload, presigned URLs, file management |
| 05 | Payment API | Stripe-compatible payments, subscriptions, invoices |
| 06 | Social API | Posts, likes, comments, follows, feed |
| 07 | Search API | Full-text search, autocomplete, facets |
| 08 | Webhook API | Endpoint management, delivery logs, test events |
| 09 | Admin API | User management, feature flags, audit logs |
| 10 | Multi-Tenant | Organizations, members, roles, invitations |

## Tiers

| Tier | Templates | Price |
|------|-----------|-------|
| Starter | 01–04 | $19 |
| Pro | All 10 | $39 |

## Usage

```bash
# Validate
npx @redocly/cli lint openapi.yaml
# Preview docs
npx @redocly/cli preview-docs openapi.yaml
# Generate TypeScript types
npx openapi-typescript openapi.yaml -o types.ts
# Generate client SDK
npx @openapitools/openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o ./client
```

## License

One-time purchase. Unlimited personal and commercial projects. MIT licensed.
