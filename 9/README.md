# Jour 9 · Bélier

Un siège au tour par tour sur `/9`, avec le menu partagé et le calendrier débloqué jusqu’au jour 9.

La porte possède 200 PV et l’équipe quatre porteurs. Une charge inflige 40 dégâts si la porte reste fermée. Si les défenseurs ouvrent pendant cette charge, les quatre porteurs tombent dans le vide et le siège se termine. Attendre ne provoque aucune chute et ne donne aucun bonus : les PV, les dégâts et le risque d’ouverture restent inchangés.

Le risque d’ouverture reste de 18 % à chaque tour. La réponse adverse est tirée uniquement après le choix du joueur, gardée privée, puis révélée pendant l’animation. La porte ouverte pendant une attente n’annonce pas le choix du tour suivant. Les commandes sont bloquées pendant la résolution ; une nouvelle partie restaure la scène et les PV.

Scène Three.js : pierre et bois texturés en code, tours, portes articulées, pont au-dessus du fossé, bélier et quatre porteurs. Les sons de bois, de choc et de chute sont synthétisés après interaction et peuvent être coupés. L’aperçu du calendrier reste silencieux et statique. Les animations respectent la préférence de mouvement réduit ; les commandes sont accessibles au clavier.

`pnpm test` couvre les PV, les chutes, les attentes sans bonus, les probabilités, la confidentialité du choix adverse, les entrées concurrentes, la victoire et la remise à zéro. `pnpm build` inclut `/9/index.html` ; Netlify sert `/9` et `/9/`.
