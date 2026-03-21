# 06 — Analytics

Page view tracking, event capture, session management, and daily aggregated metrics.

## Models

- **AnalyticsSession** — visitor sessions with UTM params, device info
- **PageView** — per-page view with time-on-page
- **Event** — custom event tracking with arbitrary JSON properties
- **DailyMetric** — pre-aggregated daily rollups for fast dashboard queries
- **GoalConversion** — conversion tracking

## Key patterns

- `@db.Date` for date-only fields (avoids timezone issues)
- Separate raw events + pre-aggregated `DailyMetric` pattern
- `@@unique([date, metric, dimension])` enables upsert for aggregation
