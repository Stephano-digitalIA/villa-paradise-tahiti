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

/**
 * Permanently delete an inquiry.
 *
 * There is no trash for these: an inquiry is a message, and the admin deletes
 * it the way one deletes an email, mostly to clear spam and test entries. The
 * UI asks for a second click before calling this, since the row carries a
 * prospect's name, dates and message and nothing else records them.
 */
export async function deleteInquiry(
  inquiryId: string,
): Promise<{ error?: string }> {
  const { error } = await adminClient
    .from('contact_inquiries')
    .delete()
    .eq('id', inquiryId)

  if (error) return { error: error.message }

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
  return {}
}
