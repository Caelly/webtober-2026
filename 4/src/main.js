import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation} from '../../shared/navigation.js';
import {createCactusGame} from './game.js';
import {cactusArtwork} from './cactus.js';
import {createCactusScene} from './scene.js';
import {createSpinePull} from './pull.js';

if(location.pathname==='/4/')history.replaceState(null,'',`/4${location.search}${location.hash}`);
const preview=new URLSearchParams(location.search).has('apercu');
const game=createCactusGame();
const resetIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 9a7 7 0 1 1-.2 5M5 4v5h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brandIcon='<svg viewBox="0 0 28 34" fill="none" aria-hidden="true"><path d="M12 30V8a4 4 0 0 1 8 0v11h3V12a2 2 0 0 1 4 0v9a2 2 0 0 1-2 2h-5v7M12 22H6a3 3 0 0 1-3-3v-7a2 2 0 0 1 4 0v5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 31h14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

document.querySelector('#app').innerHTML=`<div class="cactus-shell">
  <header class="site-header"><a href="/" class="brand" aria-label="Cactus, retourner au calendrier">${brandIcon}<span>cactus<span class="brand-dot">.</span></span></a>${navigation(4)}</header>
  <main class="cactus-main" aria-labelledby="cactus-title">
    <section class="cactus-copy"><span class="eyebrow">UNE PARENTHÈSE AU DÉSERT</span><h1 id="cactus-title"><span>Un peu moins</span><br/><em>piquant.</em></h1>
      <p class="subtitle">Sous les épines,<br/>il y a toujours un peu de douceur.</p>
      <div class="progress-block"><div class="counter"><span id="remaining">${game.total}</span><span class="counter-caption" id="counter-caption">épines<br/>encore là</span></div><div class="progress-track" role="progressbar" aria-label="Épines retirées" aria-valuemin="0" aria-valuemax="${game.total}" aria-valuenow="0"><span></span></div><p id="progress-note">La douceur prend son temps.</p></div>
      <div class="actions"><button id="reset" aria-label="Remettre toutes les épines">${resetIcon} Recommencer</button><button id="undo" disabled aria-label="Remettre la dernière épine retirée">Annuler</button></div>
    </section>
    <section class="cactus-stage" aria-label="Le cactus"><div class="stage-backdrop" aria-hidden="true"></div><span class="specimen-label" aria-hidden="true">CARNEGIEA GIGANTEA<span>Un caractère bien trempé.</span></span><div class="cactus-view"><canvas id="cactus-canvas" hidden tabindex="0" role="img" aria-label="Cactus en trois dimensions, orientable sur tous les axes"></canvas><div id="cactus-fallback">${cactusArtwork()}</div><div id="spine-access" class="sr-only" hidden></div></div><div class="rotation-tools" hidden aria-label="Orientation du cactus"><button data-axis="x" aria-label="Tourner le cactus sur l’axe X">X</button><button data-axis="y" aria-label="Tourner le cactus sur l’axe Y">Y</button><button data-axis="z" aria-label="Tourner le cactus sur l’axe Z">Z</button><span></span><button id="reset-view" aria-label="Rétablir la vue initiale">${resetIcon}</button></div><span class="stage-caption" id="stage-caption">La beauté du désert.</span></section>
  </main>
  <footer><span>UN THÈME, UNE HERO SECTION</span><span>Édition octobre 2026 <i></i> 04 / 31</span></footer>
  <span class="sr-only" id="live-status" role="status" aria-live="polite" aria-atomic="true"></span>
</div><dialog id="concept-dialog" aria-labelledby="concept-title"><button id="close-concept" aria-label="Fermer le concept">×</button><span class="eyebrow">WEBTOBER 2026</span><h2 id="concept-title">Un thème,<br/><em>une hero section.</em></h2><p>Trente et un jours, trente et une idées. Aujourd’hui, un cactus au caractère piquant et une petite parenthèse de douceur.</p></dialog>`;

