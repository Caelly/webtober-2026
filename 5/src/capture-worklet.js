// A rolling 975 ms window, every 160 ms. Samples never leave this browser.
class Capture extends AudioWorkletProcessor {
  constructor(){super();this.ring=new Float32Array(Math.round(sampleRate*.975));this.cursor=0;this.filled=0;this.hop=0;this.meter=0;}
  process(inputs){
    const input=inputs[0]?.[0];if(!input)return true;
    let energy=0;
    for(const sample of input){this.ring[this.cursor]=sample;this.cursor=(this.cursor+1)%this.ring.length;this.filled++;this.hop++;energy+=sample*sample;}
    this.meter+=input.length;
    if(this.meter>=sampleRate*.05){this.port.postMessage({type:'level',level:Math.sqrt(energy/input.length)});this.meter=0;}
    if(this.filled>=this.ring.length&&this.hop>=sampleRate*.16){
      this.hop=0;const samples=new Float32Array(this.ring.length);samples.set(this.ring.subarray(this.cursor));samples.set(this.ring.subarray(0,this.cursor),this.ring.length-this.cursor);
      this.port.postMessage({type:'frame',samples,rate:sampleRate},[samples.buffer]);
    }
    return true;
  }
}
registerProcessor('barbichette-capture',Capture);
