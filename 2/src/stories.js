export const stories = [
  {
    id: 'cloche', title: 'Le chef qui battait trop fort', relic: 'Fragment du dernier mouvement', isTrue: true,
    text: 'Un compositeur dirige une œuvre pour célébrer la guérison de son roi. À cette époque, on ne brandit pas une petite baguette : on frappe le sol avec un lourd bâton pour marquer le tempo. Dans son enthousiasme, le chef frappe son propre pied. La blessure s’infecte, puis la gangrène l’emporte quelques semaines plus tard. Le concert devait remercier le ciel d’avoir sauvé quelqu’un. Il aura finalement coûté la vie à celui qui le dirigeait. Une mesure de trop, et le musicien perd définitivement le rythme.',
    person: { name: 'Jean-Baptiste Lully', birth: '28 novembre 1632', death: '22 mars 1687' },
    explanation: 'Lully s’est blessé en dirigeant son Te Deum pour célébrer la guérison de Louis XIV. La plaie s’est infectée.',
    sources: [
      { label: 'Château de Versailles', url: 'https://www.chateauversailles.fr/decouvrir/histoire/grands-personnages/lully' },
      { label: 'Dates · BnF', url: 'https://catalogue.bnf.fr/ark:/12148/cb13896861p' },
    ],
  },
  {
    id: 'soupe', title: 'La soupe de l’immortalité', relic: 'Fragment d’un dernier dîner', isTrue: false,
    explanation: 'Berthe, sa soupe et les demandes de remboursement ont été inventées pour cette expérience.',
    text: 'Berthe vendait une soupe censée rendre immortel. À cent deux ans, elle constituait son meilleur argument commercial. Un soir, elle goûta le bouillon, déclara qu’il manquait du sel et mourut dans son fauteuil. Son neveu découvrit alors son petit secret : Berthe n’avait jamais mangé sa propre soupe. Elle préférait les frites. À ses funérailles, tous les clients exigèrent un remboursement. Le neveu leur répondit que l’immortalité prenait parfois un peu de temps. Trois demandèrent une deuxième portion. Par précaution.',
  },
  {
    id: 'repetition', title: 'Le malade n’était plus imaginaire', relic: 'Fragment du dernier acte', isTrue: true,
    text: 'Un auteur joue le rôle d’un homme persuadé d’être malade. Le personnage se méfie des médecins, multiplie les traitements et fait rire toute la salle. Mais pendant la quatrième représentation, c’est le comédien lui-même qui est pris d’un malaise. Il termine la pièce, puis on le ramène chez lui. Il meurt dans la soirée. Contrairement à ce que raconte la légende, il n’est pas mort sur scène. Ce soir-là, pourtant, la réalité avait choisi un rôle particulièrement ironique : celui du malade que personne ne devait prendre au sérieux.',
    person: { name: 'Jean-Baptiste Poquelin, dit Molière', birth: 'Début 1622', birthNote: 'Date exacte inconnue · baptisé le 15 janvier 1622', death: '17 février 1673' },
    explanation: 'Molière est mort chez lui après la quatrième représentation du Malade imaginaire, et non sur scène.',
    sources: [
      { label: 'Comédie-Française · Le Malade imaginaire', url: 'https://www.comedie-francaise.fr/fr/actualites/historique-du-malade-imaginaire' },
      { label: 'Biographie · Comédie-Française', url: 'https://www.comedie-francaise.fr/moliere' },
    ],
  },
  {
    id: 'bibliotheque', title: 'Le livre rendu à temps', relic: 'Fragment d’une dernière page', isTrue: false,
    explanation: 'Colette et son fauteuil de bibliothèque sont des personnages et des détails imaginaires.',
    text: 'Colette avait conservé un livre de bibliothèque pendant soixante-dix ans. À quatre-vingt-seize ans, elle le rapporta enfin, parcourut tranquillement les rayons et s’endormit pour toujours dans le fauteuil des nouveautés. La bibliothécaire retrouva dans le livre un billet : « Je préfère partir avant de connaître les pénalités. » Le maire annula la dette et baptisa le fauteuil à son nom. Depuis, personne n’ose s’y asseoir plus d’une heure. Le livre, lui, fut emprunté dès le lendemain. Il s’intitulait : L’art de ne rien remettre à demain.',
  },
  {
    id: 'fantome', title: 'Le fantôme en avance', relic: 'Fragment d’un dernier rendez-vous', isTrue: false,
    explanation: 'Léon n’a jamais assisté à ses propres funérailles : cette histoire a été inventée.',
    text: 'Léon avait organisé ses funérailles dans les moindres détails. Musique, fleurs, discours : tout était prêt depuis trente ans. À quatre-vingt-dix-huit ans, il reçut par erreur une invitation à sa propre cérémonie. Il y alla, trouva le buffet excellent et corrigea deux anecdotes racontées par son frère. Puis il rentra chez lui et mourut dans son sommeil. Le lendemain, le curé demanda s’il fallait recommencer. La famille vota non. Léon avait déjà mangé sa part. On conserva seulement sa remarque dans le registre : « Très belle cérémonie. Le défunt était ravi. »',
  },
  {
    id: 'pari', title: 'La démonstration de trop', relic: 'Fragment d’une dernière défense', isTrue: true,
    text: 'Un avocat défend un homme accusé de meurtre. Sa théorie : la victime aurait pu se tirer dessus par accident en manipulant son arme. Pour montrer que ce scénario est possible, il fait une démonstration avec un pistolet qu’il croit déchargé. Il se tire accidentellement dessus et meurt de sa blessure. Son client est ensuite acquitté. L’avocat avait raison sur le fond : l’accident était possible. Mais pour convaincre, il venait de fournir une preuve dont il aurait très volontiers préféré se passer.',
    person: { name: 'Clement Laird Vallandigham', birth: '29 juillet 1820', death: '17 juin 1871' },
    explanation: 'Sa démonstration avec une arme supposée déchargée lui a été fatale. Son client, Thomas McGehean, a été acquitté.',
    sources: [
      { label: 'U.S. House of Representatives', url: 'https://history.house.gov/Historical-Highlights/1800-1850/Representative-Clement-Vallandigham-of-Ohio/' },
      { label: 'Dates · National Park Service', url: 'https://www.nps.gov/people/clement-l-vallandigham.htm' },
    ],
  },
];

export function shuffledStories(random = Math.random) {
  const result = [...stories];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
