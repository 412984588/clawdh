# itch.io Listing — Docker & CI Patterns for TypeScript

## Title
Docker & CI Patterns for TypeScript

## Short description (blurb, ~280 chars)
10 production-ready Docker & CI/CD patterns for TypeScript. Multi-stage builds, GitHub Actions, Kubernetes, health checks. Copy-paste into your next project and ship faster.

## Description
**Stop reinventing your deployment stack.**

Every TypeScript project eventually needs Docker. Most developers spend hours figuring out multi-stage builds, GitHub Actions services, and health check syntax. This pack has already done that work.

**10 templates. Real TypeScript utilities. Production patterns.**

Templates export string constants (Dockerfile content, YAML workflows, Kubernetes manifests) plus helper functions for programmatic generation and analysis.

---

### Starter — $19
- `01-dockerfile-node` — Optimized Node.js Dockerfiles + .dockerignore
- `02-multi-stage-build` — Slim production images for Node, Next.js, Prisma, FastAPI
- `03-docker-compose` — Dev, staging, and production compose stacks
- `04-github-actions-ci` — CI with real PostgreSQL/Redis, matrix testing, codecov
- `05-github-actions-deploy` — Deploy to ECS, Railway, Fly.io, Render

### Pro — $39 (all 10 templates)
Everything above, plus:
- `06-dockerfile-optimization` — BuildKit cache mounts, distroless, caching analyzer
- `07-secrets-management` — Docker secrets, .env validation, GitHub OIDC auth
- `08-health-monitoring` — /health endpoints, Prometheus + Grafana stack
- `09-multi-service-stack` — Microservice compose with RabbitMQ, Elasticsearch, Traefik
- `10-kubernetes-basics` — Deployment, Service, Ingress, ConfigMap, Secret, HPA

---

**Requirements:** Node.js 18+, Docker, TypeScript 5+

**License:** MIT — use in commercial projects, modify freely
