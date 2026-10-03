import '../../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation,miniatureVersions} from '../../../shared/navigation.js';
import {roster,rarities,drawReward,restoreCollection,serializeCollection,addReward,collectionStats,storageKey} from './collection.js';
import {plushImage} from './plush.js';
import {createMachine} from './machine.js';
import {showPlush} from './reward-scene.js';
import {createFigurinePortraits} from './figurine-studio.js';

if(location.pathname==='/3/2/')history.replaceState(null,'',`/3/2${location.search}${location.hash}`);
const icon='<svg viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M16 2v9m-5 0h10l3 6-4 9m-9-15-3 6 4 9m4-15v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="29" r="5" stroke="currentColor" stroke-width="1.5"/></svg>';
const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 14 5-5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.querySelector('#app').innerHTML=`
<div class="claw-shell">
  <header class="site-header"><a class="brand" href="/3">${icon}<span>miniature<span class="brand-dot">.</span></span></a><div class="version-nav">${miniatureVersions(2)}${navigation(3)}</div></header>
  <main class="claw-main">
    <section class="play-side" aria-labelledby="game-title">
      <div class="play-heading"><div><span class="eyebrow">LES GRANDS HÉROS, EN TOUT PETIT</span><h1 id="game-title">Une pince.<br /><em>Mille câlins.</em></h1></div><p>Un petit bonheur<br />dans chaque capsule.</p></div>
      <div class="machine-stage"><span class="stage-note">LE CLUB DES PELUCHES <i></i> 100 PERSONNAGES</span><canvas id="machine" aria-label="Machine à pince en trois dimensions, vue devant la vitre"></canvas><div class="live-status" id="machine-status" role="status" aria-live="polite">La pince vous attend.</div></div>
      <div class="control-deck"><div class="direction-pad" role="group" aria-label="Déplacer la pince"><button data-direction="0,-1" class="up" aria-label="Reculer la pince">${arrow}</button><button data-direction="-1,0" class="left" aria-label="Pince à gauche">${arrow}</button><span class="pad-center" aria-hidden="true">✥</span><button data-direction="1,0" class="right" aria-label="Pince à droite">${arrow}</button><button data-direction="0,1" class="down" aria-label="Avancer la pince">${arrow}</button></div><button id="grab" class="grab-button">Attraper <span aria-hidden="true">↘</span></button><div class="session-note"><span id="attempts">00</span><small>tentatives<br /><b id="session-prizes">0 capsule</b></small></div><button class="mobile-collection" id="show-collection">Collection <span id="mobile-count">0 / 100</span></button></div>
    </section>
    <aside class="collection-side" id="collection-side" aria-labelledby="collection-title">
      <div class="collection-heading"><div><span class="eyebrow">VOTRE PETIT MUSÉE</span><h2 id="collection-title">Les trésors<span>.</span></h2></div><button id="close-collection" class="mobile-close" aria-label="Fermer la collection">×</button><span class="collection-count"><b id="collected">0</b><small>/ 100</small></span></div>
      <div class="collection-progress"><span id="collection-progress"></span></div>
      <div class="collection-meta"><span><b id="variants">0</b> / 400 variantes</span><span><b id="duplicates">0</b> doublon<span id="duplicate-s">s</span></span></div>
      <div class="rarity-tabs" role="group" aria-label="Édition de la collection">${rarities.map((r,i)=>`<button data-rarity="${r.id}" aria-pressed="${i===0}" style="--rarity:${r.color}"><i></i>${r.name}</button>`).join('')}</div>
      <div class="collection-toolbar"><label class="search"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor"/><path d="m12 12 4 4" stroke="currentColor"/></svg><input id="search" type="search" placeholder="Un personnage…" aria-label="Rechercher dans la collection" autocomplete="off" /></label><label class="owned-filter"><input id="owned-only" type="checkbox"/> Obtenus</label></div>
      <div class="collection-grid" id="collection-grid"></div><p id="no-results" hidden>Aucune peluche dans cette sélection.</p>
      <div class="collection-bottom"><span id="save-status">Collection sauvegardée sur cet appareil</span><button id="open-rates" aria-label="Voir les chances des éditions">Les éditions ↗</button></div>
    </aside>
  </main>
  <footer class="site-footer"><span>UN THÈME, UNE HERO SECTION</span><span>Édition octobre 2026</span><span>03 <i></i> 31</span></footer>
</div>
<dialog id="reward-dialog" class="reward-dialog" aria-labelledby="reward-name"><button class="dialog-close" id="close-reward" aria-label="Fermer">×</button><span class="eyebrow" id="reward-eyebrow">CAPSULE SURPRISE</span><div class="reward-art"><img id="reward-fallback" alt=""/><canvas id="reward-canvas" aria-label="Peluche en trois dimensions"></canvas></div><span class="reward-edition" id="reward-edition"></span><h2 id="reward-name"></h2><p id="reward-copy"></p><button id="continue" class="continue-button">Encore un petit bonheur <span aria-hidden="true">↗</span></button></dialog>
<dialog id="rates-dialog" class="text-dialog" aria-labelledby="rates-title"><button class="dialog-close" data-close="rates-dialog" aria-label="Fermer">×</button><span class="eyebrow">QUATRE FAÇONS DE BRILLER</span><h2 id="rates-title">Les éditions<span>.</span></h2><p>Chaque capsule attrapée révèle l’un des 100 personnages, avec les mêmes chances pour chacun.</p><ul class="rate-list">${rarities.map(r=>`<li><span><i style="background:${r.color}"></i>${r.name}</span><b>${r.id==='gold'?'1 / 100':r.id==='silver'?'1 / 50':r.id==='bronze'?'1 / 30':'93,67 %'}</b></li>`).join('')}</ul><p>Chaque personnage existe dans les quatre éditions. Les doublons comptent aussi dans votre collection.</p></dialog>
<dialog id="concept-dialog" class="text-dialog" aria-labelledby="concept-title"><button class="dialog-close" data-close="concept-dialog" aria-label="Fermer">×</button><span class="eyebrow">LE CONCEPT · MINIATURE</span><h2 id="concept-title">Un monde<br /><em>dans la poche.</em></h2><p>Une machine de fête foraine, des capsules surprises et 100 personnages Disney réinterprétés en petites peluches. Quatre éditions, des rencontres et parfois des retrouvailles.</p><p>Version 01 : mille personnages à retrouver.<br />Version 02 : cent peluches à collectionner.</p><small>Fan art indépendant créé pour Webtober.</small></dialog>`;
bindNavigation();
const $=selector=>document.querySelector(selector),counts=(()=>{try{return restoreCollection(localStorage.getItem(storageKey));}catch{return {};}})();
let edition='normal',attempts=0,sessionPrizes=0,machine,disposeReward=null,playingReward=false;
const status=$('#machine-status'),grab=$('#grab'),rewardDialog=$('#reward-dialog');
const rarityInfo=id=>rarities.find(r=>r.id===id);
const portraits=createFigurinePortraits();let portraitObserver=null;
function updatePortraits(){
  portraitObserver?.disconnect();
  const selectedEdition=edition;
  portraitObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const image=entry.target,character=roster.find(c=>c.id===image.closest('[data-character]').dataset.character);
      portraitObserver.unobserve(image);
      portraits.request(character,selectedEdition).then(src=>{if(src&&image.isConnected){image.src=src;image.dataset.render='3d';}});
    }
  },{root:$('#collection-grid'),rootMargin:'80px'});
  for(const image of document.querySelectorAll('.card-image img'))portraitObserver.observe(image);
}
function persist(){try{localStorage.setItem(storageKey,serializeCollection(counts));}catch{$('#save-status').textContent='Collection conservée pour cette session';}}
function refreshCollection(){
  const stats=collectionStats(counts);$('#collected').textContent=stats.characters;$('#mobile-count').textContent=`${stats.characters} / 100`;$('#variants').textContent=stats.variants;$('#duplicates').textContent=stats.duplicates;$('#duplicate-s').textContent=stats.duplicates===1?'':'s';$('#collection-progress').style.width=`${stats.characters}%`;
  const query=$('#search').value.toLocaleLowerCase('fr'),owned=$('#owned-only').checked;
  const visible=roster.filter(c=>(!owned||counts[`${c.id}:${edition}`])&&c.name.toLocaleLowerCase('fr').includes(query));
  $('#collection-grid').innerHTML=visible.map(c=>{
    const n=counts[`${c.id}:${edition}`]||0;
    return `<button class="plush-card${n?' is-owned':''}" data-character="${c.id}" aria-label="${c.name}, ${rarityInfo(edition).name}, ${n?n+' exemplaire'+(n>1?'s':''):'à découvrir'}"><div class="card-image"><img src="${plushImage(c,edition)}" alt="" loading="lazy" draggable="false"/>${n?`<span class="card-count">×${n}</span>`:'<span class="card-lock" aria-hidden="true">?</span>'}</div><span class="card-name">${c.name}</span></button>`;
  }).join('');$('#collection-grid').dataset.edition=edition;$('#no-results').hidden=visible.length>0;updatePortraits();
}
function openPlush(character,rarity,count,isPrize){
  disposeReward?.();disposeReward=null;playingReward=isPrize;
  $('#reward-eyebrow').textContent=isPrize?(count>1?'HEUREUSES RETROUVAILLES':'UN NOUVEAU PETIT BONHEUR'):count?'VOTRE COLLECTION':'À DÉCOUVRIR';
  $('#reward-name').textContent=character.name;$('#reward-edition').textContent=rarityInfo(rarity).name;$('#reward-edition').style.setProperty('--rarity',rarityInfo(rarity).color);
  $('#reward-copy').textContent=count>1?`${count} exemplaires dans votre collection.`:count?'Votre première peluche de cette édition.':'Un petit trésor qui attend sa capsule.';
  $('#continue').innerHTML=isPrize?'Encore un petit bonheur <span aria-hidden="true">↗</span>':'Retour à la collection <span aria-hidden="true">↗</span>';
  // A fresh canvas prevents a disposed WebGL context from being reused on reopen.
  const canvas=$('#reward-canvas'),freshCanvas=canvas.cloneNode(false);canvas.replaceWith(freshCanvas);
  $('#reward-fallback').src=plushImage(character,rarity);freshCanvas.hidden=false;rewardDialog.showModal();
  try{disposeReward=showPlush($('#reward-canvas'),character,rarity);$('#reward-fallback').hidden=true;}catch(e){console.error('Aperçu 3D de la peluche :',e);$('#reward-canvas').hidden=true;$('#reward-fallback').hidden=false;}
}
function closeReward(){rewardDialog.close();}
rewardDialog.addEventListener('close',()=>{disposeReward?.();disposeReward=null;if(playingReward){playingReward=false;machine?.release();}});
$('#close-reward').addEventListener('click',closeReward);$('#continue').addEventListener('click',closeReward);
const phaseLabels={descending:'La pince descend…',closing:'Un petit suspense…',lifting:'On remonte !',transporting:'Direction la sortie.',dropping:'Une surprise arrive…',opening:'Votre capsule est ouverte.',ready:'La pince vous attend.'};
try{
  machine=createMachine($('#machine'),{
    onPhase(phase){grab.disabled=phase!=='ready';document.querySelectorAll('[data-direction]').forEach(b=>b.disabled=phase!=='ready');if(phase!=='ready'||!status.textContent.includes('raté'))status.textContent=phaseLabels[phase];},
    onPrize(success){
      if(!success){status.textContent='De peu… c’est raté. La prochaine sera la bonne.';return;}
      const reward=drawReward(),count=addReward(counts,reward);sessionPrizes++;$('#session-prizes').textContent=`${sessionPrizes} capsule${sessionPrizes>1?'s':''}`;persist();refreshCollection();openPlush(reward.character,reward.rarity,count,true);
    },
  });
}catch(e){console.error('Machine 3D :',e);status.textContent='La machine a besoin de WebGL. Activez l’accélération graphique de votre navigateur.';grab.disabled=true;document.querySelectorAll('[data-direction]').forEach(b=>b.disabled=true);}
function catchCapsule(){if(machine?.grab()){attempts++;$('#attempts').textContent=String(attempts).padStart(2,'0');}}
grab.addEventListener('click',catchCapsule);
const pressed=new Map();
function updateDirection(){const vectors=[...pressed.values()];let x=0,z=0;for(const v of vectors){x+=v[0];z+=v[1];}const length=Math.max(1,Math.hypot(x,z));machine?.setDirection(x/length,z/length);}
for(const button of document.querySelectorAll('[data-direction]')){
  button.addEventListener('click',event=>{if(event.detail===0)machine?.nudge(...button.dataset.direction.split(',').map(Number));});
  button.addEventListener('pointerdown',event=>{if(button.disabled)return;event.preventDefault();button.setPointerCapture(event.pointerId);pressed.set(`pointer-${event.pointerId}`,button.dataset.direction.split(',').map(Number));updateDirection();});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>{pressed.delete(`pointer-${event.pointerId}`);updateDirection();});
}
const keys={ArrowLeft:[-1,0],a:[-1,0],q:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],z:[0,-1],ArrowDown:[0,1],s:[0,1]};
document.addEventListener('keydown',event=>{
  if(document.querySelector('dialog[open]')||$('#collection-side').classList.contains('is-open')||$('#day-picker').open||event.target.closest('input,a,summary'))return;
  if(event.code==='Space'){event.preventDefault();if(!event.repeat)catchCapsule();return;}
  const vector=keys[event.key];if(vector){event.preventDefault();pressed.set(event.key,vector);updateDirection();}
});
document.addEventListener('keyup',event=>{pressed.delete(event.key);updateDirection();});
window.addEventListener('blur',()=>{pressed.clear();updateDirection();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pressed.clear();updateDirection();}});
$('#collection-grid').addEventListener('click',event=>{const card=event.target.closest('[data-character]');if(!card)return;const c=roster.find(c=>c.id===card.dataset.character),n=counts[`${c.id}:${edition}`]||0;openPlush(c,edition,n,false);});
document.querySelectorAll('[data-rarity]').forEach(button=>button.addEventListener('click',()=>{edition=button.dataset.rarity;document.querySelectorAll('[data-rarity]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));refreshCollection();}));
$('#search').addEventListener('input',refreshCollection);$('#owned-only').addEventListener('change',refreshCollection);
$('#open-rates').addEventListener('click',()=>$('#rates-dialog').showModal());$('#open-concept').addEventListener('click',()=>$('#concept-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
function toggleCollection(open){
  const panel=$('#collection-side');panel.classList.toggle('is-open',open);
  if(open){pressed.clear();updateDirection();}
  for(const selector of ['.play-side','.site-header','.site-footer'])$(selector).inert=open;
  if(open){panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');$('#close-collection').focus();}
  else{panel.removeAttribute('role');panel.removeAttribute('aria-modal');(matchMedia('(max-width: 760px)').matches?$('#show-collection'):grab).focus();}
}
$('#show-collection').addEventListener('click',()=>toggleCollection(true));$('#close-collection').addEventListener('click',()=>toggleCollection(false));
document.addEventListener('keydown',event=>{
  const panel=$('#collection-side');if(!panel.classList.contains('is-open')||document.querySelector('dialog[open]'))return;
  if(event.key==='Escape'){event.preventDefault();toggleCollection(false);}
  if(event.key==='Tab'){
    const focusable=[...panel.querySelectorAll('button,input')].filter(e=>e.getClientRects().length&&!e.disabled),first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches&&$('#collection-side').classList.contains('is-open'))toggleCollection(false);});
window.addEventListener('pagehide',()=>{portraitObserver?.disconnect();portraits.dispose();machine?.dispose();disposeReward?.();},{once:true});
refreshCollection();
