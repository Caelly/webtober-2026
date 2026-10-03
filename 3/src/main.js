import '../../shared/navigation.css';
import './style.css';
import {navigation,bindNavigation,miniatureVersions} from '../../shared/navigation.js';
import {characters} from './characters.js';
import {dollImage,dollPortrait} from './doll.js';
import {createGame,shuffle,pileLayout} from './game.js';
import {bindPileCamera} from './camera.js';

if(location.pathname==='/3/1/')history.replaceState(null,'',`/3/1${location.search}${location.hash}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const icon='<svg viewBox="0 0 32 36" fill="none" aria-hidden="true"><circle cx="16" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="10" r="1.5" fill="currentColor"/><circle cx="19" cy="10" r="1.5" fill="currentColor"/><path d="M11 21h10l3 9H8l3-9Zm2 9v4m6-4v4M11 23l-5 4m15-4 5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const mixIcon='<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h2c5 0 5 10 10 10h2m-4-3 4 3-4 3M3 15h2c5 0 5-10 10-10h2m-4-3 4 3-4 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.querySelector('#app').innerHTML=`
  <div class="mini-shell">
    <header class="site-header"><a class="brand" href="/3" aria-label="Miniature, les deux versions">${icon}<span>miniature<span class="brand-dot">.</span></span></a><div class="version-nav">${miniatureVersions(1)}${navigation(3)}</div></header>
    <main class="mini-hero">
      <section class="game-heading" aria-label="La poupée à retrouver">
        <div class="intro"><span class="eyebrow">LE GRAND PETIT CASTING</span><h1>Un tout petit<br /><em>monde.</em></h1></div>
        <div class="target-card" id="target-card"><div id="target-portrait" class="target-portrait"></div><div class="target-copy"><span class="eyebrow" id="target-label">À RETROUVER</span><h2 id="target-name"></h2><span id="target-universe"></span></div><span class="target-corner" aria-hidden="true">↙</span></div>
        <div class="game-meta"><p><strong id="found-count">00</strong><span>/ 1 000<br />retrouvées</span></p><button id="mix-pile" class="mix-button">${mixIcon} Mélanger</button></div>
      </section>
      <div class="pile-stage" id="pile-stage"><span class="pile-label" aria-hidden="true">LES PETITES LÉGENDES</span><svg id="doll-pile" class="doll-pile" viewBox="0 0 1100 620" aria-label="Tas de 1 000 poupées miniatures" fill="none"></svg><div class="zoom-controls" aria-label="Zoom du tas"><button id="zoom-out" aria-label="Réduire le zoom">−</button><button id="zoom-reset" aria-label="Revenir à la vue d’ensemble">100 %</button><button id="zoom-in" aria-label="Augmenter le zoom">+</button></div><div class="game-toast" id="game-toast"><p id="game-status" role="status" aria-live="polite"></p><button id="next-doll" hidden>La suivante <span aria-hidden="true">↗</span></button><button id="restart-game" hidden>Recommencer <span aria-hidden="true">↗</span></button></div></div>
    </main>
    <footer class="site-footer"><span>UN THÈME, UNE HERO SECTION</span><span class="edition">Édition octobre 2026</span><span class="day-counter">03 <i aria-hidden="true"></i> 31</span></footer>
  </div>
  <dialog class="concept-dialog" id="concept-dialog" aria-labelledby="concept-title"><button class="concept-close" id="close-concept" aria-label="Fermer">×</button><span class="eyebrow">LE CONCEPT · MINIATURE</span><h2>Des icônes.<br /><em>À petite échelle.</em></h2><p>Mille poupées, mille personnages différents : comics, Disney, Pixar, anime, fantasy et jeux vidéo.</p><p>Retrouvez le personnage du portrait, puis passez au suivant. Chaque personnage apparaît une seule fois dans le tas et dans la recherche.</p><span class="concept-note">Une collection de fan art dessinée pour Webtober.</span></dialog>`;
bindNavigation();
const game=createGame(characters),compact=matchMedia('(max-width: 700px)');
const pile=document.querySelector('#doll-pile'),status=document.querySelector('#game-status'),toast=document.querySelector('#game-toast');
const next=document.querySelector('#next-doll'),restart=document.querySelector('#restart-game');
let order=shuffle(characters),arrangement=Array.from({length:characters.length*3},()=>Math.random()),feedbackTimer;
const camera=bindPileCamera(pile,preview);
const escapeAttribute=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
function drawPile(){
  let cursor=0;
  const {width,height,points}=pileLayout(characters.length,compact.matches,()=>arrangement[cursor++]);
  const foundIds=game.found;
  pile.innerHTML=order.map((character,index)=>{
    const {x,y,angle}=points[index],found=foundIds.has(character.id);
    return `<g class="mini-doll${found?' is-found':''}" data-doll="${character.id}" role="button" tabindex="${preview?-1:0}" aria-label="${escapeAttribute(character.name)}${found?', déjà retrouvée':''}"${found?' aria-disabled="true"':''} transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)} 40 58)"><g class="doll-art">${dollImage(character)}</g><rect class="doll-focus" x="6" y="8" width="68" height="58" rx="23"/><g class="found-mark" aria-hidden="true"><circle cx="64" cy="19" r="9" fill="#597056"/><path d="m60 19 3 3 5-6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  }).join('');
  camera.reset(width,height,new Map(order.map((c,i)=>[c.id,{x:points[i].x+40,y:points[i].y+38}])));
}
function updateTarget(){
  clearTimeout(feedbackTimer);status.textContent='';toast.classList.remove('is-visible','is-success');
  next.hidden=true;restart.hidden=true;
  const target=game.target;
  document.querySelector('#target-label').textContent=target?'À RETROUVER':'COLLECTION COMPLÈTE';
  document.querySelector('#target-portrait').innerHTML=target?dollPortrait(target,'target'):'<span class="collection-star" aria-hidden="true">✦</span>';
  document.querySelector('#target-name').textContent=target?target.name:'Les mille, rien que ça.';
  document.querySelector('#target-universe').textContent=target?target.universe:'Un grand regard pour un petit monde.';
  document.querySelector('#target-card').classList.remove('is-solved');
  if(!target){status.textContent='1 000 petites légendes retrouvées.';toast.classList.add('is-visible','is-success');restart.hidden=false;document.querySelector('#target-card').classList.add('is-solved');}
}
function selectDoll(element){
  if(preview||!element||game.found.has(element.dataset.doll))return;
  const verdict=game.guess(element.dataset.doll);
  if(verdict==='inactive')return;
  clearTimeout(feedbackTimer);
  toast.classList.add('is-visible');
  if(verdict==='correct'){
    element.classList.add('is-found','just-found');element.setAttribute('aria-disabled','true');element.setAttribute('aria-label',`${game.target.name}, déjà retrouvée`);
    element.addEventListener('animationend',()=>element.classList.remove('just-found'),{once:true});
    document.querySelector('#found-count').textContent=String(game.found.size).padStart(2,'0');
    document.querySelector('#target-card').classList.add('is-solved');
    status.textContent=`${game.target.name} : bien trouvé !`;
    toast.classList.add('is-success');next.hidden=false;
  } else {
    element.classList.remove('is-wrong');void element.getBoundingClientRect();element.classList.add('is-wrong');
    element.addEventListener('animationend',()=>element.classList.remove('is-wrong'),{once:true});
    status.textContent='Pas cette petite tête…';toast.classList.remove('is-success');
    feedbackTimer=setTimeout(()=>{if(!game.solved){toast.classList.remove('is-visible');status.textContent='';}},1800);
  }
}
pile.addEventListener('click',event=>selectDoll(event.target.closest('[data-doll]')));
pile.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectDoll(event.target.closest('[data-doll]'));}});
next.addEventListener('click',()=>{if(game.next()){updateTarget();pile.querySelector('[data-doll]:not(.is-found)')?.focus({preventScroll:true});}});
document.querySelector('#mix-pile').addEventListener('click',()=>{order=shuffle(order);arrangement=arrangement.map(()=>Math.random());drawPile();});
restart.addEventListener('click',()=>{game.reset();document.querySelector('#found-count').textContent='00';order=shuffle(characters);drawPile();updateTarget();});
compact.addEventListener('change',drawPile);
document.querySelector('#open-concept').addEventListener('click',()=>document.querySelector('#concept-dialog').showModal());
document.querySelector('#close-concept').addEventListener('click',()=>document.querySelector('#concept-dialog').close());
drawPile();updateTarget();
