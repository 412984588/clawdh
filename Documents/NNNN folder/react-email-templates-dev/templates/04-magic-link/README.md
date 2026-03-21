# Magic Link

Passwordless sign-in email. One-time use with expiry.

## Props

| Prop | Type | Default |
|------|------|---------|
| `email` | string | `"user@example.com"` |
| `magicUrl` | string | `"https://example.com/auth/magic"` |
| `expiresInMinutes` | number | `15` |

## Usage

```tsx
import MagicLink from "./magic-link";
<MagicLink email="alice@example.com" magicUrl="https://app.example.com/auth?token=abc123" expiresInMinutes={15} />
```
