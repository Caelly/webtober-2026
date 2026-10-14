import {RULES} from './game.js';
const TAU=Math.PI*2;
function path(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
export function createStadium(canvas){
 const c=canvas.getContext('2d'),host=canvas.parentElement;let w=1,h=1,u=1,ground=1,camera=0,effects=[];
 function resize(){w=Math.max(1,host.clientWidth);h=Math.max(1,host.clientHeight);const dpr=Math.min(globalThis.devicePixelRatio||1,1.8);canvas.width=w*dpr;canvas.height=h*dpr;c.setTransform(dpr,0,0,dpr,0,0);u=Math.min(h/54,w/75);ground=h*.84;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const X=x=>(x-camera+3)*u,Y=y=>ground-y*u;
 function cloud(x,y,size){c.save();c.translate(x,y);c.scale(size,size);c.fillStyle='#fffaf093';c.beginPath();c.moveTo(-45,12);c.bezierCurveTo(-63,9,-53,-7,-36,-4);c.bezierCurveTo(-32,-30,6,-26,12,-9);c.bezierCurveTo(34,-20,54,-2,46,12);c.closePath();c.fill();c.restore();}
 function background(state){
  const sky=c.createLinearGradient(0,0,0,ground);sky.addColorStop(0,'#c5dce0');sky.addColorStop(.7,'#e7e7d3');sky.addColorStop(1,'#f0e6c9');c.fillStyle=sky;c.fillRect(0,0,w,h);
  c.fillStyle='#fbf1d6';c.beginPath();c.arc(w*.85-camera*u*.05,h*.235,Math.min(w*.073,h*.11),0,TAU);c.fill();
  cloud(w*.19-camera*u*.12,h*.19,Math.min(1,w/750));cloud(w*.66-camera*u*.08,h*.34,.62);cloud(w*.97-camera*u*.1,h*.1,.85);
  const horizon=ground-5.8*u;c.fillStyle='#a9bcb05c';c.beginPath();c.moveTo(0,horizon);for(let x=0;x<=w+20;x+=20)c.lineTo(x,horizon-Math.sin(x*.009+1)*12-20);c.lineTo(w,horizon+20);c.lineTo(0,horizon+20);c.fill();
  const spacing=11*u,shift=(camera*u*.22)%spacing;
  for(let x=-spacing-shift;x<w+spacing;x+=spacing){c.fillStyle='#849f8a60';c.beginPath();c.ellipse(x,horizon-1*u,2*u,3.3*u,0,0,TAU);c.fill();c.strokeStyle='#78937c55';c.lineWidth=1;c.beginPath();c.moveTo(x,horizon+2*u);c.lineTo(x,horizon-2.3*u);c.stroke();}
  // Low, sun-bleached stadium terraces and a gently curved canopy.
  c.fillStyle='#ebe5cf';path(c,[[0,horizon],[w,horizon-1.1*u],[w,ground-1.9*u],[0,ground-2.6*u]]);c.fill();
  for(let row=0;row<4;row++){const y=horizon+row*.68*u;c.fillStyle=row%2?'#b2b8a58a':'#d1ceb87a';c.fillRect(0,y,w,.37*u);for(let x=0;x<w;x+=2.3*u){c.fillStyle=['#8c9d8e70','#a9664d50','#e9ddc185'][(Math.round(x/(2.3*u))+row)%3];c.fillRect(x,y,.48*u,.35*u);}}
  c.strokeStyle='#9ca390';c.lineWidth=1;c.beginPath();c.moveTo(0,horizon-.3*u);c.quadraticCurveTo(w*.5,horizon-2.6*u,w,horizon-1*u);c.stroke();
  c.fillStyle='#718e7055';c.fillRect(0,ground-2.5*u,w,3*u);
  const grass=c.createLinearGradient(0,ground-2*u,0,h);grass.addColorStop(0,'#a5b58b');grass.addColorStop(1,'#859e73');c.fillStyle=grass;c.fillRect(0,ground-1.7*u,w,h-ground+1.7*u);
  // Track with staggered perspective lanes.
  c.fillStyle='#c57559';path(c,[[0,ground-.2*u],[w,ground+.1*u],[w,h],[0,h]]);c.fill();
  c.fillStyle='#b5664d';path(c,[[0,ground+3*u],[w,ground+2.3*u],[w,ground+3.2*u],[0,ground+4*u]]);c.fill();
  c.strokeStyle='#f4ddbeab';c.lineWidth=1.2;for(const row of [1.8,6.2,11.2]){c.beginPath();c.moveTo(0,ground+row*u);c.lineTo(w,ground+(row-.7)*u);c.stroke();}
  const line=X(RULES.line);c.fillStyle='#fff3d6';path(c,[[line-.24*u,ground-.1*u],[line+.23*u,ground-.1*u],[line+1.3*u,h],[line+.5*u,h]]);c.fill();
  c.save();c.translate(line+1.3*u,ground+4.6*u);c.rotate(-Math.PI/2);c.fillStyle='#78462e';c.font=`600 ${Math.max(8,.68*u)}px "DM Sans",sans-serif`;c.fillText('LIMITE',0,0);c.restore();
  // Distance markers are part of the stadium, never the score.
  c.strokeStyle='#eee5cb80';c.fillStyle='#e8ddc2b0';c.font=`${.75*u}px "DM Sans",sans-serif`;
  for(let x=50;x<180;x+=10){const sx=X(x);if(sx<-20||sx>w+20)continue;c.beginPath();c.moveTo(sx,ground-.25*u);c.lineTo(sx,ground+.5*u);c.stroke();}
  c.fillStyle='#fff3d72c';for(let i=0;i<130;i++){const x=(i*97.71)%w,y=ground+((i*37.31)%(h-ground));c.fillRect(x,y,.8,.8);}
  // Pennants frame the sky without obscuring the moving targets.
  c.strokeStyle='#718a8240';c.lineWidth=1;c.beginPath();c.moveTo(w*.52,-3);c.quadraticCurveTo(w*.75,h*.085,w+10,h*.04);c.stroke();
  for(let i=0;i<13;i++){const x=w*(.54+i*.04),t=(x-w*.52)/(w*.48),y=h*(.105*t-.065*t*t);c.fillStyle=i%2?'#cd806286':'#8fa68c9c';path(c,[[x,y],[x+u*.65,y+1],[x+u*.25,y+u*1.3]]);c.fill();}
 }
 function bird(x,y,kind,flap=0,angle=0,caught=false){
  c.save();c.translate(X(x),Y(y));c.rotate(-angle);c.scale(u,u);
  const colors=[['#879aa0','#4e626c'],['#adb3aa','#6d7f7e'],['#c4b5a3','#847e7a'],['#d9d8c7','#959f99']][kind%4];
  c.fillStyle='#445e615c';c.beginPath();c.ellipse(-.2,.75,1.3,.25,0,0,TAU);c.fill();
  c.fillStyle=colors[1];path(c,[[-.65,-.05],[-2.1,-.35],[-1.65,.35],[-.4,.45]]);c.fill();
  c.fillStyle=colors[0];c.beginPath();c.ellipse(-.18,0,1.13,.63,-.1,0,TAU);c.fill();
  const wing=caught?.45:Math.sin(flap)*.9;
  c.fillStyle=colors[1];c.beginPath();c.moveTo(.15,-.1);c.bezierCurveTo(-.2,-.6,-.9,-1.8-wing,-1.75,-1.6-wing);c.bezierCurveTo(-1.45,-.35-wing*.2,-.6,.5,.1,.4);c.closePath();c.fill();
  c.strokeStyle='#d4dcd080';c.lineWidth=.09;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-.45-i*.25,-.35);c.lineTo(-.94-i*.22,-1.06-wing*.5);c.stroke();}
  c.fillStyle='#66877d';c.beginPath();c.ellipse(.64,-.36,.43,.6,-.3,0,TAU);c.fill();c.fillStyle='#a08b9f';c.beginPath();c.ellipse(.74,-.3,.15,.29,-.35,0,TAU);c.fill();
  c.fillStyle=colors[1];c.beginPath();c.arc(.9,-.88,.46,0,TAU);c.fill();
  c.fillStyle='#c89457';path(c,[[1.23,-.91],[1.72,-.75],[1.21,-.66]]);c.fill();c.fillStyle='#eeedda';c.beginPath();c.arc(1.04,-.96,.13,0,TAU);c.fill();c.fillStyle='#273c3f';c.beginPath();c.arc(1.08,-.95,.065,0,TAU);c.fill();
  c.strokeStyle='#ab755b';c.lineWidth=.1;c.beginPath();c.moveTo(-.05,.5);c.lineTo(-.3,.9);c.moveTo(.25,.48);c.lineTo(.1,.85);c.stroke();
  c.restore();
 }
 function athlete(state){
  const moving=state.phase==='running'||(state.phase==='paused'&&!state.javelin);
  const x=X(state.x),y=ground,upright=!state.javelin,stride=moving?Math.sin(state.time*state.speed*1.7):0,lean=moving?.16:.05;
  c.fillStyle='#4c50352c';c.beginPath();c.ellipse(x,y+.17*u,2.2*u,.4*u,0,0,TAU);c.fill();
  c.save();c.translate(x,y);c.scale(u,u);c.rotate(lean);
  const limb=(points,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(...points[0]);points.slice(1).forEach(p=>c.lineTo(...p));c.stroke();};
  const feet=[];for(const side of [-1,1]){const knee=[side*stride*.9,-1.55],foot=[side*stride*1.65,-.22-Math.max(0,side*stride)*.5];limb([[side*.23,-3.1],knee,foot],side===-1?'#b78160':'#d8a07b',.46);feet.push(foot);}
  feet.forEach(([fx,fy])=>{c.fillStyle='#f4eed9';c.beginPath();c.ellipse(fx+.2,fy,.53,.2,-.05,0,TAU);c.fill();c.fillStyle='#b54f39';c.fillRect(fx-.18,fy-.08,.48,.08);});
  c.fillStyle='#344f55';path(c,[[-.64,-4.1],[.55,-4.1],[.7,-2.9],[.04,-2.9],[-.18,-3.4],[-.23,-2.9],[-.83,-3.0]]);c.fill();
  const jersey=c.createLinearGradient(-.7,0,.7,0);jersey.addColorStop(0,'#ac4d34');jersey.addColorStop(.6,'#da7952');jersey.addColorStop(1,'#ed9b67');c.fillStyle=jersey;path(c,[[-.5,-6.2],[.42,-6.2],[.73,-4.0],[-.65,-4.0]]);c.fill();
  c.fillStyle='#f7e7ca';c.fillRect(-.4,-5.5,.82,.7);c.fillStyle='#78543d';c.font='600 .52px sans-serif';c.textAlign='center';c.fillText('12',.01,-4.98);
  const hand=upright?[-1.5,-6.2]:[1.9,-5.4];limb([[-.33,-6],[-.95,-5.2],[-1.4,-4.9]],'#bd8562',.37);limb([[.38,-6],[.9,-6.7],hand],'#d8a07b',.4);
  c.fillStyle='#ce9673';c.fillRect(-.12,-6.65,.42,.65);c.beginPath();c.ellipse(.17,-7.15,.57,.73,.06,0,TAU);c.fill();c.fillStyle='#393c36';c.beginPath();c.ellipse(.05,-7.63,.62,.35,-.1,0,TAU);c.fill();c.fillRect(-.49,-7.63,.22,.62);c.fillStyle='#f4e8c9';c.fillRect(-.46,-7.45,1.1,.16);c.fillStyle='#393c36';c.beginPath();c.arc(.51,-7.18,.055,0,TAU);c.fill();
  if(upright){c.save();c.translate(hand[0],hand[1]-.2);c.rotate(-.04);shaft(0,0,1);c.restore();}
  c.restore();
 }
 function shaft(x,y,size){c.save();c.translate(x,y);c.scale(size,size);c.strokeStyle='#fbedd5';c.lineWidth=.15;c.beginPath();c.moveTo(-10,0);c.lineTo(-.9,0);c.stroke();c.strokeStyle='#51847d';c.lineWidth=.19;c.beginPath();c.moveTo(-6.7,0);c.lineTo(-4.6,0);c.stroke();c.fillStyle='#e6e8d9';path(c,[[-1.1,-.17],[.5,0],[-1.1,.17]]);c.fill();c.strokeStyle='#647d7a';c.lineWidth=.055;c.stroke();c.restore();}
 function javelin(j,reduced){
  if(!j)return;if(!reduced&&j.trail.length>1){c.strokeStyle='#fff9e477';c.lineWidth=1;c.setLineDash([3,6]);c.beginPath();j.trail.forEach((p,i)=>i?c.lineTo(X(p.x),Y(p.y)):c.moveTo(X(p.x),Y(p.y)));c.stroke();c.setLineDash([]);}
  j.caught.forEach((b,i)=>{const along=2.3+(i%7)*1.05;bird(j.x-Math.cos(j.angle)*along,j.y-Math.sin(j.angle)*along+(i>=7?1.6:0),b.kind,0,j.angle+(i%2?.15:-.2),true);});
  c.save();c.translate(X(j.x),Y(j.y));c.rotate(-j.angle);shaft(0,0,u);c.restore();
 }
 function draw(state,{preview=false,reduced=false}={}){
  const target=state.javelin?Math.max(0,Math.min(RULES.worldEnd-w/u+6,state.javelin.x-w/u*.62)):0;camera=target;
  background(state);
  for(const b of state.birds){if(!b.caught&&X(b.x)>-30&&X(b.x)<w+30)bird(b.x,b.y,b.kind,b.flap+(reduced?0:state.time*8));}
  athlete(state);javelin(state.javelin,reduced);
  for(const e of effects){const age=state.time-e.time;if(age<0||age>1)continue;c.save();c.globalAlpha=1-age;c.fillStyle='#315c55';c.font=`600 ${Math.max(15,u*1.8)}px "DM Sans",sans-serif`;c.textAlign='center';c.fillText('+1',X(e.x),Y(e.y)-age*35);c.restore();}
  if(state.phase==='running'){
   const near=state.progress>.72;c.fillStyle=near?'#a43d29':'#47695f';c.font=`600 ${Math.max(9,u*.9)}px "DM Sans",sans-serif`;c.textAlign='center';c.fillText(near?'LANCEZ !':'↑  ↓',X(state.x),ground-9.6*u);
   if(near){c.strokeStyle='#ac4a3680';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.moveTo(X(RULES.line),ground-9*u);c.lineTo(X(RULES.line),ground-u);c.stroke();c.setLineDash([]);}
  }
  if(preview){c.fillStyle='#355b55';c.font=`italic 500 ${Math.min(w*.068,h*.12)}px Georgia,serif`;c.textAlign='left';c.fillText('Drôles d’oiseaux.',w*.055,h*.21);}
 }
 return {draw,push(events,state){for(const e of events)if(e.type==='hit')effects.push({...e,time:state.time});effects=effects.filter(e=>state.time-e.time<1);},reset(){camera=0;effects=[];},dispose(){observer.disconnect();}};
}
