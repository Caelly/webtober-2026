export const fighters = {
  tristepin: {name:'Tristepin',maxHp:144,damage:24},
  yugo: {name:'Yugo',maxHp:120,damage:20},
  ogrest: {name:'Ogrest',maxHp:380,damage:26},
};
export function shuffle(source,random=Math.random){
  const result=[...source];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function createCombat(random=Math.random){
  let state;
  const living=()=>['tristepin','yugo'].filter(id=>state.units[id].hp>0);
  function plan(){
    const roll=random(),targets=living();
    const target=targets[Math.min(targets.length-1,Math.floor(random()*targets.length))];
    const rage=Math.max(0,state.round-10)*2;
    if(roll<.27&&state.lastBossAction!=='guard')return {action:'guard',targets:[],damage:0};
    if(roll<.5)return {action:'sweep',targets:[...targets],damage:18+rage};
    return {action:roll>.82?'heavy':'strike',targets:[target],damage:(roll>.82?38:26)+rage};
  }
  function round(){
    state.round++;state.order=shuffle([...living(),'ogrest'],random);state.cursor=0;
  }
  function log(text){state.log.unshift(text);state.log=state.log.slice(0,12);}
  function finish(){
    if(state.units.ogrest.hp<=0)state.phase='won';
    else if(!living().length)state.phase='lost';
  }
  function advance(){
    finish();if(state.phase!=='playing'){state.intent=null;return;}
    state.cursor++;
    while(state.cursor<state.order.length&&state.units[state.order[state.cursor]].hp<=0)state.cursor++;
    if(state.cursor===state.order.length)round();
    // No future action is selected or exposed during a hero's turn.
    state.intent=state.order[state.cursor]==='ogrest'?plan():null;
  }
  function act(action){
    if(state.phase!=='playing')return null;
    const actor=state.order[state.cursor],unit=state.units[actor];
    const event={actor,action,hits:[]};
    if(actor==='ogrest'){
      if(action!==state.intent.action)return null;
      event.intent=structuredClone(state.intent);
      unit.guard=0;
      if(action==='guard'){
        // Two incoming hits, independent of shuffled round boundaries.
        unit.guard=2;log('Ogrest se retranche : ses deux prochains coups reçus sont réduits de 60 %.');
      }else{
        for(const id of state.intent.targets){
          const target=state.units[id];if(target.hp<=0)continue;
          const damage=target.dodge?0:state.intent.damage;
          target.hp=Math.max(0,target.hp-damage);event.hits.push({id,damage,dodged:target.dodge});
          log(damage?`Ogrest frappe ${fighters[id].name} : −${damage} PV.`:`${fighters[id].name} esquive le coup d’Ogrest !`);
        }
        // Dodge lasts through a defensive turn, but expires at the next offensive.
        for(const id of ['tristepin','yugo'])state.units[id].dodge=false;
      }
      state.lastBossAction=action;
    }else{
      if(!['attack','dodge','boost'].includes(action))return null;
      if(action==='dodge'&&(unit.dodge||unit.dodgeCooldown>0))return null;
      if(action==='boost'&&unit.boost)return null;
      if(unit.dodgeCooldown>0)unit.dodgeCooldown--;
      if(action==='attack'){
        const raw=Math.round(fighters[actor].damage*(unit.boost?2.2:1));
        const damage=Math.round(raw*(state.units.ogrest.guard>0?.4:1));
        if(state.units.ogrest.guard>0)state.units.ogrest.guard--;
        state.units.ogrest.hp=Math.max(0,state.units.ogrest.hp-damage);
        event.hits.push({id:'ogrest',damage,dodged:false});event.boosted=unit.boost;
        log(`${fighters[actor].name}${unit.boost?' libère son boost et':''} frappe Ogrest : −${damage} PV.`);
        unit.boost=false;
      }else if(action==='dodge'){
        unit.dodge=true;unit.dodgeCooldown=1;unit.boost=false;
        log(`${fighters[actor].name} prépare une esquive pour la prochaine offensive.`);
      }else{
        unit.boost=true;log(`${fighters[actor].name} se concentre : prochaine attaque ×2,2.`);
      }
    }
    state.lastEvent=event;advance();
    if(state.phase==='won')log('Ogrest est vaincu. La Confrérie a tenu bon !');
    if(state.phase==='lost')log('La Confrérie est tombée. Le chaos continue…');
    return event;
  }
  return {
    get state(){return structuredClone(state);},
    get active(){return state.phase==='playing'?state.order[state.cursor]:null;},
    reset(){
      state={phase:'playing',round:0,order:[],cursor:0,intent:null,lastBossAction:null,lastEvent:null,log:[],units:Object.fromEntries(Object.entries(fighters).map(([id,f])=>[id,{hp:f.maxHp,boost:false,dodge:false,dodgeCooldown:0,guard:0}]))};
      round();state.intent=this.active==='ogrest'?plan():null;log('Le sommet du Zinit tremble. Le combat commence.');return this;
    },
    act,
    bossTurn(){return this.active==='ogrest'?act(state.intent.action):null;},
  }.reset();
}
