export function bindScratch(canvas,fakeCode,onReveal){
 const context=canvas.getContext('2d',{willReadFrequently:true});
 const width=canvas.width,height=canvas.height;
 const gradient=context.createLinearGradient(0,0,width,height);gradient.addColorStop(0,'#c1b8a4');gradient.addColorStop(.5,'#8e8b7d');gradient.addColorStop(1,'#c4bca9');
 context.fillStyle=gradient;context.fillRect(0,0,width,height);
 for(let i=0;i<width;i+=7){context.strokeStyle='#ffffff14';context.beginPath();context.moveTo(i,0);context.lineTo(i-40,height);context.stroke();}
 context.fillStyle='#3b3b32';context.textAlign='center';context.textBaseline='middle';context.font='bold 50px monospace';context.fillText(fakeCode,width/2,height/2);
 let previous=null,revealed=false,keyboardColumn=0;
 function check(){const data=context.getImageData(0,0,width,height).data;let erased=0,total=0;for(let i=3;i<data.length;i+=16){total++;if(data[i]<64)erased++;}if(erased/total>=.45&&!revealed){revealed=true;canvas.hidden=true;onReveal();}}
 function scratch(x,y){if(revealed)return;context.globalCompositeOperation='destination-out';context.lineWidth=height*.65;context.lineCap='round';context.beginPath();context.moveTo(previous?.x??x,previous?.y??y);context.lineTo(x,y);context.stroke();previous={x,y};check();}
 function location(event){const rect=canvas.getBoundingClientRect();return {x:(event.clientX-rect.left)*width/rect.width,y:(event.clientY-rect.top)*height/rect.height};}
 canvas.onpointerdown=e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);previous=location(e);scratch(previous.x,previous.y);};
 canvas.onpointermove=e=>{if(!canvas.hasPointerCapture(e.pointerId))return;const p=location(e);scratch(p.x,p.y);};
 canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>{previous=null;};
 canvas.onkeydown=e=>{if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();if(revealed)return;context.globalCompositeOperation='destination-out';context.clearRect(keyboardColumn*width/5,0,width/5,height);keyboardColumn++;check();};
}
