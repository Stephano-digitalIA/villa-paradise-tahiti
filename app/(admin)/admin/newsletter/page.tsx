import type { Metadata } from 'next'

import { liveAdminClient } from '@/lib/supabase/admin'
import type { NewsletterCampaign, NewsletterSubscriber } from '@/lib/supabase/types'
import { PREVIEW_UNSUBSCRIBE_URL } from '@/lib/newsletter'

import { NewsletterClient } from './NewsletterClient'

export const metadata: Metadata = { title: 'Newsletter — Admin' }

// The list changes from the public site, so never serve a snapshot of it.
export const dynamic = 'force-dynamic'

export default async function NewsletterPage() {
  // Tolerate migration 016 not being applied yet: the page then explains what
  // to run instead of failing, which is the same contract as the other admin
  // pages written before their migration landed.
  const { data: subs, error } = await liveAdminClient
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const tableMissing = Boolean(error)

  // Drafts and sent newsletters share one table; `sent_at` tells them apart.
  const { data: camps } = tableMissing
    ? { data: [] }
    : await liveAdminClient
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

  const campaigns = (camps ?? []) as NewsletterCampaign[]

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">Newsletter</h1>
      <p className="mt-1 max-w-2xl font-sans text-sm text-midnight-400">
        Les adresses collectées par le formulaire en bas de la page Blog, et l’envoi
        de la lettre à cette liste. Chaque destinataire reçoit son propre lien de
        désinscription : la lettre part en messages individuels, jamais en copie
        collective.
      </p>

      <div className="mt-8 max-w-6xl">
        <NewsletterClient
          subscribers={(subs ?? []) as NewsletterSubscriber[]}
          drafts={campaigns.filter((c) => !c.sent_at)}
          sent={campaigns.filter((c) => c.sent_at)}
          previewUnsubscribeUrl={PREVIEW_UNSUBSCRIBE_URL}
          tableMissing={tableMissing}
        />
      </div>
    </div>
  )
}
