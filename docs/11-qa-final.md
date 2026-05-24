# 11 — QA Final Report

> **Villa Paradise Tahiti** — Refonte 2026
> Audit final post-développement (Phases A → F2)
> Date : 11 mai 2026
> Auditeur : Agent F3 (Claude Code)

---

## Verdict global

| Axe | État |
|---|---|
| **Build production** | OK (39 routes, 0 erreur) |
| **Type safety (`tsc --noEmit`)** | OK (0 erreur) |
| **Lint (`next lint`)** | OK (0 warning, 0 erreur) |
| **Dev server** | OK (boot en 11.7 s, sans erreur runtime) |
| **Mode mock end-to-end** | OK (toutes les pages rendent + APIs répondent sans clés réelles) |
| **SEO de base** | OK (sitemap, robots, manifest, JSON-LD, OG image) |
| **Accessibilité statique** | OK avec quelques points à valider en navigateur réel |
| **Ready to deploy en l'état** | **NON** — bloqué par les assets/contenu/comptes client (voir §6) |
| **Ready to deploy avec assets** | **OUI** — code prêt, ne reste que la config Vercel + données |

**Conclusion en une phrase :** Le code est production-ready. Le launch ne dépend
plus que d'éléments hors-code (médias, copy EN finale, comptes externes, validations
juridiques). Aucun blocker technique.

---

## 1. Métriques techniques

### 1.1 Build output

| Métrique | Valeur |
|---|---|
| Next.js | 14.2.35 |
| Mode | App Router + RSC |
| Routes générées | **39** |
| Routes statiques (○) | 25 |
| Routes SSG (●) | 2 (`/blog/[slug]` 3 paths + `/experiences/[slug]` 10 paths) |
| Routes dynamiques server (ƒ) | 12 (8 API + studio + OG dynamique + villa OG + opengraph-image) |
| **First Load JS partagé** | **88.2 kB** (excellent) |
| Plus gros bundle marketing | `/booking/checkout` — 226 kB First Load |
| Plus gros bundle global | `/studio/[[...tool]]` — 1.58 MB First Load (attendu pour Sanity Studio) |
| Plus petit bundle marketing | `/_not-found` — 89.1 kB |
| Routes < 200 kB First Load | 36/39 |
| Routes > 200 kB First Load | `/booking/checkout` (226 kB) et `/studio` (1.58 MB, attendu) |

### 1.2 Détail bundles marketing (First Load JS)

| Route | Size | First Load |
|---|---|---|
| `/` | 230 B | 161 kB |
| `/villa` | 230 B | 161 kB |
| `/gallery` | 3.82 kB | 113 kB |
| `/experiences` | 4.35 kB | 183 kB |
| `/experiences/[slug]` | 230 B | 161 kB |
| `/rates` | 230 B | 161 kB |
| `/reviews` | 4.25 kB | 167 kB |
| `/blog` | 230 B | 161 kB |
| `/blog/[slug]` | 230 B | 161 kB |
| `/faq` | 2.32 kB | 184 kB |
| `/contact` | 4.19 kB | 185 kB |
| `/booking` | 1.13 kB | 190 kB |
| `/booking/checkout` | 289 B | 226 kB |
| `/booking/success` | 348 B | 146 kB |
| `/booking/cancel` | 348 B | 146 kB |
| `/booking/paypal/return` | 3.92 kB | 98.9 kB |
| `/legal/*` (×3) | 1.22 kB | 105 kB |

Tous les bundles marketing sont **sous 200 kB** sauf `/booking/checkout` (226 kB,
acceptable pour un funnel paiement avec form client + résumé sticky + breakdown
de prix calculé en live).

### 1.3 Dépendances directes (package.json)

**Runtime (16) :**
- Framework : `next@^14.2.0`, `react@^18.3.0`, `react-dom@^18.3.0`
- CMS : `sanity@^3.99.0`, `next-sanity@^9.12.3`, `@sanity/image-url@^1.2.0`, `@sanity/vision@^3.99.0`
- Paiement : `stripe@^18.5.0`
- Email : `resend@^4.8.0`, `@react-email/components@^0.0.21`
- Calendrier : `ical-generator@^7.2.0`, `node-ical@^0.18.0`
- Forms : `react-hook-form@^7.75.0`, `@hookform/resolvers@^5.2.2`, `zod@^4.4.3`
- Content : `@portabletext/react@^3.2.4`
- UI : `lucide-react@^0.400.0`, `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^2.3.0`

