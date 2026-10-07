# Mise en ligne — Netlify + domaine restaurant-comme-avant.com

Guide pas à pas pour mettre le site en ligne une fois pour toutes. Durée : environ 20 minutes, plus
le temps de propagation DNS (de quelques minutes à 24 h). Les mises à jour suivantes sont
automatiques : chaque modification enregistrée sur GitHub republie le site.

> Pourquoi c'est vous qui cliquez : depuis mon environnement, les serveurs de Netlify et de Wix
> sont inaccessibles, et je ne peux pas me connecter à vos comptes. Tout le reste (code, réglages,
> en-têtes de sécurité, redirections, formulaire) est déjà prêt dans le dépôt.

## 1. Pourquoi Netlify (et pas Vercel)

- **Vercel Hobby** (gratuit) est réservé à un usage personnel et non commercial : le site d'un
  restaurant n'y a pas droit. L'offre commerciale de Vercel est payante.
- **Netlify Free** autorise l'usage commercial et inclut le formulaire de réservation
  (Netlify Forms) : depuis avril 2026, les envois de formulaire ne consomment plus de crédits.
- Budget du plan gratuit : **300 crédits par mois**.
  - une publication (« production deploy ») = 15 crédits ;
  - 1 Go de bande passante = 20 crédits ;
  - 10 000 requêtes = 3 crédits.
- Estimation pour le site (pages légères, images AVIF optimisées) : quelques milliers de visites
  par mois et une dizaine de mises à jour restent largement sous les 300 crédits.
- **Attention** : si le compte dépasse 300 crédits dans le mois, Netlify met en pause tous les
  projets du compte jusqu'au mois suivant. D'où trois précautions :
  1. Créez un **compte (ou une équipe) Netlify dédié au restaurant**, sans autre projet dessus.
  2. Le fichier `netlify.toml` ignore déjà les modifications qui ne changent pas le site
     (documentation, scripts de contrôle, photos sources) : elles ne coûtent rien.
  3. Regroupez les corrections : une modification de la carte = une publication.

## 2. Créer le projet Netlify (une seule fois)

1. Allez sur <https://app.netlify.com/signup> et inscrivez-vous **avec GitHub** (compte
   `luuccass`). Le plus simple est d'utiliser l'adresse e-mail que vous consultez.
2. **Add new project → Import an existing project → GitHub**. Autorisez Netlify à accéder au
   dépôt `luuccass/site-web-test` (seulement celui-ci suffit).
3. Choisissez la branche **`claude/install-frontend-design-remotion-vvrxf5`** comme branche de
   production. Les réglages sont lus automatiquement depuis `netlify.toml` :
   - Build command : `npm run build`
   - Publish directory : `out`
   Ne changez rien, cliquez **Deploy**.
4. Attendez « Published » (2 à 4 minutes). Le site est visible à une adresse du type
   `https://nom-du-projet.netlify.app`.
5. Renommez le projet pour une adresse lisible : **Project configuration → General → Change
   project name**, par exemple `comme-avant-dardilly` → `https://comme-avant-dardilly.netlify.app`.

## 3. Activer le formulaire de réservation

1. **Project configuration → Forms → Enable form detection**.
2. Relancez une publication : **Deploys → Trigger deploy → Deploy project**. Le formulaire
   `reservation` apparaît ensuite dans l'onglet **Forms**.
3. Notifications : **Project configuration → Notifications → Emails and webhooks → Form submission
   notifications → Add notification → Email notification**.
   - Event : *New form submission* ; Form : `reservation` ;
   - Email : **contact@restaurant-comme-avant.com**.
