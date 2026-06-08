# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Villa Paradise Tahiti — luxury villa rental site (Next.js 14 App Router, TypeScript strict). Direct-booking funnel + admin back-office, targeting US guests.

## Commands

```bash
npm run dev          # dev server on http://localhost:3000
npm run build        # production build
npm run lint         # next lint (eslint-config-next)
npm run typecheck    # tsc --noEmit — run this after any non-trivial change
npm run format       # prettier --write .
```

There is **no test suite** (no test runner configured). Verify changes with `npm run typecheck` + `npm run lint`, and for behaviour, hit the running dev server (`curl localhost:3000/...`).

One-off ops/DB scripts live in `scripts/` and load env explicitly:
```bash
npx tsx --env-file=.env.local scripts/<name>.ts
```

Path alias: `@/*` → repo root (e.g. `@/lib/booking`).

## The single most important thing: data does NOT come from Sanity

Despite the name, **`sanityFetch()` reads from Supabase, not Sanity.** The README/docs (and the `lib/sanity/` folder name) are stale — the data layer was migrated to Supabase.

- `lib/sanity/fetcher.ts` matches each GROQ query *constant* (from `lib/sanity/queries.ts`) to a Supabase query function in `lib/supabase/queries.ts`, then runs the row through `lib/supabase/adapters.ts` to produce the camelCase, Sanity-shaped object the components expect.
- It falls back to `lib/sanity/mock-data.ts` **only when Supabase returns null/empty**. With real Supabase creds in `.env.local`, the live site always uses Supabase; the mock is never shown.
- `NEXT_PUBLIC_SANITY_PROJECT_ID=mock` — Sanity Studio (`/studio`) is effectively unused.

Consequences when editing **content** (villa description, amenities, reviews, experiences, settings):
- **Editing `lib/sanity/mock-data.ts` or `supabase/seed.sql` does NOT change what's live** — those are only the fallback/seed. The live value lives in a Supabase table row.
- To change live content: use the admin UI at `/admin/content/*`, **or** write a targeted script (see `scripts/update-villa-*.ts`) that updates the specific column. Then mirror the change in `mock-data.ts` + `seed.sql` to keep the fallback consistent.
- **Adapter gotcha:** if an adapter (e.g. `adaptVilla`) doesn't map a DB column, that field silently becomes `undefined` and disappears from the UI — even though the column and mock both have it. When a field "won't show", check the adapter first.

`/gallery` is the exception: gallery captions/images come from the static `lib/data/gallery-images.ts`, not Supabase.

## Next.js Data Cache gotcha (dev)

Supabase reads go through `fetch`, which Next.js caches in the App Router Data Cache. After writing to Supabase (script or admin), the dev server keeps serving the **stale cached row**. To see the change locally: stop the server, `rm -rf .next`, restart. (Production reflects DB changes on the next deploy.)

## Pricing — one source of truth, recomputed server-side

`lib/booking/pricing.ts` → `computeBreakdown(state, settings)` is the **only** place that derives a `PriceBreakdown`. It is used by:
- `components/booking/BookingProvider.tsx` (client, live recompute on every state change, localStorage-persisted), and
- `app/api/checkout/route.ts` (server **recomputes** before charging — it never trusts client-supplied amounts).

Includes seasonal rates (low/high/peak — keep in sync with `components/sections/rates/RatesGrid.tsx`), a 14-night **long-stay discount** (10% off villa + cleaning), 30% deposit, and a 0 taxes line (TVA non applicable in French Polynesia). All arithmetic is in integer cents. Adding a breakdown field means updating the `PriceBreakdown` type, `computeBreakdown`, and the summary components (`PriceSummary`, `CheckoutSummary`) — plus the reservations insert + a DB column if it must persist.

## Auth, middleware, and required env

- `middleware.ts` refreshes the Supabase SSR session cookie on every request and gates `/admin/*` (redirects to `/admin/auth` when no `sb-*-auth-token` cookie). Full `admin_users` verification happens in the admin layout server component.
- **`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required or every route 500s** (the middleware constructs a Supabase client unconditionally). Server-side queries also need `SUPABASE_SERVICE_ROLE_KEY`.
- ⚠️ `.env.example` does **not** list the Supabase vars even though they're mandatory. Copy it to `.env.local` and add the three Supabase keys. The other integrations (Stripe, PayPal, Resend, Sanity, iCal, GA/Hotjar) all have mock fallbacks documented in the README and degrade gracefully when their keys are absent.

## Supabase schema & migrations

- Migrations: `supabase/migrations/NNN_*.sql`. **There is no Supabase CLI or migration runner** in this project — apply DDL manually via the Supabase dashboard SQL editor. Keep `lib/supabase/types.ts` and the relevant adapter/insert in sync when adding a column.
- `scripts/seed-from-mock.ts` mirrors `mock-data.ts` into Supabase, but it **DELETEs-then-INSERTs** the experiences/reviews/posts/faqs/gallery tables. **Do not run it casually** — it wipes operator-curated data (e.g. excursion providers). Prefer a targeted `scripts/update-*.ts` for single-field edits.

## Public site is English-only (no real i18n)

Public page copy is hardcoded English inside `components/sections/<page>/*`. There is **no i18n on the public site** — the `LanguageSwitcher` FR option is a disabled "coming soon" placeholder. French rendering relies on the visitor's **browser auto-translate**. To control machine translation, disambiguate the English source; to keep a value verbatim (numbers, units like "sq ft"), wrap it with `translate="no"` + the `notranslate` class. The **admin** does have French i18n.

## Structure (route groups)

`app/` App Router: `(marketing)/` public pages, `(legal)/` policies, `(admin)/admin/*` Supabase-gated back-office, `booking/` the funnel (+ `checkout`, `success/cancel`, `paypal/return`), `api/` endpoints (checkout, contact, ical, stripe/paypal webhooks, track), `studio/` (unused Sanity embed). Homepage is `app/page.tsx`, assembled from `components/sections/home/*`. Payments: Stripe Checkout + PayPal Orders v2; emails via Resend (React Email templates in `lib/resend/`).

## Deployment

**Netlify, Git-connected** (not Vercel — the README/`docs/12` are stale here). Pushing to `master` auto-deploys to **villa-paradise-tahiti-thierry.netlify.app** (`netlify.toml` → `npm run build` + `@netlify/plugin-nextjs`). The cleaner-named `villa-paradise-tahiti.netlify.app` site is intentionally paused. No manual deploy step is needed.
