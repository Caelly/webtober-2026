import test from 'node:test';
import assert from 'node:assert/strict';
import {layers,notes,perfumes,byId,candidates,canAdd,toggleNote,ready,bottleColor} from './catalogue.js';

test('chaque note possède un parfum sourcé et chaque parfum peut être révélé',()=>{
  assert.equal(notes.length,34);assert.equal(perfumes.length,12);
  assert.equal(new Set(notes.map(note=>note.id)).size,notes.length);
  for(const note of notes){assert.ok(perfumes.some(perfume=>perfume.notes.includes(note.id)));assert.ok(layers.some(layer=>layer.id===note.layer));}
  for(const perfume of perfumes){
    assert.equal(new URL(perfume.source).protocol,'https:');
    assert.ok(perfume.notes.every(id=>byId.has(id)));
    let selection=[];
    for(const id of perfume.notes){assert.ok(canAdd(selection,id));selection=toggleNote(selection,id);}
    assert.ok(ready(selection));assert.ok(candidates(selection).some(item=>item.id===perfume.id));
  }
});
test('aucun accord proposé ne peut conduire à un faux rapprochement ou à une impasse',()=>{
  for(const perfume of perfumes){
    for(let mask=0;mask<2**perfume.notes.length;mask++){
      const selection=perfume.notes.filter((_,index)=>mask&(1<<index));
      const matches=candidates(selection);assert.ok(matches.length);
      for(const match of matches)assert.ok(selection.every(id=>match.notes.includes(id)));
      for(const layer of layers)if(!selection.some(id=>byId.get(id).layer===layer.id))assert.ok(notes.some(note=>note.layer===layer.id&&canAdd(selection,note.id)));
    }
  }
});
test('le mélange exige les trois étages et refuse les notes incompatibles ou inconnues',()=>{
  assert.equal(ready([]),false);assert.equal(ready(['bergamot','iris']),false);
  assert.equal(ready(['bergamot','iris','vanilla']),true);
  const selection=['bergamot','iris','vanilla'];
  assert.deepEqual(candidates(selection).map(perfume=>perfume.id),['shalimar']);
  assert.equal(canAdd(selection,'cherry'),false);assert.deepEqual(toggleNote(selection,'cherry'),selection);
  assert.deepEqual(toggleNote(selection,'iris'),['bergamot','vanilla']);
  assert.equal(selection.length,3);assert.deepEqual(candidates(['imaginary']),[]);
  assert.equal(ready(['bergamot','iris','vanilla','imaginary']),false);
});
test('la couleur évolue avec les notes et reste une couleur hexadécimale valide',()=>{
  assert.notEqual(bottleColor(['cherry']),bottleColor(['bergamot']));
  assert.equal(bottleColor(['rose','vanilla']),bottleColor(['vanilla','rose']));
  for(const perfume of perfumes)assert.match(bottleColor(perfume.notes),/^#[0-9a-f]{6}$/);
});
