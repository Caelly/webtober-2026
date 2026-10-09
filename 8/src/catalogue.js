// Note lists are selected from the linked official pages, not complete formulas.
// The workshop groups each material once; its position can vary by fragrance.
export const layers = [
  {id:'head',name:'Tête',subtitle:'La première impression',description:'Vives et légères, elles ouvrent le parfum.',number:'01'},
  {id:'heart',name:'Cœur',subtitle:'Toute la personnalité',description:'Elles se dévoilent et donnent le caractère.',number:'02'},
  {id:'base',name:'Fond',subtitle:'Ce qui reste sur la peau',description:'Profondes et enveloppantes, elles prolongent le sillage.',number:'03'},
];
const group = (layer, entries) => entries.map(([id,name,facet,color,icon])=>({id,name,facet,color,icon,layer}));
export const notes = [
  ...group('head',[
    ['bergamot','Bergamote','Zestée','#b4b768','citrus'],['orange','Orange','Lumineuse','#d99950','citrus'],
    ['grapefruit','Pamplemousse','Pétillant','#df9e88','citrus'],['quince','Coing','Fruité','#b6b75f','fruit'],
    ['pear','Poire','Juteuse','#b1b986','pear'],['cherry','Cerise noire','Veloutée','#8c394d','cherry'],
    ['almond','Amande','Douce-amère','#bca084','seed'],['saffron','Safran','Épicé','#b36a45','spice'],
    ['aldehydes','Aldéhydes','Aériens','#aac0b7','spark'],['coffee','Café','Torréfié','#8c6651','seed'],
    ['fig','Figue','Verte','#a28799','fruit'],['cassis','Cassis','Acidulé','#8a718b','berries'],
  ]),
  ...group('heart',[
    ['jasmine','Jasmin','Solaire','#c5b979','flower'],['rose','Rose','Délicate','#bf7d8e','rose'],
    ['iris','Iris','Poudré','#a39ebc','flower'],['whiteflowers','Fleurs blanches','Crémeuses','#b4b497','flower'],
    ['lavender','Lavande','Aromatique','#9c8eb5','sprig'],['pepper','Poivre','Vibrant','#aa846e','berries'],
    ['anise','Badiane','Anisée','#a88465','spice'],['freesia','Freesia','Transparent','#c2b578','sprig'],
    ['tuberose','Tubéreuse','Opulente','#c0b796','sprig'],['praline','Praline','Gourmande','#b49368','seed'],
    ['ylang','Ylang-ylang','Exotique','#d1b26b','flower'],
  ]),
  ...group('base',[
    ['vanilla','Vanille','Enveloppante','#c6a16c','pod'],['patchouli','Patchouli','Terreux','#8e9d72','leaf'],
    ['vetiver','Vétiver','Racinaire','#aaa17b','sprig'],['cedar','Cèdre','Sec','#a88462','wood'],
    ['sandalwood','Santal','Crémeux','#bf9f7b','wood'],['tonka','Fève tonka','Ambrée','#9d7c65','seed'],
    ['cocoa','Cacao','Chocolaté','#986d57','seed'],['balsam','Baume du Pérou','Balsamique','#b78862','drop'],
    ['ambergris','Accord ambre gris','Minéral','#a3b8ae','stone'],['ambroxan','Ambroxan','Boisé ambré','#b9b6a1','stone'],
    ['musk','Musc blanc','Cotonneux','#b7bbb6','spark'],
  ]),
];
const perfume = (id,name,brand,type,family,ids,source) => ({id,name,brand,type,family,notes:ids.split(' '),source});
export const perfumes = [
  perfume('shalimar','Shalimar','Guerlain','Eau de parfum','Ambré · poudré','bergamot iris vanilla','https://www.guerlain.com/sg/en-sg/p/shalimar-eau-de-parfum-P011355.html'),
  perfume('sauvage','Sauvage','Dior','Eau de parfum','Frais · épicé · ambré','bergamot pepper lavender anise vanilla ambroxan','https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-Y0785220.html'),
  perfume('coco','Coco Mademoiselle','Chanel','Eau de parfum','Floral · boisé · ambré','orange jasmine rose patchouli vetiver','https://www.chanel.com/ie/fragrance/p/116520/coco-mademoiselle-eau-de-parfum-spray/'),
  perfume('chance','Chance Eau Tendre','Chanel','Eau de parfum','Fruité · floral','grapefruit quince jasmine rose musk','https://www.chanel.com/us/fragrance/p/126250/chance-eau-tendre-eau-de-parfum-spray/'),
  perfume('no5','N°5','Chanel','Eau de parfum','Floral · aldéhydé','aldehydes jasmine rose ylang vanilla','https://www.chanel.com/us/fragrance/p/125530/n5-eau-de-parfum-spray/'),
  perfume('pear','English Pear & Freesia','Jo Malone London','Cologne','Fruité · floral','pear freesia patchouli','https://www.jomalone.com/our-stories/an-ode-to-english-pear-freesia'),
  perfume('cherry','Lost Cherry','Tom Ford','Eau de parfum','Fruité · gourmand','cherry almond rose jasmine balsam tonka sandalwood vetiver cedar','https://www.tomfordbeauty.com/products/lost-cherry-eau-de-parfum'),
  perfume('goodgirl','Good Girl','Carolina Herrera','Eau de parfum','Floral · gourmand','almond coffee jasmine tuberose tonka cocoa','https://www.carolinaherrera.com/us/en/p-fragrance/good-girl-eau-de-parfum'),
  perfume('opium','Black Opium','Yves Saint Laurent','Eau de parfum','Café · floral · gourmand','coffee whiteflowers vanilla','https://www.yslbeautyus.com/fragrance/womens-fragrances/black-opium/black-opium-eau-de-parfum/252YSL.html'),
  perfume('angel','Angel','Mugler','Eau de parfum','Ambré · gourmand','bergamot praline patchouli vanilla','https://www.mugler.com/fragrance/womens-fragrances/angel/angel-eau-de-parfum-perfume/M010101003.html'),
  perfume('baccarat','Baccarat Rouge 540','Maison Francis Kurkdjian','Eau de parfum','Floral · boisé · ambré','saffron jasmine ambergris ambroxan','https://www.franciskurkdjian.com/us-en/p/baccarat-rouge-540-eau-de-parfum-RA12231.html'),
  perfume('iris','La Vie est Belle Iris Absolu','Lancôme','Eau de parfum','Vert · floral · poudré','fig cassis iris patchouli','https://www.lancome.fr/outlet/la-vie-est-belle-iris-absolu/3614273922975.html'),
];
export const byId = new Map(notes.map(note=>[note.id,note]));
export function candidates(selection) {
  if(selection.some(id=>!byId.has(id)))return [];
  return perfumes.filter(perfume=>selection.every(id=>perfume.notes.includes(id)))
    .sort((a,b)=>a.notes.length-b.notes.length||a.id.localeCompare(b.id));
}
export function canAdd(selection,id) {return byId.has(id)&&!selection.includes(id)&&candidates([...selection,id]).length>0;}
export function toggleNote(selection,id) {
  if(selection.includes(id))return selection.filter(value=>value!==id);
  return canAdd(selection,id)?[...selection,id]:[...selection];
}
export function ready(selection) {return layers.every(layer=>selection.some(id=>byId.get(id)?.layer===layer.id))&&candidates(selection).length>0;}
export function bottleColor(selection) {
  if(!selection.length)return '#d7bd7e';
  const colors=selection.map(id=>byId.get(id)?.color).filter(Boolean);
  if(!colors.length)return '#d7bd7e';
  const channels=[1,3,5].map(offset=>Math.round(colors.reduce((sum,color)=>sum+parseInt(color.slice(offset,offset+2),16),0)/colors.length));
  return '#'+channels.map(channel=>channel.toString(16).padStart(2,'0')).join('');
}
