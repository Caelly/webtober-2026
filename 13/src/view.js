const TAU=Math.PI*2;
const wineColors=['#9b3f48','#cfa666','#c98b83'];
function shape(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
export function createBistro(canvas){
 const ctx=canvas.getContext('2d'),host=canvas.parentElement;let w=1,h=1,scale=1,originX=1,trayY=1,floorY=1,shards=[],arrivals=new Map();
 function resize(){w=Math.max(1,host.clientWidth);h=Math.max(1,host.clientHeight);const dpr=Math.min(devicePixelRatio,1.7);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(h*.105,w*.155);originX=w*(w/h<.85?.5:.6);trayY=h*.665;floorY=trayY+2.45*scale;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const px=x=>originX+x*scale,py=y=>trayY-y*scale;
 function wall(){
  const paint=ctx.createLinearGradient(0,0,w,h);paint.addColorStop(0,'#f4edda');paint.addColorStop(.65,'#e8dfc8');paint.addColorStop(1,'#d9ceb4');ctx.fillStyle=paint;ctx.fillRect(0,0,w,h);
  for(const position of [.1,.88]){
   const x=w*position,top=h*.1,wide=w*.14,high=h*.45;
   ctx.save();ctx.beginPath();ctx.moveTo(x-wide/2,top+high);ctx.lineTo(x-wide/2,top+wide*.5);ctx.arc(x,top+wide*.5,wide*.5,Math.PI,TAU);ctx.lineTo(x+wide/2,top+high);ctx.closePath();ctx.fillStyle='#d4cdb5';ctx.fill();ctx.clip();
   const light=ctx.createLinearGradient(x-wide/2,0,x+wide/2,0);light.addColorStop(0,'#c2c8b7');light.addColorStop(.5,'#e2e5d3');light.addColorStop(1,'#d3d8c3');ctx.fillStyle=light;ctx.fillRect(x-wide/2,top,wide,high);
   ctx.fillStyle='#a8b8a24d';for(let i=0;i<5;i++){const height=high*(.15+(i%3)*.1);ctx.fillRect(x-wide*.5+i*wide*.25,top+high-height,wide*.16,height);}
   ctx.fillStyle='#6d7f6738';ctx.fillRect(x-1,top,2,high);ctx.fillRect(x-wide/2,top+high*.63,wide,2);
   ctx.fillStyle='#8f423a';ctx.beginPath();ctx.moveTo(x-wide*.5,top);ctx.lineTo(x+wide*.03,top);ctx.quadraticCurveTo(x-wide*.3,top+high*.48,x-wide*.37,top+high);ctx.lineTo(x-wide*.5,top+high);ctx.closePath();ctx.fill();ctx.strokeStyle='#b978602b';ctx.lineWidth=3;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x-wide*.45+i*wide*.08,top);ctx.quadraticCurveTo(x-wide*.3,top+high*.5,x-wide*.44,top+high);ctx.stroke();}
   ctx.restore();ctx.strokeStyle='#b8ac8c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-wide/2,top+high);ctx.lineTo(x-wide/2,top+wide*.5);ctx.arc(x,top+wide*.5,wide*.5,Math.PI,TAU);ctx.lineTo(x+wide/2,top+high);ctx.stroke();
  }
  ctx.fillStyle='#7a8774';ctx.fillRect(0,h*.57,w,h*.25);ctx.fillStyle='#a7aa8c';ctx.fillRect(0,h*.57,w,5);ctx.fillStyle='#62745f';ctx.fillRect(0,h*.59,w,2);
  const panels=Math.max(4,Math.round(w/100));for(let i=0;i<panels;i++){const x=i*w/panels+10;ctx.strokeStyle='#4c65594f';ctx.lineWidth=1;ctx.strokeRect(x,h*.615,w/panels-20,h*.15);ctx.strokeStyle='#cad0ab50';ctx.strokeRect(x+2,h*.615+2,w/panels-24,h*.15-4);}
  ctx.fillStyle='#c0b29a';ctx.fillRect(0,h*.8,w,h*.2);
  for(let row=0;row<6;row++){
   const y1=h*(.8+.2*(row/6)**1.5),y2=h*(.8+.2*((row+1)/6)**1.5);
   for(let col=-8;col<9;col++){
    const factor1=.45+(row/6)*.9,factor2=.45+((row+1)/6)*.9;
    const x1=w*.5+col*w*.1*factor1,x2=w*.5+(col+1)*w*.1*factor1,x3=w*.5+(col+1)*w*.1*factor2,x4=w*.5+col*w*.1*factor2;
    ctx.fillStyle=(row+col)%2===0?'#dcd4be':'#829081';shape(ctx,[[x1,y1],[x2,y1],[x3,y2],[x4,y2]]);ctx.fill();
   }
  }
  const vignette=ctx.createRadialGradient(w*.57,h*.44,h*.1,w*.57,h*.44,Math.max(w,h)*.75);vignette.addColorStop(0,'#f9f2da00');vignette.addColorStop(1,'#7d654323');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#8d927a2b';ctx.beginPath();ctx.ellipse(w*.1,h*.9,w*.14,h*.04,0,0,TAU);ctx.fill();
 }
 function waiter(state,time){
  const motion=state.phase==='playing'?Math.sin(time*5.5)*Math.min(.065,Math.abs(state.velocity)*.06+.012):0;
  const x=px(state.x*.7+.86),feet=floorY;
  ctx.fillStyle='#4e503b26';ctx.beginPath();ctx.ellipse(x,feet+3,scale*.72,scale*.1,0,0,TAU);ctx.fill();
  ctx.save();ctx.translate(x,feet);ctx.scale(scale,scale);
  const sleeve=(points)=>{ctx.beginPath();ctx.moveTo(...points[0]);ctx.bezierCurveTo(...points[1],...points[2],...points[3]);ctx.strokeStyle='#685e4930';ctx.lineWidth=.29;ctx.stroke();ctx.strokeStyle='#f9f2df';ctx.lineWidth=.24;ctx.stroke();};
  ctx.lineCap='round';
  for(const side of [-1,1]){
   ctx.strokeStyle='#303a35';ctx.lineWidth=.34;ctx.beginPath();ctx.moveTo(side*.19,-1.7);ctx.lineTo(side*(.23+motion),-.74);ctx.lineTo(side*.26+motion,-.1);ctx.stroke();
   ctx.fillStyle='#252f2b';ctx.beginPath();ctx.ellipse(side*.31+motion,-.06,.27,.1,side*.12,0,TAU);ctx.fill();ctx.strokeStyle='#687166';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(side*.31+motion-.13,-.08);ctx.lineTo(side*.31+motion+.15,-.08);ctx.stroke();
  }
  const shirt=ctx.createLinearGradient(-.6,-2.5,.5,-2);shirt.addColorStop(0,'#e4dac3');shirt.addColorStop(.45,'#fff8e7');shirt.addColorStop(1,'#e9dfc8');
  ctx.fillStyle=shirt;shape(ctx,[[-.42,-3.15],[.4,-3.15],[.52,-2.17],[.38,-1.62],[-.41,-1.62],[-.53,-2.17]]);ctx.fill();
  const target={x:(px(state.x)-x)/scale,y:(trayY-feet)/scale+.1};
  sleeve([[-.4,-3.0],[-.77,-2.94],[-.82,-2.5],[-.63,-2.38]]);sleeve([[-.63,-2.38],[-.5,-2.28],[target.x+.2,target.y+.14],[target.x,target.y+.03]]);
  ctx.save();ctx.translate(target.x,target.y);ctx.rotate(state.trayAngle);ctx.fillStyle='#d5a980';ctx.beginPath();ctx.ellipse(0,-.015,.26,.095,-.04,0,TAU);ctx.fill();ctx.strokeStyle='#b68662';ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(-.18,.005);ctx.lineTo(.17,.005);ctx.stroke();ctx.restore();
  sleeve([[.43,-3.0],[.72,-2.82],[.7,-2.41],[.48,-2.14]]);
  ctx.fillStyle='#d5a980';ctx.beginPath();ctx.ellipse(.46,-2.1,.11,.16,.2,0,TAU);ctx.fill();
  const vest=ctx.createLinearGradient(-.5,0,.5,0);vest.addColorStop(0,'#723b35');vest.addColorStop(.6,'#a35243');vest.addColorStop(1,'#7a3c34');ctx.fillStyle=vest;
  shape(ctx,[[-.4,-3.15],[-.18,-3.09],[0,-2.74],[.17,-3.09],[.4,-3.15],[.48,-2.04],[.32,-1.74],[0,-1.89],[-.32,-1.74],[-.48,-2.04]]);ctx.fill();ctx.strokeStyle='#612f2d';ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(0,-2.74);ctx.lineTo(0,-1.92);ctx.stroke();
  for(let i=0;i<3;i++){ctx.fillStyle='#c9ad70';ctx.beginPath();ctx.arc(.04,-2.5+i*.21,.028,0,TAU);ctx.fill();}
  ctx.fillStyle='#f9f1dd';shape(ctx,[[-.17,-3.13],[0,-2.93],[.17,-3.13],[.11,-3.3],[-.11,-3.3]]);ctx.fill();
  ctx.fillStyle='#263a32';shape(ctx,[[-.22,-3.19],[-.04,-3.12],[-.2,-3.03]]);ctx.fill();shape(ctx,[[.22,-3.19],[.04,-3.12],[.2,-3.03]]);ctx.fill();ctx.beginPath();ctx.arc(0,-3.12,.055,0,TAU);ctx.fill();
  ctx.fillStyle='#d5a980';ctx.fillRect(-.12,-3.46,.24,.23);
  ctx.save();ctx.translate(0,-3.73);ctx.rotate(-state.angle*.25);
  ctx.fillStyle='#bb8d68';ctx.beginPath();ctx.ellipse(-.3,.03,.09,.14,0,0,TAU);ctx.fill();
  const skin=ctx.createLinearGradient(-.3,0,.35,0);skin.addColorStop(0,'#e6c297');skin.addColorStop(.6,'#dfb38a');skin.addColorStop(1,'#ca9a72');ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,0,.31,.4,0,0,TAU);ctx.fill();
  ctx.fillStyle='#313c34';ctx.beginPath();ctx.moveTo(-.29,-.03);ctx.bezierCurveTo(-.45,-.44,.03,-.59,.3,-.31);ctx.bezierCurveTo(.44,-.11,.25,-.1,.18,-.24);ctx.bezierCurveTo(-.02,-.1,-.16,-.1,-.21,-.23);ctx.lineTo(-.24,.09);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#513d30';ctx.lineWidth=.027;ctx.beginPath();ctx.moveTo(-.17,-.015-state.danger*.04);ctx.lineTo(-.06,-.045);ctx.moveTo(.06,-.045);ctx.lineTo(.17,-.015-state.danger*.04);ctx.stroke();
  ctx.fillStyle='#413c2e';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*.11,.03,.023,.033,0,0,TAU);ctx.fill();}
  ctx.strokeStyle='#bd8f67';ctx.lineWidth=.022;ctx.beginPath();ctx.moveTo(.01,.02);ctx.lineTo(.055,.13);ctx.lineTo(-.025,.14);ctx.stroke();
  ctx.strokeStyle='#3d3c30';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(-.015,.18);ctx.quadraticCurveTo(-.09,.14,-.14,.21);ctx.moveTo(.015,.18);ctx.quadraticCurveTo(.09,.14,.14,.21);ctx.stroke();
  ctx.strokeStyle='#99674e';ctx.lineWidth=.018;ctx.beginPath();if(state.danger>.7)ctx.ellipse(0,.27,.04,.05,0,0,TAU);else{ctx.moveTo(-.055,.275);ctx.quadraticCurveTo(0,.3,.055,.275);}ctx.stroke();
  if(state.danger>.65){ctx.fillStyle='#a6c8bfbb';ctx.beginPath();ctx.ellipse(.33,-.03,.027,.07,.25,0,TAU);ctx.fill();}
  ctx.restore();ctx.restore();
 }
 function tray(state){
  ctx.save();ctx.translate(px(state.x),trayY);ctx.rotate(state.trayAngle);ctx.scale(scale,scale);
  ctx.fillStyle='#585c4b22';ctx.beginPath();ctx.ellipse(0,.13,1.05,.14,0,0,TAU);ctx.fill();
  const metal=ctx.createLinearGradient(0,-.13,0,.11);metal.addColorStop(0,'#d6d5be');metal.addColorStop(.35,'#f8f3d9');metal.addColorStop(.6,'#929d8e');metal.addColorStop(1,'#697e70');ctx.fillStyle=metal;ctx.strokeStyle='#718272';ctx.lineWidth=.022;ctx.beginPath();ctx.ellipse(0,.02,1.06,.12,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#fffbea';ctx.lineWidth=.025;ctx.beginPath();ctx.ellipse(0,-.015,1.02,.095,0,Math.PI,TAU);ctx.stroke();ctx.restore();
 }
 function glass(item,now,falling=false){
  let lift=0;if(!falling&&arrivals.has(item.index)){const age=Math.max(0,(now-arrivals.get(item.index))/1000);lift=Math.max(0,1-age/.35)**2*.5;if(age>1)arrivals.delete(item.index);}
  ctx.save();ctx.translate(px(item.x),py(item.y+lift));ctx.rotate(item.angle);ctx.scale(scale,scale);
  const bowl=()=>{ctx.beginPath();ctx.moveTo(-.245,-.6);ctx.bezierCurveTo(-.26,-.39,-.18,-.25,0,-.245);ctx.bezierCurveTo(.18,-.25,.26,-.39,.245,-.6);ctx.closePath();};
  const shine=ctx.createLinearGradient(-.25,0,.25,0);shine.addColorStop(0,'#f8ffff25');shine.addColorStop(.18,'#faffffb3');shine.addColorStop(.4,'#d9eee82b');shine.addColorStop(.8,'#ffffff80');shine.addColorStop(1,'#8bada84d');bowl();ctx.fillStyle=shine;ctx.fill();
  ctx.save();bowl();ctx.clip();ctx.rotate(-item.angle);const wine=ctx.createLinearGradient(0,-.43,0,-.23);wine.addColorStop(0,wineColors[item.index%3]+'b8');wine.addColorStop(1,wineColors[item.index%3]+'f0');ctx.fillStyle=wine;ctx.fillRect(-.5,-.415,1,.25);ctx.strokeStyle='#f8dec688';ctx.lineWidth=.012;ctx.beginPath();ctx.moveTo(-.5,-.415);ctx.lineTo(.5,-.415);ctx.stroke();ctx.restore();
  bowl();ctx.strokeStyle='#719087b8';ctx.lineWidth=.014;ctx.stroke();ctx.strokeStyle='#ffffffdb';ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(-.2,-.56);ctx.quadraticCurveTo(-.21,-.4,-.13,-.34);ctx.stroke();
  ctx.strokeStyle='#75948bc9';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(0,-.245);ctx.lineTo(0,-.04);ctx.stroke();ctx.strokeStyle='#ffffe3';ctx.lineWidth=.01;ctx.beginPath();ctx.moveTo(-.01,-.23);ctx.lineTo(-.01,-.04);ctx.stroke();
  ctx.fillStyle='#e7f0e38c';ctx.strokeStyle='#779289b8';ctx.lineWidth=.012;ctx.beginPath();ctx.ellipse(0,-.026,.17,.035,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(0,-.598,.245,.036,0,0,TAU);ctx.stroke();ctx.restore();
 }
 return {
  push(events,now=performance.now()){
   for(const event of events){if(event.type==='glass')arrivals.set(event.count-1,now);if(event.type==='break')for(let i=0;i<12;i++){const a=(i*2.4+event.index*.7),speed=.4+(i%5)*.35;shards.push({x:event.x,y:event.y,vx:Math.cos(a)*speed,vy:Math.abs(Math.sin(a))*speed+.3,born:now,color:i%3===0?wineColors[event.index%3]:'#e9fff3',rotation:a});}}
   shards=shards.slice(-150);
  },
  draw(state,now=performance.now(),{preview=false,reduced=false}={}){
   wall();const time=reduced||preview?0:now/1000;waiter(state,time);tray(state);
   if(state.phase==='falling'||state.phase==='lost'||state.phase==='paused'&&state.fallen.length){for(const item of state.fallen)if(!item.broken)glass(item,now,true);}
   else for(const item of state.stack)glass(item,now);
   shards=shards.filter(piece=>now-piece.born<4000);for(const piece of shards){const t=Math.max(0,(now-piece.born)/1000),flight=Math.min(t,.6),x=piece.x+piece.vx*flight,y=Math.max(-2.46,piece.y+piece.vy*t-4*t*t);ctx.save();ctx.translate(px(x),py(y));ctx.rotate(piece.rotation+(!reduced?flight*3:0));ctx.globalAlpha=Math.max(.15,1-t*.22);ctx.fillStyle=piece.color;ctx.strokeStyle='#748f8077';ctx.lineWidth=.6;shape(ctx,[[-3,-2],[3,-1],[0,3]]);ctx.fill();ctx.stroke();ctx.restore();}
  },
  reset(){shards=[];arrivals.clear();},
  dispose(){observer.disconnect();arrivals.clear();shards=[];}
 };
}
