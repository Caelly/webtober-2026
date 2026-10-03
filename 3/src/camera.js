import {clampCamera,zoomCamera} from './game.js';

export function bindPileCamera(pile,preview) {
  let world={width:1100,height:620},camera={x:0,y:0,zoom:1},positions=new Map(),drag=null,suppressClick=false,keyboardFocus=false;
  const out=document.querySelector('#zoom-out'),plus=document.querySelector('#zoom-in'),overview=document.querySelector('#zoom-reset');
  function apply(){
    camera=clampCamera(camera,world.width,world.height);
    pile.setAttribute('viewBox',`${camera.x} ${camera.y} ${world.width/camera.zoom} ${world.height/camera.zoom}`);
    overview.textContent=`${Math.round(camera.zoom*100)} %`;
    out.disabled=camera.zoom===1;plus.disabled=camera.zoom===8;pile.classList.toggle('is-zoomed',camera.zoom>1);
  }
  function zoom(value,anchor){camera=zoomCamera(camera,value,world.width,world.height,anchor);apply();}
  plus.addEventListener('click',()=>zoom(camera.zoom*1.5));
  out.addEventListener('click',()=>zoom(camera.zoom/1.5));
  overview.addEventListener('click',()=>zoom(1));
  pile.addEventListener('wheel',event=>{
    if(preview)return;event.preventDefault();
    const r=pile.getBoundingClientRect(),vw=world.width/camera.zoom,vh=world.height/camera.zoom;
    const scale=Math.min(r.width/vw,r.height/vh),left=r.left+(r.width-vw*scale)/2,top=r.top+(r.height-vh*scale)/2;
    zoom(camera.zoom*(event.deltaY<0?1.15:1/1.15),{x:Math.max(0,Math.min(1,(event.clientX-left)/(vw*scale))),y:Math.max(0,Math.min(1,(event.clientY-top)/(vh*scale)))});
  },{passive:false});
  // Capture only after a drag starts: an ordinary click must still reach its doll.
  pile.addEventListener('pointerdown',event=>{
    keyboardFocus=false;
    if(preview||camera.zoom===1||event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,camera:{...camera},moved:false};
  });
  pile.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    drag.moved=true;pile.setPointerCapture(event.pointerId);
    const r=pile.getBoundingClientRect(),scale=Math.min(r.width/(world.width/camera.zoom),r.height/(world.height/camera.zoom));
    camera={...drag.camera,x:drag.camera.x-dx/scale,y:drag.camera.y-dy/scale};apply();
  });
  pile.addEventListener('pointerup',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    suppressClick=drag.moved;if(pile.hasPointerCapture(event.pointerId))pile.releasePointerCapture(event.pointerId);drag=null;
  });
  pile.addEventListener('pointercancel',()=>{drag=null;suppressClick=false;});
  pile.addEventListener('click',event=>{if(suppressClick){suppressClick=false;event.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboardFocus=true;},true);
  pile.addEventListener('focusin',event=>{
    if(camera.zoom===1||!keyboardFocus)return;
    const point=positions.get(event.target.closest('[data-doll]')?.dataset.doll);if(!point)return;
    const vw=world.width/camera.zoom,vh=world.height/camera.zoom;
    if(point.x<camera.x+50||point.x>camera.x+vw-50||point.y<camera.y+50||point.y>camera.y+vh-50){camera={...camera,x:point.x-vw/2,y:point.y-vh/2};apply();}
  });
  return {reset(width,height,nextPositions){world={width,height};positions=nextPositions;camera={x:0,y:0,zoom:1};drag=null;suppressClick=false;apply();}};
}
