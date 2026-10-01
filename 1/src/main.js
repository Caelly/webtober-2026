import './style.css';
import './kitchen.css';
import { appleIcon, resetIcon, handIcon, brushIcon, kitchenIcons } from './icons.js';
import { createAppleScene } from './scene.js';
import { initialState, canUse, useTool, results, toolHint } from './workshop.js';
import { recipeBook } from './recipes.js';

if (window.location.pathname === '/' || window.location.pathname === '/1/') {
  window.history.replaceState(null, '', `/1${window.location.search}${window.location.hash}`);
}

document.querySelector('#app').innerHTML = `
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="/1" aria-label="Pomme, accueil">${appleIcon}<span>pomme<span class="brand-dot">.</span></span></a>
      <nav class="header-nav" aria-label="Navigation principale">
        <button class="concept-link" id="open-concept">Le concept <span>↗</span></button>
        <span class="header-divider"></span>
        <span class="challenge-badge"><span class="status-dot"></span> Inktober 2026</span>
      </nav>
    </header>

    <main class="hero">
      <section class="hero-copy" aria-labelledby="hero-title">
        <div class="eyebrow"><span class="day-label">JOUR 01</span><span class="eyebrow-rule"></span><span>LE FRUIT DÉFENDU</span></div>
        <h1 id="hero-title"><span class="title-line">Dégustez <span id="possessive">votre</span></span><span class="apple-word"><span class="word-leaf" aria-hidden="true"><svg viewBox="0 0 80 60"><path d="M25 55c8-16 14-23 28-30" fill="none" stroke="currentColor" stroke-width="2"/><path d="M35 31C33 10 51 4 73 8 68 28 50 39 35 31Z" fill="currentColor"/><path d="M36 32 64 14" stroke="#f5f4ec" stroke-width="1"/></svg></span><em id="result-word">pomme.</em></span></h1>
        <p class="intro">Un peu de couleur. Une touche de vous.<br />Faites de cette pomme <span>votre</span> pomme.</p>
      </section>

      <section class="apple-workshop" aria-label="Atelier interactif : transformer une pomme en 3D">
        <div class="workshop-topline">
          <button class="recipe-postit" id="open-recipe" aria-haspopup="dialog" aria-controls="recipe-dialog">
            <span class="postit-eyebrow">LA RECETTE DU MOMENT</span>
            <span class="postit-title" id="recipe-preview-title"></span>
            <span class="postit-bottom"><span id="recipe-preview-meta"></span><span class="postit-open" aria-hidden="true">↗</span></span>
          </button>
          <button class="reset-button" id="reset" aria-label="Réinitialiser la pomme rouge">${resetIcon}<span>Réinitialiser</span></button>
        </div>
        <div class="scene-wrap" id="scene-wrap">
          <div id="apple-scene" role="img" aria-label="Pomme rouge en trois dimensions. Faites-la tourner en glissant la souris." tabindex="0"></div>
          <span class="scene-scribble" aria-hidden="true"><svg viewBox="0 0 102 87" fill="none"><path d="M5 9C43 3 87 20 77 55c-3 10-14 12-22 12m0 0 10-10m-10 10 13 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>à vous de jouer</span></span>
          <div class="variety-tag" id="variety-tag"><span class="variety-dot"></span><span id="variety-name">Rouge à croquer</span></div>
        </div>
        <div class="rotate-hint">${handIcon}<span>Glissez pour la faire tourner</span><span class="hint-dot">·</span><span>Flèches ← → au clavier</span></div>
        <div class="toolbox kitchen-toolbox" id="toolbox">
          <div class="kitchen-heading"><span class="toolbox-eyebrow">VOTRE ATELIER</span><span>Changez de saveur.</span></div>
          <div class="kitchen-tools" role="group" aria-label="Outils de transformation">
            <button class="tool-button brush-button red" data-tool="red" aria-label="Peindre la pomme en rouge" aria-pressed="false" draggable="true" hidden>${brushIcon('#b64834')}<span class="tool-label">Rouge</span><span class="selected-tick" aria-hidden="true">✓</span></button>
            <button class="tool-button brush-button green" data-tool="green" aria-label="Peindre la pomme en vert" aria-pressed="false" draggable="true">${brushIcon('#799348')}<span class="tool-label">Vert</span><span class="selected-tick" aria-hidden="true">✓</span></button>
            <button class="tool-button brush-button yellow" data-tool="yellow" aria-label="Peindre la pomme en jaune" aria-pressed="false" draggable="true">${brushIcon('#e7b63b')}<span class="tool-label">Jaune</span><span class="selected-tick" aria-hidden="true">✓</span></button>
            ${[['knife', 'Couteau'], ['oven', 'Four'], ['pastry', 'Pâte'], ['blender', 'Mixeur'], ['press', 'Pressoir'], ['dehydrator', 'Déshydrateur'], ['fryer', 'Friteuse'], ['saucepan', 'Casserole']].map(([tool, label]) => `<button class="tool-button" data-tool="${tool}" aria-label="${toolHint(initialState(), tool)}" draggable="true">${kitchenIcons[tool]}<span class="tool-label">${label}</span>${tool === 'pastry' ? '<span class="tool-lock" aria-hidden="true">⌑</span>' : ''}</button>`).join('')}
          </div>
          <p class="recipe-hint" id="recipe-hint">Pour la tarte, commencez par le couteau.</p>
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
  <dialog id="concept-dialog" aria-labelledby="concept-title"><button class="dialog-close" id="close-concept" aria-label="Fermer">×</button><span class="dialog-eyebrow">LE CONCEPT</span><h2 id="concept-title">La créativité<br />se <em>cultive.</em></h2><p>Tout au long du mois d’octobre, un thème devient le point de départ d’une petite expérience interactive.</p><p>Aujourd’hui : la pomme. Colorez, découpez, cuisez, mixez ou pressez. Un quartier et une pâte donnent une tarte ; une seconde pâte la transforme en apple pie. À vous de lui donner votre touche.</p><span class="dialog-signature">01 / 31 — Pomme</span></dialog>
`;

const names = { red: 'Rouge à croquer', green: 'Verte et croquante', yellow: 'Dorée à souhait' };
const colorWords = { red: 'rouge', green: 'verte', yellow: 'jaune' };
const sceneElement = document.querySelector('#apple-scene');
const scene = createAppleScene(sceneElement);

let state = initialState();

function updateWorkshop() {
  scene.setState(state);
  const result = results[state.type];
  document.querySelector('.apple-workshop').dataset.color = state.color;
  document.querySelector('.hero-copy').dataset.result = state.type;
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
  sceneElement.setAttribute('aria-label', `${name} en trois dimensions. Faites tourner votre création avec la souris ou les flèches du clavier.`);
  document.querySelector('#recipe-hint').textContent = state.type === 'apple' ? 'Pour la tarte, commencez par le couteau.' : result.note;
  document.querySelectorAll('.tool-button').forEach((button) => {
    const tool = button.dataset.tool;
    button.disabled = !canUse(state, tool);
    if (tool === 'red') button.hidden = button.disabled;
    button.draggable = !button.disabled;
    button.title = toolHint(state, tool);
    if (tool === 'pastry') button.setAttribute('aria-label', toolHint(state, tool));
    if (tool === 'red' || tool === 'green' || tool === 'yellow') button.setAttribute('aria-pressed', String(!button.disabled && tool === state.color));
  });
  document.querySelector('.kitchen-tools').classList.toggle('has-red', canUse(state, 'red'));
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
