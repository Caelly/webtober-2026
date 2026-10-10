# Jour 10 · Mystique

Une boule de cristal sur `/10`. La scène ne porte aucun texte décoratif. Le visiteur pose une question dans le formulaire puis seule la réponse aléatoire apparaît dans la boule. Les 36 réponses sont différentes ; deux consultations consécutives ne donnent pas le même message. Il s’agit d’un jeu, pas de prédictions réelles.

Le cristal, ses brumes, ses reflets et son socle sont générés en code avec Three.js. Un tintement accompagne la consultation après interaction. L’aperçu du calendrier reste statique et silencieux. La préférence de mouvement réduit accélère la révélation et arrête les animations décoratives. Un rendu CSS garde la boule et le jeu utilisables sans WebGL.

La question reste dans le navigateur, sans sauvegarde ou transmission. Le formulaire fonctionne au clavier, bloque les envois concurrents, refuse les questions vides et annonce la réponse aux lecteurs d’écran.

`pnpm test` vérifie les réponses accessibles, l’absence de répétition immédiate, les questions invalides, les consultations concurrentes et l’annulation. `pnpm build` compile le jour 10 et le calendrier. Netlify sert `/10` et `/10/`.

La brume forme des courants en spirale et des filaments turquoise / violets. Des particules tournent et scintillent dans le volume. La consultation accélère le mouvement ; la révélation provoque une montée lumineuse douce puis un retour au calme. Le rendu de secours anime aussi sa brume, sauf en aperçu et en mouvement réduit.

Un filtre local refuse les sujets liés au suicide, à l’automutilation, à la mort, à la violence, à la santé et aux médicaments, avant toute animation ou réponse aléatoire. Il retire une réponse précédente et affiche un message adapté sous le formulaire. Il conserve seulement un indicateur de sujet sensible pour refuser les reformulations ambiguës immédiates, sans enregistrer le texte refusé.

Le filtre repose sur des mots et des formulations en français / anglais, avec normalisation des accents et de certaines obfuscations. Il n’est pas une classification sémantique : des formulations non prévues peuvent passer et certains mots peuvent être refusés hors contexte. Les messages n’émettent aucune recommandation médicale ni prédiction sur la mort. Des tests couvrent les sujets bloqués, les variantes, les questions courantes autorisées et l’absence de tirage après refus.
