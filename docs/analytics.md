# Mesure d'audience

> Rédigé le 8 septembre 2026, en même temps que la fonctionnalité.
> Couvre la décision, le fonctionnement, la mise en place et l'extension.

## Le point de départ

Le site ne mesurait **rien**. Le code de Google Analytics et de Hotjar était bien
présent dans `components/analytics/`, mais leurs identifiants
(`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_HOTJAR_ID`) n'ont jamais été renseignés. Les
deux composants rendaient donc du vide, et la page en ligne ne chargeait aucun
script de mesure. Vérifié directement sur la production avant de construire quoi
que ce soit.

Conséquence importante : **il n'existe aucun historique.** Les chiffres partent de
zéro au jour de la mise en service.

## La décision, et pourquoi

Trois voies étaient possibles.

| Voie | Ce qu'elle donne | Ce qu'elle coûte |
|---|---|---|
| Google Analytics | Un outil complet, sans développement | Les chiffres restent chez Google, pas dans l'admin. Bannière de consentement obligatoire |
| Suivi par visiteur | Parcours individuels, sessions, retours | Bannière obligatoire, politique de confidentialité à modifier |
| **Mesure anonyme agrégée** | Compteurs, entonnoir, origines, appareils | Pas de parcours individuel |

**La troisième a été retenue.** Le raisonnement décisif n'est pas juridique mais
arithmétique : une bannière de consentement fait disparaître des statistiques les
40 à 60% de visiteurs qui refusent. Des chiffres amputés de moitié ne permettent
pas de décider quoi que ce soit. Une mesure qui n'identifie personne n'a pas
besoin de bannière, donc **elle compte tout le monde**.

Le contenu de la page a été choisi en entier : entonnoir de réservation, pages et
photos les plus vues, origine des visiteurs, activité commerciale.

## Ce qui est mesuré, et ce qui ne l'est pas

