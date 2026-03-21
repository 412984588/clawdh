# Docker & CI Patterns for TypeScript — Product Listing

## Tagline
Production-ready Docker and CI/CD patterns — copy-paste into your TypeScript project and deploy with confidence.

## Description
Stop Googling the same Docker and GitHub Actions snippets every project. This pack gives you 10 battle-tested templates covering everything from a single Dockerfile to a full Kubernetes deployment — all written as TypeScript utilities so you can generate and customize configurations programmatically.

### What you get:
- **Multi-stage Dockerfiles** for Node/TypeScript, Next.js, Prisma, and FastAPI — optimized for production image size
- **BuildKit caching** — `--mount=type=cache` for npm, making rebuilds 5× faster
- **Docker Compose stacks** — basic (Node+PostgreSQL), full-stack (+ Redis + nginx), development (hot reload)
- **GitHub Actions CI** — with PostgreSQL and Redis service containers, coverage upload, matrix testing
- **Deploy workflows** — AWS ECS, Railway, Fly.io, and Render, ready to drop in
- **Secrets management** — Docker secrets, .env validation, GitHub Actions OIDC patterns
- **Health monitoring** — /health endpoints + Prometheus metrics + Grafana compose
- **Multi-service stack** — nginx + API + worker + PostgreSQL + Redis + RabbitMQ + Elasticsearch
- **Kubernetes** — Deployment, Service, Ingress, ConfigMap, Secret, HPA manifests

## Tiers
- **Starter** ($19) — Templates 01–05: Dockerfile → GitHub Actions deploy
- **Pro** ($39) — All 10 templates including secrets, monitoring, and Kubernetes

## Target audience
TypeScript/Node.js developers deploying to Docker, GitHub Actions, and Kubernetes who want production patterns without starting from scratch.
