import {words} from './words.js';
export const MAX_ATTEMPTS=5;
export function normalizeWord(value){return typeof value==='string'?value.toLowerCase().replaceAll('œ','oe').replaceAll('æ','ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s’'‐‑‒–—-]/gu,''):'';}
export function acceptedForms(entry){const forms=new Set();for(const word of [entry.word,...(entry.aliases||[])]){const normalized=normalizeWord(word);forms.add(normalized);if(!/[sxz]$/.test(normalized))forms.add(normalized+'s');}return forms;}
export function createPasswordGame({pool=words,random=Math.random}={}){
 if(!Array.isArray(pool)||!pool.length)throw new Error('La liste de mots est vide.');
 let deck=[],entry,lastId=null,state,seen;
 function refill(){deck=[...pool];for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}if(deck.length>1&&deck[deck.length-1].id===lastId)[deck[0],deck[deck.length-1]]=[deck[deck.length-1],deck[0]];}
 function start(){if(!deck.length)refill();entry=deck.pop();lastId=entry.id;seen=new Set();state={phase:'playing',attempts:0,history:[],clues:[entry.clues[0]]};}
 function snapshot(){return {phase:state.phase,attempts:state.attempts,remaining:MAX_ATTEMPTS-state.attempts,history:state.history.map(row=>({...row})),clues:[...state.clues],reveal:state.phase==='playing'?null:{word:entry.word,definition:entry.definition},deckRemaining:deck.length};}
 function guess(value){
  if(state.phase!=='playing')return {accepted:false,reason:'ended'};
  if(typeof value!=='string'||!value.trim())return {accepted:false,reason:'empty'};
  const display=value.trim();if(display.length>50||!/[\p{L}]/u.test(display)||!/^[\p{L}\p{M}\s’'‐‑‒–—-]+$/u.test(display))return {accepted:false,reason:'invalid'};
  const normalized=normalizeWord(display);if(seen.has(normalized))return {accepted:false,reason:'duplicate'};
  seen.add(normalized);state.attempts++;const correct=acceptedForms(entry).has(normalized);state.history.push({word:display,correct});
  if(correct)state.phase='won';else if(state.attempts===MAX_ATTEMPTS)state.phase='lost';else state.clues.push(entry.clues[state.attempts]);
  return {accepted:true,correct,phase:state.phase,remaining:MAX_ATTEMPTS-state.attempts};
 }
 function next(){if(state.phase==='playing')return false;start();return true;}
 start();return {guess,next,snapshot};
}
