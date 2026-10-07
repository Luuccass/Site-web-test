# Restaurant Comme Avant — site web

Site vitrine du Restaurant Comme Avant, 3 place de l'Église, 69570 Dardilly.
Site statique (Next.js 16, export HTML), hébergé gratuitement sur Netlify, sans base de données ni
cookies. Tout le contenu modifiable est dans le dossier `content/`.

- Mise en ligne et nom de domaine : voir [`docs/DEPLOY.md`](docs/DEPLOY.md).
- Suivi du projet et décisions : [`docs/HANDOFF.md`](docs/HANDOFF.md).

## Modifier le contenu (sans rien installer)

Chaque modification enregistrée sur GitHub republie le site automatiquement en 2 à 4 minutes.
Si une modification contient une erreur, Netlify refuse de la publier et **l'ancienne version reste
en ligne** : rien ne casse, il suffit de corriger.

1. Ouvrez le dépôt sur GitHub, branche `claude/install-frontend-design-remotion-vvrxf5`.
2. Ouvrez le fichier à modifier (par exemple `content/menu.json`), cliquez sur le crayon
   (*Edit this file*).
3. Modifiez le texte **entre guillemets** ou les nombres, sans toucher aux noms à gauche des `:`.
4. Cliquez **Commit changes…**, écrivez une phrase (« Carte de novembre »), validez.
5. Vérifiez le site quelques minutes plus tard. En cas d'échec, l'onglet *Deploys* de Netlify
   indique la ligne fautive.

Pièges fréquents dans les fichiers `.json` : une virgule entre deux éléments mais pas après le
dernier, des guillemets droits `"` autour des textes, pas de guillemet `"` à l'intérieur d'un texte
(utilisez les guillemets français « »). Les prix s'écrivent sans symbole : `11` ou `7.5`.

### La carte — `content/menu.json`

- `updatedAt` : date de mise à jour de la carte (`"2026-11-02"`), affichée sur la page et le PDF.
- `formules` : libellés et prix des formules du midi.
- `sections` → `items` : chaque plat a un `id` (court, sans espace ni accent, unique), un `name` et
  un `price`. Un plat sans prix fixe (la broche) a `"price": null`.
- Allergènes : la liste `allergens` d'un plat n'est affichée que lorsque `allergensValidatedAt`
  contient la date de validation par la cuisine (`"2026-11-02"`). Tant que ce n'est pas le cas, le
  site affiche la phrase réglementaire « liste des allergènes sur demande ». Les 14 codes possibles
  sont dans `src/components/carte/allergens.tsx`. Brouillon à faire valider :
  `docs/content/allergens-draft.md`.
- `alcohol: true` sur un plat contenant de l'alcool affiche l'avertissement légal (loi Évin).

### Les vins — `content/wines.json`

`byGlass` (vins au verre, prix par contenance), `sparklingByGlass`, puis `bottles` : chaque
bouteille a une couleur `colour` (`rouge`, `blanc`, `rose` ou `bulles`), une région, un nom et un
prix ; `format` (facultatif) indique un magnum. Les vins de la
« cave » de l'accueil sont choisis dans `src/components/home/CaveWall.tsx` : si l'un d'eux disparaît
de la liste, il disparaît simplement de l'accueil.

### L'ardoise du mois — `content/ardoise.json`

À mettre à jour une fois par mois :

```json
{
  "month": "2026-11",
  "items": [
    { "name": "Velouté de potimarron, châtaignes", "price": 9 },
    { "name": "Broche du jour selon arrivage" }
  ]
}
```

`month` est le mois concerné (année-mois). Le mois passé, le site revient tout seul à la phrase
générale « Suggestions et broche du jour selon arrivage, sur l'ardoise au restaurant. » : une ardoise
oubliée n'affiche jamais de plats périmés.

### Horaires, congés, fermetures — `content/hours.json`

- `services` : un bloc par service ouvert. `day` va de 1 (lundi) à 7 (dimanche) ; `service` vaut
  `midi` ou `soir` ; heures au format `"11:30"`.
- `closures` : congés et fermetures exceptionnelles. Exemples :

  ```json
  "closures": [
    { "from": "2026-12-24", "to": "2027-01-04", "kind": "conges" },
    { "from": "2026-11-14", "to": "2026-11-14", "kind": "privatisation", "services": ["soir"] },
    { "from": "2026-11-20", "to": "2026-11-20", "kind": "fermeture" }
  ]
  ```

  Pendant des congés, l'accueil affiche « En congés jusqu'au … » et la date de retour.
- `publicHolidays` : `"call"` (jours fériés : « appelez-nous ») ou `"closed"` (fermé les jours fériés).
- `verifiedThrough` : **date jusqu'à laquelle les horaires sont garantis** (`"2026-12-31"`).
  Après cette date, le site n'annonce plus « ouvert / fermé » mais « Horaires habituels — appelez pour
  confirmer ». **À repousser chaque année** (par exemple en décembre, après avoir saisi les congés).
