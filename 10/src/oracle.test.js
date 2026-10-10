import test from 'node:test';
import assert from 'node:assert/strict';
import {answers,createOracle} from './oracle.js';
test('toutes les réponses sont atteignables et deux consultations successives diffèrent',()=>{
 assert.equal(new Set(answers).size,answers.length);
 for(let i=0;i<answers.length;i++){
  const oracle=createOracle(()=> (i+.5)/answers.length);
  assert.ok(oracle.ask('Une question ?'));assert.equal(oracle.reveal().answer,answers[i]);
  const first=oracle.snapshot().answer;assert.ok(oracle.ask('Une autre ?'));assert.notEqual(oracle.reveal().answer,first);
 }
});
test('une question vide ou trop longue est refusée, et une révélation ne se déclenche qu’une fois',()=>{
 const oracle=createOracle(()=>0);
 assert.equal(oracle.ask('   '),false);assert.equal(oracle.ask('x'.repeat(241)),false);assert.equal(oracle.ask(null),false);assert.equal(oracle.reveal(),null);
 assert.ok(oracle.ask('  Vais-je réussir ?  '));assert.equal(oracle.snapshot().question,'Vais-je réussir ?');assert.equal(oracle.snapshot().answer,null);
 assert.equal(oracle.ask('Autre'),false);assert.equal(oracle.reveal().answer,answers[0]);assert.equal(oracle.reveal(),null);
 assert.throws(()=>{oracle.snapshot().answer='faux';},TypeError);
});
test('effacer une consultation annule sa révélation et permet de poser une nouvelle question',()=>{
 const oracle=createOracle(()=>1);oracle.ask('Question');oracle.clear();assert.equal(oracle.reveal(),null);assert.equal(oracle.snapshot().phase,'idle');assert.equal(oracle.snapshot().question,'');
 oracle.ask('Nouvelle question');assert.equal(oracle.reveal().answer,answers.at(-1));
});
