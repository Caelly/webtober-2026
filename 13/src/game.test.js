import test from 'node:test';
import assert from 'node:assert/strict';
import {createBalance,RULES} from './game.js';
const rng=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function correction(state){const force=2*state.angle+3*state.angularVelocity+.1*state.x+.4*state.velocity;return Math.abs(force)<.1?0:Math.sign(force);}
function controlUntil(game,time){while(game.snapshot().phase==='playing'&&game.snapshot().elapsed<time)game.update(.12,correction(game.snapshot()));}
test('le service démarre avec un verre et chaque direction déplace réellement le plateau',()=>{
 const left=createBalance(()=>.5),right=createBalance(()=>.5);left.start();right.start();left.update(.2,-1);right.update(.2,1);
 assert.equal(left.snapshot().glasses,1);assert.ok(left.snapshot().x<0);assert.ok(right.snapshot().x>0);assert.ok(right.snapshot().angle<left.snapshot().angle);
 const copy=left.snapshot();copy.x=100;assert.notEqual(left.snapshot().x,100);
});
test('sans correction la pile tombe, les verres éclatent une seule fois et le temps de service se fige',()=>{
 const game=createBalance(()=>.5);game.start();let guard=0;while(game.snapshot().phase==='playing'&&guard++<2000)game.update(.05,0);
 const fallen=game.snapshot();assert.equal(fallen.phase,'falling');assert.ok(fallen.elapsed>2&&fallen.elapsed<12);assert.equal(fallen.fallen.length,fallen.glasses);
 while(game.snapshot().phase==='falling')game.update(.05,0);
 assert.equal(game.snapshot().phase,'lost');assert.equal(game.snapshot().elapsed,fallen.elapsed);assert.ok(game.snapshot().fallen.every(glass=>glass.broken));
 const breaks=game.drain().filter(event=>event.type==='break');assert.equal(breaks.length,fallen.glasses);assert.equal(new Set(breaks.map(event=>event.index)).size,fallen.glasses);
 const terminal=game.snapshot();game.update(.25,1);assert.deepEqual(game.snapshot(),terminal);
});
test('la pile croît toutes les cinq secondes et une commande digitale gagne avec neuf verres',()=>{
 const game=createBalance(rng(3));game.start();controlUntil(game,5.1);assert.equal(game.snapshot().glasses,2);controlUntil(game,10.1);assert.equal(game.snapshot().glasses,3);controlUntil(game,46);
 const state=game.snapshot();assert.equal(state.phase,'won');assert.equal(state.elapsed,45);assert.equal(state.glasses,9);assert.equal(state.stack.length,9);
 const additions=game.drain().filter(event=>event.type==='glass');assert.deepEqual(additions.map(event=>event.count),[2,3,4,5,6,7,8,9]);assert.ok(state.stack.every(glass=>Number.isFinite(glass.x)&&Number.isFinite(glass.y)&&Number.isFinite(glass.angle)));
 const terminal=game.snapshot();game.update(.2,-1);assert.deepEqual(game.snapshot(),terminal);
});
test('des corrections espacées de 120 ms permettent de terminer des services aux perturbations différentes',()=>{
 for(let seed=1;seed<=20;seed++){const game=createBalance(rng(seed));game.start();controlUntil(game,46);assert.equal(game.snapshot().phase,'won',`service ${seed}`);}
});
test('la pause fige la pile et les arrivées, puis reprend la même physique',()=>{
 const game=createBalance(rng(4));game.start();controlUntil(game,4.9);assert.ok(game.pause());const paused=game.snapshot();game.update(20,1);assert.deepEqual(game.snapshot(),paused);assert.equal(game.pause(),false);assert.ok(game.resume());assert.equal(game.snapshot().phase,'playing');assert.equal(game.snapshot().elapsed,paused.elapsed);assert.equal(game.snapshot().x,paused.x);assert.equal(game.resume(),false);
 controlUntil(game,5.2);assert.equal(game.snapshot().glasses,2);
});
test('une pile plus haute peut tomber, la chute est suspendue en pause et toutes les pièces arrivent au sol',()=>{
 const game=createBalance(rng(7));game.start();controlUntil(game,20.1);assert.equal(game.snapshot().glasses,5);
 while(game.snapshot().phase==='playing')game.update(.05,1);assert.equal(game.snapshot().phase,'falling');assert.ok(Math.abs(game.snapshot().x)<=RULES.travel);
 game.pause();const frozen=game.snapshot();game.update(.25);assert.deepEqual(game.snapshot(),frozen);game.resume();while(game.snapshot().phase==='falling')game.update(.05);
 assert.equal(game.snapshot().phase,'lost');assert.ok(game.snapshot().fallen.every(glass=>glass.broken&&glass.y===RULES.floor));
 game.reset();assert.equal(game.snapshot().phase,'ready');assert.equal(game.snapshot().fallen.length,0);assert.equal(game.snapshot().elapsed,0);assert.equal(game.snapshot().glasses,1);
});
test('le pas physique fixe donne le même résultat aux cadences 30 et 120 images par seconde',()=>{
 const a=createBalance(rng(9)),b=createBalance(rng(9));a.start();b.start();for(let i=0;i<15;i++)a.update(1/30,1);for(let i=0;i<60;i++)b.update(1/120,1);
 for(const key of ['elapsed','x','velocity','angle','angularVelocity'])assert.ok(Math.abs(a.snapshot()[key]-b.snapshot()[key])<1e-10,key);
});
test('les durées invalides et les commandes hors partie ne changent pas le jeu',()=>{
 const game=createBalance(()=>.5),ready=game.snapshot();game.update(.2,1);assert.deepEqual(game.snapshot(),ready);assert.equal(game.pause(),false);assert.equal(game.resume(),false);game.start();const initial=game.snapshot();for(const dt of [NaN,Infinity,0,-1])game.update(dt,1);assert.deepEqual(game.snapshot(),initial);
});
