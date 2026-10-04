export function pointerIntent({button,pointerType},onSpine){
  if(pointerType==='touch')return onSpine?'pull':'rotate';
  if(button===2)return 'rotate';
  return button===0&&onSpine?'pull':null;
}

export function createSpinePull(id,start,{pointerType='mouse'}={}){
  const index=Number(id.replace(/\D/g,''))||1;
  const threshold=(pointerType==='touch'?64:82)+(index%5)*5;
  return {
    id,threshold,
    sample(point){
      const dx=point.x-start.x,dy=point.y-start.y,distance=Math.hypot(dx,dy);
      const tension=Math.min(1,Math.max(0,(distance-5)/(threshold-5)));
      // The hand travels much farther than the needle before its root gives way.
      const extension=.14*(1-Math.exp(-tension*1.5));
      return {dx,dy,distance,tension,extension,detached:distance>=threshold};
    },
  };
}

export function springStep(value,velocity,target,seconds){
  const dt=Math.min(.025,Math.max(0,seconds));
  const force=(target-value)*230-velocity*19;
  const nextVelocity=velocity+force*dt;
  return {value:value+nextVelocity*dt,velocity:nextVelocity};
}
