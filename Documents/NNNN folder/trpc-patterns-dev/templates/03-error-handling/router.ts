/**
 * tRPC v11 — Error Handling
 * TRPCError codes, custom error shapes, errorFormatter, onError
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

// ── 1. Domain error classes ───────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} with id "${id}" not found`);
  }
}

export class ValidationError extends AppError {
  constructor(field: string, message: string) {
    super("VALIDATION", `Validation failed on "${field}": ${message}`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}

// ── 2. Map domain errors → tRPC codes ────────────────────────────────────────

function toTRPCError(err: AppError): TRPCError {
  const codeMap: Record<string, TRPCError["code"]> = {
    NOT_FOUND: "NOT_FOUND",
    VALIDATION: "BAD_REQUEST",
    CONFLICT: "CONFLICT",
  };
  return new TRPCError({
    code: codeMap[err.code] ?? "INTERNAL_SERVER_ERROR",
    message: err.message,
    cause: err,
  });
}

// ── 3. initTRPC with custom error formatter ───────────────────────────────────

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    // Include extra fields on the error response for clients
    const cause = error.cause;
    const appError = cause instanceof AppError ? cause : null;

    return {
      ...shape,
      data: {
        ...shape.data,
        appCode: appError?.code ?? null,
        // Only expose details in non-production
        details: process.env.NODE_ENV !== "production" ? appError?.details : undefined,
      },
    };
  },
});

// ── 4. Error-handling middleware ──────────────────────────────────────────────

const errorMapper = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    if (err instanceof AppError) throw toTRPCError(err);
    if (err instanceof TRPCError) throw err;
    // Unknown errors become 500
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      cause: err,
    });
  }
});

const publicProcedure = t.procedure.use(errorMapper);

// ── 5. Demo data store ────────────────────────────────────────────────────────

const items = new Map<string, { id: string; name: string; slug: string }>([
  ["1", { id: "1", name: "Widget", slug: "widget" }],
]);

// ── 6. Router showcasing all error patterns ───────────────────────────────────

export const appRouter = t.router({
  // NOT_FOUND — throw when resource doesn't exist
  getItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const item = items.get(input.id);
      if (!item) throw new NotFoundError("Item", input.id);
      return item;
    }),

  // BAD_REQUEST via Zod (automatic)
  createItem: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(50),
        slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
      })
    )
    .mutation(({ input }) => {
      const conflict = Array.from(items.values()).find((i) => i.slug === input.slug);
      if (conflict) throw new ConflictError(`Slug "${input.slug}" is already taken`);
      const item = { id: Math.random().toString(36).slice(2), ...input };
      items.set(item.id, item);
      return item;
    }),

  // UNAUTHORIZED — explicit auth check
  adminAction: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(({ input }) => {
      if (input.token !== "secret") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
      }
      return { success: true };
    }),

  // TIMEOUT simulation
  slowOperation: publicProcedure
    .input(z.object({ delayMs: z.number().max(5000) }))
    .query(async ({ input }) => {
      await new Promise((resolve) => setTimeout(resolve, input.delayMs));
      if (input.delayMs > 3000) {
        throw new TRPCError({ code: "TIMEOUT", message: "Operation timed out" });
      }
      return { completedIn: input.delayMs };
    }),

  // Custom validation via AppError
  setAge: publicProcedure
    .input(z.object({ age: z.number() }))
    .mutation(({ input }) => {
      if (input.age < 0 || input.age > 150) {
        throw new ValidationError("age", `Value ${input.age} is not a valid age`);
      }
      return { age: input.age };
    }),
});

export type AppRouter = typeof appRouter;

// ── 7. Server-level onError (passed to adapter) ───────────────────────────────
//
// When creating the server:
//   fetchRequestHandler({
//     router: appRouter,
//     req,
//     createContext,
//     onError({ error, path }) {
//       if (error.code === "INTERNAL_SERVER_ERROR") {
//         // report to Sentry/DataDog
//         console.error("[tRPC Error]", path, error);
//       }
//     },
//   });
