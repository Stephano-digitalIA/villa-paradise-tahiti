# 12 — Deployment Guide

> **Villa Paradise Tahiti** — Refonte 2026
> Guide opérationnel pour mettre le site en production sur Vercel.
> Audience : Thierry (propriétaire) + TTD (agence).
> Date : 11 mai 2026

---

> ⚠️ **CE DOCUMENT EST EN PARTIE PÉRIMÉ (mai 2026).** La réalité au déploiement diffère :
>
> - **Hébergement : Netlify, pas Vercel.** Le site est **Git-connecté** : pousser sur `master`
>   déclenche un **auto-deploy** vers `villa-paradise-tahiti-thierry.netlify.app`
>   (config `netlify.toml` + `@netlify/plugin-nextjs`). Pas d'étape « Promote / Deploy » manuelle.
>   Le cron iCal tourne via une **Netlify Scheduled Function** (`netlify/functions/`), pas `vercel.json`.
> - **Données / contenu : Supabase, pas Sanity.** Le contenu live (villa, experiences, reviews,
>   settings…) vit dans des tables **Supabase**, pas dans Sanity. `sanityFetch()` lit Supabase
>   (voir [`CLAUDE.md`](../CLAUDE.md)). Les vars **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
>   / `SUPABASE_SERVICE_ROLE_KEY` sont obligatoires** (sinon 500). L'étape « Sanity init » ci-dessous
>   ne s'applique plus.
> - **Domaine / rollback :** se font côté **Netlify** (Site settings → Domain / Deploys → Publish deploy),
>   pas Vercel.
>
> Restent valables tels quels : la création des comptes **Stripe / PayPal / Resend / GA4 / Hotjar**,
> les **webhooks**, et la **checklist E2E** (Étapes 5, 6, 8) — seul l'hébergeur change.

---

## TL;DR — la séquence en 7 étapes

1. **Repo GitHub** privé créé et code poussé.
2. **Compte Vercel** connecté au repo.
3. **Env vars** renseignées sur Vercel (mirror `.env.example`).
4. **Preview deploy** déclenché et validé (le site peut déjà tourner en mock-mode).
5. **Comptes externes** créés (Sanity, Stripe, Resend, PayPal, GA4, Hotjar).
6. **Webhooks externes** pointés vers la prod (Stripe, PayPal, cron Vercel).
7. **Domaine Cloudflare** pointé vers Vercel — c'est le launch.

Plan B : on peut très bien lancer la prod avec un sous-ensemble (Stripe seul, sans PayPal,
sans Hotjar) puis enrichir après.

---

## Étape 1 — Repo GitHub

1. Créer un repo **privé** : `villa-paradise-tahiti` sur le compte TTD ou Thierry.
2. Depuis la racine du projet :
   ```bash
   git init
   git add .
   git commit -m "feat: initial production-ready scaffold (Phase A→F2)"
   git branch -M main
   git remote add origin https://github.com/<owner>/villa-paradise-tahiti.git
   git push -u origin main
   ```
3. Vérifier que **`.env.local`** est bien dans `.gitignore` (déjà le cas), et que
   **`.env.example`** est commité (référence pour Vercel).

---

## Étape 2 — Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new) et **Import Git Repository**.
2. Sélectionner le repo `villa-paradise-tahiti`.
3. Framework Preset : **Next.js** (auto-détecté).
4. Root Directory : `./` (laisser par défaut).
5. Build Command : `npm run build` (auto).
6. Output : `.next` (auto).
7. Install Command : `npm install` (auto).
8. **Ne pas déployer immédiatement** — passer aux env vars d'abord (Étape 3).

---

## Étape 3 — Variables d'environnement

Onglet **Settings → Environment Variables** sur le projet Vercel.

Toutes les variables doivent être appliquées sur les 3 environnements Vercel
(**Production**, **Preview**, **Development**) sauf indication contraire.

### Site (obligatoire)

| Variable | Valeur prod | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://villaparadisetahiti.com` | Sur Preview, laisser Vercel injecter `https://<branch>-<hash>.vercel.app` ou utiliser la même URL prod si on veut des canonicals stables. |

