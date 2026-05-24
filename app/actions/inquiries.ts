'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'

export async function markInquiryReplied(
  inquiryId: string,
): Promise<{ error?: string }> {
  const { error } = await adminClient
    .from('contact_inquiries')
    .update({ replied: true, replied_at: new Date().toISOString() })
    .eq('id', inquiryId)

  if (error) return { error: error.message }

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
  return {}
}
