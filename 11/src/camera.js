export class HandCamera {
 constructor({video,onResult,onError,onStatus=()=>{},dependencies={}}){
  Object.assign(this,{video,onResult,onError,onStatus,stopped:false,busy:false});
  this.deps={media:globalThis.navigator?.mediaDevices,worker:()=>new Worker(new URL('./hand-worker.js',import.meta.url),{type:'module'}),bitmap:(source)=>createImageBitmap(source,{resizeWidth:480,resizeHeight:360,resizeQuality:'low'}),raf:callback=>requestAnimationFrame(callback),caf:id=>cancelAnimationFrame(id),now:()=>performance.now(),...dependencies};
 }
 async start(){
  try{
   if(!this.deps.media?.getUserMedia)throw new Error('unsupported');
   this.onStatus('Autorisez la caméra dans votre navigateur.');
   const stream=await this.deps.media.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}}});
   if(this.stopped){stream.getTracks().forEach(track=>track.stop());throw new DOMException('Annulé','AbortError');}
   this.stream=stream;stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(!this.stopped)this.fail(new Error('disconnected'));}));
   this.video.srcObject=stream;this.video.muted=true;this.video.playsInline=true;await this.video.play();
   if(this.stopped)throw new DOMException('Annulé','AbortError');
   this.onStatus('Les mains se préparent…');
   this.worker=this.deps.worker();
   await new Promise((resolve,reject)=>{
    this.rejectReady=reject;this.timeout=setTimeout(()=>reject(new Error('model-timeout')),35000);
    this.worker.onmessage=({data})=>{
     if(this.stopped)return;
     if(data.type==='ready'){clearTimeout(this.timeout);this.rejectReady=null;resolve();}
     else if(data.type==='result'){this.busy=false;this.lastResponse=this.deps.now();if(this.lastResponse-data.capturedAt<700)this.onResult(data.result,data.capturedAt);}
     else if(data.type==='error'){reject(new Error('model-error'));this.fail(new Error('model-error'));}
    };
    this.worker.onerror=()=>{reject(new Error('model-error'));this.fail(new Error('model-error'));};
    this.worker.postMessage({type:'init',base:new URL('/',globalThis.location?.href||'http://localhost/').href});
   });
   if(this.stopped)throw new DOMException('Annulé','AbortError');
   this.lastVideo=-1;this.lastCapture=-Infinity;this.lastResponse=this.deps.now();
   const tick=now=>{
    if(this.stopped)return;
    if(this.busy&&now-this.lastResponse>5000){this.fail(new Error('tracking-stalled'));return;}
    if(!this.busy&&this.video.readyState>=2&&this.video.currentTime!==this.lastVideo&&now-this.lastCapture>=65){
     this.busy=true;this.lastCapture=now;this.lastVideo=this.video.currentTime;
     this.deps.bitmap(this.video).then(bitmap=>{
      if(this.stopped){bitmap.close();return;}
      try{this.worker.postMessage({type:'frame',bitmap,capturedAt:now,aspect:4/3},[bitmap]);}catch(error){bitmap.close();throw error;}
     }).catch(error=>{if(!this.stopped)this.fail(error);});
    }
    this.raf=this.deps.raf(tick);
   };
   this.raf=this.deps.raf(tick);
  }catch(error){this.stop();throw error;}
 }
 fail(error){if(this.stopped)return;this.stop();this.onError(error);}
 stop(){
  if(this.stopped)return;this.stopped=true;clearTimeout(this.timeout);this.rejectReady?.(new DOMException('Annulé','AbortError'));this.rejectReady=null;
  this.deps.caf(this.raf);this.worker?.terminate();this.stream?.getTracks().forEach(track=>track.stop());this.video.pause();this.video.srcObject=null;
 }
}