bindNavigation();
const $=selector=>document.querySelector(selector);let nodes=[...document.querySelectorAll('[data-spine]')],scene=null;
const progress=$('.progress-track'),live=$('#live-status');
function update(){
  $('#remaining').textContent=game.remaining;
  $('#counter-caption').innerHTML=game.completed?'tout en<br/>douceur':`${game.remaining===1?'épine':'épines'}<br/>encore là`;
  progress.setAttribute('aria-valuenow',game.total-game.remaining);progress.querySelector('span').style.width=`${(game.total-game.remaining)/game.total*100}%`;
  $('#undo').disabled=!game.canUndo;
  $('.cactus-shell').classList.toggle('is-complete',game.completed);
  $('#progress-note').textContent=game.completed?'Plus rien ne pique. Tout peut fleurir.':game.remaining<game.total/2?'La douceur gagne du terrain.':'La douceur prend son temps.';
  $('#stage-caption').textContent=game.completed?'Un peu de douceur a fleuri.':'La beauté du désert.';
  $('.cactus-art').setAttribute('aria-label',game.completed?'Cactus sans épines, avec une fleur épanouie':`Cactus en pot avec ${game.remaining} ${game.remaining===1?'épine':'épines'} à retirer`);
  scene?.sync();
  live.textContent=game.completed?'Toutes les épines ont été retirées. Le cactus fleurit !':`${game.remaining} ${game.remaining===1?'épine restante':'épines restantes'}.`;
}
function pluck(node){
  if(!game.pluck(node.dataset.spine))return;
  const hadFocus=document.activeElement===node;
  node.classList.add('is-removed');node.setAttribute('tabindex','-1');node.setAttribute('aria-hidden','true');node.removeAttribute('role');
  update();
  if(hadFocus){const index=nodes.indexOf(node);const next=nodes.slice(index+1).concat(nodes.slice(0,index)).find(n=>game.has(n.dataset.spine));(next||$('#reset')).focus();}
}
const svgSpines=$('#spines');let svgPull=null;
function releaseSvg(){if(svgPull){svgPull.node.querySelector('.needle').style.removeProperty('translate');svgPull.node.classList.remove('is-tugging');svgPull=null;}}
svgSpines.addEventListener('pointerdown',event=>{if(event.button!==0||scene)return;const node=event.target.closest('[data-spine]');if(!node||!game.has(node.dataset.spine))return;event.preventDefault();svgSpines.setPointerCapture(event.pointerId);svgPull={gesture:createSpinePull(node.dataset.spine,{x:event.clientX,y:event.clientY},event),node,pointerId:event.pointerId};node.classList.add('is-tugging');});
function tugSvg(event){if(!svgPull||event.pointerId!==svgPull.pointerId)return;const sample=svgPull.gesture.sample({x:event.clientX,y:event.clientY});svgPull.node.querySelector('.needle').style.translate=`${sample.dx*.12}px ${sample.dy*.12}px`;if(sample.detached){const node=svgPull.node;releaseSvg();pluck(node);}}
svgSpines.addEventListener('pointermove',tugSvg);
svgSpines.addEventListener('pointerup',event=>{tugSvg(event);releaseSvg();});
svgSpines.addEventListener('pointercancel',releaseSvg);svgSpines.addEventListener('lostpointercapture',releaseSvg);
$('#spines').addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const node=event.target.closest('[data-spine]');if(node){event.preventDefault();pluck(node);}});
function restore(node){node.classList.remove('is-removed');node.setAttribute('tabindex','0');node.removeAttribute('aria-hidden');node.setAttribute('role','button');}
$('#reset').addEventListener('click',()=>{releaseSvg();game.reset();nodes.forEach(restore);scene?.resetView();update();live.textContent=`Le cactus a retrouvé ses ${game.total} épines.`;});
$('#undo').addEventListener('click',()=>{const id=game.undo();if(id){restore(nodes.find(node=>node.dataset.spine===id));update();if(!game.canUndo)$('#reset').focus();}});
const dialog=$('#concept-dialog');$('#open-concept').addEventListener('click',()=>dialog.showModal());$('#close-concept').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
if(preview)document.documentElement.classList.add('is-apercu');
try{
  const canvas=$('#cactus-canvas');canvas.hidden=false;
  scene=createCactusScene(canvas,{game,preview,onPluck:id=>pluck(nodes.find(node=>node.dataset.spine===id))});
  const access=$('#spine-access');access.innerHTML=nodes.map(node=>`<button data-spine="${node.dataset.spine}" aria-label="${node.getAttribute('aria-label')}"></button>`).join('');
  nodes=[...access.querySelectorAll('button')];access.hidden=preview;$('#cactus-fallback').hidden=true;$('.rotation-tools').hidden=preview;
  access.addEventListener('click',event=>{const node=event.target.closest('[data-spine]');if(node)pluck(node);});
  access.addEventListener('focusin',event=>{const id=event.target.dataset.spine;if(id)scene.focus(id);});
  document.querySelectorAll('[data-axis]').forEach(button=>button.addEventListener('click',()=>scene.turn(button.dataset.axis)));
  $('#reset-view').addEventListener('click',()=>scene.resetView());
}catch(error){$('#cactus-canvas').hidden=true;console.warn('Le cactus utilise son dessin de remplacement.',error);}
window.addEventListener('pagehide',()=>scene?.dispose(),{once:true});
