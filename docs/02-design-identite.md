# 02 — Design & Identité Visuelle

> **Villa Paradise Tahiti — Refonte 2026**
> Dernière mise à jour : Mars 2026

---

## 1. Philosophie design

### Positionnement visuel cible
**"Luxe tropical authentique"** — L'esthétique doit immédiatement évoquer la Polynésie française : lagon turquoise, sable blanc, végétation tropicale luxuriante, couchers de soleil dorés. Le tout traité avec un regard moderne et minimaliste, digne des meilleures propriétés de luxe mondiales.

### Sites de référence (moodboard)
- **Four Seasons Bora Bora** (fourseasons.com/borabora) — luxe absolu, photographie immersive
- **Airbnb Luxe** (airbnb.com/luxury) — minimalisme, grande photo, clarté UX
- **VRBO Premier** — confiance, détails techniques visibles, reviews mis en avant
- **One&Only Resorts** — storytelling émotionnel, identité forte
- **Explora Hotels** — nature brute + design épuré

### L'émotion à transmettre
> *"Je suis au paradis. J'ai besoin de réserver maintenant."*

En 3 secondes sur la homepage, le visiteur américain doit ressentir :
1. **Désir** — "Je veux être là"
2. **Confiance** — "C'est professionnel et sûr"
3. **Simplicité** — "Je peux réserver facilement"

---

## 2. Palette de couleurs

### Couleurs principales

| Nom | Hex | Usage |
|---|---|---|
| **Lagon** | `#006994` | Bleu profond du Pacifique — couleur principale, CTA secondaires |
| **Turquoise** | `#40B4C8` | Variante claire du lagon — accents, hover states |
| **Sable** | `#F5E6C8` | Sable chaud — backgrounds sections alternées |
| **Or Polynésien** | `#C9A84C` | Touches de luxe — titres premium, bordures, étoiles |
| **Blanc Nacre** | `#FAFAF8` | Background principal — propre, lumineux |
| **Nuit Tropicale** | `#1A2A3A` | Textes principaux — remplace le noir pur |

### Couleurs secondaires / utilitaires

| Nom | Hex | Usage |
|---|---|---|
| **Vert Feuille** | `#2D6A4F` | Badges "Disponible", éléments nature |
| **Corail** | `#E8614A` | Alertes, urgence (places limitées) |
| **Gris Clair** | `#F0F0EF` | Bordures, séparateurs |
| **Gris Texte** | `#6B7280` | Textes secondaires, meta-informations |

### Règles d'utilisation couleurs
- **CTA principal (Book Now, Check Availability)** → fond `#C9A84C` (or) avec texte blanc
- **CTA secondaire** → fond `#006994` (lagon) avec texte blanc
- **Backgrounds** → alterner `#FAFAF8` (blanc nacre) et `#F5E6C8` (sable)
- **Titres H1/H2** → `#1A2A3A` (nuit tropicale) ou blanc sur fond sombre/photo
- **Ne jamais** utiliser le rouge comme couleur de marque (connotation négative US)

---

## 3. Typographie

### Hiérarchie typographique

| Niveau | Police | Style | Taille indicative | Usage |
|---|---|---|---|---|
| **Display / Hero** | Cormorant Garamond | Italic, 300-400 | 64-96px | Titres héros, slogan principal |
| **H1** | Playfair Display | Regular 400 | 48-64px | Titres de sections principales |
| **H2** | Playfair Display | Regular 400 | 32-40px | Sous-sections |
| **H3** | Inter | SemiBold 600 | 20-24px | Titres de cards, prix |
| **Body** | Inter | Regular 400 | 16-18px | Texte courant, descriptions |
| **Caption** | Inter | Regular 400 | 12-14px | Légendes, meta-info |
| **Button / CTA** | Inter | Bold 700 | 14-16px | Boutons d'action |

### Sources Google Fonts (gratuites, performance OK)
```
Cormorant Garamond: 300italic, 400italic, 600italic
Playfair Display: 400, 700
Inter: 400, 500, 600, 700
```

### Règles typographiques
- **Letter-spacing** : +0.05em pour les H1/H2 (aéré, luxueux)
- **Line-height** : 1.6 pour le body, 1.2 pour les titres display
- **Jamais** plus de 65-70 caractères par ligne (body)
- **Uppercase** uniquement pour les labels de navigation et les badges (jamais les titres)

---

## 4. Iconographie & Illustration

### Style d'icônes
- **Librairie** : Phosphor Icons ou Lucide React — style "thin line" (1.5-2px stroke)
- **Taille** : 20-24px pour les icônes inline, 40-48px pour les icônes de features
- **Couleur** : `#C9A84C` (or) pour les icônes de prestige, `#006994` (lagon) pour les fonctionnels

### Icônes à utiliser par section
- Amenities villa : palmier, piscine, wifi, climatisation, cuisine, parking
- Excursions : bateau, plongée, randonnée, coucher soleil, étoiles (nuit)
- Traiteur : plat gastronomique, champagne, BBQ
- Confiance : bouclier (sécurité), étoile (reviews), certificat, carte bancaire

---

## 5. Photographie

### Direction artistique photo
La photographie est le coeur du site — c'est elle qui vend le rêve avant tout autre contenu.

