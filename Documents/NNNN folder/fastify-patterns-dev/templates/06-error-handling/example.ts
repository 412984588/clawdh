/**
 * Fastify Error Handling
 * Demonstrates: custom error classes, setErrorHandler, 404 handler, validation errors
 */
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from "fastify";

// ── Custom error classes ───────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      404,
      "NOT_FOUND"
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

// ── Error response format ─────────────────────────────────────────────────────

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
    timestamp: string;
  };
}

// ── Build app with error handling ─────────────────────────────────────────────

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: true });

  // ── Global error handler ───────────────────────────────────────────────────

  fastify.setErrorHandler(
    (error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
      const isAppError = error instanceof AppError;
      const statusCode = error.statusCode ?? 500;

      // Don't expose internal errors to clients
      const clientMessage = isAppError || statusCode < 500
        ? error.message
        : "An unexpected error occurred";

      const response: ErrorResponse = {
        error: {
          code: isAppError ? (error as AppError).code : "INTERNAL_ERROR",
          message: clientMessage,
          details: isAppError ? (error as AppError).details : undefined,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      };

      // Log 5xx errors with full stack
      if (statusCode >= 500) {
        request.log.error({ err: error }, "Server error");
      }

      return reply.code(statusCode).send(response);
    }
  );

  // ── 404 Not Found handler ─────────────────────────────────────────────────

  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(404).send({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: `Route ${request.method} ${request.url} not found`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // ── Routes demonstrating error patterns ───────────────────────────────────

  fastify.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    const { id } = request.params;

    if (id === "404") throw new NotFoundError("User", id);
    if (id === "forbidden") throw new ForbiddenError("You cannot access this user");
    if (id === "crash") throw new Error("Unexpected crash!"); // 500

    return reply.send({ id, name: `User ${id}` });
  });

  fastify.post<{ Body: { email: string } }>("/users", async (request, reply) => {
    const { email } = request.body;

    if (!email.includes("@")) {
      throw new ValidationError("Invalid email address", { field: "email" });
    }

    if (email === "taken@example.com") {
      throw new ConflictError(`Email ${email} is already registered`);
    }

    return reply.code(201).send({ id: 1, email });
  });

  // ── Async error from nested call ───────────────────────────────────────────

  async function fetchUserFromDb(id: string) {
    if (id === "db-error") throw new Error("Connection refused");
    return { id, name: `User ${id}` };
  }

  fastify.get<{ Params: { id: string } }>("/db/users/:id", async (request, reply) => {
    try {
      const user = await fetchUserFromDb(request.params.id);
      return reply.send(user);
    } catch (err) {
      // Wrap unknown errors into AppError
      if (err instanceof AppError) throw err;
      throw new AppError(
        "Database operation failed",
        503,
        "DB_ERROR",
        { original: (err as Error).message }
      );
    }
  });

  return fastify;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = buildApp();
  await app.listen({ port: 3000 });
  console.log("Fastify error handling demo on http://localhost:3000");
}

if (require.main === module) {
  main().catch(console.error);
}

export default buildApp;
