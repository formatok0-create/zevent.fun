# ZEVENT

L'invitation de mariage digitale, dessinée comme une papeterie de maison.

Zevent est une plateforme qui permet à un couple de créer une page de mariage
complète — hero, histoire, galerie, compte à rebours, programme, musique — et de
la partager sous la forme d'un lien unique : `zevent.fun/mariage/aicha-et-yassine`.

---

## Démarrer en une minute

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:3000`.

Sans variables d'environnement, l'application démarre en **mode démonstration** :
les données vivent en mémoire, aucune dépendance externe n'est nécessaire.

Compte de démonstration :

```
demo@zevent.fun
zevent2026
```

Deux invitations sont préchargées : **Aïcha & Yassine** (publiée, visible sur
`/mariage/aicha-et-yassine`) et **Emma & Nathan** (brouillon).

---

## Brancher Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez le **SQL Editor** et exécutez `supabase/schema.sql`. Le fichier crée les
   tables, les index, les contraintes, les triggers, les politiques RLS et les
   buckets Storage. Il est idempotent : vous pouvez le rejouer.
3. Copiez `.env.example` vers `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Dès que ces variables existent, `isSupabaseConfigured` bascule et le magasin de
démonstration n'est plus jamais importé. **C'est ainsi qu'on supprime les données
de démonstration** : il n'y a rien à nettoyer.

`supabase/seed.sql` permet, si vous le souhaitez, de recréer les deux invitations
d'exemple dans une vraie base. Renseignez l'UUID de votre utilisateur en haut du
fichier avant de l'exécuter.

### Authentification

Dans **Authentication → URL Configuration**, ajoutez vos URLs de redirection :

```
http://localhost:3000/auth/callback
https://votre-domaine.com/auth/callback
```

---

## Déployer sur Vercel

1. Poussez le dépôt, puis importez-le sur Vercel.
2. Ajoutez les variables d'environnement, en cochant bien
   **Production** et pas seulement Preview :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | l'URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé publiable |
