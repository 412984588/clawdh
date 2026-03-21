import { describe, it, expect, vi } from "vitest";
// Requires: @testing-library/react, @testing-library/user-event, jsdom
// vitest.config.ts needs: environment: 'jsdom'

// ─── Component under test (inline for self-containment) ───────────────────────
// In a real project this would be: import { Counter } from './Counter'

// Minimal DOM-compatible React component mock for pattern demonstration
// Replace with actual @testing-library/react imports in your project:
//
//   import { render, screen, fireEvent } from '@testing-library/react'
//   import userEvent from '@testing-library/user-event'
//   import { Counter } from './Counter'

// ─── Pattern A: render + getByText + fireEvent ────────────────────────────────

describe("Counter component — render patterns", () => {
  it("demonstrates getByRole query (button)", () => {
    // Example showing the query hierarchy for accessible selectors:
    // Prefer: getByRole > getByLabelText > getByPlaceholderText > getByText
    const queries = [
      "getByRole('button', { name: /increment/i })",
      "getByRole('heading', { level: 1 })",
      "getByLabelText('Email address')",
      "getByPlaceholderText('Search...')",
      "getByTestId('submit-btn')",
    ];
    // All of these are valid RTL queries — choose the most accessible one
    expect(queries.length).toBe(5);
  });

  it("demonstrates userEvent vs fireEvent trade-offs", () => {
    // userEvent simulates real browser events (keydown, keyup, keypress)
    // fireEvent dispatches synthetic events directly
    //
    // userEvent.click(button)           — preferred for clicks
    // userEvent.type(input, 'hello')    — preferred for typing
    // fireEvent.change(input, { target: { value: 'x' } }) — useful for controlled inputs
    expect(true).toBe(true);
  });
});

// ─── Pattern B: async rendering ───────────────────────────────────────────────

describe("Async component patterns", () => {
  it("waitFor pattern for async state updates", async () => {
    // Usage in real test:
    //   const { getByText } = render(<AsyncComponent />)
    //   await waitFor(() => expect(getByText('Loaded')).toBeInTheDocument())
    //
    // waitFor retries until assertion passes or timeout (default 1000ms)
    const waitFor = async (fn: () => void, opts = { timeout: 1000 }) => {
      const start = Date.now();
      while (true) {
        try {
          fn();
          return;
        } catch (err) {
          if (Date.now() - start > opts.timeout) throw err;
          await new Promise((r) => setTimeout(r, 50));
        }
      }
    };

    let resolved = false;
    setTimeout(() => (resolved = true), 10);
    await waitFor(() => expect(resolved).toBe(true));
  });
});

// ─── Pattern C: mocking hooks and context ────────────────────────────────────

describe("Hook and context mocking patterns", () => {
  it("vi.mock module-level mock example", () => {
    // In a real test file, place vi.mock at TOP LEVEL (hoisted):
    //
    //   vi.mock('../hooks/useAuth', () => ({
    //     useAuth: vi.fn().mockReturnValue({
    //       user: { id: '1', name: 'Alice' },
    //       isLoading: false,
    //       logout: vi.fn(),
    //     })
    //   }))
    //
    // Then in the test:
    //   render(<ProfilePage />)
    //   expect(screen.getByText('Alice')).toBeInTheDocument()

    const mockUseAuth = vi.fn().mockReturnValue({
      user: { id: "1", name: "Alice" },
      isLoading: false,
    });

    const result = mockUseAuth();
    expect(result.user.name).toBe("Alice");
    expect(result.isLoading).toBe(false);
  });

  it("wrapping with context providers", () => {
    // Pattern for components requiring context:
    //
    //   function renderWithProviders(ui: ReactElement) {
    //     return render(
    //       <QueryClientProvider client={queryClient}>
    //         <ThemeProvider theme={lightTheme}>
    //           {ui}
    //         </ThemeProvider>
    //       </QueryClientProvider>
    //     )
    //   }
    //
    //   renderWithProviders(<MyComponent />)

    const renderWithProviders = (component: string) => `<Providers>${component}</Providers>`;
    expect(renderWithProviders("<MyComponent />")).toContain("MyComponent");
  });
});

// ─── Pattern D: form interaction ─────────────────────────────────────────────

describe("Form interaction patterns", () => {
  it("demonstrates controlled form testing approach", async () => {
    // Full example for a login form:
    //
    //   const user = userEvent.setup()
    //   render(<LoginForm onSubmit={handleSubmit} />)
    //
    //   await user.type(screen.getByLabelText('Email'), 'test@example.com')
    //   await user.type(screen.getByLabelText('Password'), 'secret')
    //   await user.click(screen.getByRole('button', { name: /login/i }))
    //
    //   expect(handleSubmit).toHaveBeenCalledWith({
    //     email: 'test@example.com',
    //     password: 'secret',
    //   })

    const handleSubmit = vi.fn();
    // Simulating the submit call
    handleSubmit({ email: "test@example.com", password: "secret" });

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "secret",
    });
  });
});
