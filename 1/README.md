# Pomme. · Webtober, jour 01

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
- Le pinceau de la couleur active est masqué. Le mot « pomme » reprend la teinte rouge, verte ou jaune du fruit ; sa feuille est placée à côté.
- Les pinceaux peuvent également être glissés sur la pomme à la souris.
- Glisser sur la pomme permet de la faire tourner. Les flèches gauche et droite fonctionnent quand la scène a le focus.
- Le bouton Réinitialiser, sous le sous-titre, restaure la pomme rouge et son orientation de départ.
- Le couteau découpe la pomme en quartier et débloque la pâte feuilletée.
- Une pâte sur le quartier crée une tarte aux pommes. Une seconde pâte sur la tarte crée une tarte à l’américaine, avec un dessus quadrillé.
- Le four transforme la pomme entière en pomme cuite.
- Le mixeur transforme une pomme entière, un quartier ou une pomme cuite en compote.
- Le pressoir transforme une pomme entière ou des quartiers en jus de pomme présenté dans une brique en carton.
- Le bouton Fermentation est disponible uniquement sur le jus pressé. Il crée le cidre dans une bouteille verte allongée avec bouchon et muselet.
- Le déshydrateur donne des rondelles de pommes séchées, la friteuse un beignet et la casserole une sauce aux pommes.
- Le bouton Viande transforme la pomme, les quartiers, la pomme cuite ou la compote en boudin noir accompagné de pommes dorées.
- Le bouton Vertical / Horizontal change la disposition des outils et conserve le choix au rechargement.
- La découpe montre quatre quartiers disposés avec des orientations et des espacements irréguliers dans une assiette remontée. La compote contient une cuillère partiellement immergée.
- Le titre reste sur deux lignes, sans points de suspension : « Dégustez votre » puis le nom de la création en italique.
- Un post-it au-dessus de la scène suit chaque création et affiche sa recette, sa durée et ses portions. Un clic ouvre les ingrédients et les étapes dans une fenêtre, refermable avec la croix, Échap ou un clic à l’extérieur.
- La peau des pommes utilise des textures colorées à grains et lenticelles ; la tarte présente une rosace de fines lamelles avec leurs bords de peau rouge et une pâte à texture de biscuit.
- Les outils incompatibles avec la création courante sont désactivés. L’atelier ne présente aucun conseil, indice de combinaison ou infobulle explicative.
- « Le concept » ouvre une fenêtre présentant l’expérience.

## Structure

- `src/main.js` : interface et interactions.
- `src/scene.js` : géométrie, textures procédurales, éclairage et animation Three.js.
- `src/foods.js` : quartiers, pomme cuite, tartes, compote, jus en brique et cidre en bouteille en 3D.
- `src/packaging.js` : brique plate à motifs et bouteille de cidre en verre sombre.
- `src/american-pie.js` : apple pie rustique avec pâte entrecroisée, part détachée et assiette corail.
- `src/workshop.js` : états et règles de transformation, vérifiés par `pnpm test`.
- `src/kitchen.css` : palette d’ustensiles et adaptation des titres.
- `src/textures.js` : textures procédurales de peau, chair, pâte et préparations.
- `src/recipes.js` : les recettes associées aux douze créations.
- `src/tool-layout.css` : les dispositions horizontale et verticale des outils.
- `src/viewport.css` : l’affichage dans la hauteur de l’écran.
- `src/style.css` : direction visuelle et mise en page responsive.
- `src/icons.js` : illustrations vectorielles des pinceaux et des icônes.

La pomme est créée en code et ne nécessite aucun modèle 3D externe. Un rendu CSS prend le relais si WebGL n’est pas disponible. Les polices Cormorant Garamond et DM Sans sont chargées depuis Google Fonts, avec des polices système de remplacement. Les changements de couleur sont annoncés aux lecteurs d’écran et les préférences de réduction des animations sont prises en compte.
