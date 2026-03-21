import '@testing-library/jest-dom'

// Minimum required env vars so env.ts can parse without throwing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-minimum-length'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-minimum'
process.env.INTEGRATION_MODE = 'mock'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.EMAIL_FROM = 'test@relayops.com'
// NODE_ENV is read-only in strict TS — set via test runner config instead
// Pin timezone to UTC so date formatting tests are locale-independent
process.env.TZ = 'UTC'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

// IntersectionObserver mock — framer-motion inView 需要
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
})
