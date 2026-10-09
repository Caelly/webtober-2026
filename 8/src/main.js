import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {layers,notes,byId,candidates,canAdd,toggleNote,ready,bottleColor,perfumes} from './catalogue.js';
import {bottle,botanical,perfumeIcon} from './visuals.js';

if(location.pathname==='/8/')history.replaceState(null,'',`/8${location.search}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
let selection=preview?['bergamot','iris','vanilla']:[],activeLayer='head',result=null;
const $=selector=>document.querySelector(selector);
const arrow='<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$('#app').innerHTML=`<div class="atelier-shell">
  <header class="site-header"><a href="/" class="brand" aria-label="Puant, revenir au calendrier">${perfumeIcon}<span>puant<span class="brand-dot">.</span></span></a>${navigation(8)}</header>
  <main class="workspace">
    <section class="introduction"><div class="eyebrow"><i></i> L’ATELIER OLFACTIF <span>08 / 31</span></div><h1>Une goutte.<br/><em>Votre signature.</em></h1><p class="intro-copy">Un peu de vous dans chaque note.<br/>Composez un accord, découvrez son sillage.</p>
      <div class="composition"><div class="section-heading"><span>VOTRE COMPOSITION</span><button id="reset" aria-label="Vider le flacon et recommencer"><span aria-hidden="true">↺</span> Recommencer</button></div>
        <div class="pyramid">${layers.map(layer=>`<section class="pyramid-layer" data-layer="${layer.id}"><span class="layer-number">${layer.number}</span><div><h2>Notes de ${layer.name.toLowerCase()}</h2><div class="selected-notes" id="selected-${layer.id}"></div></div><i class="layer-check" aria-hidden="true"></i></section>`).join('')}</div>
      </div>
    </section>
    <section class="bottle-stage" aria-label="Votre flacon"><span class="bottle-caption">UNE CRÉATION PERSONNELLE</span><div class="bottle-art">${bottle}<div class="drop-area" aria-hidden="true"></div></div><div class="bottle-footnote"><span id="note-count">00</span><span>notes dans le flacon</span><i></i><span>100 ml d’imagination</span></div><div class="botanical-decoration" aria-hidden="true">${botanical(byId.get('patchouli'))}</div></section>
    <section class="fragrance-lab" aria-labelledby="palette-title"><div class="lab-heading"><div><span class="eyebrow">LA PALETTE DU PARFUMEUR</span><h2 id="palette-title">L’essence des choses.</h2></div><span class="palette-count">${notes.length}<small>notes</small></span></div>
      <div class="layer-tabs" role="tablist" aria-label="Étages de la pyramide olfactive">${layers.map(layer=>`<button id="tab-${layer.id}" role="tab" aria-controls="note-panel" aria-selected="${layer.id===activeLayer}" tabindex="${layer.id===activeLayer?0:-1}" data-tab="${layer.id}"><span>${layer.number}</span>${layer.name}<i></i></button>`).join('')}</div>
      <div id="note-panel" role="tabpanel" aria-labelledby="tab-head" tabindex="0"><div class="layer-description"><span id="layer-subtitle"></span><p id="layer-description"></p></div><div class="note-grid" id="note-grid"></div></div>
      <div class="lab-bottom"><p class="accord-hint">Les notes grisées ne partagent pas cet accord dans notre collection.</p><button class="reveal-button" id="reveal" disabled>Révéler mon parfum ${arrow}</button><span class="readiness" id="readiness">Une note de tête, de cœur et de fond.</span></div>
    </section>
  </main>
  <footer><span>WEBTOBER 2026</span><span>LE THÈME SENT MAUVAIS. VOTRE PARFUM, UN PEU MOINS.</span><a href="/7">Jour précédent <span>↖</span></a></footer>
</div>
<dialog id="result-dialog" class="result-dialog" aria-labelledby="result-title"><button class="dialog-close" data-close aria-label="Fermer le résultat">×</button><div id="result-content"></div></dialog>
<dialog id="concept-dialog" class="concept-dialog" aria-labelledby="concept-title"><button class="dialog-close" data-close aria-label="Fermer le concept">×</button><span class="eyebrow">WEBTOBER · JOUR 08</span><h2 id="concept-title">Du thème « Puant »<br/>à votre parfum.</h2><p>34 notes à explorer, trois étages à composer et un flacon qui prend vie. Une note de chaque étage suffit à révéler un parfum connu qui contient toutes vos notes.</p><p>La palette propose les accords présents parmi nos 12 références. Retirez une note ou recommencez pour explorer une autre direction.</p><p class="concept-fine">Le classement tête, cœur et fond est simplifié pour l’atelier : une même note peut changer de place selon le parfum. Les rapprochements utilisent les notes publiées par les maisons, sans reproduire leurs formules.</p></dialog>
<p class="sr-only" role="status" id="announcement" aria-live="polite"></p>`;
bindNavigation();

function renderPalette(){
  const layer=layers.find(layer=>layer.id===activeLayer);
  $('#layer-subtitle').textContent=layer.subtitle;$('#layer-description').textContent=layer.description;
  $('#note-panel').setAttribute('aria-labelledby',`tab-${activeLayer}`);
  document.querySelectorAll('[data-tab]').forEach(button=>{
    const active=button.dataset.tab===activeLayer;
    button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
    button.classList.toggle('has-notes',selection.some(id=>byId.get(id).layer===button.dataset.tab));
  });
  $('#note-grid').innerHTML=notes.filter(note=>note.layer===activeLayer).map(note=>{
    const selected=selection.includes(note.id),available=selected||canAdd(selection,note.id);
    return `<button class="note-card" data-note="${note.id}" style="--note-color:${note.color}" aria-pressed="${selected}" aria-label="${selected?'Retirer':'Ajouter'} ${note.name}"${available?'':' disabled'}><span class="note-drawing">${botanical(note)}</span><strong>${note.name}</strong><small>${note.facet}</small><span class="note-plus" aria-hidden="true">${selected?'✓':'+'}</span></button>`;
  }).join('');
}
function render(){
  renderPalette();
  for(const layer of layers){
    const chosen=selection.filter(id=>byId.get(id).layer===layer.id);
    $(`[data-layer="${layer.id}"]`).classList.toggle('filled',chosen.length>0);
    $(`#selected-${layer.id}`).innerHTML=chosen.length?chosen.map(id=>`<button data-remove="${id}" aria-label="Retirer ${byId.get(id).name}">${byId.get(id).name}<span aria-hidden="true">×</span></button>`).join(''):'<span class="empty-note">Encore une page blanche</span>';
  }
  document.documentElement.style.setProperty('--juice',bottleColor(selection));
  const level=470-Math.min(selection.length,9)*28;
  $('.perfume-liquid').setAttribute('y',String(level));$('.liquid-surface').setAttribute('cy',String(level));
  $('#bottle-notes').textContent=selection.length?`${selection.length} NOTES · VOTRE ACCORD`:'UNE PAGE BLANCHE';
  $('#note-count').textContent=String(selection.length).padStart(2,'0');
  $('#reset').disabled=!selection.length;$('#reveal').disabled=!ready(selection);
  $('#readiness').textContent=ready(selection)?'Votre signature est prête à se dévoiler.':'Une note de tête, de cœur et de fond.';
}
function animateDrop(id){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const drop=document.createElement('i');drop.className='fragrance-drop';drop.style.background=byId.get(id).color;
  $('.drop-area').append(drop);drop.addEventListener('animationend',()=>drop.remove(),{once:true});
  $('.bottle-art').classList.remove('adding');void $('.bottle-art').offsetWidth;$('.bottle-art').classList.add('adding');
}
function changeNote(id){
  const adding=!selection.includes(id);selection=toggleNote(selection,id);render();
  if(adding&&selection.includes(id))animateDrop(id);
  $('#announcement').textContent=`${byId.get(id).name} : ${adding?'ajout au':'retrait du'} flacon. ${selection.length} ${selection.length===1?'note sélectionnée':'notes sélectionnées'}.`;
}
function resultMarkup(perfume){
  const alternatives=candidates(selection).filter(item=>item.id!==perfume.id);
  return `<span class="eyebrow">VOTRE ACCORD A UNE FAMILLE</span><div class="result-seal" aria-hidden="true">${perfumeIcon}</div><span class="result-brand">${perfume.brand}</span><h2 id="result-title">${perfume.name}</h2><p class="result-type">${perfume.type} <span>·</span> ${perfume.family}</p><div class="result-rule"></div><p class="result-explanation">Vos ${selection.length} notes se retrouvent dans ce parfum.</p><div class="result-notes">${selection.map(id=>`<span style="--note-color:${byId.get(id).color}"><i></i>${byId.get(id).name}</span>`).join('')}</div><a class="source-link" href="${perfume.source}" target="_blank" rel="noopener noreferrer">La composition officielle <span>↗</span></a><p class="result-fine">Une parenté de notes, pas une reproduction de la formule.</p>${alternatives.length?`<div class="alternatives"><span>CES NOTES EXISTENT AUSSI DANS</span>${alternatives.map(item=>`<button data-perfume="${item.id}">${item.name} <span>↗</span></button>`).join('')}</div>`:''}<button class="again-button" id="new-perfume">Composer un autre parfum ${arrow}</button>`;
}
function showResult(perfume){result=perfume;$('#result-content').innerHTML=resultMarkup(perfume);if(!$('#result-dialog').open)$('#result-dialog').showModal();}
function reset(){selection=[];result=null;activeLayer='head';render();$('#announcement').textContent='Flacon vidé. Une nouvelle composition vous attend.';}

