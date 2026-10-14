import test from 'node:test';
import assert from 'node:assert/strict';
import {createRescue,beamPath} from './game.js';
const advance=(game,seconds)=>{for(let i=0;i<Math.ceil(seconds/.05);i++)game.update(.05);};
function harvest(game,count){let guard=0;const goal=game.snapshot().kills+count;while(game.snapshot().kills<goal&&guard++<10000){advance(game,.25);for(const enemy of game.snapshot().enemies)game.fire('left',enemy);}assert.equal(game.snapshot().kills,goal);}
test('un tir atteint sa cible une seule fois, recharge la jauge de 5 et respecte le délai de chaque main',()=>{
 const game=createRescue(()=>.5);game.start();advance(game,.4);const enemy=game.snapshot().enemies[0];assert.ok(enemy);assert.ok(game.fire('left',enemy));assert.equal(game.snapshot().kills,1);assert.equal(game.snapshot().charge,5);assert.equal(game.fire('left',enemy),false);assert.ok(game.fire('right',{x:.9,y:.1}));assert.equal(game.snapshot().kills,1);
 game.snapshot().enemies[0].hp=999;advance(game,.1);assert.equal(game.snapshot().enemies.length,0);
});
test('les lasers sont refusés sous 25 et 50 pour cent, sans dépenser de réserve',()=>{
 const game=createRescue(()=>.5);game.start();assert.equal(game.laser('single','left',{x:.5,y:.2}),false);assert.equal(game.snapshot().charge,0);
 harvest(game,5);assert.equal(game.snapshot().charge,25);advance(game,3);assert.equal(game.laser('double','left',{x:.05,y:.05}),false);assert.equal(game.snapshot().charge,25);
 assert.equal(game.laser('single','left',{x:.03,y:.03}),true);assert.equal(game.snapshot().charge,0);assert.equal(game.laser('single','right',{x:.5,y:.3}),false);
});
test('le double laser consomme exactement 50 et couvre plus large que le laser simple',()=>{
 const game=createRescue(()=>.5);game.start();harvest(game,10);assert.equal(game.snapshot().charge,50);advance(game,3);
 assert.ok(game.laser('double','left',{x:.03,y:.03}));assert.equal(game.snapshot().charge,0);
 const small=beamPath('single','left',{x:.5,y:.2}),large=beamPath('double','left',{x:.5,y:.2});assert.ok(large.width>small.width*2);assert.ok(small.end.y<=.04);assert.equal(large.start.x,.5);
});
test('les cinq vagues évacuent douze civils et la jauge reste bornée à 100',()=>{
 const game=createRescue(()=>.5);game.start();let guard=0;while(!['won','lost'].includes(game.snapshot().phase)&&guard++<10000){advance(game,.25);for(const enemy of game.snapshot().enemies)game.fire('left',enemy);}
 assert.equal(game.snapshot().phase,'won');assert.equal(game.snapshot().rescued,12);assert.equal(game.snapshot().wave,5);assert.equal(game.snapshot().kills,45);assert.equal(game.snapshot().charge,100);
 const before=game.snapshot();assert.equal(game.fire('left',{x:.5,y:.3}),false);assert.equal(game.laser('single','left',{x:.5,y:.3}),false);advance(game,10);assert.deepEqual(game.snapshot(),before);
});
test('les drones ignorés endommagent le convoi, provoquent la défaite et un redémarrage restaure toute la mission',()=>{
 const game=createRescue(()=>.5);game.start();let guard=0;while(game.snapshot().phase!=='lost'&&guard++<5000)game.update(.1);
 assert.equal(game.snapshot().phase,'lost');assert.equal(game.snapshot().shield,0);assert.equal(game.snapshot().charge,0);
 game.start();assert.equal(game.snapshot().phase,'playing');assert.equal(game.snapshot().shield,100);assert.equal(game.snapshot().kills,0);assert.equal(game.snapshot().wave,1);
});
test('aucune entrée invalide ou image de caméra ne peut modifier la réserve ou produire un tir hors partie',()=>{
 const game=createRescue(()=>.5);assert.equal(game.fire('left',{x:.5,y:.5}),false);game.start();assert.equal(game.fire('unknown',{x:.5,y:.5}),false);assert.equal(game.fire('left',{x:NaN,y:0}),false);assert.equal(game.laser('other','left',{x:.5,y:.5}),false);assert.equal(game.laser('single','left',null),false);game.update(NaN);assert.equal(game.snapshot().elapsed,0);
});

test('un laser détruit en une frappe un drone blindé à trois PV et crédite sa destruction',()=>{
 const game=createRescue(()=>0);game.start();harvest(game,12);assert.equal(game.snapshot().charge,60);advance(game,3.1);
 const heavy=game.snapshot().enemies.find(enemy=>enemy.kind==='heavy');assert.ok(heavy);assert.equal(heavy.hp,3);
 assert.ok(game.laser('single','left',heavy));assert.equal(game.snapshot().kills,13);assert.equal(game.snapshot().charge,40);
 advance(game,.1);assert.equal(game.snapshot().enemies.some(enemy=>enemy.id===heavy.id),false);
});

test('survoler un drone blindé le détruit instantanément et ne crédite chaque cible qu’une seule fois',()=>{
 const game=createRescue(()=>0);game.start();harvest(game,12);advance(game,3.1);const enemy=game.snapshot().enemies.find(e=>e.kind==='heavy');assert.equal(enemy.hp,3);
 const before=game.snapshot();assert.ok(game.touch('left',enemy));assert.equal(game.snapshot().kills,before.kills+1);assert.equal(game.snapshot().charge,before.charge+5);
 assert.equal(game.touch('left',enemy),false);assert.equal(game.touch('right',enemy),false);assert.equal(game.snapshot().charge,before.charge+5);
});
test('un balayage rapide détruit les cibles traversées entre deux positions de l’index',()=>{
 const game=createRescue(()=>.5);game.start();advance(game,1.4);const enemies=game.snapshot().enemies;assert.ok(enemies.length>=2);
 const from={x:.1,y:.11},to={x:.9,y:.11};assert.equal(game.touch('left',from),false);assert.equal(game.touch('left',to),false);
 assert.ok(game.touch('left',to,from));assert.equal(game.snapshot().kills,enemies.length);assert.equal(game.snapshot().charge,enemies.length*5);
});
test('aucun survol ne détruit de cible avant la partie ou avec des coordonnées invalides',()=>{
 const game=createRescue(()=>.5);assert.equal(game.touch('left',{x:.5,y:.2}),false);game.start();advance(game,.4);const target=game.snapshot().enemies[0];
 assert.equal(game.touch('other',target),false);assert.equal(game.touch('left',{x:NaN,y:.2}),false);assert.equal(game.touch('left',target,{x:NaN,y:0}),false);assert.equal(game.snapshot().kills,0);
});