| `NEXT_PUBLIC_SITE_URL` | `https://zevent.fun` — le domaine réel |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` |

3. Déployez. Une variable `NEXT_PUBLIC_` est figée dans le bundle au
   moment du build : l'enregistrer après coup ne suffit pas, il faut
   redéployer.

`SUPABASE_SERVICE_ROLE_KEY` n'est nécessaire que si vous encaissez —
voir « La chaîne de paiement » plus bas. Sans elle, l'application
fonctionne, mais la caisse ne s'affiche jamais et les webhooks
répondent 404.

### Un seul domaine

Vercel sert la même application sur `zevent.fun` et sur son domaine de
déploiement. Les deux marchent, donc on finit par utiliser les deux, et
c'est là que tout casse : SasPay ne connaît que le domaine déclaré dans
son tableau de bord, et un cookie de session appartient au domaine qui
l'a posé — se connecter sur l'URL Vercel puis revenir sur `zevent.fun`,
c'est revenir déconnecté.

`middleware.ts` tranche en amont : en production, tout ce qui arrive par
un domaine Vercel repart en 308 sur le domaine déclaré. Et `config.ts`
refuse une `NEXT_PUBLIC_SITE_URL` en `*.vercel.app`, plutôt que
d'envoyer le client sur une page que le prestataire rejette.

---

## La porte d'entrée

Depuis l'ajout du second produit, `/` n'est plus la landing mariage : c'est
**la porte**. Deux célébrations, deux formes, un seul écran sans défilement.

| Route | Contenu |
|---|---|
| `/` | La porte : mariage ou anniversaire |
| `/mariage` | La landing mariage (inchangée, simplement déplacée) |
| `/mariage/[slug]` | L'invitation publique |
| `/anniversaire` | La landing anniversaire |

Le segment statique `/mariage` et le segment dynamique `/mariage/[slug]`
cohabitent sans conflit : Next donne toujours la priorité au statique.
`/mariage` reste une URL directe et partageable, pour les campagnes et le
référencement : personne n'est obligé de passer par la porte.

### La landing anniversaire

`src/components/fete/` reprend l'ossature exacte du mariage — nav, hero,
promesse, comment ça marche, collections, expérience, mobile, CTA, footer —
avec sa propre voix. Les composants du mariage n'ont pas été modifiés : ce sont
deux dossiers frères qui partagent le design system, les boutons, les
téléphones et les composants de mouvement.

Le hero du mariage repose sur deux prénoms sous une arche ; celui de la fête
repose sur **l'âge**, en très grand, dans le quadrilobe. C'est la seule chose
qu'un anniversaire a et qu'un mariage n'a pas.

**Provisoire :** `fete/showcase.tsx` affiche quatre collections écrites en dur
dans le fichier. Dès que les définitions existeront, elles seront remplacées par
`listTemplatesFor("anniversaire")`, exactement comme côté mariage — le reste de
la section ne bougera pas.

### Les collections de la fete

Quatre ecritures pour les garcons de 1 a 10 ans, dans
`src/templates/definitions/anniversaire/` :

| Collection | Age | Decor | Fond |
|---|---|---|---|
| Royaume | 3 - 10 ans | Champignons, briques, pieces | Prairie |
| Comics | 4 - 10 ans | Eclairs, bulles, etoiles d'impact | Jaune / rouge |
| Petit Patron | 1 - 4 ans | Nuages, noeud papillon, montgolfiere | Ciel pale |
| Cosmos | 5 - 10 ans | Fusee, planetes, etoiles | Nuit d'encre |

Aucun personnage sous licence n'entre dans Zevent. Les motifs sont dessines au
trait dans `components/motifs-fete.tsx` : un champignon, un eclair, un noeud
papillon, une fusee - des formes generiques que personne ne possede et qu'un
enfant reconnait tout aussi bien. C'est aussi ce qui rend le produit vendable.

Le hero de la fete est un carton pose sur un fond sature, avec les motifs semes
autour : les collections de mariage restent en papier ivoire, la fete assume la
couleur. Les apercus se visitent sans compte sur `/anniversaire/apercu/<id>`,
avec une invitation fictive construite en memoire (`src/lib/demo/fete.ts`).

### L'album des annees

La section que le mariage n'a pas. Un rail horizontal, une carte par age, du
premier anniversaire jusqu'a celui qu'on fete. La derniere carte porte l'accent
et la mention « Aujourd'hui ».

Le rail fait son trajet tout seul la premiere fois qu'il entre a l'ecran : il
glisse jusqu'a l'annee en cours, puis recule legerement pour montrer qu'il se
manipule. `prefers-reduced-motion` annule ce deplacement.

Le format en base est un `jsonb` :

```json
[{ "year": 2026, "age": 7, "url": "https://...", "caption": "La cabane" }]
```

Les entrees sans `year` ou sans `age` sont ignorees, et le tri se fait au rendu :
on ne fait jamais confiance a l'ordre saisi.

**Migration :** `supabase/migration-003-anniversaire.sql`, a jouer apres
`migration-002-musulman.sql`. Idempotente.

Elle ajoute la colonne `product` (enum `mariage` / `anniversaire`, defaut
`mariage`), les trois champs de la fete (`celebrant_name`, `celebrant_age`,
`album`), deux index, et le bucket `invitation-album` - avec la reecriture des
trois politiques de stockage, qui enumerent les buckets un par un.

Elle retire surtout trois NOT NULL : `groom_name`, `bride_name` et `type`. Un
anniversaire n'a ni deux prenoms ni confession. Ces exigences sont remplacees
par une seule contrainte, `invitation_identite`, qui les impose au mariage et
impose `celebrant_name` a l'anniversaire.

Aucune colonne n'est renommee, aucune valeur reecrite : les invitations de
mariage deja en base deviennent des `mariage` et restent valides.

La migration a ete jouee sur un PostgreSQL 16 vierge, dans l'ordre
`schema.sql` -> `002` -> `003`, avec un mariage insere avant `003` pour verifier
qu'il survit. Les huit cas de contrainte passent : anniversaire sans prenom,
prenom fait d'espaces, age a 200, album qui n'est pas un tableau, mariage sans
mariee et mariage sans type sont tous rejetes.

Tant que la migration n'est pas jouee, les sections de la fete retombent sur les
colonnes du mariage - `bride_name` pour le prenom, `wedding_date` pour la date.

### Le parcours de la fete

Le produit voyage dans l'URL. Les boutons de la landing anniversaire pointent
vers `/dashboard/invitations/new?produit=anniversaire`, et le middleware conserve
desormais les parametres dans son `next` — sans ca, la redirection par la page de
connexion les perdait en route.

`/dashboard/invitations/new` sans parametre ne devine pas : il affiche un choix a
deux carreaux, l'arche et le quadrilobe. Avec `?produit=mariage` ou
`?produit=anniversaire`, il ouvre directement le bon parcours.

`birthday-wizard.tsx` est un composant a part : le wizard du mariage n'a pas ete
modifie. Sept etapes au lieu de sept, mais pas les memes — pas d'etape
« ceremonie », et une etape « album » a la troisieme place.

| # | Mariage | Anniversaire |
|---|---|---|
| 01 | Ceremonie | Collection |
| 02 | Collection | Informations |
| 03 | Informations | **Programme** |
| 04 | Photos | **Album** |
| 05 | Musique | Photos |
| 06 | Apercu | Musique |
| 07 | Publication | Apercu |
| 08 | — | Publication |

Les etapes Photos, Musique, Apercu et Publication sont partagees. `MusicStep`
accepte maintenant une bibliotheque explicite : la fete recoit un tableau vide,
parce qu'il vaut mieux ne rien proposer que de proposer des cantiques de mariage
pour un anniversaire d'enfant. Seul l'envoi d'un morceau personnel reste offert.

### Ce que la separation des produits implique

`listInvitations(userId, product?)` et `getPublishedInvitation(slug, product?)`
filtrent en JavaScript apres lecture, jamais avec un `.eq("product", …)` : ainsi
le code continue de fonctionner sur une base ou la migration 003 n'a pas encore
ete jouee. Une ligne sans `product` est un mariage.

Le slug reste unique tous produits confondus, mais la route est verifiee :
`/mariage/adrian-7-ans` repond 404, `/anniversaire/aicha-et-yassine` aussi. Le
slug d'anniversaire se construit a partir du prenom et de l'age —
`buildBirthdaySlug("Adrian", 7)` donne `adrian-7-ans`.

`publicPathFor()` remplace les quatre endroits qui ecrivaient `/mariage/` en
dur : l'etape de publication, la carte du tableau de bord et la fiche
d'invitation affichent maintenant la bonne adresse.

Le tableau de bord regroupe par produit, la liste gagne un filtre qui se combine
avec celui des statuts, et la carte porte un badge, la forme du produit et l'age
en monogramme.

### Les huit collections de la fete

Quatre pour les garcons, quatre pour les filles. Le parcours demande « pour
qui ? » juste apres le choix mariage / anniversaire, puis ne montre que les
quatre concernees.

| Garcons | Age | Filles | Age |
|---|---|---|---|
| Royaume | 3 – 10 | Cristal | 3 – 10 |
| Comics | 4 – 10 | Papillons | 2 – 10 |
| Petit Patron | 1 – 4 | Licorne | 1 – 8 |
| Cosmos | 5 – 10 | Lagon | 1 – 10 |

Le public voyage dans l'URL : `?produit=anniversaire&pour=fille`. En modification,
il est deduit de la collection deja choisie (`audienceOf`).

L'age est borne de 1 a 10 ans, dans le schema comme dans le champ. Les parcours
adolescent et adulte auront leurs propres bornes.

Aucun personnage sous licence, cote filles comme cote garcons : flocon, papillon,
licorne, hibiscus, vague, coquillage — tout est dessine au trait dans
`motifs-fete.tsx`.

### Ce qui distingue la fete du mariage, visuellement

- **Les boutons.** `Button` et `ButtonLink` acceptent `voice="fete"` : rond, gras,
  en bas de casse, dans la police de la fete. Les boutons de la maison ont ete
  epaissis et agrandis au passage — le libelle se lisait mal sur un telephone.
- **Les titres.** La landing et le parcours de la fete parlent en Baloo/Outfit
  gras, pas en Bodoni fin.
- **L'enveloppe.** Elle prend les couleurs de la collection (verte pour Royaume,
  bleue pour Cristal…), porte les motifs du decor au lieu de l'arabesque, et
  grave l'age sur le cachet plutot que les initiales.
- **Le mot des parents.** Il etait saisi et n'etait affiche nulle part : la
  section `motFete` manquait. Elle vient juste apres le hero.

### Deux corrections transverses

L'apercu du parcours (etape 06) s'affiche desormais dans un cadre de telephone a
largeur fixe, sans l'enveloppe : en pleine largeur sur mobile, on ne voyait plus
rien du rendu vertical.

L'itineraire et le lien Google Maps ont ete retires de la section « Ou et quand »,
pour les deux produits.

Les deux videos de la landing mariage ont ete reencodees a partir des
enregistrements d'origine : 640x1344, 22 s, sans piste audio, en `faststart`, et
environ 1,3 Mo chacune. Elles etaient en 360x756 a 105 kbps, ce qui expliquait la
bouillie. Les affiches passent de 5 Ko a ~21 Ko, et le curseur de souris a ete
efface de celle du hero (filtre `delogo`).

La boucle a ete coupee a 22 secondes : elle couvre l'ouverture de l'enveloppe et
les premieres sections, ce qui suffit largement, et divise le poids par trois.
Rien n'est telecharge tant que le cadre n'est pas visible.

Les maquettes de telephone de la section « Pense pour le pouce » ont ete
retirees, des deux cotes : la section est desormais un vis-a-vis texte / liste.

Le logo de l'entete porte le produit : `ZEVENT | MARIAGE` ou
`ZEVENT | ANNIVERSAIRE`, via la prop `suffix` de `Logo`. La porte d'entree, elle,
n'en porte aucun.

### Diagnostic : une invitation qui « disparait »

Trois causes possibles, dans cet ordre de frequence.

**1. Aucune base connectee.** Sans `NEXT_PUBLIC_SUPABASE_URL` et
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, l'application tourne sur le magasin en memoire.
Sur Vercel, chaque instance a le sien et il repart de zero a froid : une
invitation creee peut etre introuvable quelques minutes plus tard. Le tableau de
bord affiche desormais un bandeau « Mode demonstration » — avant, rien ne le
disait.

**2. Migration 003 non jouee.** L'insertion echouait sur une colonne inexistante
et l'ecran repondait « Reessayez ». L'erreur PostgREST 42703 est maintenant
reconnue et remplacee par un message qui nomme le fichier a executer.

**3. Colonne `product` absente sur une ligne ancienne.** Le lien public tombait
alors sur `/mariage/<slug>`, ou l'invitation n'existe pas — d'ou la page
« invitation introuvable ». `productOfInvitation()` et `publicPathFor()` deduisent
desormais le produit du `celebrant_name` quand la colonne manque.

`/anniversaire/[slug]` a aussi sa propre page introuvable : la page globale
parlait « des maries », ce qui n'a aucun sens sur un anniversaire.

### Une regle : jamais de route ecrite en dur

`publicPathFor()` est le seul endroit qui decide entre `/mariage/` et
`/anniversaire/`. Tout ce qui affiche ou copie un lien public doit passer par
lui : l'etape de publication, la carte du tableau de bord, la fiche d'invitation,
et le menu d'actions.

C'est ce dernier qui avait ete oublie : « Copier le lien » construisait
`${origin}/mariage/${slug}` pour tout le monde, y compris les anniversaires. Le
lien partage tombait donc sur la route du mariage, qui refuse — a juste titre —
d'afficher un anniversaire, et renvoyait un 404. Rien n'expirait : c'est
l'adresse qui etait fausse des le depart.

Chaque produit a desormais sa page d'invitation introuvable :
`app/mariage/[slug]/not-found.tsx` et `app/anniversaire/[slug]/not-found.tsx`.
La premiere parle des maries, la seconde des parents.

### Les en-tetes de mariage

Dix-huit images livrees avec le produit, neuf par confession, dans
`public/entetes/`
et declarees dans `src/lib/covers.ts`. Chacune a une version pleine (largeur
1000, WebP) pour le hero et une vignette carree pour le selecteur.

| Musulman | Chretien |
|---|---|
| Arche d'ivoire | Perles et fleurs blanches |
| Lanternes et voiles | Cygnes a l'aquarelle |
| Mosquee dans les nuages | Couple de porcelaine |
| Coupole a l'aurore | Nef aux petales |
| Lanternes sur l'eau | Lys et nuages |
| Nuit grenat | Cygnes sur marbre |
| Lustre du palais | Nef doree |
| Coupole blanche | Arche de roses |
| Paons sous l'arche | Voiles et bougies |

Le choix se fait a l'etape « Photos », au-dessus des portraits : un bloc
« L'en-tete » qui n'apparait que pour le mariage. Le couple prend une des six ou
envoie la sienne — dans les deux cas la valeur atterrit dans `cover_image_url`,
et `isLibraryCover()` permet de savoir laquelle surligner.

`DEFAULT_COVERS` pointe desormais sur la premiere image de chaque serie :
`arche-ivoire` pour le musulman, `perles-ivoire` pour le chretien. Les deux
anciens fichiers `entete-orientale.png` et `entete-chretienne.png` ne sont plus
references.

### Les quatre tranches de la fete

Le produit anniversaire ne s'arrete plus a dix ans. `BIRTHDAY_BRACKETS`, dans le
registre, est la seule table qui decide : bornes de saisie, libelle, collections
proposees et rayon d'en-tetes.

| Tranche | Age | Collections | En-tetes |
|---|---|---|---|
| Enfant | 1 – 10 | 8, filles et garcons | non |
| Jeune adolescent | 11 – 14 | Arene, Voltage, Nuit bleue | 6 |
| Adolescent | 15 – 17 | Bitume, Neon, Braise | 6 |
| Adulte | 18 et plus | Smoking, Ambre, Emeraude | 6 |

Le parcours demande l'age d'abord (`?tranche=`), puis le public seulement pour
les enfants (`&pour=`) — les trois autres tranches n'ont qu'un jeu de
collections. La saisie refuse un age hors de la tranche choisie plutot que de
proposer les mauvaises collections.

Les palettes des neuf nouvelles collections sont tirees des images d'en-tete de
leur tranche : bleu de terrain et neon pour Arene, beton et bombe rouge pour
Bitume, noir et cravate rouge pour Smoking.

### Les images d'en-tete de la fete

Six par tranche, meme mecanique que le mariage — `CoverScope` remplace
`WeddingType` dans `covers.ts`, et le rayon vient de la tranche.

Onze des dix-huit images viennent des fichiers fournis. Les sept autres sont
dessinees ici, en code (`terrain-neon`, `eclair-trame`, `bitume-bombes`,
`grille-neon`, `carbone-ligne`, `marbre-nuit`, `velours-emeraude`) : elles
remplacent les visuels ou apparaissaient des marques ou des personnages sous
licence — Spider-Man, Jordan, Spalding, la Ligue des champions. Un produit
vendu ne peut pas les embarquer.

### L'album, sur la plage qu'on veut

L'etape album ne prepare plus systematiquement toutes les annees : on choisit
« de X ans a Y ans ». Par defaut, les dix dernieres — a trente ans, personne ne
cherche une photo de sa deuxieme annee.

Et une annee sans photo n'a plus de carte : `normalizeAlbum()` ne garde que les
entrees qui portent une image, et la section disparait entierement s'il n'y en a
aucune.

### L'image d'en-tete, derriere le premier ecran

Le hero des tranches 11 – 14, 15 – 17 et 18+ pose l'image choisie en plein
cadre, et le carton par-dessus. Le reste de l'invitation garde les aplats de la
collection : l'image ne sert qu'a la premiere page, celle qui porte le prenom et
l'age.

Le voile entre les deux est calcule, pas fixe : `luminance()` mesure le fond de
la collection et dose l'opacite en consequence, parce que Ballons du ciel est
presque blanc et Costume noir presque noir. Le carton passe a 94 % d'opacite
avec un flou d'arriere-plan, pour qu'on devine l'image sans jamais perdre le
texte. Les motifs semes disparaissent quand il y a une photo : sur une image, ils
ne feraient que du bruit.

Sans choix explicite, la premiere image de la tranche sert de defaut — un hero ne
retombe jamais sur un degrade nu. Les collections enfants, elles, n'ont pas de
bibliotheque : leur hero garde son degrade et ses motifs, inchange.

### Vingt-six collections, quatre tranches, deux publics

Chaque tranche a maintenant ses deux jeux de collections et ses deux rayons
d'en-tetes. Le parcours demande l'age, puis le public, toujours dans cet ordre.

| Tranche | Garcon / homme | Fille / femme |
|---|---|---|
| 1 – 10 | Royaume, Comics, Petit Patron, Cosmos | Cristal, Papillons, Licorne, Lagon |
| 11 – 14 | Arene, Voltage, Nuit bleue | Perle, Gemme, Nuage |
| 15 – 17 | Bitume, Neon, Braise | Velours rose, Petales, Chateau |
| 18+ | Smoking, Ambre, Emeraude | Rubis, Magenta, Lune |

`audienceOf2(tranche, genre)` fait la correspondance : les enfants gardent leurs
noms historiques (`garcon`, `fille`), les autres suffixent le feminin
(`ado-fille`, `adulte-femme`). Le rayon d'en-tetes vient du public, plus de la
tranche.

Sur les dix-huit images filles fournies, dix-sept sont passees telles quelles.
Le tableau Barbie est remplace par un fond dessine (`marbre-poudre`) : Barbie
appartient a Mattel, et la planche portait aussi un Pantone et un YSL.

### Ce qui a ete repare dans cette passe

- **Le bouton « Commencer » etait invisible** : le fond du bouton reprenait la
  couleur du texte de la carte, ivoire sur ivoire. Chaque carte porte desormais
  une couleur de bouton distincte de sa couleur de texte.
- **La fiche d'invitation debordait a droite sur mobile.** L'apercu, place dans
  la meme grille que la colonne d'actions, elargissait toute la page : les deux
  colonnes recoivent `min-w-0` et l'apercu `overflow-x-hidden`. Verifie a 390 px :
  plus un seul element hors cadre.
- **Les boutons de la fete debordaient** : leurs tailles montent maintenant avec
  l'ecran, et `max-w-full min-w-0` empeche tout depassement.
- **La fiche d'un anniversaire affichait « Ceremonie : Mariage chretien ».**
  Elle affiche « Celebration : Anniversaire · N ans ».
- **Copier le lien, Ouvrir, WhatsApp, Dupliquer, Supprimer** sont des boutons,
  cote mariage comme cote fete. Le choix de la musique et l'envoi d'une image
  aussi.
- **Les cartons de tranche** portent la plage complete (« 1 – 10 ans ») au lieu
  d'un age au hasard.

### Passe de corrections — les cartes et la saisie

**Les actions des invitations.** La rangee de liens en clair sous chaque carte
(Modifier, Depublier, Copier le lien, Dupliquer, Supprimer) a ete supprimee. Il
ne reste que le bouton a trois points : trois points blancs sur bordeaux, la
teinte des boutons de la maison. Un seul
composant, `ui/menu.tsx` : le changement vaut pour toutes les invitations,
existantes comme futures, mariage comme anniversaire.

**La plage de l'album.** Les deux champs etaient bornes a chaque frappe : effacer
le « 1 » le remettait aussitot, donc impossible de taper « 9 ». Ils gardent
maintenant leur valeur brute pendant la saisie et ne sont bornes qu'a la sortie
du champ. Verifie : on peut saisir « de 3 a 6 ans ».

**La phrase d'accueil.** Elle etait rendue comme un intitule — 0,6 rem, capitales,
tres espacees — ou personne ne la lisait. L'intitule redevient un simple libelle
fixe (« Vous etes invite ») et la phrase ecrite par l'utilisateur s'affiche en bas
de casse, a taille lisible, sous le fleuron.

**La galerie de la fete.** `galleryFete` remplace `gallery` dans le deroule de
l'anniversaire : les photos ne sont plus recadrees en arches et en carres, elles
gardent leurs proportions dans des colonnes en maconnerie, coins arrondis et
filet fin. Le mariage garde sa mosaique.

### Le programme de la journee

`BIRTHDAY_SECTIONS` annoncait `program` depuis le debut, mais aucune etape ne
savait le remplir : la colonne `program` existait dans le schema, la section
`ProgramSection` etait enregistree, et rien entre les deux. Le declaratif
promettait ce que le parcours ne produisait pas — seules les invitations de
demonstration, ecrites a la main, avaient un programme.

L'etape « Programme » est la troisieme du parcours anniversaire. Une ligne =
une heure, un intitule, une note facultative. On part d'un derole type (accueil,
gateau, depart) ou d'une ligne vide, on ajoute, on retire.

`saveProgramAction` valide chaque ligne avec `programSchema` avant d'ecrire le
jsonb, et **trie par heure** : l'ordre d'affichage ne depend jamais de l'ordre de
saisie. Sans ligne, la section disparait de l'invitation.

Le mariage n'a pas cette etape — ses deux deroules n'appellent pas `program`. La
mecanique est la, si on veut la lui donner un jour.

### Pourquoi les textes se chevauchaient dans l'apercu

Toutes les tailles des collections sont ecrites en `clamp(min, Nvw, max)`. Or
`vw` se mesure sur la **fenetre**, jamais sur le bloc qui contient le texte.
Dans un cadre de 352 px pose sur un ecran de 1280, le prenom etait calcule pour
1280 : « cheick » passait a la ligne et le « 18 » debordait du carton.

Les 59 unites `vw` des collections sont devenues des `cqw`, et l'apercu pose un
`container-type: inline-size` (classe `.zv-canvas`) autour de l'invitation. Les
tailles se mesurent desormais sur le cadre.

Le conteneur n'est pose **que dans l'apercu**. Sur la page publique il n'y en a
aucun, et une unite `cqw` sans conteneur retombe sur la fenetre : le rendu public
est rigoureusement celui d'avant. C'est aussi ce qui protege l'enveloppe, dont
le `position: fixed` serait sinon rattache au conteneur au lieu de l'ecran.

### L'apercu montre tout

L'enveloppe et la musique etaient desactivees dans l'apercu — je les avais
coupees en pensant qu'on voulait aller droit au contenu. C'etait une erreur :
l'apercu doit montrer ce que verra l'invite, ouverture comprise.

`EnvelopeGate` recoit une prop `contained` : dans le cadre, l'enveloppe passe en
`absolute` au lieu de `fixed` et ne bloque plus le defilement de la page qui
l'entoure. Verifie : apres ouverture dans l'apercu, `document.body.style.overflow`
reste libre.

### Diagnostiquer un echec d'authentification en production

`/api/sante` repond en JSON : quel environnement, quel domaine le serveur croit
servir, quelles variables sont presentes, si `isSupabaseConfigured` est vrai, si
l'API d'authentification Supabase repond, et quelle URL de retour l'application
enverra. Aucune cle n'est exposee — seulement des presences et des longueurs.

C'est la premiere chose a ouvrir quand la connexion echoue quelque part et pas
ailleurs. `supabase_configure: false` en production signifie que l'application
tourne sur son magasin de demonstration : aucun compte reel ne peut exister.

Les deux actions d'authentification ecrivent desormais le motif reel dans les
journaux (`console.error`) avant de renvoyer leur message lisible, et refusent
explicitement de basculer en mode demonstration quand `VERCEL_ENV` vaut
`production`.

**Les trois causes, par ordre de frequence :**

1. Les variables `NEXT_PUBLIC_*` ne sont pas cochees pour l'environnement
   Production dans Vercel — elles ne le sont que pour Preview.
2. Elles ont ete ajoutees apres le dernier build de production. Une variable
   `NEXT_PUBLIC_` est figee dans le bundle au moment du build : il faut
   redeployer, pas seulement l'enregistrer.
3. L'URL de production ne figure pas dans Supabase → Authentication → URL
   Configuration → Redirect URLs. Cela casse l'inscription (lien de
   confirmation) sans toucher la connexion par mot de passe.

### Les deux signatures

L'arche (`.arch`) est la marque du mariage. Le **quadrilobe** (`.quatrefoil`)
est celle de la fête. Ses côtés sont concaves, donc impossible en
`border-radius` : c'est un masque SVG en `mask-image`, dimensionné en
`100% 100%`, donc réutilisable sur n'importe quelle boîte — photos, aperçus de
collections, vignettes du tableau de bord.

Attention : un masque rogne tout ce que l'élément peint, y compris sa bordure
et son contour de focus. Le masque va donc sur un enfant, jamais sur le lien.

### L'écriture de la fête

| | Mariage | Anniversaire |
|---|---|---|
| Forme | Arche | Quadrilobe |
| Titres | Bodoni Moda | Italiana |
| Accent | Or `#b89b6a` | Flamme `#e9a13b` |
| Fond profond | Bordeaux `#5a2932` | Nuit prune `#2a1a2e` |

