import {createCombat} from './combat.js';
export function simulateBalance(count=1000){
 const results={};
 for(const policy of ['attack','tactical','random']){
  let value=739182,wins=0,rounds=0;
  const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  for(let run=0;run<count;run++){
   const game=createCombat(random);
   for(let t=0;t<200&&game.state.phase==='playing';t++){
    if(game.active==='ogrest'){game.bossTurn();continue;}
    const s=game.state,unit=s.units[game.active];let action='attack';
    if(policy==='tactical'){
     const bossPending=s.order.indexOf('ogrest')>=s.cursor;
     if(!unit.boost&&unit.hp<=60&&!unit.dodge&&!unit.dodgeCooldown&&bossPending)action='dodge';
     else if(!unit.boost&&s.units.ogrest.guard>0)action='boost';
    }else if(policy==='random'){
     const options=['attack'];if(!unit.boost)options.push('boost');if(!unit.dodge&&!unit.dodgeCooldown)options.push('dodge');action=options[Math.floor(random()*options.length)];
    }
    game.act(action);
   }
   wins+=game.state.phase==='won';rounds+=game.state.round;
  }
  results[policy]={wins,count,averageRounds:rounds/count};
 }
 return results;
}
