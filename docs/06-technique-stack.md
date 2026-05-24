# 06 — Stack Technique

> **Villa Paradise Tahiti — Refonte 2026**
> Dernière mise à jour : Mars 2026

---

## 1. Contraintes techniques

### Contexte
- **Développeur** : Claude Code / TTD (AI-assisted development)
- **Maintenance** : propriétaire de la villa (non-technique) pour le contenu
- **Budget hébergement** : optimisé (tier gratuit ou faible coût)
- **Performance** : Core Web Vitals > 90 (cible Google US)
- **SEO** : critique pour la stratégie d'acquisition organique US
- **Scalabilité** : doit supporter des pics de trafic (campagnes, saisons)
- **Sécurité paiement** : conformité PCI DSS via Stripe/PayPal (jamais de carte stockée en propre)

---

## 2. Recommandations Framework (à confirmer à l'Étape 3)

Trois candidats principaux, à présenter avec des templates (Étape 4) :

### Option A — Next.js 14+ (Recommandation principale)

**Pourquoi :**
- SSR (Server-Side Rendering) + SSG (Static Site Generation) = SEO optimal
- App Router (React Server Components) = performance maximale
- Écosystème React mature = composants disponibles pour tout (galerie, dates, paiement)
- Vercel (créateur de Next.js) = déploiement one-click, CDN mondial, gratuit jusqu'à un certain volume
- Image optimization native (`next/image`) = WebP automatique
- Support TypeScript natif

**Inconvénients :**
- Plus complexe que les alternatives pour les débutants
- Coût Vercel si gros trafic (mais très peu probable pour ce type de site)

