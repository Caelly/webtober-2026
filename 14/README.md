# Jour 14 · Dame

Un portrait enchanté inspiré de la Grosse Dame de Harry Potter. Le jeu reprend le principe des indices sémantiques de *Mot de passe* : deviner un mot caché en cinq propositions, sans minuterie.

## Règles

Un premier indice est visible au début. Chaque réponse incorrecte consomme une tentative et dévoile l’indice suivant. Le cinquième indice est donc disponible pour la cinquième et dernière proposition. Une bonne réponse ouvre le tableau, même au dernier essai. Cinq erreurs révèlent le mot et sa définition, et la porte reste fermée.

Les réponses ne dépendent ni des accents, ni de la casse, ni des espaces ou des tirets. Les pluriels réguliers et les variantes explicites de la liste sont acceptés. Une saisie vide, invalide ou déjà proposée ne consomme ni tentative ni indice. Aucune sixième proposition n’est acceptée après la fin de la partie.

Le bouton « Un autre mot » apparaît au résultat. La pioche mélange les soixante entrées sans répétition jusqu’à épuisement et évite une répétition immédiate entre deux pioches. La progression de la partie est conservée en mémoire tant que la page reste ouverte ; le nombre de passages réussis est enregistré localement si le stockage est disponible.

## Première liste

Le fichier [src/words.js](src/words.js) contient 60 mots, cinq indices ordonnés par mot, une définition et les variantes orthographiques acceptées. Le vocabulaire mélange minerais, objets, instruments, plantes et animaux : améthyste, obsidienne, boussole, enclume, kaléidoscope, carquois, métronome, nacre, gargouille, entre autres. Les indices s’accumulent pour lever progressivement l’ambiguïté.

Le moteur n’expose ni le mot secret ni sa définition dans ses instantanés tant que la partie est en cours. Ce jeu entièrement local ne vise pas à empêcher l’inspection de son code source.

## Portrait et interface

Le portrait est une peinture originale générée avec l’outil intégré imagegen. Le cadre doré, les ornements SVG, les bougies, le mur et le passage sont construits dans l’interface. Une mauvaise proposition secoue brièvement le portrait et change sa réplique ; une bonne fait pivoter le tableau vers l’avant pour ouvrir le passage. Cliquer sur le portrait fait aussi réagir la Grosse Dame.

Le menu partagé et le calendrier débloquent le jour 14. L’aperçu du calendrier désactive les entrées et les animations décoratives. L’interface est adaptée aux écrans de téléphone ; le mode de mouvement réduit supprime les transitions et oscillations. L’ensemble fonctionne sans caméra, micro ou serveur de jeu.

Le portrait et son prompt sont documentés dans [ASSETS.md](ASSETS.md).

## Vérifications

Huit tests du moteur contrôlent les soixante mots et leurs indices, les cinq propositions, le succès au cinquième essai, la révélation à la cinquième erreur, les accents et variantes, les saisies non consommées, les doublons, la pioche et l’isolation des instantanés. Des essais dans Chrome vérifient aussi la saisie, les indices, les retours du portrait et la disposition mobile.
