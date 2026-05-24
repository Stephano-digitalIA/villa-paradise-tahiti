'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import type { Settings } from '@/lib/supabase/types'

export async function saveSettings(
  data: Partial<Settings>,
): Promise<{ error?: string }> {
  // Upsert — settings table should have exactly one row
  const { error } = await adminClient
    .from('settings')
    .upsert({ ...data }, { onConflict: 'id' })

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return {}
}
