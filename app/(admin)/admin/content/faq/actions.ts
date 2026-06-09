'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import type { FaqCategory } from '@/lib/supabase/types'

const REVALIDATE = () => {
  revalidatePath('/admin/content/faq')
  revalidatePath('/', 'layout')
}

export async function createFAQ(data: {
  question: string
  answer: string
  category: FaqCategory
  sort_order: number
  active: boolean
  translations?: Record<string, string>
}): Promise<void> {
  const { error } = await adminClient.from('faqs').insert(data)
  if (error) {
    // Pre-migration 012 — `translations` column absent. Retry English-only.
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = data
    void _omit
    const { error: retry } = await adminClient.from('faqs').insert(enOnly)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}

export async function updateFAQ(
  id: string,
  data: Partial<{
    question: string
    answer: string
    sort_order: number
    active: boolean
    translations: Record<string, string>
  }>,
): Promise<void> {
  const { error } = await adminClient.from('faqs').update(data).eq('id', id)
  if (error) {
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = data
    void _omit
    const { error: retry } = await adminClient.from('faqs').update(enOnly).eq('id', id)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}

export async function deleteFAQ(id: string): Promise<void> {
  const { error } = await adminClient.from('faqs').delete().eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}
