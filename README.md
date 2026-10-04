# Webtober 2026

Un thème, une hero section. Une collection d’expériences interactives pour octobre 2026, organisée par jour.

## Démarrer

Depuis le dossier du projet `webtober-2026` :

```sh
pnpm install --frozen-lockfile
pnpm dev
```

La page d’accueil est le calendrier d’octobre. Le jour 1 est accessible sur `http://127.0.0.1:5173/1`.

```sh
pnpm test
pnpm build
pnpm preview
```

## Organisation

```text
webtober-2026/
├── 1/
│   ├── index.html
│   ├── public/
│   ├── src/
│   └── README.md
├── gallery/
├── index.html
├── days.js
├── netlify.toml
├── package.json
├── pnpm-lock.yaml
└── vite.config.js
```

La configuration et les dépendances sont partagées à la racine. Chaque jour possède son dossier numéroté et son point d’entrée HTML. Vite détecte ces dossiers au démarrage et les compile ensemble dans `dist/`, en conservant les chemins `/1/`, `/2/`, etc.

`days.js` contient les 31 thèmes en français et leur disponibilité dans le calendrier. Passez `unlocked` à `true` lorsqu’une page est prête à publier : la case du jour affiche alors un aperçu en direct de l’expérience. Les jours 1, 2, 3 et 4 sont actuellement accessibles.

## Netlify

Le dépôt se publie tel quel : `pnpm build` produit `dist`. La racine sert le calendrier, `/1` le jour Pomme, `/2` le jour Relique, `/3` le jour Miniature et `/4` le jour Cactus.

La page du jour 1 tient dans la hauteur de l’écran sans défilement. Le bouton Vertical / Horizontal change la disposition des outils et mémorise le choix. Sur les écrans en paysage de faible hauteur, les outils passent à côté de la scène. Les recettes et le menu peuvent défiler à l’intérieur de leur panneau si nécessaire.

## Jour 1 — Pomme

Une pomme 3D à peindre et à transformer avec des ustensiles : quartiers, pomme cuite, tarte, apple pie, compote, jus en brique, cidre en bouteille, pommes séchées, beignet, sauce et boudin aux pommes. Le pressoir donne le jus ; la fermentation le transforme en cidre. Un post-it ouvre la recette de la préparation affichée. Voir [les interactions du jour 1](1/README.md).

## Jour 2 — Relique

Un reliquaire religieux en 3D ouvre un parchemin avec une histoire de mort improbable. Douze narrations françaises de moins d’une minute accompagnent l’apparition du texte, mot par mot. Le visiteur choisit à la fin si l’histoire est vraie ou inventée. Les histoires vraies révèlent la personne, ses dates et leurs sources. Une bonne réponse fait apparaître un fantôme discret. Le parchemin se referme dix secondes après le verdict. Le son peut être mis en pause, repris ou coupé ; un mode sans voix permet de lire à son rythme. Voir [le jour 2](2/README.md).

Les illustrations sont générées en code avec Three.js ou SVG. Les polices Cormorant Garamond et DM Sans sont chargées depuis Google Fonts, avec des polices système de remplacement.

## Jour 3 — Miniature

La page `/3` propose deux versions. Sur `/3/1`, mille poupées de la pop culture sont réunies en tas : mille personnages différents à retrouver, chacun présent une seule fois. Sur `/3/2`, une machine à pince en 3D permet d’attraper des capsules et de collectionner 100 personnages Disney en peluches texturées. Chaque peluche existe en originale, bronze, argentée et dorée. La collection et les doublons sont sauvegardés sur l’appareil. Voir [le jour 3](3/README.md).

## Jour 4 — Cactus

Un cactus 3D texturé en pot dont on retire les 43 épines une à une, y compris à l’arrière. La rotation est libre sur les trois axes. Le compteur accompagne la progression, puis une fleur apparaît à la dernière épine. Les retraits peuvent être annulés et la partie recommencée. Le jour est accessible dans le calendrier et le menu partagé. Voir [le jour 4](4/README.md).