**Hébergement :** Vercel (gratuit jusqu'à 100GB bandwidth/mois)

---

### Option B — Astro (Alternative légère)

**Pourquoi :**
- Performance extrême (génère du HTML statique avec 0 JS par défaut)
- Idéal pour sites à contenu majoritairement statique (villa, galerie, blog)
- Supporte React, Vue, Svelte dans le même projet (islands architecture)
- Lighthouse score 100/100 natif

**Inconvénients :**
- Moins adapté pour le calculateur interactif (nécessite des "islands" React)
- Écosystème plus jeune que Next.js
- Moins de composants prêts-à-l'emploi

**Hébergement :** Netlify ou Vercel

---

### Option C — Remix (Alternative moderne)

**Pourquoi :**
- Focus sur les performances web et l'expérience utilisateur
- Gestion des formulaires et des mutations native et robuste
- Bon pour les apps avec beaucoup d'interactivité (calculateur, panier)

**Inconvénients :**
- Écosystème plus petit que Next.js
- Moins de ressources/tutoriels

**Hébergement :** Vercel, Fly.io

---

## 3. Stack Technique Détaillée (basée sur Next.js)

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 14.x | Framework principal (SSR/SSG/ISR) |
| React | 18.x | UI library |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 3.x | Styling utilitaire |
| Framer Motion | 11.x | Animations |
| Lucide React | latest | Icônes (line style) |
| React Hook Form | 7.x | Gestion des formulaires (calculateur) |
| Zod | 3.x | Validation des données |
| date-fns | 3.x | Manipulation des dates |
| react-day-picker | 8.x | Calendrier de disponibilité |
| Swiper.js | 11.x | Carousel reviews + galerie mobile |
| yet-another-react-lightbox | latest | Lightbox galerie |

### Backend / API

| Technologie | Rôle |
|---|---|
| Next.js API Routes | Endpoints backend (réservation, paiement, contact) |
| Stripe SDK | Paiement carte bancaire (acompte) |
| PayPal SDK | Paiement alternatif |
| Nodemailer + Resend | Emails transactionnels (confirmation réservation) |
| ical-generator | Génération fichiers iCal pour sync calendrier |
| node-ical | Parsing iCal depuis Airbnb/VRBO |

### CMS (gestion de contenu)

**Choix recommandé : Sanity.io**

Pourquoi Sanity :
- Interface d'administration intuitive (le propriétaire peut modifier le contenu sans dev)
- Gratuit jusqu'à 3 utilisateurs + 500K API requests/mois
- GROQ query language puissant
- Intégration Next.js officielle
- Gestion des images avec CDN intégré (Sanity CDN)
- Types de contenu à créer :
  - `villa` — informations et description de la villa
  - `experience` — excursions et prestations traiteur
  - `review` — témoignages clients
  - `post` — articles de blog
  - `faq` — questions/réponses
  - `settings` — tarifs, disponibilités de base, contact

**Alternative :** Contentful (plus cher mais plus mature)

### Hébergement & Infrastructure

| Service | Rôle | Coût |
|---|---|---|
| Vercel | Hébergement Next.js, CDN mondial | Gratuit (Hobby) → $20/mois (Pro) |
| Sanity.io | CMS headless | Gratuit jusqu'à 3 users |
| Cloudflare | DNS + protection DDoS | Gratuit |
| Stripe | Paiement carte | 2.9% + $0.30 / transaction |
| PayPal | Paiement alternatif | 3.49% + $0.49 / transaction |
| Resend | Emails transactionnels | Gratuit jusqu'à 3000 emails/mois |
| Google Analytics 4 | Analytics | Gratuit |
| Hotjar | Heatmaps & recordings | Gratuit (35 sessions/jour) |

### Domaine
- Conserver : `villaparadisetahiti.com` (à migrer vers nouveau site)
- DNS via Cloudflare (protège l'IP réelle, CDN gratuit)
- SSL/TLS : automatique via Vercel + Cloudflare

---

## 4. Intégrations Externes

### 4.1 Stripe (Paiement principal US)

```typescript
// Flux de paiement
1. Visiteur compose son séjour (calculateur)
2. Clique "Book Now"
3. Saisit infos personnelles
4. Redirigé vers Stripe Checkout (hébergé Stripe) ou
   paiement inline (Stripe Elements)
5. Paiement de l'acompte (30% du total)
6. Stripe confirme → webhook → email de confirmation
7. Réservation bloquée sur le calendrier
```

**Configuration Stripe :**
- Mode : Stripe Checkout (plus simple) ou Stripe Elements (plus custom)
- Devise : USD
- Capture : immédiate (acompte)
- Webhooks : `payment_intent.succeeded`, `payment_intent.payment_failed`
- Test cards : 4242 4242 4242 4242 (succès)

**Variables d'environnement :**
```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4.2 PayPal (Paiement alternatif)

```typescript
// PayPal Standard Checkout
- SDK : @paypal/react-paypal-js
- Mode : Orders API v2
- Devise : USD
- Capture : immédiate
```

**Variables d'environnement :**
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live  # ou sandbox
```

### 4.3 Calendrier — Synchronisation iCal

**Problème :** les réservations Airbnb/VRBO doivent être reflétées sur le site pour éviter les doubles bookings.

**Solution :**

```
Airbnb iCal URL → Cron job (toutes les heures) → Parse iCal → Stocker dates bloquées en BDD
VRBO iCal URL  → Cron job (toutes les heures) → Parse iCal → Stocker dates bloquées en BDD
Réservations directes → Stripe webhook → Bloquer dates automatiquement
```

**Implémentation :**
- Cron job Vercel (cron jobs intégrés, toutes les heures)
- Librairie : `node-ical` pour parser les fichiers iCal
- Stockage des dates : Vercel KV (Redis) ou fichier JSON sur Sanity

**iCal URLs à récupérer auprès du client :**
- URL iCal Airbnb (dans les paramètres de la propriété Airbnb)
- URL iCal VRBO (si applicable)

### 4.4 Google Analytics 4

```html
<!-- Via next/script (Next.js) -->
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
```

**Events à tracker :**
- `page_view` (automatique)
- `begin_checkout` (clic "Book Now")
- `purchase` (après paiement Stripe confirmé)
- `add_to_cart` (ajout d'une expérience)
- `view_item` (ouverture page Villa ou Experience)

**Variables :**
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4.5 Emails — Resend

**Emails automatiques :**

1. **Confirmation de réservation** (au client)
   - Récapitulatif du séjour + expériences
   - Montant payé (acompte)
   - Solde restant + méthode de paiement du solde
   - Infos pratiques (adresse, comment arriver, contact)

2. **Notification au propriétaire** (réservation reçue)
   - Infos client (nom, email, téléphone)
   - Dates du séjour
   - Expériences choisies
   - Montant total + acompte reçu

3. **Rappel de solde** (J-7 avant check-in)
   - Rappel du montant solde restant
   - Instructions de paiement du solde

```typescript
// Configuration Resend
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Email from: noreply@villaparadisetahiti.com
// Domaine à vérifier sur Resend
```

**Variables :**
```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@villaparadisetahiti.com
EMAIL_OWNER=contact@villaparadisetahiti.com
```

---

## 5. Performance & SEO

### Core Web Vitals (objectifs)
| Métrique | Objectif | Outil de mesure |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | PageSpeed Insights |
| INP (Interaction to Next Paint) | < 200ms | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | PageSpeed Insights |
| Lighthouse Performance | > 90/100 | Lighthouse |
| Lighthouse SEO | > 95/100 | Lighthouse |

### Optimisations techniques
- **Images** : `next/image` → WebP automatique + lazy loading
- **Fonts** : `next/font` → chargement local (pas de FOUT)
- **Code splitting** : automatique avec Next.js
- **Caching** : ISR (Incremental Static Regeneration) pour pages CMS
- **CDN** : Vercel Edge Network (global)
- **Compression** : gzip/brotli automatique sur Vercel

### SEO technique
- `next-sitemap` → génération automatique du sitemap.xml
- `next-seo` ou metadata API Next.js → meta tags, OpenGraph, Twitter Cards
- Schema.org structuré :
  - `LodgingBusiness` → infos villa
  - `Offer` → tarifs
  - `Review` → avis
  - `BlogPosting` → articles de blog
- Robots.txt : allow all crawlers
- Canonical URLs sur toutes les pages
- Hreflang : EN uniquement en V1

---

## 6. Sécurité

### Principes
- **Jamais de clé Stripe/PayPal côté client** — uniquement via variables d'environnement serveur
- **CSP (Content Security Policy)** — headers sécurisés via next.config.js
- **Rate limiting** sur les API routes (formulaire de contact, checkout) — via Vercel Edge Middleware
- **Validation côté serveur** de toutes les données entrantes (Zod)
- **HTTPS uniquement** — Vercel force HTTPS
- **Honeypot** sur le formulaire de contact (anti-spam)
- **Captcha** optionnel sur le checkout (hCaptcha ou Turnstile)

### Variables d'environnement (`.env.local`)
```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@villaparadisetahiti.com
EMAIL_OWNER=contact@villaparadisetahiti.com

# Analytics
NEXT_PUBLIC_GA_ID=G-...

# Calendrier iCal
AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/...
VRBO_ICAL_URL=https://...
```

---

## 7. Structure du projet Next.js

```
villa-paradise-tahiti/
├── app/
│   ├── layout.tsx           # Layout racine (Header, Footer)
│   ├── page.tsx             # Homepage
│   ├── villa/page.tsx       # La Villa
│   ├── experiences/page.tsx
│   ├── gallery/page.tsx
│   ├── rates/page.tsx       # Calculateur + réservation
│   ├── reviews/page.tsx
│   ├── blog/
│   │   ├── page.tsx         # Liste articles
│   │   └── [slug]/page.tsx  # Article individuel
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── legal/
│   │   ├── privacy-policy/page.tsx
│   │   └── terms/page.tsx
│   └── api/
│       ├── checkout/route.ts       # Création session Stripe
│       ├── webhook/stripe/route.ts # Webhook Stripe
│       ├── contact/route.ts        # Formulaire de contact
│       └── availability/route.ts  # Vérification disponibilité
├── components/
│   ├── ui/                  # Composants UI réutilisables
│   ├── layout/              # Header, Footer, Navigation
│   ├── home/                # Sections homepage
│   ├── calculator/          # Calculateur multi-prestations
│   ├── booking/             # Processus de réservation
│   └── gallery/             # Galerie + lightbox
├── lib/
│   ├── sanity/              # Client Sanity + queries
│   ├── stripe/              # Config Stripe
│   ├── paypal/              # Config PayPal
│   ├── ical/                # Parsing iCal
│   └── email/               # Templates emails
├── types/                   # Types TypeScript
├── public/                  # Assets statiques
├── next.config.js
├── tailwind.config.js
└── .env.local               # Variables d'environnement (gitignore)
```

---

## 8. Déploiement

### Workflow CI/CD
```
git push → GitHub → Vercel (détection auto) → Build → Deploy
```

1. Code sur GitHub (repository privé)
2. Connexion Vercel ↔ GitHub
3. Branch `main` → déploiement production automatique
4. Branch `dev` → déploiement preview automatique (URL temporaire)

### Étapes de mise en ligne
1. Tests locaux complets
2. `git push origin main`
3. Vercel build (~ 2 minutes)
4. Vérification sur URL preview
5. Migration DNS : pointage domaine `villaparadisetahiti.com` vers Vercel
6. Vérification SSL, redirections, formulaires, paiements (mode sandbox d'abord)
7. Switch Stripe en mode `live`
8. Annonce Go-Live

---

*Ce document technique sera mis à jour après le choix du framework à l'Étape 3.*
