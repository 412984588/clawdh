# Framework Selection Guide

This guide helps buyers choose the right Cursor rule pack before copying a
`.cursorrules` file into a project.

## Choose by Project Type

### Shipping a web product

- Use `nextjs` for App Router projects with server components and modern SEO.
- Use `nextjs-supabase` when auth, database, and RLS are core to the stack.
- Use `react-typescript` for SPA products built with Vite and client-side state.
- Use `vue-nuxt` for Nuxt SSR and content-heavy Vue applications.
- Use `svelte-sveltekit` for lean full-stack apps with SvelteKit routing.

### Building a backend or API

- Use `fastapi-python` for async Python APIs, typed validation, and SQLAlchemy.
- Use `django-python` for admin-heavy products and mature backend workflows.
- Use `nodejs-express` for TypeScript Node services and REST-first delivery.
- Use `golang` for throughput-sensitive services and clean architecture teams.

### Productized specialist stacks

- Use `chrome-extension-mv3` for browser extensions with service workers.
- Use `tauri-rust` for lightweight desktop apps with Rust-backed commands.
- Use `flutter-dart` for cross-platform mobile or tablet applications.
- Use `ios-swiftui` for Apple-native apps built around SwiftUI and SwiftData.
- Use `unity-csharp` for game tooling, interactions, and runtime object patterns.
- Use `solidity-smart-contracts` for EVM contracts, audits, and deployment hygiene.
- Use `ai-python-ml` for model training, notebooks, inference, and LLM pipelines.
- Use `data-science-jupyter` for notebook-driven experimentation and reporting.
- Use `landing-page-tailwind` for marketing pages focused on SEO and conversion.
- Use `saas-nextjs-stripe` for subscription SaaS with billing and webhook flows.
- Use `monorepo-turborepo` when multiple apps/packages share infra and release flow.

## Choose by Team Shape

- Solo founder or small product team: `nextjs`, `saas-nextjs-stripe`, `fastapi-python`
- Agency delivering many client sites: `landing-page-tailwind`, `nextjs`, `react-typescript`
- Startup platform team: `monorepo-turborepo`, `nextjs-supabase`, `nodejs-express`
- ML or AI team: `ai-python-ml`, `data-science-jupyter`, `fastapi-python`

## Choose by Constraint

- Need the least setup friction: `react-typescript`, `golang`, `fastapi-python`
- Need strongest UI conventions: `nextjs`, `vue-nuxt`, `ios-swiftui`
- Need performance discipline: `golang`, `tauri-rust`, `svelte-sveltekit`
- Need revenue stack patterns: `saas-nextjs-stripe`, `nextjs-supabase`

## Recommended Buying Path

- Starter: choose if you want the 10 highest-demand frameworks only.
- Pro: choose if you work across multiple client or product stacks.
- Complete: choose if you want the rules plus this guide and rule customization docs.
