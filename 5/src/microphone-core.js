import {createLaughGate} from './battle.js';

export class LocalMicrophone {
  constructor({onResult,onLevel,onError,onStatus=()=>{},captureUrl}){Object.assign(this,{onResult,onLevel,onError,onStatus,captureUrl,stopped:false,busy:false,gate:createLaughGate()});}
  async start(){
    if(!navigator.mediaDevices?.getUserMedia||!window.AudioContext||!window.AudioWorkletNode)throw new Error('unsupported');
    try {
      this.onStatus('Autorise le micro dans la fenêtre du navigateur.');
      // Speech-oriented noise filters can erase soft, breathy laughs.
      const stream=await navigator.mediaDevices.getUserMedia({video:false,audio:{channelCount:1,echoCancellation:false,noiseSuppression:false,autoGainControl:true}});
      if(this.stopped){stream.getTracks().forEach(track=>track.stop());throw new DOMException('Cancelled','AbortError');}
      this.stream=stream;
      this.onStatus('Le duel se prépare.');
      stream.getAudioTracks().forEach(track=>track.addEventListener('ended',()=>{if(!this.stopped)this.onError(new Error('disconnected'));}));
      this.context=new AudioContext({sampleRate:16000});await this.context.resume();
      if(this.stopped)throw new DOMException('Cancelled','AbortError');
      this.worker=new Worker(new URL('./audio-worker.js',import.meta.url),{type:'module'});
      const ready=new Promise((resolve,reject)=>{
        this.rejectReady=reject;
        this.timeout=setTimeout(()=>reject(new Error('model-timeout')),30000);
        this.worker.onmessage=({data})=>{
          if(this.stopped)return;
          if(data.type==='ready'){clearTimeout(this.timeout);this.rejectReady=null;resolve();}
          else if(data.type==='result'){this.busy=false;this.onResult({...this.gate.sample(data.categories),capturedAt:data.capturedAt});}
          else if(data.type==='error'){clearTimeout(this.timeout);reject(new Error('model-error'));this.onError(new Error('model-error'));}
        };
        this.worker.onerror=()=>{clearTimeout(this.timeout);reject(new Error('model-error'));if(!this.stopped)this.onError(new Error('model-error'));};
      });
      this.worker.postMessage({type:'init',base:new URL('/',location.href).href});
      await Promise.all([ready,this.context.audioWorklet.addModule(this.captureUrl)]);
      if(this.stopped)throw new DOMException('Cancelled','AbortError');
      this.source=this.context.createMediaStreamSource(stream);
      this.capture=new AudioWorkletNode(this.context,'barbichette-capture');
      this.mute=this.context.createGain();this.mute.gain.value=0;
      this.capture.port.onmessage=({data})=>{
        if(this.stopped)return;
        if(data.type==='level')this.onLevel(Math.min(1,data.level*9));
        else if(data.type==='frame'&&!this.busy){this.busy=true;this.worker.postMessage({...data,capturedAt:performance.now()},[data.samples.buffer]);}
      };
      this.source.connect(this.capture).connect(this.mute).connect(this.context.destination);
    } catch(error){this.stop();throw error;}
  }
  reset(){this.gate.reset();}
  stop(){
    if(this.stopped)return;this.stopped=true;clearTimeout(this.timeout);
    this.rejectReady?.(new DOMException('Cancelled','AbortError'));this.rejectReady=null;
    this.stream?.getTracks().forEach(track=>track.stop());
    this.capture?.port.close();this.capture?.disconnect();this.source?.disconnect();this.mute?.disconnect();
    this.worker?.terminate();this.context?.close().catch(()=>{});
  }
}
