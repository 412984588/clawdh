import { vi } from 'vitest'

type QueryResult<T = unknown> =
  | { data: T; error: null; count?: number | null }
  | { data: null; error: { message: string; code?: string } }

/**
 * Creates a chainable Supabase query mock that resolves to `result`.
 * Supports: chained methods (.eq, .select, etc.), terminal methods (.single, .maybeSingle),
 * and direct await of the chain itself.
 */
export function makeChain<T = unknown>(result: QueryResult<T>) {
  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'lt', 'lte', 'gte', 'not', 'in', 'ilike',
    'order', 'limit', 'range', 'returns',
  ]

  const chain: Record<string, unknown> = {
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    // Allow `await chain` directly (thenable protocol)
    then: (
      onFulfilled?: ((v: QueryResult<T>) => unknown) | null,
      onRejected?: ((r: unknown) => unknown) | null
    ) => Promise.resolve(result).then(onFulfilled ?? undefined, onRejected ?? undefined),
  }

  for (const method of chainMethods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }

  return chain
}

/** Shorthand: successful result */
export function ok<T>(data: T) {
  return makeChain<T>({ data, error: null })
}

/** Shorthand: error result (optional Postgres error code) */
export function err(message: string, code?: string) {
  return makeChain({ data: null, error: { message, ...(code ? { code } : {}) } })
}

/** Shorthand: successful paginated result with count */
export function okWithCount<T>(data: T, count: number) {
  return makeChain<T>({ data, error: null, count })
}

/**
 * Creates a base mock Supabase client.
 * Override individual `from()` calls with:
 *   client.from.mockReturnValueOnce(makeChain(...))
 */
export function createMockSupabase() {
  return {
    from: vi.fn().mockReturnValue(makeChain({ data: null, error: null })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://mock.storage/file' },
          error: null,
        }),
        createSignedUploadUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://mock.storage/upload' },
          error: null,
        }),
      }),
    },
  }
}