Le papier, le grain, l'encre et les filets ne changent pas : c'est ce qui fait
que les deux produits restent un seul site.

---

## L'entrée

Les quatre pages de `(auth)` — connexion, inscription, mot de passe
oublié, nouveau mot de passe — partagent un seul layout.

L'écran coupé en deux, page imprimée à gauche et formulaire à droite, a
été remplacé : le fond est un aplat bordeaux plein, et la carte de
papier y est posée, seule, au centre. Le mot ZEVENT est gravé derrière
en Bodoni, à 7 % d'opacité, et la carte vient le couper. Trois chiffres
en dessous — 26 collections, 1 lien à partager, 0 appli à installer —
disent en six mots ce qu'un paragraphe disait mal.

La composition vient d'une affiche : champ saturé, typographie
monumentale, carte flottante, rangée de chiffres. Rien d'autre n'en a
été repris. Le bordeaux, le papier, le filet or et la Bodoni sont ceux
des deux landings, sans quoi l'entrée aurait ressemblé à un autre site.

L'en-tête de carte est centré, les champs restent alignés à gauche : on
ne centre jamais un formulaire qu'on doit remplir.

---

## Architecture

```
src/
  app/
    page.tsx                     landing
    (auth)/                      login · register · forgot · reset
    auth/callback/               échange du code Supabase
    dashboard/                   espace privé (layout protégé)
      invitations/[id]/edit      parcours de création en 7 étapes
    mariage/[slug]/              page publique de l'invitation
    api/og/                      image de partage WhatsApp / réseaux
  components/
    ui/                          design system (button, field, plate, modal…)
    motion/                      reveal, stagger, transitions
    landing/  dashboard/  auth/  invitation/
  lib/
    config.ts                    bascule démo ↔ Supabase
    services/                    session · invitations · profils · historique · storage
    validation/schemas.ts        Zod
    supabase/                    clients navigateur, serveur, middleware
    demo/store.ts                magasin en mémoire
  templates/
    types.ts                     TemplateDefinition
    registry.ts                  le catalogue
    definitions/                 un fichier par collection
    components/                  moteur de rendu + sections
supabase/
  schema.sql  seed.sql
middleware.ts                    protection des routes privées
```

