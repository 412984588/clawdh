import { describe, it, expect } from 'vitest'
import { getSignedDownloadUrl, getSignedUploadUrl } from '@/lib/integrations/storage/signed-urls'

// setup.ts sets INTEGRATION_MODE=mock, so both functions return mock URLs

describe('getSignedDownloadUrl (mock mode)', () => {
  it('returns a mock URL containing the storage path', async () => {
    const result = await getSignedDownloadUrl('org/ticket-1/file.pdf')
    expect(result.error).toBeNull()
    expect(result.data).toContain('org/ticket-1/file.pdf')
    expect(result.data).toMatch(/^https:\/\//)
  })

  it('includes a token and expires param in mock URL', async () => {
    const result = await getSignedDownloadUrl('some/path.jpg')
    expect(result.data).toContain('token=mock')
    expect(result.data).toContain('expires=')
  })

  it('accepts a custom expiresIn parameter', async () => {
    const result = await getSignedDownloadUrl('data.csv', 7200)
    expect(result.data).toBeTruthy()
  })
})

describe('getSignedUploadUrl (mock mode)', () => {
  it('returns a mock upload URL containing the storage path', async () => {
    const result = await getSignedUploadUrl('uploads/file.png')
    expect(result.error).toBeNull()
    expect(result.data).toContain('uploads/file.png')
    expect(result.data).toMatch(/^https:\/\//)
  })

  it('includes a token param in mock URL', async () => {
    const result = await getSignedUploadUrl('uploads/doc.pdf')
    expect(result.data).toContain('token=mock')
  })
})

describe('edge cases (mock mode)', () => {
  it('getSignedDownloadUrl with deeply nested path returns valid URL', async () => {
    const path = 'org-123/tickets/ticket-abc/attachments/file with spaces.pdf'
    const result = await getSignedDownloadUrl(path)
    expect(result.data).toMatch(/^https:\/\//)
    expect(result.data).toContain('org-123')
  })

  it('getSignedDownloadUrl with expiresIn=0 still returns a URL', async () => {
    const result = await getSignedDownloadUrl('data.csv', 0)
    expect(result.data).toMatch(/^https:\/\//)
    expect(result.data).toContain('expires=')
  })
})
