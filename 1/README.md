# Pomme. — Inktober, jour 01

Hero interactive en français : typographie éditoriale, pomme 3D et palette de peinture. Ce dossier contient le jour 1 de Webtober 2026.

## Démarrer

Lancer les commandes depuis le dossier parent `inktober`, qui partage les dépendances et la configuration entre les jours.

```sh
pnpm install
pnpm dev
```

L’aperçu du jour 1 est disponible sur `http://127.0.0.1:5173/1`. L’adresse racine redirige vers `/1` dans l’application.

```sh
pnpm build
pnpm preview
```

## Interactions

- La pomme est rouge à l’ouverture.
- Cliquer sur le pinceau vert ou jaune transforme sa couleur en douceur.
- Dès que la pomme ou le quartier est vert ou jaune, un pinceau rouge apparaît pour retrouver la couleur rouge sans réinitialiser la création.
- Les pinceaux peuvent également être glissés sur la pomme à la souris.
- Glisser sur la pomme permet de la faire tourner. Les flèches gauche et droite fonctionnent quand la scène a le focus.
- Réinitialiser restaure la pomme rouge et son orientation de départ.
- Le couteau découpe la pomme en quartier et débloque la pâte feuilletée.
- Une pâte sur le quartier crée une tarte aux pommes. Une seconde pâte sur la tarte crée une tarte à l’américaine, avec un dessus quadrillé.
- Le four transforme la pomme entière en pomme cuite.
- Le mixeur transforme une pomme entière, un quartier ou une pomme cuite en compote.
- Le pressoir transforme une pomme entière ou un quartier en cidre.
- Le déshydrateur donne des rondelles de pommes séchées, la friteuse un beignet et la casserole une sauce aux pommes.
- La découpe montre quatre quartiers. La compote contient une cuillère partiellement immergée.
- Le titre reste sur deux lignes, sans points de suspension : « Dégustez votre » puis le nom de la création en italique.
- Un post-it au-dessus de la scène suit chaque création et affiche sa recette, sa durée et ses portions. Un clic ouvre les ingrédients et les étapes dans une fenêtre, refermable avec la croix, Échap ou un clic à l’extérieur.
- La peau des pommes utilise des textures colorées à grains et lenticelles ; la tarte présente une rosace de fines lamelles avec leurs bords de peau rouge et une pâte à texture de biscuit.
- Les outils incompatibles avec la création courante sont désactivés. Leur infobulle explique la condition ; Réinitialiser permet de repartir de zéro.
- « Le concept » ouvre une fenêtre présentant l’expérience.

## Structure

- `src/main.js` : interface et interactions.
- `src/scene.js` : géométrie, textures procédurales, éclairage et animation Three.js.
- `src/foods.js` : quartier, pomme cuite, tartes, compote et cidre en 3D.
- `src/workshop.js` : états et règles de transformation, vérifiés par `pnpm test`.
- `src/kitchen.css` : palette d’ustensiles et adaptation des titres.
- `src/textures.js` : textures procédurales de peau, chair, pâte et préparations.
- `src/recipes.js` : les recettes associées aux dix créations.
- `src/style.css` : direction visuelle et mise en page responsive.
- `src/icons.js` : illustrations vectorielles des pinceaux et des icônes.

La pomme est créée en code et ne nécessite aucun modèle 3D externe. Un rendu CSS prend le relais si WebGL n’est pas disponible. Les polices Cormorant Garamond et DM Sans sont chargées depuis Google Fonts, avec des polices système de remplacement. Les changements de couleur sont annoncés aux lecteurs d’écran et les préférences de réduction des animations sont prises en compte.
