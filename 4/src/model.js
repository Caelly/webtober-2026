import * as THREE from 'three';
import {spines} from './game.js';

const axes=new THREE.Vector3(0,1,0);
const stemProfiles=[
  {path:new THREE.LineCurve3(new THREE.Vector3(0,-1.18,0),new THREE.Vector3(0,2.6,0)),radius:.43},
  {path:new THREE.CatmullRomCurve3([new THREE.Vector3(-.3,.04,0),new THREE.Vector3(-.94,.04,0),new THREE.Vector3(-1.28,.3,0),new THREE.Vector3(-1.28,.88,0),new THREE.Vector3(-1.28,1.42,0)]),radius:.255},
  {path:new THREE.CatmullRomCurve3([new THREE.Vector3(.3,.46,0),new THREE.Vector3(.94,.46,0),new THREE.Vector3(1.25,.75,0),new THREE.Vector3(1.25,1.48,0),new THREE.Vector3(1.25,2.04,0)]),radius:.265},
];
for(const stem of stemProfiles){stem.points=stem.path.getSpacedPoints(96);stem.frames=stem.path.computeFrenetFrames(96,false);}
export function stemGeometry(path,radius){
  const segments=96,sides=80,points=path.getSpacedPoints(segments),frames=path.computeFrenetFrames(segments,false),positions=[],uvs=[],indices=[];
  for(let row=0;row<=segments;row++){
    const t=row/segments,cap=Math.sqrt(Math.max(.0001,1-Math.max(0,(t-.9)/.1)**2));
    for(let col=0;col<=sides;col++){
      const angle=col/sides*Math.PI*2,r=radius*(1+.058*Math.cos(angle*10))*cap;
      const p=points[row].clone().addScaledVector(frames.normals[row],Math.cos(angle)*r).addScaledVector(frames.binormals[row],Math.sin(angle)*r);
      positions.push(p.x,p.y,p.z);uvs.push(col/sides,t);
      if(row<segments&&col<sides){const a=row*(sides+1)+col,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

// Needle positions sit on the ribs, including the backs of the three stems.
export function spinePlacement(pin,index){
  let x=0,y,theta;
  if(pin.region==='tronc'){
    y=2.6-(pin.y-64)/496*3.78;
    theta=[-.63,0,.63][index%3]+(Math.floor(index/3)%2?Math.PI:0);
  }else if(pin.region==='bras gauche'){
    if(pin.x>250){x=-.83;y=.01+(405-pin.y)*.004;theta=index%2?2.4:.3;}
    else {x=-1.28;y=1.08-(pin.y-284)*.013;theta=pin.x<210?-.6:.6;if(Math.floor((index-27)/2)%2)theta+=Math.PI;}
  }else{
    if(pin.x<510){x=.88;y=.46;theta=index%2?2.65:.15;}
    else{x=1.25;y=1.67-(pin.y-210)*.013;theta=pin.x<530?-.58:.58;if(Math.floor((index-35)/2)%2)theta+=Math.PI;}
  }
  const stem=stemProfiles[pin.region==='tronc'?0:pin.region==='bras gauche'?1:2],target=new THREE.Vector3(x,y,0);
  let row=0,distance=Infinity;
  for(let i=0;i<87;i++){const d=stem.points[i].distanceToSquared(target);if(d<distance){distance=d;row=i;}}
  const tangent=stem.frames.tangents[row],radial=new THREE.Vector3(Math.sin(theta),0,Math.cos(theta));radial.addScaledVector(tangent,-radial.dot(tangent)).normalize();
  const angle=Math.atan2(radial.dot(stem.frames.binormals[row]),radial.dot(stem.frames.normals[row]));
  const position=stem.points[row].clone().addScaledVector(radial,stem.radius*(1+.058*Math.cos(angle*10))+.008);
  const normal=radial.clone().addScaledVector(tangent,.42).normalize();
  return {position,normal};
}

export function createCactusModel({skin=null,clay=null}={}){
  const root=new THREE.Group(),plant=new THREE.Group();root.add(plant);
  const green=new THREE.MeshStandardMaterial({color:'#4f7547',map:skin,bumpMap:skin,bumpScale:.014,roughness:.84});
  for(const {path,radius} of stemProfiles){const mesh=new THREE.Mesh(stemGeometry(path,radius),green);mesh.castShadow=mesh.receiveShadow=true;plant.add(mesh);}
  const profile=[[.63,-1.94],[.71,-1.91],[.89,-1.24],[.94,-1.22],[.95,-1.12],[.91,-1.08],[.85,-1.1],[.83,-1.23],[.68,-1.84],[.0,-1.84]].map(([x,y])=>new THREE.Vector2(x,y));
  const pot=new THREE.Mesh(new THREE.LatheGeometry(profile,96),new THREE.MeshStandardMaterial({color:'#c18b6b',map:clay,bumpMap:clay,bumpScale:.012,roughness:.94,side:THREE.DoubleSide}));pot.castShadow=pot.receiveShadow=true;root.add(pot);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.9,.045,14,96),new THREE.MeshStandardMaterial({color:'#ce9b78',roughness:.85,map:clay}));rim.rotation.x=Math.PI/2;rim.position.y=-1.12;rim.castShadow=true;root.add(rim);
  const soil=new THREE.Mesh(new THREE.CylinderGeometry(.83,.83,.025,80),new THREE.MeshStandardMaterial({color:'#443529',roughness:1,map:clay}));soil.position.y=-1.16;soil.receiveShadow=true;root.add(soil);
  const pebbleGeometry=new THREE.IcosahedronGeometry(.04,1),pebbleMaterial=new THREE.MeshStandardMaterial({color:'#746650',roughness:1});
  for(let i=0;i<38;i++){const a=i*2.4,r=.47+(i%7)/7*.3;const mesh=new THREE.Mesh(pebbleGeometry,pebbleMaterial);mesh.position.set(Math.sin(a)*r,-1.13,Math.cos(a)*r);mesh.scale.set(1+(i%3)*.3,.5,1);root.add(mesh);}
  const needles=new Map(),needleGeometry=new THREE.ConeGeometry(.012,.2,7),needleMaterial=new THREE.MeshStandardMaterial({color:'#dcc89b',roughness:.72});
  const areoleGeometry=new THREE.SphereGeometry(.031,14,10),areoleMaterial=new THREE.MeshStandardMaterial({color:'#afa67d',roughness:1});
  const hitGeometry=new THREE.SphereGeometry(.09,12,8),hitMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});
  const haloGeometry=new THREE.TorusGeometry(.06,.006,6,28),haloMaterial=new THREE.MeshBasicMaterial({color:'#fff0ba',transparent:true,opacity:.9,depthTest:true});
  spines.forEach((pin,index)=>{
    const {position,normal}=spinePlacement(pin,index),areole=new THREE.Mesh(areoleGeometry,areoleMaterial);areole.position.copy(position);areole.scale.set(1,1,.65);root.add(areole);
    const group=new THREE.Group();group.position.copy(position);group.quaternion.setFromUnitVectors(axes,normal);group.userData.spineId=pin.id;
    const needle=new THREE.Mesh(needleGeometry,needleMaterial);needle.position.y=.1;needle.scale.y=pin.length/22;needle.castShadow=true;group.add(needle);
    const hit=new THREE.Mesh(hitGeometry,hitMaterial);hit.position.y=.07;group.add(hit);
    const halo=new THREE.Mesh(haloGeometry,haloMaterial);halo.rotation.x=Math.PI/2;halo.position.y=.014;halo.visible=false;group.add(halo);
    root.add(group);needles.set(pin.id,{group,position,normal,halo,areole,removed:false,at:0});
  });
  const flower=new THREE.Group();flower.position.set(0,2.6,0);flower.visible=false;root.add(flower);
  const petalGeometry=new THREE.SphereGeometry(.14,28,20),petalMaterial=new THREE.MeshStandardMaterial({color:'#d98e8c',roughness:.65,side:THREE.DoubleSide});
  for(let layer=0;layer<2;layer++)for(let n=0;n<9;n++){const a=n/9*Math.PI*2+layer*.3,petal=new THREE.Mesh(petalGeometry,petalMaterial);petal.position.set(Math.sin(a)*(.2-layer*.07),.08+layer*.04,Math.cos(a)*(.2-layer*.07));petal.scale.set(.66,.4,1.7-layer*.35);petal.rotation.set(-.65-layer*.2,a,0,'YXZ');flower.add(petal);}
  const pollen=new THREE.Mesh(new THREE.SphereGeometry(.105,24,16),new THREE.MeshStandardMaterial({color:'#e5c37c',roughness:.95}));pollen.position.y=.12;pollen.scale.y=.5;flower.add(pollen);
  return {root,needles,flower};
}
