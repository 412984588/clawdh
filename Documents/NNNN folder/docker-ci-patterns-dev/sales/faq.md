# FAQ — Docker & CI Patterns for TypeScript

## Do I need Docker experience to use these?

Basic Docker knowledge helps (you should know what an image and container are), but the templates are heavily commented and each one has a `main()` function that prints output so you can see what they do immediately.

## Why TypeScript instead of plain Dockerfile/YAML files?

Because static files are hard to customize. These templates export string constants AND utility functions — so you can call `generateOptimizedDockerfile({ useDistroless: true })` instead of manually editing YAML. You get type safety and programmatic generation.

## Do these templates work with JavaScript projects too?

Yes. The Dockerfile and YAML patterns work for any Node.js project. The TypeScript helpers can be compiled or run with `ts-node`.

## Will these work with my existing project?

Yes. Each template is standalone — copy the relevant `example.ts` file into your project, rename it, and adapt the constants to your needs. There are no framework dependencies beyond what's documented.

## What Node.js version is targeted?

Node.js 20 (current LTS). All Dockerfiles use `node:20-alpine` by default, which you can change to any version.

## Do the GitHub Actions workflows work with private repositories?

Yes. Workflows reference `secrets.*` which you configure in your repository settings. The deploy workflows support multiple cloud providers (AWS ECS, Railway, Fly.io, Render).

## What's the difference between Starter and Pro?

**Starter ($19)** covers the core deployment workflow: writing a Dockerfile, setting up docker-compose, and deploying via GitHub Actions. Perfect if you're getting a project to production.

**Pro ($39)** adds the operational layer: secrets management, health monitoring with Prometheus/Grafana, a full microservice stack with message queuing, and Kubernetes basics. Ideal if you're scaling or running multiple services.

## Is there a refund policy?

Yes — 14-day no-questions refund if the templates don't work for you.

## Can I use these in commercial projects?

Yes. MIT license — use in client projects, SaaS products, anything.
