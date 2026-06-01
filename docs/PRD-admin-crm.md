# PRD — Admin CRM (clients) · Villa Paradise Tahiti

> **Statut** : Draft v1 · **Auteur** : Claude (TTD) · **Pour** : Thierry (propriétaire Villa Paradise Tahiti) · **Date** : 2026-05-30
> **Route cible** : `/admin/clients` · **Section admin** : nouvelle

---

## 1. Contexte & problème

### 1.1 Situation actuelle
Villa Paradise Tahiti reçoit des hôtes via trois canaux :
1. **Réservation directe** sur le site (table `reservations` + `customers` dans Supabase, schéma déjà en place).
2. **Airbnb** (flux iCal synchronisé dans `blocked_dates` — dates seulement, pas d'identité guest).
3. **Booking.com / VRBO** (idem iCal).

Les infos client sont aujourd'hui dispersées : Supabase pour les directs, dashboard Airbnb pour les Airbnb, échanges email pour les préférences, mémoire du propriétaire pour les VIP et incidents. **Aucune vue unifiée n'existe** dans l'admin actuel (`/admin/reservations`, `/admin/calendar`, `/admin/inquiries`, `/admin/content`, `/admin/settings`).

### 1.2 Conséquences
- Temps perdu à reconstituer le contexte d'un guest avant un séjour ou un échange.
- Risque d'oublier une préférence (allergie, anniversaire, demande spéciale) → expérience dégradée.
- Impossible d'identifier rapidement les clients à forte valeur (répétitifs, gros panier) pour les chouchouter ou les solliciter.
- Pas de traçabilité RGPD claire (droit d'accès / d'oubli demandés par la loi française).

### 1.3 Objectif
Créer une nouvelle section **`/admin/clients`** qui devient le **point d'entrée unique** pour tout ce qui touche aux personnes : identification, historique, préférences, communication, conformité.

---

## 2. Objectifs

### 2.1 Business
- **Augmenter le taux de réservation répétée** en surfaçant qui mérite une relance personnalisée.
- **Améliorer la satisfaction** en arrivant à chaque check-in avec le contexte complet du guest.
- **Se mettre en conformité RGPD** (droit d'accès + droit à l'oubli) sans bricoler à la main.

### 2.2 Utilisateur (le propriétaire, seul user)
- En **< 10 secondes**, savoir qui arrive demain et ce qu'il faut préparer pour lui.
- En **2 clics** depuis la fiche, envoyer un email perso ou créer une réservation directe.
- Avoir une vue claire des **VIP / répétitifs** quand je veux les recontacter.

---

## 3. Persona & user stories

### 3.1 Persona unique
**Thierry, propriétaire** — gère seul la villa, consulte l'admin plusieurs fois/jour sur desktop principalement (et mobile en déplacement). Pas tech-averse mais cherche l'efficacité. Connaît bien ses guests directs, beaucoup moins ceux Airbnb (qui restent partiellement anonymes).

### 3.2 User stories prioritaires (v1)
> US-01 — *En tant que propriétaire, je veux voir en arrivant sur `/admin/clients` les KPIs clés (nb clients total, nouveaux ce mois, prochaine arrivée nommée) et la liste triée par récence, afin de prendre la température en un coup d'œil.*

> US-02 — *Je veux rechercher un client par nom/email/téléphone et filtrer par tag (VIP, Répétitif, Allergique…), pays, source d'acquisition (direct/Airbnb/Booking), afin de retrouver vite la bonne fiche.*

> US-03 — *Je veux ouvrir une fiche client et voir en un écran : ses coordonnées, tous ses séjours passés et à venir avec montants, ses paiements, ses notes privées timeline, ses tags, et son historique d'emails envoyés.*

> US-04 — *Je veux ajouter / retirer des tags personnalisés (VIP, Répétitif, Allergique gluten…) sur un client.*

> US-05 — *Je veux écrire une note privée timestampée sur un client (« A demandé champagne rosé en arrivée juillet 2026 ») visible uniquement de moi.*

> US-06 — *Je veux envoyer un email personnalisé au client depuis sa fiche, l'envoi étant logué automatiquement dans son historique.*

> US-07 — *Je veux créer une réservation directe pour un client existant (séjour offert, repeat manuel) sans ressaisir ses infos.*

> US-08 — *Je veux exporter toutes les données d'un client (JSON ou PDF) en un clic, pour répondre à une demande d'accès RGPD.*

> US-09 — *Je veux anonymiser un client (effacer PII, garder l'historique financier agrégé pour ma compta) en un clic, pour honorer une demande de droit à l'oubli RGPD.*

> US-10 — *Je veux créer manuellement une fiche client pour enrichir un séjour Airbnb (dont les iCal n'apportent qu'une plage de dates) et la lier à une réservation existante.*

---

## 4. Périmètre v1 (MoSCoW)

### 4.1 Must (livré v1)
- Page `/admin/clients` avec **vue split** : KPIs en haut + liste paginée dessous.
- Liste avec colonnes : nom complet, email, nb séjours, CA cumulé, dernier séjour, tags, source.
- **Recherche full-text** (nom/email/téléphone) + filtres (tag, source, période d'arrivée, statut séjour).
- **Tri** sur toutes les colonnes numériques/dates (récence par défaut).
- **Fiche client `/admin/clients/[id]`** : profil, historique séjours, paiements, emails, notes, tags.
- **Tags custom** : CRUD au niveau projet + assignation par client (relation N-N).
- **Notes timeline** : ajout libre horodaté, edit/delete soft.
- **Actions fiche** : envoyer email (via Resend), créer réservation (lien pré-rempli vers `/admin/reservations/new?customer_id=`), export RGPD JSON, anonymiser.
- **Création manuelle** d'une fiche (US-10) + **liaison** à une réservation orpheline (Airbnb).
- **Création auto** lors d'une réservation directe (déjà câblé via `lib/booking/reservation.ts` — à vérifier qu'on update `customers` plutôt que dupliquer).

### 4.2 Should (v1.1 — semaine +1 à +4)
- **Import CSV** initial (charger un historique Excel/Google Contacts).
- **Vue KPIs avancés** : top 10 par CA, taux retour, séjour moyen, panier moyen.
- **Export Excel** de la liste filtrée.
- **Réconciliation iCal** : flagger automatiquement les `blocked_dates` Airbnb sans `customer_id` associé pour invitation à enrichir.

### 4.3 Could (plus tard)
- Segmentation avancée pour campagnes Resend (« tous les VIP français qui ont séjourné en 2025 »).
- Détection auto des doublons (email avec typo, nom proche).
- Intégration Reviews : lier un avis Google/Airbnb à un client existant.
- Score de churn prédictif.

### 4.4 Won't (hors scope v1)
- Permissions multi-utilisateurs / rôles (solo owner confirmé).
- Mobile-first design (desktop d'abord, mobile fonctionnel mais pas optimisé).
- Sync 2-way avec Airbnb Hospitality API (pas d'API officielle simple).
- Marketing automation (séquences d'emails programmées).

---

## 5. Fonctionnalités détaillées

### 5.1 Vue liste — `/admin/clients`

**Layout** : 2 sections empilées.

**Section A — Bandeau KPIs (4 cards)**

| KPI | Source SQL | Format |
|---|---|---|
| Clients total | `count(customers)` | nombre |
| Nouveaux ce mois | `count where created_at >= date_trunc('month', now())` | nombre + delta vs mois précédent |
| Prochaine arrivée | `min(check_in) where check_in >= today` + nom | nom + date |
| CA top 10 (12 derniers mois) | `sum(total) over top 10 customers by sum` | USD |

**Section B — Liste**
- Tableau dense (réutiliser `components/admin/DataTable.tsx`).
- Pagination 25/50/100.
- Colonnes : Avatar/initial, Nom, Email, Tél, Pays, Tags, Séjours, CA cumulé, Dernier séjour, Source.
- Tri cliquable, row click → `/admin/clients/[id]`.
- Filtres en haut : recherche + chips tags + dropdown source + range dates.
- Bouton « + Nouveau client » (US-10).

### 5.2 Fiche client — `/admin/clients/[id]`

Layout 2 colonnes desktop, stack mobile.

**Colonne gauche (sticky, 1/3)** : avatar, nom (édit inline), contacts, adresse, tags éditables, KPIs synthèse, bloc actions (📧 Envoyer email, ➕ Nouvelle résa, ⬇️ Exporter, 🗑️ Anonymiser).

**Colonne droite (2/3) — onglets** :
1. **Séjours** (défaut) — table réservations avec liens
2. **Notes** — timeline verticale, input en haut
3. **Emails** — depuis `email_logs`
4. **Préférences** — marketing consent, langue, notes alimentaires

### 5.3 Envoi email
Drawer : sujet + corps markdown, templates rapides, send via `/api/admin/clients/[id]/email` → Resend + log dans `email_logs`.

### 5.4 Création manuelle
Drawer : email + prénom + nom + tél + pays + consent marketing. Détection doublon par email.

### 5.5 Anonymisation RGPD
Modale stricte avec saisie de confirmation. Update : PII → `[Anonymisé]`, `email` → `anonymized-{uuid}@deleted.local`, `anonymized_at` = now. Notes/tags supprimés. Réservations conservées.

---

## 6. Modèle de données

### 6.1 Existant (réutilisé)
- `customers` (001_initial.sql:197-209) : email, first_name, last_name, phone, country, city, zip_code, accept_marketing.
- `reservations` (001_initial.sql:212-248) : liée via `customer_id`, contient le CA via `total`.
- `email_logs` (001_initial.sql:284-293) : reliée par `recipient_email`, à enrichir avec `customer_id`.
- `blocked_dates` (001_initial.sql:268-279) : conserve tel quel, pas d'info client.

### 6.2 Nouvelles tables / colonnes — migration `004_crm.sql`

```sql
-- Ajouts à customers
ALTER TABLE customers
  ADD COLUMN acquisition_source text
    CHECK (acquisition_source IN ('direct','airbnb','booking','vrbo','referral','manual','imported')),
  ADD COLUMN preferred_language text,
  ADD COLUMN dietary_notes text,
  ADD COLUMN marketing_consent_at timestamptz,
  ADD COLUMN anonymized_at timestamptz;

CREATE INDEX idx_customers_anonymized ON customers (anonymized_at) WHERE anonymized_at IS NULL;
CREATE INDEX idx_customers_source ON customers (acquisition_source);

CREATE TABLE customer_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text UNIQUE NOT NULL,
  color       text NOT NULL DEFAULT 'gold',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE customer_tag_assignments (
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (customer_id, tag_id)
);

CREATE TABLE customer_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX idx_customer_notes_customer ON customer_notes (customer_id, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE email_logs ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX idx_email_logs_customer ON email_logs (customer_id, sent_at DESC);
```

### 6.3 Vue agrégée `customer_summary`
Voir migration. Pré-calcule n_stays, total_revenue, last_check_in, tags pour la liste.

### 6.4 RLS — migration `005_crm_rls.sql`
Toutes les nouvelles tables : RLS activée, policy `admin_users role IN ('owner','assistant')` pour CRUD. Pattern identique à `002_rls.sql`.

---

## 7. Routes & API

### 7.1 Pages Next.js
- `app/(admin)/admin/clients/page.tsx` — server, liste + KPIs.
- `app/(admin)/admin/clients/[id]/page.tsx` — server, fiche détail.

### 7.2 API routes (`app/api/admin/clients/`)
- `POST /` — créer client (Zod)
- `PATCH /[id]` — update
- `DELETE /[id]` — anonymise (cf 5.5)
- `GET /[id]/export` — JSON RGPD
- `POST /[id]/email` — envoi Resend + log
- `POST /[id]/tags`, `DELETE /[id]/tags/[tagId]`
- `POST /[id]/notes`, `PATCH /notes/[noteId]`, `DELETE /notes/[noteId]`
- `GET /tags`, `POST /tags`

Toutes les routes protégées par le middleware admin + check `admin_users.role IN ('owner','assistant')`.

### 7.3 Composants (`components/admin/clients/`)
ClientsListTable, KpiCards, ClientFilters, ClientProfileCard, ClientTabs, TagChip, TagPopover, NoteTimeline, NoteComposer, EmailComposerDrawer, NewClientDrawer, AnonymizeConfirmModal.

Réutiliser `components/admin/` (DataTable, FormSection, StatusBadge, ToggleSwitch).

---

## 8. Conformité RGPD

| Obligation | Implémentation v1 |
|---|---|
| **Consentement marketing** | Toggle `accept_marketing` + `marketing_consent_at` horodaté |
| **Droit d'accès** | Bouton « Exporter » → JSON complet |
| **Droit à l'oubli** | Bouton « Anonymiser » → PII remplacés. Historique financier conservé (compta 10 ans). Notes/tags supprimés. |
| **Droit de rectification** | Édition inline |
| **Conservation** | Alerte v1.2 pour clients inactifs > 5 ans |
| **Sécurité** | RLS activée, accès admin uniquement |

Mise à jour `app/(legal)/legal/privacy/page.tsx` : mention CRM + droits exerçables sur demande.

---

## 9. Métriques de succès (30 j après prod)

| Métrique | Cible v1 | Comment |
|---|---|---|
| Temps de préparation arrivée | <2 min | Auto-déclaratif Thierry |
| % séjours avec note pré-arrivée | >80% | Notes créées dans 7j avant `check_in` |
| Taux enrichissement Airbnb | >60% | `reservations.customer_id IS NOT NULL where source='airbnb'` |
| Visite quotidienne | >1/jour | Logs Netlify |
| Demandes RGPD honorées | 100% en <72h | Compteur manuel |

---

## 10. Risques & dépendances

| Risque | Proba | Mitigation |
|---|---|---|
| Doublons clients (typos email) | Élevée | Validation lowercase + trim ; check soft v1.1 |
| Anonymisation par erreur | Moyenne | Double confirmation typée + audit log v1.1 |
| Surcharge requêtes liste | Faible | Vue SQL agrégée + index |
| RLS mal configurée | Moyenne | Pattern identique tables existantes |
| Resend rate limit | Faible | SMTP custom déjà prévu |
| iCal sans email guest | Certain | Doc utilisateur : enrichissement manuel = OK |

---

## 11. Plan de release

| Phase | Contenu | Durée |
|---|---|---|
| **P0** | Migrations `004_crm.sql` + `005_crm_rls.sql` + vue `customer_summary` | 0.5 j |
| **P1** | Page liste, KPIs, table, filtres, recherche | 1.5 j |
| **P2** | Fiche client + onglets lecture | 1.5 j |
| **P3** | Tags + notes CRUD | 1 j |
| **P4** | Email composer, créer résa, export, anonymisation | 1.5 j |
| **P5** | Création manuelle + liaison Airbnb | 0.5 j |
| **P6** | QA + doc | 0.5 j |

**Total v1 : ~7 jours de dev focalisés.**

---

## 12. Vérification

### Tests fonctionnels manuels
1. Migration appliquée localement, tables/vue/index présents
2. État vide → CTA « + Nouveau »
3. Création manuelle → fiche immédiate
4. Auto-création depuis `/booking/checkout`
5. Recherche par nom/email/tél
6. Tags : créer, assigner, filtrer
7. Notes : ajouter, éditer, supprimer
8. Email : envoyer, log `email_logs`, onglet visible
9. Créer résa depuis fiche
10. Export RGPD JSON complet
11. Anonymisation : PII effacés, séjours conservés
12. RLS : fetch non-admin échoue

### Non-fonctionnels
- `/admin/clients` < 1s avec 500 clients
- Lighthouse desktop > 90 perf
- Pas de log d'erreur Netlify Functions sur 24h

---

## 13. Hors scope / questions ouvertes
- Notifications proactives → v1.2
- Sync 2-way Airbnb → pas d'API simple, sine die
- UI admin multilingue → reste FR/EN mixte
