import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Dependencies to mock ─────────────────────────────────────────────────────

// Simulate an external logger module
const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, err?: unknown) => console.error(`[ERROR] ${msg}`, err),
};

// Simulate an external email service
const emailService = {
  sendWelcomeEmail: async (to: string): Promise<void> => {
    // In production this would call an API
    console.log(`Sending welcome email to ${to}`);
  },
};

// Simulate a database repository
const userRepository = {
  findById: async (id: string): Promise<{ id: string; email: string } | null> => {
    return null; // stubbed
  },
  save: async (user: { id: string; email: string }): Promise<void> => {
    // stubbed
  },
};

// ─── Service under test ───────────────────────────────────────────────────────

class UserService {
  constructor(
    private readonly repo: typeof userRepository,
    private readonly email: typeof emailService,
    private readonly log: typeof logger
  ) {}

  async registerUser(id: string, emailAddr: string): Promise<{ id: string; email: string }> {
    const existing = await this.repo.findById(id);
    if (existing) throw new Error("User already exists");

    const user = { id, email: emailAddr };
    await this.repo.save(user);
    await this.email.sendWelcomeEmail(emailAddr);
    this.log.info(`Registered user ${id}`);
    return user;
  }

  async getUser(id: string): Promise<{ id: string; email: string }> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("UserService", () => {
  let service: UserService;
  let mockRepo: typeof userRepository;
  let mockEmail: typeof emailService;
  let mockLogger: typeof logger;

  beforeEach(() => {
    // Create fresh spies/mocks before each test
    mockRepo = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockEmail = {
      sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    };
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };
    service = new UserService(mockRepo, mockEmail, mockLogger);
  });

  describe("registerUser", () => {
    it("saves user and sends welcome email", async () => {
      const user = await service.registerUser("u1", "alice@example.com");

      expect(user).toEqual({ id: "u1", email: "alice@example.com" });
      expect(mockRepo.save).toHaveBeenCalledWith({ id: "u1", email: "alice@example.com" });
      expect(mockEmail.sendWelcomeEmail).toHaveBeenCalledWith("alice@example.com");
    });

    it("logs after successful registration", async () => {
      await service.registerUser("u1", "alice@example.com");
      expect(mockLogger.info).toHaveBeenCalledWith("Registered user u1");
    });

    it("throws when user already exists", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: "u1", email: "alice@example.com" });

      await expect(service.registerUser("u1", "other@example.com")).rejects.toThrow(
        "User already exists"
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockEmail.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  describe("getUser", () => {
    it("returns user when found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: "u1", email: "alice@example.com" });

      const user = await service.getUser("u1");
      expect(user).toEqual({ id: "u1", email: "alice@example.com" });
    });

    it("throws when user not found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      await expect(service.getUser("unknown")).rejects.toThrow("User not found");
    });

    it("calls repository with correct id", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue({ id: "u42", email: "x@y.com" });

      await service.getUser("u42");
      expect(mockRepo.findById).toHaveBeenCalledWith("u42");
    });
  });

  describe("vi.fn advanced usage", () => {
    it("tracks call count with toHaveBeenCalledTimes", async () => {
      await service.registerUser("u1", "a@b.com");
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("mockImplementation for dynamic responses", async () => {
      vi.mocked(mockRepo.findById).mockImplementation(async (id) =>
        id === "u1" ? { id: "u1", email: "a@b.com" } : null
      );

      const user = await service.getUser("u1");
      expect(user.email).toBe("a@b.com");

      await expect(service.getUser("u99")).rejects.toThrow("User not found");
    });
  });
});
