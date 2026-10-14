export const RULES=Object.freeze({waves:5,shield:100,chargePerKill:5,laserCost:25,doubleCost:50,shotCooldown:.22,breachDamage:12});
export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export function beamPath(kind,hand,aim){
 const start={x:kind==='double'?.5:hand==='left'?.16:.84,y:.96};
 const direction={x:clamp(aim.x,.03,.97)-start.x,y:Math.min(-.12,clamp(aim.y,.04,.82)-start.y)};
 const scale=Math.min((.03-start.y)/direction.y,direction.x<0?(.02-start.x)/direction.x:direction.x>0?(.98-start.x)/direction.x:Infinity);
 return {start,end:{x:start.x+direction.x*scale,y:start.y+direction.y*scale},width:kind==='double'?.14:.05};
}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
export function createRescue(random=Math.random){
 let state,queue,nextSpawn,rest,sequence,events,lastShot;
 const emit=(type,data={})=>events.push({type,...data});
 function nextWave(){queue=3+state.wave*2;nextSpawn=.35;state.phase='playing';emit('wave',{wave:state.wave});}
 function reset(){state={phase:'ready',wave:1,shield:100,charge:0,kills:0,rescued:0,elapsed:0,enemies:[]};queue=0;nextSpawn=0;rest=0;sequence=0;events=[];lastShot={left:-1,right:-1,laser:-1};}
 function start(){reset();nextWave();return snapshot();}
 function kill(enemy){if(enemy.hp<=0)return;enemy.hp=0;state.kills++;state.charge=clamp(state.charge+RULES.chargePerKill,0,100);emit('kill',{x:enemy.x,y:enemy.y,kind:enemy.kind});}
 function spawn(){const kind=state.wave>=3&&random()<.24?'heavy':state.wave>=2&&random()<.35?'dart':'drone';const hp=kind==='heavy'?3:kind==='dart'?2:1;
 state.enemies.push({id:++sequence,base:.12+random()*.76,x:.5,y:.08,r:kind==='heavy'?.045:.033,hp,maxHp:hp,kind,age:0,wobble:random()*Math.PI*2,speed:(kind==='dart'?.068:kind==='heavy'?.036:.045)*(1+state.wave*.035)});
 const enemy=state.enemies.at(-1);enemy.x=enemy.base;}
 function update(delta){
  if(!['playing','rest'].includes(state.phase)||!Number.isFinite(delta)||delta<=0)return;
  const dt=Math.min(delta,.1);state.elapsed+=dt;
  if(state.phase==='rest'){rest-=dt;if(rest<=0){state.wave++;nextWave();}return;}
  nextSpawn-=dt;if(queue>0&&nextSpawn<=0){spawn();queue--;nextSpawn=.85-state.wave*.05;}
  for(const enemy of state.enemies){if(enemy.hp<=0)continue;enemy.age+=dt;enemy.y+=enemy.speed*dt;enemy.x=clamp(enemy.base+Math.sin(enemy.age*1.1+enemy.wobble)*.075,.07,.93);
   if(enemy.y>.84){enemy.hp=0;state.shield=Math.max(0,state.shield-RULES.breachDamage);emit('breach',{x:enemy.x,y:enemy.y});if(state.shield===0){state.phase='lost';emit('lost');break;}}
  }
  state.enemies=state.enemies.filter(enemy=>enemy.hp>0);
  if(state.phase==='playing'&&queue===0&&state.enemies.length===0){state.rescued=Math.floor(state.wave/RULES.waves*12);if(state.wave===RULES.waves){state.phase='won';emit('won');}else{state.phase='rest';rest=2.5;state.shield=Math.min(100,state.shield+6);emit('clear',{wave:state.wave});}}
 }
 function fire(hand,aim){
  if(state.phase!=='playing'||!['left','right'].includes(hand)||!validAim(aim)||state.elapsed-lastShot[hand]<RULES.shotCooldown)return false;
  lastShot[hand]=state.elapsed;const point={x:clamp(aim.x),y:clamp(aim.y)};
  emit('shot',{hand,aim:point});
  const hit=state.enemies.filter(enemy=>enemy.hp>0&&Math.hypot(enemy.x-point.x,enemy.y-point.y)<=enemy.r+.023).sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];
  if(hit){if(hit.hp===1)kill(hit);else{hit.hp--;emit('hit',{x:hit.x,y:hit.y});}}
  return true;
 }
 function touch(hand,aim,previous=aim){
  if(state.phase!=='playing'||!['left','right'].includes(hand)||!validAim(aim)||!validAim(previous))return false;
  const point={x:clamp(aim.x),y:clamp(aim.y)},from={x:clamp(previous.x),y:clamp(previous.y)};
  // Sweep between camera frames so a fast pass cannot skip a drone.
  const hits=state.enemies.filter(enemy=>enemy.hp>0&&segmentDistance(enemy,from,point)<=enemy.r+.023);
  if(!hits.length)return false;
  emit('shot',{hand,aim:point});for(const enemy of hits)kill(enemy);
  return true;
 }
 function laser(kind,hand,aim){
  if(state.phase!=='playing'||!['single','double'].includes(kind)||!['left','right'].includes(hand)||!validAim(aim))return false;
  const cost=kind==='double'?RULES.doubleCost:RULES.laserCost;
  if(state.charge<cost){emit('low-charge',{cost});return false;}
  if(state.elapsed-lastShot.laser<.8)return false;
  lastShot.laser=state.elapsed;state.charge-=cost;
  const beam=beamPath(kind,hand,aim);emit('laser',{...beam,kind,hand});
  for(const enemy of state.enemies){if(enemy.hp>0&&segmentDistance(enemy,beam.start,beam.end)<enemy.r+beam.width/2)kill(enemy);}
  return true;
 }
 function snapshot(){return {...state,enemies:state.enemies.map(enemy=>({...enemy})),remaining:queue+state.enemies.length};}
 function drain(){const result=events;events=[];return result;}
 reset();return {start,reset,update,fire,touch,laser,snapshot,drain};
}
const validAim=aim=>aim&&Number.isFinite(aim.x)&&Number.isFinite(aim.y);
