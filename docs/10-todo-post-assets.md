# 10 — TODO Post-Assets

> **Villa Paradise Tahiti — Refonte 2026**
> Phase A scaffolding placeholder file. Track every real asset / credential
> that must replace a scaffolding placeholder before going live.

---

## How to use

When you replace a placeholder with the real thing, check the corresponding
box and add a short note (date, source, who delivered it). Keep this file as
the single source of truth for the "what's still fake?" question.

---

## État au 2026-05-11 (audit F3)

Le code est complet et le build passe (39 routes, 0 erreur). **Aucun blocker
technique** ne reste — uniquement des éléments hors-code (assets, copy,
comptes externes, validations juridiques).

**Synthèse des cases restantes à cocher** (rien n'est encore livré au 2026-05-11) :

- Sections 1–7 : 100 % à faire (assets clients en attente).
- Section 8 : 100 % à faire (comptes externes à ouvrir).

**Top-3 chemins critiques à enclencher en parallèle :**

1. **Photos villa** (§1) — bloquer une journée avec un photographe local. Sans
   ces visuels, le hero homepage et `/gallery` restent en placeholder SVG.
2. **Compte Sanity + peuplement** (§8 ligne 1, puis voir `docs/12-deployment.md` §5.1)
   — débloque la copy EN, les expériences, les FAQ, les reviews en une seule fois.
3. **Stripe live + Resend domaine vérifié** (§5 + §8) — débloque toute la chaîne
   paiement + emails confirmation. Compter ~7 jours pour le KYC Stripe.

Voir `docs/11-qa-final.md` §6 (Blockers pré-launch) pour la priorisation détaillée
critique / important / mineur.

---

## 1. Photos villa

- [ ] Hero photo (exterior, golden hour) — 16:9, min 2560x1440
- [ ] Hero photo mobile (portrait crop) — 9:16
- [ ] Living room (wide angle)
- [ ] Master bedroom + ensuite
- [ ] Secondary bedrooms (x?)
- [ ] Kitchen + dining
- [ ] Pool + deck (day)
- [ ] Pool + deck (sunset / night)
- [ ] Garden / outdoor lounge
- [ ] Beach access shots
- [ ] Bathrooms + amenities (towels, toiletries detail)
- [ ] Detail shots: art, textures, native flora
- [ ] All photos: AVIF + WebP variants, alt text in EN, EXIF stripped

> Current placeholder: `public/placeholder.svg`

## 2. Vidéo drone

- [ ] Aerial flyover (30–60s) — 4K, 24fps
- [ ] Compressed web cuts: 1080p hero loop (10s, muted, autoplay) + full version
- [ ] Vertical 9:16 cut for social / mobile hero
- [ ] Audio bed (royalty-free Polynesian-inspired) or muted

## 3. Copy EN final

- [ ] Homepage hero headline + subhead (US copywriter)
- [ ] Villa description (long-form, 600–800 words)
- [ ] Each experience description (8–12, ~150 words each)
- [ ] Rates page copy (pricing logic, cancellation policy, deposit terms)
- [ ] Reviews / testimonials (real guest quotes with consent)
- [ ] Blog seed posts (3–5 SEO articles for launch)
- [ ] FAQ — 15+ entries
- [ ] Legal: Terms of Service, Privacy Policy, Refund Policy (US-compliant)
- [ ] Email templates: booking confirmation, owner notification, balance reminder
- [ ] Meta titles + descriptions for every page (US English, ≤ 160 chars)

## 4. URLs iCal réelles

- [ ] Airbnb iCal export URL → set `AIRBNB_ICAL_URL` in Vercel env
- [ ] VRBO iCal export URL (if applicable) → set `VRBO_ICAL_URL`
- [ ] Validate parsing locally before deploy (`node-ical` round trip)
- [ ] Test double-booking prevention: book on Airbnb, confirm dates blocked on site

## 5. Comptes Stripe / PayPal live

- [ ] Stripe account verified (business info, bank account, tax forms)
- [ ] Stripe live keys → `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- [ ] Stripe webhook configured on production URL → `STRIPE_WEBHOOK_SECRET`
- [ ] PayPal business account verified
- [ ] PayPal live credentials → `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=live`
- [ ] End-to-end booking test in live mode with real card + immediate refund

## 6. Logo SVG + brand assets

- [ ] Final logo SVG (horizontal lockup)
- [ ] Final logo SVG (mark only, for favicon / icon)
- [ ] Favicon set (ICO + 16/32/180/192/512 PNG + manifest)
- [ ] Apple touch icon
- [ ] OpenGraph image (1200x630) — for social shares
- [ ] Twitter card image
- [ ] Brand color palette locked in `tailwind.config.ts` (Phase B1)
- [ ] Typography: Google Fonts choices confirmed and loaded via `next/font`

## 7. Prestataires d'excursions

- [ ] Fichier client déposé dans `docs/assets-client/` (en attente du client)
- [ ] Liste structurée des prestataires (nom, contact, prestations, tarifs, conditions)
- [ ] Modélisation en type Sanity `excursionProvider` (Phase B3) ou table Supabase
- [ ] Mapping prestataires ↔ expériences vendues sur le site
- [ ] Validation tarifs réels (remplacer placeholder uniforme `$150/pers`)
- [ ] Accords commerciaux (commission, exclusivité, conditions de paiement)

## 8. Tiers / Comptes externes

- [ ] Sanity project created → `NEXT_PUBLIC_SANITY_PROJECT_ID`, dataset, API token
- [ ] Resend domain verified (`villaparadisetahiti.com`) → `RESEND_API_KEY`
- [ ] Google Analytics 4 property created → `NEXT_PUBLIC_GA_ID`
- [ ] Hotjar site created → `NEXT_PUBLIC_HOTJAR_ID`
- [ ] Cloudflare DNS pointed at Vercel
- [ ] Vercel project linked to GitHub repo
- [ ] Production env vars filled in Vercel dashboard (mirror `.env.example`)
