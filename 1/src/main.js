import './style.css';
import './kitchen.css';
import './viewport.css';
import './tool-layout.css';
import { days } from '../../days.js';
import { appleIcon, resetIcon, brushIcon, kitchenIcons } from './icons.js';
import { createAppleScene } from './scene.js';
import { initialState, canUse, useTool, results } from './workshop.js';
import { recipeBook } from './recipes.js';

if (window.location.pathname === '/1/') {
  window.history.replaceState(null, '', `/1${window.location.search}${window.location.hash}`);
}
if (new URLSearchParams(window.location.search).has('apercu')) document.documentElement.classList.add('is-apercu');

document.querySelector('#app').innerHTML = `
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="/" aria-label="Webtober, accueil">${appleIcon}<span>pomme<span class="brand-dot">.</span></span></a>
      <nav class="header-nav" aria-label="Navigation principale">
        <button class="concept-link" id="open-concept">Le concept <span>↗</span></button>
        <span class="header-divider"></span>
        <details class="day-picker" id="day-picker">
          <summary class="challenge-badge"><span class="status-dot"></span> Webtober <svg class="picker-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>
          <div class="day-menu">
            <a class="gallery-menu-link" href="/">Tous les thèmes <span aria-hidden="true">↗</span></a>
            <span class="day-menu-heading">OCTOBRE 2026 · 31 THÈMES</span>
            <ol class="day-list">${days.map((day) => `<li>${day.unlocked
              ? `<a href="/${day.number}" aria-current="page"><span class="day-number">${String(day.number).padStart(2, '0')}</span><span>${day.theme}</span><span class="day-mark" aria-hidden="true">↗</span></a>`
              : `<button disabled aria-label="Jour ${day.number} : ${day.theme}, verrouillé"><span class="day-number">${String(day.number).padStart(2, '0')}</span><span>${day.theme}</span><svg class="day-lock" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="7" width="8" height="6" rx="1.5" stroke="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor"/></svg></button>`}</li>`).join('')}</ol>
          </div>
        </details>
      </nav>
    </header>

    <main class="hero">
      <section class="hero-copy" aria-labelledby="hero-title">
        <div class="eyebrow"><span class="day-label">JOUR 01</span><span class="eyebrow-rule"></span><span>LE FRUIT DÉFENDU</span></div>
        <h1 id="hero-title"><span class="title-line">Dégustez <span id="possessive">votre</span></span><span class="apple-word"><em id="result-word">pomme.</em><span class="word-leaf" aria-hidden="true"><svg viewBox="0 0 80 60"><path d="M25 55c8-16 14-23 28-30" fill="none" stroke="currentColor" stroke-width="2"/><path d="M35 31C33 10 51 4 73 8 68 28 50 39 35 31Z" fill="currentColor"/><path d="M36 32 64 14" stroke="#f5f4ec" stroke-width="1"/></svg></span></span></h1>
        <p class="intro">Du premier croc au dessert.<br />La pomme dans tous ses états.</p>
        <button class="reset-button" id="reset" aria-label="Réinitialiser la pomme rouge">${resetIcon}<span>Réinitialiser</span></button>
      </section>

      <section class="apple-workshop" aria-label="Atelier interactif : transformer une pomme en 3D">
        <div class="workshop-topline">
          <button class="recipe-postit" id="open-recipe" aria-haspopup="dialog" aria-controls="recipe-dialog">
            <span class="postit-eyebrow">LA RECETTE DU MOMENT</span>
            <span class="postit-title" id="recipe-preview-title"></span>
            <span class="postit-bottom"><span id="recipe-preview-meta"></span><span class="postit-open" aria-hidden="true">↗</span></span>
          </button>
        </div>
        <div class="scene-wrap" id="scene-wrap">
          <div id="apple-scene" role="img" aria-label="Pomme rouge en trois dimensions" tabindex="0"></div>
          <span class="scene-scribble" aria-hidden="true"><span>à vous de jouer</span><svg viewBox="0 0 80 68" fill="none"><path d="M24 8c27 5 44 20 38 36-4 11-21 13-38 9m0 0 10-6m-10 6 7 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <div class="variety-tag" id="variety-tag"><span class="variety-dot"></span><span id="variety-name">Rouge à croquer</span></div>
        </div>
        <div class="toolbox kitchen-toolbox" id="toolbox">
          <div class="kitchen-heading">
            <span class="toolbox-eyebrow">VOTRE ATELIER</span>
            <span class="toolbox-caption">Petites métamorphoses.</span>
            <button class="tool-layout-toggle" id="toggle-tool-layout" aria-label="Disposition verticale des outils" aria-controls="kitchen-tools" aria-pressed="false"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="3" width="12" height="3" rx="1" stroke="currentColor"/><rect x="4" y="8.5" width="12" height="3" rx="1" stroke="currentColor"/><rect x="4" y="14" width="12" height="3" rx="1" stroke="currentColor"/></svg><span id="tool-layout-label">Vertical</span></button>
          </div>
          <div class="kitchen-tools" id="kitchen-tools" role="group" aria-label="Outils de transformation">
            <button class="tool-button brush-button red" data-tool="red" aria-label="Pinceau rouge" aria-pressed="false" draggable="true" hidden>${brushIcon('#b64834')}<span class="tool-label">Rouge</span><span class="selected-tick" aria-hidden="true">✓</span></button>
            <button class="tool-button brush-button green" data-tool="green" aria-label="Pinceau vert" aria-pressed="false" draggable="true">${brushIcon('#799348')}<span class="tool-label">Vert</span><span class="selected-tick" aria-hidden="true">✓</span></button>
            <button class="tool-button brush-button yellow" data-tool="yellow" aria-label="Pinceau jaune" aria-pressed="false" draggable="true">${brushIcon('#e7b63b')}<span class="tool-label">Jaune</span><span class="selected-tick" aria-hidden="true">✓</span></button>
            ${[['knife', 'Couteau'], ['oven', 'Four'], ['pastry', 'Pâte'], ['blender', 'Mixeur'], ['press', 'Pressoir'], ['fermentation', 'Fermentation'], ['dehydrator', 'Déshydrateur'], ['fryer', 'Friteuse'], ['saucepan', 'Casserole'], ['meat', 'Viande']].map(([tool, label]) => `<button class="tool-button" data-tool="${tool}" aria-label="${label}" draggable="true">${kitchenIcons[tool]}<span class="tool-label">${label}</span></button>`).join('')}
          </div>
        </div>
        <p class="sr-only" role="status" id="color-status" aria-live="polite">La pomme est rouge.</p>
      </section>
    </main>

    <footer class="site-footer"><div class="footer-caption">UN THÈME, UNE HERO SECTION</div><div class="edition"><span>Édition d’octobre</span><span class="footer-year">2026</span></div><div class="day-counter"><span>01</span><span class="counter-line"></span><span>31</span></div></footer>
  </div>
  <dialog id="recipe-dialog" class="recipe-dialog" aria-labelledby="recipe-title">
    <button class="dialog-close" id="close-recipe" aria-label="Fermer la recette">×</button>
    <span class="dialog-eyebrow">LA RECETTE DU MOMENT</span>
    <h2 id="recipe-title"></h2>
    <p class="recipe-meta" id="recipe-meta"></p>
    <h3>Ingrédients</h3><p id="recipe-ingredients"></p>
    <h3>Préparation</h3><ol id="recipe-steps"></ol>
  </dialog>
  <dialog id="concept-dialog" aria-labelledby="concept-title"><button class="dialog-close" id="close-concept" aria-label="Fermer">×</button><span class="dialog-eyebrow">LE CONCEPT</span><h2 id="concept-title">La créativité<br />se <em>cultive.</em></h2><p>Tout au long du mois d’octobre, un thème devient le point de départ d’une petite expérience interactive.</p><p>Aujourd’hui : la pomme. Une matière familière, des formes inattendues. Un petit terrain d’expérimentation, jour après jour.</p><span class="dialog-signature">01 / 31 · Pomme</span></dialog>
`;