4. Faites une demande de test depuis le site (page Réserver) et vérifiez qu'elle arrive dans la
   boîte de réception (regardez aussi les indésirables la première fois, puis marquez
   l'expéditeur comme fiable). Supprimez ensuite la demande de test dans l'onglet **Forms**.

Rappel du fonctionnement : le site ne confirme jamais une réservation tout seul. Le client reçoit le
message « demande envoyée » et l'équipe le rappelle ou lui répond par e-mail. Les demandes pour le
jour même sont marquées « AUJOURD'HUI » dans l'objet : il faut donc lire les e-mails pendant le
service, ou laisser le téléphone comme canal principal pour le jour même (c'est ce que le site
conseille).

## 4. Brancher le nom de domaine

Aujourd'hui, le domaine est géré chez **Wix** (serveurs DNS `ns10.wixdns.net` / `ns11.wixdns.net`)
et les **e-mails sont chez OVH**. On ne déplace que le site : les e-mails ne changent pas.

### 4.1 Côté Netlify

1. **Domain management → Add a domain** → saisissez `www.restaurant-comme-avant.com` →
   **Verify** → **Add domain** (Netlify propose « Netlify DNS » : choisissez de garder votre DNS
   actuel, *external DNS*).
2. Ajoutez aussi `restaurant-comme-avant.com` (sans www) si Netlify ne l'a pas fait seul.
3. Vérifiez que **www.restaurant-comme-avant.com** est le domaine principal (*Primary domain*) :
   l'adresse sans www redirigera vers celle-ci.

### 4.2 Côté Wix (DNS)

1. **Avant toute modification, faites une capture d'écran de la page des enregistrements DNS** : elle
   sert à revenir en arrière si besoin.
2. Si le domaine est encore relié au site Wix, Wix peut bloquer la modification des
   enregistrements du site. Dans **Domaines**, déconnectez d'abord le domaine du site Wix
   (« Déconnecter du site » / « Attribuer à un autre site »), **sans** supprimer le domaine.
3. **Domaines → ⋯ → Gérer les enregistrements DNS**, puis modifiez uniquement ces deux lignes :

   | Type | Nom (hôte) | Ancienne valeur | Nouvelle valeur |
   |---|---|---|---|
   | A | `restaurant-comme-avant.com` (ou `@`) | adresse IP Wix | `75.2.60.5` |
   | CNAME | `www` | `cdn3.wixdns.net` | `comme-avant-dardilly.netlify.app` (le nom choisi à l'étape 2.5) |

   S'il existe plusieurs enregistrements A pour le domaine sans www, gardez-en un seul avec
   `75.2.60.5`.
4. **Ne touchez pas** aux lignes e-mail :
   - MX : `mx1.mail.ovh.net`, `mx2.mail.ovh.net`, `mx3.mail.ovh.net` ;
   - TXT (SPF) : `v=spf1 include:mx.ovh.com -all` ;
   - toute autre ligne TXT ou CNAME liée à OVH (`autodiscover`, `ovhcontrol`, DKIM…).

### 4.3 Vérifier

1. Dans Netlify, **Domain management** passe au vert en quelques minutes à quelques heures. Le
   certificat HTTPS (Let's Encrypt) est créé automatiquement ensuite ; HTTP redirige vers HTTPS.
2. Ouvrez `https://www.restaurant-comme-avant.com` et `https://restaurant-comme-avant.com` :
   les deux doivent afficher le nouveau site.
3. Les anciennes adresses du site Wix (`/menus`, `/cartesdesvins`, `/apropos`, `/contact`) redirigent
   vers les nouvelles pages : les liens existants (Google, TripAdvisor…) continuent de marcher.
4. Envoyez-vous un e-mail sur contact@restaurant-comme-avant.com pour confirmer que la messagerie
   OVH fonctionne toujours.

### Revenir en arrière

Remettez dans Wix les deux valeurs de la capture d'écran (A et CNAME `www`). Rien n'est perdu côté
Netlify.

## 5. Après la mise en ligne

- **Wix** : ne résiliez pas l'abonnement du **domaine** s'il a été acheté chez Wix (il faut le
  renouveler chaque année). L'abonnement « site » Wix peut être arrêté une fois le nouveau site
  vérifié.
- **Google Business Profile** : vérifiez que le lien « Site web » pointe vers
  `https://www.restaurant-comme-avant.com/` et ajoutez le lien de réservation
  `https://www.restaurant-comme-avant.com/reserver/`. Signalez les anciennes fiches « Les Terrasses
  de Dardilly » à la même adresse comme fermées ou déménagées.
- **Google Search Console** (facultatif, gratuit) : ajoutez le domaine et envoyez le plan du site
  `https://www.restaurant-comme-avant.com/sitemap.xml`.
- Suivi de la consommation : **Netlify → Team → Usage** (une fois par mois suffit).
