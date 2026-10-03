# Miniature · Webtober, jour 03

`/3` est le sélecteur des deux versions. Le menu partagé et le calendrier ouvrent cette page. Le mode `/3?apercu=1` affiche les deux cartes dans l’aperçu du calendrier. Les chemins `/3/1` et `/3/2` sont compilés séparément et servis directement sur Netlify.

## Version 01 · Trouver · `/3/1`

Mille personnages différents, présents une seule fois chacun. Les 100 dessins originaux sont conservés et complétés par 900 identités de Marvel, DC, Disney, Pixar, Pokémon, Dragon Ball, Naruto, One Piece, Star Wars, Harry Potter, Le Seigneur des anneaux, Nintendo, SEGA et d'autres univers. Aucun personnage ne compte plusieurs éditions ou recolorations.

Chaque identité possède une palette et une description de sculpture : forme, coiffure, costume, traits et accessoires. Les animaux, poissons et robots ont leurs propres familles de silhouettes. Les proportions de figurine Pop et les matériaux de vinyle assurent la cohérence de la collection.

Le portrait en haut indique le personnage à retrouver et son univers. Une bonne réponse marque la miniature et augmente le compteur ; « La suivante » propose un personnage encore inédit. « Mélanger » réorganise le tas sans modifier la cible ou la progression. Les mille personnages peuvent être retrouvés au cours d’une même partie ; « Recommencer » apparaît lorsque la collection est complète.

Chaque miniature est accessible à la souris, au toucher ou au clavier avec Entrée ou Espace. Le tas se réorganise sur mobile. Les boutons et la molette permettent de zoomer jusqu’à 800 % ; le tas agrandi se déplace par glissement. La navigation au clavier recadre le personnage sélectionné si nécessaire. Les animations respectent la préférence de réduction des mouvements.

Les illustrations SVG sont générées localement et intégrées comme images vectorielles dans le tas, ce qui conserve les détails au zoom sans placer toutes leurs formes dans le DOM. Le portrait et la miniature utilisent exactement le même dessin. Aucun téléchargement d’image ou service extérieur n’est requis.

Le sélecteur dans le menu permet de passer à la seconde version. Le mode `/3/1?apercu=1` conserve l’aperçu du tas seul.

`src/characters.js` assemble les 1 000 identités et bloque un casting de taille incorrecte ou un nom répété. Les fichiers `src/catalog-*.js` décrivent les 900 nouveaux personnages. `src/sculptures-catalog.js` compose leurs formes et leurs accessoires ; les autres fichiers `src/sculptures*.js` conservent les 100 sculptures originales. `src/doll.js` assemble les matériaux et produit les portraits et images du tas.

`src/game.js` gère les cibles, le placement et les limites du zoom. `src/camera.js` gère le déplacement et le zoom dans l’interface. `src/main.js` relie le jeu à l’interface. `src/game.test.js` vérifie les 1 000 identités, les 1 000 dessins distincts après normalisation des identifiants SVG, la correspondance portrait/figurine, les réponses, la partie complète, les dispositions du tas et le zoom.

Références du casting : [Marvel](https://www.marvel.com/characters), [Disney](https://characters.disney.com/), [Pokédex](https://www.pokemon.com/pokedex/), [Star Wars Databank](https://www.starwars.com/databank/). Il s’agit d’une collection de fan art indépendante.

## Version 02 · Attraper · `/3/2`

Une vraie scène Three.js avec un cabinet vitré, un portique à deux axes, trois doigts articulés et trente capsules bicolores. Les boutons directionnels maintenus, les flèches du clavier ou ZQSD/WASD déplacent la pince. Entrée sur un bouton directionnel déplace la pince d’un cran ; Espace ou « Attraper » lance la descente. Seule une capsule dans le rayon de prise est gagnée. La pince la remonte, l’amène à la sortie puis révèle son contenu. Un échec ne tire aucune récompense.

Le casting contient exactement 100 identités Disney distinctes, chacune avec quatre éditions : 400 variantes au total. Deux tirages indépendants choisissent l’édition et le personnage. Les probabilités exclusives sont dorée 1/100, argentée 1/50, bronze 1/30, originale 93,666… %. Les personnages ont tous une probabilité de 1/100 quelle que soit l’édition. Il n’y a aucun paiement, quota de parties ni achat de capsules.

Les personnages possèdent de vrais volumes bombés : tête, corps, oreilles, mains, pieds et accessoires. Les détails du visage et les costumes suivent la courbure du personnage. Les originales gardent une texture de polaire ; bronze, argent et or utilisent des matériaux métalliques polis, un vernis brillant et les reflets de panneaux lumineux. La figurine peut pivoter à la souris, au toucher ou au clavier dans son aperçu. Les cartes de collection sont rendues à partir de ces mêmes modèles 3D, progressivement et avec un seul moteur hors écran. Un portrait texturé sert de remplacement si WebGL est indisponible.

La collection à droite propose recherche, filtre des peluches obtenues et édition. Les doublons sont comptés séparément pour chaque combinaison personnage/édition. `localStorage`, clé `webtober-2026-miniature-claw-v1`, conserve les comptes entre les visites ; les données chargées sont validées. Si le stockage est indisponible, la progression reste dans la session. Sur mobile, la collection s’ouvre dans un panneau et seule sa grille défile.

`2/src/collection.js` contient le casting, les probabilités, la sauvegarde et la prise de capsules. `machine.js` anime le cabinet ; `plush.js` décrit les parties des personnages et les portraits de remplacement. `figurine.js` construit les volumes et leurs matériaux ; `figurine-studio.js` partage le rendu éclairé des cartes et de l’aperçu ; `reward-scene.js` gère la rotation. `collection.test.js` vérifie le casting, les probabilités, les doublons, la sauvegarde et la prise. `figurine.test.js` vérifie la profondeur, la courbure, les normales, les parties des 400 modèles et les finitions réfléchissantes.
