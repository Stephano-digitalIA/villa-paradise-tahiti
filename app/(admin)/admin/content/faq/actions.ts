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
}): Promise<void> {
  const { error } = await adminClient.from('faqs').insert(data)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function updateFAQ(
  id: string,
  data: Partial<{
    question: string
    answer: string
    sort_order: number
    active: boolean
  }>,
): Promise<void> {
  const { error } = await adminClient.from('faqs').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function deleteFAQ(id: string): Promise<void> {
  const { error } = await adminClient.from('faqs').delete().eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}