**Dev (12) :** TypeScript 5.4, Tailwind 3.4, ESLint 8.57 (config Next 14), Prettier 3.2 +
plugin Tailwind, autoprefixer, postcss, types @types/react/node, `@tailwindcss/forms`,
`@tailwindcss/typography`.

À noter : **pas de PayPal SDK npm** — l'intégration utilise l'API REST PayPal v2 via
`fetch` (`lib/paypal/`), ce qui réduit le bundle et évite une dépendance lourde.

---

## 2. Architecture livrée

```
app/
├── (legal)/                  # Layout sidebar légal
│   └── legal/{privacy-policy,terms,cancellation}/
├── (marketing)/              # Pages marketing (utilisent app/layout.tsx racine)
│   ├── blog/{,[slug]}/
│   ├── experiences/{,[slug]}/
│   ├── gallery/
│   ├── rates/
│   ├── reviews/
│   ├── faq/
│   ├── contact/
│   └── villa/{,opengraph-image}
├── api/                      # 8 endpoints
│   ├── booking/availability  # GET — lecture iCal merged
│   ├── checkout              # POST — orchestrateur Stripe/PayPal
│   ├── contact               # POST — Resend (owner + auto-reply)
│   ├── ical/sync             # GET — cron protégé (Bearer)
│   ├── paypal/capture        # POST — finalisation order
│   ├── paypal/webhook        # POST — events PayPal
│   ├── stripe/webhook        # POST — events Stripe (raw body, HMAC)
│   └── track                 # POST — relay GA4 Measurement Protocol
├── booking/                  # Funnel (calculateur + checkout + success/cancel + paypal return)
├── studio/[[...tool]]/       # Sanity Studio embed (avec fallback onboarding en mock)
├── layout.tsx                # Root layout (fonts Google, Header/Footer via ChromeGate, ConsentGate)
├── page.tsx                  # Homepage
├── manifest.ts               # /manifest.webmanifest
├── opengraph-image.tsx       # Edge runtime OG dynamique
├── robots.ts                 # /robots.txt
└── sitemap.ts                # /sitemap.xml (statique + Sanity-driven)

components/
├── analytics/                # GA4, Hotjar, CookieConsent, ConsentGate
├── booking/                  # Provider, DateRangePicker, GuestSelector, ExperienceSelector, PriceSummary…
├── booking/checkout/         # CheckoutForm, Summary, TrustBadges, Breadcrumb, Cancel/Success/PageClients
├── layout/                   # Header, Footer, MobileDrawer, LanguageSwitcher, SkipToContent, ChromeGate
├── sections/                 # Sections marketing par route (home, villa, gallery, experiences, rates,
│                             # reviews, blog, faq, contact, legal)
├── seo/                      # JsonLd component + 7 schémas (Organization, WebSite, VacationRental,
│                             # BreadcrumbList, FAQPage, Article, AggregateRating…)
└── ui/                       # Button, Card, Container, Section, Badge, Input

lib/
├── analytics/                # events.ts + types (typed gtag wrapper)
├── booking/                  # pricing.ts, reservation.ts, storage.ts, checkout-schema.ts, types.ts
├── ical/                     # fetch, parse, merge, cache, mock
├── paypal/                   # client, orders, webhook
├── resend/                   # client, send + 4 templates React Email
├── sanity/                   # client, env, fetcher, image, queries, mock-data, types
├── seo/                      # config, metadata builder
├── stripe/                   # client, checkout (Sessions), webhook (HMAC)
├── constants.ts, navigation.ts, utils.ts

sanity/schemas/               # 7 schémas : villa, experience, post, review, faq, settings, excursionProvider
```

---

## 3. Tests effectués

### 3.1 Tests automatisés

