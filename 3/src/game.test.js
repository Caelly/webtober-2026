import {test} from 'node:test';
import assert from 'node:assert/strict';
import {characters} from './characters.js';
import {createGame,pileLayout,shuffle,clampCamera,zoomCamera} from './game.js';
import {dollArt,dollPortrait,dollImage} from './doll.js';
import {sculptures,sculptureFor} from './sculptures.js';

test('les cent sculptures originales sont conservées au-delà de leur palette',()=>{
  assert.equal(Object.keys(sculptures).length,1000);
  const designs=characters.slice(0,100).map(c=>{
    const sculpt=sculptureFor(c);
    assert.ok(sculpt.headShape&&sculpt.bodyShape,c.name);
    return [sculpt.headShape,sculpt.bodyShape,sculpt.back,sculpt.hair,sculpt.underEyes,sculpt.customEyes,sculpt.face,sculpt.costume,sculpt.prop,sculpt.feet].join('').replace(/#[\da-f]{3,8}/gi,'COLOR');
  });
  assert.equal(new Set(designs).size,100);
});

test('le casting contient mille identités et mille dessins distincts, sans éditions',()=>{
  assert.equal(characters.length,1000);
  assert.equal(new Set(characters.map(c=>c.id)).size,1000);
  assert.equal(new Set(characters.map(c=>c.name)).size,1000);
  assert.ok(new Set(characters.map(c=>c.universe)).size>=15);
  const drawings=characters.map(c=>{
    assert.ok(!('edition' in c)&&!('baseId' in c),c.name);
    const art=dollArt(c);
    assert.ok(!art.includes('undefined')&&!art.includes('NaN'),c.name);
    assert.ok(art.includes(`id="doll-${c.id}-head"`),c.name);
    return art.replaceAll(`doll-${c.id}`,'CHARACTER');
  });
  assert.equal(new Set(drawings).size,1000);
});

test('une erreur ne change pas la cible et une bonne réponse ne compte qu’une fois',()=>{
  const game=createGame(characters,()=>.5),target=game.target;
  const wrong=characters.find(c=>c.id!==target.id);
  assert.equal(game.next(),false);
  assert.equal(game.guess(wrong.id),'wrong');assert.equal(game.target.id,target.id);assert.equal(game.found.size,0);
  assert.equal(game.guess(target.id),'correct');assert.equal(game.found.size,1);
  assert.equal(game.guess(target.id),'inactive');assert.equal(game.found.size,1);
  assert.equal(game.next(),true);assert.notEqual(game.target.id,target.id);
});

test('la partie permet de retrouver les mille poupées sans répétition et de recommencer',()=>{
  const game=createGame(characters,()=>.4),seen=new Set();
  for(let i=0;i<1000;i++){
    assert.ok(game.target);assert.equal(seen.has(game.target.id),false);seen.add(game.target.id);
    assert.equal(game.guess(game.target.id),'correct');game.next();
  }
  assert.equal(game.complete,true);assert.equal(game.found.size,1000);assert.equal(game.guess('doll-1'),'inactive');
  game.reset();assert.equal(game.complete,false);assert.equal(game.found.size,0);assert.ok(game.target);
});

test('les tas bureau et mobile gardent les mille poupées à l’intérieur de la scène',()=>{
  for(const compact of [false,true])for(const random of [()=>0,()=>.5,()=>.999]){
    const {width,height,points}=pileLayout(1000,compact,random);
    assert.equal(points.length,1000);
    for(const p of points){assert.ok(p.x>=0&&p.x+80<=width);assert.ok(p.y>=0&&p.y+120<=height);}
  }
  const mixed=shuffle(characters,()=>.5);assert.notStrictEqual(mixed,characters);assert.equal(new Set(mixed.map(c=>c.id)).size,1000);
});

test('chaque personnage n’apparaît qu’une fois et son portrait correspond à sa figurine',()=>{
  const game=createGame(characters,()=>.5);
  assert.equal(characters.filter(c=>c.name===game.target.name).length,1);
  const portrait=dollPortrait(game.target,'pile');
  const image=dollImage(game.target);
  assert.ok(portrait.includes(dollArt(game.target,'pile')));
  assert.ok(decodeURIComponent(image).includes(dollArt(game.target,'pile')));
  assert.ok(!portrait.includes('edition-'));
  assert.equal(game.guess(game.target.id),'correct');
});

test('le zoom garde son point d’ancrage et le déplacement reste dans le tas',()=>{
  const initial={x:0,y:0,zoom:1};
  const zoomed=zoomCamera(initial,4,3000,2000,{x:.4,y:.3});
  assert.equal(zoomed.x+3000/zoomed.zoom*.4,3000*.4);
  assert.equal(zoomed.y+2000/zoomed.zoom*.3,2000*.3);
  assert.deepEqual(clampCamera({zoom:4,x:-400,y:4000},3000,2000),{zoom:4,x:0,y:1500});
  assert.deepEqual(zoomCamera(zoomed,1,3000,2000),initial);
  assert.equal(zoomCamera(initial,40,3000,2000).zoom,8);
});
