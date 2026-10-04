import test from 'node:test';
import assert from 'node:assert/strict';
import {pointerIntent,createSpinePull,springStep} from './pull.js';

test('left mouse gestures pull only needles; right mouse gestures always rotate',()=>{
  assert.equal(pointerIntent({button:0,pointerType:'mouse'},true),'pull');
  assert.equal(pointerIntent({button:0,pointerType:'mouse'},false),null);
  assert.equal(pointerIntent({button:2,pointerType:'mouse'},true),'rotate');
  assert.equal(pointerIntent({button:2,pointerType:'mouse'},false),'rotate');
  assert.equal(pointerIntent({button:1,pointerType:'mouse'},true),null);
  assert.equal(pointerIntent({button:0,pointerType:'touch'},true),'pull');
  assert.equal(pointerIntent({button:0,pointerType:'touch'},false),'rotate');
});
test('a click and a short tug leave the needle attached, with visible resistance',()=>{
  const pull=createSpinePull('spine-7',{x:100,y:100});
  assert.equal(pull.sample({x:100,y:100}).detached,false);
  const tug=pull.sample({x:140,y:100});assert.equal(tug.detached,false);assert.ok(tug.extension>0&&tug.extension<.07);
  assert.equal(pull.sample({x:100+pull.threshold-1,y:100}).detached,false);
  assert.equal(pull.sample({x:100+pull.threshold,y:100}).detached,true);
});
test('distance is current displacement, so oscillating or returning to the root does not accumulate force',()=>{
  const pull=createSpinePull('spine-1',{x:0,y:0});
  for(let n=0;n<20;n++){assert.equal(pull.sample({x:60,y:0}).detached,false);assert.equal(pull.sample({x:-60,y:0}).detached,false);}
  assert.equal(pull.sample({x:0,y:0}).extension,0);
  assert.equal(pull.sample({x:pull.threshold,y:0}).detached,true);
});
test('the spring returns a released needle to its root and settles without detaching it',()=>{
  let value=.11,velocity=0;
  for(let i=0;i<120;i++){const result=springStep(value,velocity,0,1/60);value=result.value;velocity=result.velocity;assert.ok(Number.isFinite(value)&&Number.isFinite(velocity));}
  assert.ok(Math.abs(value)<.0001);assert.ok(Math.abs(velocity)<.0001);
});