const names = { red: 'Rouge à croquer', green: 'Verte et croquante', yellow: 'Dorée à souhait' };
const layoutToggle = document.querySelector('#toggle-tool-layout');
const workshopElement = document.querySelector('.apple-workshop');
function setToolLayout(vertical) {
  workshopElement.classList.toggle('tools-vertical', vertical);
  layoutToggle.setAttribute('aria-pressed', String(vertical));
  layoutToggle.setAttribute('aria-label', `Disposition ${vertical ? 'horizontale' : 'verticale'} des outils`);
  document.querySelector('#tool-layout-label').textContent = vertical ? 'Horizontal' : 'Vertical';
}
try { setToolLayout(localStorage.getItem('webtober-tools-layout') === 'vertical'); } catch { setToolLayout(false); }
layoutToggle.addEventListener('click', () => {
  const vertical = !workshopElement.classList.contains('tools-vertical');
  setToolLayout(vertical);
  try { localStorage.setItem('webtober-tools-layout', vertical ? 'vertical' : 'horizontal'); } catch { /* Layout remains usable without storage. */ }
});
const dayPicker = document.querySelector('#day-picker');
document.addEventListener('click', (event) => {
  if (!dayPicker.contains(event.target)) dayPicker.open = false;
});
dayPicker.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    dayPicker.open = false;
    dayPicker.querySelector('summary').focus();
  }
});
const colorWords = { red: 'rouge', green: 'verte', yellow: 'jaune' };
const sceneElement = document.querySelector('#apple-scene');
const scene = createAppleScene(sceneElement);

