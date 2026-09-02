# Passer le site public en français : état des lieux et chiffrage

> Rédigé le 1er septembre 2026, après l'audit déclenché par la question
> « peut-on choisir la langue et la devise ? ».
> Aucune décision n'est prise ici. Ce document existe pour que le chiffrage
> survive à la conversation.

## En une phrase

Le site public n'a **aucune** internationalisation. Le français que l'on voit
aujourd'hui vient de la traduction automatique du navigateur du visiteur, et
elle a un mérite qu'aucune solution partielle n'aura : elle couvre 100% des
pages.

## Le malentendu à lever d'abord

Le travail récent sur `site_content.value_fr` et sur les colonnes
`translations` ressemble à de la traduction. Ce n'en est pas.

`getSiteContent()` ne lit que deux colonnes ([lib/content/index.ts:25](../lib/content/index.ts#L25)) :

```ts
await adminClient.from('site_content').select('key, value')
```

`value_fr` n'est jamais dans la projection. Sa seule lectrice est
`getSiteContentEntries()`, appelée uniquement par les cinq pages d'édition de
l'admin. La migration le dit noir sur blanc :

> « `value` stays the English text read by the public site (unchanged read
> path); `value_fr` holds the operator's French source so it is pre-filled on
> re-edit. »

Autrement dit : `value` est le texte publié, `value_fr` est le brouillon de
l'opérateur. Ce sont **deux rôles différents**, pas deux langues publiables.
La signature même de la fonction, `(key, fallback) => string`, n'a pas de
notion de langue : il n'y a qu'un emplacement par clé.

Même chose pour les colonnes `translations` des tables `villa`,
`experiences`, `posts`, `reviews`, `faqs` et `excursion_providers` : remplies
par l'admin, jamais rendues.

**Une seule exception**, et elle ne rend rien : la recherche de la FAQ
concatène le français dans la botte de foin pour que « acompte » trouve la
question sur le « deposit »
([FaqSearchableGroups.tsx:25](../components/sections/faq/FaqSearchableGroups.tsx#L25)).
Le texte affiché reste anglais.

## Ce qui n'existe pas

| Brique | État |
|---|---|
| Segment de route `[locale]` | absent |
| Bibliothèque i18n (`next-intl`, `react-i18next`...) | aucune dépendance |
| Bloc `i18n` dans `next.config.mjs` | absent |
| Contexte ou hook de locale | aucun |
| Cookie de langue | aucun. Seul `vpt_currency` existe |
| Logique de langue dans `middleware.ts` | aucune. Le middleware ne fait que rafraîchir la session Supabase et garder `/admin` |
| Lecture de `Accept-Language` | nulle part |
| `hreflang` / `alternates.languages` | absents des métadonnées |
| Catalogues de messages | aucun dossier `locales/` ni `messages/` |

`<html lang="en">` est écrit en dur ([app/layout.tsx:59](../app/layout.tsx#L59)),
et `SITE_LOCALE = 'en_US'` est une constante utilisée une seule fois, dans le
bloc Open Graph.

Le `LanguageSwitcher` est du **code mort** : retiré du header en juillet
(commit `50be51d`), il n'est monté par aucune page. Son option Français porte
`available: false` et son gestionnaire de clic ne fait que fermer le menu.

## Le volume à traduire

Comptage des chaînes visibles par un visiteur, hors commentaires et hors
classes Tailwind. Marge d'environ 15%.

| Périmètre | Chaînes | État |
|---|---:|---|
| Déjà pourvues d'une clé (5 registres) | **249** | 6 routes publiques sur 14 |
| Reste de la vitrine | **~530** | aucune clé, tout en dur |
| Tunnel de réservation, compte, authentification | **~390** | aucune clé, tout en dur |
| **Total vitrine seule** | **~780** | |
| **Total site complet** | **~1 170** | |

### Ce qui est déjà couvert

`/rates`, `/getting-here`, `/contact` en entier. `/` pour 6 sections sur 9.
`/villa` pour 1 section sur 7 (le bloc « Le cadre » uniquement). Les trois
pages légales disposent d'une échappatoire markdown, une par page.

### Ce qui ne l'est pas du tout

`/experiences` et `/experiences/[slug]` (~118 chaînes, la page détail est la
plus grosse page vitrine non couverte à elle seule), `/blog` et
`/blog/[slug]` (~86), `/faq` (~59), `/reviews` (~59), `/gallery` (~53),
6 des 7 sections de `/villa` (~78), et toute la charpente : header, footer,
menu mobile, menu utilisateur, plus les libellés de navigation qui vivent en
dur dans `lib/navigation.ts`.

Le tunnel de réservation compte à lui seul ~333 chaînes, dont 92 pour le seul
`CheckoutForm` (chaque message de validation est une chaîne).

## Les angles morts, ceux qu'on découvre en cours de route

1. **`gallery_items` n'a aucune colonne `translations`.** Les légendes et les
   textes alternatifs des photos n'ont nulle part où stocker du français.
   C'est la seule table de contenu dans ce cas : il faudrait une migration.
2. **Les dates sont figées en locale américaine.** Une dizaine d'appels
   `toLocaleDateString('en-US', ...)` dans des composants publics, plus le
   calendrier `DateField` délibérément calé sur les usages américains. Ces
   points ne suivront pas un changement de langue tant qu'on ne leur passe pas
   la locale.
3. **Les pages légales sont du JSX**, pas du markdown : 223 chaînes réparties
   sur trois pages. L'échappatoire markdown existante est du tout ou rien, et
   pour une seule langue. Les versions françaises existent déjà dans
   `docs/legal/fr/`, mais ne sont câblées à rien.
4. **Le SEO est monolingue.** 23 exports de métadonnées sur les routes
   publiques, sans `hreflang` ni URL alternative. Un site bilingue sans cela
   se fait mal indexer.
5. **Les emails transactionnels** sont en anglais. Un client français qui
   réserve en français recevrait sa confirmation en anglais.

## Si le projet est lancé : les trois arbitrages

**1. Comment la langue voyage.** Segment de route `[locale]` (`/fr/rates`),
ou cookie plus middleware. Le segment est meilleur pour le SEO et permet de
garder le rendu statique par langue ; il impose de déplacer toutes les routes
publiques. Le cookie est moins invasif mais force le rendu dynamique, avec le
même compromis que celui déjà accepté pour la devise.

**2. La recherche de contenu doit devenir consciente de la langue.**
`getSiteContent()` renvoie une chaîne par clé. Il faut soit changer sa
signature, soit rendre la recherche dépendante de la locale, ce qui touche les
26 fichiers appelants et les ~249 appels `t()` existants.

**3. La sémantique de `value_fr` doit changer.** Aujourd'hui brouillon, il
devrait devenir une version publiable, avec la question du repli : que montre
une page française pour une clé sans français ? L'anglais, probablement, ce
qui ramène au point suivant.

## La recommandation

**Ne pas livrer de français partiel.**

Un site traduit à 40% à la main et anglais à 60% est, pour un visiteur
français, moins cohérent que ce qu'il obtient aujourd'hui : une traduction
navigateur intégrale, de qualité machine mais homogène. Le pire des cas serait
un visiteur qui choisit « Français », parcourt trois pages traduites, puis
tombe en anglais au moment de payer.

Deux chemins défendables :

- **Statu quo assumé.** Garder la traduction navigateur, et investir plutôt
  dans la qualité de l'anglais source, qui est ce que la machine traduit. Les
  249 clés françaises déjà saisies gardent leur utilité : elles servent de
  source d'édition et alimentent la recherche FAQ.
- **Projet complet, tunnel de réservation compris.** Environ 1 170 chaînes,
  plus le routage, plus les cinq angles morts ci-dessus. À chiffrer en jours,
  pas en heures.

Le choix intermédiaire, la vitrine seule, est celui à éviter : il coûte déjà
~530 chaînes et laisse le visiteur basculer en anglais à l'étape la plus
sensible du parcours.
