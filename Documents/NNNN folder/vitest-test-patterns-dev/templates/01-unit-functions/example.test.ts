import { describe, it, expect } from "vitest";

// ─── Functions under test ────────────────────────────────────────────────────

function add(a: number, b: number): number {
  return a + b;
}

function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("add", () => {
  it("returns the sum of two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("returns the first number when second is zero", () => {
    expect(add(7, 0)).toBe(7);
  });
});

describe("divide", () => {
  it("returns correct quotient", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("handles decimal results", () => {
    expect(divide(1, 3)).toBeCloseTo(0.333, 3);
  });

  it("throws on division by zero", () => {
    expect(() => divide(5, 0)).toThrow("Division by zero");
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to min when below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to max when above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("lowercases the rest", () => {
    expect(capitalize("hELLO")).toBe("Hello");
  });

  it("returns empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("unique", () => {
  it("removes duplicate numbers", () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it("removes duplicate strings", () => {
    expect(unique(["a", "b", "a"])).toEqual(["a", "b"]);
  });

  it("returns same array if no duplicates", () => {
    expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("handles empty array", () => {
    expect(unique([])).toEqual([]);
  });
});
