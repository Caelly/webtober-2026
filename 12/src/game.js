export const RULES=Object.freeze({line:38,start:6,minSpeed:2.4,maxSpeed:22,stepBoost:2.1,drag:3,angle:.58,gravity:15,throws:3,hitRadius:1.8,worldEnd:210});
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function segmentDistance(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(px-ax-dx*t,py-ay-dy*t);}
export function makeBirds(random=Math.random){return Array.from({length:22},(_,i)=>({id:i,x:46+i*4.8+random()*3,y:11+random()*22,speed:2.5+random()*3.5,flap:random()*Math.PI*2,kind:i%4,caught:false}));}
export function createJavelin({random=Math.random,birds}={}){
 let state,events=[],previousPhase='running',accumulator=0;
 const freshBirds=()=>birds?birds.map(b=>({...b,caught:false})):makeBirds(random);
 function round(){state={phase:'running',throw:state?.throw||1,total:state?.total||0,score:0,x:RULES.start,speed:RULES.minSpeed,steps:0,lastStep:null,time:0,birds:freshBirds(),javelin:null,outcome:null};accumulator=0;}
 function reset(){state={phase:'ready',throw:1,total:0,score:0,x:RULES.start,speed:RULES.minSpeed,steps:0,lastStep:null,time:0,birds:freshBirds(),javelin:null,outcome:null};events=[];accumulator=0;}
 function start(){state={throw:1,total:0};events=[];round();events.push({type:'start'});}
 function step(direction,{repeat=false}={}){if(state.phase!=='running'||repeat||!['up','down'].includes(direction)||direction===state.lastStep)return false;state.lastStep=direction;state.steps++;state.speed=Math.min(RULES.maxSpeed,state.speed+RULES.stepBoost);events.push({type:'step',direction});return true;}
 function launch(){if(state.phase!=='running'||state.x>=RULES.line)return false;const power=14+state.speed*1.4;state.javelin={x:state.x+1,y:4.7,vx:Math.cos(RULES.angle)*power,vy:Math.sin(RULES.angle)*power,angle:RULES.angle,caught:[],trail:[]};state.phase='flying';events.push({type:'launch',speed:state.speed});accumulator=0;return true;}
 function finish(outcome){state.outcome=outcome;state.total+=state.score;state.phase=state.throw===RULES.throws?'over':'result';events.push({type:'result',score:state.score,total:state.total,outcome,final:state.phase==='over'});accumulator=0;}
 function next(){if(state.phase!=='result')return false;state.throw++;round();events.push({type:'start'});return true;}
 function tick(dt){
  state.time+=dt;
  const oldBirds=new Map(state.birds.map(b=>[b.id,{x:b.x,y:b.y}]));
  for(const bird of state.birds){if(!bird.caught){bird.x+=bird.speed*dt;if(bird.x>RULES.worldEnd+5)bird.x=43;}}
  if(state.phase==='running'){state.speed=Math.max(RULES.minSpeed,state.speed-RULES.drag*dt);state.x+=state.speed*dt;if(state.x>=RULES.line){state.x=RULES.line;state.speed=0;finish('foul');}return;}
  const j=state.javelin,oldX=j.x,oldY=j.y;j.vy-=RULES.gravity*dt;j.x+=j.vx*dt;j.y+=j.vy*dt;j.angle=Math.atan2(j.vy,j.vx);
  for(const bird of state.birds){if(bird.caught)continue;const prev=oldBirds.get(bird.id);if(Math.abs(bird.x-prev.x)>10)continue;
   if(segmentDistance(0,0,oldX-prev.x,oldY-prev.y,j.x-bird.x,j.y-bird.y)<=RULES.hitRadius){bird.caught=true;j.caught.push({id:bird.id,kind:bird.kind,flap:bird.flap});state.score++;events.push({type:'hit',x:bird.x,y:bird.y,score:state.score});}
  }
  j.trail.push({x:j.x,y:j.y});if(j.trail.length>30)j.trail.shift();
  if(j.y<=.65||j.x>RULES.worldEnd){j.y=Math.max(.65,j.y);finish('landed');}
 }
 function update(dt){if(!Number.isFinite(dt)||dt<=0||!['running','flying'].includes(state.phase))return;accumulator+=Math.min(dt,.1);while(accumulator>=1/120&&['running','flying'].includes(state.phase)){accumulator-=1/120;tick(1/120);}}
 function pause(){if(!['running','flying'].includes(state.phase))return false;previousPhase=state.phase;state.phase='paused';events.push({type:'pause'});return true;}
 function resume(){if(state.phase!=='paused')return false;state.phase=previousPhase;accumulator=0;return true;}
 function snapshot(){return {...state,birds:state.birds.map(b=>({...b})),javelin:state.javelin?{...state.javelin,caught:state.javelin.caught.map(b=>({...b})),trail:state.javelin.trail.map(p=>({...p}))}:null,progress:clamp((state.x-RULES.start)/(RULES.line-RULES.start),0,1),power:clamp((state.speed-RULES.minSpeed)/(RULES.maxSpeed-RULES.minSpeed),0,1)};}
 reset();return {start,reset,next,step,launch,update,pause,resume,snapshot,drain:()=>events.splice(0)};
}