**Enregistré** : le chemin de la page (sans les paramètres d'URL), le domaine du
référent, le pays fourni par le réseau de diffusion, la classe d'appareil
(mobile, tablette, ordinateur), et un identifiant de visiteur valable une journée.

**Jamais enregistré** : aucun cookie, aucune adresse IP, aucune chaîne de
navigateur, aucun paramètre d'URL, aucune donnée nominative.

### Le cœur du dispositif : le hachage journalier

`visitor_day` est un condensat SHA-256 tronqué à 16 caractères, calculé sur
l'adresse IP, le navigateur, **la date du jour** et un secret serveur.

Trois propriétés en découlent :

- la même personne, le même jour, produit la même valeur, donc elle compte pour
  un visiteur et non pour dix
- la même personne, **le lendemain, produit une valeur différente** : personne ne
  peut suivre quelqu'un d'un jour à l'autre
- le secret serveur empêche de recalculer la valeur à partir d'une IP devinée,
  même pour qui obtiendrait la table

L'IP et le navigateur servent au calcul puis sont jetés. La fonction ne les
renvoie pas, ce qui rend impossible de les stocker par inadvertance.

## Mise en place

### 1. Appliquer la migration

Une seule action, une seule fois. Ouvrir Supabase, menu **SQL Editor**, coller le
contenu de [`supabase/migrations/019_analytics.sql`](../supabase/migrations/019_analytics.sql),
sélectionner l'ensemble, exécuter.

Le fichier crée la table `analytics_events`, trois index, et active la sécurité au
niveau des lignes **sans aucune politique publique** : la clé anonyme ne peut ni
lire l'audience, ni insérer de fausses lignes. Seul le serveur écrit, avec la clé
de service.

Toutes les instructions sont rejouables sans effet la deuxième fois.

### 2. Vérifier

Ouvrir `/admin/analytics`. Si le bandeau rouge « Migration à appliquer »
disparaît, la table existe.

Visiter ensuite le site public, puis recharger la page Audience : le compteur de
visiteurs doit passer à 1. Le comptage se fait à la visite, il n'y a pas de délai.

### 3. Rien d'autre

Aucune variable d'environnement à créer, aucun compte tiers, aucune clé. Le
secret utilisé pour le hachage réutilise `CRON_SECRET`, déjà présent dans
Netlify, et retombe sur une valeur par défaut s'il manque.

## Comment ça fonctionne

```
Navigateur                     Serveur                      Base
─────────                      ───────                      ────
components/analytics/Pulse.tsx
  à chaque page vue
  sendBeacon vers /api/pulse
  corps : { path, ref }
        │
        ▼
                        app/api/pulse/route.ts
                          rejette /admin, /api
                          lit IP, navigateur, pays
                            depuis les en-têtes
                          calcule le hachage du jour
                          jette IP et navigateur
                          répond 204, toujours
                                  │
                                  ▼
                                              analytics_events
                                              une ligne par événement
```

Puis, à la lecture :

```
app/(admin)/admin/analytics/page.tsx
  └── lib/analytics/summary.ts
        lit la fenêtre demandée, agrège en mémoire
```

### Les fichiers

| Fichier | Rôle |
|---|---|
| `supabase/migrations/019_analytics.sql` | La table, ses index, sa sécurité |
| `lib/analytics/collect.ts` | Classification du référent, de l'appareil, hachage du visiteur |
| `app/api/pulse/route.ts` | Le point de collecte |
| `components/analytics/Pulse.tsx` | La balise, montée dans `app/layout.tsx` |
| `lib/analytics/summary.ts` | L'agrégation lue par l'admin |
| `app/(admin)/admin/analytics/page.tsx` | La page |

### Trois choix techniques qui méritent explication

**Pourquoi `/api/pulse` et non `/api/track`.** Les bloqueurs de publicité filtrent
les mots « track » et « analytics » dans une adresse. Une mesure interne et
anonyme s'en trouverait amputée sans raison. Rien n'est dissimulé au visiteur : ce
nom évite seulement une liste noire conçue pour les traqueurs tiers.

**Pourquoi le référent voyage dans le corps de la requête.** L'en-tête `referer` de
la balise contient la page depuis laquelle elle part, pas la provenance du
visiteur. S'y fier ferait passer **toutes** les visites pour directes. Le
navigateur envoie donc `document.referrer` explicitement, et le serveur n'en
conserve que le domaine.

**Pourquoi une balise côté navigateur plutôt qu'un comptage serveur.** Les pages
publiques sont pré-générées et servies par le cache : une requête n'atteint pas
toujours notre code. Un comptage serveur manquerait la majorité des visites.

## Lire la page

**Entonnoir de réservation.** Chaque étape indique le nombre de visiteurs
distincts qui l'ont atteinte, et le pourcentage par rapport à l'étape précédente.
Ce pourcentage passe en rouge sous 40%. C'est le chiffre à surveiller : il montre
où les visiteurs abandonnent.

**Photos les plus ouvertes.** Compte les agrandissements depuis la galerie, pas les
affichages. Utile pour décider quoi mettre en avant et quoi photographier ensuite.

**Pays.** Fourni par Netlify en production. Absent en développement local, la
colonne restera vide sur ta machine.

**Activité commerciale.** Ces quatre chiffres viennent des tables de réservations,
demandes et abonnés. Ils sont exacts même sans aucune visite mesurée. Le montant
encaissé compte les **acomptes reçus**, pas la valeur totale des séjours : c'est
l'argent réellement en caisse.

## Ajouter un événement

Un événement nommé se déclenche depuis n'importe quel composant client :

```ts
import { sendPulse } from '@/components/analytics/Pulse'

sendPulse({ path: '/rates', kind: 'devis_calcule', label: '7 nuits' })
```

`kind` est limité à 40 caractères, `label` à 160. Les deux sont libres. Pour que
l'événement apparaisse dans l'admin, ajouter son agrégation dans
`lib/analytics/summary.ts` sur le modèle de `topPhotos`.

**Ne jamais mettre dans `label`** une adresse email, un identifiant de client ou
quoi que ce soit de nominatif. Ce serait la seule façon de transformer une mesure
anonyme en fichier de données personnelles, et cela rendrait la bannière de
consentement obligatoire.

## En cas de problème

**Les chiffres restent à zéro.** Vérifier que la migration est passée, puis ouvrir
les outils de développement du navigateur, onglet Réseau, et chercher un appel à
`/api/pulse` au chargement d'une page publique. Absent, c'est un bloqueur de
contenu particulièrement agressif. En 204, tout va bien.

**Les visiteurs semblent trop peu nombreux.** Normal et attendu : les bloqueurs de
contenu suppriment une part du trafic, et rien ne compte les robots d'indexation
comme des visiteurs, ce qui est le comportement souhaité.

**Le pays est vide.** Attendu en local. En production, Netlify fournit l'en-tête.

**Le bandeau « beaucoup d'événements ».** L'agrégation est plafonnée à 50 000
lignes par période. Au-delà, choisir une période plus courte, ou passer à une
agrégation en SQL. À ce trafic, la question ne devrait pas se poser avant
longtemps.

## Limites assumées

- **Pas de parcours individuel.** On sait combien de visiteurs ont atteint le
  paiement, pas lesquels ni par quel chemin exact.
- **Pas de visiteurs récurrents.** Impossible par construction, c'est le prix du
  hachage journalier.
- **Pas de durée de session.** Il faudrait un identifiant persistant.
- **Pas de rétroactivité.** Rien avant la mise en service.

Si l'un de ces points devient indispensable, il faut basculer sur un suivi par
visiteur, avec bannière de consentement et mise à jour de la politique de
confidentialité. C'est un changement de nature, pas un réglage.

## Google Analytics

Le code reste en place et inactif. Renseigner `NEXT_PUBLIC_GA_ID` dans Netlify
suffirait à l'activer, mais **cela rendrait la bannière de consentement
obligatoire** et ferait cohabiter deux mesures qui ne compteront jamais pareil.
À ne faire que si un besoin précis l'exige, et alors autant retirer la mesure
interne pour éviter deux vérités.
