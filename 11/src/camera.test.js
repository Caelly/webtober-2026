import test from 'node:test';
import assert from 'node:assert/strict';
import {HandCamera} from './camera.js';
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
function rig({pending=false,deny=false,ready=true}={}){
 let grant,raf,cancelled=0,terminated=0,stops=0,clock=1000;const calls=[],results=[],errors=[];
 const track={stop(){stops++;},addEventListener(type,callback){this[type]=callback;}};
 const stream={getTracks:()=>[track],getVideoTracks:()=>[track]};
 const video={play:async()=>{},pause(){this.paused=true;},readyState:2,currentTime:1};
 const worker={postMessage(data){calls.push(data);if(data.type==='init'&&ready)queueMicrotask(()=>this.onmessage({data:{type:'ready'}}));},terminate(){terminated++;}};
 const dependencies={media:{getUserMedia(options){assert.equal(options.audio,false);return deny?Promise.reject(new DOMException('refusé','NotAllowedError')):pending?new Promise(resolve=>grant=resolve):Promise.resolve(stream);}},worker:()=>worker,bitmap:async()=>({close(){}}),raf:callback=>{raf=callback;return 1;},caf:()=>cancelled++,now:()=>clock};
 const camera=new HandCamera({video,onResult:r=>results.push(r),onError:e=>errors.push(e),dependencies});
 return {camera,video,worker,track,stream,calls,results,errors,grant:()=>grant(stream),step:async()=>{clock+=80;raf(clock);await flush();},counts:()=>({stops,terminated,cancelled})};
}
test('aucune caméra ne s’ouvre avant start, puis les images vont seulement au worker local et stop libère tout',async()=>{
 const r=rig();assert.equal(r.video.srcObject,undefined);await r.camera.start();assert.ok(r.video.srcObject);await r.step();assert.equal(r.calls.at(-1).type,'frame');assert.equal(r.calls.at(-1).aspect,4/3);
 r.worker.onmessage({data:{type:'result',result:{landmarks:[]},capturedAt:1080}});assert.equal(r.results.length,1);
 r.camera.stop();r.camera.stop();assert.equal(r.video.srcObject,null);assert.equal(r.counts().stops,1);assert.equal(r.counts().terminated,1);
});
test('annuler pendant la demande de permission ferme un flux accordé tardivement, sans démarrer le worker',async()=>{
 const r=rig({pending:true});const started=r.camera.start();r.camera.stop();r.grant();await assert.rejects(started,{name:'AbortError'});assert.equal(r.counts().stops,1);assert.equal(r.calls.length,0);assert.equal(r.video.srcObject,null);
});
test('refuser la permission ne laisse aucune capture ni worker',async()=>{
 const r=rig({deny:true});await assert.rejects(r.camera.start(),{name:'NotAllowedError'});assert.equal(r.video.srcObject,null);assert.equal(r.calls.length,0);assert.equal(r.camera.stopped,true);
});
test('annuler le chargement du modèle coupe immédiatement les pistes et termine le worker',async()=>{
 const r=rig({ready:false});const started=r.camera.start();await flush();r.camera.stop();await assert.rejects(started,{name:'AbortError'});assert.equal(r.counts().stops,1);assert.equal(r.counts().terminated,1);
});
test('une caméra débranchée provoque une erreur et libère toutes les ressources une seule fois',async()=>{
 const r=rig();await r.camera.start();r.track.ended();r.track.ended();assert.equal(r.errors.length,1);assert.equal(r.errors[0].message,'disconnected');assert.equal(r.counts().terminated,1);assert.equal(r.video.srcObject,null);
});
test('un résultat ancien ou arrivé après stop ne peut déclencher un tir',async()=>{
 const r=rig();await r.camera.start();r.worker.onmessage({data:{type:'result',result:{landmarks:[]},capturedAt:0}});assert.equal(r.results.length,0);r.camera.stop();r.worker.onmessage({data:{type:'result',result:{landmarks:[]},capturedAt:1000}});assert.equal(r.results.length,0);
});

test('une erreur du modèle pendant le chargement termine le worker et coupe la caméra',async()=>{
 const r=rig({ready:false});const started=r.camera.start();await flush();r.worker.onmessage({data:{type:'error',message:'échec'}});await assert.rejects(started,{message:'model-error'});assert.equal(r.counts().stops,1);assert.equal(r.counts().terminated,1);assert.equal(r.errors.length,1);
});
