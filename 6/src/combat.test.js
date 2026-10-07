import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombat,fighters} from './combat.js';
import {simulateBalance} from './balance.js';
import {presentTurn} from './presentation.js';
function seed(value){return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};}
function stepTo(game,id){
 for(let i=0;game.active!==id&&game.state.phase==='playing'&&i<50;i++)game.active==='ogrest'?game.bossTurn():game.act('attack');
 assert.equal(game.active,id);
}
test('each round contains each living fighter once, and all six orders are reachable',()=>{
 const orders=new Set(),random=seed(42);for(let i=1;i<=200;i++){const g=createCombat(random);assert.deepEqual(new Set(g.state.order),new Set(Object.keys(fighters)));orders.add(g.state.order.join(','));}
 assert.equal(orders.size,6);
 const game=createCombat(seed(42));let round=1,actors=[];
 for(let i=0;i<9;i++){
  actors.push(game.active);game.active==='ogrest'?game.bossTurn():game.act('attack');
  if(game.state.round!==round){assert.equal(actors.length,3);assert.equal(new Set(actors).size,3);actors=[];round=game.state.round;}
 }
});
test('a boost cannot stack and doubles the next attack, with different hero strengths',()=>{
 const game=createCombat(seed(1));stepTo(game,'tristepin');game.act('boost');
 assert.equal(game.state.units.tristepin.boost,true);stepTo(game,'tristepin');
 const snapshot=game.state;assert.equal(game.act('boost'),null);assert.deepEqual(game.state,snapshot);
 const event=game.act('attack');assert.equal(event.boosted,true);assert.equal(game.state.units.tristepin.boost,false);
 assert.ok([53,21].includes(event.hits[0].damage));assert.equal(fighters.yugo.damage,20);
});
test('dodge persists through boss defense, evades the next offensive and cannot be spammed',()=>{
 // Force hero / hero / boss order and an initial guard followed by a sweep.
 const draws=[.99,.99,.1,.1,.99,.99,.4,.1];const game=createCombat(()=>draws.length?draws.shift():.99);
 game.act('dodge');assert.equal(game.state.units.tristepin.dodge,true);game.act('attack');game.bossTurn();
 assert.equal(game.state.units.tristepin.dodge,true);assert.equal(game.state.intent,null);
 stepTo(game,'tristepin');const before=game.state;assert.equal(game.act('dodge'),null);assert.deepEqual(game.state,before);
 game.act('boost');let dodgeEvent;
 for(let i=0;i<6&&!dodgeEvent;i++){
  if(game.active==='ogrest')dodgeEvent=game.bossTurn();else game.act('attack');
 }
 const hit=dodgeEvent.hits.find(h=>h.id==='tristepin');assert.ok(hit.dodged);assert.equal(hit.damage,0);assert.equal(game.state.units.tristepin.dodge,false);
});
test('guard protects two incoming hits and is replaced on the next boss turn',()=>{
 const game=createCombat(()=>.99);stepTo(game,'ogrest');
 const snapshot=game.state;assert.equal(game.act('guard'),null);assert.deepEqual(game.state,snapshot);
 const draws=[.99,.99,.1,.1];const guarded=createCombat(()=>draws.length?draws.shift():.99);
 guarded.act('attack');guarded.act('attack');guarded.bossTurn();assert.equal(guarded.state.units.ogrest.guard,2);
 assert.equal(guarded.act('attack').hits[0].damage,10);assert.equal(guarded.state.units.ogrest.guard,1);
 assert.equal(guarded.act('attack').hits[0].damage,8);assert.equal(guarded.state.units.ogrest.guard,0);
});
test('invalid actions never advance, terminal games ignore actions, and restart restores all HP',()=>{
 const game=createCombat(()=>.99),before=game.state;assert.equal(game.act('heal'),null);assert.deepEqual(game.state,before);
 for(let i=0;i<100&&game.state.phase==='playing';i++)game.active==='ogrest'?game.bossTurn():game.act('attack');
 assert.notEqual(game.state.phase,'playing');const terminal=game.state;assert.equal(game.act('attack'),null);assert.equal(game.bossTurn(),null);assert.deepEqual(game.state,terminal);
 game.reset();for(const [id,unit] of Object.entries(game.state.units))assert.equal(unit.hp,fighters[id].maxHp);
});
test('fallen heroes are skipped immediately, only living targets are planned, and the survivor can continue',()=>{
 const game=createCombat(()=>.99);let fallen=false;
 for(let i=0;i<100&&game.state.phase==='playing';i++){
  game.active==='ogrest'?game.bossTurn():game.act('attack');const s=game.state;
  if(s.units.yugo.hp===0){fallen=true;if(s.phase==='playing'){assert.notEqual(game.active,'yugo');assert.ok((s.intent?.targets??[]).every(id=>s.units[id].hp>0));}}
  for(const unit of Object.values(s.units))assert.ok(unit.hp>=0);
 }
 assert.ok(fallen);
});
test('snapshots cannot mutate the combat and the boss never guards twice in a row',()=>{
 const game=createCombat(seed(125));const copy=game.state;copy.units.ogrest.hp=0;assert.equal(game.state.units.ogrest.hp,380);
 let last;
 for(let i=0;i<90&&game.state.phase==='playing';i++){
  if(game.active==='ogrest'){const action=game.state.intent.action;assert.ok(!(last==='guard'&&action==='guard'));game.bossTurn();last=action;}else game.act('attack');
 }
});
test('using visible guard and current HP remains effective without knowing future boss actions',()=>{
 const result=simulateBalance();
 assert.ok(result.tactical.wins>550&&result.tactical.wins<850);
 assert.ok(result.attack.wins<650);
 assert.ok(result.tactical.wins>result.attack.wins+100);
 assert.ok(result.random.wins<result.attack.wins);
});
test('Ogrest chooses no future action before his turn and reveals no intent during hero turns',()=>{
 let draws=0;const game=createCombat(()=>{draws++;return .99;});
 assert.equal(draws,2);assert.equal(game.active,'tristepin');assert.equal(game.state.intent,null);
 game.act('attack');assert.equal(draws,2);assert.equal(game.active,'yugo');assert.equal(game.state.intent,null);
 game.act('attack');assert.equal(game.active,'ogrest');assert.equal(draws,4);assert.equal(game.state.intent.action,'heavy');
 const event=game.bossTurn();assert.equal(event.intent.action,'heavy');assert.equal(game.state.intent,null);
 assert.equal(game.active,'tristepin');assert.equal(draws,6);
});
test('the active fighter stays centered during the animation, with no boss information leaked before its displayed turn',()=>{
 const game=createCombat(()=>.99);game.act('attack');
 assert.deepEqual(presentTurn(game.state,game.active,true),{focus:'tristepin',bossMove:null});
 game.act('attack');
 assert.equal(game.active,'ogrest');assert.deepEqual(presentTurn(game.state,game.active,true),{focus:'yugo',bossMove:null});
 assert.equal(presentTurn(game.state,game.active,false).bossMove.action,'heavy');
 game.bossTurn();assert.equal(game.active,'tristepin');
 assert.equal(presentTurn(game.state,game.active,true).focus,'ogrest');
 assert.equal(presentTurn(game.state,game.active,true).bossMove.action,'heavy');
 assert.deepEqual(presentTurn(game.state,game.active,false),{focus:'tristepin',bossMove:null});
});
