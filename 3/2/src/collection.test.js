import test from 'node:test';
import assert from 'node:assert/strict';
import {roster,rarities,rarityAt,drawReward,addReward,collectionStats,restoreCollection,serializeCollection,nearestCapsule} from './collection.js';
import {plushSvg} from './plush.js';

test('100 Disney identities, each with four distinct collectible keys and textured artwork',()=>{
  assert.equal(roster.length,100);assert.equal(new Set(roster.map(c=>c.name)).size,100);assert.ok(roster.every(c=>c.universe==='Disney'));
  const keys=new Set();for(const c of roster)for(const r of rarities){keys.add(`${c.id}:${r.id}`);const svg=plushSvg(c,r.id);assert.ok(svg.includes('feTurbulence'));assert.ok(!svg.includes('undefined'));assert.ok(svg.includes('</svg>'));}
  assert.equal(keys.size,400);
});
test('exclusive rarity intervals implement exactly 1/100, 1/50 and 1/30',()=>{
  const gold=.01,silver=.03,bronze=.03+1/30;
  assert.equal(rarityAt(0),'gold');assert.equal(rarityAt(gold-Number.EPSILON),'gold');assert.equal(rarityAt(gold),'silver');assert.equal(rarityAt(silver-Number.EPSILON),'silver');assert.equal(rarityAt(silver),'bronze');assert.equal(rarityAt(bronze-Number.EPSILON),'bronze');assert.equal(rarityAt(bronze),'normal');assert.equal(rarityAt(.999999),'normal');
  assert.ok(Math.abs(rarities.reduce((n,r)=>n+r.chance,0)-1)<1e-14);
  for(const n of [-1,1,NaN,Infinity])assert.throws(()=>rarityAt(n),RangeError);
});
test('rarity and character use separate draws; all 100 identities reachable',()=>{
  for(let i=0;i<100;i++){const values=[.5,(i+.5)/100];const result=drawReward(()=>values.shift());assert.equal(result.character,roster[i]);assert.equal(result.rarity,'normal');}
  const values=[.005,.999];assert.equal(drawReward(()=>values.shift()).character,roster[99]);
});
test('duplicates and rare editions persist independently without losing base character progress',()=>{
  const counts={};assert.equal(addReward(counts,{character:roster[0],rarity:'normal'}),1);assert.equal(addReward(counts,{character:roster[0],rarity:'normal'}),2);addReward(counts,{character:roster[0],rarity:'gold'});addReward(counts,{character:roster[1],rarity:'bronze'});
  assert.deepEqual(collectionStats(counts),{characters:2,variants:3,total:4,duplicates:1});assert.deepEqual(restoreCollection(serializeCollection(counts)),counts);
});
test('storage validation rejects unknown figures, editions and invalid counts',()=>{
  const key=`${roster[0].id}:normal`,raw=JSON.stringify({version:1,counts:{[key]:3,'unknown:gold':4,[`${roster[1].id}:pink`]:4,[`${roster[2].id}:silver`]:-2,[`${roster[3].id}:gold`]:1.2}});
  assert.deepEqual(restoreCollection(raw),{[key]:3});assert.deepEqual(restoreCollection('invalid'),{});assert.deepEqual(restoreCollection('{"version":2,"counts":{}}'),{});
});
test('the claw catches only the nearest capsule inside its physical reach',()=>{
  const near={x:.1,z:.1},far={x:.4,z:.4};assert.equal(nearestCapsule([far,near],0,0),near);assert.equal(nearestCapsule([far],0,0),null);assert.equal(nearestCapsule([],0,0),null);assert.equal(nearestCapsule([near],1,1),null);
});
