import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {words} from './words.js';
import {createBattle} from './battle.js';
import {handIcon,opponentArtwork} from './opponent.js';

if(location.pathname==='/5/')history.replaceState(null,'',`/5${location.search}${location.hash}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const micIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M6 11v2a6 6 0 0 0 12 0v-2m-6 8v3m-3 0h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
let best=0;try{best=Number(localStorage.getItem('webtober-gifle-best'))||0;}catch{}
document.querySelector('#app').innerHTML=`<div class="gifle-shell" data-phase="idle">
  <header class="site-header"><a class="brand" href="/" aria-label="Gifle, retourner au calendrier">${handIcon}<span>gifle<span class="brand-dot">.</span></span></a>${navigation(5)}</header>
  <main class="battle-main" aria-labelledby="battle-title">
    <section class="intro"><span class="eyebrow">LA BARBICHETTE A GRANDI</span><h1 id="battle-title">Tu ris.<br/><em>Tu perds.</em></h1><p class="subtitle">Des mots douteux.<br/>Un sérieux à toute épreuve.</p><div class="scoreboard"><div><strong id="score">00</strong><span>mots passés<br/>sans craquer</span></div><div class="best"><span>TON RECORD</span><strong id="best">${String(best).padStart(2,'0')}</strong></div></div><p class="footnote">${words.length} occasions de perdre<br/>toute dignité.</p></section>
    <section class="arena" aria-label="Le duel de la barbichette"><div class="arena-heading"><span class="eyebrow">LE PREMIER QUI RIRA</span><span class="hand-stamp">${handIcon}<span>recevra<br/>une gifle.</span></span></div>
      <div id="idle-screen" class="idle-screen"><div class="play-plinth"><button id="play" class="play-button"${preview?' tabindex="-1"':''}>PLAY</button></div><span class="play-caption">On se tient par la barbichette ?</span></div>
      <div id="countdown-screen" class="countdown-screen" hidden><span class="eyebrow">GARDE TON SÉRIEUX</span><strong id="countdown">3</strong></div>
      <div id="word-screen" class="word-screen" hidden><span class="word-label" id="word-label">À DIRE SANS RIRE</span><div class="word-card"><span class="card-corner" aria-hidden="true">“</span><h2 id="word" aria-live="polite" aria-atomic="true"></h2><span class="card-line" aria-hidden="true"></span></div><div class="word-progress" aria-hidden="true"><span></span></div><span id="word-note">À voix haute. Visage impassible.</span></div>
      <div id="result-screen" class="result-screen" hidden><span class="eyebrow" id="result-label">LE SOURIRE DE TROP</span><h2 id="result-title">Ça a<br/><em>claqué.</em></h2><p id="result-copy"></p><button id="replay" class="solid-button">REJOUER <span aria-hidden="true">↗</span></button></div>
      <div class="slapper" id="slapper" hidden>${opponentArtwork()}</div><span class="impact" aria-hidden="true">PAF !</span>
      <div class="mic-strip"><span id="mic-state">${micIcon}<span id="mic-caption">Micro éteint</span></span><div class="waveform" aria-hidden="true">${Array.from({length:21},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><button id="stop" hidden aria-label="Arrêter la partie et couper le micro">Arrêter <span aria-hidden="true">×</span></button></div>
      <span class="arena-note" id="arena-note" role="status" aria-live="polite"></span>
    </section>
  </main><footer><span>UN THÈME, UNE HERO SECTION</span><span>Édition octobre 2026 <i></i> 05 / 31</span></footer>
</div><div class="slap-flash" aria-hidden="true"></div>
<dialog id="mic-dialog" aria-labelledby="mic-title"><span class="dialog-symbol">${micIcon}</span><span class="eyebrow">AVANT LE FACE-À-FACE</span><h2 id="mic-title">On écoute<br/><em>les rires.</em></h2><p>Le micro est nécessaire pour jouer.<br/>L’écoute reste sur cet appareil, sans enregistrement.</p><div class="dialog-actions"><button id="allow-mic" class="solid-button">Activer le micro <span aria-hidden="true">↗</span></button><button id="cancel-mic" class="text-button">Pas maintenant</button></div><p id="loading-note" role="status" hidden>Le duel se prépare.</p></dialog>
<dialog id="concept-dialog" aria-labelledby="concept-title"><button id="close-concept" class="dialog-close" aria-label="Fermer le concept">×</button><span class="eyebrow">WEBTOBER 2026</span><h2 id="concept-title">Un thème,<br/><em>une hero section.</em></h2><p>Trente et un jours, trente et une idées. Aujourd’hui, une barbichette à la langue bien pendue. Des mots improbables, un micro et une main qui n’attend que ton premier rire.</p></dialog>`;
bindNavigation();
const $=selector=>document.querySelector(selector),shell=$('.gifle-shell'),game=createBattle(words),micDialog=$('#mic-dialog');
let microphone=null,epoch=0,mode='idle',raf=0,countdownTimer=0,startedAt=0,level=0;
function setMode(next){mode=next;shell.dataset.phase=next;$('#idle-screen').hidden=next!=='idle';$('#countdown-screen').hidden=next!=='countdown';$('#word-screen').hidden=next!=='playing';$('#result-screen').hidden=!['lost','won'].includes(next);$('#slapper').hidden=next!=='lost';$('#stop').hidden=!['loading','countdown','playing'].includes(next);}
function cutMicrophone(){clearTimeout(countdownTimer);cancelAnimationFrame(raf);microphone?.stop();microphone=null;level=0;shell.style.setProperty('--level',0);$('#mic-caption').textContent='Micro éteint';$('#mic-state').classList.remove('is-listening');}
function stop(message='Le duel attendra.'){epoch++;cutMicrophone();game.stop();setMode('idle');$('#arena-note').textContent=message;if(micDialog.open)micDialog.close();resetPermission();}
function resetPermission(){$('#allow-mic').disabled=false;$('#allow-mic').innerHTML='Activer le micro <span aria-hidden="true">↗</span>';$('#cancel-mic').textContent='Pas maintenant';$('#loading-note').hidden=true;}
function microphoneError(error){
  if(error.name==='AbortError')return;
  const message=['NotAllowedError','SecurityError'].includes(error.name)?'Le micro n’a pas été autorisé. Tu peux réessayer.':error.name==='NotFoundError'?'Aucun micro trouvé. Branche-en un pour entrer dans le duel.':error.name==='NotReadableError'?'Ce micro est indisponible. Vérifie qu’il n’est pas utilisé ailleurs.':error.message==='unsupported'?'Ce navigateur ne permet pas ce duel au micro. Essaie une version récente de Chrome, Edge ou Safari.':error.message==='disconnected'?'Le micro a été déconnecté. La partie est arrêtée.':'L’écoute n’a pas pu démarrer. Réessaie dans un instant.';
  stop(message);
}
function updateScore(){$('#score').textContent=String(game.score).padStart(2,'0');}
function showWord(){
  $('#word').textContent=game.word;$('#word').classList.toggle('long-word',game.word.length>27);
  $('#word-note').textContent='À voix haute. Visage impassible.';$('#word-label').textContent='À DIRE SANS RIRE';
  const card=$('.word-card');card.classList.remove('arrive');void card.offsetWidth;card.classList.add('arrive');updateScore();
}
function finish(result){
  const elapsed=Math.floor((performance.now()-startedAt)/1000);epoch++;cutMicrophone();setMode(result);updateScore();
  if(game.score>best){best=game.score;try{localStorage.setItem('webtober-gifle-best',String(best));}catch{}$('#best').textContent=String(best).padStart(2,'0');}
  $('#result-label').textContent=result==='lost'?'LE SOURIRE DE TROP':'IMPASSIBLE. INÉBRANLABLE.';
  $('#result-title').innerHTML=result==='lost'?'Ça a<br/><em>claqué.</em>':'Même pas<br/><em>un sourire.</em>';
  $('#result-copy').textContent=result==='lost'?`${game.score} ${game.score===1?'mot passé':'mots passés'} sans craquer. ${elapsed} s de dignité.`:`${game.score} mots. Tu as survécu à la barbichette.`;
  $('#arena-note').textContent=result==='lost'?'Rire détecté. Partie terminée, micro coupé.':'Toute la liste est passée. Micro coupé.';
  $('#replay').focus({preventScroll:true});
}
function frame(now){
  if(mode!=='playing')return;
  const change=game.tick(now);if(change==='won'){finish('won');return;}if(change==='next')showWord();
  $('.word-progress>span').style.transform=`scaleX(${game.progress(now)})`;
  $('#word-note').textContent=game.heard?'Bien entendu. Tiens bon.':game.progress(now)===1?'Le mot attend ta voix.':'À voix haute. Visage impassible.';
  shell.style.setProperty('--level',level.toFixed(3));raf=requestAnimationFrame(frame);
}
function countdown(token,number=3){
  if(token!==epoch)return;$('#countdown').textContent=number;
  if(number===0){microphone.reset();setMode('playing');startedAt=performance.now();game.start(startedAt);showWord();raf=requestAnimationFrame(frame);return;}
  countdownTimer=setTimeout(()=>countdown(token,number-1),1000);
}
async function allowMicrophone(){
  if(mode==='loading')return;const token=++epoch;setMode('loading');$('#allow-mic').disabled=true;$('#allow-mic').textContent='Préparation du duel';$('#cancel-mic').textContent='Annuler';$('#loading-note').hidden=false;$('#arena-note').textContent='';
  try {
    const {LocalMicrophone}=await import('./microphone.js');if(token!==epoch)return;
    microphone=new LocalMicrophone({onStatus:message=>{if(token===epoch)$('#loading-note').textContent=message;},onLevel:value=>{level=level*.55+value*.45;},onResult:result=>{if(token!==epoch||mode!=='playing')return;if(game.hear(result,result.capturedAt)==='lost')finish('lost');},onError:error=>{if(token===epoch)microphoneError(error);}});
    await microphone.start();if(token!==epoch)return;
    micDialog.close();resetPermission();$('#mic-caption').textContent='Micro en écoute';$('#mic-state').classList.add('is-listening');setMode('countdown');countdown(token);
  } catch(error){if(token===epoch)microphoneError(error);}
}
function requestPlay(){if(preview)return;stop('');micDialog.showModal();}
$('#play').addEventListener('click',requestPlay);$('#replay').addEventListener('click',requestPlay);
$('#allow-mic').addEventListener('click',allowMicrophone);$('#cancel-mic').addEventListener('click',()=>stop(''));
micDialog.addEventListener('cancel',()=>stop(''));$('#stop').addEventListener('click',()=>stop());
const concept=$('#concept-dialog');$('#open-concept').addEventListener('click',()=>{if(['loading','countdown','playing'].includes(mode))stop('Duel interrompu. Micro coupé.');concept.showModal();});$('#close-concept').addEventListener('click',()=>concept.close());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['loading','countdown','playing'].includes(mode))stop('Duel interrompu. Micro coupé.');});
window.addEventListener('pagehide',()=>stop(''),{once:true});
