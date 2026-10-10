const themes = [
  'Pomme', 'Relique', 'Miniature', 'Cactus', 'Gifle', 'Ogre', 'Panique',
  'Puant', 'Bélier', 'Mystique', 'Sauvetage', 'Lancer', 'Fragile', 'Dame',
  'Hourra', 'Dégingandé', 'Bidule', 'Sans ailes', 'Confus', 'Salon', 'Héros',
  'Balise', 'Chic', 'Cuire', 'Fracture', 'Fermeture éclair', 'Stupide',
  'Trophée', 'Défense', 'Biscuit', 'Flexion',
];

// Unlock a day when its numbered page is ready to publish.
export const days = themes.map((theme, index) => ({
  number: index + 1,
  theme,
  unlocked: index < 9,
  description: index === 0 ? 'Une pomme, mille façons' : index === 1 ? 'Vraies ou inventées : des fins improbables' : index === 2 ? 'Deux petits mondes à explorer' : index === 3 ? 'Un piquant de douceur' : index === 4 ? 'Le premier qui rit a perdu' : index === 5 ? 'Deux héros face au chaos' : index === 6 ? 'Dix verrous. Une minute.' : index === 7 ? 'Une goutte, toute une signature' : index === 8 ? 'Un coup de trop, et tout bascule' : '',
}));
