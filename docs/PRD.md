# PRD — Villa Paradise Tahiti · Refonte Site Web
**Version :** 1.0 — Mai 2026
**Statut :** En cours
**Propriétaire produit :** Thierry (propriétaire de la villa)
**Webmaster :** TahitiTechDigital

---

## 1. Contexte

Villa Paradise Tahiti est une villa privée de luxe à Punaauia (Tahiti, Polynésie française).
Ce PRD consolide les décisions prises lors de la session de synchronisation client et sert de
référence unique pour la refonte du site. L'objectif est de mettre en production une version
cohérente, orientée conversion, avec des contenus exacts et une UX fluide.

---

## 2. Objectifs

| Objectif | Indicateur de succès |
|---|---|
| Augmenter les réservations directes | Réduction des commissions Airbnb/Vrbo |
| Améliorer la conversion | CTA "Book Now" omniprésent, tarifs transparents |
| Renforcer la confiance | Avis vérifiés, notes moyennes affichées, politiques claires |
| Performance technique | Vidéo sans latence (CDN), galerie rapide |

---

## 3. Utilisateurs cibles

- **Couples / familles** anglophones (USA, Canada, Australie) cherchant une villa privée premium
- **Lune de miel** cherchant isolement + service concierge
- Groupes jusqu'à 8 personnes (4 couples)

---

## 4. Exigences fonctionnelles

### 4.1 Politiques — Annulation & Remboursement

- À 60 jours avant le check-in : remboursement à **50 %**
- À 30 jours avant le check-in : **100 % non remboursable**
- Afficher cette politique sur : page de réservation, FAQ, page Contact, footer
- Fichiers concernés : `components/booking/`, `app/(marketing)/faq/`, `lib/sanity/mock-data.ts`

### 4.2 Capacité & Couchages

**Configuration standard :**
- 8 personnes maximum · 4 chambres · 4 lits king size

**Options d'extension (sur demande) :**
- Option 5e chambre/salle de bain/lit king : supplément (nous consulter)
- Plus de 8 personnes : studio annexe disponible, sur demande

Afficher ces options dans : FAQ, page Villa, section "Specs" de la page de réservation.

### 4.3 Tarification saisonnière

**3 cartes tarifaires — strictement informatives (non cliquables)**

| Saison | Mois | Tarif |
|---|---|---|
| Basse saison | Mai–Juin · Octobre–Novembre | À définir |
| Haute saison | Juillet · Septembre · Décembre · Début janvier | À définir |
| Pic (Noël / Nouvel An) | 20 Déc – 5 Jan · Pâques | À définir |

- Les cartes n'initient **aucune action de réservation** — titre, prix, liste d'avantages uniquement
- Interface admin : permettre la modification des tarifs par saison sans code
- Fichiers : `components/sections/rates/`, `lib/sanity/mock-data.ts` → table `settings` (Supabase)

### 4.4 Transferts aéroport

- Libellé officiel : **"Complimentary airport transfer by our partner taxi service"**
- Ne pas laisser entendre que l'hôte conduit lui-même
- Supprimer toute duplication entre "Private airport transfer" (optionnel) et "Airport transfer info"
- Si le transfert est désormais inclus : retirer l'option payante "Private airport transfer"
- Fichiers : `components/booking/AddOns.tsx`, FAQ, page Villa, sections "Inclus"

### 4.5 Horaires d'arrivée / départ

- Arrivée et départ : **flexibles 24h/24** (vols long-courriers, arrivées 3h–5h du matin acceptées)
- Mettre en avant explicitement dans : hero, FAQ, page booking, page Contact
- Exemple de texte : *"Flexible check-in & check-out — we accommodate late-night arrivals and early departures."*

### 4.6 Services & options à corriger

| Service | Correction |
|---|---|
| Chef privé | Corriger la faute dans le libellé ("stamps" → libellé correct) |
| Spa / Massage | Massage thaï à domicile · **$150** confirmé |
| Jacuzzis | Mentionner : **2 jacuzzis** disponibles |
| Terrasse | "Very large terrace with valley, ocean & waterfall views (in rainy season)" |

### 4.7 SEO

- Ajouter les mots-clés : **"hotel"** (singulier) et **"hotels"** (pluriel) aux meta tags, balises title et descriptions de page
- Fichiers : `lib/seo.ts`, `app/(marketing)/*/page.tsx` (chaque page marketing)

### 4.8 Coordonnées & Messagerie

| Champ | Action requise |
|---|---|
| Email | Confirmer l'adresse exacte (ex. villaparadisetahiti@gmail.com) — **@Propriétaire** |
| Téléphone | Corriger le numéro erroné — 89210053**@Propriétaire** |
| WhatsApp | Ajouter comme canal de contact (bouton flottant + page Contact) |

Fichiers : `lib/sanity/mock-data.ts`, `components/layout/Footer.tsx`, `app/(marketing)/contact/`

### 4.9 Avis & Notes

