# 04 — Fonctionnalités du Site

> **Villa Paradise Tahiti — Refonte 2026**
> Dernière mise à jour : Mars 2026

---

## Vue d'ensemble

Le site se compose de deux grandes catégories de fonctionnalités :
1. **Fonctionnalités vitrine** — présenter la villa et ses services
2. **Fonctionnalités transactionnelles** — permettre de composer un séjour et payer un acompte

---

## 1. Calculateur Multi-Prestations (Feature Centrale)

C'est LA fonctionnalité différenciante du site. Elle permet au visiteur de **composer son séjour sur mesure** et d'obtenir un prix total immédiat, sans avoir à contacter le propriétaire.

### 1.1 Sélection des dates et du séjour

```
┌─────────────────────────────────────────────────────┐
│  Check-in         Check-out        Guests           │
│  [  01/15/2027  ] [  01/22/2027  ] [  2 adults  ▼] │
│                                                     │
│  [  CHECK AVAILABILITY  ]                           │
│                                                     │
│  ✓ 7 nights available · $690/night                  │
└─────────────────────────────────────────────────────┘
```

**Champs requis :**
- Date d'arrivée (check-in) — date picker avec calendrier de disponibilité
- Date de départ (check-out)
- Nombre d'adultes (select : 1-8)
- Nombre d'enfants (select : 0-6) [si capacité le permet]

**Logique :**
- Bloquer les dates déjà réservées (sync iCal Airbnb/VRBO)
- Calculer automatiquement le nombre de nuits
- Afficher la disponibilité en temps réel (vert = libre, rouge = indisponible)
- Minimum de séjour : [à définir, ex. 3 nuits]

### 1.2 Options d'expériences — Excursions diurnes

Le visiteur peut ajouter des excursions à son séjour directement depuis le calculateur.

**Format de sélection :**
```
DAYTIME EXPERIENCES                              [+ Add]

○  Lagoon Snorkeling Tour                  $150 /person
   Half-day guided snorkeling in Moorea's crystal lagoon
   📍 Departs from villa | Max 8 guests | Equipment included

○  4x4 Island Discovery Tour              $150 /person
   Full-day off-road adventure across Tahiti's highlands
   📍 Hotel pickup | Full day | Lunch included

○  Cultural Village Visit                 $150 /person
   Half-day guided tour of traditional Polynesian village
   📍 Hotel pickup | 4 hours | English speaking guide

○  Whale Watching (seasonal Jul-Oct)      $150 /person
   3-hour boat trip to observe humpback whales
   📍 Marina Papeete | Eco-certified operator
```

