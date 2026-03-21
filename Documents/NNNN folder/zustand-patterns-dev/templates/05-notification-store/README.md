# Notification Store

In-app notification queue with read/unread state and async fetch.

## Features
- Unread count badge support
- Mark individual or all as read
- Fetch from API on mount
- Action URL support for notification CTAs

## Usage

```tsx
const { addNotification, unreadCount } = useNotificationStore();

addNotification({
  type: "success",
  title: "File uploaded",
  message: "report.pdf has been uploaded successfully",
  actionLabel: "View file",
  actionUrl: "/files/report.pdf",
});
```
