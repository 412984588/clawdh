# 08 — Notifications

Multi-channel notification system with type registry, per-user preferences, push tokens, and digests.

## Models

- **NotificationType** — notification catalog with templates
- **UserNotificationPreference** — per-user, per-type channel opt-in/out
- **Notification** — individual notification records with delivery status
- **PushToken** — FCM/APNs tokens per device
- **NotificationDigest** — scheduled digest configuration

## Key patterns

- `@@unique([userId, notificationTypeId])` — one preference row per type per user
- `channel` + `status` enums for multi-channel tracking
- `metadata Json` for flexible per-notification context
