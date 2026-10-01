# Webtober 2026

Un thème, une hero section. Une collection d’expériences interactives pour octobre 2026, organisée par jour.

## Démarrer

Depuis le dossier `inktober` :

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Le jour 1 est accessible sur `http://127.0.0.1:5173/1`. La racine ouvre ce premier jour.

```sh
pnpm test
pnpm build
pnpm preview
```

## Organisation

```text
inktober/
├── 1/
│   ├── index.html
│   ├── public/
│   ├── src/
│   └── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
└── vite.config.js
```

La configuration et les dépendances sont partagées à la racine. Chaque jour possède son dossier numéroté et son point d’entrée HTML. Vite détecte ces dossiers au démarrage et les compile ensemble dans `dist/`, en conservant les chemins `/1/`, `/2/`, etc.

## Jour 1 — Pomme

Une pomme 3D à peindre et à transformer avec des ustensiles : quartiers, pomme cuite, tarte, apple pie, compote, cidre, pommes séchées, beignet et sauce. Un post-it ouvre la recette de la préparation affichée. Voir [les interactions du jour 1](1/README.md).

Les illustrations sont générées en code avec Three.js. Les polices Cormorant Garamond et DM Sans sont chargées depuis Google Fonts, avec des polices système de remplacement.
