import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {pillowGeometry,paddingProfile,metalFinishes} from './figurine.js';
import {sculptureSvg} from './plush.js';
import {roster,rarities} from './collection.js';

test('the padded drawing stays shallow, with softly curved caps and finite smooth normals',()=>{
  const shape=new THREE.Shape();shape.moveTo(-30,-24);shape.lineTo(30,-24);shape.lineTo(30,24);shape.lineTo(-30,24);shape.closePath();
  const [depth,bulge]=paddingProfile.head;
  const {geometry,front}=pillowGeometry(shape,depth,bulge),size=geometry.boundingBox.getSize(new THREE.Vector3());
  assert.ok(size.z>depth);assert.ok(size.z/size.x<.1);assert.ok(front(0,0)-front(30,0)>.5);
  const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal');assert.ok(p.count>100);assert.ok(geometry.index);
  for(let i=0;i<p.count;i++){assert.ok([p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite));const length=Math.hypot(n.getX(i),n.getY(i),n.getZ(i));assert.ok(length>.99&&length<1.01);}
  geometry.dispose();
});
test('every Disney edition supplies explicit head, body and facial parts for the padded drawing',()=>{
  for(const c of roster)for(const r of rarities){const svg=sculptureSvg(c,r.id);for(const part of ['head','body','clothing','eyes','face','accessory'])assert.ok(svg.includes(`data-part="${part}"`),`${c.name}: ${part}`);assert.ok(!svg.includes('url(#'));assert.ok(!svg.includes('undefined'));}
});
test('bronze, silver and gold are physically reflective finishes, with separate metal hues',()=>{
  assert.equal(new Set(Object.values(metalFinishes).map(m=>m.color)).size,3);
  for(const material of Object.values(metalFinishes)){assert.equal(material.metalness,1);assert.ok(material.roughness<=.2);assert.equal(material.clearcoat,1);assert.ok(material.clearcoatRoughness<=.12);}
});
