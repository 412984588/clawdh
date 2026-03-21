# Gumroad Listing — Docker & CI Patterns for TypeScript

## Title
Docker & CI Patterns for TypeScript — 10 Production-Ready Templates

## Summary (shown in card)
Stop Googling Docker snippets. 10 copy-paste patterns: multi-stage builds, GitHub Actions CI/CD, health checks, Kubernetes basics.

## Description (full)
Every TypeScript project needs a Dockerfile. Most end up with a 1-stage image that's 1GB, no health checks, and CI that breaks when you add a service dependency.

This pack fixes that with 10 production patterns you can drop straight into your project:

**Starter ($19) — Templates 01-05:**
- Node.js Dockerfile with correct `.dockerignore` and build helpers
- Multi-stage builds (Node/Prisma, Next.js, FastAPI) — shrink your image from 1GB to 150MB
- Docker Compose (basic + full-stack + dev hot-reload)
- GitHub Actions CI with PostgreSQL + Redis service containers
- Deploy to AWS ECS / Railway / Fly.io / Render

**Pro ($39) — All 10 templates:**
Everything in Starter, plus:
- BuildKit caching (`--mount=type=cache`) + distroless images + caching analysis tool
- Secrets management — Docker secrets, `.env` validation, GitHub OIDC
- Health endpoints + Prometheus metrics + Grafana monitoring stack
- Full microservice docker-compose (RabbitMQ, Elasticsearch, Traefik)
- Kubernetes manifests: Deployment, Service, Ingress, HPA, PVC

All templates are TypeScript files — not just static text files. They export string constants and utility functions so you can generate and customize configs programmatically.

## Price
- Starter: $19
- Pro: $39

## Tags
docker, typescript, nodejs, github-actions, kubernetes, devops, ci-cd, dockerfile
