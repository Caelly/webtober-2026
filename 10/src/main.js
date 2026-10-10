import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {createOracle} from './oracle.js';
import {createCrystal} from './crystal.js';
if(location.pathname==='/10/')history.replaceState(null,'',`/10${location.search}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const $=selector=>document.querySelector(selector);
const orbIcon='<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/><path d="M12 6c-3 1-4 3-4 6m1 10h14l2 5H7zm-2 5h18M16 7v8m-4-4h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const star='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z" stroke="currentColor" stroke-width="1.2"/></svg>';
$('#app').innerHTML=`<div class="mystique-shell"><header class="site-header"><a class="brand" href="/" aria-label="Mystique, revenir au calendrier">${orbIcon}<span>mystique<span class="brand-dot">.</span></span></a>${navigation(10)}</header>
<main aria-label="L’oracle de cristal">
<section class="crystal-stage" aria-label="La boule de cristal"><div class="halo" aria-hidden="true"></div><div class="scene" id="crystal" aria-hidden="true"></div><div id="orb-text" class="orb-text" data-state="idle" hidden><p id="answer"></p></div></section>
<div class="question-area"><form id="question-form" novalidate><label class="sr-only" for="question">Votre question à la boule de cristal</label><span class="input-star" aria-hidden="true">✧</span><input id="question" name="question" aria-describedby="form-message safety-message" type="text" maxlength="240" placeholder="Quelle question vous traverse l’esprit ?" autocomplete="off"/><button id="ask" type="submit"><span>Interroger l’oracle</span>${star}</button></form><p id="form-message" class="sr-only" role="status"></p><p id="safety-message" class="safety-message" role="alert" hidden></p></div></main>
<footer><span>WEBTOBER 2026</span><span>10 <i>/</i> 31</span><a href="/9">Jour précédent ↖</a></footer></div>
<dialog id="concept" aria-labelledby="concept-title"><button id="close-concept" aria-label="Fermer le concept">×</button><span class="eyebrow">UN THÈME, UNE HERO SECTION</span><h2 id="concept-title">Les étoiles<br/>ont de l’humour.</h2><p>Posez une question et consultez la boule. Une réponse apparaît au cœur du cristal, choisie au hasard parmi 36 messages.</p><p>Un petit jeu avec le destin, à prendre avec légèreté. Votre question reste dans votre navigateur. Les questions liées à la mort, au suicide ou à la santé sont refusées avant tout tirage.</p><button id="back-game">Retour à l’oracle ↗</button></dialog><p class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></p>`;
bindNavigation();
const oracle=createOracle();let crystal,version=0;
try{crystal=createCrystal($('#crystal'),{preview,onPosition:(x,y,width)=>{const text=$('#orb-text');text.style.left=`${x}px`;text.style.top=`${y}px`;text.style.width=`${width}px`;text.style.setProperty('--answer-size',`${Math.min(40,Math.max(24,width*.145))}px`);}});}catch(error){$('#crystal').classList.add('crystal-fallback');$('#crystal').innerHTML='<div class="fallback-mist"></div>';console.warn('Cristal : rendu de secours',error);}
let audio;
function chime(){try{
 if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});
 for(let [i,hz] of [523.25,783.99,1046.5].entries()){
  const osc=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+i*.09;
  osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.025,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+1.1);osc.connect(gain).connect(audio.destination);osc.start(start);osc.stop(start+1.2);osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
 }catch{/* Audio is an optional embellishment. */}}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
async function consult(event){
 event.preventDefault();if(preview)return;
 const question=$('#question').value;
 if(!oracle.ask(question)){
  const state=oracle.snapshot();if(state.phase==='waiting')return;
  if(state.phase==='blocked'){
   version++;$('#orb-text').hidden=true;$('#answer').textContent='';$('#announcement').textContent='';$('#form-message').textContent='';$('#safety-message').textContent=state.refusal.message;$('#safety-message').hidden=false;$('#question').setAttribute('aria-invalid','true');crystal?.setState('idle');$('#crystal').dataset.state='idle';$('#question').focus();return;
  }
  $('#safety-message').hidden=true;$('#form-message').textContent='Glissez une question à la boule pour commencer.';$('#question').setAttribute('aria-invalid','true');$('#question').focus();return;
 }
 const token=++version;$('#safety-message').hidden=true;$('#safety-message').textContent='';$('#question').removeAttribute('aria-invalid');$('#question').readOnly=true;$('#ask').disabled=true;$('#ask').querySelector('span').textContent='Les astres se consultent';
 $('#orb-text').hidden=true;$('#orb-text').dataset.state='waiting';$('#answer').textContent='';$('#form-message').textContent='';crystal?.setState('waiting');$('#crystal').dataset.state='waiting';chime();
 await new Promise(resolve=>setTimeout(resolve,reduced?250:1800));if(token!==version)return;
 const result=oracle.reveal();if(!result)return;
 $('#orb-text').hidden=false;$('#orb-text').dataset.state='answered';$('#answer').textContent=result.answer;$('#announcement').textContent=result.answer;
 $('#question').readOnly=false;$('#ask').disabled=false;$('#ask').querySelector('span').textContent='Interroger l’oracle';$('#form-message').textContent='';crystal?.setState('answered');$('#crystal').dataset.state='answered';
}
if(!preview){$('#question-form').addEventListener('submit',consult);$('#open-concept').addEventListener('click',()=>$('#concept').showModal());$('#close-concept').addEventListener('click',()=>$('#concept').close());$('#back-game').addEventListener('click',()=>$('#concept').close());$('#concept').addEventListener('click',event=>{if(event.target===$('#concept')){const rect=$('#concept').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)$('#concept').close();}});}
window.addEventListener('pagehide',()=>{version++;crystal?.dispose();audio?.close().catch(()=>{});},{once:true});
