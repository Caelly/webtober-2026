import {createFigurineStudio} from './figurine-studio.js';

export function showPlush(canvas,character,rarity){
  const studio=createFigurineStudio(canvas);studio.setModel(character,rarity);
  let disposed=false,raf,drag=null,yaw=studio.angle,pitch=0,manual=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now();
  function resize(){const r=canvas.getBoundingClientRect();studio.resize(r.width,r.height);}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const down=event=>{manual=true;drag={x:event.clientX,y:event.clientY,yaw,pitch};canvas.setPointerCapture(event.pointerId);};
  const move=event=>{if(!drag)return;yaw=Math.max(-1.35,Math.min(1.35,drag.yaw+(event.clientX-drag.x)*.012));pitch=Math.max(-.28,Math.min(.28,drag.pitch+(event.clientY-drag.y)*.006));};
  const up=()=>{drag=null;};
  const key=event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();manual=true;if(event.key==='ArrowLeft')yaw-=.12;if(event.key==='ArrowRight')yaw+=.12;if(event.key==='ArrowUp')pitch=Math.max(-.28,pitch-.06);if(event.key==='ArrowDown')pitch=Math.min(.28,pitch+.06);};
  canvas.tabIndex=0;canvas.setAttribute('aria-label',`Figurine 3D de ${character.name}`);
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);canvas.addEventListener('keydown',key);
  function frame(now){if(disposed)return;raf=requestAnimationFrame(frame);if(document.hidden)return;studio.rotate(manual||reduced?yaw:yaw+Math.sin((now-start)/2100)*.16,pitch);studio.render();}raf=requestAnimationFrame(frame);
  return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();for(const [type,handler] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['keydown',key]])canvas.removeEventListener(type,handler);studio.dispose();};
}
