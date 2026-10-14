import test from 'node:test';
import assert from 'node:assert/strict';
import {createJavelin,RULES,segmentDistance,makeBirds} from './game.js';
function advance(g,seconds){for(let t=0;t<seconds-1e-8;t+=1/120)g.update(1/120);}
function seeded(seed){return()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);}
function charge(g){for(let i=0;i<12;i++)g.step(i%2?'down':'up');}
function resolve(g){for(let i=0;i<2400&&['running','flying'].includes(g.snapshot().phase);i++)g.update(1/120);}
const bird=(id,x,y)=>({id,x,y,speed:0,kind:id%4,flap:0,caught:false});

test('la course demande des appuis alternés et ignore le maintien clavier',()=>{
 const g=createJavelin();assert.equal(g.step('up'),false);g.start();assert.equal(g.step('up'),true);const speed=g.snapshot().speed;assert.equal(g.step('up'),false);assert.equal(g.step('down',{repeat:true}),false);assert.equal(g.snapshot().speed,speed);assert.equal(g.step('down'),true);assert.equal(g.snapshot().steps,2);assert.equal(g.step('left'),false);
 charge(g);assert.equal(g.snapshot().speed,RULES.maxSpeed);advance(g,.3);assert.ok(g.snapshot().speed<RULES.maxSpeed);assert.ok(g.snapshot().x>RULES.start);
});
test('franchir la ligne sans lancer annule le lancer, sans aucun point',()=>{
 const g=createJavelin();g.start();resolve(g);const s=g.snapshot();assert.equal(s.phase,'result');assert.equal(s.outcome,'foul');assert.equal(s.x,RULES.line);assert.equal(s.total,0);assert.equal(g.launch(),false);assert.equal(g.step('up'),false);
});
test('le javelot suit une parabole et la vitesse de course change sa portée',()=>{
 const ranges=[];for(const boosted of [false,true]){const g=createJavelin({birds:[]});g.start();if(boosted)charge(g);assert.equal(g.launch(),true);assert.equal(g.launch(),false);const a=g.snapshot().javelin;advance(g,.3);const b=g.snapshot().javelin;assert.ok(b.x>a.x&&b.y>a.y&&b.vy<a.vy);resolve(g);assert.equal(g.snapshot().outcome,'landed');assert.equal(g.snapshot().javelin.y,.65);ranges.push(g.snapshot().javelin.x);}assert.ok(ranges[1]>ranges[0]*2);
});
test('les collisions balayent le déplacement relatif et accrochent plusieurs pigeons une seule fois',()=>{
 const velocity=14+RULES.maxSpeed*1.4,vx=Math.cos(RULES.angle)*velocity,vy=Math.sin(RULES.angle)*velocity;
 const birds=[.55,1,1.45].map((t,i)=>bird(i,7+vx*t,4.7+vy*t-.5*RULES.gravity*t*t));
 const g=createJavelin({birds});g.start();charge(g);g.launch();resolve(g);const s=g.snapshot();assert.equal(s.score,3);assert.equal(s.total,3);assert.equal(s.javelin.caught.length,3);assert.equal(s.birds.filter(b=>b.caught).length,3);assert.equal(g.drain().filter(e=>e.type==='hit').length,3);advance(g,2);assert.equal(g.snapshot().total,3);
 assert.equal(segmentDistance(0,0,-10,0,10,0),0);assert.equal(segmentDistance(0,3,-10,0,10,0),3);
});
test('les oiseaux volent de gauche à droite et un oiseau hors trajectoire reste intact',()=>{
 const g=createJavelin({birds:[{...bird(1,60,45),speed:4}]});g.start();advance(g,.5);assert.ok(g.snapshot().birds[0].x>60);g.launch();resolve(g);assert.equal(g.snapshot().score,0);assert.equal(g.snapshot().birds[0].caught,false);
 const flock=makeBirds(seeded(42));assert.equal(new Set(flock.map(b=>b.id)).size,22);assert.ok(flock.every(b=>b.speed>0&&b.y>=11));
});
test('la pause fige la course et le vol et reprend la phase interrompue',()=>{
 const g=createJavelin();g.start();charge(g);advance(g,.5);assert.equal(g.pause(),true);const s=g.snapshot();advance(g,5);assert.deepEqual(g.snapshot(),s);assert.equal(g.step('down'),false);assert.equal(g.launch(),false);g.resume();assert.equal(g.snapshot().phase,'running');g.launch();advance(g,.5);g.pause();const flight=g.snapshot();advance(g,2);assert.deepEqual(g.snapshot(),flight);g.resume();assert.equal(g.snapshot().phase,'flying');advance(g,.1);assert.ok(g.snapshot().javelin.x>flight.javelin.x);
});
test('une partie comporte trois lancers, puis une nouvelle partie remet les scores à zéro',()=>{
 const g=createJavelin({birds:[]});assert.equal(g.next(),false);g.start();for(let i=1;i<=3;i++){assert.equal(g.snapshot().throw,i);g.launch();resolve(g);assert.equal(g.snapshot().phase,i===3?'over':'result');assert.equal(g.next(),i<3);}assert.equal(g.step('up'),false);g.start();assert.equal(g.snapshot().throw,1);assert.equal(g.snapshot().total,0);assert.equal(g.snapshot().phase,'running');g.reset();assert.equal(g.snapshot().phase,'ready');
});
test('le pas fixe donne la même trajectoire à 30 et 120 images par seconde',()=>{
 const snapshots=[];for(const hz of [30,120]){const g=createJavelin({random:seeded(7)});g.start();charge(g);g.launch();for(let i=0;i<hz*2;i++)g.update(1/hz);snapshots.push(g.snapshot());}assert.ok(Math.abs(snapshots[0].javelin.x-snapshots[1].javelin.x)<.001);assert.equal(snapshots[0].score,snapshots[1].score);
});
test('les instantanés ne permettent pas de modifier la partie et les temps invalides sont ignorés',()=>{
 const g=createJavelin();g.start();const before=g.snapshot();g.update(NaN);g.update(Infinity);g.update(-1);assert.deepEqual(g.snapshot(),before);const s=g.snapshot();s.birds[0].x=999;assert.notEqual(g.snapshot().birds[0].x,999);g.launch();const j=g.snapshot();j.javelin.caught.push({id:99});assert.equal(g.snapshot().javelin.caught.length,0);
});
