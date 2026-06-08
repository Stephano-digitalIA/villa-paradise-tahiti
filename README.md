# Villa Paradise Tahiti — Refonte 2026

> **Client :** Villa Paradise Tahiti (villaparadisetahiti.com)
> **Agence :** TahitiTechDigital (TTD)
> **Chef de projet :** Stephano Belleme-Atuahiva
> **État au 2026-05-11 :** Phase 1 (scaffold + dev) livrée — prêt à déployer après livraison des assets client.

---

## Contexte

Refonte complète d'un site de location saisonnière de villa à Tahiti, actuellement
sur Wix (design daté). Cible : clientèle américaine haut de gamme. Objectif principal :
augmenter les réservations directes et réduire la dépendance à Airbnb.

---

## Stack

| Couche | Choix |
|---|---|
| Framework | **Next.js 14.2** (App Router) |
| Langage | **TypeScript** strict |
| UI | **Tailwind CSS 3.4** + composants maison + `lucide-react` |
| Données / Auth / Storage | **Supabase** (Postgres + RLS) — couche données réelle. ⚠️ `sanityFetch()` lit **Supabase**, pas Sanity (voir [CLAUDE.md](CLAUDE.md)) |
| CMS (legacy, inutilisé) | **Sanity** en mode `mock` — Studio `/studio` non branché |
| Paiement | **Stripe** Checkout + **PayPal** Orders v2 |
| Email | **Resend** + templates React Email |
| Calendrier | **node-ical** + **ical-generator** (sync Airbnb / VRBO) |
| Analytics | **GA4** + **Hotjar** (gated par consent) |
| Forms | **react-hook-form** + **zod** |
| Hébergement | **Netlify** (`@netlify/plugin-nextjs`, auto-deploy sur push `master`) |

---

## Commandes principales

```bash
npm install            # installation des dépendances
npm run dev            # serveur de dev (http://localhost:3000)
npm run build          # build production (39 routes)
npm run start          # serveur prod local après build
npm run lint           # next lint (eslint-config-next)
npm run lint:fix       # auto-fix lint
npm run typecheck      # tsc --noEmit (TS strict)
npm run format         # prettier --write .
```

État au 2026-05-11 :
- `npm run typecheck` → 0 erreur
- `npm run lint` → 0 warning, 0 erreur
- `npm run build` → 39 routes générées, 0 erreur, First Load JS partagé = 88.2 kB

---

## Variables d'environnement

Copier `.env.example` vers `.env.local` (jamais commité) et renseigner ce qui est
disponible. **Supabase est requis** (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — sans ces clés le
middleware fait planter chaque route (500). ⚠️ Ces vars **ne sont pas** listées
dans `.env.example` : les ajouter manuellement. Les **autres** intégrations
(Stripe, PayPal, Resend, iCal, GA/Hotjar) ont toutes un mode mock.

Bascules mock → live :

| Var manquante | Comportement mock |
|---|---|
| Supabase vide / requête sans résultat | Repli sur `lib/sanity/mock-data.ts`. Sinon le contenu live vient de **Supabase** (ce n'est PAS du mock) |
| `STRIPE_*` absent | `/api/checkout` renvoie `mock: true` + redirect direct vers `/booking/success` |
| `PAYPAL_*` absent | Idem |
| `RESEND_API_KEY` absent | `/api/contact` retourne 200, emails loggés mais non envoyés |
| `AIRBNB_ICAL_URL` + `VRBO_ICAL_URL` absents | `lib/ical/mock.ts` fournit des plages factices |
| `NEXT_PUBLIC_GA_ID` absent | Scripts GA non chargés, `/api/track` renvoie `not_configured` |
| `NEXT_PUBLIC_HOTJAR_ID` absent | Hotjar non chargé |

---

## Documentation

Toute la doc projet vit dans `docs/`.

| Fichier | Sujet |
|---|---|
| [01-vision-projet.md](docs/01-vision-projet.md) | Vision business, pain points, KPIs |
| [02-design-identite.md](docs/02-design-identite.md) | Palette, typographie, moodboard |
| [03-cible-marche-us.md](docs/03-cible-marche-us.md) | Personas US, trust signals |
| [04-fonctionnalites.md](docs/04-fonctionnalites.md) | Features complètes (calculateur, panier, calendrier) |
| [05-contenu-pages.md](docs/05-contenu-pages.md) | Arborescence + direction copy par page |
| [06-technique-stack.md](docs/06-technique-stack.md) | Stack technique détaillé |
| [07-expansion.md](docs/07-expansion.md) | Phases futures (marketplace, fidélité, i18n) |
| [10-todo-post-assets.md](docs/10-todo-post-assets.md) | TODO assets / credentials avant launch |
| [**11-qa-final.md**](docs/11-qa-final.md) | **Rapport QA final (audit F3, 2026-05-11)** |
| [**12-deployment.md**](docs/12-deployment.md) | **Guide de déploiement Vercel pour Thierry** |

---

## Arborescence rapide

```
app/                  # App Router (39 routes)
  (legal)/            # privacy-policy, terms, cancellation
  (marketing)/        # villa, gallery, experiences, rates, reviews, blog, faq, contact
  api/                # 8 endpoints (booking, checkout, contact, ical, stripe, paypal, track)
  booking/            # funnel : index + checkout + success/cancel + paypal/return
  studio/             # Sanity Studio embed
components/
  analytics/  booking/  layout/  sections/  seo/  ui/
lib/
  analytics/  booking/  ical/  paypal/  resend/  sanity/  seo/  stripe/
sanity/schemas/       # villa, experience, post, review, faq, settings, excursionProvider
docs/                 # doc projet
public/               # placeholder.svg (sera remplacé par les vrais assets)
```

---

## Workflow projet (réalisé)

```
✅ Étape 1   Documentation Markdown
✅ Étape 2   Zip + contexte Claude Code
✅ Étape 3   Recommandation framework → Next.js 14
✅ Étape 4   5 pages template HTML (statiques)
✅ Phase A-F2 Scaffold + dev + intégrations + QA
🚧 Phase G   Livraison assets client + go-live
```

Pour déployer : voir **[docs/12-deployment.md](docs/12-deployment.md)**.
Pour le statut détaillé : voir **[docs/11-qa-final.md](docs/11-qa-final.md)**.

---

*TahitiTechDigital — Ia ora na*
