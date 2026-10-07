import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {createCombat,fighters} from './combat.js';
import {presentTurn} from './presentation.js';
import ogrest from '../assets/ogrest-cutout.png';
import tristepin from '../assets/tristepin.png';
import yugo from '../assets/yugo.png';

if(location.pathname==='/6/')history.replaceState(null,'',`/6${location.search}${location.hash}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const portraits={ogrest,tristepin,yugo};
const roles={tristepin:'GUERRIER IOP',yugo:'ÉLIATROPE',ogrest:'BOSS DU ZINIT'};
const symbols={
 attack:'<path d="m5 19 14-14-1 7-7 6-5-1m1-3 4 4m-6 3 3-3"/>',
 dodge:'<path d="m7 6 5-3 5 3-5 3-5-3Zm-4 8 5-3m8 0 5 3m-9-5v7m0 0-5 5m5-5 5 5M2 6h3M1 9h4"/>',
 boost:'<path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/>',
 guard:'<path d="m12 3 8 3v6q0 6-8 9-8-3-8-9V6l8-3Z"/>',
 reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${symbols[name]}</svg>`;
const ogreIcon='<svg class="ogre-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M10 22 3 12l20 5h18l20-5-7 10v21Q32 62 10 43Z" fill="currentColor"/><path d="m18 39 5 12 4-15m10 0 4 15 5-12" fill="#ffedbe"/><path d="m17 25 10 4m10 0 10-4" stroke="#132622" stroke-width="4" stroke-linecap="round"/></svg>';
const landscape=`<svg class="landscape" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="night" x2="0" y2="1"><stop stop-color="#132b31"/><stop offset="1" stop-color="#33504a"/></linearGradient><linearGradient id="stone" x2="0" y2="1"><stop stop-color="#426052"/><stop offset="1" stop-color="#192d2a"/></linearGradient><radialGradient id="moon"><stop stop-color="#d8f6d3"/><stop offset="1" stop-color="#94c5aa"/></radialGradient></defs><path fill="url(#night)" d="M0 0h1000v650H0z"/><circle cx="730" cy="142" r="70" fill="url(#moon)" opacity=".6"/><path d="M0 292 108 210 194 248 345 96 471 278 571 176 702 249 831 129 1000 265v385H0Z" fill="#456d68" opacity=".5"/><path d="m294 160 51-64 60 88-47-21-17 13-19-23Z" fill="#9bc2ac" opacity=".3"/><path d="M0 379 146 269 275 356 424 234 559 392 731 261 856 349 1000 272v378H0Z" fill="#152f32" opacity=".85"/><path d="M0 425q231-47 399 6t340-19 261 22" stroke="#9dc5a61a" stroke-width="40" fill="none"/><path d="m-70 582 156-94 176 11 173-44 160 19 129-21 182 39 163 4 53 154H-70Z" fill="url(#stone)"/><path d="m86 488 83 17 31 60m62-66 42 70 131 8m0-122-25 112m185-93 29 68-82 44m182-133-22 84 92 28m90-73-95 15" stroke="#739578" stroke-width="3" fill="none" opacity=".3"/><path d="M82 492 256 506 435 463 595 482 724 462 906 500" stroke="#bad4a5" stroke-width="3" opacity=".2"/><g fill="#afddc4" opacity=".7"><circle cx="82" cy="162" r="1.5"/><circle cx="233" cy="102" r="1"/><circle cx="481" cy="91" r="1.3"/><circle cx="870" cy="86" r="1.5"/><circle cx="614" cy="184" r="1"/></g></svg>`;
document.querySelector('#app').innerHTML=`<div class="ogre-shell">
 <header class="site-header"><a class="brand" href="/" aria-label="Ogre, retour au calendrier">${ogreIcon}<span>ogre<span class="brand-dot">.</span></span></a>${navigation(6)}</header>
 <main>
  <div class="chapter-heading"><div class="chapter-title"><span class="eyebrow">MONT ZINIT / COMBAT DE BOSS</span><h1>LE CHAOS <span>D’OGREST</span></h1></div><div class="round-heading"><span id="round-label">ROUND 01</span><div id="turn-order" class="turn-order" aria-label="Ordre du round"></div></div></div>
  <div class="battle-layout">
   <section class="stage" aria-label="Arène de combat">${landscape}<div class="stage-grain"></div><div class="fog"></div>
    <div class="arena-hud">${Object.keys(fighters).map(id=>`<div class="unit-card ${id}" id="card-${id}"><div class="unit-card-top"><span>${fighters[id].name}</span><strong id="hp-${id}"></strong></div><div class="health-track" role="meter" aria-label="Points de vie de ${fighters[id].name}" aria-valuemin="0" aria-valuemax="${fighters[id].maxHp}" id="meter-${id}"><i id="bar-${id}"></i></div><span class="unit-status" id="status-${id}"></span></div>`).join('')}</div>
    <div class="center-aura"></div>
    ${Object.keys(fighters).map(id=>`<div class="fighter ${id}" id="fighter-${id}"><div class="sprite-wrap"><div class="ground-shadow"></div><img class="sprite" src="${portraits[id]}" alt="${fighters[id].name}" draggable="false"/><span class="floating-hit" id="hit-${id}"></span><span class="active-ring"></span></div></div>`).join('')}
    <div class="actor-banner"><span id="actor-mode">À VOUS DE JOUER</span><strong id="actor-title">TRISTEPIN</strong><span class="actor-rule"></span></div>
    <span class="place-label">ZINIT · LE MONDE DES DOUZE</span><span class="arena-corner" aria-hidden="true">06</span>
    <div class="stage-result" id="stage-result" hidden><span id="result-eyebrow"></span><h2 id="result-title"></h2><p id="result-copy"></p><button id="replay">REJOUER ${icon('reset')}</button></div>
   </section>
   <aside class="command-panel" aria-label="Actions du personnage">
    <div class="active-portrait"><div class="portrait-frame"><img id="active-avatar" src="${tristepin}" alt=""/></div><div><span id="active-label">VOTRE PERSONNAGE</span><h2 id="active-name">Tristepin</h2><span id="active-description">GUERRIER IOP</span></div></div>
    <div class="actions">${[['attack','ATTAQUER','Rubilax · 24 dégâts','01'],['dodge','ESQUIVER','Évite la prochaine offensive','02'],['boost','SE BOOSTER','Prochaine attaque ×2,2','03']].map(([id,title,description,num])=>`<button class="action-button ${id}" id="action-${id}" data-action="${id}"><span class="action-symbol">${icon(id)}</span><span><strong>${title}</strong><small id="description-${id}">${description}</small></span><span class="action-index">${num}</span></button>`).join('')}</div>
    <div class="boss-move" id="boss-move" hidden><span id="boss-move-icon"></span><div><span>OGREST JOUE</span><h3 id="boss-move-title"></h3><p id="boss-move-copy"></p></div></div>
    <div class="combat-feed"><span class="feed-heading">JOURNAL DU COMBAT</span><ol id="combat-log"></ol></div>
    <button class="rules-link" id="open-rules">Règles du duel <span>↗</span></button>
   </aside>
  </div>
  <p class="sr-only" id="live-status" role="status" aria-live="polite" aria-atomic="true"></p>
 </main>
 <footer><span>LA CONFRÉRIE DU TOFU <i>VS</i> OGREST</span><span class="credits">Univers & personnages © Ankama</span><button id="restart">${icon('reset')} Recommencer</button></footer>
</div>
<dialog id="rules-dialog"><button class="dialog-close" id="close-rules" aria-label="Fermer">×</button><span class="eyebrow">DEUX HÉROS. UN SEUL JOUEUR.</span><h2>LE DUEL DU ZINIT</h2><p>Vous jouez Tristepin et Yugo. Chaque combattant vivant agit une fois par round, dans un nouvel ordre aléatoire. Le personnage actif passe au centre. Ogrest choisit son action uniquement à son tour : aucun coup ni aucune cible n’est annoncé à l’avance.</p><dl><dt>Attaquer</dt><dd>Tristepin inflige 24 dégâts, Yugo 20. La garde active d’Ogrest réduit ses deux prochains coups reçus de 60 % et prend fin à son prochain tour.</dd><dt>Esquiver</dt><dd>Évite la prochaine offensive d’Ogrest. L’esquive reste prête s’il se défend, puis expire quand il attaque, même s’il vise votre allié. Une autre action est nécessaire avant de pouvoir esquiver à nouveau.</dd><dt>Se booster</dt><dd>Multiplie la prochaine attaque par 2,2. Les boosts ne se cumulent pas. Esquiver abandonne le boost.</dd></dl><p>Ogrest possède 380 PV. À partir du round 11, ses attaques gagnent 2 dégâts par round. Un héros tombé ne joue plus ; son allié peut finir le combat seul.</p><details><summary>Crédits des illustrations</summary><p>Univers et illustrations DOFUS / WAKFU © Ankama. Expérience de fan indépendante.</p><a href="https://www.pngegg.com/fr/png-mwqoo" target="_blank" rel="noopener noreferrer">Ogrest · source du visuel</a><small>Détourage adapté avec imagegen.</small><a href="https://www.pinclipart.com/downpngs/hmxhTi_tristepin-wakfu-season-1-characters-clipart/" target="_blank" rel="noopener noreferrer">Tristepin · source du visuel</a><a href="https://www.pngaaa.com/detail/1817776" target="_blank" rel="noopener noreferrer">Yugo · source du visuel</a></details></dialog>`;
bindNavigation();
const $=selector=>document.querySelector(selector),game=createCombat();
let timer=null,epoch=0,busy=false;
function describeMove(move){
 if(move.action==='guard')return ['GARDE DE PIERRE','Ses deux prochains coups reçus sont réduits de 60 %.','guard'];
 if(move.action==='sweep')return ['ONDE DE CHOC',`${move.damage} dégâts sur ${move.targets.length>1?'les deux héros':fighters[move.targets[0]].name}.`,'attack'];
 return [move.action==='heavy'?'POING DU CHAOS':'COUP TITANESQUE',`${move.damage} dégâts sur ${fighters[move.targets[0]].name}.`,'attack'];
}
function render(){
 const s=game.state,active=game.active,{focus,bossMove}=presentTurn(s,active,busy);
 $('#round-label').textContent=`ROUND ${String(s.round).padStart(2,'0')}`;
 $('#turn-order').innerHTML=s.order.map((id,i)=>`<span class="turn-chip ${id} ${i<s.cursor?'played':''} ${id===focus?'current':''} ${s.units[id].hp<=0?'fallen':''}" ${id===focus?'aria-current="step"':''}><img src="${portraits[id]}" alt=""/><span>${fighters[id].name}</span></span>`).join('<b aria-hidden="true">›</b>');
 $('.stage').dataset.focus=focus||'';
 for(const [id,unit] of Object.entries(s.units)){
  $(`#hp-${id}`).textContent=`${unit.hp} / ${fighters[id].maxHp}`;$(`#meter-${id}`).setAttribute('aria-valuenow',unit.hp);$(`#bar-${id}`).style.width=`${unit.hp/fighters[id].maxHp*100}%`;
  const fighter=$(`#fighter-${id}`);fighter.classList.toggle('is-active',focus===id);fighter.classList.toggle('is-fallen',unit.hp<=0);fighter.classList.toggle('is-boosted',unit.boost);fighter.classList.toggle('is-dodging',unit.dodge);fighter.classList.toggle('is-guarding',unit.guard>0);$(`#card-${id}`).classList.toggle('is-current',focus===id);
  $(`#status-${id}`).textContent=unit.hp<=0?'À TERRE':unit.boost?'BOOST ×2,2':unit.dodge?'ESQUIVE PRÊTE':unit.guard>0?`GARDE · ${unit.guard} COUPS`:focus===id?'TOUR ACTIF':roles[id];
 }
 const player=active&&active!=='ogrest',unit=player?s.units[active]:null,acting=focus||'tristepin';
 $('#active-avatar').src=portraits[acting];$('#active-name').textContent=s.phase==='playing'?fighters[acting].name:s.phase==='won'?'Victoire':'Défaite';
 $('#active-label').textContent=s.phase!=='playing'?'FIN DU COMBAT':focus==='ogrest'?'TOUR DU BOSS':busy?'ACTION EN COURS':'VOTRE PERSONNAGE';
 $('#active-description').textContent=roles[acting];$('#actor-mode').textContent=s.phase!=='playing'?'COMBAT TERMINÉ':focus==='ogrest'?'LE BOSS JOUE':busy?'ACTION EN COURS':'À VOUS DE JOUER';
 $('#actor-title').textContent=focus?fighters[focus].name.toUpperCase():'LA CONFRÉRIE';
 $('#description-attack').textContent=player?`${active==='tristepin'?'Rubilax':'Wakfu'} · ${Math.round(fighters[active].damage*(unit.boost?2.2:1))} dégâts`:'Ogrest joue son tour';
 $('#description-dodge').textContent=unit?.dodge?'Esquive déjà prête':unit?.dodgeCooldown?'Faites une autre action':'Évite la prochaine offensive';$('#description-boost').textContent=unit?.boost?'Boost déjà prêt':'Prochaine attaque ×2,2';
 for(const action of ['attack','dodge','boost'])$(`#action-${action}`).disabled=preview||busy||!player||(action==='dodge'&&(unit.dodge||unit.dodgeCooldown>0))||(action==='boost'&&unit.boost);
 $('#boss-move').hidden=!bossMove;
 // Clear the DOM too: no hidden title, target or future damage for a hero's turn.
 const [title,copy,symbol]=bossMove?describeMove(bossMove):['','','guard'];
 $('#boss-move-title').textContent=title;$('#boss-move-copy').textContent=copy;$('#boss-move-icon').innerHTML=bossMove?icon(symbol):'';
 $('#combat-log').innerHTML=s.log.slice(0,2).map((line,i)=>`<li class="${i===0?'latest':''}">${line}</li>`).join('');
 $('#stage-result').hidden=s.phase==='playing';
 if(s.phase!=='playing'){
  $('#result-eyebrow').textContent=s.phase==='won'?'LE CHAOS S’APAISE':'LE ZINIT A TREMBLÉ';$('#result-title').textContent=s.phase==='won'?'VICTOIRE':'DÉFAITE';
  $('#result-copy').textContent=s.phase==='won'?`Ogrest est vaincu au round ${s.round}. La Confrérie a tenu bon.`:'Changez de stratégie. Le Zinit vous attend.';
 }
}
function announce(){const s=game.state;$('#live-status').textContent=`${s.log[0]} ${s.phase==='playing'?`Au tour de ${fighters[game.active].name}.`:'Combat terminé.'}`;}
function animate(event){
 $(`#fighter-${event.actor} .sprite`).animate([{transform:'translateY(0)'},{transform:'translateY(-15px) scale(1.06)'},{transform:'translateY(0)'}],{duration:450});
 for(const hit of event.hits){
  const output=$(`#hit-${hit.id}`);output.textContent=hit.dodged?'ESQUIVÉ':`−${hit.damage}`;output.classList.toggle('evaded',hit.dodged);
  output.animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,offset:.2},{opacity:0,transform:'translateY(-45px)'}],{duration:1100});
  if(!hit.dodged)$(`#fighter-${hit.id} .sprite`).animate([{filter:'brightness(1)'},{filter:'brightness(2)',transform:'translateX(10px)'},{filter:'brightness(1)'}],{duration:350});
 }
 if(event.hits.some(h=>h.damage>0))$('.stage').animate([{translate:'0 0'},{translate:'3px 0'},{translate:'-3px 0'},{translate:'0 0'}],{duration:200});
}
function schedule(){
 clearTimeout(timer);if(preview||game.state.phase!=='playing'||game.active!=='ogrest'||$('#rules-dialog').open)return;
 const token=epoch;timer=setTimeout(()=>{if(token===epoch)play(true);},1450);
}
function play(boss=false,action){
 if(busy||preview||game.state.phase!=='playing')return;
 const event=boss?game.bossTurn():game.act(action);if(!event)return;
 busy=true;render();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animate(event);announce();
 const token=epoch;timer=setTimeout(()=>{if(token!==epoch)return;busy=false;render();schedule();},650);
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
