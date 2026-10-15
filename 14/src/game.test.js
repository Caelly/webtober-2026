import test from 'node:test';
import assert from 'node:assert/strict';
import {words} from './words.js';
import {MAX_ATTEMPTS,normalizeWord,acceptedForms,createPasswordGame} from './game.js';
const one=entry=>createPasswordGame({pool:[entry]});
const wrong=['Bicyclette','Chaussette','Théière','Parapluie','Tabouret'];

test('la première liste contient soixante mots distincts avec cinq indices sans réponse révélée',()=>{
 assert.equal(words.length,60);assert.equal(new Set(words.map(w=>w.id)).size,60);assert.equal(new Set(words.map(w=>normalizeWord(w.word))).size,60);
 for(const entry of words){assert.equal(entry.clues.length,MAX_ATTEMPTS);assert.equal(new Set(entry.clues.map(normalizeWord)).size,5);assert.ok(entry.definition.length>20);assert.ok(entry.clues.every(c=>c.trim()&&!acceptedForms(entry).has(normalizeWord(c))));const g=one(entry),s=g.snapshot();assert.equal(s.reveal,null);assert.deepEqual(s.clues,[entry.clues[0]]);assert.equal('word' in s,false);}
});
test('chaque erreur consomme exactement un essai et dévoile le prochain indice',()=>{
 const entry=words[0],g=one(entry);for(let i=0;i<4;i++){const result=g.guess(wrong[i]),s=g.snapshot();assert.equal(result.accepted,true);assert.equal(result.correct,false);assert.equal(s.attempts,i+1);assert.equal(s.remaining,4-i);assert.equal(s.phase,'playing');assert.equal(s.reveal,null);assert.deepEqual(s.clues,entry.clues.slice(0,i+2));}
});
test('la cinquième erreur révèle le mot et interdit un sixième essai',()=>{
 const g=one(words[0]);wrong.forEach(w=>g.guess(w));const s=g.snapshot();assert.equal(s.phase,'lost');assert.equal(s.attempts,5);assert.equal(s.remaining,0);assert.equal(s.reveal.word,words[0].word);assert.deepEqual(g.guess(words[0].word),{accepted:false,reason:'ended'});assert.deepEqual(g.snapshot(),s);
});
test('la bonne réponse gagne au premier comme au cinquième essai, pour chaque mot',()=>{
 for(const entry of words){for(const errors of [0,4]){const g=one(entry);wrong.slice(0,errors).forEach(w=>g.guess(w));assert.equal(g.guess(entry.word).correct,true);const s=g.snapshot();assert.equal(s.phase,'won');assert.equal(s.attempts,errors+1);assert.equal(s.reveal.word,entry.word);const before=g.snapshot();g.guess('Encore');assert.deepEqual(g.snapshot(),before);}}
});
test('les accents, la casse, les espaces, les tirets et les pluriels usuels sont acceptés',()=>{
 for(const entry of words){const g=one(entry);assert.equal(g.guess(normalizeWord(entry.word).toUpperCase()).correct,true);if(!/[sxz]$/.test(normalizeWord(entry.word)))assert.equal(one(entry).guess(entry.word+'s').correct,true);for(const alias of entry.aliases)assert.equal(one(entry).guess(alias).correct,true);}
 assert.equal(normalizeWord('  TIRE–BOUCHON  '),'tirebouchon');assert.equal(normalizeWord('Œillet'),'oeillet');assert.equal(one(words.find(w=>w.word==='Tire-bouchon')).guess('tire bouchon').correct,true);
});
test('une saisie vide, invalide ou répétée ne consomme ni tentative ni indice',()=>{
 const g=one(words[0]),before=g.snapshot();for(const input of ['',null,'  ','123','<script>','a'.repeat(51)])assert.equal(g.guess(input).accepted,false);assert.deepEqual(g.snapshot(),before);g.guess('Écharpe');const after=g.snapshot();assert.equal(g.guess(' ECHARPE ').reason,'duplicate');assert.deepEqual(g.snapshot(),after);
});
test('la pioche parcourt toute la liste sans répétition et évite la répétition au changement de pioche',()=>{
 const g=createPasswordGame({random:()=>0}),seen=[];for(let round=0;round<121;round++){assert.equal(g.next(),false);wrong.forEach(w=>g.guess(w));const word=g.snapshot().reveal.word;seen.push(word);assert.equal(g.next(),true);assert.equal(g.snapshot().phase,'playing');assert.equal(g.snapshot().attempts,0);assert.equal(g.snapshot().history.length,0);}assert.equal(new Set(seen.slice(0,60)).size,60);assert.equal(new Set(seen.slice(60,120)).size,60);assert.notEqual(seen[59],seen[60]);assert.notEqual(seen[119],seen[120]);
});
test('les instantanés sont isolés et une partie suivante réinitialise les indices',()=>{
 const g=one(words[0]);const s=g.snapshot();s.clues.push('Réponse');s.history.push({word:'Intrus'});assert.equal(g.snapshot().clues.length,1);assert.equal(g.snapshot().history.length,0);g.guess(words[0].word);const won=g.snapshot();won.reveal.word='Intrus';assert.equal(g.snapshot().reveal.word,words[0].word);g.next();assert.equal(g.snapshot().phase,'playing');assert.equal(g.snapshot().reveal,null);assert.equal(g.snapshot().clues.length,1);assert.throws(()=>createPasswordGame({pool:[]}));
});
