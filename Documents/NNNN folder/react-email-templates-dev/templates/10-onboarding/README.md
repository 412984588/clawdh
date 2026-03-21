# Onboarding Email

Multi-step onboarding guide sent a few days after signup. Helps users activate key features.

## Props

| Prop | Type | Default |
|------|------|---------|
| `name` | string | `"User"` |
| `appName` | string | `"AppName"` |
| `steps` | `OnboardingStep[]` | 3 default steps |
| `getStartedUrl` | string | `"https://example.com/dashboard"` |

## Usage

```tsx
import OnboardingEmail from "./onboarding";
<OnboardingEmail
  name="Alice"
  appName="Acme"
  steps={[
    { number: 1, title: "Set up your workspace", description: "Create your first project." },
    { number: 2, title: "Add team members", description: "Invite colleagues to collaborate." },
  ]}
  getStartedUrl="https://app.acme.com"
/>
```
