import { describe, it, expect } from "vitest";

// ─── Error types under test ───────────────────────────────────────────────────

class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(
    public readonly resource: string,
    public readonly id: string | number
  ) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds}s`);
    this.name = "RateLimitError";
  }
}

// ─── Functions that throw ─────────────────────────────────────────────────────

function validateAge(age: unknown): number {
  if (typeof age !== "number") {
    throw new ValidationError("Age must be a number", "age", "INVALID_TYPE");
  }
  if (age < 0 || age > 150) {
    throw new ValidationError("Age must be between 0 and 150", "age", "OUT_OF_RANGE");
  }
  return age;
}

function findUser(id: number): { id: number; name: string } {
  const db: Record<number, { id: number; name: string }> = {
    1: { id: 1, name: "Alice" },
    2: { id: 2, name: "Bob" },
  };
  if (!db[id]) throw new NotFoundError("User", id);
  return db[id];
}

async function callRateLimitedApi(requestsLeft: number): Promise<string> {
  if (requestsLeft <= 0) throw new RateLimitError(60);
  return "success";
}

function parseConfig(json: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new ValidationError("Config must be a JSON object", "config", "INVALID_SHAPE");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new ValidationError("Invalid JSON", "config", "PARSE_ERROR");
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("validateAge", () => {
  it("returns valid age", () => {
    expect(validateAge(25)).toBe(25);
    expect(validateAge(0)).toBe(0);
    expect(validateAge(150)).toBe(150);
  });

  it("throws ValidationError for non-number", () => {
    expect(() => validateAge("25")).toThrow(ValidationError);
    expect(() => validateAge("25")).toThrow("Age must be a number");
  });

  it("throws ValidationError for out-of-range", () => {
    expect(() => validateAge(-1)).toThrow("Age must be between 0 and 150");
    expect(() => validateAge(151)).toThrow("Age must be between 0 and 150");
  });

  it("throws with correct field and code", () => {
    try {
      validateAge(-1);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      if (err instanceof ValidationError) {
        expect(err.field).toBe("age");
        expect(err.code).toBe("OUT_OF_RANGE");
      }
    }
  });
});

describe("findUser", () => {
  it("returns existing user", () => {
    expect(findUser(1)).toEqual({ id: 1, name: "Alice" });
  });

  it("throws NotFoundError for missing user", () => {
    expect(() => findUser(99)).toThrow(NotFoundError);
    expect(() => findUser(99)).toThrow("User with id 99 not found");
  });

  it("NotFoundError has resource and id", () => {
    try {
      findUser(99);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      if (err instanceof NotFoundError) {
        expect(err.resource).toBe("User");
        expect(err.id).toBe(99);
      }
    }
  });
});

describe("callRateLimitedApi", () => {
  it("resolves when requests remain", async () => {
    await expect(callRateLimitedApi(5)).resolves.toBe("success");
  });

  it("throws RateLimitError when limit exceeded", async () => {
    await expect(callRateLimitedApi(0)).rejects.toThrow(RateLimitError);
    await expect(callRateLimitedApi(0)).rejects.toThrow("Rate limit exceeded");
  });

  it("RateLimitError carries retryAfterSeconds", async () => {
    try {
      await callRateLimitedApi(0);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      if (err instanceof RateLimitError) {
        expect(err.retryAfterSeconds).toBe(60);
      }
    }
  });
});

describe("parseConfig", () => {
  it("parses valid JSON object", () => {
    expect(parseConfig('{"key":"value"}')).toEqual({ key: "value" });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseConfig("{bad json}")).toThrow(ValidationError);
    expect(() => parseConfig("{bad json}")).toThrow("Invalid JSON");
  });

  it("throws on non-object JSON", () => {
    expect(() => parseConfig("[1,2,3]")).toThrow("Config must be a JSON object");
    expect(() => parseConfig('"string"')).toThrow("Config must be a JSON object");
  });
});
