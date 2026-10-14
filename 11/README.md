# Jour 11 · Sauvetage

Un jeu caméra sur `/11`, avec le menu partagé et le calendrier débloqué jusqu’au jour 11. Deux pistolets défendent un convoi contre cinq vagues de drones. Chaque destruction apporte 5 points d’énergie, jusqu’à 100. Le convoi possède 100 points d’intégrité et perd 12 points par drone qui franchit la défense. Les cinq vagues terminées évacuent douze civils.

## Gestes

- Viser / détruire : le viseur suit le bout de l’index. Dès qu’il passe sur un drone, celui-ci est détruit, même blindé. Aucune position du pouce ou des autres doigts n’est imposée. Le trajet entre deux images caméra est pris en compte pour les mouvements rapides.
- Les cercles pouce-index sont réservés aux lasers ; ils ne déclenchent pas de destruction automatique au survol.
- Laser : rapprocher le pouce et l’index, les autres doigts restant détendus. L’anneau autour du viseur confirme le geste. Un cercle maintenu environ 0,5 seconde coûte 25 points d’énergie.
- Double laser : faire les deux cercles ensemble. Après 0,16 seconde de présence commune, le rayon plus large coûte 50 points. Le délai du laser simple laisse le temps d’ajouter la seconde main.
- Relâcher les cercles avant de recommencer : un geste maintenu ne dépense pas toute la jauge.

Une main visible suffit pour commencer, sans geste d’armement. Le mode souris fonctionne sans caméra : clic gauche / droit pour les pistolets, E pour le laser, Espace pour le double laser, Échap pour la pause. La direction des lasers suit le viseur ; ils détruisent les cibles présentes dans leur largeur.

## Caméra et suivi

Aucune caméra ne s’ouvre automatiquement. Le bouton d’activation demande uniquement la vidéo, jamais le micro. La vidéo en miroir reste dans l’appareil, sans enregistrement ni envoi d’image. Une pause, une fin de partie, un onglet masqué ou la fermeture de la page arrête les pistes, termine le worker et libère la vidéo. Une annulation pendant la demande de permission ferme aussi un flux accordé tardivement.

Le suivi utilise [MediaPipe Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js) (`@mediapipe/tasks-vision` 1.1.0), dans un worker distinct du rendu. Le runtime WASM est copié depuis la dépendance à chaque démarrage et compilation, et le [modèle officiel](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task) est servi par le site. Aucun CDN de reconnaissance n’est nécessaire pendant la partie. Le modèle fait 7 819 105 octets ; SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`.

Le suivi filtre les gestes brefs, conserve l’identité des mains par proximité et ignore les résultats trop anciens. La partie se met en pause si les mains disparaissent pendant plus de 1,8 seconde. La détection dépend de l’éclairage, du cadrage et de la visibilité des doigts ; le mode souris permet de jouer en cas de refus de caméra ou de navigateur incompatible. La caméra exige localhost ou HTTPS.

## Vérifications

`pnpm test` couvre les collisions au survol et en balayage, les vagues, les coûts exacts, les limites de jauge, la victoire / défaite, les gestes sur points synthétiques et la gestion des flux caméra avec des dépendances simulées. Ces tests ne remplacent pas un essai avec de vraies mains devant la caméra.

`pnpm build` inclut `/11/index.html`. Netlify sert `/11` et `/11/`. Les dessins de l’arène, des drones, des armes et des effets sont créés en Canvas. L’aperçu du calendrier ne demande pas de caméra et reste statique et silencieux. Le mouvement réduit désactive les oscillations décoratives.

La détection du cercle combine les distances dans l’image et les points 3D, normalisées à la taille de la paume. Des seuils distincts d’entrée / sortie et une tolérance de 180 ms absorbent les petites variations. Deux observations valides sont nécessaires ; une seule image incertaine ne suffit pas. Une perte brève d’une main ne fait pas retomber immédiatement le geste double en simple.
