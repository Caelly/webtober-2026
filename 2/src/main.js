import '../../shared/navigation.css';
import './style.css';
import { navigation, bindNavigation } from '../../shared/navigation.js';
import { createReliquary } from './scene.js';
import { shuffledStories } from './stories.js';
import { createNarrator } from './narration.js';
import { createQuiz } from './quiz.js';
import { createStoryEnding } from './story-ending.js';

if(location.pathname==='/2/')history.replaceState(null,'',`/2${location.search}${location.hash}`);
const preview=new URLSearchParams(location.search).has('apercu');
if(preview)document.documentElement.classList.add('is-apercu');
const cross='<svg viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M16 5v27M5 14h22" stroke="currentColor" stroke-width="3.5"/><path d="m16 2 3 4-3 3-3-3 3-4ZM3 14l3-3 3 3-3 3-3-3Zm26 0-3-3-3 3 3 3 3-3ZM16 34l3-4-3-3-3 3 3 4Z" fill="currentColor"/></svg>';
document.querySelector('#app').innerHTML=`
  <div class="relic-shell">
    <header class="site-header"><a class="brand" href="/" aria-label="Webtober, accueil">${cross}<span>relique<span class="brand-dot">.</span></span></a>${navigation(2)}</header>
    <main class="relic-hero" aria-label="Relique">
      <div class="relic-stage"><svg class="relic-ghost" id="relic-ghost" viewBox="0 0 240 340" aria-hidden="true"><defs><linearGradient id="ghost-mist" x1="0" y1="0" x2="0.6" y2="1"><stop stop-color="#758c7a"/><stop offset=".65" stop-color="#91a691" stop-opacity=".6"/><stop offset="1" stop-color="#a5b69b" stop-opacity="0"/></linearGradient></defs><path d="M118 28C76 27 62 69 67 106c4 33-16 63-29 91-14 31-20 66-16 98 15-29 33-40 47-30 12 9 9 30 5 48 22-28 36-38 53-24 14 12 14 29 11 42 24-25 35-52 51-35 8 8 13 17 14 28 16-36 4-78-9-112-12-32-25-67-23-95 4-48-6-88-53-89Z" fill="url(#ghost-mist)"/><path d="M99 87c-11-1-15 10-11 22 3 8 11 8 15 1 5-9 5-21-4-23Zm37 0c-9-2-13 10-8 22 3 8 10 10 15 2 6-10 3-21-7-24Z" fill="#344d3e"/><path d="M84 140c-6 37-19 69-25 107m83-102c12 27 19 57 21 89M110 161c-6 31-10 58-7 88" stroke="#66836d" stroke-width="3" fill="none" opacity=".45"/></svg><button class="reliquary" id="open-scroll" aria-label="Ouvrir la relique et écouter une histoire"><span class="relic-fallback-art" aria-hidden="true">${cross}</span><span id="relic-canvas" aria-hidden="true"></span></button></div>
      <div class="relic-caption"><span class="caption-ornament" aria-hidden="true">✦</span><p>Des fins à dormir debout.<br /><em>Mais ont-elles vraiment eu lieu ?</em></p></div>
    </main>
    <footer class="site-footer"><span>UN THÈME, UNE HERO SECTION</span><span class="edition">Édition octobre 2026</span><span class="day-counter">02 <i aria-hidden="true"></i> 31</span></footer>
  </div>
  <dialog class="scroll-dialog" id="scroll-dialog" aria-labelledby="story-title">
    <button class="scroll-close" id="close-scroll" aria-label="Fermer le parchemin">×</button>
    <div class="scroll-rod top-rod" aria-hidden="true"></div>
    <div class="parchment">
      <div class="scroll-heading"><span>LES ARCHIVES DE L’AU-DELÀ</span></div>
      <h2 id="story-title" tabindex="-1"></h2><p class="story-relic" id="story-relic"></p>
      <div class="story-body" id="story-body"></div>
      <section class="story-quiz" id="story-quiz" aria-label="Vrai ou inventé">
        <p class="quiz-waiting">✦ Une fin improbable. Gardez votre verdict pour la fin.</p>
        <div class="quiz-choices" hidden><p>Cette histoire a-t-elle vraiment eu lieu ?</p><div class="quiz-buttons"><button data-choice="true">Vraie</button><button data-choice="false">Inventée</button></div></div>
        <div class="quiz-result" hidden><h3 id="verdict-heading" tabindex="-1"></h3><p class="verdict-label"></p><div class="verdict-identity"></div><p class="verdict-explanation"></p><div class="verdict-sources"></div></div>
      </section>
      <div class="narration-controls"><button id="reading-toggle" class="reading-toggle">Pause</button><button id="reading-mode" class="reading-mode">Lire sans voix</button><span id="reading-status" role="status">Lecture en cours</span><button class="sound-toggle" id="sound-toggle" aria-label="Couper le son" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path class="sound-waves" d="M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="sound-off" d="m15 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
      <div class="reading-progress"><progress id="reading-progress" max="1" value="0" aria-label="Progression de la narration"></progress><span id="reading-time"></span></div>
      <div class="parchment-actions" hidden><span id="scroll-countdown" aria-live="off"></span><button id="next-story">Une autre histoire <span aria-hidden="true">↗</span></button></div>
    </div>
    <div class="scroll-rod bottom-rod" aria-hidden="true"></div>
  </dialog>
  <dialog class="concept-dialog" id="concept-dialog" aria-labelledby="concept-title"><button class="concept-close" id="close-concept" aria-label="Fermer">×</button><span class="concept-eyebrow">LE CONCEPT</span><h2 id="concept-title">Une drôle de fin.<br /><em>Un vrai mystère.</em></h2><p>Un reliquaire garde des histoires de morts atypiques, surprenantes et incongrues. Certaines sont documentées. D’autres ont été inventées.</p><p>Lisez à votre rythme ou écoutez l’histoire, puis choisissez : vraie ou inventée ? Le parchemin révèle ensuite la réponse. Pour une histoire vraie, vous découvrez la personne, ses dates et les sources.</p><span class="concept-signature">02 / 31 · Relique</span></dialog>`;

