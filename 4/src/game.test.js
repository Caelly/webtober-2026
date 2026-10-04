import test from 'node:test';
import assert from 'node:assert/strict';
import {createCactusGame,spines} from './game.js';
import {cactusArtwork} from './cactus.js';

test('each visible spine can be removed only once, and the flower waits for the last one',()=>{
  const game=createCactusGame();assert.equal(game.completed,false);
  assert.equal(new Set(spines.map(pin=>pin.id)).size,game.total);
  assert.equal(game.pluck('unknown'),false);
  for(const [i,pin] of spines.entries()){
    assert.equal(game.has(pin.id),true);assert.equal(game.pluck(pin.id),true);
    assert.equal(game.pluck(pin.id),false);assert.equal(game.remaining,game.total-i-1);
    assert.equal(game.completed,i===spines.length-1);
  }
  assert.equal(game.remaining,0);
});
test('undo restores the last needle, including after completion, and reset restores every needle',()=>{
  const game=createCactusGame();assert.equal(game.undo(),null);
  spines.forEach(pin=>game.pluck(pin.id));assert.equal(game.completed,true);
  assert.equal(game.undo(),spines.at(-1).id);assert.equal(game.remaining,1);assert.equal(game.completed,false);
  game.reset();assert.equal(game.remaining,game.total);assert.equal(game.canUndo,false);
  spines.forEach(pin=>assert.equal(game.has(pin.id),true));assert.equal(game.undo(),null);
});
test('the drawing exposes every needle with a unique, named keyboard button',()=>{
  const svg=cactusArtwork();
  assert.equal((svg.match(/role="button"/g)||[]).length,spines.length);
  for(const pin of spines){assert.ok(svg.includes(`id="${pin.id}"`));assert.ok(svg.includes(`data-spine="${pin.id}"`));}
  assert.equal((svg.match(/tabindex="0"/g)||[]).length,spines.length);
});