**Logique :**
- Chaque excursion : nom, description courte, durée, prix/personne
- Certaines excursions : saisonnières (ex. whale watching juillet-octobre)
- Certaines excursions : adaptées à un nombre de personnes (min/max)
- Multi-sélection possible (plusieurs excursions sur un même séjour)
- Quantité : nombre de participants (par défaut = nombre d'adultes sélectionnés)

### 1.3 Options d'expériences — Excursions nocturnes

```
EVENING & NIGHT EXPERIENCES                      [+ Add]

○  Sunset Sailing Cruise                   $150 /person
   2-hour champagne sunset sail around Tahiti's coast
   📍 Marina Papeete | Departs 5:30pm | Drinks included

○  Private Lagoon Dinner                   $150 /person
   Romantic dinner served on a floating platform in the lagoon
   📍 At villa | Available Tue/Thu/Sat | Min 2 guests

○  Stargazing Experience                   $150 /person
   Night astronomy session with local guide & telescope
   📍 At villa | Available all year | 2 hours

○  Night Fishing Trip                      $150 /person
   Traditional Polynesian night fishing on a pirogue
   📍 Village pier | 8pm-midnight | Equipment included
```

### 1.4 Options Traiteur (Catering)

```
CATERING OPTIONS                                 [+ Add]

○  Welcome Tropical Basket                 $150 /flat fee
   Fresh tropical fruits, local jams, juices & pastries
   Delivered to villa on arrival day

○  Daily Breakfast Service                $150 /person
   Fresh croissants, fruits, eggs, coffee — served 8am-10am
   📍 At villa | Available all days of stay

○  Polynesian BBQ Evening                 $150 /person
   Traditional Tahitian feast: poisson cru, grilled fish, taro
   📍 At villa | Min 4 guests | Chef included

○  Private Gourmet Dinner                 $150 /person
   5-course Polynesian-French fusion menu by private chef
   📍 At villa | Min 2 guests | Wine pairing available

○  Snack Picnic (for excursions)          $150 /person
   Packed lunch for your day activities
```

### 1.5 Récapitulatif du calculateur

```
┌──────────────────────────────────────────────────────────┐
│  YOUR STAY SUMMARY                                       │
├──────────────────────────────────────────────────────────┤
│  Villa Paradise · Jan 15-22, 2027 · 7 nights            │
│  2 guests                                                │
├──────────────────────────────────────────────────────────┤
│  ACCOMMODATION                                           │
│  Villa · 7 nights × $690/night              $4,830       │
│  Cleaning fee                                  $150       │
├──────────────────────────────────────────────────────────┤
│  EXPERIENCES ADDED                                       │
│  Lagoon Snorkeling Tour · 2 pers (Jan 16)   $300         │
│  Sunset Sailing Cruise · 2 pers (Jan 18)    $300         │
│  Private Gourmet Dinner · 2 pers (Jan 17)   $300         │
│  Polynesian BBQ · 2 pers (Jan 20)           $300         │
├──────────────────────────────────────────────────────────┤
│  Subtotal                                  $6,180         │
│  Taxes & fees (~10%)                          $618        │
├──────────────────────────────────────────────────────────┤
│  TOTAL                                     $6,798         │
│                                                          │
│  Deposit due today (owner's discretion):    $[TBD]       │
│  Balance due at check-in:                   $[TBD]       │
│                                                          │
│  [   BOOK NOW — Pay deposit   ]                         │
│  🔒 Secure payment via Stripe · PayPal                   │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Panier & Système de Paiement

### 2.1 Panier (Cart)

- Résumé des éléments sélectionnés (nuitées + expériences + traiteur)
- Modification possible depuis le panier (supprimer, changer quantité)
- Persistance du panier : session cookie (pas de compte requis)
- CTA clair : "Proceed to Checkout"

### 2.2 Checkout

**Étape 1 — Informations client**
```
First Name *     Last Name *
Email Address *  (confirmation email sent here)
Phone / WhatsApp (optional, for experience coordination)
Country          United States ▼
Special requests (textarea, optional)
```

**Étape 2 — Paiement (acompte)**
```
Amount due today: $[montant défini par le loueur]

[Pay with Card (Stripe)]     [Pay with PayPal]

🔒 256-bit SSL encryption · Stripe · PayPal
Your card details are never stored on our servers.

☐ I agree to the Cancellation Policy
```

> **Note technique :** le montant de l'acompte et les conditions de paiement du solde
> sont entièrement paramétrables par le propriétaire (montant fixe ou pourcentage,
> date limite de paiement du solde, conditions d'annulation).

**Étape 3 — Confirmation**
- Page de confirmation avec numéro de réservation
- Email automatique avec :
  - Récapitulatif complet du séjour
  - Montant payé (acompte)
  - Solde restant + date d'échéance
  - Infos pratiques (comment se rendre à la villa, contacts)
  - Instructions pour les expériences réservées

### 2.3 Politique d'annulation

> **À définir par le propriétaire.** Les conditions ci-dessous sont un exemple de structure
> courante pour la clientèle US — le loueur fixe librement ses propres règles.

```
CANCELLATION POLICY (exemple — à personnaliser)

• Cancel [X]+ days before check-in → [conditions propriétaire]
• Cancel [X]-[Y] days before check-in → [conditions propriétaire]
• Cancel < [X] days before check-in → [conditions propriétaire]
• No-show → [conditions propriétaire]

Contact us: hello@villaparadisetahiti.com
```

---

## 3. Calendrier de Disponibilité

### Synchronisation iCal
- **Airbnb** : export iCal Airbnb → import sur le site (sync toutes les heures)
- **VRBO** : même logique
- **Réservations directes** : bloquées automatiquement après paiement de l'acompte
- **Bloquer manuellement** : interface admin pour bloquer des dates (entretien, usage perso)

### Affichage calendrier
- Vue mensuelle avec navigation mois précédent/suivant
- **Vert** = disponible
- **Rouge** / **Grisé** = réservé ou bloqué
- **Jaune** = en cours de réservation (hold 15 minutes pendant le checkout)
- Minimum de séjour visible : "3 night minimum"
- Tarifs par saison affichables sur le calendrier (optionnel)

---

## 4. Galerie Photo & Vidéo

### Structure de la galerie
- **Héro** : 1 vidéo drone (boucle) + 3-5 photos hero rotatives
- **Galerie principale** : grille masonry ou grid uniforme
  - 30-50 photos organisées par catégories : Extérieur, Intérieur, Piscine, Vue lagon, Nuit
- **Lightbox** : clic sur photo → plein écran avec navigation (flèches + swipe mobile)
- **Vidéos** : section dédiée avec 2-3 vidéos (drone général, visite intérieure, excursions)

### Performance
- Chargement lazy (ne charge que les images visibles)
- WebP format + fallback JPEG
- Srcset pour images responsive
- Placeholder blur pendant chargement

---

## 5. Section Reviews / Témoignages

### Sources de reviews à intégrer
- **Google Reviews** (widget embarqué ou API)
- **Airbnb reviews** (screenshot + citation manuelle — pas d'API publique)
- **Témoignages directs** (formulaire post-séjour) avec photo du couple si possible

### Format d'affichage
```
★★★★★  "The most beautiful place we've ever stayed.
         The lagoon view from the bedroom is unreal."

         — Sarah & James M., New York · October 2025
         [Verified Airbnb guest]
```

- Carousel de 5-8 reviews sur la homepage
- Page dédiée "/reviews" avec tous les témoignages
- Note globale visible : "★ 4.97 / 5 · 47 reviews"

---

## 6. Blog / Journal de Voyage (SEO)

### Objectif
Générer du trafic organique US via des articles SEO ciblant les requêtes informationnelles.

### Catégories d'articles
1. **Travel Guides** — "Ultimate Guide to Visiting Tahiti in 2026"
2. **Comparison** — "Tahiti vs Bora Bora: Which Island is Right for You?"
3. **Activities** — "10 Things to Do in Tahiti Beyond the Beach"
4. **Practical** — "Tahiti Travel Requirements for US Citizens 2026"
5. **Seasonal** — "Best Time to Visit French Polynesia (Month by Month)"
6. **Food** — "Polynesian Food Guide: What to Eat in Tahiti"

### Format des articles
- 1,500-3,000 mots (pour ranker sur Google US)
- Photos originales de la villa et de l'île
- Schema.org Article markup
- CTA intégré dans chaque article vers le calculateur

---

## 7. Formulaire de Contact & FAQ

### FAQ (priorité haute — les Américains lisent avant de contacter)

**Questions pratiques voyage :**
- Do US citizens need a visa to visit French Polynesia?
- How do I get from Tahiti Airport to the villa?
- What's the best time of year to visit?
- Is Tahiti safe for American tourists?
- What's the currency in French Polynesia? Do you accept USD?

**Questions villa :**
- What is the maximum occupancy of the villa?
- Is the pool heated?
- Is there air conditioning in all rooms?
- Is the villa pet-friendly?
- Is there a minimum stay requirement?

**Questions réservation :**
- How far in advance can I book?
- What is your cancellation policy?
- Is the 30% deposit refundable?
- Can I modify my reservation after booking?
- Do you offer discounts for long stays?

### Formulaire de contact
```
Name *
Email *
Check-in date (approx.)
Check-out date (approx.)
Number of guests
Message *

[SEND MESSAGE]
Expected response time: within 2 hours
```

---

## 8. Chat / Messagerie Instantanée

### Options
1. **WhatsApp Business** (bouton flottant) — recommandé, très utilisé par les propriétaires PF
2. **Tidio** ou **Crisp** — chat widget avec réponses automatisées + handoff humain

### Comportement
- Bouton WhatsApp flottant en bas à droite (mobile + desktop)
- Message d'accueil automatique : "Hi! I'm here to help with any questions about Villa Paradise. I typically respond within 1 hour 🌺"
- Horaires de réponse affichés : "Responds in ~1 hour (UTC-10)"

---

## 9. Header & Navigation

```
[Logo Villa Paradise]    Home  The Villa  Experiences  Gallery  Reviews  Blog    [Book Now]
```

**Mobile (hamburger menu) :**
```
[Logo]                              [☰]
```

**Sticky header :** reste visible au scroll
**CTA "Book Now" :** toujours présent dans le header — bouton or

---

## 10. Footer

```
Villa Paradise Tahiti

"Your Private Paradise in the Heart of French Polynesia"

Quick Links          Experiences          Legal
Home                 Snorkeling           Privacy Policy
The Villa            Excursions           Terms & Conditions
Experiences          Catering             Cookie Policy
Gallery
Rates & Booking      Contact Us
Reviews              📧 hello@villaparadisetahiti.com
Blog                 📱 WhatsApp: +689 XX XX XX XX
                     📍 Tahiti, French Polynesia

Follow us: [Instagram] [Facebook] [TripAdvisor]

© 2026 Villa Paradise Tahiti · All rights reserved
Designed by TahitiTechDigital
```

---

## 11. Features d'administration (Back-office)

### Interface admin (simple)
- **Gestion du calendrier** : bloquer/débloquer des dates
- **Gestion des tarifs** : modifier prix par nuit, prix saisonnier
- **Gestion des expériences** : activer/désactiver, modifier prix
- **Liste des réservations** : voir les réservations confirmées
- **Réception des emails** : notifications de nouvelles demandes

### Options d'implémentation
- **Option A** (recommandée) : CMS Sanity.io pour la gestion de contenu + Stripe Dashboard pour les paiements
- **Option B** : Interface admin Next.js custom (plus complexe, plus puissant)

---

*Tarifs validés par le client (mars 2026) : villa $690/nuit · excursions $150/personne · traiteur $150/personne.*
