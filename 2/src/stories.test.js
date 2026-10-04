import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stories, shuffledStories } from './stories.js';
import { days } from '../../days.js';
import { navigation } from '../../shared/navigation.js';
import { verdictFor } from './quiz.js';

const timings=JSON.parse(readFileSync(new URL('../audio/timings.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));

test('chaque histoire a une narration complète de moins d’une minute',()=>{
  assert.equal(new Set(stories.map(story=>story.id)).size,stories.length);
  for(const story of stories) {
    const metadata=timings[story.id];
    assert.ok(metadata.duration>10&&metadata.duration<60,story.id);
    const wave=readFileSync(new URL(`../audio/${story.id}.wav`,import.meta.url));
    assert.equal(wave.toString('ascii',0,4),'RIFF');
    assert.equal(wave.toString('ascii',8,12),'WAVE');
    assert.equal(metadata.bodyOffset,story.title.length+2);
    let previous=-1;
    for(const word of metadata.words) {
      assert.ok(word.time>=previous&&word.time<metadata.duration,story.id);
      previous=word.time;
    }
    const last=metadata.words.at(-1);
    assert.ok(last.position+last.length-metadata.bodyOffset>=story.text.length-4,story.id);
  }
});

test('le tirage couvre toutes les histoires sans répétition',()=>{
  const queue=shuffledStories(()=>.4);
  assert.equal(queue.length,stories.length);
  assert.deepEqual(new Set(queue.map(story=>story.id)),new Set(stories.map(story=>story.id)));
  assert.notStrictEqual(queue,stories);
});

test('les deux catégories sont présentes et seules les histoires vraies révèlent une identité sourcée',()=>{
  assert.ok(stories.length>=12);
  assert.equal(stories.filter(story=>story.isTrue).length,stories.filter(story=>!story.isTrue).length);
  for(const story of stories) {
    assert.equal(typeof story.isTrue,'boolean');
    assert.ok(story.explanation);
    const correct=verdictFor(story,story.isTrue),wrong=verdictFor(story,!story.isTrue);
    assert.equal(correct.correct,true);assert.equal(wrong.correct,false);
    if(story.isTrue) {
      assert.ok(correct.person.name&&correct.person.birth&&correct.person.death);
      assert.ok(correct.sources.length);
      correct.sources.forEach(source=>assert.equal(new URL(source.url).protocol,'https:'));
      assert.equal(story.text.includes(correct.person.name),false);
    } else {
      assert.equal(correct.person,null);assert.deepEqual(correct.sources,[]);
    }
  }
});

test('le calendrier et les menus ouvrent les jours publiés, seule la page consultée est active',()=>{
  assert.deepEqual(days.filter(day=>day.unlocked).map(day=>day.number),[1,2,3,4,5]);
  for(const day of [1,2,3,4,5]) {
    const menu=navigation(day);
    assert.ok(menu.includes(`href="/${day}" aria-current="page"`));
    assert.equal((menu.match(/aria-current="page"/g)||[]).length,1);
    assert.ok(menu.includes('Jour 6 : Ogre, verrouillé'));
  }
});
