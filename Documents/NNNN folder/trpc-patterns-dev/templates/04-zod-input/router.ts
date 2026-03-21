/**
 * tRPC v11 — Advanced Zod Input Validation
 * Complex schemas, transforms, refinements, discriminated unions
 */
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

// ── 1. Reusable base schemas ──────────────────────────────────────────────────

const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

const DateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine(({ from, to }) => from <= to, {
    message: "from must be before or equal to to",
    path: ["from"],
  });

const SortSchema = <T extends [string, ...string[]]>(fields: T) =>
  z.object({
    field: z.enum(fields),
    order: z.enum(["asc", "desc"]).default("asc"),
  });

// ── 2. Transform: strip unknown keys and normalize ────────────────────────────

const EmailSchema = z
  .string()
  .email()
  .trim()
  .toLowerCase()
  .transform((email) => email.replace(/\+.*@/, "@")); // strip Gmail aliases

const SlugSchema = z
  .string()
  .min(1)
  .max(100)
  .trim()
  .transform((s) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));

const PhoneSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, "")) // strip non-digits
  .refine((s) => s.length >= 10 && s.length <= 15, { message: "Invalid phone number" });

// ── 3. Discriminated union inputs ─────────────────────────────────────────────

const PaymentMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("card"),
    cardNumber: z.string().length(16),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int().min(2024),
    cvv: z.string().length(3),
  }),
  z.object({
    type: z.literal("bank_transfer"),
    iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, "Invalid IBAN"),
    accountName: z.string().min(1),
  }),
  z.object({
    type: z.literal("crypto"),
    walletAddress: z.string().min(26).max(62),
    network: z.enum(["eth", "btc", "sol"]),
  }),
]);

// ── 4. Nested object with cross-field validation ──────────────────────────────

const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2).toUpperCase(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid US zip code"),
  country: z.string().length(2).default("US"),
});

const UserProfileSchema = z
  .object({
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    email: EmailSchema,
    phone: PhoneSchema.optional(),
    website: z.string().url().optional(),
    address: AddressSchema.optional(),
    bio: z.string().max(500).optional(),
    birthDate: z.coerce.date().refine(
      (d) => d <= new Date() && d >= new Date("1900-01-01"),
      { message: "Birth date must be in the past" }
    ).optional(),
    newsletter: z.boolean().default(false),
  })
  .transform((data) => ({
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    slug: `${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}`,
  }));

// ── 5. Array with item-level validation ──────────────────────────────────────

const BulkCreateSchema = z
  .array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().int().positive(),
      price: z.number().positive().multipleOf(0.01),
      sku: z.string().regex(/^[A-Z0-9-]{3,20}$/, "Invalid SKU format"),
    })
  )
  .min(1, "At least one item required")
  .max(100, "Maximum 100 items per request")
  .refine(
    (items) => new Set(items.map((i) => i.sku)).size === items.length,
    { message: "Duplicate SKUs in request" }
  );

// ── 6. Router ─────────────────────────────────────────────────────────────────

export const appRouter = t.router({
  // Pagination + date range + sort
  listOrders: publicProcedure
    .input(
      PaginationSchema.merge(
        z.object({
          dateRange: DateRangeSchema.optional(),
          sort: SortSchema(["createdAt", "total", "status"]).optional(),
          status: z.enum(["pending", "paid", "shipped", "cancelled"]).optional(),
        })
      )
    )
    .query(({ input }) => ({
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      total: 0,
    })),

  // Profile with transforms
  updateProfile: publicProcedure
    .input(UserProfileSchema)
    .mutation(({ input }) => ({ ...input, updatedAt: new Date() })),

  // Payment with discriminated union
  processPayment: publicProcedure
    .input(
      z.object({
        amount: z.number().positive().multipleOf(0.01),
        currency: z.string().length(3).toUpperCase().default("USD"),
        method: PaymentMethodSchema,
        idempotencyKey: z.string().uuid(),
      })
    )
    .mutation(({ input }) => ({
      transactionId: Math.random().toString(36).slice(2),
      status: "pending",
      amount: input.amount,
      currency: input.currency,
      paymentType: input.method.type,
    })),

  // Bulk create with array validation
  bulkCreateItems: publicProcedure
    .input(BulkCreateSchema)
    .mutation(({ input }) =>
      input.map((item) => ({
        id: Math.random().toString(36).slice(2),
        ...item,
        createdAt: new Date(),
      }))
    ),

  // Search with full-text + filters
  search: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(200).trim(),
        types: z.array(z.enum(["product", "order", "user"])).default(["product"]),
        ...PaginationSchema.shape,
      })
    )
    .query(({ input }) => ({ results: [], query: input.q, types: input.types })),
});

export type AppRouter = typeof appRouter;
