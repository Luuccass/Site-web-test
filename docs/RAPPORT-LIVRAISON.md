# Restaurant Comme Avant — rapport de livraison du site

7 octobre 2026. Branche `claude/install-frontend-design-remotion-vvrxf5` du dépôt
`luuccass/site-web-test`.

## 1. Ce qui est livré

**Onze pages, en français, sans cookie ni traceur :**

| Page | Contenu |
|---|---|
| Accueil `/` | Plein écran de nuit : la porte qui s'ouvre sur la salle, photos en fondu lent, Réserver / Appeler ; bandeau défilant ; texte qui s'éclaire mot à mot ; la salle révélée dans une arche ; la carte en bref ; la cave (« 95 vins à la carte » et niches) ; galerie horizontale ; note Google ; appel à réserver sur la ruelle au crépuscule |
| La carte `/la-carte/` | Ardoise du mois, formules du midi, entrées, plats, fromages, desserts ; navigation par rubriques ; légende des 14 allergènes ; impression et PDF A4 |
| Les vins `/la-carte/vins/` | Au verre ou en pot (12/25/46 cl), à la coupe, 95 bouteilles par couleur et région ; PDF |
| Le restaurant `/le-restaurant/` | Présentation, « Entrer chez Comme Avant » en trois temps (ruelle, salle, cave) avec des portes qui s'ouvrent au défilement sur ordinateur, groupes et privatisation |
| Galerie `/galerie/` | 15 photos (la maison, assiettes des derniers mois), agrandissement au clavier et au doigt |
| Horaires et accès `/nous-trouver/` | Plaque d'adresse, semaine avec le jour en cours, itinéraire Google ou Plans, contact, plan OpenStreetMap à la demande |
| Réserver `/reserver/` + `/reserver/merci/` | Formulaire de demande (fonctionne même sans JavaScript), règles 30 jours / 1 h, champs groupe à partir de 8 |
| Mentions légales, Confidentialité, page 404 | Conformes LCEN et RGPD avec les informations disponibles (voir §3) |

**Version 2 « Nocturne » (7 octobre au soir), sur toutes les pages :**
- ambiance de nuit (bleu nuit, or, crème), grande typographie Cormorant Garamond ;
- chaque page s'ouvre sur une grande photo plein écran ;
- photos étalonnées « nuit » (lumière, contraste, grain) à partir de vos photos, sans rien y ajouter
  ni retirer ;
- en-tête transparent qui devient verre dépoli au défilement, menu plein écran.

**Mouvement :**
- la porte qui s'ouvre à la première visite ;
- les photos d'accueil qui glissent et se fondent lentement ;
- le texte qui s'éclaire mot à mot, l'arche qui s'agrandit, la galerie qui défile à l'horizontale ;
- le compteur des vins, le léger décalage des photos au défilement (parallaxe) ;
- un curseur doré sur ordinateur.

Tout respecte le réglage « réduire les animations » du visiteur.

**Films de marque (dossier `video/`) :** animation du logo en 16:9 et 9:16, et un reel vertical de
18 s, faits avec vos vraies photos et votre logo.

**Mobile :** barre fixe Réserver / Appeler / Itinéraire, menu plein écran « Menu ».

**Référencement local :**
- données structurées `Restaurant` et `Menu` ;
- plan du site et `robots.txt` ;
- nom, adresse et téléphone identiques partout ;
- redirections des anciennes adresses Wix (`/menus`, `/cartesdesvins`, `/apropos`, `/contact`).

## 2. Résultats des contrôles (phase 5)

Détail : `docs/qa/phase5-report.md`. Le tableau ci-dessous donne les chiffres de la version 1. La
version 2 a été remesurée le 8 octobre (médiane de 3 mesures par page) : performance 95 à 98 sur mobile,
accessibilité, bonnes pratiques et référencement 100 partout, 0 erreur d'accessibilité, aucun
débordement, 18/18 parcours.

| Contrôle | Résultat |
|---|---|
| Lighthouse mobile, 9 pages | Performance 96 à 100, Accessibilité 100, Bonnes pratiques 100, SEO 100 |
| LCP / CLS | LCP 2,7 s au plus en 4G lente simulée (1,5 à 2,7 s ; cible < 2,5 s) ; CLS 0 partout |
| Accessibilité automatique (axe, WCAG 2.2 AA), 10 pages | 0 violation |
| Clavier | ordre logique, focus visible partout, lien « Aller au contenu » |
| Mise en page à 360, 390, 768, 1024, 1440, 1920 px | aucun débordement |
| Parcours testés en navigateur | 18/18 : réservation, règle d'une heure, galerie, menu mobile, navigation |
| Requêtes vers des tiers / cookies | aucune |

## 3. Ce qui manque : à fournir par le restaurant

Rien de tout cela n'est inventé sur le site. Chaque élément est soit masqué, soit remplacé par une
formulation prudente. Il apparaît dès qu'on renseigne le fichier indiqué.

**Obligations légales (à régler avant ou juste après la mise en ligne) :**

