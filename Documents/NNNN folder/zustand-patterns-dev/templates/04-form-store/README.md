# Form Store

Multi-step form state with per-step validation, error tracking, and navigation.

## Features
- Step validation before advancing
- Field-level error tracking
- Progress percentage selector
- Reset to initial state
- Submitting state management

## Usage

```tsx
const { data, setField, nextStep, errors } = useOnboardingFormStore();

// Set a field
setField("email", "alice@example.com");

// Try to advance (validates current step first)
const ok = nextStep();
if (!ok) console.log("Step not valid yet");

// Progress bar
const progress = useOnboardingFormStore(selectProgress);
```

## Adapting for Your Form
Replace `OnboardingFormData` and `onboardingSteps` with your form shape and validation logic.
