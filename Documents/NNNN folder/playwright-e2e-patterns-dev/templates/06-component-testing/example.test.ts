/**
 * Playwright Component Testing (CT)
 * Demonstrates: @playwright/experimental-ct-react, mount, props, events, slots
 */
import { test, expect } from "@playwright/experimental-ct-react";
import React from "react";

// ── Component stubs (inline for template) ────────────────────────────────────
// In real projects: import from your component library

function Button({ children, onClick, disabled, variant = "primary" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-testid="button"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

function Counter({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = React.useState(initialCount);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((c) => c - 1)} data-testid="decrement">-</button>
      <button onClick={() => setCount((c) => c + 1)} data-testid="increment">+</button>
      <button onClick={() => setCount(0)} data-testid="reset">Reset</button>
    </div>
  );
}

function Modal({ isOpen, title, children, onClose }: {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">{title}</h2>
      <div>{children}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// ── Button component tests ────────────────────────────────────────────────────

test.describe("Button component", () => {
  test("renders with text", async ({ mount }) => {
    const component = await mount(<Button>Click me</Button>);
    await expect(component).toContainText("Click me");
  });

  test("calls onClick when clicked", async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <Button onClick={() => { clicked = true; }}>Click</Button>
    );
    await component.click();
    expect(clicked).toBe(true);
  });

  test("is disabled when disabled prop is set", async ({ mount }) => {
    const component = await mount(<Button disabled>Disabled</Button>);
    await expect(component.getByRole("button")).toBeDisabled();
  });

  test("renders danger variant", async ({ mount }) => {
    const component = await mount(<Button variant="danger">Delete</Button>);
    await expect(component.getByTestId("button")).toHaveAttribute("data-variant", "danger");
  });
});

// ── Counter component tests ───────────────────────────────────────────────────

test.describe("Counter component", () => {
  test("renders initial count", async ({ mount }) => {
    const component = await mount(<Counter initialCount={5} />);
    await expect(component.getByTestId("count")).toHaveText("5");
  });

  test("increments count", async ({ mount }) => {
    const component = await mount(<Counter />);
    await component.getByTestId("increment").click();
    await expect(component.getByTestId("count")).toHaveText("1");
  });

  test("decrements count", async ({ mount }) => {
    const component = await mount(<Counter initialCount={3} />);
    await component.getByTestId("decrement").click();
    await expect(component.getByTestId("count")).toHaveText("2");
  });

  test("resets count to 0", async ({ mount }) => {
    const component = await mount(<Counter initialCount={10} />);
    await component.getByTestId("reset").click();
    await expect(component.getByTestId("count")).toHaveText("0");
  });

  test("multiple interactions", async ({ mount }) => {
    const component = await mount(<Counter initialCount={0} />);
    await component.getByTestId("increment").click();
    await component.getByTestId("increment").click();
    await component.getByTestId("increment").click();
    await component.getByTestId("decrement").click();
    await expect(component.getByTestId("count")).toHaveText("2");
  });
});

// ── Modal component tests ─────────────────────────────────────────────────────

test.describe("Modal component", () => {
  test("is not visible when closed", async ({ mount }) => {
    const component = await mount(
      <Modal isOpen={false} title="Test" onClose={() => {}}>Content</Modal>
    );
    await expect(component.getByRole("dialog")).not.toBeVisible();
  });

  test("is visible when open", async ({ mount }) => {
    const component = await mount(
      <Modal isOpen={true} title="My Modal" onClose={() => {}}>Modal body</Modal>
    );
    await expect(component.getByRole("dialog")).toBeVisible();
    await expect(component.getByText("My Modal")).toBeVisible();
    await expect(component.getByText("Modal body")).toBeVisible();
  });

  test("calls onClose when close button clicked", async ({ mount }) => {
    let closed = false;
    const component = await mount(
      <Modal isOpen={true} title="Close Test" onClose={() => { closed = true; }}>
        Content
      </Modal>
    );
    await component.getByRole("button", { name: "Close" }).click();
    expect(closed).toBe(true);
  });

  test("has correct accessibility attributes", async ({ mount }) => {
    const component = await mount(
      <Modal isOpen={true} title="Accessible Modal" onClose={() => {}}>
        Body content
      </Modal>
    );
    const dialog = component.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
