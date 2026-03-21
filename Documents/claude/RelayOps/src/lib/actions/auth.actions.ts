'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { ServerActionResult } from '@/lib/types/api'

export async function signOutAction(): Promise<ServerActionResult> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: 'Failed to sign out' }
  }

  return { success: true }
}
