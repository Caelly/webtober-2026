export const initialState = () => ({ type: 'apple', color: 'red' });

export const recipes = {
  knife: { label: 'Couper en quartier', from: ['apple'], to: 'quarter' },
  oven: { label: 'Cuire au four', from: ['apple'], to: 'baked' },
  pastry: { label: 'Ajouter une pâte feuilletée', from: ['quarter', 'tart'], to: { quarter: 'tart', tart: 'american' } },
  blender: { label: 'Mixer en compote', from: ['apple', 'quarter', 'baked'], to: 'compote' },
  press: { label: 'Presser en jus de pomme', from: ['apple', 'quarter'], to: 'juice' },
  fermentation: { label: 'Fermenter le jus en cidre', from: ['juice'], to: 'cider' },
  dehydrator: { label: 'Déshydrater en pommes séchées', from: ['apple', 'quarter'], to: 'dried' },
  fryer: { label: 'Frire en beignet', from: ['apple', 'quarter'], to: 'fritter' },
  saucepan: { label: 'Préparer une sauce aux pommes', from: ['apple', 'quarter', 'baked', 'compote'], to: 'sauce' },
  meat: { label: 'Ajouter de la viande', from: ['apple', 'quarter', 'baked', 'compote'], to: 'boudin' },
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
  apple: { word: 'pomme.', name: 'Rouge à croquer' },
  quarter: { word: 'quartiers.', pronoun: 'vos', name: 'Quatre quartiers à croquer' },
  baked: { word: 'pomme cuite.', name: 'Tout juste sortie du four' },
  tart: { word: 'tarte.', name: 'Tarte aux pommes' },
  american: { word: 'apple pie.', name: 'Tarte aux pommes à l’américaine' },
  compote: { word: 'compote.', name: 'Compote maison' },
  juice: { word: 'jus de pomme.', name: 'Pur jus de pomme en brique' },
  cider: { word: 'cidre.', name: 'Une bouteille de cidre' },
  dried: { word: 'pommes séchées.', pronoun: 'vos', name: 'Des pommes séchées à grignoter' },
  fritter: { word: 'beignet.', name: 'Un beignet aux pommes' },
  sauce: { word: 'sauce.', name: 'Sauce aux pommes' },
  boudin: { word: 'boudin aux pommes.', name: 'Boudin noir aux pommes dorées' },
};