bindNavigation();
const scene=createReliquary(document.querySelector('#relic-canvas'));
const scroll=document.querySelector('#scroll-dialog');
const ghost=document.querySelector('#relic-ghost');
let closingTimer;
const ending=createStoryEnding({
  onTick:seconds=>document.querySelector('#scroll-countdown').textContent=seconds?`Fermeture dans ${seconds} s`:'Fermeture du parchemin',
  onClose:closeScroll,
  onGhost:correct=>{ghost.classList.remove('is-visible');if(correct){void ghost.getBoundingClientRect();ghost.classList.add('is-visible');}},
});
ghost.addEventListener('animationend',()=>ghost.classList.remove('is-visible'));
const quiz=createQuiz(document.querySelector('#story-quiz'),openStory,verdict=>ending.start(verdict));
const narrator=createNarrator({body:document.querySelector('#story-body'),button:document.querySelector('#reading-toggle'),modeButton:document.querySelector('#reading-mode'),mute:document.querySelector('#sound-toggle'),status:document.querySelector('#reading-status'),time:document.querySelector('#reading-time'),progress:document.querySelector('#reading-progress'),onComplete:()=>quiz.finish()});
let queue=shuffledStories(),lastStory;
function openStory() {
  if(preview)return;
  cancelClosing();ghost.classList.remove('is-visible');
  if(!queue.length){queue=shuffledStories();if(queue[0].id===lastStory)[queue[0],queue[1]]=[queue[1],queue[0]];}
  const story=queue.shift();lastStory=story.id;
  document.querySelector('#story-title').textContent=story.title;document.querySelector('#story-relic').textContent=story.relic;
  quiz.start(story);
  if(!scroll.open)scroll.showModal();
  document.querySelector('#story-title').focus({preventScroll:true});
  narrator.start(story);
}
document.querySelector('#open-scroll').addEventListener('click',openStory);
function cancelClosing() {
  ending.stop();clearTimeout(closingTimer);scroll.classList.remove('is-closing');document.querySelector('#scroll-countdown').textContent='';
}
function closeScroll() {
  if(!scroll.open||scroll.classList.contains('is-closing'))return;
  ending.stop();narrator.stop();scroll.classList.add('is-closing');
  closingTimer=setTimeout(()=>scroll.close(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:380);
}
document.querySelector('#close-scroll').addEventListener('click',closeScroll);
scroll.addEventListener('close',()=>{cancelClosing();narrator.stop();});
scroll.addEventListener('click',event=>{if(event.target===scroll){const r=scroll.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeScroll();}});
const concept=document.querySelector('#concept-dialog');
document.querySelector('#open-concept').addEventListener('click',()=>concept.showModal());
document.querySelector('#close-concept').addEventListener('click',()=>concept.close());
window.addEventListener('pagehide',()=>{cancelClosing();narrator.stop();scene.dispose();},{once:true});