let state = initialState();

function updateWorkshop() {
  scene.setState(state);
  const result = results[state.type];
  document.querySelector('.apple-workshop').dataset.color = state.color;
  document.querySelector('.hero-copy').dataset.result = state.type;
  document.querySelector('.hero-copy').dataset.color = state.color;
  const name = state.type === 'apple' ? names[state.color] : result.name;
  document.querySelector('#variety-name').textContent = name;
  document.querySelector('#result-word').textContent = result.word;
  document.querySelector('#possessive').textContent = result.pronoun ?? 'votre';
  const recipe = recipeBook[state.type];
  document.querySelector('#recipe-title').textContent = recipe.title;
  document.querySelector('#recipe-preview-title').textContent = recipe.title;
  document.querySelector('#open-recipe').setAttribute('aria-label', `Voir la recette : ${recipe.title}`);
  document.querySelector('#recipe-meta').textContent = `${recipe.time} · ${recipe.servings}`;
  document.querySelector('#recipe-preview-meta').textContent = `${recipe.time} · ${recipe.servings}`;
  document.querySelector('#recipe-ingredients').textContent = recipe.ingredients.join(' · ');
  const steps = document.querySelector('#recipe-steps');
  steps.replaceChildren(...recipe.steps.map((step) => {
    const item = document.createElement('li'); item.textContent = step; return item;
  }));
  document.querySelector('#color-status').textContent = state.type === 'apple' ? `La pomme est ${colorWords[state.color]}.` : `Votre création : ${name}.`;
  sceneElement.setAttribute('aria-label', `${name} en trois dimensions`);
  document.querySelectorAll('.tool-button').forEach((button) => {
    const tool = button.dataset.tool;
    button.disabled = !canUse(state, tool);
    if (['red', 'green', 'yellow'].includes(tool)) button.hidden = tool === state.color || (tool === 'red' && button.disabled);
    button.draggable = !button.disabled;
    if (tool === 'red' || tool === 'green' || tool === 'yellow') button.setAttribute('aria-pressed', String(!button.disabled && tool === state.color));
  });
  const tag = document.querySelector('#variety-tag');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tag.animate([{ transform: 'translate(-50%, 4px)', opacity: 0.4 }, { transform: 'translate(-50%, 0)', opacity: 1 }], { duration: 350, easing: 'ease-out' });
  }
}

function applyTool(tool) {
  const next = useTool(state, tool);
  if (next === state) return;
  state = next;
  updateWorkshop();
}

document.querySelectorAll('.tool-button').forEach((button) => {
  button.addEventListener('click', () => applyTool(button.dataset.tool));
  button.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', button.dataset.tool);
    event.dataTransfer.effectAllowed = 'copy';
    document.querySelector('#scene-wrap').classList.add('drop-ready');
  });
  button.addEventListener('dragend', () => document.querySelector('#scene-wrap').classList.remove('drop-ready'));
});
sceneElement.addEventListener('dragover', (event) => event.preventDefault());
sceneElement.addEventListener('drop', (event) => {
  event.preventDefault();
  const tool = event.dataTransfer.getData('text/plain');
  applyTool(tool);
  document.querySelector('#scene-wrap').classList.remove('drop-ready');
});
document.querySelector('#reset').addEventListener('click', () => { state = initialState(); updateWorkshop(); scene.reset(); });
updateWorkshop();
const recipeDialog = document.querySelector('#recipe-dialog');
document.querySelector('#open-recipe').addEventListener('click', () => recipeDialog.showModal());
document.querySelector('#close-recipe').addEventListener('click', () => recipeDialog.close());
const dialog = document.querySelector('#concept-dialog');
document.querySelector('#open-concept').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-concept').addEventListener('click', () => dialog.close());
for (const modal of [dialog, recipeDialog]) {
  modal.addEventListener('click', (event) => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  });
}
