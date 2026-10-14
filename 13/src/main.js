import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {createBalance,RULES,stackPose} from './game.js';
import {createBistro} from './view.js';
import {createAudio} from './audio.js';
if(location.pathname==='/13/')history.replaceState(null,'',`/13${location.search}`);
const preview=new URLSearchParams(location.search).has('apercu');if(preview)document.documentElement.classList.add('is-apercu');
const $=selector=>document.querySelector(selector);
const glassIcon='<svg viewBox="0 0 28 34" fill="none" aria-hidden="true"><path d="M7 3h14c1 9-1 14-7 14S6 12 7 3Zm7 14v13m-6 1h12M9 9h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="m24 1 2-1M3 7 1 6m22 15 3 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
const leftArrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const rightArrow=leftArrow.replace('M19 12H5m6-6-6 6 6 6','M5 12h14m-6-6 6 6-6 6');
$('#app').innerHTML=`<div class="fragile-shell"><header class="site-header"><a class="brand" href="/" aria-label="Fragile, revenir au calendrier">${glassIcon}<span>fragile<span class="brand-dot">.</span></span></a>${navigation(13)}</header>
<main><section class="bistro" aria-label="Le serveur et son plateau"><canvas id="scene" tabindex="0" aria-label="Jeu d’équilibre. Utilisez les flèches gauche et droite pour rattraper les verres."></canvas><div class="scene-shade" aria-hidden="true"></div><div class="service-hud"><div class="service-time"><span>SERVICE</span><strong><b id="time">45,0</b> <small>s</small></strong><div class="time-track" role="progressbar" aria-label="Progression du service" aria-valuemin="0" aria-valuemax="45" aria-valuenow="0"><i id="time-fill"></i></div></div><div class="glass-count"><span>SUR LE PLATEAU</span><strong>${glassIcon}<b id="glasses">—</b><small>/ 9</small></strong></div><div class="best-score"><span>MEILLEUR SERVICE</span><strong id="best">0,0 <small>s</small></strong></div><div class="scene-tools"><button id="sound" aria-label="Couper le son" aria-pressed="false">♪</button><button id="pause" aria-label="Mettre le service en pause" hidden>Ⅱ</button></div></div>
<div class="intro" id="intro"><span class="eyebrow" id="intro-kicker">JOUR 13 · FRAGILE</span><h1 id="intro-title">Tout peut<br/><em>basculer.</em></h1><p id="intro-copy">Un serveur. Un plateau.<br/>Des verres qui n’en finissent pas de monter.</p><div class="service-target" id="service-target"><span>45 SECONDES</span><i></i><span>9 VERRES</span><i></i><span>ZÉRO CASSE</span></div><button class="start-button" id="start">Prendre le service <span>↗</span></button><span class="keyboard-hint" id="keyboard-hint">ESPACE POUR COMMENCER</span></div>
<div class="scene-note" id="scene-note" aria-live="polite" hidden></div><div class="scene-bottom"><span>BRASSERIE WEBTOBER</span><span id="arrival">UN NOUVEAU VERRE TOUTES LES 5 SECONDES</span></div></section>
<section class="balance-console" aria-label="Commandes d’équilibre"><div class="control-label"><span class="eyebrow">GARDEZ LA MAIN</span><span id="control-caption">De petites corrections font toute la différence.</span></div><div class="direction-buttons"><button id="left" aria-label="Déplacer le plateau vers la gauche" aria-keyshortcuts="ArrowLeft" disabled>${leftArrow}</button><button id="right" aria-label="Déplacer le plateau vers la droite" aria-keyshortcuts="ArrowRight" disabled>${rightArrow}</button></div><div class="balance-meter"><div class="meter-heading"><span>ÉQUILIBRE</span><strong id="balance-status">À VOUS DE JOUER</strong></div><div class="meter-track"><span class="safe-zone"></span><span class="meter-center"></span><i id="balance-needle"></i></div><div class="meter-bottom"><span>GAUCHE</span><span>DROITE</span></div></div><div class="next-glass"><span>PROCHAIN VERRE</span><strong id="next">5,0 <small>s</small></strong></div></section></main>
<footer><span>WEBTOBER 2026</span><span>À CONSOMMER AVEC DEXTÉRITÉ.</span><a href="/">Tous les thèmes ↖</a></footer></div>
<dialog id="concept" aria-labelledby="concept-title"><button id="close-concept" aria-label="Fermer le concept">×</button><span class="eyebrow">UN THÈME, UNE HERO SECTION</span><h2 id="concept-title">Le dernier verre<br/>est toujours de trop.</h2><p>Le service dure 45 secondes. Un nouveau verre arrive toutes les cinq secondes, jusqu’à neuf verres sur le plateau.</p><p>Les flèches gauche et droite déplacent le serveur et son plateau. Rattrapez la pile en vous déplaçant du côté où elle penche. Des corrections courtes permettent de limiter l’inertie.</p><p>Une inclinaison trop forte fait tomber les verres : le service est terminé. Vous pouvez recommencer, ou mettre le jeu en pause avec Échap. Sur mobile, gardez le doigt appuyé sur les boutons fléchés.</p></dialog><p class="sr-only" id="announcement" role="status" aria-live="polite"></p>`;
bindNavigation();
const game=createBalance(),view=createBistro($('#scene')),audio=createAudio(),keys=new Set(),pointers=new Map();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let best=0,raf=0,last=0,lastHud=0,noteUntil=0,disposed=false;
try{const saved=Number(localStorage.getItem('webtober-j13-best'));if(Number.isFinite(saved)&&saved>=0&&saved<=45)best=saved;}catch{}
const number=value=>value.toFixed(1).replace('.',',');
function input(){return (keys.has('ArrowRight')||[...pointers.values()].includes(1)?1:0)-(keys.has('ArrowLeft')||[...pointers.values()].includes(-1)?1:0);}
function release(){keys.clear();pointers.clear();$('#left').classList.remove('pressed');$('#right').classList.remove('pressed');}
function showNote(text,duration=1700){$('#scene-note').textContent=text;$('#scene-note').hidden=false;noteUntil=performance.now()+duration;$('#announcement').textContent=text;}
function hud(){
 const state=game.snapshot(),playing=state.phase==='playing';document.body.dataset.phase=state.phase;
 $('#time').textContent=number(Math.max(0,45-state.elapsed));$('#time-fill').style.width=state.elapsed/45*100+'%';$('.time-track').setAttribute('aria-valuenow',state.elapsed.toFixed(1));$('#glasses').textContent=state.phase==='ready'?'—':state.glasses;$('#best').innerHTML=`${number(best)} <small>s</small>`;
 $('#next').innerHTML=state.glasses>=9?'—':`${number(state.nextGlass)} <small>s</small>`;$('#balance-needle').style.left=`${50+state.angle/RULES.limit*46}%`;$('#balance-status').textContent=state.phase==='ready'?'À VOUS DE JOUER':state.phase==='won'?'IMPECCABLE':state.phase==='lost'||state.phase==='falling'?'C’EST LA CASSE':state.phase==='paused'?'EN PAUSE':state.danger>.7?'ÇA VACILLE !':state.danger>.35?'DOUCEMENT…':'TOUT VA BIEN';$('.balance-meter').classList.toggle('danger',state.danger>.7);
 $('#left').disabled=!playing;$('#right').disabled=!playing;$('#left').classList.toggle('pressed',playing&&input()<0);$('#right').classList.toggle('pressed',playing&&input()>0);$('#pause').hidden=!['playing','falling'].includes(state.phase);
 $('#arrival').textContent=state.phase==='won'?'UN SERVICE SANS FAUSSE NOTE':state.phase==='lost'?'LE PROCHAIN SERA LE BON':state.glasses===9?'DERNIÈRE LIGNE DROITE':'UN NOUVEAU VERRE TOUTES LES 5 SECONDES';
}
function saveBest(){const elapsed=game.snapshot().elapsed;if(elapsed>best){best=elapsed;try{localStorage.setItem('webtober-j13-best',String(best));}catch{}}}
function start(){
 const state=game.snapshot();release();audio.wake();if(state.phase==='paused'){game.resume();}else{game.start();view.reset();}
 $('#intro').hidden=true;$('#scene-note').hidden=true;noteUntil=0;last=performance.now();$('#scene').focus({preventScroll:true});hud();wake();
}
function pause(){if(!game.pause())return;release();$('#intro').hidden=false;$('#intro-kicker').textContent='LE SERVICE PEUT ATTENDRE';$('#intro-title').innerHTML='Une petite<br/><em>pause.</em>';$('#intro-copy').textContent='Le plateau et les verres vous attendent.';$('#service-target').hidden=true;$('#start').innerHTML='Reprendre le service <span>↗</span>';$('#keyboard-hint').textContent='ESPACE POUR REPRENDRE';hud();}
function finish(state){
 release();saveBest();$('#intro').hidden=false;$('#intro-kicker').textContent=state.phase==='won'?'SERVICE ACCOMPLI':'SERVICE INTERROMPU';$('#intro-title').innerHTML=state.phase==='won'?'Service<br/><em>impeccable.</em>':'C’est la<br/><em>casse.</em>';$('#intro-copy').textContent=state.phase==='won'?'Neuf verres, quarante-cinq secondes. Pas un éclat.':`Vous avez tenu ${number(state.elapsed)} secondes avec ${state.glasses} ${state.glasses>1?'verres':'verre'}.`;$('#service-target').hidden=true;$('#start').innerHTML='Retenter le service <span>↗</span>';$('#keyboard-hint').textContent='ESPACE POUR RECOMMENCER';$('#announcement').textContent=state.phase==='won'?'Service réussi. Neuf verres, aucune casse.':`Les verres sont tombés après ${number(state.elapsed)} secondes.`;$('#start').focus({preventScroll:true});hud();
}
function frame(now){
 raf=0;if(disposed||document.hidden)return;
 const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;game.update(dt,input());
 const events=game.drain();view.push(events,now);for(const event of events){audio.event(event);if(event.type==='glass')showNote(`Un verre de plus. ${event.count} sur le plateau.`);if(event.type==='fall'){release();saveBest();$('#scene-note').hidden=true;noteUntil=0;}if(event.type==='lost'||event.type==='won')finish(game.snapshot());}
 if(noteUntil&&now>noteUntil){$('#scene-note').hidden=true;noteUntil=0;}
 const state=game.snapshot();if(state.phase==='ready'){
  const demo={...state,glasses:preview?7:4,angle:preview?-.055:.065,elapsed:0};demo.stack=stackPose(demo);view.draw(demo,now,{preview,reduced});
 }else view.draw(state,now,{preview,reduced});
 if(now-lastHud>70){hud();lastHud=now;}
 if(!preview)raf=requestAnimationFrame(frame);
}
function wake(){if(!preview&&!raf&&!disposed&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame);}}
if(!preview){
 $('#start').addEventListener('click',start);$('#pause').addEventListener('click',pause);
 window.addEventListener('keydown',event=>{
  if($('#concept').open||$('#day-picker').open)return;
  if(event.key==='Escape'){pause();return;}
  if(event.code==='Space'&&!event.repeat&&event.target.tagName!=='BUTTON'&&event.target.tagName!=='SUMMARY'){event.preventDefault();if(['ready','lost','won','paused'].includes(game.snapshot().phase))start();return;}
  if(['ArrowLeft','ArrowRight'].includes(event.key)&&game.snapshot().phase==='playing'){event.preventDefault();keys.add(event.key);hud();}
 });
 window.addEventListener('keyup',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){keys.delete(event.key);hud();}});
 for(const [id,direction] of [['left',-1],['right',1]]){
  const button=$('#'+id);button.addEventListener('pointerdown',event=>{if(game.snapshot().phase!=='playing')return;event.preventDefault();button.setPointerCapture(event.pointerId);pointers.set(event.pointerId,direction);hud();});
  const lift=event=>{pointers.delete(event.pointerId);hud();};button.addEventListener('pointerup',lift);button.addEventListener('pointercancel',lift);button.addEventListener('lostpointercapture',lift);
 }
 window.addEventListener('blur',()=>{release();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){release();pause();cancelAnimationFrame(raf);raf=0;}else wake();});
 $('#sound').addEventListener('click',()=>{const muted=audio.toggle();$('#sound').textContent=muted?'♫':'♪';$('#sound').setAttribute('aria-pressed',muted);$('#sound').setAttribute('aria-label',muted?'Activer le son':'Couper le son');});
 $('#open-concept').addEventListener('click',()=>{pause();$('#concept').showModal();});$('#close-concept').addEventListener('click',()=>$('#concept').close());$('#concept').addEventListener('click',event=>{if(event.target===$('#concept')){const r=$('#concept').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('#concept').close();}});
 wake();
}else requestAnimationFrame(frame);
window.addEventListener('pagehide',()=>{disposed=true;release();cancelAnimationFrame(raf);view.dispose();audio.close();},{once:true});hud();
