# 10 — Layout Patterns

Nested layouts, route groups `(folder)`, `template.tsx`, and shared UI patterns.

## Patterns

- Root layout — `<html><body>` with global providers
- Route groups `(marketing)` / `(app)` — share layouts without affecting URLs
- Nested layouts — dashboard with sidebar + per-section sub-navigation
- `template.tsx` vs `layout.tsx` — remount on navigation for animations
- Multiple root layouts — checkout flow with minimal chrome
- `PageContainer` — reusable max-width wrapper with page headers
- Settings layout — tabbed sub-navigation pattern
