# Analytics Schema

Web analytics schema for page views, events, sessions, and aggregated metrics.

## Tables
- `page_views` — individual page view records with geo and device info
- `events` — custom event tracking (clicks, form submits, purchases)
- `analytics_sessions` — session tracking with UTM parameters and funnel data
- `daily_metrics` — pre-aggregated daily stats for fast dashboard queries

## Performance Tips
- Index `site_id + timestamp` on page_views and events
- Use `daily_metrics` for dashboard queries instead of aggregating page_views in real time
- Partition `page_views` by month for large datasets
