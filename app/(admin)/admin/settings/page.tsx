import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { SettingsForm } from './_components/SettingsForm'

export const metadata: Metadata = {
  title: 'Settings — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { data: settings } = await adminClient
    .from('settings')
    .select('*')
    .maybeSingle()

  return (
    <div className="p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-midnight">
          Settings
        </h1>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          Manage pricing, contact info, social links, and cancellation policy.
        </p>
      </div>

      <div className="mt-8">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  )
}
