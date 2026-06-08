'use client'

import { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Settings } from '@/lib/supabase/types'
import { saveSettings } from '@/app/actions/settings'

type Props = {
  initialSettings: Partial<Settings> | null
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
      {children}
    </label>
  )
}

function NumberInput({
  label,
  name,
  defaultValue,
  placeholder,
  min,
  max,
  step,
  unit,
}: {
  label: string
  name: string
  defaultValue?: number | null
  placeholder?: string
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative flex items-center">
        <input
          type="number"
          name={name}
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step ?? 1}
          className="w-full rounded-xl border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 font-sans text-xs text-midnight-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function TextInput({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue?: string | null
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full rounded-xl border border-pearl-400 bg-pearl px-3 py-2 font-sans text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-lg font-semibold text-midnight">
      {children}
    </h2>
  )
}

export function SettingsForm({ initialSettings }: Props) {
  const s = initialSettings ?? {}
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancellationPolicy, setCancellationPolicy] = useState(
    s.cancellation_policy ?? '',
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const fd = new FormData(e.currentTarget)

    function num(key: string): number | null {
      const v = fd.get(key)
      if (v === null || v === '') return null
      const n = parseFloat(v as string)
      return isNaN(n) ? null : n
    }

    function str(key: string): string | null {
      const v = fd.get(key)
      if (v === null || (v as string).trim() === '') return null
      return (v as string).trim()
    }

    const data: Partial<Settings> = {
      // Pricing
      default_min_nights: num('default_min_nights') ?? s.default_min_nights ?? 7,
      default_deposit_percent:
        num('default_deposit_percent') ?? s.default_deposit_percent ?? 30,
      default_nightly_rate_usd: num('default_nightly_rate_usd'),
      cleaning_fee_usd: num('cleaning_fee_usd'),
      rate_low_usd: num('rate_low_usd'),
      rate_high_usd: num('rate_high_usd'),
      rate_peak_usd: num('rate_peak_usd'),
      long_stay_min_nights: num('long_stay_min_nights'),
      long_stay_discount_percent: num('long_stay_discount_percent'),
      // Contact
      contact_email: str('contact_email'),
      contact_phone: str('contact_phone'),
      whatsapp_number: str('whatsapp_number'),
      response_time_hours: num('response_time_hours'),
      // Social
      social_instagram: str('social_instagram'),
      social_facebook: str('social_facebook'),
      social_pinterest: str('social_pinterest'),
      social_tiktok: str('social_tiktok'),
      // Policy
      cancellation_policy: cancellationPolicy || null,
    }

    // Preserve id if existing
    if (s.id) data.id = s.id

    startTransition(async () => {
      const result = await saveSettings(data)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status messages */}
      {error && (
        <div className="rounded-xl border border-coral/20 bg-coral/10 px-5 py-4 font-sans text-sm text-coral">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-leaf/20 bg-leaf/10 px-5 py-4 font-sans text-sm text-leaf">
          Settings saved successfully.
        </div>
      )}

      {/* Section 1 — Pricing */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <SectionTitle>Tarification</SectionTitle>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberInput
            label="Nuits minimum par défaut"
            name="default_min_nights"
            defaultValue={s.default_min_nights}
            min={1}
            placeholder="7"
            unit="nights"
          />
          <NumberInput
            label="Acompte par défaut"
            name="default_deposit_percent"
            defaultValue={s.default_deposit_percent}
            min={0}
            max={100}
            placeholder="30"
            unit="%"
          />
          <NumberInput
            label="Tarif nuit par défaut"
            name="default_nightly_rate_usd"
            defaultValue={s.default_nightly_rate_usd}
            min={0}
            step={0.01}
            placeholder="500"
            unit="USD"
          />
          <NumberInput
            label="Frais de ménage"
            name="cleaning_fee_usd"
            defaultValue={s.cleaning_fee_usd}
            min={0}
            step={0.01}
            placeholder="350"
            unit="USD"
          />
          <div className="flex flex-col gap-1.5">
            <NumberInput
              label="Tarif basse saison (mai–juin, oct–nov)"
              name="rate_low_usd"
              defaultValue={s.rate_low_usd}
              min={0}
              step={0.01}
              unit="USD"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <NumberInput
              label="Tarif haute saison (juil–sept, 1–19 déc)"
              name="rate_high_usd"
              defaultValue={s.rate_high_usd}
              min={0}
              step={0.01}
              unit="USD"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <NumberInput
              label="Tarif très haute saison (20 déc–5 jan, Pâques)"
              name="rate_peak_usd"
              defaultValue={s.rate_peak_usd}
              min={0}
              step={0.01}
              unit="USD"
            />
          </div>
          <NumberInput
            label="Remise long séjour — seuil"
            name="long_stay_min_nights"
            defaultValue={s.long_stay_min_nights}
            min={1}
            placeholder="14"
            unit="nights"
          />
          <NumberInput
            label="Remise long séjour — réduction"
            name="long_stay_discount_percent"
            defaultValue={s.long_stay_discount_percent}
            min={0}
            max={100}
            step={0.01}
            placeholder="10"
            unit="%"
          />
        </div>
      </div>

      {/* Section 2 — Contact */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <SectionTitle>Contact</SectionTitle>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Email de contact"
            name="contact_email"
            defaultValue={s.contact_email}
            type="email"
            placeholder="contact@villaparadisetahiti.com"
          />
          <TextInput
            label="Téléphone de contact"
            name="contact_phone"
            defaultValue={s.contact_phone}
            placeholder="+689 87 000 000"
          />
          <TextInput
            label="Numéro WhatsApp"
            name="whatsapp_number"
            defaultValue={s.whatsapp_number}
            placeholder="+689 87 000 000"
          />
          <NumberInput
            label="Délai de réponse"
            name="response_time_hours"
            defaultValue={s.response_time_hours}
            min={1}
            placeholder="24"
            unit="hours"
          />
        </div>
      </div>

      {/* Section 3 — Social */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <SectionTitle>Réseaux sociaux</SectionTitle>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="URL Instagram"
            name="social_instagram"
            defaultValue={s.social_instagram}
            placeholder="https://instagram.com/villaparadisetahiti"
            type="url"
          />
          <TextInput
            label="URL Facebook"
            name="social_facebook"
            defaultValue={s.social_facebook}
            placeholder="https://facebook.com/villaparadisetahiti"
            type="url"
          />
          <TextInput
            label="URL Pinterest"
            name="social_pinterest"
            defaultValue={s.social_pinterest}
            placeholder="https://pinterest.com/villaparadisetahiti"
            type="url"
          />
          <TextInput
            label="URL TikTok"
            name="social_tiktok"
            defaultValue={s.social_tiktok}
            placeholder="https://tiktok.com/@villaparadisetahiti"
            type="url"
          />
        </div>
      </div>

      {/* Section 4 — Cancellation Policy */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <SectionTitle>Politique d'annulation</SectionTitle>
        <p className="mt-1 font-sans text-xs text-midnight-400">
          Markdown supported. Live preview shown below.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Markdown de la politique</FieldLabel>
            <textarea
              rows={10}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              placeholder="## Cancellation Policy&#10;&#10;- **More than 60 days** before check-in: full refund..."
              className="rounded-xl border border-pearl-400 bg-pearl px-4 py-3 font-mono text-sm text-midnight placeholder-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Aperçu</FieldLabel>
            <div className="min-h-[200px] rounded-xl border border-pearl-400 bg-pearl-300/30 px-4 py-3 prose prose-sm prose-midnight max-w-none">
              {cancellationPolicy ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {cancellationPolicy}
                </ReactMarkdown>
              ) : (
                <p className="font-sans text-sm italic text-midnight-400">
                  Preview will appear here...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-midnight px-8 py-3 font-sans text-sm font-medium text-pearl shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </form>
  )
}
