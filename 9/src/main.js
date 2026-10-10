import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {createSiege,rules} from './game.js';
import {createScene} from './scene.js';
import {createSound} from './sound.js';
if(location.pathname==='/9/')history.replaceState(null,'',`/9${location.search}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const icon='<svg viewBox="0 0 36 32" fill="none" aria-hidden="true"><path d="M8 14h23v7H8zM4 14v7m5-8L5 8m8 15-4 5m17-15 4-5m-9 15 4 5M5 8q-7-5-3-7 7-3 9 7M30 8q8-6 3-7-7-2-8 7" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
const chargeIcon='<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M3 16h23M21 10l7 6-7 6M6 10h8M6 22h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const waitIcon='<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M11 8v16m10-16v16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const helmet='<svg viewBox="0 0 24 26" aria-hidden="true"><path d="M5 14V9a7 7 0 0 1 14 0v5l2 6-9 4-9-4Z" fill="currentColor"/><path d="M6 12h5m2 0h5m-6 3v7" stroke="#142229" stroke-width="1.6"/></svg>';
const $=selector=>document.querySelector(selector);
$('#app').innerHTML=`<div class="siege-shell"><header class="site-header"><a class="brand" href="/" aria-label="Bélier, revenir au calendrier">${icon}<span>bélier<span class="brand-dot">.</span></span></a>${navigation(9)}</header>
<main><div class="mission-heading"><div><span class="eyebrow">JOUR 09 · LE SIÈGE</span><h1>Faites céder <em>la porte.</em></h1></div><button id="sound" aria-pressed="false" aria-label="Couper le son">♪ <span>SON ACTIVÉ</span></button></div>
<div class="battle-layout"><section class="battlefield" aria-label="Le château et votre bélier"><div id="scene" aria-hidden="true"></div><div class="gate-hud"><span>PORTE DU CHÂTEAU</span><div><strong id="gate-hp">200</strong><span>/ 200 PV</span></div><div class="hp-track" role="progressbar" aria-label="Points de vie de la porte" aria-valuemin="0" aria-valuemax="200" aria-valuenow="200"><i id="hp-fill"></i></div></div>
<div class="scene-corner"><span class="round-label">TOUR <b id="turn">01</b></span><span class="weather">FORTERESSE DE ROCHEBRUNE</span></div><div class="scene-result" id="scene-result" hidden></div><div class="crew-hud"><div class="helmets">${Array.from({length:4},()=>helmet).join('')}</div><span><strong id="crew-count">4</strong> PORTEURS EN VIE</span></div><div class="scene-bottom"><i></i> <span id="formation">LE BÉLIER EST EN POSITION</span></div></section>
<aside class="command-panel" aria-labelledby="command-title"><div class="command-top"><span class="eyebrow">VOTRE DÉCISION</span><span id="phase-badge">EN POSITION</span></div><h2 id="command-title">À vous de jouer.</h2><p class="command-copy" id="command-copy">Un pas de plus vers la victoire.<br/>Ou un pas de trop.</p>
<div class="action-buttons"><button class="charge-button" id="charge">${chargeIcon}<span><strong>CHARGER</strong><small id="charge-damage">40 dégâts si la porte tient</small></span><b>↗</b></button><button class="wait-button" id="wait">${waitIcon}<span><strong>ATTENDRE</strong><small>Gardez vos positions</small></span></button></div>
<div class="journal"><span class="eyebrow">JOURNAL DU SIÈGE</span><ol id="journal"><li class="empty-journal">Les défenseurs vous attendent.</li></ol></div><button id="restart" class="restart">↺ <span>Nouveau siège</span></button></aside></div></main>
<footer><span>WEBTOBER 2026</span><span>UN PEU D’AUDACE. BEAUCOUP DE BOIS.</span><a href="/8">Jour précédent ↖</a></footer></div>
<dialog id="concept" aria-labelledby="concept-title"><button id="close-concept" aria-label="Fermer le concept">×</button><span class="eyebrow">UN THÈME, UNE HERO SECTION</span><h2 id="concept-title">Un coup de bélier.<br/>Deux issues.</h2><p>La porte a 200 PV. Si vous chargez et qu’elle reste fermée, elle perd des PV. Si les défenseurs l’ouvrent au même moment, toute votre équipe tombe dans le vide : le siège est perdu.</p><p>Attendre garde les porteurs à l’abri sans modifier la puissance du bélier. Chaque charge inflige 40 dégâts si la porte reste fermée. Le risque d’ouverture est de 18 % à chaque tour.</p><p>Leur réponse est tirée après votre décision. Une ouverture au tour précédent ne prédit pas le suivant.</p><button class="concept-back" id="back-game">Retour au siège ↗</button></dialog><p class="sr-only" id="announcement" role="status" aria-live="polite"></p>`;
bindNavigation();
const game=createSiege(),sound=createSound();let scene,epoch=0,busy=false,journal=[];
try {scene=createScene($('#scene'),{preview});}catch(error){$('#scene').innerHTML='<div class="scene-fallback"><span>♜</span><strong>Forteresse de Rochebrune</strong><p>La scène 3D est indisponible sur cet appareil. Le siège reste jouable.</p></div>';console.warn('Scène Bélier indisponible',error);}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function render(){
 const state=game.snapshot(),terminal=['won','lost'].includes(state.phase);
 document.body.dataset.phase=state.phase;
 $('#gate-hp').textContent=state.hp;$('#hp-fill').style.width=`${state.hp/rules.doorHp*100}%`;$('.hp-track').setAttribute('aria-valuenow',String(state.hp));
 $('#turn').textContent=String(terminal?state.turn:state.turn+1).padStart(2,'0');$('#crew-count').textContent=state.crew;
 $('.helmets').classList.toggle('fallen',state.crew===0);
 $('#charge-damage').textContent=`${state.power} dégâts si la porte tient`;
 $('#charge').disabled=preview||busy||terminal;$('#wait').disabled=preview||busy||terminal;
 if(!busy){
  $('#phase-badge').textContent=terminal?'SIÈGE TERMINÉ':'EN POSITION';$('#command-title').textContent=state.phase==='won'?'La porte a cédé.':state.phase==='lost'?'Un coup de trop.':'À vous de jouer.';
  $('#command-copy').innerHTML=state.phase==='won'?`Les quatre porteurs ont ouvert une brèche.<br/>Victoire en ${state.turn} tours.`:state.phase==='lost'?'La porte s’est ouverte.<br/>Aucun porteur n’a survécu.':'Un pas de plus vers la victoire.<br/>Ou un pas de trop.';
  $('#formation').textContent=state.phase==='won'?'UNE BRÈCHE DANS LES REMPARTS':state.phase==='lost'?'L’ÉQUIPE A DISPARU DANS LE FOSSÉ':'LE BÉLIER EST EN POSITION';
  $('#restart').classList.toggle('end-restart',terminal);
 }
}
function describe(result){return result.choice==='wait'?(result.opened?'Les portes s’ouvrent. Vous restez à l’abri.':'Les portes tiennent. Vous gardez vos positions.'):result.fatal?'Les portes s’ouvrent. Les quatre porteurs tombent.':game.snapshot().hp===0?'La porte cède sous le dernier choc.':`La porte reste fermée. −${result.damage} PV.`;}
async function turn(choice){
 if(busy||preview||!game.begin(choice))return;
 const token=epoch;busy=true;render();$('#scene-result').hidden=true;$('#phase-badge').textContent='RÉSOLUTION';$('#command-title').textContent=choice==='charge'?'En avant !':'On tient la position.';$('#command-copy').textContent=choice==='charge'?'Les porteurs lancent le bélier…':'Le bélier reste en retrait…';
 sound.move(choice);scene?.approach(choice);await delay(reduced?160:850);if(token!==epoch)return;
 const result=game.reveal(),message=describe(result);scene?.resolve(result,game.snapshot().hp);sound.resolve(result,game.snapshot().hp);
 $('#scene-result').hidden=false;$('#scene-result').className=`scene-result ${result.fatal?'fatal':game.snapshot().hp===0?'victory':result.opened?'opened':'held'}`;
 $('#scene-result').innerHTML=`<span>${result.opened?'LES PORTES S’OUVRENT':game.snapshot().hp===0?'LA PORTE EST BRISÉE':'LES PORTES RESTENT FERMÉES'}</span><strong>${result.fatal?'L’équipe tombe dans le vide.':game.snapshot().hp===0?'La forteresse est à vous.':result.damage?`−${result.damage} PV`:'Vous gardez vos positions.'}</strong>`;
 $('#announcement').textContent=message;
 journal.unshift({turn:result.turn,text:message,fatal:result.fatal});journal=journal.slice(0,3);$('#journal').innerHTML=journal.map(item=>`<li${item.fatal?' class="fatal-entry"':''}><span>${String(item.turn).padStart(2,'0')}</span>${item.text}</li>`).join('');render();
 await delay(reduced?250:result.fatal?1350:1000);if(token!==epoch)return;
 if(!result.fatal&&game.snapshot().hp>0){scene?.recover();await delay(reduced?100:450);if(token!==epoch)return;$('#scene-result').hidden=true;}
 game.finish();busy=false;render();if(['won','lost'].includes(game.snapshot().phase))$('#restart').focus();
}
function reset(){epoch++;busy=false;game.reset();journal=[];scene?.reset();$('#scene-result').hidden=true;$('#journal').innerHTML='<li class="empty-journal">Les défenseurs vous attendent.</li>';render();$('#announcement').textContent='Nouveau siège. La porte a 200 points de vie. Quatre porteurs sont en position.';$('#charge').focus();}
if(!preview){
 $('#charge').addEventListener('click',()=>turn('charge'));$('#wait').addEventListener('click',()=>turn('wait'));$('#restart').addEventListener('click',reset);
 $('#sound').addEventListener('click',()=>{const muted=sound.toggle();$('#sound').setAttribute('aria-pressed',String(muted));$('#sound').setAttribute('aria-label',muted?'Activer le son':'Couper le son');$('#sound').innerHTML=muted?'♫ <span>SON COUPÉ</span>':'♪ <span>SON ACTIVÉ</span>';});
 $('#open-concept').addEventListener('click',()=>$('#concept').showModal());$('#close-concept').addEventListener('click',()=>$('#concept').close());$('#back-game').addEventListener('click',()=>$('#concept').close());
 $('#concept').addEventListener('click',event=>{const rect=$('#concept').getBoundingClientRect();if(event.target===$('#concept')&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))$('#concept').close();});
}
window.addEventListener('pagehide',()=>{epoch++;scene?.dispose();sound.close();},{once:true});render();
