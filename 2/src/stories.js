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
  {
    id: 'curedent', title: 'Le point final était en bois', relic: 'Fragment d’un dernier voyage', isTrue: true,
    text: 'Un écrivain part en voyage vers l’Amérique du Sud. Il a traversé des crises, changé de métier et publié des livres qui lui ont donné une place dans l’histoire littéraire. Mais pendant la traversée, il tombe malade. Hospitalisé au Panama, il meurt d’une péritonite. La cause est un objet minuscule qu’il a avalé par accident : un cure-dent. Ni tempête, ni naufrage, ni duel entre auteurs. Après toute une vie à chercher les mots justes, son dernier obstacle aura été un petit morceau de bois.',
    person: { name: 'Sherwood Anderson', birth: '13 septembre 1876', death: '8 mars 1941' },
    explanation: 'Un cure-dent avalé accidentellement a provoqué la péritonite dont Anderson est mort pendant son voyage.',
    sources: [
      { label: 'Library of Virginia', url: 'https://www.lva.virginia.gov/collections/dvb/bio/anderson-sherwood' },
      { label: 'Archives · Virginia Tech', url: 'https://digitalsc.lib.vt.edu/exhibits/show/sherwood-anderson/timeline' },
    ],
  },
  {
    id: 'parachute', title: 'Le costume qui devait sauver des vies', relic: 'Fragment d’un dernier essayage', isTrue: true,
    text: 'Un tailleur imagine un vêtement capable de se transformer en parachute. Pour les aviateurs, ce serait une merveille : une tenue qui les accompagnerait dans le ciel et les sauverait en cas de chute. L’inventeur veut en faire la démonstration depuis une célèbre tour parisienne. Il monte au premier étage, enfile son costume et saute devant les caméras. Le tissu ne le retient pas et il meurt dans la chute. Ce jour-là, la couture avait rendez-vous avec la physique. La physique n’a accordé aucune retouche.',
    person: { name: 'Franz Reichelt', birth: '16 octobre 1878', death: '4 février 1912' },
    explanation: 'Reichelt a testé lui-même son costume-parachute depuis le premier étage de la tour Eiffel. Le saut fatal a été filmé.',
    sources: [
      { label: 'British Film Institute', url: 'https://www.bfi.org.uk/sight-and-sound/archives-online-british-pathes-death-jump-eiffel-tower-1912' },
      { label: 'Dates · actes référencés dans Wikidata', url: 'https://www.wikidata.org/wiki/Q112070' },
    ],
  },
  {
    id: 'train', title: 'L’invité qui a raté le départ', relic: 'Fragment d’un dernier trajet', isTrue: true,
    text: 'Un homme politique est invité à l’inauguration d’une nouvelle ligne de chemin de fer. C’est un grand jour : on célèbre les locomotives, les ingénieurs et un avenir où chacun voyagera plus vite. Mais pendant la cérémonie, une locomotive le percute. Il est grièvement blessé et meurt le même jour. La machine porte un nom prometteur : la Fusée. L’inauguration qui devait montrer les merveilles du progrès devient une tragédie. L’invité avait été convié à découvrir le train. Il aurait préféré le découvrir de beaucoup plus loin.',
    person: { name: 'William Huskisson', birth: '11 mars 1770', death: '15 septembre 1830' },
    explanation: 'Huskisson a été mortellement blessé par la locomotive Rocket lors de l’ouverture de la ligne Liverpool–Manchester.',
    sources: [
      { label: 'Science Museum · témoignage de 1830', url: 'https://collection.sciencemuseumgroup.org.uk/documents/aa110002997' },
      { label: 'Dates · Parlement britannique', url: 'https://api.parliament.uk/historic-hansard/people/mr-william-huskisson/index.html' },
    ],
  },
  {
    id: 'miroir', title: 'Sept ans, tout compris', relic: 'Fragment d’un dernier reflet', isTrue: false,
    text: 'Émile était persuadé que casser un miroir apportait sept ans de malheur. Il avait donc fait retirer tous les miroirs de sa maison, sauf un minuscule modèle caché dans sa poche. À quatre-vingt-onze ans, il le sortit pour vérifier sa moustache et le laissa tomber. Sa famille le retrouva quelques minutes plus tard, mort dans son fauteuil. Il tenait encore une facture : un vitrier lui proposait de remplacer le miroir sous garantie. Sur le document, Émile avait écrit : « Trop tard. J’ai pris le forfait complet. »',
    explanation: 'Émile, le miroir de poche et cette garantie particulièrement malvenue sont entièrement inventés.',
  },
  {
    id: 'fromage', title: 'Un héritage qui sentait fort', relic: 'Fragment d’un dernier plateau', isTrue: false,
    text: 'Une fromagère conservait depuis vingt ans un fromage si puissant que personne n’osait ouvrir sa cave. Elle l’appelait son chef-d’œuvre et le réservait pour son centième anniversaire. Le jour venu, elle descendit chercher la meule, remonta avec un sourire immense et mourut avant la première bouchée. Son testament confiait le fromage au musée municipal. Le conservateur refusa. Les héritiers tentèrent alors de l’enterrer avec elle, mais le fossoyeur exigea deux concessions. Une pour la défunte. Une autre, à bonne distance, pour ce qui allait probablement lui survivre.',
    explanation: 'La fromagère centenaire et les deux concessions sont une fiction écrite pour le jeu.',
  },
  {
    id: 'meteo', title: 'Un dernier avis de tempête', relic: 'Fragment d’un dernier bulletin', isTrue: false,
    text: 'Un ancien présentateur météo avait promis de mourir un jour de grand soleil. Il consultait les prévisions toutes les heures et repoussait ses projets dès qu’un nuage apparaissait. À quatre-vingt-dix-neuf ans, il annonça enfin à sa famille : « Demain, ciel parfaitement dégagé. » Le lendemain, il s’éteignit paisiblement alors qu’un orage éclatait au-dessus de la maison. Dans sa poche, on retrouva une dernière note : « Erreur de prévision. Comme d’habitude. » À l’enterrement, sa fille apporta un parapluie. Le cercueil aussi avait le droit de se méfier.',
    explanation: 'Ce présentateur et sa dernière prévision sont imaginaires. Aucun décès réel n’est attribué à cette anecdote.',
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