- `booking` : réservation possible jusqu'à `horizonDays` jours à l'avance, et le jour même jusqu'à
  `sameDayLeadMinutes` minutes avant l'heure demandée ; au-delà de `groupThreshold` couverts, le
  formulaire passe en demande de groupe.

L'état « ouvert / fermé » est calculé à l'heure de Paris dans le navigateur du visiteur : il est
toujours juste, même si le site n'a pas été republié depuis des mois.

### Avis — `content/reviews.json`

- `rating` : note et nombre d'avis Google, avec la date du relevé (`asOf`). À mettre à jour de temps
  en temps, en recopiant les chiffres affichés par Google.
- `excerpts` : extraits d'avis. Un extrait ne s'affiche **que si** `author` et `date` sont remplis
  exactement comme sur Google (obligation légale d'informer sur l'origine des avis). Ne jamais
  modifier le texte d'un avis.

### Galerie — `content/gallery.json` et photos

Les photos sources (retouchées) sont dans `assets/photos/retouched/`. Pour ajouter une photo :

1. Placez le fichier JPEG dans `assets/photos/retouched/` (nom court sans accent, par exemple
   `plat-saint-jacques.jpg`) et vérifiez que le restaurant en possède les droits
   (`assets/photos/README.md`).
2. Sur un ordinateur avec le projet installé : `npm run images` (crée les versions AVIF/WebP
   optimisées dans `public/img/`).
3. Ajoutez l'entrée dans `content/gallery.json` (`id` = nom du fichier sans `.jpg`, texte
   alternatif `alt` qui décrit la photo, légende `caption`).

### Coordonnées et mentions légales — `content/site.config.ts`

Nom, adresse, téléphone, e-mail, réseaux sociaux, informations légales (société, SIRET, médiateur de
la consommation, hébergeur). Les champs `null` ne sont pas affichés : par exemple, renseigner
`mediator` ajoute automatiquement le médiateur dans les mentions légales.

## Lancer le site sur un ordinateur

Prérequis : [Node.js 22](https://nodejs.org/) et Git.

```bash
git clone https://github.com/luuccass/site-web-test.git
cd site-web-test
git checkout claude/install-frontend-design-remotion-vvrxf5
npm ci              # installe les dépendances
npm run dev         # site de travail sur http://localhost:3000
```

Version finale, identique à celle publiée :

```bash
npm run build       # produit le site statique dans out/
npm start           # le sert sur http://localhost:3000
```

Autres commandes :

| Commande | Rôle |
|---|---|
| `npm test` | tests automatiques (calcul ouvert/fermé, jours fériés, congés, heure d'été…) |
| `npm run typecheck` | vérification TypeScript |
| `npm run lint` | vérification du code |
| `npm run images` | génère les images optimisées à partir de `assets/photos/retouched/` |
| `npm run og` | régénère l'image de partage `public/og.jpg` (réseaux sociaux) |
| `npm run pdf` | régénère les PDF de la carte et des vins (fait automatiquement à chaque publication) |

Contrôles qualité complets (captures d'écran aux six largeurs, accessibilité, Lighthouse), après
`npm run build` :

```bash
node scripts/qa/serve-h2.mjs 4443 out &   # sert out/ en HTTP/2 + Brotli, comme Netlify
node scripts/qa/run-qa.mjs https://localhost:4443 qa-output
node scripts/qa/lighthouse.mjs https://localhost:4443 qa-output
node scripts/qa/interactions.mjs https://localhost:4443   # réservation, règle d'1 h, galerie, menu mobile
```

## Organisation du code

| Dossier | Contenu |
|---|---|
| `content/` | tout le contenu modifiable (carte, vins, horaires, avis, galerie, ardoise, coordonnées) |
| `src/app/` | les pages (une par dossier : `la-carte`, `le-restaurant`, `galerie`, `nous-trouver`, `reserver`…) |
| `src/components/` | les éléments d'interface (en-tête, barre mobile, statut ouvert/fermé, cave, porte…) |
| `src/lib/` | données typées, calcul des horaires (`status.ts`), navigation |
| `src/fonts/` | polices Spectral et Montserrat hébergées sur le site (pas d'appel à Google) |
| `public/` | fichiers servis tels quels : images optimisées, logos, PDF de la carte |
| `assets/` | sources : photos retouchées, logos |
| `scripts/` | génération des images, des polices, de l'image de partage ; contrôles qualité |
| `docs/` | direction artistique, architecture, recherches, mise en ligne |
| `netlify.toml` | réglages Netlify : en-têtes de sécurité, cache, redirections des anciennes pages Wix |

## Vie privée

Aucun cookie, aucune mesure d'audience, aucune police ou script tiers. La carte OpenStreetMap de la
page « Horaires et accès » ne se charge qu'après un clic du visiteur. Les demandes de réservation
sont reçues par Netlify Forms et envoyées par e-mail au restaurant (voir la page Confidentialité).
