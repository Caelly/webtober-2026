export const RULES=Object.freeze({duration:45,glassInterval:5,maxGlasses:9,step:1/120,limit:.36,travel:1.45,glassHeight:.6,floor:-2.45});
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function stackPose(state){
 let x=state.x,y=0;
 return Array.from({length:state.glasses},(_,index)=>{
  const angle=state.angle*(1+index*.055)+Math.sin(state.elapsed*2.5+index*.8)*Math.abs(state.angle)*.035;
  const glass={index,x,y,angle};x+=Math.sin(angle)*RULES.glassHeight;y+=Math.cos(angle)*RULES.glassHeight;return glass;
 });
}
export function createBalance(random=Math.random){
 let state,accumulator=0,events=[],nextGlass,nextGust,gustTarget,walkPhase,fallTime=0,pausedPhase;
 const emit=(type,data={})=>events.push({type,...data});
 function reset(){state={phase:'ready',elapsed:0,glasses:1,x:0,velocity:0,angle:0,angularVelocity:0,trayAngle:0,wind:0,input:0,fallen:[]};accumulator=0;events=[];nextGlass=5;nextGust=1;gustTarget=0;fallTime=0;walkPhase=random()*Math.PI*2;pausedPhase=null;return snapshot();}
 function start(){reset();state.phase='playing';state.angle=(random()<.5?-1:1)*.012;state.angularVelocity=.006;emit('start');return snapshot();}
 function fall(){
  state.phase='falling';fallTime=0;const direction=Math.sign(state.angle)||1;
  state.fallen=stackPose(state).map(glass=>({...glass,vx:state.velocity+state.angularVelocity*glass.y+direction*(.3+glass.index*.07),vy:.15,spin:state.angularVelocity+direction*(.5+glass.index*.14),broken:false}));emit('fall');
 }
 function step(){
  const dt=RULES.step;
  if(state.phase==='falling'){
   fallTime+=dt;
   for(const glass of state.fallen){if(glass.broken)continue;glass.vy-=9*dt;glass.x+=glass.vx*dt;glass.y+=glass.vy*dt;glass.angle+=glass.spin*dt;if(glass.y<RULES.floor){glass.y=RULES.floor;glass.broken=true;emit('break',{x:glass.x,y:glass.y,index:glass.index});}}
   if(state.fallen.every(glass=>glass.broken)||fallTime>2.5){state.phase='lost';emit('lost');}return;
  }
  if(state.phase!=='playing')return;
  state.elapsed=Math.min(RULES.duration,state.elapsed+dt);
  if(state.elapsed>=nextGlass&&state.glasses<RULES.maxGlasses){state.glasses++;nextGlass+=RULES.glassInterval;state.angularVelocity+=(random()-.5)*(.045+state.glasses*.008);emit('glass',{count:state.glasses});}
  if(state.elapsed>=nextGust){gustTarget=(random()-.5)*(.09+state.glasses*.009);nextGust=state.elapsed+1+random()*.8;}
  state.wind+=(gustTarget-state.wind)*dt*1.6;
  const acceleration=state.input*2.6-state.velocity*1.15;
  state.velocity+=acceleration*dt;state.x+=state.velocity*dt;
  if(Math.abs(state.x)>RULES.travel){state.x=clamp(state.x,-RULES.travel,RULES.travel);state.velocity*=-.15;}
  const length=1+state.glasses*.095;
  const walking=Math.sin(state.elapsed*1.75+walkPhase)*(.025+state.glasses*.003);
  const gravity=(2.5*Math.sin(state.angle)-acceleration*.62*Math.cos(state.angle))/length;
  state.angularVelocity+=(gravity-state.angularVelocity*1.6+state.wind+walking)*dt;
  state.angle+=state.angularVelocity*dt;
  state.trayAngle+=(-acceleration*.018-state.trayAngle)*dt*8;
  if(Math.abs(state.angle)>RULES.limit){fall();return;}
  if(state.elapsed>=RULES.duration){state.phase='won';state.input=0;emit('won');}
 }
 function update(delta,input=0){
  if(!['playing','falling'].includes(state.phase)||!Number.isFinite(delta)||delta<=0)return;
  state.input=clamp(Number.isFinite(input)?input:0,-1,1);accumulator+=Math.min(delta,.25);
  while(accumulator+1e-10>=RULES.step){accumulator-=RULES.step;step();if(['lost','won'].includes(state.phase)){accumulator=0;break;}}
 }
 function pause(){if(!['playing','falling'].includes(state.phase))return false;pausedPhase=state.phase;state.phase='paused';state.input=0;accumulator=0;return true;}
 function resume(){if(state.phase!=='paused')return false;state.phase=pausedPhase;pausedPhase=null;accumulator=0;return true;}
 function snapshot(){return {...state,fallen:state.fallen.map(glass=>({...glass})),stack:stackPose(state),progress:state.elapsed/RULES.duration,danger:Math.min(1,Math.abs(state.angle)/RULES.limit),nextGlass:state.glasses<RULES.maxGlasses?Math.max(0,nextGlass-state.elapsed):0};}
 reset();return {start,reset,update,pause,resume,snapshot,drain(){const pending=events;events=[];return pending;}};
}
