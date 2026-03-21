# Reset Password

Sent when a user requests a password reset.

## Props

| Prop | Type | Default |
|------|------|---------|
| `name` | string | `"User"` |
| `resetUrl` | string | `"https://example.com/reset"` |
| `expiresInHours` | number | `1` |

## Usage

```tsx
import ResetPassword from "./reset-password";
<ResetPassword name="Alice" resetUrl="https://app.example.com/reset?token=xyz" expiresInHours={2} />
```
