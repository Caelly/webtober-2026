import test from 'node:test';
import assert from 'node:assert/strict';
import {LocalMicrophone} from './microphone-core.js';

function environment(t,{permissionPending=false,modelPending=false}={}){
  const state={requested:0,contexts:[],workers:[],nodes:[],stops:0,events:new Map()};
  const stream={getTracks:()=>[track],getAudioTracks:()=>[track]},track={stop(){state.stops++;},addEventListener(name,fn){state.events.set(name,fn);}};
  class Node {constructor(){this.port={close:()=>{this.port.closed=true;}};state.nodes.push(this);}connect(node){return node;}disconnect(){this.disconnected=true;}}
  class Context {constructor(){state.contexts.push(this);this.audioWorklet={addModule:async url=>{this.module=url;}};this.destination={};}async resume(){}createMediaStreamSource(){return new Node();}createGain(){const node=new Node();node.gain={value:1};return node;}async close(){this.closed=true;}}
  class Worker {constructor(){state.workers.push(this);}postMessage(data){this.last=data;if(data.type==='init'&&!modelPending)queueMicrotask(()=>this.onmessage({data:{type:'ready'}}));}terminate(){this.terminated=true;}}
  const replacements={window:{AudioContext:Context,AudioWorkletNode:Node},AudioContext:Context,AudioWorkletNode:Node,Worker,location:{href:'https://example.test/5'},navigator:{mediaDevices:{getUserMedia:()=>{state.requested++;return permissionPending?new Promise(resolve=>{state.allow=()=>resolve(stream);}):Promise.resolve(stream);}}}};
  const previous=new Map();for(const [key,value]of Object.entries(replacements)){previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true});}
  t.after(()=>{for(const [key,descriptor]of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
  return state;
}
const callbacks={onResult:()=>{},onLevel:()=>{},onError:()=>{},captureUrl:'/capture.js'};
test('the microphone is opt-in, emits local classifications and releases every resource on stop',async t=>{
  const state=environment(t),results=[];const mic=new LocalMicrophone({...callbacks,onResult:result=>results.push(result)});
  assert.equal(state.requested,0);await mic.start();assert.equal(state.requested,1);assert.equal(mic.mute.gain.value,0);
  mic.capture.port.onmessage({data:{type:'frame',samples:new Float32Array(15600),rate:16000}});
  assert.equal(state.workers[0].last.type,'frame');assert.equal(mic.busy,true);
  state.workers[0].onmessage({data:{type:'result',capturedAt:42,categories:[{categoryName:'Belly laugh',score:.8}]}});
  assert.equal(results[0].laugh,true);assert.equal(results[0].capturedAt,42);assert.equal(mic.busy,false);
  mic.stop();mic.stop();assert.equal(state.stops,1);assert.equal(state.workers[0].terminated,true);assert.equal(state.contexts[0].closed,true);assert.equal(mic.capture.port.closed,true);
  assert.ok(state.nodes.every(node=>node.disconnected));
});
test('cancel while browser permission is pending stops a subsequently granted stream without opening an audio context',async t=>{
  const state=environment(t,{permissionPending:true}),mic=new LocalMicrophone(callbacks),started=mic.start();
  mic.stop();state.allow();await assert.rejects(started,{name:'AbortError'});assert.equal(state.stops,1);assert.equal(state.contexts.length,0);
});
test('cancel while the model is loading terminates the worker and the already-open microphone',async t=>{
  const state=environment(t,{modelPending:true}),mic=new LocalMicrophone(callbacks),started=mic.start();
  await new Promise(resolve=>setImmediate(resolve));assert.equal(state.workers.length,1);mic.stop();
  await assert.rejects(started,{name:'AbortError'});assert.equal(state.stops,1);assert.equal(state.workers[0].terminated,true);assert.equal(state.contexts[0].closed,true);
});
test('a denied permission or a disconnected microphone never leaves a live stream behind',async t=>{
  const state=environment(t);let ended;const mic=new LocalMicrophone({...callbacks,onError:error=>{ended=error;mic.stop();}});
  await mic.start();state.events.get('ended')();assert.equal(ended.message,'disconnected');assert.equal(state.stops,1);
  navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};
  const denied=new LocalMicrophone(callbacks);await assert.rejects(denied.start(),{name:'NotAllowedError'});assert.equal(denied.stopped,true);
});
