export function createAudio(){let context,muted=false;
 function wake(){try{if(!context)context=new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});}catch{}}
 function note(freq,end,duration,volume=.03){if(muted||context?.state!=='running')return;const osc=context.createOscillator(),gain=context.createGain(),now=context.currentTime;osc.type='sine';osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(end,now+duration);gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain).connect(context.destination);osc.start();osc.stop(now+duration+.02);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
 return {wake,toggle(){muted=!muted;return muted;},event(event){if(event.type==='glass')note(1550,1180,.3,.025);if(event.type==='break')note(2200+event.index*110,380,.2,.014);if(event.type==='won')note(660,1100,.8,.035);},close(){context?.close().catch(()=>{});}};
}
