import { getStorageBucket } from './client'
import { env } from '@/lib/config/env'

export async function getSignedDownloadUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<{ data: string | null; error: string | null }> {
  if (env.INTEGRATION_MODE === 'mock') {
    return {
      data: `https://mock-storage.relayops.com/files/${storagePath}?token=mock&expires=${Date.now() + expiresIn * 1000}`,
      error: null,
    }
  }
  const bucket = getStorageBucket()
  const { data, error } = await bucket.createSignedUrl(storagePath, expiresIn)
  if (error || !data) {
    return { data: null, error: `Failed to create signed URL: ${error?.message}` }
  }
  return { data: data.signedUrl, error: null }
}

export async function getSignedUploadUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<{ data: string | null; error: string | null }> {
  if (env.INTEGRATION_MODE === 'mock') {
    return {
      data: `https://mock-storage.relayops.com/upload/${storagePath}?token=mock`,
      error: null,
    }
  }
  const bucket = getStorageBucket()
  const { data, error } = await bucket.createSignedUploadUrl(storagePath)
  if (error || !data) {
    return {
      data: null,
      error: `Failed to create signed upload URL: ${error?.message}`,
    }
  }
  // expiresIn is not used by createSignedUploadUrl but kept for API consistency
  void expiresIn
  return { data: data.signedUrl, error: null }
}