### Sanity (obligatoire dès Étape 5)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | (récupérée après `npx sanity init`) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_VERSION` | `2024-01-01` |
| `SANITY_API_READ_TOKEN` | (optionnel, seulement pour drafts) |

**Tant que ces vars valent `mock` ou sont vides, le site lit `lib/sanity/mock-data.ts`.**
Très pratique pour un premier preview deploy sans encore avoir créé le compte Sanity.

### Stripe (obligatoire pour paiement live)

| Variable | Valeur prod |
|---|---|
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_xxx` (Stripe Dashboard → Developers → API keys) |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` (créé à l'Étape 6 après ajout de l'endpoint webhook) |

### PayPal (optionnel)

| Variable | Valeur prod |
|---|---|
| `PAYPAL_CLIENT_ID` | (PayPal Developer Dashboard → Apps & Credentials → Live) |
| `PAYPAL_CLIENT_SECRET` | idem |
| `PAYPAL_MODE` | `live` (mettre `sandbox` en Preview pour éviter de charger de vraies cartes) |
| `PAYPAL_WEBHOOK_ID` | (créé à l'Étape 6 dans le PayPal dashboard) |

### Resend (obligatoire pour emails)

| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | `re_xxx` (Resend → API keys) |
| `EMAIL_FROM` | `noreply@villaparadisetahiti.com` |
| `EMAIL_OWNER` | `contact@villaparadisetahiti.com` (boîte qui reçoit les notifications) |

### Analytics (recommandé)

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` (GA4) |
| `NEXT_PUBLIC_HOTJAR_ID` | `12345` (Hotjar) |
| `GA_API_SECRET` | (GA4 Admin → Data Streams → Measurement Protocol API secrets) — uniquement pour les `purchase` events server-side. |

### Calendrier iCal (obligatoire pour anti-double-booking)

| Variable | Valeur |
|---|---|
| `AIRBNB_ICAL_URL` | URL de l'export iCal Airbnb privé (Listing → Manage Calendar → Sync with another calendar → Export) |
| `VRBO_ICAL_URL` | Idem côté VRBO si applicable, sinon laisser vide |

### Cron (obligatoire pour sync hourly)

| Variable | Valeur |
|---|---|
| `CRON_SECRET` | `openssl rand -hex 32` (32 octets aléatoires) |

Vercel injecte automatiquement `Authorization: Bearer ${CRON_SECRET}` sur les appels
de cron définis dans `vercel.json` (déjà commité : `/api/ical/sync` toutes les heures).

---

## Étape 4 — Preview deploy

Une fois les env vars en place (au minimum `NEXT_PUBLIC_SITE_URL`), cliquer **Deploy**.

Vercel exécute :
1. `npm install`
2. `npm run build`  ← doit retourner 39 routes, 0 erreur
3. Déploiement edge + node

Récupérer l'URL preview `https://<projet>.vercel.app` et valider visuellement :
- Homepage charge, hero s'affiche
- `/villa`, `/experiences`, `/rates` rendent les données mock
- `/booking` → flux complet jusqu'à `/booking/success` en mock mode (pas de vrai paiement)
- `/contact` → form soumissible (les emails ne partent que si Resend est configuré)
- `/studio` → carte onboarding si Sanity pas configuré, vrai Studio sinon

---

## Étape 5 — Comptes externes à créer

### 5.1 Sanity ([sanity.io](https://www.sanity.io))

1. `npx sanity init` depuis la racine du projet — choisir un nom, dataset `production`.
2. Récupérer le `projectId` et le coller dans `NEXT_PUBLIC_SANITY_PROJECT_ID` sur Vercel.
3. Déployer le Studio : `npx sanity deploy` (optionnel — il est déjà embarqué dans `/studio`).
4. Aller sur `https://villaparadisetahiti.com/studio` (ou l'URL Vercel preview) et peupler :
   - Settings (tarifs saisons, cleaning fee, min-nights, devise USD)
   - Villa (description, specs, amenities, photos, localisation)
   - Experiences (≥ 10 entrées avec slug, title, description, prix, durée)
   - FAQ (≥ 15 entrées catégorisées)
   - Reviews (≥ 5 avec consentement guest)
   - Posts blog (≥ 3 SEO seed)

### 5.2 Stripe ([stripe.com](https://stripe.com))

1. Créer compte business — fournir KYC (carte ID, RIB, justificatifs).
2. Activer le mode **Live**.
3. Récupérer `pk_live_*` et `sk_live_*` (Developers → API keys).
4. (Étape 6) Créer un webhook endpoint pointant vers `https://villaparadisetahiti.com/api/stripe/webhook`.

### 5.3 PayPal ([developer.paypal.com](https://developer.paypal.com)) — optionnel

1. Créer compte business + appliquer pour API access.
2. Apps & Credentials → Live → créer une app.
3. Récupérer `Client ID` + `Secret`.
4. (Étape 6) Créer un webhook id pointant vers `https://villaparadisetahiti.com/api/paypal/webhook`.

### 5.4 Resend ([resend.com](https://resend.com))

1. Créer compte.
2. Domains → Add `villaparadisetahiti.com`.
3. Ajouter les enregistrements DNS fournis (SPF, DKIM, MX optionnel, DMARC recommandé)
   dans **Cloudflare**.
4. Attendre la vérification (généralement < 10 min).
5. API Keys → créer une clé `re_xxx` → coller dans `RESEND_API_KEY`.

### 5.5 Google Analytics 4 ([analytics.google.com](https://analytics.google.com))

1. Créer une **property** "Villa Paradise Tahiti".
2. Créer un **data stream** Web → URL `https://villaparadisetahiti.com` → récupérer
   le **Measurement ID** `G-XXXXXXXXXX`.
3. Admin → Data Streams → ton stream → Measurement Protocol API secrets → créer un
   secret → coller dans `GA_API_SECRET` (pour le relay server-side).

### 5.6 Hotjar ([hotjar.com](https://hotjar.com))

1. Créer compte → ajouter site `villaparadisetahiti.com` → récupérer Site ID.
2. Coller dans `NEXT_PUBLIC_HOTJAR_ID`.
3. Heatmaps + recordings → activer les pages prioritaires (`/`, `/villa`, `/booking`).

---

## Étape 6 — Webhooks externes

À configurer **après** que le domaine pointe vers Vercel (Étape 7) — sinon utiliser
l'URL Vercel preview en attendant.

### Stripe

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**.
2. URL : `https://villaparadisetahiti.com/api/stripe/webhook`
3. Events :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Récupérer le **Signing secret** `whsec_xxx` → coller dans `STRIPE_WEBHOOK_SECRET` sur Vercel.
5. Redéployer (Vercel redéploie auto sur changement d'env var).

### PayPal

1. PayPal Developer Dashboard → Apps & Credentials → ton app → **Webhooks**.
2. URL : `https://villaparadisetahiti.com/api/paypal/webhook`
3. Events :
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
4. Récupérer le **Webhook ID** → coller dans `PAYPAL_WEBHOOK_ID` sur Vercel.

### Cron Vercel (iCal sync)

Aucune action manuelle — `vercel.json` déclare déjà :
```json
{ "crons": [ { "path": "/api/ical/sync", "schedule": "0 * * * *" } ] }
```
Vercel détecte automatiquement à la première Production deploy et active le cron toutes les heures.
Vérifier dans **Settings → Cron Jobs** que le job apparaît bien.

---

## Étape 7 — Domaine

### Cloudflare DNS → Vercel

1. Vercel projet → **Settings → Domains → Add** `villaparadisetahiti.com` + `www.villaparadisetahiti.com`.
2. Vercel donne 2 valeurs DNS à ajouter :
   - **Apex** (`villaparadisetahiti.com`) : enregistrement **A** vers `76.76.21.21`
     OU **CNAME flattening** vers `cname.vercel-dns.com` (selon plan Cloudflare).
   - **www** : **CNAME** vers `cname.vercel-dns.com`.
3. Dans Cloudflare → DNS records :
   - **Proxy off** (orange cloud OFF / gris) pour éviter le double-CDN.
     Vercel gère déjà la CDN edge ; passer en DNS-only évite les conflits SSL.
4. Attendre la propagation (< 5 min en général) et la délivrance du certificat Let's Encrypt
   automatique par Vercel.
5. Vérifier `https://villaparadisetahiti.com` → doit charger le site avec cadenas vert.

---

## Étape 8 — Tests post-launch (checklist E2E)

Avant d'annoncer le launch :

- [ ] Homepage charge en < 3 s sur 4G (mesurer avec WebPageTest)
- [ ] Toutes les images affichent un `alt` non vide en EN
- [ ] `/sitemap.xml` accessible et listé les bonnes URLs (`https://villaparadisetahiti.com/sitemap.xml`)
- [ ] `/robots.txt` accessible
- [ ] OG image visible sur partage Facebook/Twitter (debug : [opengraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Fvillaparadisetahiti.com))
- [ ] JSON-LD valide ([Rich Results Test](https://search.google.com/test/rich-results))
- [ ] Lighthouse mobile ≥ 90 sur Homepage et Villa (Performance / A11y / SEO)
- [ ] **Test paiement Stripe réel** avec une vraie carte → confirmer email guest + owner
      reçus, puis **refund immédiat** depuis Stripe dashboard
- [ ] **Test paiement PayPal réel** (si activé) → idem
- [ ] **Test contact form** réel → confirmer mail propriétaire + auto-reply visiteur
- [ ] **Test iCal anti-double-booking** : créer une résa fake sur Airbnb → vérifier
      sur `/api/booking/availability` que la plage apparaît dans `blockedRanges`
- [ ] **Test cron** : Vercel → Cron Jobs → "Run now" sur `/api/ical/sync` → vérifier
      réponse 200 + `mode: "live"` dans les logs
- [ ] **Test 404** : `/cette-page-existe-pas` → page `_not-found` propre
- [ ] **Test mobile burger** : navigation fonctionnelle + LanguageSwitcher visible
- [ ] **Test consent gate** : banner s'affiche au premier visite, scripts analytics
      ne chargent qu'après acceptation
- [ ] Soumettre le sitemap à **Google Search Console** + **Bing Webmaster Tools**
- [ ] Activer **Vercel Analytics** (gratuit pour les Web Vitals)

---

## Étape 9 — Plan de rollback

Si un problème majeur apparaît post-launch :

1. **Vercel → Deployments → Promote to Production** sur un commit antérieur connu stable.
2. Si problème de DNS / SSL : repasser temporairement le proxy Cloudflare en **DNS-only**
   et purger le cache.
3. Si webhook Stripe en erreur : Stripe Dashboard → Webhook → **Disable** temporairement,
   les events sont mis en queue et seront rejoués au reactivate.
4. Communication client : éviter d'annoncer le site sur les réseaux sociaux avant
   J+2 d'observation des Web Vitals + premiers tests E2E.

---

## Maintenance post-launch — au quotidien

| Tâche | Fréquence | Responsable |
|---|---|---|
| Vérifier Vercel cron `/api/ical/sync` réussi | Hebdo | TTD |
| Lire les emails owner (notification de résa) | Quotidien | Client |
| Mettre à jour les tarifs saison dans Sanity Studio | À chaque ajustement | Client |
| Ajouter un post blog SEO | Mensuel | Client / TTD |
| Vérifier les Web Vitals (Vercel Analytics) | Hebdo | TTD |
| Vérifier les logs Sentry / erreurs Vercel | Hebdo | TTD |
| Backup dataset Sanity (`sanity dataset export`) | Mensuel | TTD |
| Renouvellements : certifs SSL (auto Vercel), domaine Cloudflare | Annuel | TTD |

---

## Contacts & support

- **Vercel support :** [vercel.com/help](https://vercel.com/help) (plan Pro = SLA business hours)
- **Stripe support :** [support.stripe.com](https://support.stripe.com)
- **Sanity community :** [sanity.io/community](https://www.sanity.io/community)
- **Resend support :** [resend.com/support](https://resend.com/support)
- **TTD :** Stephano Belleme-Atuahiva — contact@tahititechdigital.pf

---

*Document maintenu par l'agent F3 / TTD. Mis à jour le 2026-05-11.*
