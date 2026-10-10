import test from 'node:test';
import assert from 'node:assert/strict';
import {createSiege,rules} from './game.js';
const play=(game,choice)=>{assert.ok(game.begin(choice));const result=game.reveal();assert.ok(game.finish());return result;};
test('une charge sur une porte fermée enlève des PV, sans blesser les porteurs',()=>{
 const game=createSiege(()=>.99);const result=play(game,'charge');
 assert.equal(result.opened,false);assert.equal(result.damage,40);assert.equal(game.snapshot().hp,160);assert.equal(game.snapshot().crew,4);
});
test('une ouverture pendant la charge tue toute l’équipe et ne blesse pas la porte',()=>{
 const game=createSiege(()=>0);const result=play(game,'charge');
 assert.ok(result.fatal);assert.equal(game.snapshot().phase,'lost');assert.equal(game.snapshot().crew,0);assert.equal(game.snapshot().hp,200);
 assert.equal(game.begin('wait'),false);
});
test('attendre reste sûr sans modifier les PV, les dégâts ou la probabilité d’ouverture',()=>{
 for(const roll of [0,.99]){const game=createSiege(()=>roll);for(let i=0;i<10;i++){
  const result=play(game,'wait');assert.equal(result.damage,0);assert.equal(game.snapshot().crew,4);assert.equal(game.snapshot().hp,200);assert.equal(game.snapshot().power,40);assert.equal(game.snapshot().openingChance,.18);
 }}
 const game=createSiege(()=>.99);for(let i=0;i<10;i++)play(game,'wait');
 play(game,'charge');assert.equal(game.snapshot().hp,160);assert.equal(game.snapshot().power,40);
});
test('les deux réponses adverses restent accessibles avec la même probabilité après une attente',()=>{
 const closed=createSiege(()=>.18);assert.equal(play(closed,'wait').opened,false);
 const open=createSiege(()=>.18-Number.EPSILON);assert.equal(play(open,'wait').opened,true);
 assert.equal(play(open,'charge').opened,true);
 const unchanged=createSiege(()=>.25);play(unchanged,'wait');play(unchanged,'wait');assert.equal(unchanged.snapshot().openingChance,.18);assert.equal(play(unchanged,'charge').opened,false);
});
test('la défense reste cachée avant la révélation et un tour ne se résout jamais deux fois',()=>{
 let draws=0;const game=createSiege(()=>{draws++;return .99;});
 assert.equal(draws,0);assert.equal(game.begin('unknown'),false);assert.ok(game.begin('charge'));assert.equal(draws,1);
 assert.equal(game.snapshot().last,null);assert.equal('opened' in game.snapshot(),false);assert.equal(game.finish(),false);assert.equal(game.begin('wait'),false);
 const result=game.reveal();assert.deepEqual(game.reveal(),result);assert.equal(game.snapshot().hp,160);assert.equal(game.snapshot().turn,1);
 assert.throws(()=>{game.snapshot().hp=0;},TypeError);assert.ok(game.finish());assert.equal(game.reveal(),null);assert.equal(game.finish(),false);
});
test('cinq charges réussies font céder la porte, puis un nouveau siège remet tout à zéro',()=>{
 const game=createSiege(()=>.99);
 for(let i=0;i<5;i++){play(game,'wait');play(game,'charge');}
 assert.equal(game.snapshot().hp,0);assert.equal(game.snapshot().phase,'won');assert.equal(game.snapshot().last.damage,40);
 assert.equal(game.begin('charge'),false);game.reset();assert.equal(game.snapshot().hp,rules.doorHp);assert.equal(game.snapshot().crew,4);assert.equal(game.snapshot().turn,0);assert.equal(game.snapshot().last,null);
});
