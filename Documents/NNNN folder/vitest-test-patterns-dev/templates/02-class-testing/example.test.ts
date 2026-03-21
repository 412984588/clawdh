import { describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Class under test ────────────────────────────────────────────────────────

class BankAccount {
  private balance: number;
  private readonly owner: string;
  private transactions: { type: "deposit" | "withdrawal"; amount: number }[] = [];

  constructor(owner: string, initialBalance = 0) {
    this.owner = owner;
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Deposit amount must be positive");
    this.balance += amount;
    this.transactions.push({ type: "deposit", amount });
  }

  withdraw(amount: number): void {
    if (amount <= 0) throw new Error("Withdrawal amount must be positive");
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
    this.transactions.push({ type: "withdrawal", amount });
  }

  getBalance(): number {
    return this.balance;
  }

  getTransactionCount(): number {
    return this.transactions.length;
  }

  getOwner(): string {
    return this.owner;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("BankAccount", () => {
  let account: BankAccount;

  // Fresh instance before each test — state isolation
  beforeEach(() => {
    account = new BankAccount("Alice", 100);
  });

  afterEach(() => {
    // Cleanup hooks — useful for db connections, file handles, etc.
  });

  describe("constructor", () => {
    it("sets the owner correctly", () => {
      expect(account.getOwner()).toBe("Alice");
    });

    it("sets initial balance", () => {
      expect(account.getBalance()).toBe(100);
    });

    it("defaults to zero balance when not specified", () => {
      const emptyAccount = new BankAccount("Bob");
      expect(emptyAccount.getBalance()).toBe(0);
    });
  });

  describe("deposit", () => {
    it("increases balance by deposit amount", () => {
      account.deposit(50);
      expect(account.getBalance()).toBe(150);
    });

    it("records the transaction", () => {
      account.deposit(50);
      expect(account.getTransactionCount()).toBe(1);
    });

    it("throws on non-positive amount", () => {
      expect(() => account.deposit(0)).toThrow("Deposit amount must be positive");
      expect(() => account.deposit(-10)).toThrow("Deposit amount must be positive");
    });
  });

  describe("withdraw", () => {
    it("decreases balance by withdrawal amount", () => {
      account.withdraw(40);
      expect(account.getBalance()).toBe(60);
    });

    it("throws when insufficient funds", () => {
      expect(() => account.withdraw(200)).toThrow("Insufficient funds");
    });

    it("throws on non-positive amount", () => {
      expect(() => account.withdraw(-5)).toThrow("Withdrawal amount must be positive");
    });

    it("allows full withdrawal", () => {
      account.withdraw(100);
      expect(account.getBalance()).toBe(0);
    });
  });

  describe("multiple operations", () => {
    it("tracks cumulative balance changes", () => {
      account.deposit(200);
      account.withdraw(50);
      account.deposit(25);
      expect(account.getBalance()).toBe(275);
    });

    it("counts all transactions", () => {
      account.deposit(10);
      account.deposit(20);
      account.withdraw(5);
      expect(account.getTransactionCount()).toBe(3);
    });
  });
});
