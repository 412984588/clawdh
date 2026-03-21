# Real-Time Polling

Smart polling that auto-stops when a condition is met. Background-aware.

## Key Concepts
- `refetchInterval`: interval in ms, or a function returning ms/false
- Stop condition: return `false` from `refetchInterval` function to stop polling
- `refetchIntervalInBackground: false`: pauses when tab is hidden (saves API calls)
- `staleTime: 0`: ensures every refetch hits the server

## Use Cases
- Job/task status tracking
- Live dashboard metrics
- Order/payment status
- Import/export progress

## When to Use WebSockets Instead
Polling works well for intervals ≥2s or low-frequency updates. For sub-second updates or push-based notifications, prefer WebSockets/SSE.