1. **Médiateur de la consommation.** Il est obligatoire pour un restaurant (Code de la consommation,
   L.612-1). Il faut adhérer à un médiateur, puis renseigner `mediator` dans `content/site.config.ts`.
2. **Capital social de LE COMPTOIR SARL.** Il est requis par la LCEN. À renseigner dans `capital`
   (`content/site.config.ts`).
3. **Téléphone de l'hébergeur Netlify.** Il est requis par la LCEN. Il faut le recopier depuis la
   page de contact officielle de Netlify (champ `host.phone`). Les sources tierces se contredisent :
   je n'ai rien mis.
4. **Allergènes plat par plat.** Le brouillon `docs/content/allergens-draft.md` est à faire corriger
   par la cuisine, en tranchant ses 4 questions. Une fois validé, les allergènes s'affichent sur la
   carte.

**Informations qui enrichiraient le site :**

5. **Avis Google.** Pour afficher les extraits d'avis, il faut le prénom et la date de chaque avis,
   tels que Google les affiche (`content/reviews.json`). En attendant, seuls la note et le nombre
   d'avis sont affichés.
6. **Horaires et règles :**
   - heure de dernière commande ;
   - politique des jours fériés (aujourd'hui « appelez-nous ») ;
   - dates de congés ;
   - heures où l'on répond au téléphone ;
   - délai de confirmation des demandes.
7. **Groupes :** capacité, nombre minimum, menus de groupe, salle privatisable.
8. **Histoire et équipe :**
   - rôles et quelques mots sur Magali et Fabrice ;
   - date d'ouverture ;
   - accord pour écrire « anciennement Les Terrasses de Dardilly » ;
   - saison de la terrasse ;
   - accès PMR.
9. **Carte et vins à confirmer :**
   - volumes de la coupe et du kir royal ;
   - menu enfant ;
   - formule le samedi midi ;
   - orthographes « OH ! by Omérade », Touraine « Ancrage », Pic Saint-Loup « Cuvée Manon » à 26 €.
10. **Plan intégré.** Pour remplacer le lien OpenStreetMap par une carte dans la page, il faut les
    coordonnées GPS exactes de l'entrée. Je n'ai pas pu les vérifier à 50 m près.
11. **Photos :**
    - **les fichiers d'origine des photos** (ceux du téléphone ou de l'appareil, pas des captures
      d'écran de Google Maps) : c'est le gain de qualité le plus important possible. L'IA libre testée
      le 8 octobre rend les photos plus nettes mais invente des détails ; elle n'est utilisée que sur
      la ruelle et l'enseigne, avec les plaques et la rosace du logo laissées intactes ;
    - une séance photo pour la terrasse, l'équipe et des assiettes de la carte actuelle.

**Hors site, à faire par vous :**

12. **Fiches « Les Terrasses de Dardilly ».** Elles existent encore à la même adresse et au même
    numéro : Google, PagesJaunes, TripAdvisor, annuaire de Dardilly, acceslibre. Elles sont à
    signaler comme fermées ou à faire fusionner.
13. **Google Business Profile.** Mettre le lien « Site web » et le lien de réservation
    (`/reserver/`).

## 4. Mise en ligne

Guide pas à pas, environ 20 minutes : **`docs/DEPLOY.md`**.

1. Créer un compte Netlify dédié au restaurant et importer le dépôt GitHub.
2. Activer la détection des formulaires et la notification vers contact@restaurant-comme-avant.com.
3. Chez Wix, modifier seulement deux enregistrements DNS :
   - domaine sans www : enregistrement A vers `75.2.60.5` ;
   - `www` : CNAME vers l'adresse `….netlify.app` du projet.

   Les lignes e-mail OVH (MX, SPF) ne bougent pas.
4. Faire une vraie demande de réservation de test et vérifier qu'elle arrive.

Je ne peux pas faire ces étapes moi-même : depuis mon environnement, les serveurs de Netlify et de
Wix sont inaccessibles, et je n'ai pas accès à vos comptes.

## 5. Modifier le contenu ensuite

Tout est dans le **`README.md`** :
- modifier la carte, les vins, l'ardoise du mois, les horaires et congés, les avis, la galerie et
  les mentions depuis le site GitHub, sans rien installer ;
- la routine mensuelle : ardoise, suppression des demandes de plus de 3 mois promise dans la page
  Confidentialité, consommation Netlify ;
- la mise à jour annuelle de `verifiedThrough`.

## 6. Points d'attention

- **Le formulaire envoie une demande, pas une réservation confirmée.** Quelqu'un doit lire les
  e-mails pendant le service pour les demandes du jour, qui sont marquées « AUJOURD'HUI » dans
  l'objet.
- **Netlify gratuit = 300 crédits par mois.** S'ils sont dépassés, Netlify met le site en pause
  jusqu'au mois suivant. Les publications inutiles sont déjà évitées ; un compte dédié protège le
  site des autres projets.
- **Les heures d'ouverture affichées sont garanties jusqu'au 31 décembre 2026** (`verifiedThrough`).
  Après cette date, le site affiche « horaires habituels, appelez pour confirmer » tant que la date
  n'a pas été repoussée.
