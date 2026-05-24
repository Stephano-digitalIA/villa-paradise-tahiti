'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'

const REVALIDATE = () => revalidatePath('/admin/content/providers')

function parseProvider(formData: FormData) {
  const servicesRaw = formData.get('services') as string
  const services = servicesRaw
    ? servicesRaw.split('\n').map((l) => l.trim()).filter(Boolean)
    : []

  return {
    name: (formData.get('name') as string).trim(),
    contact_email: (formData.get('contact_email') as string | null) || null,
    contact_phone: (formData.get('contact_phone') as string | null) || null,
    website: (formData.get('website') as string | null) || null,
    instagram: (formData.get('instagram') as string | null) || null,
    commission_percent: formData.get('commission_percent')
      ? Number(formData.get('commission_percent'))
      : null,
    notes: (formData.get('notes') as string | null) || null,
    services,
    active: formData.get('active') === 'true',
  }
}

export async function createProvider(formData: FormData): Promise<void> {
  const payload = parseProvider(formData)
  const { error } = await adminClient.from('excursion_providers').insert(payload)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function updateProvider(id: string, formData: FormData): Promise<void> {
  const payload = { ...parseProvider(formData), updated_at: new Date().toISOString() }
  const { error } = await adminClient.from('excursion_providers').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function toggleProviderActive(id: string, value: boolean): Promise<void> {
  const { error } = await adminClient
    .from('excursion_providers')
    .update({ active: value, updated_at: new Date().toISOString() } as { active: boolean; updated_at: string })
    .eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}
