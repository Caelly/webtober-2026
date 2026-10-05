import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {words,shuffleWords} from './words.js';
import {createBattle,createLaughGate,readingDuration} from './battle.js';

test('the supplied words have no list numbers or repeats, and keep numbers that belong to a title',()=>{
  assert.ok(words.length>200);assert.equal(new Set(words).size,words.length);
  assert.ok(words.every(word=>word.length&&!/^\d+[.)]\s/.test(word)));
  for(const word of ['Inoxtagada','Discordon Bleu','Mastu vu mon cul','Œil pour œil gland pour gland','Counter-Streap','Baldur’s Gland 3','CyberProut 2077','Thanos de toilette'])assert.ok(words.includes(word),word);
  const deck=shuffleWords(words,()=>.3);assert.deepEqual(new Set(deck),new Set(words));assert.notDeepEqual(deck,words);
});
test('silence never advances a word; speaking advances only after its reading time',()=>{
  const game=createBattle(['court','un autre mot'],()=>.99);game.start(100);
  assert.equal(game.tick(10000),null);assert.equal(game.score,0);
  game.hear({speech:.6},1200);assert.equal(game.tick(1599),null);assert.equal(game.tick(1600),'next');assert.equal(game.score,1);
  assert.equal(game.tick(3000),null);game.hear({speech:.7},3001);assert.equal(game.tick(3100),'won');assert.equal(game.score,2);
  assert.equal(game.hear({laugh:true},10300),null);
});
test('a detected laugh has priority over completing a word and ends the round once',()=>{
  const game=createBattle(['un mot'],()=>.5);game.start(0);game.hear({speech:1},1100);
  assert.equal(game.hear({laugh:true,speech:1},3000),'lost');assert.equal(game.score,0);assert.equal(game.phase,'lost');
  assert.equal(game.tick(10000),null);assert.equal(game.hear({laugh:true},10001),null);
  game.start(11000);assert.equal(game.phase,'playing');assert.equal(game.score,0);assert.equal(game.heard,false);
  game.stop();assert.equal(game.hear({laugh:true},12000),null);
});
test('delayed audio from countdown or the preceding word cannot count as a fresh reading',()=>{
  const game=createBattle(['premier','suivant'],()=>.99);game.start(1000);
  assert.equal(game.hear({laugh:true},999),null);assert.equal(game.phase,'playing');
  game.hear({speech:1},2100);assert.equal(game.tick(2500),'next');
  game.hear({speech:1},2600);assert.equal(game.heard,false);assert.equal(game.tick(5000),null);
  game.hear({speech:1},5001);assert.equal(game.tick(5002),'won');
});
test('a laugh captured at the end of a word still ends the game if classification arrives after the next word appears',()=>{
  const game=createBattle(['premier','suivant'],()=>.99);game.start(1000);
  game.hear({speech:1},2100);assert.equal(game.tick(2500),'next');
  assert.equal(game.hear({laugh:true},2490),'lost');assert.equal(game.score,1);
});
test('laughter classification requires convincing evidence, not ordinary speech, noise or crying',()=>{
  const gate=createLaughGate();const category=(categoryName,score)=>({categoryName,score});
  assert.equal(gate.sample([category('Speech',.96),category('Laughter',.17)]).laugh,false);
  assert.equal(gate.sample([category('Scream',.9),category('Crying, sobbing',.85)]).laugh,false);
  assert.equal(gate.sample([category('Cough',.74),category('Laughter',.11),category('Snicker',.04)]).laugh,false);
  gate.reset();assert.equal(gate.sample([category('Laughter',.08),category('Snicker',.025)]).laugh,false);
  assert.equal(gate.sample([category('Silence',.8)]).laugh,false);
  assert.equal(gate.sample([category('Laughter',.1),category('Snicker',.025)]).laugh,true);
  gate.reset();assert.equal(gate.sample([category('Laughter',.08),category('Snicker',.025)]).laugh,false);
  assert.equal(gate.sample([category('Giggle',.32)]).laugh,true);
  assert.equal(gate.sample([category('Chuckle, chortle',.8)]).laugh,true);
  gate.reset();assert.equal(gate.sample([category('Speech',.96),category('Laughter',.17)]).laugh,false);
  assert.equal(gate.sample([category('Speech',.96),category('Laughter',.17)]).laugh,false);
  assert.equal(gate.sample([category('Speech',.95),category('Laughter',.12),category('Chuckle, chortle',.08)]).laugh,true);
});
test('quieter chuckles trigger with repeated evidence while isolated weak scores and coughs do not',()=>{
  const gate=createLaughGate();const category=(categoryName,score)=>({categoryName,score});
  const quiet=[category('Speech',.96),category('Laughter',.055),category('Snicker',.018)];
  assert.equal(gate.sample(quiet).laugh,false);
  assert.equal(gate.sample([category('Silence',.9)]).laugh,false);
  assert.equal(gate.sample(quiet).laugh,true);
  gate.reset();assert.equal(gate.sample([category('Giggle',.23)]).laugh,true);
  gate.reset();assert.equal(gate.sample([category('Laughter',.08),category('Chuckle, chortle',.04)]).laugh,true);
  gate.reset();
  const cough=[...quiet,category('Cough',.7)];
  assert.equal(gate.sample(cough).laugh,false);
  assert.equal(gate.sample(cough).laugh,false);
});
test('real YAMNet scores trigger on normal and quiet laughs, including speech mixed with laughter, without triggering on control recordings',()=>{
  const fixtures=JSON.parse(readFileSync(new URL('./laugh-regression.json',import.meta.url)));
  for(const fixture of fixtures){
    const gate=createLaughGate();const detected=fixture.frames.some(categories=>gate.sample(categories).laugh);
    assert.equal(detected,fixture.expected,`${fixture.file} gain ${fixture.gain}`);
  }
});
test('long phrases leave more reading time; the hosted model is a real TensorFlow Lite model',()=>{
  assert.ok(readingDuration('Œil pour œil gland pour gland')>readingDuration('Gotagland'));
  assert.equal(readingDuration('Gotagland'),1500);
  assert.equal(readingDuration('Une expression démesurément longue qui demande un tout petit peu plus de temps'),2400);
  const model=readFileSync(new URL('../../1/public/gifle/yamnet.tflite',import.meta.url));
  assert.equal(model.toString('ascii',4,8),'TFL3');assert.ok(model.length>4000000);
});
