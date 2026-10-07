import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {createCombat,fighters} from './combat.js';
import ogrest from '../assets/ogrest-cutout.png';
import tristepin from '../assets/tristepin.png';
import yugo from '../assets/yugo.png';

if(location.pathname==='/6/')history.replaceState(null,'',`/6${location.search}${location.hash}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const portraits={ogrest,tristepin,yugo};
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${{
 attack:'<path d="m5 19 14-14-1 7-7 6-5-1m1-3 4 4m-6 3 3-3"/>',
 dodge:'<path d="m7 6 5-3 5 3-5 3-5-3Zm-4 8 5-3m8 0 5 3m-9-5v7m0 0-5 5m5-5 5 5M2 6h3M1 9h4"/>',
 boost:'<path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/>',
 guard:'<path d="m12 3 8 3v6q0 6-8 9-8-3-8-9V6l8-3Z"/>',
 reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
}[name]}</svg>`;
const mountains=`<svg class="landscape" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#e9e9d8"/><stop offset="1" stop-color="#c0cdbb"/></linearGradient><linearGradient id="rock" x2="0" y2="1"><stop stop-color="#a3aa8e"/><stop offset="1" stop-color="#637263"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h1000v600H0z"/><circle cx="680" cy="126" r="85" fill="#f9f3db" opacity=".8"/><path d="M0 270 170 140 240 211 356 95 445 260 580 163 697 275 875 133 1000 263v337H0Z" fill="#b6c5b0" opacity=".55"/><path d="M0 383 175 260 283 372 418 223 543 392 759 258 855 380 1000 292v308H0Z" fill="#8d9e85" opacity=".42"/><path d="M-100 595 109 489 165 469 280 476 314 446 408 459 455 438 669 457 719 430 859 461 973 447 1100 570v120H-100Z" fill="url(#rock)"/><path d="m165 469 88 10 41 76 69 5m-49-114 39 62 55 11m261-62-10 66-65 80m125-173-4 45 90 27m-77-17-31 43m-515-42-27 52" fill="none" stroke="#5d6e60" stroke-width="3" opacity=".4"/><path d="M-50 435q190-60 385-4t440-12 280 13" stroke="#f2f3e1" stroke-width="37" fill="none" opacity=".24"/></svg>`;
document.querySelector('#app').innerHTML=`<div class="ogre-shell">
 <header class="site-header"><a class="brand" href="/" aria-label="Webtober, accueil"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 4v24M4 16h24M7.5 7.5l17 17m0-17-17 17" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="5" fill="#f5f2e9" stroke="currentColor" stroke-width="2"/></svg><span>webtober<span class="brand-dot">.</span></span></a>${navigation(6)}</header>
 <main>
  <div class="chapter-heading"><div><span class="eyebrow">AU SOMMET DU MONT ZINIT</span><h1>Face au <em>chaos.</em></h1></div><div class="round-heading"><span id="round-label">ROUND 01</span><div id="turn-order" class="turn-order" aria-label="Ordre du round"></div></div></div>
  <div class="battle-layout">
   <section class="stage" aria-label="Arène de combat">${mountains}<span class="place-label">ZINIT · ALTITUDE INCONNUE</span><div class="wind wind-a"></div><div class="wind wind-b"></div>
    ${Object.keys(fighters).map(id=>`<div class="fighter ${id}" id="fighter-${id}"><div class="fighter-health"><div><span>${fighters[id].name}</span><strong id="hp-${id}"></strong></div><div class="health-track" role="meter" aria-label="Points de vie de ${fighters[id].name}" aria-valuemin="0" aria-valuemax="${fighters[id].maxHp}" id="meter-${id}"><i id="bar-${id}"></i></div><span class="fighter-status" id="status-${id}"></span></div><div class="sprite-wrap"><div class="ground-shadow"></div><img class="sprite" src="${portraits[id]}" alt="${fighters[id].name}" draggable="false"/><span class="floating-hit" id="hit-${id}"></span><span class="active-ring"></span></div></div>`).join('')}
    <div class="stage-result" id="stage-result" hidden><span id="result-eyebrow"></span><h2 id="result-title"></h2><p id="result-copy"></p><button id="replay">Rejouer le combat <span>↗</span></button></div>
    <span class="stage-caption"><i></i> LA CONFRÉRIE DU TOFU <span>CONTRE</span> OGREST</span>
   </section>
   <aside class="tactics"><div class="intent-card"><div class="intent-heading"><span>OGREST PRÉPARE</span><span id="intent-icon"></span></div><h2 id="intent-title"></h2><p id="intent-copy"></p><div class="intent-target" id="intent-target"></div></div><div class="journal"><div class="journal-heading"><span>ÉCHOS DU COMBAT</span><span aria-hidden="true">↓</span></div><ol id="combat-log"></ol></div><button class="rules-link" id="open-rules">Les règles du duel <span>↗</span></button></aside>
  </div>
  <section class="action-dock" aria-label="Actions du personnage"><div class="active-portrait"><img id="active-avatar" src="${tristepin}" alt=""/><div><span id="active-label">À VOUS DE JOUER</span><h2 id="active-name">Tristepin</h2><span id="active-description">Le cœur d’un Iop.</span></div></div><div class="actions">${[['attack','Attaquer','Rubilax · 24 dégâts'],['dodge','Esquiver','Prochaine offensive évitée'],['boost','Se booster','Prochaine attaque ×2,2']].map(([id,title,description])=>`<button class="action-button" id="action-${id}" data-action="${id}">${icon(id)}<span><strong>${title}</strong><small id="description-${id}">${description}</small></span><span class="button-arrow">↗</span></button>`).join('')}</div></section>
  <p class="sr-only" id="live-status" role="status" aria-live="polite" aria-atomic="true"></p>
 </main>
 <footer><span>UN THÈME, UNE HERO SECTION</span><span class="credits">Univers & personnages © Ankama</span><button id="restart">${icon('reset')} Recommencer</button></footer>
</div>
<dialog id="rules-dialog"><button class="dialog-close" id="close-rules" aria-label="Fermer">×</button><span class="eyebrow">DEUX HÉROS. UN SEUL JOUEUR.</span><h2>Un peu de tactique,<br/><em>beaucoup de courage.</em></h2><p>Vous jouez Tristepin et Yugo. Chaque combattant vivant agit une fois par round, dans un nouvel ordre aléatoire. L’intention affichée est le prochain tour d’Ogrest.</p><dl><dt>Attaquer</dt><dd>Tristepin inflige 24 dégâts, Yugo 20. La garde d’Ogrest réduit ses deux prochains coups reçus de 60 % et prend fin à son prochain tour.</dd><dt>Esquiver</dt><dd>Évite la prochaine offensive d’Ogrest. L’esquive reste prête s’il se défend. Après une esquive, faites une autre action avant de pouvoir l’utiliser à nouveau.</dd><dt>Se booster</dt><dd>Multiplie la prochaine attaque par 2,2. Impossible de cumuler des boosts. Esquiver abandonne le boost.</dd></dl><p>À partir du round 9, Ogrest inflige 3 dégâts de plus par round. Un héros tombé ne joue plus ; son allié peut finir le combat seul.</p><details><summary>Crédits des illustrations</summary><p>Personnages et illustrations de l’univers DOFUS / WAKFU © Ankama. Expérience de fan indépendante.</p><a href="https://www.pngegg.com/fr/png-mwqoo" target="_blank" rel="noopener noreferrer">Ogrest · source du visuel</a><small>Détourage adapté avec imagegen.</small><a href="https://www.pinclipart.com/downpngs/hmxhTi_tristepin-wakfu-season-1-characters-clipart/" target="_blank" rel="noopener noreferrer">Tristepin · source du visuel</a><a href="https://www.pngaaa.com/detail/1817776" target="_blank" rel="noopener noreferrer">Yugo · source du visuel</a></details></dialog>`;
bindNavigation();
const $=selector=>document.querySelector(selector),game=createCombat();
let timer=null,epoch=0,busy=false;
function intentText(intent){
 if(intent.action==='guard')return ['Garde de pierre','Ses deux prochains coups reçus seront réduits de 60 %.','guard'];
 if(intent.action==='sweep')return ['Onde de choc',`${intent.damage} dégâts sur ${intent.targets.length>1?'les deux héros':fighters[intent.targets[0]].name}.`,'attack'];
 return [intent.action==='heavy'?'Poing du chaos':'Coup titanesque',`${intent.damage} dégâts sur ${fighters[intent.targets[0]].name}.`,'attack'];
}
function render(){
 const s=game.state,active=game.active;
 $('#round-label').textContent=`ROUND ${String(s.round).padStart(2,'0')}`;
 $('#turn-order').innerHTML=s.order.map((id,i)=>`<span class="turn-chip ${id} ${i<s.cursor?'played':''} ${i===s.cursor&&s.phase==='playing'?'current':''} ${s.units[id].hp<=0?'fallen':''}" ${i===s.cursor&&s.phase==='playing'?'aria-current="step"':''}><img src="${portraits[id]}" alt=""/><span>${fighters[id].name}</span></span>`).join('<b aria-hidden="true">›</b>');
 for(const [id,unit] of Object.entries(s.units)){
  $(`#hp-${id}`).textContent=`${unit.hp} / ${fighters[id].maxHp}`;
  $(`#meter-${id}`).setAttribute('aria-valuenow',unit.hp);
  $(`#bar-${id}`).style.width=`${unit.hp/fighters[id].maxHp*100}%`;
  const fighter=$(`#fighter-${id}`);fighter.classList.toggle('is-active',active===id);fighter.classList.toggle('is-fallen',unit.hp<=0);fighter.classList.toggle('is-boosted',unit.boost);fighter.classList.toggle('is-dodging',unit.dodge);fighter.classList.toggle('is-guarding',unit.guard>0);
  $(`#status-${id}`).textContent=unit.hp<=0?'À terre':unit.boost?'Boost ×2,2':unit.dodge?'Esquive prête':unit.guard>0?`Garde · ${unit.guard} coups`:active===id?'À son tour':'';
 }
 const [title,copy,intentIcon]=intentText(s.intent);$('#intent-title').textContent=title;$('#intent-copy').textContent=copy;$('#intent-icon').innerHTML=icon(intentIcon);
 $('#intent-target').textContent=s.phase!=='playing'?'Combat terminé':s.intent.action==='guard'?'DÉFENSE':`CIBLE${s.intent.targets.length>1?'S':''} · ${s.intent.targets.map(id=>fighters[id].name).join(' & ')}`;
 $('#combat-log').innerHTML=s.log.slice(0,5).map((line,i)=>`<li class="${i===0?'latest':''}">${line}</li>`).join('');
 const player=active&&active!=='ogrest',unit=player?s.units[active]:null;
 $('#active-avatar').src=portraits[active||'tristepin'];$('#active-name').textContent=s.phase==='playing'?fighters[active].name:s.phase==='won'?'Victoire !':'Défaite';
 $('#active-label').textContent=player?'À VOUS DE JOUER':s.phase==='playing'?'LE BOSS JOUE':'FIN DU COMBAT';
 $('#active-description').textContent=player?(active==='tristepin'?'Le cœur d’un Iop.':'L’esprit d’un Éliatrope.'):'La Confrérie du Tofu';
 $('#description-attack').textContent=player?`${active==='tristepin'?'Rubilax':'Wakfu'} · ${Math.round(fighters[active].damage*(unit.boost?2.2:1))} dégâts`:'Le boss se prépare…';
 $('#description-dodge').textContent=unit?.dodge?'Esquive déjà prête':unit?.dodgeCooldown?'Disponible après une autre action':'Prochaine offensive évitée';
 $('#description-boost').textContent=unit?.boost?'Boost déjà prêt':'Prochaine attaque ×2,2';
 for(const action of ['attack','dodge','boost'])$(`#action-${action}`).disabled=preview||busy||!player||(action==='dodge'&&(unit.dodge||unit.dodgeCooldown>0))||(action==='boost'&&unit.boost);
 $('#stage-result').hidden=s.phase==='playing';
 if(s.phase!=='playing'){
  $('#result-eyebrow').textContent=s.phase==='won'?'LE CHAOS S’APAISE':'LE ZINIT A TREMBLÉ';$('#result-title').textContent=s.phase==='won'?'La Confrérie triomphe.':'Ogrest résiste.';
  $('#result-copy').textContent=s.phase==='won'?`Victoire au round ${s.round}. Les héros du Monde des Douze ont tenu bon.`:'Un autre ordre. Une autre stratégie. Une nouvelle chance.';
 }
}
function announce(){const s=game.state;$('#live-status').textContent=`${s.log[0]} ${s.phase==='playing'?`Au tour de ${fighters[game.active].name}.`:'Combat terminé.'}`;}
function animate(event){
 const sprite=$(`#fighter-${event.actor} .sprite`);
 sprite.animate([{transform:'translate(0,0)'},{transform:`translate(${event.actor==='ogrest'?'-':'+'}18px,-7px)`},{transform:'translate(0,0)'}],{duration:450});
 for(const hit of event.hits){
  const output=$(`#hit-${hit.id}`);output.textContent=hit.dodged?'ESQUIVÉ':`−${hit.damage}`;
  output.classList.toggle('evaded',hit.dodged);output.animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,offset:.25},{opacity:0,transform:'translateY(-35px)'}],{duration:1000});
  if(!hit.dodged)$(`#fighter-${hit.id} .sprite`).animate([{filter:'brightness(1)'},{filter:'brightness(1.8)',transform:'translateX(8px)'},{filter:'brightness(1)'}],{duration:350});
 }
}
function schedule(){
 clearTimeout(timer);if(preview||game.state.phase!=='playing'||game.active!=='ogrest'||$('#rules-dialog').open)return;
 const token=epoch;timer=setTimeout(()=>{if(token!==epoch)return;play(true);},1250);
}
function play(boss=false,action){
 if(busy||preview||game.state.phase!=='playing')return;
 const event=boss?game.bossTurn():game.act(action);if(!event)return;
 busy=true;render();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animate(event);announce();
 const token=epoch;timer=setTimeout(()=>{if(token!==epoch)return;busy=false;render();schedule();},550);
}
function reset(){clearTimeout(timer);epoch++;busy=false;game.reset();render();announce();schedule();}
for(const button of document.querySelectorAll('[data-action]'))button.addEventListener('click',()=>play(false,button.dataset.action));
$('#restart').addEventListener('click',reset);$('#replay').addEventListener('click',reset);
const dialog=$('#rules-dialog');
for(const id of ['open-rules','open-concept'])$(`#${id}`).addEventListener('click',()=>{clearTimeout(timer);epoch++;busy=false;render();dialog.showModal();});
$('#close-rules').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',schedule);
document.addEventListener('visibilitychange',()=>{clearTimeout(timer);epoch++;busy=false;if(!document.hidden){render();schedule();}});
window.addEventListener('pagehide',()=>{clearTimeout(timer);epoch++;});
render();schedule();
