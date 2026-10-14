import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyHand,createGestureTracker} from './gestures.js';
function fixture(kind,{offset=.7,scale=.1,flip=1}={}){
 const world=Array.from({length:21},()=>({x:0,y:0,z:0}));const set=(i,x,y)=>world[i]={x:x*flip,y,z:0};set(0,0,0);
 set(1,-.6,.3);set(2,-.8,.55);set(3,-1,.85);set(4,kind==='down'?-.55:-1.2,kind==='down'?.72:1.3);
 for(const [base,x,y] of [[5,-.45,.85],[9,0,1],[13,.4,.9],[17,.8,.75]]){
  const extended=kind==='circle'||kind==='open'||base===5&&kind!=='fist';
  set(base,x,y);set(base+1,x,y+.45);set(base+2,x,y+(extended?.8:.15));set(base+3,x,y+(extended?1.15:-.2));
 }
 if(kind==='circle'){set(6,-.8,1.1);set(7,-.95,.85);set(8,-.93,.7);set(4,-.95,.72);}
 const image=world.map(p=>({x:offset+p.x*scale,y:.85-p.y*scale*2,z:0}));
 return {landmarks:[image],worldLandmarks:[world]};
}
const merge=(a,b)=>({landmarks:[...a.landmarks,...b.landmarks],worldLandmarks:[...a.worldLandmarks,...b.worldLandmarks]});
test('une main suffit à suivre l’index, quelle que soit la position du pouce et des autres doigts',()=>{
 for(const kind of ['up','down','open','fist']){const f=fixture(kind),hand=classifyHand(f.landmarks[0],f.worldLandmarks[0]);assert.ok(hand);assert.equal(hand.circle,false);assert.ok(Number.isFinite(hand.aim.x)&&Number.isFinite(hand.aim.y));}
 const circle=fixture('circle');assert.equal(classifyHand(circle.landmarks[0],circle.worldLandmarks[0]).circle,true);
 assert.equal(classifyHand([]),null);assert.equal(classifyHand(Array(21).fill({x:NaN,y:0})),null);
});
test('les gestes sont invariants à l’échelle et au miroir, et le viseur suit le miroir vidéo',()=>{
 for(const flip of [-1,1])for(const scale of [.06,.13]){const f=fixture('up',{flip,scale});const hand=classifyHand(f.landmarks[0],f.worldLandmarks[0]);assert.ok(hand);assert.equal(hand.circle,false);assert.ok(hand.aim.x>=0&&hand.aim.x<=1);}
 const left=fixture('up',{offset:.7}),right=fixture('up',{offset:.3});assert.ok(classifyHand(left.landmarks[0],left.worldLandmarks[0]).wrist.x<classifyHand(right.landmarks[0],right.worldLandmarks[0]).wrist.x);
});
test('le suivi fournit le trajet de l’index sans exiger d’armement ou de détente du pouce',()=>{
 const tracker=createGestureTracker(),first=tracker.update(fixture('down'),0);assert.equal(first.hands.length,1);assert.equal(first.hands[0].previousAim,null);assert.equal(first.events.length,0);
 const second=tracker.update(fixture('open'),100);assert.deepEqual(second.hands[0].previousAim,first.hands[0].aim);
 const moved=tracker.update(fixture('down',{offset:.45}),170);assert.ok(moved.hands[0].aim.x>moved.hands[0].previousAim.x);assert.equal(moved.events.length,0);
});
function feed(tracker,pose,from,to,step=50){let result;const events=[];for(let now=from;now<=to;now+=step){result=tracker.update(typeof pose==='function'?pose(now):pose,now);events.push(...result.events);}return {...result,events};}
function pinch(gap){const pose=fixture('circle');const tip=pose.worldLandmarks[0][8];pose.worldLandmarks[0][4]={x:tip.x+gap,y:tip.y,z:0};pose.landmarks[0][4]={x:.7+(tip.x+gap)*.1,y:.85-tip.y*.2,z:0};return pose;}
test('un cercle seul remplit son indicateur puis ne déclenche qu’un laser par maintien',()=>{
 const tracker=createGestureTracker();const charging=feed(tracker,fixture('circle'),0,450);assert.equal(charging.events.length,0);assert.ok(charging.circleProgress>0&&charging.circleProgress<1);
 const fired=tracker.update(fixture('circle'),500);assert.equal(fired.events[0].kind,'single');assert.equal(fired.circleProgress,1);assert.equal(fired.hands[0].circleProgress,1);
 assert.equal(feed(tracker,fixture('circle'),550,1200).events.length,0);
 feed(tracker,fixture('open'),1250,1750);assert.equal(feed(tracker,fixture('circle'),1800,2300).events[0].kind,'single');
});
test('les deux cercles ont priorité, même si la deuxième main arrive un peu après la première',()=>{
 const tracker=createGestureTracker(),both=merge(fixture('circle',{offset:.7}),fixture('circle',{offset:.3}));
 feed(tracker,fixture('circle'),0,250);const result=feed(tracker,both,300,550);assert.equal(result.events.length,1);assert.equal(result.events[0].kind,'double');assert.equal(feed(tracker,both,600,1400).events.length,0);assert.equal(result.hands.length,2);assert.equal(new Set(result.hands.map(hand=>hand.id)).size,2);
});
test('les doigts détendus et un léger écart pouce-index sont acceptés, même si la profondeur estimée est instable',()=>{
 const relaxed=pinch(.42);for(const [base,x,y] of [[9,0,1],[13,.4,.9],[17,.8,.75]])for(const [offset,dy] of [[1,.3],[2,.15],[3,.2]])relaxed.worldLandmarks[0][base+offset]={x,y:y+dy,z:0};
 assert.equal(classifyHand(relaxed.landmarks[0],relaxed.worldLandmarks[0]).circle,true);
 const depth=fixture('circle');depth.worldLandmarks[0][4].z=.8;assert.equal(classifyHand(depth.landmarks[0],depth.worldLandmarks[0]).circle,true);
 const fist=fixture('fist');fist.worldLandmarks[0][4]={...fist.worldLandmarks[0][8]};fist.landmarks[0][4]={...fist.landmarks[0][8]};assert.equal(classifyHand(fist.landmarks[0],fist.worldLandmarks[0]).circle,false);
});
test('le seuil de maintien absorbe le tremblement au lieu de remettre la charge à zéro',()=>{
 const tracker=createGestureTracker();tracker.update(fixture('circle'),0);
 const looser=pinch(.9);const classified=classifyHand(looser.landmarks[0],looser.worldLandmarks[0]);assert.equal(classified.circle,false);assert.equal(classified.circleHold,true);
 const result=feed(tracker,looser,50,550);assert.equal(result.events.length,1);assert.equal(result.events[0].kind,'single');
});
test('une perte brève de la deuxième main conserve le double, mais aucune main absente ne tire',()=>{
 const tracker=createGestureTracker(),both=merge(fixture('circle',{offset:.7}),fixture('circle',{offset:.3}));
 feed(tracker,both,0,50);assert.equal(tracker.update(fixture('circle'),100).events.length,0);assert.equal(tracker.update(both,150).events.length,0);assert.equal(tracker.update(both,200).events[0].kind,'double');
 assert.equal(tracker.update({},250).events.length,0);assert.equal(feed(tracker,both,300,900).events.length,0);
 const missing=createGestureTracker();feed(missing,both,0,50);assert.ok(feed(missing,fixture('circle'),100,400).events.every(event=>event.kind!=='double'));
});
test('une seule image ressemblant à un cercle ne suffit pas à déclencher un laser',()=>{
 const tracker=createGestureTracker(),both=merge(fixture('circle',{offset:.7}),fixture('circle',{offset:.3})),open=merge(fixture('open',{offset:.7}),fixture('open',{offset:.3}));
 tracker.update(both,0);assert.equal(feed(tracker,open,50,450,25).events.length,0);
});
test('une perte de suivi ou une remise à zéro ne trace pas une ligne depuis une ancienne position',()=>{
 const tracker=createGestureTracker();tracker.update(fixture('up'),0);assert.ok(tracker.update(fixture('up'),120).hands[0].previousAim);tracker.update({},700);assert.equal(tracker.update(fixture('down'),800).hands[0].previousAim,null);
 tracker.update(fixture('up'),900);tracker.update(fixture('up'),1020);tracker.reset();assert.equal(tracker.update(fixture('down'),1100).hands[0].previousAim,null);
 const gap=createGestureTracker();gap.update(fixture('open'),0);assert.equal(gap.update(fixture('open'),300).hands[0].previousAim,null);
});

test('les cercles se déclenchent aussi quand l’analyse caméra ne renvoie que quelques images par seconde',()=>{
 for(const step of [200,300,500]){
  const tracker=createGestureTracker();const result=feed(tracker,fixture('circle'),0,1500,step);assert.equal(result.events.length,1);assert.equal(result.events[0].kind,'single');
  const double=createGestureTracker(),both=merge(fixture('circle',{offset:.7}),fixture('circle',{offset:.3}));const pair=feed(double,both,0,1500,step);assert.equal(pair.events.length,1);assert.equal(pair.events[0].kind,'double');
 }
});