### Le système de templates

Un template est une **définition déclarative**, jamais du code de mise en page :

```ts
TemplateDefinition {
  id, name, tagline, category
  supportedWeddingTypes    // chretien · musulman
  preview                  // dégradé d'aperçu, remplaçable par une image
  colors                   // 9 couleurs injectées en variables CSS
  typography               // display, échelle du hero, séparateur des prénoms
  sections                 // l'ordre du tableau = l'ordre de rendu
  animations               // rideau, durée, décalage, parallaxe
}
```

Ajouter une collection tient en deux gestes :

1. créer `src/templates/definitions/ma-collection.ts` ;
2. l'ajouter au tableau de `src/templates/registry.ts`.

La landing, le sélecteur du parcours de création et la page publique se mettent à
jour seuls. Aucun composant de l'application ne connaît un template en
particulier.

Ajouter une **section** (par exemple un plan d'accès) : ajoutez son identifiant à
`SectionId`, écrivez le composant, référencez-le dans la table `SECTIONS` du
moteur de rendu, puis déclarez-la dans les templates concernés.

---

## Sécurité des données

- Chaque table est protégée par Row Level Security. Un utilisateur ne lit et
  n'écrit que ses propres lignes.
- Les invitations **publiées** sont lisibles publiquement, en lecture seule.
- Les fichiers Storage sont écrits dans un dossier au nom de l'utilisateur ; la
  politique vérifie ce préfixe à chaque envoi.
- La suppression de compte passe par la fonction `delete_own_account()`
  (`security definer`), qui supprime l'utilisateur et déclenche la cascade.
- Les routes privées sont filtrées par `middleware.ts` avant tout rendu.

---

## Sécurité — la passe de durcissement

Cinq défauts reviennent dans presque tous les projets. Voici où en est
celui-ci, point par point.

**1. Variables d'environnement et clés exposées.** Les clés SasPay et
Chariow vivent en base, pas dans l'environnement, et
`/admin/paiements` ne transmet au navigateur que deux booléens disant
si elles existent. `SUPABASE_SERVICE_ROLE_KEY` n'a pas de préfixe
`NEXT_PUBLIC_` et le fichier qui la lit porte `server-only` : le build
échoue si un composant client l'importe.

Un défaut corrigé ici : `/api/sante` était ouverte à tout le monde.
Elle ne renvoie aucune clé, mais elle dit quel projet Supabase est
branché et quelles variables sont là — une carte du terrain. Elle
exige maintenant une session administrateur ou `DIAGNOSTIC_TOKEN`, et
répond 404 sinon, pas 403 : une adresse qui dit « interdit » confirme
qu'elle existe.

**2. RLS.** Chaque table l'a, et le client de service n'est branché
que sur trois chemins précis (voir « La chaîne de paiement »). Partout
ailleurs, un utilisateur ne lit que ses lignes. Les fonctions qui
utilisent le client de service gardent leur filtre sur `user_id` : le
cloisonnement ne repose jamais sur une seule couche.

**3. Validation côté serveur.** Les schémas Zod de
`lib/validation/schemas.ts` sont appliqués dans les actions serveur,
pas dans les formulaires. `savePlanAction` borne le montant,
`saveProgramAction` valide et retrie chaque ligne, `updateSlugAction`
normalise le slug. Un appel direct à une action, sans passer par
l'écran, rencontre les mêmes contrôles.

**4. Paquets.** Douze dépendances de production, toutes réelles et
maintenues. Aucune dépendance transitive exotique : `npm audit` avant
chaque déploiement suffit à tenir la ligne.

**5. Authentification des routes.** `middleware.ts` couvre désormais
`/dashboard` **et** `/admin`. La garde d'administration existait déjà
dans le layout via `requireAdmin()` ; elle est maintenant doublée
avant tout rendu. Une garde unique est une garde qu'un refactor peut
retirer sans que rien n'échoue visiblement.

### Les en-têtes

`next.config.ts` pose une politique de sécurité du contenu sur toutes
les réponses. La directive qui compte est `connect-src` : même un
script injecté ne peut parler qu'à nous et à Supabase, donc il ne peut
rien renvoyer ailleurs. `frame-ancestors 'none'` interdit d'encadrer
le site dans un iframe, ce qui rend le détournement de clic
impossible. S'y ajoutent HSTS un an, `nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin` — le lien d'une
invitation ne doit pas fuiter vers les sites visités ensuite —, une
`Permissions-Policy` qui coupe caméra, micro et géolocalisation, et
`poweredByHeader: false`.

`unsafe-inline` reste nécessaire sur les scripts : le routeur
applicatif de Next écrit les données d'hydratation en clair dans des
balises `<script>`. Le retirer demanderait un nonce posé par le
middleware sur chaque réponse, ce qui supprimerait le cache statique
des pages d'invitation — l'essentiel du trafic. `unsafe-eval` n'est
présent qu'en développement.

Le tableau de bord et l'administration répondent en
`Cache-Control: private, no-store` et `X-Robots-Tag: noindex`.

### Ce qui reste à faire

- **Limitation de débit sur la connexion.** Supabase en applique une,
  mais elle n'est pas la nôtre et elle ne compte pas par adresse IP
  sur nos propres actions.
- **Journal d'audit des actions d'administration.** Qui a bloqué qui,
  et quand. La table `history` existe pour les invitations, pas pour
  `/admin`.
- **Rotation des clés.** Rien ne rappelle qu'une clé traîne depuis six
  mois.

---

## Direction artistique

**La signature : l'arche.** Toute image, tout aperçu, tout portrait est cadré par
une voûte — chapelle, mosquée, portail de cour. Elle traverse le produit du hero
de la landing jusqu'au monogramme du rail latéral.

- **Couleurs** — ivoire `#FAF7F2`, papier `#FFFDFC`, encre `#241F1D`,
  champagne `#D8C3A5`, bordeaux `#5A2932`, or `#B89B6A`. L'or n'est jamais un
  aplat : uniquement des filets.
- **Typographie** — Bodoni Moda pour les titres (la didone des couvertures de
  mode), Jost pour l'interface. Cormorant Garamond est réservé aux esperluettes
  et aux citations manuscrites.
- **Structure** — des filets, pas des ombres. Rayons de 1 à 4 px, jamais de
  pilule. Les cartes sont des blocs séparés par des traits, comme une mise en
  page de magazine.
- **Mouvement** — une seule courbe (`cubic-bezier(.16,1,.3,1)`), des fondus
  lents, un flou qui se dissipe. `prefers-reduced-motion` neutralise tout.

---

## Scripts

```bash
npm run dev         développement
npm run build       build de production
npm run start       serveur de production
npm run typecheck   tsc --noEmit
npm run lint
```

---

## Le mariage musulman

Le parcours complet est en place :

1. **L’enveloppe** — cachet de cire aux initiales, « Appuyez pour ouvrir ».
   Ce geste ouvre l’invitation **et** lance la musique : aucun navigateur
   mobile n’autorise le son sans une action de l’invité.
2. **Les prénoms et portraits** — deux arches côte à côte, décalées,
   avec le nom de chaque famille.
3. **Le message des familles** — composé automatiquement à partir des
   deux noms, dans un cartouche gravé, réécrivable par le couple.
4. **L’histoire** — facultative.
5. **Les cérémonies** — religieux et walima obligatoires, civil derrière
   une case qui déplie ses champs. L’affichage les **classe par heure** :
   le civil tombe avant ou après le religieux selon ce qui est saisi.
6. **Le compte à rebours** — vise la première cérémonie. Les dates
   passées sont refusées à la saisie.
7. **La musique** — choisie dans la bibliothèque, jamais téléversée.
   Bouton pause rond, toujours visible.

### Les cinq écritures

| Collection | Style | Calligraphie · Romaine · Linéale |
|---|---|---|
| Rose de Damas | Romantique | Great Vibes · Cormorant · Cormorant |
| Méridien | Moderne | Pinyon · Italiana · Outfit |
| Nacre | Minimaliste | Pinyon · Cormorant · Jost |
| Zellige | Oriental | Great Vibes · Amiri · Marcellus |
| Nuit de Henné | Traditionnel | Great Vibes · Cinzel · Cormorant |

**La règle typographique**, valable partout : calligraphie pour les
prénoms et les titres de section, romaine pour les chiffres et les
intitulés courts, linéale pour le texte long. Un texte de trois lignes
en capitales gravées est illisible ; c’est cette règle qui l’évite.

### Les ornements

Aucun filet nu. `templates/components/ornaments.tsx` fournit le fleuron
de séparation, la rosace de chronologie, le losange, l’angle gravé et le
cartouche. Tout est dessiné en SVG : rien à charger, et la couleur suit
l’accent de la collection.

### La bibliothèque musicale

`src/lib/music/library.ts`. Pour ajouter un morceau : déposez le fichier
dans `public/music/` et ajoutez une entrée. Aucun autre fichier à toucher.

---

## Migrations Supabase

À exécuter dans l’ordre, dans le SQL Editor :

1. `supabase/schema.sql`
2. `supabase/migration-002-musulman.sql` — familles, portraits,
   cérémonies et bucket des portraits.

**Sans la seconde, les invitations musulmanes échouent à l’enregistrement.**

---

## Prochaines extensions

Le socle est prêt pour :

- **Le programme de la journée** — la colonne `program` (jsonb) existe, la section
  publique la rend déjà ; il reste à écrire l'éditeur dans le parcours de création.
- **Les vraies collections** — remplacez le champ `preview` par une image et
  affinez `colors` / `typography` de chaque définition.
- **La galerie de musiques** — le service `uploadAudio` et le bucket sont en place.

## Administration et paiements

Une administration vit sous `/admin`, réservée aux comptes dont le profil porte
`role = 'admin'`. Quatre onglets : vue d'ensemble, utilisateurs, paiements, tarifs.

### Mise en place

1. Jouer `supabase/migration-004-admin-paiements.sql` dans le SQL Editor.
2. Se nommer administrateur, une fois, en SQL — la requête est en commentaire à la
   fin du fichier. Les politiques exigent qu'un administrateur existe déjà : personne
   ne peut donc s'auto-promouvoir depuis l'application.

En mode démonstration, le compte `demo@zevent.fun` est administrateur d'office,
sans quoi `/admin` serait inatteignable tant que Supabase n'est pas configuré.

### Les deux moyens de paiement

| Fournisseur | Ce qu'il encaisse | Documentation |
| --- | --- | --- |
| **SasPay** | Mobile money et carte, Afrique de l'Ouest et du Centre | <https://docs.saspay.me/api-reference/introduction> |
| **Chariow** | Produits numériques | <https://chariow.dev/en/introduction/overview> |

Ils s'activent indépendamment depuis `/admin/paiements` : on peut n'en garder qu'un,
couper les deux, ou basculer de l'un à l'autre sans redéploiement. Les clés vivent en
base, pas dans l'environnement, et ne sont jamais réaffichées une fois enregistrées —
un champ secret laissé vide conserve la valeur en place.

Chariow ne facture pas un montant libre : il vend un produit de votre boutique.
L'identifiant du produit se saisit donc dans l'administration, et le tarif doit exister
des deux côtés.

### Les webhooks

Deux routes, deux schémas de signature — ils ne se ressemblent pas et on ne peut pas
partager le code de vérification :

| | SasPay | Chariow |
| --- | --- | --- |
| Route | `/api/paiements/saspay/webhook` | `/api/paiements/chariow/pulse` |
| En-tête | `X-Webhook-Signature` | `x-chariow-signature` |
| Données signées | `timestamp.corps` | le corps seul |
| Horodatage | oui, 5 min de tolérance | aucun, volontairement |
| Anti-rejeu | la fenêtre d'horodatage | `x-pulse-delivery-id` |

Dans les deux cas la signature est calculée sur le **corps brut**. Une re-sérialisation
de l'objet parsé change l'ordre des clés ou le format des nombres, et la comparaison
échoue. La comparaison est à temps constant : un `===` s'arrête au premier caractère
différent, ce qui laisse fuiter la signature attendue par mesure du temps de réponse.

Chariow n'a pas d'horodatage par choix : sa dernière tentative peut arriver près de
trois heures après la première, et une fenêtre de temps la rejetterait à tort.

### Les sanctions

Trois niveaux, du plus léger au plus lourd :

- **Retirer les invitations du public** — les liens cessent de répondre, le compte et
  les contenus sont conservés, l'auteur peut republier.
- **Bloquer le compte** — l'accès à l'espace privé est coupé (`requireUser` traite un
  compte bloqué comme un compte absent), les données restent, c'est réversible.
- **Retirer le rôle d'administrateur** — impossible sur soi-même : s'il n'y a qu'un
  administrateur, plus personne ne pourrait rouvrir la porte depuis l'application.

### La chaîne de paiement

Trois accès ne peuvent pas passer par la session du visiteur, et tant
qu'ils y passaient, aucun paiement n'était possible.

**La caisse était invisible.** `payment_settings` porte une politique
`administrateurs seulement` — c'est ce qu'on veut, la table contient
les clés API. Mais `fournisseursDisponiblesAction()` la lisait avec la
session du client. Un couple qui publie n'est pas administrateur : la
requête revenait vide, `etatPaiementAction` concluait « rien à payer »,
et l'étape 07 affichait « Publier mon invitation ». Le clic partait
dans `publishInvitation()`, qui applique la règle inverse et refuse
sans `paid_at`. Deux règles opposées sur la même invitation : le client
lisait « Action impossible » sans jamais voir la caisse.

**Le webhook ne pouvait pas fonctionner.** Une notification n'a aucun
cookie. `auth.uid()` y vaut `null`, donc `est_admin(auth.uid())` vaut
faux, donc `getSettings("saspay")` renvoyait `null` et la route
répondait 404 à chaque appel. Même un paiement réussi n'aurait jamais
publié l'invitation.

**La ligne de paiement n'était jamais écrite.** `payments` n'est
inscriptible que par un administrateur : `recordPayment` échouait en
silence, et le webhook n'aurait de toute façon eu aucune référence à
rattacher.

`src/lib/supabase/admin.ts` fournit un client de service qui ignore
RLS. Il est branché sur ces trois chemins uniquement — les réglages
fournisseurs, la table `payments`, et les écritures du webhook. Tout le
reste continue de passer par la session : RLS garde son rôle partout
ailleurs, et `getInvitation` conserve son filtre sur `user_id`, qui est
ce qui fait réellement le cloisonnement.

`etatPaiementAction` a été réaligné sur `publishInvitation` : dès qu'un
tarif existe et que l'invitation n'est pas payée, on passe par la
caisse. La liste des fournisseurs ne décide plus que des boutons
affichés — quand elle est vide, le bloc le dit au lieu de disparaître.

Les adresses à inscrire chez les prestataires, sur le domaine de
production et jamais sur une URL Vercel :

```
https://zevent.fun/api/paiements/saspay/webhook
https://zevent.fun/api/paiements/chariow/pulse
```

`/api/sante` porte un bloc `paiement` qui dit si la clé de service est
là, quel domaine le serveur croit servir, et s'il concorde avec celui
qui est déclaré. C'est la première chose à ouvrir quand un paiement ne
s'ouvre pas.

### La caisse a sa propre adresse

Elle ne vivait qu'à l'étape 07 du parcours de création. Résultat :
« Publier » depuis la liste ou depuis la fiche appelait
`publishInvitation`, qui refuse une invitation impayée — et l'écran
répondait « Action impossible » sans jamais proposer de payer. Il
fallait deviner qu'il fallait rouvrir la modification et aller
jusqu'au bout des sept étapes.

`/dashboard/invitations/[id]/paiement` rend désormais le même
`PaiementBloc`, hors du wizard. Les trois boutons y mènent, et le
libellé le dit : une invitation impayée affiche « Payer et publier »,
pas « Publier ».

`publishInvitationAction` renvoie en plus un `code` :
`paiement_requis` ou `lien_pris`. Un message d'erreur ne dit pas s'il
faut réessayer, corriger le lien ou passer à la caisse — l'écran ne
pouvait donc que montrer un échec là où il fallait ouvrir une porte.

### Test ou production : la clé décide, pas le menu

SasPay n'a qu'une seule URL, `https://api.saspay.me/api/v1`. Ce qui
distingue le test de la production, c'est le préfixe de la clé :
`sk_test_` ou `sk_live_`.

La colonne `environment` était donc décorative — elle s'enregistrait,
s'affichait, et n'était lue nulle part. Une clé `sk_live_` posée dans
un réglage marqué « Test » encaissait pour de vrai, et rien ne le
disait avant le relevé.

`coherenceCle()` refuse maintenant la combinaison à deux endroits :
à l'enregistrement dans l'administration, et avant chaque appel à
l'API. Les deux, parce qu'un réglage peut avoir été écrit en base
avant que ce contrôle existe.

### Le retour du client, et pourquoi le webhook ne suffisait pas

Le webhook `transaction.success` porte l'identifiant de la
**transaction**. Nous stockions celui de la **session de checkout**.
Ce sont deux UUID différents : `invitationDuPaiement()` cherchait une
ligne qui n'existait pas, et l'invitation restait impayée alors que
l'argent était parti.

Au retour du client sur `?paiement=retour`, la page interroge donc
SasPay avec notre clé : `GET /checkout-sessions/{id}/` renvoie
`paid_at`. C'est le fournisseur qui tranche, jamais le navigateur —
une URL recopiée à la main ne publie rien.

Le webhook reste branché : il rattrape le client qui ferme l'onglet
avant d'être redirigé. Les deux chemins sont idempotents, et
`encaisserEtPublier` ne publie qu'une fois.

Dernier point sur la réponse de `/checkout-sessions/` : la
documentation annonce une enveloppe `{success, data}`, les exemples
renvoient l'objet à plat. Le code testait `corps.success`, donc une
réponse 201 parfaitement valide levait « SasPay a répondu 201 ». Les
deux formes sont acceptées.

### Les montants

Un tarif est un entier dans l'unité de la devise : `15000` XOF, pas `150.00`. Le franc
CFA n'a pas de centimes, et un flottant traînerait ses arrondis jusqu'en base.
