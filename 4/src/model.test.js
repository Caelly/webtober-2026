import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCactusModel,stemGeometry,spinePlacement} from './model.js';
import {spines} from './game.js';
import {trackballPoint,dragRotation,turnAxis,facingRotation,framingSpan} from './rotation.js';
import {pickVisibleSpine} from './picking.js';

test('the ribbed stem has outward-facing surfaces and finite normals',()=>{
  const geometry=stemGeometry(new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,4,0)),.4);
  const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal');
  for(let i=0;i<p.count;i++)assert.ok([p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite));
  let outward=0;for(let i=80*30;i<80*31;i++)outward+=p.getX(i)*n.getX(i)+p.getZ(i)*n.getZ(i);
  assert.ok(outward>0);geometry.dispose();
});
test('all 43 needles have distinct 3D locations, with accessible back faces',()=>{
  const model=createCactusModel();assert.equal(model.needles.size,spines.length);
  const positions=spines.map(spinePlacement);assert.equal(new Set(positions.map(p=>p.position.toArray().join(','))).size,spines.length);
  assert.ok(positions.some(p=>p.normal.z<-.7));assert.ok(positions.some(p=>p.normal.z>.7));
  for(const {position,normal} of positions){assert.ok(position.toArray().every(Number.isFinite));assert.ok(Math.abs(normal.length()-1)<1e-8);}
  for(const {normal} of positions){const q=facingRotation(normal);assert.ok(normal.clone().applyQuaternion(q).distanceTo(new THREE.Vector3(0,0,1))<1e-7);assert.ok(new THREE.Vector3(0,1,0).applyQuaternion(q).y>0,'keyboard focus keeps the cactus upright rather than flipping it');}
});
test('rotation is unrestricted on each axis, and diagonal trackball drags include roll',()=>{
  const identity=new THREE.Quaternion();
  for(const axis of ['x','y','z']){const turned=turnAxis(identity,axis,Math.PI);assert.ok(turned.angleTo(identity)>3);const full=turnAxis(turned,axis,Math.PI);assert.ok(full.angleTo(identity)<1e-7);}
  const from=trackballPoint(450,150,600,600),to=trackballPoint(470,380,600,600),rotation=dragRotation(from,to,identity);
  assert.ok(Math.abs(rotation.z)>.1);assert.ok(Math.abs(rotation.length()-1)<1e-8);
});

test('every needle can be picked from its outer face, and the cactus blocks back-face picks',()=>{
  const {root,needles}=createCactusModel();root.updateMatrixWorld(true);
  const ray=new THREE.Raycaster();
  for(const [id,pin] of needles){ray.set(pin.position.clone().addScaledVector(pin.normal,2),pin.normal.clone().negate());assert.equal(pickVisibleSpine(ray.intersectObject(root,true),()=>true),id,id);}
  const [backId,back]=[...needles].find(([,pin])=>pin.normal.z<-.8);
  ray.set(new THREE.Vector3(back.position.x,back.position.y,4),new THREE.Vector3(0,0,-1));
  assert.notEqual(pickVisibleSpine(ray.intersectObject(root,true),()=>true),backId);
});
test('portrait framing enlarges an upright cactus and fits it when rolled horizontally',()=>{
  const points=[];for(const x of [-1.6,1.6])for(const y of [-2,2.9])for(const z of [-1,1])points.push(new THREE.Vector3(x,y,z));
  const upright=framingSpan(points,new THREE.Quaternion(),.65),rolled=framingSpan(points,turnAxis(new THREE.Quaternion(),'z',Math.PI/2),.65);
  assert.ok(upright<3.2);assert.ok(rolled*.65>2.9);
});