**Style requis :**
- **Golden hour** — privilégier les photos au lever/coucher du soleil (lumière chaude et dorée)
- **Overwater shots** — prise de vue depuis l'eau, montrant la villa depuis le lagon
- **Interior lifestyle** — intérieurs habités (verre de champagne sur la table, livre ouvert, serviettes sur le lit), pas de photos "immobilières" froides
- **Drone** — vues aériennes montrant l'environnement paradisiaque (lagon, vegetation, proximité mer)
- **People** — si présents, modèles diversifiés (couple US de 40-55 ans, famille), jamais locaux exotisés

**Ce qu'il faut éviter :**
- Photos trop saturées (filtre Instagram années 2010)
- Photos HDR agressives
- Photos avec objets personnels du propriétaire visibles
- Photos de nuit sous-exposées

### Format & optimisation
- Format natif : `.jpg` haute résolution (4K+)
- Format web : WebP (compression moderne, poids réduit)
- Hero : 1920x1080px minimum
- Galerie : 1200x800px minimum
- Thumbnails : 600x400px

---

## 6. Vidéo

### Vidéo héro (homepage)
- **Type** : vue drone, boucle silencieuse (autoplay)
- **Durée** : 15-30 secondes en boucle
- **Contenu** : survol villa depuis le lagon → zoom arrière montrant l'île → panorama coucher de soleil
- **Format web** : MP4 H.264 + WebM (pour compatibilité)
- **Poids max** : 15-20 MB (compressé pour performance)
- **Fallback** : photo statique si vidéo non chargée (mobile data lent)

---

## 7. UI Components — Design directives

### Navigation
- **Type** : header transparent sur photo/vidéo héro, devient blanc/sombre au scroll
- **Logo** : left-aligned, text + icône palmier stylisé
- **Links** : Inter 400, uppercase, letter-spacing +0.1em
- **CTA header** : bouton "Book Now" en or `#C9A84C` — toujours visible

### Hero Section
- Plein écran (100vh)
- Vidéo/photo fond avec overlay gradient léger (20-30% opacity noir en bas)
- Titre display en blanc, centré
- Sous-titre en blanc semi-transparent
- CTA principal centré : "Check Availability" → bouton or

### Cards (chambre, excursion, traiteur)
- Fond blanc nacre
- Border radius : 12-16px
- Shadow : `0 4px 24px rgba(0,0,0,0.08)` (ombre douce)
- Image : ratio 4:3, cover
- Badge de prix : coin supérieur droit, fond or, texte blanc
- Hover : légère élévation (shadow + transform translateY -4px)

### Boutons

| Type | Background | Texte | Border |
|---|---|---|---|
| **Primary (Book)** | `#C9A84C` | `#FFFFFF` | none |
| **Secondary** | `#006994` | `#FFFFFF` | none |
| **Ghost** | transparent | `#1A2A3A` | `1px solid #1A2A3A` |
| **Ghost Light** | transparent | `#FFFFFF` | `1px solid #FFFFFF` |

- Border radius : 8px
- Padding : 14px 28px
- Uppercase + letter-spacing 0.05em
- Transition hover : 200ms ease

### Formulaires & Calculateur
- Fond blanc, border `1px solid #E0E0DF`
- Focus : border `#006994` + légère ombre bleue
- Labels : Inter 600, 14px, `#1A2A3A`
- Placeholders : `#9CA3AF`
- Select/dropdown : custom style cohérent

---

## 8. Layout & Espacement

### Grid
- 12 colonnes
- Gutter : 24px (mobile) / 32px (desktop)
- Container max-width : 1280px
- Padding horizontal : 24px (mobile) / 48px (tablet) / 80px (desktop)

### Espacement vertical (rythme)
- Entre sections : 80-120px (desktop), 48-64px (mobile)
- Entre éléments d'une section : 32-48px
- Entre textes (paragraphes) : 16-24px

### Breakpoints
| Nom | Width |
|---|---|
| Mobile | < 768px |
| Tablet | 768px - 1024px |
| Desktop | > 1024px |
| Large Desktop | > 1440px |

---

## 9. Animations & Micro-interactions

### Principes
- **Subtiles** — jamais distrayantes, toujours au service de l'expérience
- **Rapides** — durée max 300ms pour les transitions UI, 600ms pour les entrées de sections
- **Significatives** — chaque animation communique quelque chose (chargement, succès, transition)

### Animations prévues
| Élément | Animation | Durée |
|---|---|---|
| Sections au scroll | Fade in + slide up (20px) | 500ms ease-out |
| Cards au hover | Translate Y -4px + shadow | 200ms ease |
| Navigation au scroll | Background opacity 0→1 | 200ms |
| CTA hover | Slight scale (1→1.02) + brighten | 200ms |
| Galerie lightbox | Fade in | 300ms |
| Calculateur total | Counter animation (chiffres) | 400ms |
| Loading (paiement) | Spinner lagon color | — |

### Librairie animation recommandée
- Framer Motion (si Next.js) ou CSS custom animations
- Pas de GSAP (overhead inutile pour ce projet)

---

## 10. Accessibilité (A11y)

- Contraste couleurs : respect WCAG AA minimum (4.5:1 pour texte normal)
- Focus visible sur tous les éléments interactifs
- Alt text sur toutes les images
- Labels sur tous les champs de formulaire
- Navigation au clavier complète
- Pas d'animation auto si `prefers-reduced-motion: reduce`

---

*Ce document sert de référence de design pour le développement. Toute déviation doit être validée avec le chef de projet.*
