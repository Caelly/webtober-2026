import {characters} from '../../src/characters.js';

// A named roster, not repeated costumes or generated identities.
const names=`Mickey|Minnie|Donald|Daisy|Dingo|Pluto|Stitch|Lilo|Elsa|Anna|Olaf|Belle|La Bête|Ariel|Raiponce|Aladdin|Jasmine|Le Génie|Mulan|Vaiana|Maui|Clochette|Peter Pan|Pinocchio|Winnie|Tigrou|Porcinet|Bourriquet|Simba|Nala|Timon|Pumbaa|Ursula|Maléfique|Blanche-Neige|Cendrillon|Alice|Chat du Cheshire|Dumbo|Bambi|Kristoff|Sven|Hans|Marshmallow|Bruni|Pascal|Maximus|Flynn Rider|Mère Gothel|Gaston|Lefou|Lumière|Big Ben|Mrs Samovar|Zip|Sébastien|Polochon|Eurêka|Triton|Éric|Jafar|Iago|Abu|Rajah|Mushu|Cri-Kee|Li Shang|Hei Hei|Pua|Te Fiti|Jiminy Cricket|Gepetto|Figaro|Cleo|Fée Bleue|Capitaine Crochet|Monsieur Mouche|Wendy|Tic|Tac|Picsou|Riri|Fifi|Loulou|Darkwing Duck|Max Goof|Pat Hibulaire|Oswald|Scar|Mufasa|Rafiki|Zazu|Baloo|Bagheera|Mowgli|Shere Khan|Robin des Bois|Judy Hopps|Nick Wilde|Hadès`.split('|');
export const roster=names.map(name=>{
  const character=characters.find(c=>c.name===name&&c.universe==='Disney');
  if(!character)throw new Error(`Peluche Disney absente : ${name}`);
  return character;
});
if(roster.length!==100||new Set(roster.map(c=>c.id)).size!==100)throw new Error('La collection doit contenir 100 personnages distincts.');
export const rarities=[
  {id:'normal',name:'Originale',color:'#8b7ca7',chance:1-1/100-1/50-1/30},
  {id:'bronze',name:'Bronze',color:'#b87d52',chance:1/30},
  {id:'silver',name:'Argentée',color:'#93a5b0',chance:1/50},
  {id:'gold',name:'Dorée',color:'#d6ac48',chance:1/100},
];
export const storageKey='webtober-2026-miniature-claw-v1';
const validIds=new Set(roster.map(c=>c.id));
export function rarityAt(value){
  if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Le tirage doit être dans [0, 1).');
  if(value<1/100)return 'gold';
  if(value<1/100+1/50)return 'silver';
  if(value<1/100+1/50+1/30)return 'bronze';
  return 'normal';
}
export function drawReward(random=Math.random){
  const rarity=rarityAt(random()),value=random();
  if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Personnage : tirage invalide.');
  return {character:roster[Math.floor(value*roster.length)],rarity};
}
export function restoreCollection(raw){
  const counts={};
  try{
    const data=JSON.parse(raw);
    if(data?.version!==1||!data.counts||typeof data.counts!=='object')return counts;
    for(const [key,count] of Object.entries(data.counts)){
      const [id,rarity]=key.split(':');
      if(validIds.has(id)&&rarities.some(r=>r.id===rarity)&&Number.isSafeInteger(count)&&count>0)counts[key]=count;
    }
  }catch{}
  return counts;
}
export function serializeCollection(counts){return JSON.stringify({version:1,counts});}
export function addReward(counts,reward){
  if(!validIds.has(reward.character?.id)||!rarities.some(r=>r.id===reward.rarity))throw new Error('Récompense inconnue.');
  const key=`${reward.character.id}:${reward.rarity}`;
  counts[key]=Math.min(Number.MAX_SAFE_INTEGER,(counts[key]||0)+1);
  return counts[key];
}
export function collectionStats(counts){
  const entries=Object.entries(counts).filter(([,n])=>n>0);
  return {characters:new Set(entries.map(([key])=>key.split(':')[0])).size,variants:entries.length,total:entries.reduce((n,[,v])=>n+v,0),duplicates:entries.reduce((n,[,v])=>n+Math.max(0,v-1),0)};
}
export function nearestCapsule(capsules,x,z,radius=.25){
  let best=null,distance=radius;
  for(const capsule of capsules){const d=Math.hypot(capsule.x-x,capsule.z-z);if(d<distance){best=capsule;distance=d;}}
  return best;
}
