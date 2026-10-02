import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStoryEnding } from './story-ending.js';

function fixture() {
  const pending=new Map(),ticks=[],ghosts=[];
  let id=0,closed=0;
  const ending=createStoryEnding({
    onTick:value=>ticks.push(value),onGhost:value=>ghosts.push(value),onClose:()=>closed++,
    schedule:(callback,delay)=>{assert.equal(delay,1000);pending.set(++id,callback);return id;},
    cancel:handle=>pending.delete(handle),
  });
  function tick(){const [handle,callback]=pending.entries().next().value;pending.delete(handle);callback();}
  return {ending,pending,ticks,ghosts,tick,get closed(){return closed;}};
}

test('un verdict juste montre le fantôme et laisse dix secondes avant de fermer',()=>{
  const f=fixture();f.ending.start({correct:true});
  assert.deepEqual(f.ghosts,[true]);assert.deepEqual(f.ticks,[10]);
  for(let second=0;second<9;second++)f.tick();
  assert.equal(f.closed,0);f.tick();
  assert.equal(f.closed,1);assert.equal(f.pending.size,0);
  assert.deepEqual(f.ticks,[10,9,8,7,6,5,4,3,2,1,0]);
});

test('un verdict faux ferme aussi le parchemin sans montrer le fantôme',()=>{
  const f=fixture();f.ending.start({correct:false});
  assert.deepEqual(f.ghosts,[false]);
  for(let second=0;second<10;second++)f.tick();
  assert.equal(f.closed,1);
});

test('fermer ou changer d’histoire annule la fermeture précédente',()=>{
  const f=fixture();f.ending.start({correct:true});
  const oldCallback=[...f.pending.values()][0];
  f.ending.stop();oldCallback();
  assert.equal(f.closed,0);assert.equal(f.pending.size,0);assert.deepEqual(f.ticks,[10]);
  f.ending.start({correct:false});
  const replacedCallback=[...f.pending.values()][0];
  f.ending.start({correct:true});replacedCallback();
  assert.equal(f.pending.size,1);
  for(let second=0;second<10;second++)f.tick();
  assert.equal(f.closed,1);
});
