# Jour 13 · Fragile

Un serveur, un plateau et une pile de verres à garder en équilibre pendant 45 secondes. La page `/13` reprend le menu partagé et ajoute un aperçu statique au calendrier.

## Jouer

Les flèches gauche et droite déplacent le plateau. Il faut le ramener sous la pile quand elle penche. De petites corrections limitent l’inertie. Les boutons fléchés fonctionnent au doigt ou à la souris, en maintenant l’appui.

Un nouveau verre arrive toutes les cinq secondes : on commence à un verre et on termine à neuf. Si la pile dépasse son angle limite, les verres tombent et éclatent au sol. Le temps de service s’arrête à la chute. Tenir 45 secondes termine le service sans casse.

Espace lance ou reprend une partie ; Échap et le bouton pause arrêtent le jeu. La perte de focus ou le passage dans un autre onglet met aussi en pause et relâche les touches. La reprise reste explicite. Le meilleur temps, borné à 45 secondes, est conservé localement avec une gestion des navigateurs qui refusent le stockage.

## Réalisation

La physique utilise un pendule inversé contrôlé par le déplacement du plateau, avec inertie, amortissement et perturbations progressives. Un pas fixe de 1/120 seconde rend le résultat indépendant de la cadence d’affichage. Les commandes peuvent être uniquement gauche, neutre ou droite. Les simulations terminent le service sur vingt graines différentes avec une correction toutes les 120 ms ; elles ne remplacent pas un essai de prise en main par une personne.

Les verres sont dessinés et articulés les uns sur les autres. Lors de la chute, chaque verre a sa propre vitesse, sa rotation et une collision avec le sol. Le serveur, le bistrot et le verre transparent sont créés en Canvas ; les tintements sont synthétisés après interaction. L’aperçu du calendrier reste silencieux et statique. Le mouvement réduit coupe les oscillations décoratives ; la physique nécessaire au jeu reste visible.

## Vérifications

`pnpm test` couvre les directions, les arrivées, les chutes, les collisions au sol, la victoire, la pause, la remise à zéro, les cadences et l’équilibre sur plusieurs services. `pnpm build` inclut `/13/index.html`. Netlify sert `/13` et `/13/`.