if(!preview){
  $('#note-grid').addEventListener('click',event=>{const button=event.target.closest('[data-note]');if(!button||button.disabled)return;changeNote(button.dataset.note);$(`[data-note="${button.dataset.note}"]`)?.focus();});
  $('.pyramid').addEventListener('click',event=>{const button=event.target.closest('[data-remove]');if(!button)return;const id=button.dataset.remove;changeNote(id);$('#reset').disabled?$('#tab-head').focus():$('#reset').focus();});
  $('.layer-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-tab]');if(!button)return;activeLayer=button.dataset.tab;renderPalette();});
  $('.layer-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const index=layers.findIndex(layer=>layer.id===activeLayer);
    activeLayer=layers[event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3].id;renderPalette();$(`#tab-${activeLayer}`).focus();
  });
  $('#reset').addEventListener('click',()=>{reset();$('#tab-head').focus();});
  $('#reveal').addEventListener('click',()=>{if(ready(selection))showResult(candidates(selection)[0]);});
  $('#open-concept').addEventListener('click',()=>$('#concept-dialog').showModal());
  $('#result-content').addEventListener('click',event=>{
    const alternative=event.target.closest('[data-perfume]');
    if(alternative){showResult(perfumes.find(perfume=>perfume.id===alternative.dataset.perfume));$('.dialog-close').focus();}
    if(event.target.closest('#new-perfume')){$('#result-dialog').close();reset();$('#tab-head').focus();}
  });
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))dialog.close();});
  });
}
render();
