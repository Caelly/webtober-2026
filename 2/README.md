# Relique. · Webtober, jour 02

Un reliquaire religieux en 3D, avec métal patiné, verre bombé, velours et fragment osseux texturé, ouvre un parchemin accompagné d’une narration française. Le jeu mélange six anecdotes documentées et six histoires inventées, de 36 à 44 secondes.

- Un clic ou une activation au clavier ouvre une nouvelle histoire. Toutes les histoires sont proposées avant qu’une ne revienne.
- Les mots apparaissent et sont soulignés au rythme de la narration. Le parchemin défile automatiquement lorsque la lecture dépasse sa partie visible.
- Pause, reprise, relecture et coupure du son sont disponibles. Fermer le parchemin ou quitter la page arrête le son.
- « Lire sans voix » arrête la narration, affiche tout le texte et ouvre le choix, sans attendre un minuteur. Le mode est mémorisé pour les prochaines histoires. « Écouter l’histoire » permet de reprendre la voix, tout en gardant le texte lisible.
- À la fin de la narration, le visiteur choisit « Vraie » ou « Inventée ». Le résultat ne peut être révélé qu’après ce choix. Pour les histoires vraies, le nom réel, les dates de naissance et de mort et les liens des sources sont alors affichés. Si l’audio est indisponible, le texte complet et le choix restent accessibles.
- La naissance de Molière n’est pas datée précisément : « Début 1622 » est affiché, avec une note distinguant son baptême du 15 janvier de sa naissance.
- Un fantôme discret apparaît en arrière-plan lorsqu’une réponse est juste. Le fond ne comporte plus de cercles concentriques.
- Après chaque verdict, le parchemin se referme en dix secondes avec une animation. Ouvrir une autre histoire ou fermer manuellement annule le compte à rebours précédent.
- Le menu Webtober est partagé avec le jour 1. Le calendrier présente un aperçu du reliquaire et ouvre `/2`.
- Les narrations sont des fichiers audio locaux : aucune voix installée chez le visiteur ni API externe n’est nécessaire.

`src/stories.js` contient les histoires et leurs références. `src/quiz.js` gère le choix et la révélation. `src/narration.js` synchronise les repères de `audio/timings.json` avec les fichiers WAV. `src/scene.js` et `src/reliquary-model.js` dessinent le reliquaire avec Three.js. `src/style.css` contient le parchemin et les adaptations aux petits écrans.

Pour régénérer les narrations sous Windows, depuis la racine du projet :

```powershell
powershell.exe -NoProfile -File scripts/generate-relic-audio.ps1
```

La génération utilise la voix française Microsoft Hortense Desktop et conserve les repères temporels de chaque mot. Les fichiers générés sont inclus dans le dépôt.
