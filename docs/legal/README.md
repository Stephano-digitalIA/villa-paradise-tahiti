# Documents légaux, transcription Markdown

Ces trois fichiers reprennent le contenu publié sur le site, extrait des pages
React, pour relecture, archivage ou envoi à un conseil juridique.

| Fichier | Page publiée | Dernière mise à jour affichée |
|---|---|---|
| `terms-of-service.md` | `/legal/terms` | 6 juin 2026 |
| `cancellation-policy.md` | `/legal/cancellation` | 1er mai 2026 |
| `privacy-policy.md` | `/legal/privacy-policy` | 2 juin 2026 |

Les traductions françaises se trouvent dans `fr/` :

| Fichier | Traduit de |
|---|---|
| `fr/conditions-generales.md` | `terms-of-service.md` |
| `fr/politique-annulation.md` | `cancellation-policy.md` |
| `fr/politique-confidentialite.md` | `privacy-policy.md` |

**La version anglaise seule fait foi.** Les traductions sont fournies pour
lecture et relecture ; en cas de divergence, c'est le texte publié en anglais
qui engage la villa. Chaque fichier français le rappelle en tête.

## Ces fichiers ne sont pas la source de vérité

Le site rend le JSX de `app/(legal)/legal/*/page.tsx`. Modifier ces Markdown ne
change rien à ce que voient les visiteurs, et rien ne garantit qu'ils restent
synchronisés.

Il existe cependant un mécanisme prévu pour cela : chaque page lit une clé de
`site_content` (`legal.terms.body`, `legal.cancellation.body`,
`legal.privacy.body`) et, **quand elle est renseignée**, rend ce Markdown via
`LegalMarkdown` à la place du JSX. Ces trois clés sont vides aujourd'hui.

Autrement dit, coller le contenu d'un de ces fichiers dans la clé
correspondante suffit à en faire la version publiée. C'est la voie à suivre si
vous voulez que les Markdown deviennent la source, plutôt que d'entretenir deux
copies.

## Corrigé le 31 août 2026 : les sous-traitants

La section 3 de la politique de confidentialité citait les mauvais
prestataires. Corrigé dans la page publiée et dans les deux transcriptions :

- **Vercel** remplacé par **Netlify**, l'hébergeur réel.
- **Sanity.io** retiré, il n'est plus utilisé.
- **Supabase ajouté** : base de données, authentification et stockage. C'est le
  sous-traitant qui détient l'essentiel des données personnelles et il était
  absent du document censé les recenser.
- **ImprovMX ajouté** : redirection des emails reçus sur le domaine.
- Section 4, **Meta Pixel et Pinterest Tag retirés** : aucun code ne les
  implémente. Déclarer une collecte qui n'a pas lieu inquiète le visiteur sans
  raison. La catégorie marketing indique désormais qu'aucun cookie n'est déposé.

## Reste à vérifier

**Stripe est cité comme prestataire de paiement** (sections 1.1 et 3), mais il
n'est pas configuré : le test de paiement en production a routé la carte vers
PayPal, ce que le code ne fait que lorsque Stripe est absent. Le mentionner
n'est pas faux si vous prévoyez de l'activer ; à retirer sinon.

Le dépôt de garantie de 2 000 USD, annoncé en section 3.1 mais implémenté nulle
part, a été retiré des conditions générales le 31 août 2026.

**Écarts restants entre les conditions générales et le site :**

- Les tarifs cités (590, 890, 1 290 USD) sont écrits en dur dans le texte, alors
  que les tarifs réels se modifient dans `/admin/settings`. Toute évolution
  tarifaire rendra les conditions fausses sans que rien ne le signale.
- Le prélèvement automatique du solde 30 jours avant l'arrivée (section 2) n'est
  pas implémenté non plus. Le solde doit être encaissé à la main.

**À contrôler dans le pied de page :** la politique mentionne un lien « Cookie
preferences » et un lien « Do Not Sell or Share My Personal Information ».
Vérifier qu'ils existent.

## Avertissement

Ces textes sont des projets rédigés sans validation par un avocat. Le
commentaire en tête de `privacy-policy/page.tsx` le dit explicitement : la
mention d'attente de validation doit être conservée jusqu'à la signature d'un
conseil habilité.
