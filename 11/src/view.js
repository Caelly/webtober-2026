const colors={left:'#77f4da',right:'#ffbc79',single:'#7bf8ed',double:'#d6b2ff'};
const polygon=(ctx,points)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();};
export function createView(canvas){
 const ctx=canvas.getContext('2d'),host=canvas.parentElement;let width=1,height=1,effects=[],recoil={left:0,right:0},last=0;
 let seed=111;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const stars=Array.from({length:65},()=>({x:rand(),y:rand()*.7,r:.4+rand()*1.3}));
 const buildings=Array.from({length:27},(_,i)=>({x:i/26-.03,w:.025+rand()*.035,h:.04+rand()*.17,seed:rand()}));
 const demo=Array.from({length:7},(_,i)=>({id:i,x:.23+(i%4)*.18,y:.25+Math.floor(i/4)*.2,r:i===4?.044:.033,kind:i===4?'heavy':i%3===0?'dart':'drone',hp:1,maxHp:1,age:i}));
 function resize(){width=host.clientWidth;height=host.clientHeight;const dpr=Math.min(devicePixelRatio,1.7);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function background(t){
  const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,'#07141b');gradient.addColorStop(.6,'#102d35');gradient.addColorStop(1,'#102028');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
  const halo=ctx.createRadialGradient(width*.5,height*.35,0,width*.5,height*.35,width*.55);halo.addColorStop(0,'#3d776022');halo.addColorStop(1,'#16333900');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#83bebc';for(const star of stars){ctx.globalAlpha=.2+Math.sin(star.x*20+t*.3)*.12;ctx.fillRect(star.x*width,star.y*height,star.r,star.r);}ctx.globalAlpha=1;
  ctx.save();ctx.beginPath();ctx.ellipse(width*.79,height*.18,Math.min(width*.09,height*.15),Math.min(width*.09,height*.15),0,0,Math.PI*2);const planet=ctx.createLinearGradient(width*.7,0,width*.87,height*.3);planet.addColorStop(0,'#8cb0a42b');planet.addColorStop(1,'#17262c');ctx.fillStyle=planet;ctx.fill();ctx.restore();
  for(let layer=0;layer<2;layer++){
   ctx.fillStyle=layer?'#0a1b24':'#132c32';
   for(const b of buildings){const x=(b.x+(layer?.017:0))*width,y=height*(.67-b.h*(layer?1.25:.8));ctx.fillRect(x,y,b.w*width,height*.72-y);ctx.fillRect(x+b.w*width*.4,y-7,b.w*width*.1,8);
    if(layer){ctx.fillStyle='#83dbca20';for(let i=0;i<5;i++)for(let j=0;j<3;j++)if((i+j+b.seed*10)%3>1)ctx.fillRect(x+5+j*7,y+9+i*11,2,3);ctx.fillStyle='#0a1b24';}
   }
  }
  const horizon=height*.69;ctx.strokeStyle='#6dd8c21a';ctx.lineWidth=1;
  for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(width*.5+i*width*.018,horizon);ctx.lineTo(width*.5+i*width*.16,height);ctx.stroke();}
  for(let i=1;i<10;i++){const y=horizon+(height-horizon)*(i/10)**2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
  ctx.fillStyle='#08161d';ctx.beginPath();ctx.ellipse(width*.5,height*1.015,width*.26,height*.12,0,Math.PI,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#7ff1d555';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(width*.5,height*1.015,width*.26,height*.12,0,Math.PI,Math.PI*2);ctx.stroke();
  for(let i=0;i<6;i++){const x=width*(.34+i*.064);ctx.fillStyle='#1d3a40';ctx.fillRect(x,height*.925,width*.035,height*.075);ctx.fillStyle='#8ae7cc';ctx.fillRect(x+width*.006,height*.934,width*.022,3);}
 }
 function enemy(e,t){
  const x=e.x*width,y=e.y*height,sx=e.r*width,sy=Math.max(e.r*height,13),accent=e.kind==='heavy'?'#ffb379':e.kind==='dart'?'#c6afff':'#89e6d7';
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*1.6+e.id)*.07);ctx.scale(sx,sy);
  ctx.shadowColor=accent;ctx.shadowBlur=9;ctx.fillStyle=accent+'35';ctx.beginPath();ctx.ellipse(0,.65,.8,.32,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#2e4550';ctx.strokeStyle='#92a4a0';ctx.lineWidth=.055;
  polygon(ctx,[[-1,-.12],[-1.32,.2],[-.84,.5],[-.54,.2],[.54,.2],[.84,.5],[1.32,.2],[1,-.12],[.53,-.3],[-.53,-.3]]);ctx.fill();ctx.stroke();
  const shell=ctx.createLinearGradient(0,-.8,0,.7);shell.addColorStop(0,'#9bafa9');shell.addColorStop(.25,'#526b6f');shell.addColorStop(.6,'#203943');shell.addColorStop(1,'#0c2029');ctx.fillStyle=shell;
  polygon(ctx,e.kind==='heavy'?[[-.8,-.65],[.55,-.8],[.87,-.2],[.66,.5],[-.65,.5],[-.9,-.15]]:e.kind==='dart'?[[0,-.9],[.8,.55],[0,.25],[-.8,.55]]:[[-.5,-.6],[.52,-.6],[.82,-.12],[.6,.53],[-.57,.53],[-.83,-.12]]);ctx.fill();ctx.stroke();
  ctx.fillStyle='#07151e';ctx.fillRect(-.55,-.18,1.1,.34);ctx.shadowBlur=12;ctx.shadowColor=accent;ctx.fillStyle=accent;ctx.fillRect(-.41,-.08,.82,.11);ctx.shadowBlur=0;
  ctx.strokeStyle=accent+'a0';ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(-.39,-.45);ctx.lineTo(.35,-.45);ctx.stroke();
  for(let side of [-1,1]){ctx.fillStyle='#12222b';ctx.beginPath();ctx.ellipse(side*.98,.24,.16,.21,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=accent;ctx.fillRect(side*.98-.06,.23,.12,.21+Math.sin(t*7+side)*.06);}
  ctx.restore();
  if(e.maxHp>1){ctx.fillStyle='#07131b';ctx.fillRect(x-sx*.55,y-sy*1.15,sx*1.1,3);ctx.fillStyle=accent;ctx.fillRect(x-sx*.55,y-sy*1.15,sx*1.1*e.hp/e.maxHp,3);}
 }
 function gun(hand,aim,t){
  const origin={x:(hand==='left'?.16:.84)*width,y:height*.96},target=aim||{x:hand==='left'?.38:.62,y:.35};
  const angle=Math.atan2(target.y*height-origin.y,target.x*width-origin.x)+Math.PI/2,scale=Math.max(.48,Math.min(1.1,width/1100,height/520));
  const kick=Math.max(0,recoil[hand]-(t-last)*3.5);recoil[hand]=kick;
  ctx.save();ctx.translate(origin.x,origin.y+kick*14);ctx.rotate(angle-kick*.08);ctx.scale(scale,scale);
  const side=hand==='left'?-1:1;
  ctx.fillStyle='#152e38';polygon(ctx,[[-32,8],[-10,6],[55*side,150],[0,170]]);ctx.fill();ctx.strokeStyle='#4d7378';ctx.lineWidth=2;ctx.stroke();
  const grip=ctx.createLinearGradient(-25,0,28,0);grip.addColorStop(0,'#13212b');grip.addColorStop(.55,'#44626a');grip.addColorStop(1,'#112530');ctx.fillStyle=grip;
  polygon(ctx,[[-23,-12],[21,-12],[30,58],[-8,74],[-28,43]]);ctx.fill();ctx.strokeStyle='#678487';ctx.stroke();
  ctx.fillStyle='#12212c';ctx.strokeStyle='#526c75';polygon(ctx,[[-32,-119],[-17,-149],[20,-145],[34,-116],[30,-24],[18,-3],[-27,-10],[-36,-43]]);ctx.fill();ctx.stroke();
  const metal=ctx.createLinearGradient(-27,0,28,0);metal.addColorStop(0,'#293f4a');metal.addColorStop(.4,'#71868b');metal.addColorStop(.62,'#3d5a65');metal.addColorStop(1,'#172f3c');ctx.fillStyle=metal;polygon(ctx,[[-24,-124],[-12,-139],[14,-137],[25,-119],[21,-43],[-24,-42]]);ctx.fill();
  ctx.fillStyle='#0a1c26';ctx.fillRect(-16,-135,30,14);ctx.fillStyle=colors[hand];ctx.shadowColor=colors[hand];ctx.shadowBlur=10;ctx.fillRect(-10,-132,18,4);ctx.fillRect(-18,-91,4,34);ctx.shadowBlur=0;
  for(let i=0;i<4;i++){ctx.fillStyle='#122d37';ctx.fillRect(-6,-116+i*10,20,4);}
  ctx.fillStyle='#d4e6dd';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(hand==='left'?'L—01':'R—02',4,-25);
  ctx.strokeStyle='#142a34';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-17,12+i*9);ctx.lineTo(19,12+i*9);ctx.stroke();}
  if(kick>.1){ctx.fillStyle=colors[hand];ctx.shadowBlur=22;ctx.shadowColor=colors[hand];polygon(ctx,[[-12,-145],[-3,-183],[6,-155],[16,-167],[14,-143]]);ctx.fill();ctx.shadowBlur=0;}
  ctx.restore();
 }
 function crosshair(hand){const x=hand.aim.x*width,y=hand.aim.y*height,color=colors[hand.id],r=hand.circle?19:14;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.3;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(x,y,r,.2,Math.PI*2-.2);ctx.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*(r-4),y+Math.sin(a)*(r-4));ctx.lineTo(x+Math.cos(a)*(r+5),y+Math.sin(a)*(r+5));ctx.stroke();}if(hand.circle){ctx.strokeStyle=hand.doubleCircle?'#d6b2ff':color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+6,-Math.PI/2,-Math.PI/2+Math.max(.02,hand.circleProgress||0)*Math.PI*2);ctx.stroke();}ctx.fillStyle=color;ctx.fillRect(x-1.5,y-1.5,3,3);ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(hand.circle?'LASER':hand.id==='left'?'INDEX G':'INDEX D',x,y+r+16);ctx.restore();}
 function effect(e,now){const age=(now-e.born)/1000,life=e.type==='laser'?.7:e.type==='kill'?.65:e.type==='breach'?.4:.2;if(age>life)return false;
  ctx.save();ctx.globalAlpha=1-age/life;
  if(e.type==='laser'){
   const color=colors[e.kind],start=e.start,end=e.end,lineWidth=e.width*width;
   ctx.lineCap='round';ctx.strokeStyle=color+'22';ctx.lineWidth=lineWidth*1.8;ctx.beginPath();ctx.moveTo(start.x*width,start.y*height);ctx.lineTo(end.x*width,end.y*height);ctx.stroke();ctx.shadowColor=color;ctx.shadowBlur=35;ctx.strokeStyle=color;ctx.lineWidth=lineWidth*.58;ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#effffd';ctx.lineWidth=lineWidth*.18;ctx.stroke();
  }else if(e.type==='shot'){
   ctx.strokeStyle=colors[e.hand];ctx.lineWidth=2;ctx.shadowBlur=13;ctx.shadowColor=colors[e.hand];ctx.beginPath();ctx.moveTo((e.hand==='left'?.16:.84)*width,height*.91);ctx.lineTo(e.aim.x*width,e.aim.y*height);ctx.stroke();
  }else if(e.type==='kill'||e.type==='hit'){
   const x=e.x*width,y=e.y*height;ctx.fillStyle=e.type==='kill'?'#9cffe3':'#ffcb8c';for(let i=0;i<9;i++){const a=i/9*Math.PI*2,d=age*(e.type==='kill'?100:50);ctx.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,3,3);}if(e.type==='kill'){ctx.font='600 13px monospace';ctx.textAlign='center';ctx.fillText('+5 ÉNERGIE',x,y-age*55-13);}
  }else if(e.type==='breach'){ctx.strokeStyle='#ff9a7d';ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x*width,height*.86,age*100,0,Math.PI*2);ctx.stroke();}
  ctx.restore();return true;
 }
 return {
  push(events){for(const event of events){if(['laser','shot','kill','hit','breach'].includes(event.type))effects.push({...event,born:performance.now()});if(event.type==='shot')recoil[event.hand]=1;}effects=effects.slice(-90);},
  draw(state,hands=[],now=performance.now(),isDemo=false,still=false){const time=still?1:now/1000;background(time);for(const e of isDemo?demo:state.enemies)enemy(e,time);effects=effects.filter(e=>effect(e,now));if(still)recoil={left:0,right:0};for(const id of ['left','right'])gun(id,hands.find(hand=>hand.id===id)?.aim,now/1000);for(const hand of hands)crosshair(hand);last=now/1000;},
  clear(){effects=[];},
  dispose(){observer.disconnect();effects=[];}
 };
}
export function drawHands(canvas,result){const ctx=canvas.getContext('2d');canvas.width=320;canvas.height=240;ctx.clearRect(0,0,320,240);const links=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
 for(const [i,points] of (result.landmarks||[]).entries()){ctx.strokeStyle=i?'#ffbc79':'#77f4da';ctx.lineWidth=2;for(const [a,b] of links){ctx.beginPath();ctx.moveTo((1-points[a].x)*320,points[a].y*240);ctx.lineTo((1-points[b].x)*320,points[b].y*240);ctx.stroke();}ctx.fillStyle=ctx.strokeStyle;for(const point of points){ctx.beginPath();ctx.arc((1-point.x)*320,point.y*240,2,0,Math.PI*2);ctx.fill();}}
}
