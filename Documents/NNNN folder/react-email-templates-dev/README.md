# React Email Templates Pack

**10 production-ready transactional email templates built with [React Email](https://react.email). Drop-in ready. TypeScript. Two tiers.**

## Pricing

| Tier | Templates | Price |
|------|-----------|-------|
| Starter | 5 templates (auth + billing basics) | $19 |
| Pro | 10 templates (full lifecycle) | $39 |

## Templates

### Starter ($19) — 5 templates
| # | Template | Use Case |
|---|----------|----------|
| 01 | Welcome | New user onboarding |
| 02 | Verify Email | Email confirmation with OTP |
| 03 | Reset Password | Forgot password flow |
| 04 | Magic Link | Passwordless sign-in |
| 05 | Invoice | Payment receipt with line items |

### Pro ($39) — All 10 templates
Includes all Starter templates plus:

| # | Template | Use Case |
|---|----------|----------|
| 06 | Subscription Started | New paid subscription confirmation |
| 07 | Subscription Cancelled | Cancellation with retention CTA |
| 08 | Team Invitation | Invite collaborators to a workspace |
| 09 | Payment Failed | Dunning email with update payment CTA |
| 10 | Onboarding | Multi-step activation sequence |

## Quick Start

```bash
npm install @react-email/components react react-dom
```

```tsx
import WelcomeEmail from "./templates/01-welcome/welcome";
import { render } from "@react-email/render";

const html = render(<WelcomeEmail name="Alice" loginUrl="https://app.example.com" />);
// send html via your email provider (Resend, SendGrid, Postmark, etc.)
```

## Works With

- [Resend](https://resend.com) — `resend.emails.send({ html })`
- [Nodemailer](https://nodemailer.com)
- [SendGrid](https://sendgrid.com)
- [Postmark](https://postmarkapp.com)
- [AWS SES](https://aws.amazon.com/ses/)

## License

One-time purchase. Use on unlimited personal and commercial projects.