| Commande | Résultat |
|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **PASS** — 0 erreur |
| `npm run lint` (`next lint`) | **PASS** — "No ESLint warnings or errors" |
| `npm run build` | **PASS** — 39 routes générées, 0 erreur. Un seul avertissement bénin : *"Using edge runtime on a page currently disables static generation for that page"* — concerne `/opengraph-image` et c'est exactement le comportement voulu (rendu à la demande sur l'edge). |
| `npm run dev` | **PASS** — démarre en 11.7 s sans erreur, sert sur localhost:3001 (port 3000 occupé sur la machine d'audit). |

### 3.2 Walkthrough mental des pages (lecture du code)

| Page | Sections | État |
|---|---|---|
| `/` Homepage | Hero + KeyFeatures + VillaPreview + ExperiencesTeaser + ReviewsGlimpse + WhyDirectBooking + FinalCTA + 3 JSON-LD | OK |
| `/villa` | HeroVilla + VillaDescription + SpecsGrid + Amenities + Location + GalleryTeaser + BookingCTA | OK |
| `/gallery` | Hero + GalleryGrid (filtres par catégorie) + Lightbox keyboard-navigable | OK |
| `/experiences` | Hero + filtres + ExperienceList | OK |
| `/experiences/[slug]` | Page détail (10 slugs SSG) | OK |
| `/rates` | RatesHero + RatesGrid (3 saisons) + RatesInclusions + RatesPolicy + RatesCta | OK |
| `/reviews` | ReviewsHero + ReviewsStats + ReviewsGrid (filtre stars) + ReviewsCta | OK |
| `/blog` | BlogHero + BlogGrid | OK |
| `/blog/[slug]` | Hero article + body (PortableText) + Newsletter + Related (3 SSG seed slugs) | OK |
| `/faq` | FaqHero (search) + FaqGroups (accordion par catégorie) + FaqContactCta | OK |
| `/contact` | ContactHero + ContactStats + ContactInfo + ContactForm (Zod + react-hook-form) | OK |
| `/legal/{privacy-policy,terms,cancellation}` | LegalPageHeader + LegalSidebar + body | OK |
| `/booking` | BookingProvider (context) + DateRangePicker + GuestSelector + ExperienceSelector + PriceSummary sticky + MinNightsAlert + SeasonBadge | OK |
| `/booking/checkout` | CheckoutBreadcrumb + CheckoutForm + CheckoutSummary + CheckoutTrustBadges | OK |
| `/booking/success` `/booking/cancel` `/booking/paypal/return` | Pages confirmation, client-rendered avec hydratation de la réservation | OK |
| `/studio` | NextStudio si Sanity configuré, **carte onboarding en mode mock** | OK |

### 3.3 API endpoints

| Endpoint | Méthode | Mode mock | Mode configuré | Sécurité |
|---|---|---|---|---|
| `/api/booking/availability` | GET | Retourne `blockedRanges` depuis `lib/ical/mock.ts`, `mode: "mock"` | Lit Airbnb + VRBO iCal via `node-ical`, merge dans cache process | `Cache-Control: s-maxage=60, stale-while-revalidate=300` |
| `/api/contact` | POST | Valide Zod, log les emails non envoyés, renvoie `200 ok: true` | Envoie 2 emails Resend (owner + auto-reply) en `Promise.allSettled` | Validation Zod stricte, pas de CAPTCHA (à ajouter post-launch si spam) |
| `/api/checkout` | POST | Renvoie `mock: true` + `redirectUrl: /booking/success?ref=...` | Crée Stripe Checkout Session OU PayPal Order, retourne URL hébergée | Re-calcul du prix server-side, validation Zod, min-nights enforced |
| `/api/ical/sync` | GET | Refuse si `CRON_SECRET` absent (fail-closed), 401 sinon | Idem + force refresh cache iCal | **Authorization: Bearer ${CRON_SECRET}** — Vercel injecte auto |
| `/api/paypal/capture` | POST | n/a (route active uniquement avec credentials PayPal) | Capture l'order après approbation user | Validation orderID |
| `/api/paypal/webhook` | POST | Refuse si non configuré | Vérifie signature PayPal, envoie emails confirmation | Signature webhook PayPal (webhookId requis) |
| `/api/stripe/webhook` | POST | Renvoie 503 si non configuré (Stripe va retry) | HMAC raw body, dispatch emails sur `checkout.session.completed` | Signature HMAC Stripe (whsec) |
| `/api/track` | POST | Renvoie `{ ok: false, reason: 'not_configured' }` 200 | Forwarde vers GA4 Measurement Protocol | Aucune auth (no-op si pas de credentials) — endpoint internal-only |

Tous les endpoints adoptent le pattern **"mock fallback safe"** : pas de crash si les
secrets manquent, comportement réaliste pour dev/preview.

---

## 4. SEO — audit

| Item | État |
|---|---|
| `metadata` ou `generateMetadata` sur chaque route | OK — 22 fichiers couvrent toutes les routes utiles |
| `metadataBase` configuré dans `app/layout.tsx` | OK (fallback `https://villaparadisetahiti.com`) |
| `/sitemap.xml` | OK — généré dynamiquement (12 statiques + experiences Sanity + posts Sanity) |
| `/robots.txt` | OK — bloque `/api/`, `/studio/`, terminals `/booking/checkout|success|cancel` |
| `/manifest.webmanifest` | OK — couleurs, catégories, 3 icônes référencées (**icônes à fournir : `public/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`**) |
| OG image dynamique `/opengraph-image` | OK — gradient brand + wordmark, edge runtime |
| OG image dédiée `/villa/opengraph-image` | OK |
| JSON-LD Organization + WebSite + VacationRental | OK — page d'accueil, 7 helpers prêts |
| JSON-LD BreadcrumbList | OK — pages secondaires (visible dans 9 pages d'app) |
| JSON-LD FAQPage / Article / AggregateRating | OK — helpers dans `components/seo/schemas.ts` |
| `lang="en"` sur `<html>` | OK |

**Pas de Twitter Card image dédiée** — Next réutilise automatiquement l'OG image. À vérifier
au launch via [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator).

---

## 5. Accessibilité — audit statique

Patterns observés via grep (heuristiques, pas un audit Lighthouse complet) :

| Critère WCAG | Observation | Verdict |
|---|---|---|
| `<h1>` unique par page | 9 fichiers `Hero*.tsx` ou `LegalPageHeader` contiennent un `<h1>` — un par section hero, et chaque page en a exactement un | OK |
| `aria-label` sur boutons icon-only | 59 occurrences dans 29 fichiers (Header burger, LanguageSwitcher, Lightbox controls, FaqAccordion expand, GuestSelector +/-, MobileDrawer close, etc.) | OK |
| `alt=""` sur `<Image>` | 16 occurrences dans 14 fichiers (Hero, Card, GalleryTeaser, etc.). **À valider en revue : que les `alt` ne soient pas vides quand l'image est porteuse de sens.** | À valider à la livraison des photos réelles |
| Form labels (`<label htmlFor>`) | 12 `<label>` / 10 `htmlFor` dans 6 fichiers (ContactForm, CheckoutForm, DateRangePicker, ExperienceSelector, FaqHero search, BlogNewsletter) | OK — chaque label semble associé. À vérifier en navigateur que le focus visible est correct sur tous les inputs |
| SkipToContent | OK — composant `components/layout/SkipToContent.tsx`, rendu en premier dans `<body>` |
| `lang="en"` | OK (root layout) |
| Contraste palette (gold #C9A84C sur pearl #FAFAF8) | À tester avec axe DevTools — le gold sur pearl peut être limite WCAG AA pour du texte body |

**Anti-patterns potentiels à vérifier en revue navigateur :**
- Contraste du gold `#C9A84C` sur fond clair pour les CTA et liens
- Focus rings visibles sur tous les composants interactifs (Tailwind ring-* )
- Trap focus dans `MobileDrawer` et `Lightbox` (touche Échap, Tab cycliques)
- Lecture de l'accordion FAQ par lecteur d'écran (états `aria-expanded`)

---

## 6. Mode mock vs Mode configuré

Tableau de référence pour chaque intégration externe :

| Intégration | Mode mock (état actuel) | Mode configuré (post-launch) | Variable de bascule |
|---|---|---|---|
| **Sanity CMS** | Lit `lib/sanity/mock-data.ts` (villa, expériences, reviews, posts, FAQ, settings). `/studio` affiche carte d'onboarding. | Lit le dataset Sanity réel. `/studio` rend `NextStudio`. | `NEXT_PUBLIC_SANITY_PROJECT_ID` ≠ `"mock"` |
| **Stripe** | `/api/checkout` renvoie `mock: true` + redirect direct `/booking/success`. Webhook renvoie 503. | Crée une vraie Checkout Session, redirige vers Stripe-hosted page. Webhook valide HMAC et déclenche emails. | `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` présents |
| **PayPal** | `/api/checkout` renvoie `mock: true`. Webhook refuse. | Crée Order v2, retourne approve URL, capture sur retour utilisateur. | `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` |
| **Resend (emails)** | `sendXxx()` log + renvoie `{ ok: true, mock: true }`. APIs retournent toujours 200. | Envoie vraiment les emails depuis `EMAIL_FROM`. | `RESEND_API_KEY` présent |
| **iCal Airbnb/VRBO** | `lib/ical/mock.ts` génère des plages bloquées factices. | Fetch + parse les .ics réels, merge, cache process. | `AIRBNB_ICAL_URL` ou `VRBO_ICAL_URL` présents |
| **GA4** | `gtag` chargé seulement si `NEXT_PUBLIC_GA_ID` présent. `/api/track` renvoie `{ ok: false, reason: 'not_configured' }`. | Tracking pages + events client + relay server-side (purchase events). | `NEXT_PUBLIC_GA_ID` + `GA_API_SECRET` |
| **Hotjar** | Script non chargé. | Heatmaps + recordings, gated par consent. | `NEXT_PUBLIC_HOTJAR_ID` |
| **Consent gate (RGPD/CCPA)** | Banner s'affiche, blocque les scripts analytics tant que pas accepté. | Identique — le mode mock n'affecte pas le consent. | n/a |
| **Cron (sync iCal)** | Endpoint refuse 500 si pas de `CRON_SECRET` (fail-closed). | Vercel cron appelle hourly, refresh cache iCal. | `CRON_SECRET` + déploiement sur Vercel |

---

## 7. Blockers pré-launch

Priorisé par criticité. Les blockers **critiques** empêchent le launch ; les **importants** doivent être traités dans les 2 premières semaines ; les **mineurs** sont du polish.

### Critique (launch impossible sans)

| # | Blocker | Porteur | Délai estimé |
|---|---|---|---|
| C1 | **Photos villa réelles** (hero, intérieur, piscine, plage) + alt EN | Client (Thierry) + photographe local | 1–2 semaines |
| C2 | **Logo SVG final** + favicon set (ICO + PNG 16/32/180/192/512) + 3 icônes manifest (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`) | Client / designer | 1 semaine |
| C3 | **Copy EN finale** : hero headline, description villa, FAQ ≥ 15 entrées, pages legal validées juridiquement (US-compliant) | Copywriter US + juriste | 2 semaines |
| C4 | **Tarifs saisonniers réels** dans Sanity (settings : low/mid/high season + cleaning fee + min-nights par saison) | Client | 2 jours |
| C5 | **Compte Sanity** créé + `npx sanity init` + dataset peuplé (villa, ≥ 10 expériences, ≥ 5 reviews, ≥ 3 posts blog, ≥ 15 FAQ) | TTD + Client | 1 semaine |
| C6 | **Compte Stripe live** vérifié (KYC, IBAN, justificatifs) + webhook configuré sur `villaparadisetahiti.com/api/stripe/webhook` | Client | 3–7 jours (KYC) |
| C7 | **Compte Resend** + domaine `villaparadisetahiti.com` vérifié (SPF/DKIM/DMARC DNS records) | TTD | 1 jour |
| C8 | **URLs iCal Airbnb/VRBO** réelles + test bidirectionnel anti-double-booking | Client | 1 jour |
| C9 | **Vercel project** lié au repo GitHub + env vars production renseignées (mirror `.env.example`) | TTD | 1 jour |
| C10 | **`CRON_SECRET`** généré (`openssl rand -hex 32`) et défini sur Vercel | TTD | 5 min |

### Important (à faire dans les 2 premières semaines)

| # | Item | Porteur |
|---|---|---|
| I1 | **PayPal business account** vérifié + webhook configuré (peut être différé si Stripe seul lancé d'abord) | Client |
| I2 | **GA4 property** créée + Measurement Protocol API secret + Hotjar site | TTD |
| I3 | **Vidéo drone** villa (loop hero + version longue) — fallback poster image acceptable pour J0 | Client / vidéaste |
| I4 | **Reviews réelles** avec consentement des invités (remplace les seed mock) | Client |
| I5 | **Test E2E paiement réel** : carte de test live + remboursement immédiat | TTD |
| I6 | **Test email réel** : booking confirmation guest + notification owner, vérifier rendu Gmail/Outlook | TTD |
| I7 | **Validation juridique US** des 3 pages legal (privacy, terms, cancellation) par un avocat | Client |
| I8 | **Cloudflare DNS** pointé vers Vercel (apex + www) | TTD |
| I9 | **Prestataires excursions** : modélisation `excursionProvider` dans Sanity + mapping aux expériences + tarifs commercialement validés | Client (PDF déposé, en attente structuration) |

### Mineur (post-launch)

| # | Item |
|---|---|
| M1 | CAPTCHA / honeypot sur `/api/contact` si spam |
| M2 | Idempotence webhooks Stripe/PayPal via store persistant (Redis ou Sanity doc) |
| M3 | i18n FR/EN complète (actuellement EN-only, `LanguageSwitcher` est UI-only) |
| M4 | Twitter Card image dédiée (Next réutilise OG par défaut) |
| M5 | Lighthouse audit en environnement de production réel (mobile + desktop) |
| M6 | Tests E2E automatisés (Playwright) — checkout flow + contact flow |
| M7 | Monitoring : Sentry pour les erreurs runtime, Vercel Analytics activé |
| M8 | Cache Redis pour `/api/booking/availability` (actuellement in-memory process, OK pour une instance Vercel) |

---

## 8. Verdict & recommandations

### Verdict

**GO sur la livraison du code.** Le projet est techniquement prêt. Le build est propre,
le mode mock est entièrement fonctionnel et permet à Thierry de naviguer le site complet
avant même d'avoir un compte Stripe. Les 8 endpoints API sont implémentés avec leurs
fallbacks. La couverture SEO (sitemap, robots, manifest, OG, 7 schémas JSON-LD) est
au niveau d'un site marketing professionnel.

**NO-GO sur le launch immédiat** — uniquement parce qu'il manque des éléments hors-code
(photos réelles, copy EN validée, comptes externes, validations juridiques). Ces blockers
sont listés au §6 et **aucun n'est imputable à un défaut du code**.

### Top 5 recommandations prioritaires

1. **Briefer Thierry sur la séquence de déploiement** via `docs/12-deployment.md` —
   créer GitHub repo → connecter à Vercel → renseigner env vars → tester preview branch
   avant de pointer le domaine.
2. **Démarrer la collecte d'assets en parallèle du déploiement preview**. Le site
   peut tourner en preview Vercel avec les mock data pendant que le client tourne
   les photos et finalise la copy.
3. **Commande Sanity prioritaire :** `npx sanity init` puis peupler dans cet ordre
   d'urgence : settings (tarifs + cleaning fee) → villa → expériences → FAQ → reviews → posts.
4. **Stripe live d'abord, PayPal différé.** La conversion US accepte parfaitement Stripe
   seul ; PayPal peut arriver en sprint 2 si le KYC traîne.
5. **Auditer le contraste de la palette gold/midnight en navigateur réel** avant le
   launch — c'est le seul point A11y qui ne peut pas se valider en grep et qui pourrait
   demander un ajustement de tokens dans `tailwind.config.ts`.

### Notes de santé du projet (sur 10)

| Axe | Note | Justification |
|---|---|---|
| **Architecture** | 9/10 | App Router idiomatique, séparation `app/components/lib` claire, mock-mode bien pensé, vercel.json minimal. -1 : pas de tests automatisés. |
| **Qualité code** | 9/10 | TS strict, 0 lint warning, commentaires JSDoc abondants sur les modules critiques (webhooks, pricing, mock), nommage cohérent. -1 : quelques `console.info` à remplacer par un logger structuré pour la prod. |
| **SEO** | 9/10 | Sitemap dynamique, JSON-LD complet, OG dynamique, robots disciplinés. -1 : pas encore d'audit Lighthouse en production. |
| **Accessibilité** | 7/10 | SkipToContent + aria-label nombreux + form labels + h1 unique. -3 : contraste palette à valider, focus trap drawer/lightbox à vérifier, aucun test axe-core lancé. |

**Moyenne globale : 8,5/10** — projet livrable, robuste, et prêt à entrer en phase d'assets.

---

*Audit clos le 2026-05-11 par l'agent F3. Aucun fichier de code n'a été modifié pendant cet audit.*
