import { describe, it, expect } from "vitest";

// ─── Functions under test ─────────────────────────────────────────────────────

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type PasswordStrength = "weak" | "fair" | "strong" | "very-strong";

function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "strong";
  return "very-strong";
}

// ─── Tests: test.each ─────────────────────────────────────────────────────────

describe("isPrime — test.each with inline table", () => {
  it.each([
    [2, true],
    [3, true],
    [5, true],
    [7, true],
    [11, true],
    [13, true],
    [1, false],
    [4, false],
    [9, false],
    [0, false],
    [-1, false],
  ])("isPrime(%i) === %s", (n, expected) => {
    expect(isPrime(n)).toBe(expected);
  });
});

describe("isPrime — test.each with named columns", () => {
  it.each([
    { n: 17, expected: true, label: "prime" },
    { n: 18, expected: false, label: "not prime" },
    { n: 19, expected: true, label: "prime" },
    { n: 20, expected: false, label: "not prime" },
  ])("$n is $label", ({ n, expected }) => {
    expect(isPrime(n)).toBe(expected);
  });
});

describe("slugify", () => {
  it.each([
    ["Hello World", "hello-world"],
    ["  leading and trailing  ", "leading-and-trailing"],
    ["TypeScript & React!", "typescript-react"],
    ["multiple   spaces", "multiple-spaces"],
    ["already-slugified", "already-slugified"],
    ["UPPERCASE STRING", "uppercase-string"],
  ])("slugify(%s) === %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("clampToRange", () => {
  it.each([
    { value: 5, min: 0, max: 10, expected: 5, desc: "in range" },
    { value: -5, min: 0, max: 10, expected: 0, desc: "below min" },
    { value: 15, min: 0, max: 10, expected: 10, desc: "above max" },
    { value: 0, min: 0, max: 10, expected: 0, desc: "at min boundary" },
    { value: 10, min: 0, max: 10, expected: 10, desc: "at max boundary" },
  ])("$value ($desc) → $expected", ({ value, min, max, expected }) => {
    expect(clampToRange(value, min, max)).toBe(expected);
  });
});

describe("checkPasswordStrength", () => {
  it.each([
    ["abc", "weak"],
    ["password", "fair"],          // length >= 8
    ["Password1", "strong"],       // length, uppercase, digit
    ["P@ssw0rd!!", "very-strong"], // all criteria
    ["short", "weak"],
  ] as [string, PasswordStrength][])(
    '"%s" → %s',
    (password, expected) => {
      expect(checkPasswordStrength(password)).toBe(expected);
    }
  );
});

// ─── describe.each: run a whole suite across variants ────────────────────────

describe.each([
  { currency: "USD", symbol: "$" },
  { currency: "EUR", symbol: "€" },
  { currency: "GBP", symbol: "£" },
])("formatCurrency with $currency", ({ currency, symbol }) => {
  it("formats positive amount", () => {
    const result = formatCurrency(1234.5, currency);
    expect(result).toContain(symbol);
    expect(result).toContain("1,234.50");
  });

  it("formats zero", () => {
    const result = formatCurrency(0, currency);
    expect(result).toContain("0.00");
  });
});
