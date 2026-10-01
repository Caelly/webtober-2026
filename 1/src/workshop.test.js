import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, canUse, useTool, results } from './workshop.js';
import { recipeBook } from './recipes.js';

test('la pâte exige une découpe, puis deux ajouts donnent les deux tartes', () => {
  const apple = initialState();
  assert.equal(canUse(apple, 'pastry'), false);
  assert.strictEqual(useTool(apple, 'pastry'), apple);
  const quarter = useTool(apple, 'knife');
  assert.equal(quarter.type, 'quarter');
  const tart = useTool(quarter, 'pastry');
  assert.equal(tart.type, 'tart');
  const american = useTool(tart, 'pastry');
  assert.equal(american.type, 'american');
  assert.strictEqual(useTool(american, 'pastry'), american);
});

test('le four, le mixeur et le pressoir ont chacun leur résultat', () => {
  assert.equal(useTool(initialState(), 'oven').type, 'baked');
  assert.equal(useTool(initialState(), 'blender').type, 'compote');
  assert.equal(useTool(initialState(), 'press').type, 'juice');
  assert.equal(useTool(useTool(initialState(), 'oven'), 'blender').type, 'compote');
});

test('la couleur suit la découpe, les résultats finis ne sont pas repeints', () => {
  const greenQuarter = useTool(useTool(initialState(), 'green'), 'knife');
  assert.deepEqual(greenQuarter, { type: 'quarter', color: 'green' });
  assert.equal(canUse(initialState(), 'red'), false);
  assert.deepEqual(useTool(greenQuarter, 'red'), { type: 'quarter', color: 'red' });
  assert.deepEqual(useTool(useTool(initialState(), 'yellow'), 'red'), initialState());
  const juice = useTool(greenQuarter, 'press');
  assert.strictEqual(useTool(juice, 'yellow'), juice);
});

test('les créations terminées et les outils inconnus ne relancent pas de recette', () => {
  const american = useTool(useTool(useTool(initialState(), 'knife'), 'pastry'), 'pastry');
  const cider = useTool(useTool(initialState(), 'press'), 'fermentation');
  const finished = [american, cider, useTool(initialState(), 'dehydrator'), useTool(initialState(), 'fryer'), useTool(initialState(), 'saucepan')];
  for (const state of finished) {
    for (const tool of ['knife', 'oven', 'pastry', 'blender', 'press', 'fermentation', 'dehydrator', 'fryer', 'saucepan', 'unknown']) {
      assert.strictEqual(useTool(state, tool), state);
    }
  }
});

test('le cidre exige du jus pressé et une fermentation, sans raccourci depuis la pomme', () => {
  const apple = initialState();
  const quarter = useTool(apple, 'knife');
  for (const state of [apple, quarter, useTool(apple, 'oven')]) {
    assert.equal(canUse(state, 'fermentation'), false);
    assert.strictEqual(useTool(state, 'fermentation'), state);
  }
  for (const state of [apple, quarter]) {
    const juice = useTool(state, 'press');
    assert.equal(juice.type, 'juice');
    assert.equal(canUse(juice, 'press'), false);
    assert.equal(canUse(juice, 'fermentation'), true);
    const cider = useTool(juice, 'fermentation');
    assert.equal(cider.type, 'cider');
    assert.strictEqual(useTool(cider, 'fermentation'), cider);
  }
});

test('les nouveaux ustensiles fonctionnent sur la pomme et les quartiers', () => {
  for (const [tool, type] of [['dehydrator', 'dried'], ['fryer', 'fritter'], ['saucepan', 'sauce']]) {
    assert.equal(useTool(initialState(), tool).type, type);
    assert.equal(useTool(useTool(initialState(), 'knife'), tool).type, type);
  }
  assert.equal(useTool(useTool(initialState(), 'blender'), 'saucepan').type, 'sauce');
});

test('la viande accompagne les pommes, sans transformer les desserts et les boissons', () => {
  const apple = initialState();
  for (const state of [apple, useTool(apple, 'knife'), useTool(apple, 'oven'), useTool(apple, 'blender')]) {
    const boudin = useTool(state, 'meat');
    assert.equal(boudin.type, 'boudin');
    assert.strictEqual(useTool(boudin, 'meat'), boudin);
    assert.strictEqual(useTool(boudin, 'pastry'), boudin);
    assert.strictEqual(useTool(boudin, 'green'), boudin);
  }
  for (const state of [useTool(apple, 'press'), useTool(useTool(apple, 'knife'), 'pastry'), useTool(apple, 'fryer')]) {
    assert.equal(canUse(state, 'meat'), false);
    assert.strictEqual(useTool(state, 'meat'), state);
  }
});

test('chaque création possède une recette complète affichable', () => {
  for (const type of Object.keys(results)) {
    const recipe = recipeBook[type];
    assert.ok(recipe, `Recette manquante : ${type}`);
    assert.ok(recipe.title && recipe.time && recipe.servings);
    assert.ok(recipe.ingredients.length >= 2);
    assert.ok(recipe.steps.length >= 3);
  }
});
