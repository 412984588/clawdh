# Docker & CI Patterns for TypeScript

Production-ready Docker and CI/CD patterns for TypeScript/Node.js projects — Dockerfiles, multi-stage builds, docker-compose stacks, GitHub Actions workflows, secrets management, health monitoring, and Kubernetes basics.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | dockerfile-node | Node.js Dockerfile basics, .dockerignore, build commands |
| 02 | multi-stage-build | Multi-stage Dockerfiles for Node/Prisma, Next.js, FastAPI |
| 03 | docker-compose | Basic, full-stack, and development compose configurations |
| 04 | github-actions-ci | CI workflows with services (PostgreSQL, Redis), matrix testing |
| 05 | github-actions-deploy | Deploy to AWS ECS, Railway, Fly.io, and Render |
| 06 | dockerfile-optimization | BuildKit caching, distroless images, layer order analysis |
| 07 | secrets-management | Docker secrets, .env validation, GitHub Actions secrets |
| 08 | health-monitoring | /health endpoints, Prometheus metrics, Grafana compose |
| 09 | multi-service-stack | Microservice compose with RabbitMQ, Redis, Elasticsearch |
| 10 | kubernetes-basics | Deployment, Service, Ingress, ConfigMap, HPA manifests |

## Tiers

- **Starter** ($19) — Templates 01–05: Dockerfile basics through deploy workflows
- **Pro** ($39) — All 10 templates including optimization, monitoring, and Kubernetes

## Quick Start

```bash
# Run any template
npx ts-node templates/01-dockerfile-node/example.ts

# Generate a Dockerfile
npx ts-node -e "
import { generateDockerfile } from './templates/01-dockerfile-node/example';
console.log(generateDockerfile({ useAlpine: true, exposePort: 3000 }));
"
```

## Key Patterns

### Layer Caching (BuildKit)
```dockerfile
# syntax=docker/dockerfile:1
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY src/ ./src/
```

### Multi-Stage Build
```dockerfile
FROM node:20-alpine AS deps
FROM node:20-alpine AS builder
FROM node:20-alpine AS production
```

### Health Check
```typescript
const health = await getHealth({
  database: async () => checkDatabaseHealth(db.query),
  redis:    async () => checkRedisHealth(redis.ping),
});
// Returns: { status: 'ok', components: {...} }
```

### GitHub Actions CI
```yaml
services:
  postgres:
    image: postgres:16-alpine
    options: --health-cmd pg_isready
```

## Requirements

- Node.js 18+
- Docker / Docker Compose
- TypeScript 5+

## License

MIT
