# 10 — API Versioning

URL path versioning, request header versioning, deprecation notices, and multi-version routing.

## Patterns

- `createVersionedRouter(version)` — adds X-API-Version header and deprecation notices
- `headerVersionMiddleware` — Accept-Version / X-API-Version header routing
- `deprecationMiddleware` — Deprecation, Sunset, and Link headers per RFC 8594
- `versionDispatcher` — route single endpoint to different version handlers
- V1/V2 handler separation — clean migration path between versions
- `/api/versions` info endpoint — document supported and deprecated versions
