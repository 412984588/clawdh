# Verify Email

Sent after signup to confirm the user's email address. Includes both an OTP code and a verification link.

## Props

| Prop | Type | Default |
|------|------|---------|
| `name` | string | `"User"` |
| `verifyUrl` | string | `"https://example.com/verify"` |
| `otp` | string | `"123456"` |

## Usage

```tsx
import VerifyEmail from "./verify-email";
<VerifyEmail name="Alice" otp="847291" verifyUrl="https://app.example.com/verify?token=abc" />
```
