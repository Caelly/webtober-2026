import test from 'node:test';
import assert from 'node:assert/strict';
import {assessQuestion} from './question-safety.js';
import {createOracle} from './oracle.js';
test('le filtre bloque les questions de suicide, de mort, de santé et les médicaments courants',()=>{
 for(const question of [
  'Dois-je me suicider ?', 'Je veux en finir', 'Je ne veux plus me réveiller', 'Je ne veux pas me réveiller', 'Je ne veux plus vivre', 'Ma vie ne vaut pas la peine', 'Faut-il me faire du mal ?', 'Should I kill myself?', 'I want to die', 'Dois-je me jeter du pont ?', 'Je veux me couper les veines', 'Puis-je avaler de la javel ?',
  'Vais-je mourir ?', 'La mort arrive quand ?', 'Mon chat est décédé', 'Qui dois-je tuer ?', 'Puis-je prendre ce médicament ?',
  'Je peux arrêter mon traitement ?', 'Quelle dose de Doliprane ?', 'Du Xanax ce soir ?', 'Cette douleur va partir ?', 'Ai-je un cancer ?', 'Should I take these pills?'
 ])assert.equal(assessQuestion(question).allowed,false,question);
 assert.equal(assessQuestion('Dois-je me suicider ?').category,'selfHarm');
});
test('les accents, ponctuations, caractères invisibles et obfuscations courantes ne désactivent pas le filtre',()=>{
 for(const question of ['SUÏCIDE ?', 's.u.i.c.i.d.e', 's u i c i d e', 'su1c1de', 'su\u200bicider', 'MÉDICAMENT', 'm é d i c a m e n t', 'D0L1PRANE', 'auto-mutilation', 'm o r t', 'm0ur1r'])
  assert.equal(assessQuestion(question).allowed,false,question);
});
test('les questions légères restent possibles, sans confondre les fragments des mots',()=>{
 for(const question of ['Vais-je réussir mon examen ?', 'Dois-je prendre le bus ?', 'Une pizza ce soir ?', 'Mortimer va-t-il gagner ?', 'Ai-je une chance au jeu ?', 'Est-ce que je vais aimer ce livre ?', 'Faut-il attendre ?', 'Vais-je déménager ?'])
  assert.equal(assessQuestion(question).allowed,true,question);
});
test('une question bloquée efface la réponse précédente sans tirer de message, et peut être suivie d’une question légère',()=>{
 let draws=0;const oracle=createOracle(()=>{draws++;return .5;});
 oracle.ask('Vais-je voyager ?');oracle.reveal();assert.equal(draws,1);
 assert.equal(oracle.ask('Vais-je mourir ?'),false);assert.equal(oracle.snapshot().phase,'blocked');assert.equal(oracle.snapshot().answer,null);assert.equal(oracle.snapshot().question,'');assert.ok(oracle.snapshot().refusal.message);
 assert.equal(oracle.reveal(),null);assert.equal(draws,1);
 assert.ok(oracle.ask('Dois-je prendre le bus ?'));assert.equal(oracle.snapshot().refusal,null);oracle.reveal();assert.equal(draws,2);
});
test('une reformulation ambiguë après un sujet sensible ne reçoit pas une réponse affirmative aléatoire',()=>{
 const oracle=createOracle(()=>{throw new Error('Aucun tirage attendu');});
 oracle.ask('Je veux en finir');assert.equal(oracle.ask('Dois-je le faire ?'),false);assert.equal(oracle.snapshot().refusal.category,'context');assert.equal(oracle.reveal(),null);
 oracle.clear();assert.equal(oracle.ask('Oui ou non ?'),false);assert.equal(oracle.reveal(),null);
});
