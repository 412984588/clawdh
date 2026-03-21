# 06 — Component Testing

React Testing Library + Vitest patterns: queries, userEvent, async rendering, context providers.

## Patterns shown

- Query hierarchy: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- `userEvent` vs `fireEvent` trade-offs
- `waitFor` for async state updates
- `vi.mock` for hooks at module level
- `renderWithProviders` wrapper pattern for context
- Form interaction with `userEvent.type`/`click`

## Setup required

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

`vitest.config.ts`:
```ts
export default { test: { environment: 'jsdom', setupFiles: './vitest.setup.ts' } }
```

## Run

```bash
npx vitest run example.test.ts
```
