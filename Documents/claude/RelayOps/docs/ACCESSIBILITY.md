# Accessibility Review

Last updated: 2026-03-21

## Scope

This pass focuses on WCAG 2.1 AA improvements without changing product logic or route structure.

## Checklist

- Semantic structure
  - Public and auth layouts expose a skip link and a `main#main-content` landmark.
  - Primary navigation is labeled with `aria-label="Primary"`.
- Forms
  - Required fields expose `aria-required="true"`.
  - Validation and server errors are connected with `aria-describedby`.
  - Error regions announce with `role="alert"` and `aria-live`.
- Keyboard support
  - Primary navigation, footer links, locale switcher, and account controls expose visible focus styles.
  - Skip links are keyboard reachable from the first tab stop.
- Color contrast
  - Primary action tokens were darkened to meet AA contrast with white text.
  - Admin dashboard helper text was adjusted where axe reported contrast failures.
- Icons and notifications
  - Decorative icons in shared navigation, dialogs, toasts, and key CTAs use `aria-hidden="true"`.
  - Toasts announce with `role="status"`/`role="alert"` and `aria-live`.

## Verification

- Component and layout tests cover:
  - skip links and main landmarks
  - partner application field labeling and error wiring
  - login form error semantics
  - toast live-region behavior
- Playwright accessibility coverage includes:
  - public homepage
  - login page
  - admin dashboard
  - partner new-ticket wizard
  - partner ticket detail
  - worker assignments

## Current Status

- Shared public and auth shells: compliant for skip navigation, landmarks, and focus visibility.
- High-traffic forms: compliant for labels, required state, and error announcements.
- Toast notifications: compliant for polite/assertive live-region announcements.
- Remaining work should be treated as regression prevention:
  - keep new icons decorative by default unless they carry standalone meaning
  - preserve contrast when introducing new brand color variants
  - rerun the targeted a11y Playwright suite when marketing or dashboard UI changes
