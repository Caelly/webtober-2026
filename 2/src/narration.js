import timings from '../audio/timings.json';
import cloche from '../audio/cloche.wav?url';
import soupe from '../audio/soupe.wav?url';
import repetition from '../audio/repetition.wav?url';
import bibliotheque from '../audio/bibliotheque.wav?url';
import fantome from '../audio/fantome.wav?url';
import pari from '../audio/pari.wav?url';
import curedent from '../audio/curedent.wav?url';
import parachute from '../audio/parachute.wav?url';
import train from '../audio/train.wav?url';
import miroir from '../audio/miroir.wav?url';
import fromage from '../audio/fromage.wav?url';
import meteo from '../audio/meteo.wav?url';

const files = { cloche, soupe, repetition, bibliotheque, fantome, pari, curedent, parachute, train, miroir, fromage, meteo };

export function createNarrator({ body, button, modeButton, mute, status, time, progress, onComplete = () => {} }) {
  const audio = new Audio(); audio.preload = 'metadata'; audio.hidden = true; audio.id = 'story-audio'; body.closest('dialog').appendChild(audio);
  let story, metadata, words=[], frame=0, lastIndex=-1, version=0, fullyReadable=false, mode='voice';
  try { if(localStorage.getItem('webtober-relic-reading-mode')==='text')mode='text'; } catch {}
  const progressBar=progress.closest('.reading-progress');
  function modeControls() {
    const silent=mode==='text';
    button.hidden=mute.hidden=progressBar.hidden=silent;
    modeButton.textContent=silent?'Écouter l’histoire':'Lire sans voix';
    modeButton.setAttribute('aria-pressed',String(silent));
    try { localStorage.setItem('webtober-relic-reading-mode',mode); } catch {}
  }
  function revealAll() {
    fullyReadable=true;
    words.forEach(word=>{word.element.classList.add('is-visible');word.element.classList.remove('is-current');});
  }
  function readSilently() {
    mode='text';cancelAnimationFrame(frame);audio.pause();modeControls();
    revealAll();body.scrollTop=0;status.textContent='Lecture libre';onComplete();
  }
  const format = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  function update() {
    if (!metadata||mode==='text'||!audio.getAttribute('src')) return;
    const elapsed=audio.currentTime, duration=Number.isFinite(audio.duration)?audio.duration:metadata.duration;
    time.textContent=`${format(elapsed)} / ${format(duration)}`;
    progress.value=duration?Math.min(elapsed/duration,1):0;
    const spoken=metadata.words.filter(mark=>mark.time<=elapsed).at(-1);
    const position=(spoken?.position ?? -1)-metadata.bodyOffset;
    const index=words.findLastIndex(word=>word.start<=position);
    if(index!==lastIndex) {
      words.forEach((word,i)=>{word.element.classList.toggle('is-visible',fullyReadable||i<=index);word.element.classList.toggle('is-current',i===index);});
      lastIndex=index;
      if(index>=0&&!fullyReadable) {
        const active=words[index].element.getBoundingClientRect(), container=body.getBoundingClientRect();
        if(active.bottom>container.bottom-16) body.scrollTop+=active.bottom-container.bottom+40;
      }
    }
  }
  function tick() { update(); if(!audio.paused&&!audio.ended) frame=requestAnimationFrame(tick); }
  audio.addEventListener('playing',()=>{if(audio.paused||mode==='text')return;status.textContent='Lecture en cours';button.textContent='Pause';button.setAttribute('aria-label','Mettre la lecture en pause');cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);});
  audio.addEventListener('pause',()=>{if(!audio.paused||mode==='text')return;cancelAnimationFrame(frame);if(!audio.ended){status.textContent='Lecture en pause';button.textContent='Continuer';button.setAttribute('aria-label','Continuer la lecture');}});
  audio.addEventListener('loadedmetadata',update);
  audio.addEventListener('timeupdate',update);
  audio.addEventListener('ended',()=>{if(!audio.ended||mode==='text')return;cancelAnimationFrame(frame);revealAll();progress.value=1;status.textContent='Fin de l’histoire';button.textContent='Relire';button.setAttribute('aria-label','Relire l’histoire');onComplete();});
  audio.addEventListener('error',()=>{if(!audio.getAttribute('src')||mode==='text')return;cancelAnimationFrame(frame);revealAll();status.textContent='La lecture audio est indisponible.';button.textContent='Réessayer';onComplete();});
  async function play() {
    const current=version;
    try { await audio.play(); }
    catch { if(current!==version||mode==='text')return;revealAll();status.textContent='Lecture prête';button.textContent='Écouter';onComplete(); }
  }
  function stop() { version++;cancelAnimationFrame(frame);audio.pause();audio.removeAttribute('src');audio.load(); }
  function start(nextStory) {
    stop(); story=nextStory;metadata=timings[story.id];lastIndex=-1;words=[];fullyReadable=false;body.replaceChildren();body.scrollTop=0;
    for(const match of story.text.matchAll(/\S+\s*/g)) {
      const span=document.createElement('span');span.textContent=match[0];span.className='story-word';body.appendChild(span);words.push({start:match.index,element:span});
    }
    modeControls();
    if(mode==='text'){readSilently();return;}
    audio.src=files[story.id]; progress.value=0;time.textContent=`0:00 / ${format(metadata.duration)}`;status.textContent='Le parchemin s’ouvre…';button.textContent='Pause';button.setAttribute('aria-label','Mettre la lecture en pause');play();
  }
  modeButton.addEventListener('click',()=>{
    if(mode==='voice'){readSilently();return;}
    mode='voice';modeControls();lastIndex=-1;
    if(!audio.getAttribute('src'))audio.src=files[story.id];
    if(audio.ended)audio.currentTime=0;
    play();
  });
  button.addEventListener('click',()=>{
    if(audio.ended){lastIndex=-1;words.forEach(word=>word.element.classList.remove('is-current'));body.scrollTop=0;audio.currentTime=0;play();}
    else if(audio.paused)play();else audio.pause();
  });
  mute.addEventListener('click',()=>{audio.muted=!audio.muted;mute.setAttribute('aria-pressed',String(audio.muted));mute.setAttribute('aria-label',audio.muted?'Activer le son':'Couper le son');mute.classList.toggle('is-muted',audio.muted);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!audio.paused)audio.pause();});
  return { start, stop };
}
