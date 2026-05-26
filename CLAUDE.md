# Villa Paradise Tahiti — Instructions Claude Code

> Projet : refonte site de location villa de luxe à Tahiti, cible clientèle US.
> Agence : TahitiTechDigital (TTD) · Chef de projet : Stephano Belleme-Atuahiva
> Stack : Next.js 14 App Router · TypeScript strict · Tailwind CSS · Sanity · Supabase

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14.2 (App Router, RSC) |
| Langage | TypeScript strict — jamais de `any` |
| Styling | Tailwind CSS 3.4 uniquement — pas de CSS custom |
| CMS | Sanity (`next-sanity`) — schemas dans `sanity/schemas/` |
| BDD / Auth admin | Supabase (PostgreSQL + Auth) — migrations dans `supabase/migrations/` |
| Paiement | Stripe Checkout + PayPal Orders v2 (via fetch, pas de SDK npm PayPal) |
| Email | Resend + templates React Email (`lib/resend/`) |
| Calendrier | `node-ical` (parse) + `ical-generator` (génère) |
| Forms | `react-hook-form` + `zod` |
| Icônes | `lucide-react` uniquement |

---

## Conventions de code

- **Composants** : fonctionnels, PascalCase, fichiers kebab-case (`villa-hero.tsx`)
- **Imports** : absolus avec alias `@/` (configuré dans `tsconfig.json`)
- **Nommage** : camelCase variables, PascalCase composants/types
- **Tailwind** : classes directement dans le JSX — pas de `cn()` sauf pour les variants conditionnels
- **Server vs Client** : utiliser des RSC (Server Components) par défaut — ajouter `'use client'` seulement si nécessaire (hooks, events browser)
- **Server Actions** : dans `app/actions/` pour les mutations admin

---

## Architecture App Router

```
app/
  (admin)/admin/      → Back-office protégé (Supabase Auth via middleware.ts)
  (marketing)/        → Pages publiques marketing
  (legal)/            → Pages légales
  booking/            → Funnel de réservation
  studio/             → Sanity Studio embed
  api/                → API Routes (10 endpoints)
```

Le `middleware.ts` à la racine protège `/admin/*` : vérifie le cookie Supabase Auth
et redirige vers `/admin/auth` si absent. La vérification complète (`admin_users` table)
se fait dans le layout server component de l'admin.

---

## Mock vs Live

Toutes les intégrations externes ont un fallback mock — le site tourne sans aucune clé réelle.

| Intégration | Var de bascule | Mode mock |
|---|---|---|
| Sanity CMS | `NEXT_PUBLIC_SANITY_PROJECT_ID` ≠ `"mock"` | Lit `lib/sanity/mock-data.ts` |
| Stripe | `STRIPE_SECRET_KEY` présent | `/api/checkout` → `mock: true` |
| PayPal | `PAYPAL_CLIENT_ID` présent | Idem |
| Resend | `RESEND_API_KEY` présent | Emails loggés, non envoyés |
| iCal | `AIRBNB_ICAL_URL` présent | `lib/ical/mock.ts` (plages factices) |
| GA4 | `NEXT_PUBLIC_GA_ID` présent | Scripts non chargés |
| Supabase (admin) | `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` | Admin inaccessible |

---

## Commandes utiles

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build prod (vérifie avant de livrer)
npm run typecheck    # tsc --noEmit — doit passer à 0 erreur
npm run lint         # ESLint — doit passer à 0 warning
npm run format       # Prettier
```

---

## Contexte métier

- **Prix** : toujours en USD (marché US). Le XPF n'apparaît pas sur le site public.
- **Tarifs de base** : villa $690/nuit, nettoyage $150, excursions $150/pers
- **Saisons** : low ($590), mid ($690), high ($890), peak ($1290) — configurables dans Sanity/settings
- **Acompte** : 30% du total au booking (configurable dans les settings Supabase)
- **Annulation** : 50% remboursé à 60+ jours, 100% non-remboursable à -30 jours
- **Capacité** : 8 personnes max, 4 chambres king

## Règles strictes

- **JAMAIS** de clés API côté client — uniquement dans les Server Actions/API Routes
- **JAMAIS** committer `.env.local` (déjà dans `.gitignore`)
- Recalculer le prix côté serveur dans `/api/checkout` — ne jamais faire confiance au total envoyé par le client
- Le domaine email Resend doit être `villaparadisetahiti.com` (vérifié SPF/DKIM)
- Les webhooks Stripe/PayPal vérifient la signature HMAC — ne pas contourner

---

## Documentation projet

Les docs de référence sont dans `docs/` :

- `PRD.md` — décisions client validées (tarifs, capacité, politiques)
- `04-fonctionnalites.md` — fonctionnalités (calculateur, panier, calendrier)
- `06-technique-stack.md` — stack technique détaillé
- `10-todo-post-assets.md` — blockers avant go-live (photos, comptes, copy)
- `11-qa-final.md` — rapport QA (Phase F3, 2026-05-11)
- `12-deployment.md` — guide déploiement Vercel
