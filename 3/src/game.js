export function shuffle(items, random=Math.random) {
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}

export function createGame(characters, random=Math.random) {
  let queue,found,target,solved;
  function reset(){queue=shuffle(characters,random);found=new Set();target=queue.shift();solved=false;}
  function guess(id){
    if(solved||!target)return 'inactive';
    if(id!==target.id)return 'wrong';
    found.add(id);solved=true;return 'correct';
  }
  function next(){if(!solved)return false;target=queue.shift()||null;solved=false;return true;}
  reset();
  return {reset,guess,next,get target(){return target;},get found(){return new Set(found);},get solved(){return solved;},get complete(){return !target;}};
}

export function pileLayout(count, compact=false, random=Math.random) {
  if(!Number.isInteger(count)||count<1)throw new RangeError('Le nombre de miniatures doit être un entier positif.');
  const rowCount=Math.max(1,Math.round(Math.sqrt(count)*(compact?1.4:.85)));
  const weights=Array.from({length:rowCount},(_,row)=>Math.sqrt(1-(((row+.5)/rowCount*2-1)*.94)**2));
  const total=weights.reduce((sum,value)=>sum+value,0),rows=weights.map(weight=>Math.floor(count*weight/total));
  let missing=count-rows.reduce((sum,value)=>sum+value,0);
  const middleFirst=rows.map((_,row)=>row).sort((a,b)=>Math.abs(a-rowCount/2)-Math.abs(b-rowCount/2));
  for(let i=0;missing;i++,missing--)rows[middleFirst[i%rowCount]]++;
  const spacing=67,width=Math.max(...rows)*spacing+100,height=(rowCount-1)*57+150;
  const points=[];
  rows.forEach((length,row)=>{
    for(let col=0;col<length;col++)points.push({
      x:width/2+(col-(length-1)/2)*spacing-40+(random()-.5)*9,
      y:22+row*57+(random()-.5)*9,
      angle:(random()-.5)*34,
    });
  });
  return {width,height,points};
}

export function clampCamera(camera,width,height) {
  const zoom=Math.max(1,Math.min(8,camera.zoom));
  return {zoom,x:Math.max(0,Math.min(width-width/zoom,camera.x)),y:Math.max(0,Math.min(height-height/zoom,camera.y))};
}

export function zoomCamera(camera,zoom,width,height,anchor={x:.5,y:.5}) {
  const nextZoom=Math.max(1,Math.min(8,zoom));
  return clampCamera({zoom:nextZoom,
    x:camera.x+width/camera.zoom*anchor.x-width/nextZoom*anchor.x,
    y:camera.y+height/camera.zoom*anchor.y-height/nextZoom*anchor.y,
  },width,height);
}