- Créer ou enrichir la page `/reviews` avec les avis disponibles
- Liens cliquables vers : **Airbnb**, **Booking.com** (10/10), **Vrbo**
- Afficher la **note moyenne globale** calculée une fois les liens validés
- Assurer la cohérence des liens dans le footer
- Fichiers : `app/(marketing)/reviews/`, `components/sections/home/ReviewsGlimpse.tsx`

---

## 5. Galerie & Médias

### 5.1 Ordre et hiérarchie des photos

1. Piscine (photo phare — en premier)
2. Master bedroom + salle de bain
3. Terrasse
4. 3 autres chambres
5. Espaces communs / extérieurs

### 5.2 Qualité et retouches

- Éviter les angles montrant le toit plat à l'arrière-plan
- Retirer les éléments parasites visibles (ex. fil électrique)
- Grouper les photos par catégories/pièces (cohérence narrative)
- **Ajouter davantage de photos de la piscine** — @Propriétaire : fournir les fichiers

### 5.3 Comportement UI de la galerie

- Retirer tous les **filtres assombrissants** devant les images (affichage en luminosité native)
- Bouton d'ouverture/fermeture : remplacer le **"×"** par un bouton **"← Back"**
- Un clic sur une photo dans le flux de réservation ne doit **PAS désactiver** la réservation ajoutée
- Afficher des **informations détaillées** à l'ouverture d'une photo (pas de toggle sur la résa)

Fichiers : `components/gallery/`, `app/(marketing)/gallery/`

### 5.4 Vidéo hero

- Étudier un **CDN** (Cloudflare Stream, Bunny.net, Supabase Storage) pour limiter la latence


---

## 6. Réservation & Expériences

### 6.1 CTA global

- Libellé unique sur tout le site : **"Book Now"**
- Remplacer toute occurrence de "Check Availability", "Reserve", etc. par "Book Now"

### 6.2 Flux de réservation — Expériences

- Depuis le formulaire de réservation : renvoyer vers les **pages de détail internes** (ne pas quitter le site)
- Ajouter la mention : *"Subject to availability — confirmation based on availability and weather conditions"*
- "Whale watching" : préciser la **saison disponible**
- L'ajout/suppression d'expériences au panier est fonctionnel : conserver et clarifier l'UX

### 6.3 Corrections contenu Expériences

| Expérience | Correction |
|---|---|
| Whale watching | Remplacer l'image non pertinente par une image appropriée |
| Toutes | Enrichir le copywriting (textes descriptifs plus détaillés) |
| Toutes | Photos adéquates pour chaque expérience — @Propriétaire : fournir |

Fichiers : `app/(marketing)/experiences/`, `components/sections/experiences/`, `lib/sanity/mock-data.ts`

### 6.4 Formulaire Contact

- Les demandes d'information redirigent vers `/contact` — comportement confirmé, à conserver

---

## 7. Administration

- Interface permettant la **modification des tarifs par saison** sans code (via dashboard admin `/admin`)
- Cartographie mois → saison à définir précisément (ex. : juin = basse saison ou transition ?)
- Interface Supabase admin pour : tarifs, avis, expériences, galerie, FAQ, coordonnées

---

## 8. Exigences non fonctionnelles

| Critère | Cible |
|---|---|
| Performance vidéo | Chargement < 3s sur connexion 10 Mbps (CDN) |
| Accessibilité | Boutons et formulaires WCAG AA |
| SEO | Meta title + description uniques par page, structured data (VacationRental) |
| Responsive | Mobile-first, breakpoints sm / lg |

---


## 09. Points ouverts

- [ ] Confirmer si "Private airport transfer" reste en option payante ou est définitivement inclus
- [ ] Définir la cartographie exacte mois → saison pour l'interface admin
- [ ] Valider les tarifs précis par saison avant affichage public
- Calculer et valider la note moyenne globale (Airbnb + Booking + Vrbo) avant affichage

---

## 10. Récapitulatif des actions @Webmaster

- [ ] Mettre à jour la politique d'annulation (60j = 50% ; 30j = non remboursable)
- [ ] Afficher capacité (8 pers., 4 lits king) + options extension dans FAQ et pages de vente
- [ ] Rendre les 3 cartes tarifaires statiques (non cliquables) + interface admin édition tarifs
- [ ] Remplacer tous les libellés transfert par "Complimentary airport transfer by our partner taxi service"
- [ ] Corriger la faute dans l'option "Private chef" ; confirmer spa/massage thaï à $150
- [ ] Mettre en avant l'arrivée/départ flexibles 24h/24
- [ ] Ajouter les mots-clés SEO "hotel" / "hotels"
- [ ] Intégrer/mettre à jour la page Avis + liens Airbnb / Booking / Vrbo
- [ ] Réorganiser la galerie (ordre + retouches + filtres + bouton Back)
- [ ] Uniformiser le CTA en "Book Now" sur tout le site
- [ ] Corriger le comportement clic photo dans le flux de réservation
- [ ] Relier le flux réservation aux pages de détail expériences + mention disponibilité
- [ ] Corriger l'image Whale watching + enrichir le copywriting des expériences
- [ ] Vérifier la cohérence des liens footer + supprimer les doublons transfert
- [ ] Ajouter WhatsApp comme canal de contact
