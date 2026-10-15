export const COUNT=60;
export const COLORS=[{name:'rose',hex:'#db725f'},{name:'bleu',hex:'#577da5'},{name:'jaune',hex:'#d5ac43'},{name:'vert',hex:'#7b9b76'},{name:'violet',hex:'#9c82b0'},{name:'orange',hex:'#db9760'}];
export const SHAPES=['ruban','rond','rectangle','étoile'];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function inBin(x,y,bin){return !!bin&&[x,y,bin.x,bin.y,bin.width,bin.height].every(Number.isFinite)&&bin.width>0&&bin.height>0&&x>=bin.x&&x<=bin.x+bin.width&&y>=bin.y&&y<=bin.y+bin.height;}
export function createCleanup({count=COUNT,random=Math.random,reduced=false}={}){
 if(!Number.isInteger(count)||count<1||count>150)throw new Error('Nombre de confettis invalide.');
 let pieces,phase,time,collected,selected,previousPhase,accumulator,events;
 const canPlay=()=>phase==='burst'||phase==='cleaning';
 function reset(){time=0;collected=0;selected=null;accumulator=0;events=[];phase=reduced?'cleaning':'burst';pieces=Array.from({length:count},(_,id)=>{
  const angle=-Math.PI*.9+random()*Math.PI*.8,speed=1.1+random()*.65;
  return {id,color:id%COLORS.length,shape:id%SHAPES.length,size:.8+random()*.5,x:reduced?.045+random()*.91:.48+(random()-.5)*.02,y:reduced?.07+random()*.7:.85, vx:reduced?0:Math.cos(angle)*speed,vy:reduced?.02:Math.sin(angle)*speed,rotation:random()*360,spin:(random()-.5)*230,flutter:random()*Math.PI*2,kind:'falling',owner:null,age:reduced?3:0};
 });events.push({type:'burst'});}
 function get(id){return pieces.find(p=>p.id===id);}
 function deselect(){if(selected!==null){const p=get(selected);if(p?.kind==='selected'){p.kind='falling';p.vx=0;p.vy=.02;}}selected=null;}
 function grab(id,owner){const p=get(id);if(!canPlay()||owner===undefined||owner===null||!p||!['falling','resting','selected'].includes(p.kind))return false;deselect();p.kind='dragging';p.owner=owner;p.vx=p.vy=0;return true;}
 function move(id,x,y,owner){const p=get(id);if(!canPlay()||!p||p.kind!=='dragging'||p.owner!==owner||![x,y].every(Number.isFinite))return false;p.x=clamp(x,.025,.975);p.y=clamp(y,.04,.92);return true;}
 function collect(p,bin){if(p.kind==='collecting'||p.kind==='collected')return false;p.fromX=p.x;p.fromY=p.y;p.toX=clamp(bin.x+bin.width*.5,.025,.975);p.toY=clamp(bin.y+bin.height*.45,.04,.92);p.collectAge=0;p.kind='collecting';p.owner=null;if(selected===p.id)selected=null;collected++;events.push({type:'collect',id:p.id,collected});if(collected===count){phase='won';events.push({type:'won'});}return true;}
 function release(id,bin,owner){const p=get(id);if(!canPlay()||!p||p.kind!=='dragging'||p.owner!==owner)return false;if(inBin(p.x,p.y,bin))return collect(p,bin);p.kind='falling';p.owner=null;p.vx=0;p.vy=.025;p.age=Math.max(2,p.age);return false;}
 function cancel(id,owner){const p=get(id);if(!p||p.kind!=='dragging'||p.owner!==owner)return false;p.kind='falling';p.owner=null;p.vx=0;p.vy=.025;p.age=Math.max(2,p.age);return true;}
 function select(id){const p=get(id);if(!canPlay()||!p||!['falling','resting','selected'].includes(p.kind))return false;if(selected===id){deselect();return true;}deselect();selected=id;p.kind='selected';p.vx=p.vy=0;return true;}
 function putSelected(bin){if(!canPlay()||selected===null||!inBin(bin?.x+bin?.width*.5,bin?.y+bin?.height*.5,bin))return false;return collect(get(selected),bin);}
 function tick(dt){
  time+=dt;if(phase==='burst'&&time>.95)phase='cleaning';
  for(const p of pieces){
   if(p.kind==='collecting'){p.collectAge+=dt;const t=clamp(p.collectAge/.34,0,1),ease=1-(1-t)**3;p.x=p.fromX+(p.toX-p.fromX)*ease;p.y=p.fromY+(p.toY-p.fromY)*ease;p.rotation+=300*dt;if(t===1)p.kind='collected';continue;}
   if(!canPlay()||p.kind!=='falling')continue;p.age+=dt;
   if(p.age<.9&&!reduced){p.vx*=Math.exp(-1.9*dt);p.vy+=(.2-1.5*p.vy)*dt;}else{p.vx+=(Math.sin(time*.75+p.flutter)*.007-p.vx*2)*dt;p.vy+=(.14-2.3*p.vy)*dt;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.rotation+=(p.age<1?p.spin:p.spin*.16)*dt;
   if(p.x<.025||p.x>.975){p.x=clamp(p.x,.025,.975);p.vx*=-.2;}if(p.y<.04){p.y=.04;p.vy=Math.max(.006,p.vy*.08);}
   const floor=.885+(p.id%6)*.005;if(p.y>=floor){p.y=floor;p.vx=p.vy=0;p.kind='resting';p.rotation=Math.round(p.rotation/15)*15;}
  }
 }
 function update(dt){if(phase==='paused'||!Number.isFinite(dt)||dt<=0)return;accumulator+=Math.min(dt,.1);while(accumulator>=1/120){accumulator-=1/120;tick(1/120);}}
 function pause(){if(phase==='paused'||phase==='won')return false;for(const p of pieces)if(p.kind==='dragging')cancel(p.id,p.owner);previousPhase=phase;phase='paused';return true;}
 function resume(){if(phase!=='paused')return false;phase=previousPhase;accumulator=0;return true;}
 function snapshot(){return {phase,time,collected,total:count,remaining:count-collected,selected,pieces:pieces.map(p=>({...p}))};}
 reset();return {reset,grab,move,release,cancel,select,putSelected,update,pause,resume,snapshot,drain:()=>events.splice(0)};
}
