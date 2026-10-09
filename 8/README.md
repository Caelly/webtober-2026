# Jour 8 · Puant

Un atelier olfactif sur `/8`, avec le menu partagé et un aperçu sur le calendrier.

## Interaction

- 34 notes illustrées, réparties en tête, cœur et fond ; onglets navigables avec les flèches du clavier.
- Ajouter une note soulève le bouchon, verse une goutte et modifie le niveau et la teinte du flacon.
- Les notes incompatibles avec toutes les références restantes sont désactivées. Chaque accord autorisé conserve un résultat possible contenant **toutes** les notes sélectionnées.
- Retirer une note depuis la composition ou la palette rétablit les accords disponibles. Recommencer vide le flacon.
- Une note de chaque étage active la révélation. La référence avec le moins de notes supplémentaires est présentée en premier ; les autres correspondances sont accessibles dans le résultat.
- Résultats dans un dialogue accessible : fermeture, Échap, nouveau mélange et lien vers la source officielle. Les animations respectent la préférence de mouvement réduit.

Le classement des matières est simplifié pour cet atelier. Leur étage varie selon la composition réelle du parfum ; le rapprochement utilise la présence des notes, pas une formule ou une concentration. Les notes retenues sont un sous-ensemble des descriptions officielles, vérifiées le 7 octobre 2026. Les accords comme l’ambre gris ne désignent pas nécessairement une matière naturelle.

## Références

Les liens officiels et les notes vérifiées sont dans `src/catalogue.js` et apparaissent dans le résultat :

- Shalimar · Guerlain : bergamote, iris, vanille.
- Sauvage eau de parfum · Dior : bergamote, poivre, lavande, badiane, vanille, ambroxan.
- Coco Mademoiselle eau de parfum · Chanel : orange, jasmin, rose, patchouli, vétiver.
- Chance Eau Tendre eau de parfum · Chanel : pamplemousse, coing, jasmin, rose, musc blanc.
- N°5 eau de parfum · Chanel : aldéhydes, jasmin, rose, ylang-ylang, vanille.
- English Pear & Freesia · Jo Malone London : poire, freesia, patchouli.
- Lost Cherry · Tom Ford : cerise noire, amande, rose, jasmin, baume du Pérou, tonka, santal, vétiver, cèdre.
- Good Girl · Carolina Herrera : amande, café, jasmin, tubéreuse, tonka, cacao.
- Black Opium · Yves Saint Laurent : café, fleurs blanches, vanille.
- Angel · Mugler : bergamote, praline, patchouli, vanille.
- Baccarat Rouge 540 eau de parfum · Maison Francis Kurkdjian : safran, jasmin, accord ambre gris, ambroxan.
- La Vie est Belle Iris Absolu · Lancôme : figue, cassis, iris, patchouli.

Le flacon et les dessins botaniques sont des SVG créés dans le projet. Aucune image de produit ni requête de reconnaissance externe n’est nécessaire.

## Vérification

`pnpm test` vérifie les références, les trois étages, les notes inconnues, le retrait et la couleur. Tous les sous-ensembles des références sont parcourus pour vérifier qu’aucun accord autorisé n’aboutit à une fausse correspondance ou à une impasse.
