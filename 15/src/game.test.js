import test from 'node:test';
import assert from 'node:assert/strict';
import {createCleanup,COUNT,inBin} from './game.js';
const bin={x:.75,y:.6,width:.2,height:.3};
function advance(g,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.update(1/120);}
function trash(g,id,owner=1){assert.equal(g.grab(id,owner),true);g.move(id,.85,.74,owner);return g.release(id,bin,owner);}

test('une explosion crée soixante confettis distincts puis les fait tomber lentement sans sortir de la scène',()=>{
 const g=createCleanup(),initial=g.snapshot();assert.equal(initial.phase,'burst');assert.equal(initial.total,COUNT);assert.equal(new Set(initial.pieces.map(p=>p.id)).size,COUNT);assert.ok(initial.pieces.every(p=>p.vy<0));advance(g,2);assert.equal(g.snapshot().phase,'cleaning');const a=g.snapshot();advance(g,1);const b=g.snapshot();for(let i=0;i<COUNT;i++)assert.ok(Math.abs(b.pieces[i].y-a.pieces[i].y)<.1);advance(g,60);const s=g.snapshot();assert.equal(s.remaining,COUNT);assert.ok(s.pieces.every(p=>p.kind==='resting'&&p.x>=.025&&p.x<=.975&&p.y<=.92));
});
test('déposer un confetti dans la poubelle le compte une seule fois et le fait disparaître',()=>{
 const g=createCleanup();assert.equal(trash(g,0),true);assert.equal(g.snapshot().collected,1);assert.equal(g.release(0,bin,1),false);assert.equal(g.grab(0,2),false);advance(g,.4);assert.equal(g.snapshot().pieces[0].kind,'collected');assert.equal(g.drain().filter(e=>e.type==='collect').length,1);
});
test('un lâcher hors de la poubelle reprend une chute lente, sans remettre le score à zéro',()=>{
 const g=createCleanup();trash(g,0);g.grab(1,2);g.move(1,.3,.4,2);assert.equal(g.release(1,bin,2),false);assert.equal(g.snapshot().collected,1);assert.equal(g.snapshot().pieces[1].kind,'falling');advance(g,1);assert.ok(g.snapshot().pieces[1].y>.4);assert.equal(g.grab(1,3),true);
});
test('des pointeurs différents peuvent saisir deux morceaux sans se voler leur prise',()=>{
 const g=createCleanup();assert.equal(g.grab(0,11),true);assert.equal(g.grab(0,12),false);assert.equal(g.grab(1,12),true);assert.equal(g.move(0,.9,.8,12),false);assert.equal(g.release(0,bin,12),false);g.move(0,.85,.7,11);g.move(1,.82,.75,12);g.release(0,bin,11);g.release(1,bin,12);assert.equal(g.snapshot().collected,2);
});
test('une annulation ne jette pas un morceau, même au-dessus de la poubelle',()=>{
 const g=createCleanup();g.grab(0,4);g.move(0,.85,.7,4);assert.equal(g.cancel(0,4),true);assert.equal(g.snapshot().collected,0);assert.equal(g.snapshot().pieces[0].kind,'falling');assert.equal(g.cancel(0,4),false);
});
test('la sélection permet de jeter chaque confetti au clavier et le dernier termine le nettoyage',()=>{
 const g=createCleanup({count:3});assert.equal(g.putSelected(bin),false);for(let id=0;id<3;id++){assert.equal(g.select(id),true);assert.equal(g.snapshot().selected,id);assert.equal(g.putSelected(bin),true);}assert.equal(g.snapshot().phase,'won');assert.equal(g.snapshot().remaining,0);assert.equal(g.drain().filter(e=>e.type==='won').length,1);advance(g,.5);assert.ok(g.snapshot().pieces.every(p=>p.kind==='collected'));assert.equal(g.select(0),false);g.reset();assert.equal(g.snapshot().collected,0);assert.equal(g.snapshot().remaining,3);
});
test('la sélection est unique et peut être changée ou annulée',()=>{
 const g=createCleanup();g.select(0);g.select(1);assert.equal(g.snapshot().pieces[0].kind,'falling');assert.equal(g.snapshot().pieces[1].kind,'selected');g.select(1);assert.equal(g.snapshot().selected,null);assert.equal(g.snapshot().pieces[1].kind,'falling');
});
test('la pause fige la chute et annule proprement une prise en cours',()=>{
 const g=createCleanup();advance(g,1);g.grab(0,7);assert.equal(g.pause(),true);const before=g.snapshot();advance(g,20);assert.deepEqual(g.snapshot(),before);assert.equal(g.grab(1,4),false);assert.equal(g.snapshot().pieces[0].kind,'falling');g.resume();advance(g,.5);assert.ok(g.snapshot().time>before.time);
});
test('le mouvement réduit disperse les morceaux sans explosion et tous restent récupérables',()=>{
 const g=createCleanup({reduced:true});assert.equal(g.snapshot().phase,'cleaning');assert.ok(g.snapshot().pieces.every(p=>p.vx===0&&p.vy===.02));assert.ok(new Set(g.snapshot().pieces.map(p=>p.x)).size>10);advance(g,1);for(const p of g.snapshot().pieces)assert.equal(trash(g,p.id),true);assert.equal(g.snapshot().phase,'won');
});
test('les coordonnées invalides et les instantanés ne peuvent pas modifier le score',()=>{
 const g=createCleanup();assert.equal(g.grab(999,1),false);g.grab(0,1);const before=g.snapshot();assert.equal(g.move(0,NaN,.5,1),false);g.update(Infinity);g.update(-1);assert.deepEqual(g.snapshot(),before);assert.equal(g.release(0,{x:NaN,y:0,width:1,height:1},1),false);assert.equal(g.snapshot().collected,0);const s=g.snapshot();s.pieces[1].kind='collected';assert.equal(g.snapshot().pieces[1].kind,'falling');assert.equal(inBin(.8,.7,bin),true);assert.equal(inBin(.2,.7,bin),false);assert.throws(()=>createCleanup({count:0}));
});
