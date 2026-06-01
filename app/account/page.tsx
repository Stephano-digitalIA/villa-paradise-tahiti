import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CalendarCheck, Mail, UserCircle } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'My account — Villa Paradise Tahiti',
  description: 'Your Villa Paradise Tahiti client space.',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/')
  }

  const user = data.user
  const meta = user.user_metadata ?? {}
  const fullName: string = meta.full_name || meta.name || ''
  const firstName = fullName.includes(' ')
    ? fullName.split(' ')[0]
    : fullName || (user.email?.split('@')[0] ?? 'there')

  return (
    <Section tone="pearl" spacing="default">
      <Container className="flex flex-col gap-10 pt-12 sm:pt-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Client space
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Hello, <span className="not-italic font-heading text-gold">{firstName}</span>
          </h1>
          <p className="max-w-xl font-sans text-body-md text-midnight-400">
            Welcome to your Villa Paradise Tahiti client space. Your bookings, invoices and
            concierge requests will appear here.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card
            id="bookings"
            icon={<CalendarCheck className="h-5 w-5 text-gold" aria-hidden="true" />}
            title="My bookings"
            body="Your reservations and their status will be listed here. Until then, head to the booking page to plan your stay."
          >
            <Button asChild variant="primary" size="md">
              <Link href="/booking">
                Build your stay
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Card>

          <Card
            icon={<UserCircle className="h-5 w-5 text-gold" aria-hidden="true" />}
            title="Profile"
            body="Your signed-in details, pulled from your provider account."
          >
            <dl className="flex flex-col gap-1.5 font-sans text-body-sm text-midnight-400">
              <div className="flex gap-2">
                <dt className="font-medium text-midnight">Name:</dt>
                <dd>{fullName || '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-midnight">Email:</dt>
                <dd className="truncate">{user.email ?? '—'}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-pearl-400 bg-pearl p-6 text-center sm:p-8">
          <Mail className="h-6 w-6 text-gold" aria-hidden="true" />
          <p className="font-heading text-h3-luxe font-medium text-midnight">
            Need anything?
          </p>
          <p className="max-w-md font-sans text-body-sm text-midnight-400">
            Our concierge is one email away — for changes to a stay, custom experiences or
            arrival logistics.
          </p>
          <Button asChild variant="outline" size="md">
            <a href="mailto:contact@villaparadisetahiti.com">
              contact@villaparadisetahiti.com
            </a>
          </Button>
        </div>
      </Container>
    </Section>
  )
}

interface CardProps {
  id?: string
  icon: React.ReactNode
  title: string
  body: string
  children?: React.ReactNode
}

function Card({ id, icon, title, body, children }: CardProps) {
  return (
    <section
      id={id}
      className="flex flex-col gap-4 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
          {icon}
        </span>
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">{title}</h2>
      </div>
      <p className="font-sans text-body-sm text-midnight-400">{body}</p>
      {children ? <div className="pt-1">{children}</div> : null}
    </section>
  )
}
