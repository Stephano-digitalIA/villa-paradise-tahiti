# UI Primitives — Villa Paradise Tahiti

Composants UI de base du design system, dérivés de [`docs/02-design-identite.md`](../../docs/02-design-identite.md).

> Import via le barrel : `import { Button, Card, Container } from '@/components/ui'`

Tous les composants utilisent `forwardRef`, acceptent `className` (fusionné via `cn`), et sont **server components** par défaut (aucun n'a besoin de `"use client"` à ce stade).

---

## Container

Wrapper centré max-width 1280px avec padding responsive.

```tsx
import { Container } from '@/components/ui'

<Container>Contenu</Container>
<Container as="article" className="text-center">…</Container>
```

**Props :** `as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'aside'`

---

## Section

Wrapper sémantique `<section>` avec padding vertical et background tonal.

```tsx
import { Section, Container } from '@/components/ui'

<Section tone="sand" spacing="default">
  <Container>Contenu de la section</Container>
</Section>
```

**Variants :**

- `tone`: `pearl` (def) · `sand` · `midnight` · `lagoon` · `transparent`
- `spacing`: `default` (py-16→32) · `compact` (py-12→20) · `tight` (py-8→16) · `none`

---

## Button

Bouton avec variants luxe.

```tsx
import { Button } from '@/components/ui'
import Link from 'next/link'

<Button variant="primary" size="lg">Check Availability</Button>
<Button variant="secondary">Book Direct</Button>
<Button variant="outline">Discover</Button>
<Button variant="ghost">Learn more</Button>
<Button variant="link">View all</Button>

{/* asChild — wrap un Next Link sans markup imbriqué */}
<Button asChild variant="primary">
  <Link href="/villa">Discover the Villa</Link>
</Button>
```

**Variants :**

- `variant`: `primary` (gold) · `secondary` (lagoon) · `outline` · `outline-light` · `ghost` · `link`
- `size`: `sm` · `md` (def) · `lg` · `icon`
- `rounded`: `default` (rounded-lg) · `full` · `none`

**Props additionnels :** `asChild?: boolean` — délègue le rendu au seul enfant (utile pour `<Link>`).

---

## Input

Champ texte cohérent avec le design system (border lagoon/20, focus gold).

```tsx
import { Input } from '@/components/ui'

<Input type="email" placeholder="your@email.com" />
<Input type="text" error placeholder="Champ erroné" />
<Input type="date" />
```

**Props :** tous les props natifs `<input>` + `error?: boolean`.

---

## Card

Conteneur luxe composable (chambres, excursions, traiteur).

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

<Card interactive elevation="card" tone="pearl">
  <CardHeader>
    <CardTitle>Ocean Suite</CardTitle>
    <CardDescription>Private lagoon view · 65 m²</CardDescription>
  </CardHeader>
  <CardContent>Description longue ici…</CardContent>
  <CardFooter>
    <span className="font-heading text-h3-luxe">$1,250</span>
    <span className="text-eyebrow text-midnight-400">per night</span>
  </CardFooter>
</Card>
```

**Variants Card :**

- `tone`: `pearl` (def) · `sand` · `midnight`
- `elevation`: `flat` · `soft` · `card` (def) · `elevated`
- `interactive`: `true` ajoute hover lift + cursor-pointer

**Sous-composants :** `CardHeader`, `CardTitle` (rend un `<h3>`), `CardDescription`, `CardContent`, `CardFooter`.

---

## Badge

Étiquettes courtes (statuts, prix, labels).

```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Available</Badge>
<Badge variant="warning">Only 3 left</Badge>
<Badge variant="info">Concierge</Badge>
<Badge variant="luxe">Featured</Badge>
<Badge variant="gold" size="lg">$1,250 / night</Badge>
```

**Variants :**

- `variant`: `default` · `success` (leaf) · `warning` (coral) · `info` (lagoon) · `luxe` (or sur nuit) · `gold` (or plein)
- `size`: `sm` · `md` (def) · `lg`

---

## Tokens Tailwind disponibles

Une fois ces primitifs en place, voici les classes Tailwind clés à réutiliser dans les sections plus complexes (B2/B3) :

**Couleurs (chaque palette dispose des stops 50→950) :**
`lagoon`, `turquoise`, `sand`, `gold`, `pearl`, `midnight`, `leaf`, `coral`.

**Typographie :**

- `font-display` — Cormorant Garamond (héros italic)
- `font-heading` — Playfair Display (H1/H2)
- `font-sans` — Inter (body, boutons, défaut)

**Tailles luxe :**
`text-eyebrow`, `text-body-sm/md/lg`, `text-h3-luxe`, `text-h2-luxe`, `text-h1-luxe`, `text-hero-sm/md/lg/display`.

**Animations :**
`animate-fade-in`, `animate-fade-in-up`, `animate-subtle-zoom`, `animate-shimmer`, `animate-scroll-pulse`.

**Utilities composées (globals.css) :**
`.container-luxe`, `.section-y`, `.section-y-sm`, `.eyebrow`.

---

## Conventions

- **`cn(...)`** utilisé pour fusionner les classes (clsx + tailwind-merge). Importé depuis `@/lib/utils`.
- **`forwardRef`** sur tous les composants pour compatibilité avec les libs de form / motion à venir.
- **`cva`** (class-variance-authority) pour gérer les variants de manière typée.
- **A11y** : focus ring gold visible (`focus-visible:ring-2 ring-gold`), `aria-invalid` sur Input en erreur, `prefers-reduced-motion` respecté globalement (voir `globals.css`).
