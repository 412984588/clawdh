# Notifications Schema

Multi-channel notification system with user preferences.

## Tables
- `notification_types` — notification categories (new_comment, payment_due, etc.)
- `user_notification_preferences` — per-user, per-type channel preferences
- `notifications` — notification records with read state
- `push_tokens` — device push tokens (FCM/APNs)

## Channels
Supports: `in_app`, `email`, `push`, `sms`

## Features
- Per-type user preference control
- Read tracking with `readAt` timestamp
- Multi-device push token support
- Extensible JSON `data` field for context payload
