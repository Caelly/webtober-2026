import {comicsCatalog} from './catalog-comics.js';
import {animationCatalog} from './catalog-animation.js';
import {pokemonCatalog} from './catalog-pokemon.js';
import {animeCatalog} from './catalog-anime.js';
import {worldsCatalog} from './catalog-worlds.js';

export const palette={black:'#252932',white:'#eee9dd',cream:'#e7d8b8',pale:'#e4d6c9',tan:'#c9a278',brown:'#765039',dark:'#64432f',auburn:'#9b4b30',burgundy:'#823546',red:'#bd3e42',pink:'#d594af',purple:'#826297',lavender:'#ab98bf',navy:'#354d75',blue:'#477db4',cyan:'#7abcca',teal:'#599c99',green:'#64935e',olive:'#839065',lime:'#a5bc62',gold:'#d4b15a',yellow:'#e1c660',orange:'#d58a4a',silver:'#bec3c6',gray:'#8f999f',ice:'#a9d7db'};

export const catalogGroups=[...comicsCatalog,...animationCatalog,...pokemonCatalog,...animeCatalog,...worldsCatalog];
palette.blonde='#ddbd78';
palette.amber='#ca9a52';
export const catalogCharacters=catalogGroups.flatMap(([universe,rows])=>rows.trim().split('\n').filter(Boolean).map(row=>{
  const [name,description]=row.trim().split('|');
  const [silhouette,hair,clothing,outfit,...features]=description.split(/\s+/);
  if(!palette[hair]||!palette[outfit])throw new Error(`Palette manquante : ${name}`);
  const skinFeature=features.find(f=>f.startsWith('skin:'))?.slice(5);
  const coloredSkin=silhouette==='bald'&&!['black','brown','blonde','silver','gray','tan','pale','white'].includes(hair);
  const skin=palette[skinFeature]||(clothing==='animal'||coloredSkin?palette[hair]:'#e7bc99');
  return {name,universe,skin,hair:palette[hair],outfit:palette[outfit],kind:'catalog',design:{silhouette,clothing,features}};
}));
