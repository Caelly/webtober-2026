export const initialState = () => ({ type: 'apple', color: 'red' });

export const recipes = {
  knife: { label: 'Couper en quartier', from: ['apple'], to: 'quarter' },
  oven: { label: 'Cuire au four', from: ['apple'], to: 'baked' },
  pastry: { label: 'Ajouter une pâte feuilletée', from: ['quarter', 'tart'], to: { quarter: 'tart', tart: 'american' } },
  blender: { label: 'Mixer en compote', from: ['apple', 'quarter', 'baked'], to: 'compote' },
  press: { label: 'Presser en cidre', from: ['apple', 'quarter'], to: 'cider' },
  dehydrator: { label: 'Déshydrater en pommes séchées', from: ['apple', 'quarter'], to: 'dried' },
  fryer: { label: 'Frire en beignet', from: ['apple', 'quarter'], to: 'fritter' },
  saucepan: { label: 'Préparer une sauce aux pommes', from: ['apple', 'quarter', 'baked', 'compote'], to: 'sauce' },
};

export function canUse(state, tool) {
  if (tool === 'red') return ['apple', 'quarter'].includes(state.type) && state.color !== 'red';
  if (tool === 'green' || tool === 'yellow') return ['apple', 'quarter'].includes(state.type);
  return recipes[tool]?.from.includes(state.type) ?? false;
}

export function useTool(state, tool) {
  if (!canUse(state, tool)) return state;
  if (tool === 'red' || tool === 'green' || tool === 'yellow') return { ...state, color: tool };
  const recipe = recipes[tool];
  return { ...state, type: typeof recipe.to === 'string' ? recipe.to : recipe.to[state.type] };
}

export const results = {
  apple: { word: 'pomme.', name: 'Rouge à croquer', note: 'Une couleur, une découpe, une nouvelle saveur.' },
  quarter: { word: 'quartiers.', pronoun: 'vos', name: 'Quatre quartiers à croquer', note: 'Ajoutez une pâte pour préparer une tarte aux pommes.' },
  baked: { word: 'pomme cuite.', name: 'Tout juste sortie du four', note: 'Encore tiède… et si vous la mixiez en compote ?' },
  tart: { word: 'tarte.', name: 'Tarte aux pommes', note: 'Une seconde pâte ? Place à la tarte américaine.' },
  american: { word: 'apple pie.', name: 'Tarte aux pommes à l’américaine', note: 'Une croûte dorée, des pommes fondantes. À table !' },
  compote: { word: 'compote.', name: 'Compote maison', note: 'La douceur à la petite cuillère. Réinitialisez pour une nouvelle recette.' },
  cider: { word: 'cidre.', name: 'Une bouteille de cidre', note: 'La pomme se met en bouteille. Réinitialisez pour une nouvelle recette.' },
  dried: { word: 'pommes séchées.', pronoun: 'vos', name: 'Des pommes séchées à grignoter', note: 'De fines rondelles, doucement séchées.' },
  fritter: { word: 'beignet.', name: 'Un beignet aux pommes', note: 'Une croûte dorée, une pomme fondante.' },
  sauce: { word: 'sauce.', name: 'Sauce aux pommes', note: 'Une touche fruitée pour accompagner votre plat.' },
};

export function toolHint(state, tool) {
  if (tool === 'pastry') {
    if (state.type === 'quarter') return 'Ajouter une pâte : tarte aux pommes';
    if (state.type === 'tart') return 'Ajouter une seconde pâte : tarte à l’américaine';
    return state.type === 'american' ? 'Les deux pâtes sont déjà ajoutées' : 'Découpez d’abord la pomme en quartier';
  }
  if (canUse(state, tool)) return recipes[tool]?.label ?? `Peindre en ${{ red: 'rouge', green: 'vert', yellow: 'jaune' }[tool]}`;
  return 'Réinitialisez la pomme pour utiliser cet outil';
}
