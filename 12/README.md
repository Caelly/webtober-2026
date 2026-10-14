# Jour 12 · Lancer

Un jeu de javelot dans un stade illustré. Le but est de toucher les pigeons qui volent de gauche à droite, pas de battre un record de distance. La page `/12` reprend le menu partagé et dispose d’un aperçu statique et silencieux pour le calendrier.

## Jouer

Commencer avec le bouton ou Espace. Alterner rapidement les flèches haut et bas accélère le coureur ; répéter la même touche ou la maintenir ne compte pas. Sans nouveaux pas, la vitesse diminue. La jauge montre l’élan et la position avant la ligne blanche.

Espace lance le javelot avant la ligne. L’angle est fixe : le moment du lancer et la vitesse acquise changent la trajectoire. Les oiseaux touchés restent accrochés à la hampe et chaque pigeon rapporte un point. Une même cible ne compte jamais deux fois. Franchir la ligne avant de lancer annule l’essai.

Une partie comporte trois javelots. Le bouton suivant lance la course suivante ; après le troisième, il recommence la partie. Le meilleur total est conservé localement, avec gestion du stockage indisponible. Les boutons haut, bas et lancer permettent de jouer aussi au doigt. Échap ou le bouton pause suspendent la course et le vol ; perdre le focus ou changer d’onglet met également en pause. La reprise est explicite.

## Réalisation

La simulation avance à pas fixes de 1/120 seconde. Le javelot suit une parabole et ses collisions utilisent le mouvement relatif entre son ancienne et sa nouvelle position et celles de chaque pigeon, pour éviter de traverser une cible entre deux images. La course, la vitesse, la limite, la pause, le score et les trois essais sont séparés du rendu.

L’athlète, le stade, les pigeons animés et le javelot sont dessinés en Canvas. La caméra suit le vol lorsque le projectile approche du bord, y compris sur mobile. Les sons de pas, de lancer et de touche sont synthétisés après interaction et peuvent être coupés. Le réglage de mouvement réduit supprime le battement décoratif des ailes et la traînée ; la trajectoire nécessaire au jeu reste visible.

## Vérifications

Les tests du moteur couvrent l’alternance des touches, les répétitions clavier, l’accélération et son déclin, la faute de ligne, les trajectoires, les touches multiples, le score unique par oiseau, la pause en course et en vol, les trois essais et la stabilité entre 30 et 120 images par seconde. La compilation vérifie aussi l’intégration de la page au site.

Les rendus Canvas sont contrôlés en formats ordinateur et mobile. Les simulations automatisées ne remplacent pas une prise en main au clavier dans le navigateur.

Sur cent graines par rythme, un lancer effectué près de la ligne avec un appui toutes les 120, 180 ou 240 ms touche au moins un pigeon dans respectivement 97, 92 et 83 essais, pour environ 2,88, 2,81 et 1,85 pigeons par lancer. Ces chiffres contrôlent l’accessibilité des trajectoires, sans garantir un score individuel.
