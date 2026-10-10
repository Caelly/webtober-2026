export const rules=Object.freeze({doorHp:200,crew:4,damage:40,openingChance:.18});
export function createSiege(random=Math.random){
 let state,pending;
 function reset(){state={phase:'playing',hp:rules.doorHp,crew:rules.crew,turn:0,last:null};pending=null;return snapshot();}
 function snapshot(){return Object.freeze({...state,last:state.last?Object.freeze({...state.last}):null,power:rules.damage,openingChance:rules.openingChance});}
 function begin(choice){
  if(state.phase!=='playing'||!['charge','wait'].includes(choice))return false;
  const chance=rules.openingChance;
  pending={choice,opened:random()<chance,power:rules.damage,revealed:false};state.phase='resolving';return true;
 }
 function reveal(){
  if(state.phase!=='resolving'||!pending)return null;
  if(pending.revealed)return Object.freeze({...state.last});
  pending.revealed=true;state.turn++;
  let damage=0;
  if(pending.choice==='charge'){
   if(pending.opened)state.crew=0;
   else {damage=Math.min(state.hp,pending.power);state.hp-=damage;}
  }
  state.last={choice:pending.choice,opened:pending.opened,damage,turn:state.turn,fatal:state.crew===0};
  return Object.freeze({...state.last});
 }
 function finish(){
  if(state.phase!=='resolving'||!pending?.revealed)return false;
  state.phase=state.crew===0?'lost':state.hp===0?'won':'playing';pending=null;return true;
 }
 reset();return {snapshot,begin,reveal,finish,reset};
}
