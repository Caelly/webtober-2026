# Jour 15 · Hourra

Une bombe de confettis explose automatiquement en arrivant sur `/15`. Soixante morceaux en papier se dispersent, retombent lentement, puis restent au sol. Le jeu consiste à tous les mettre dans la poubelle.

## Jouer

Attraper un morceau à la souris ou au doigt, le glisser sur la poubelle, puis relâcher. Le couvercle se soulève et la zone s’éclaire lorsqu’une prise peut être déposée. Un lâcher à côté reprend une chute lente ; une annulation ne consomme aucun morceau.

Il est aussi possible de sélectionner un confetti par un clic, puis de cliquer sur la poubelle. Au clavier : Tab atteint les confettis, les flèches changent le morceau actif, Entrée ou Espace le sélectionne et place le focus sur la poubelle. Entrée le range et passe au prochain confetti. Échap annule une sélection. Chaque morceau est jeté individuellement, sans bouton de nettoyage global.

Le compteur et sa jauge vont de 0 à 60. Au dernier confetti, le couvercle se ferme et le titre devient « Ça brille. ». Aucune nouvelle pluie ne vient salir la scène. Le bouton « Refaire la fête » relance volontairement une explosion ; la flèche en haut à droite permet de recommencer à tout moment.

## Réalisation

La physique est indépendante du rendu et avance à pas fixes de 1/120 seconde. Une impulsion initiale disperse les morceaux ; un freinage puis une faible vitesse terminale leur donnent une chute lente. Les positions restent dans la scène et chaque papier s’arrête au sol au lieu de disparaître hors écran.

Les prises utilisent Pointer Events et la capture de pointeur, avec un propriétaire distinct par morceau. Deux doigts peuvent déplacer des confettis différents, sans se voler une prise. La zone de dépôt est recalculée après redimensionnement. Une animation brève fait entrer le morceau dans la poubelle après validation ; un même confetti ne compte qu’une fois.

Les confettis, la bombe et la poubelle sont créés dans le code avec CSS et SVG : rubans, ronds, rectangles et étoiles, six couleurs, reflets légers de papier, poubelle émaillée et couvercle articulé. Aucun fichier externe d’illustration, micro, caméra ou son en lecture automatique.

Ouvrir le concept, le calendrier, changer d’onglet ou perdre le focus suspend la chute et relâche les prises. La fermeture du panneau ou le retour au premier plan reprend l’animation ; un bouton de reprise reste disponible. Le mouvement réduit présente les confettis déjà dispersés, sans impulsion initiale. L’aperçu du calendrier est statique, avec les commandes désactivées.

## Vérifications

Les dix tests du moteur couvrent la création des soixante morceaux, la chute lente et les limites, le dépôt unique, le lâcher hors poubelle, les prises simultanées, l’annulation, le parcours clavier, la sélection unique, la pause, le mouvement réduit, les données invalides et le redémarrage.

Un essai dans Chrome vérifie un dépôt par glisser-déposer réel, le rangement au clavier des soixante morceaux et la réussite finale. Le rendu mobile est contrôlé en 390 × 844 pixels, sans débordement de la page.
