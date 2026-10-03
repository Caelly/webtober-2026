import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {sculptureSvg} from './plush.js';

export const metalFinishes={
  bronze:{color:'#b77543',metalness:1,roughness:.2,clearcoat:1,clearcoatRoughness:.12},
  silver:{color:'#d4dce5',metalness:1,roughness:.14,clearcoat:1,clearcoatRoughness:.08},
  gold:{color:'#e8b83e',metalness:1,roughness:.16,clearcoat:1,clearcoatRoughness:.09},
};
const partSettings={head:[34,15,0],body:[25,11,-3],back:[14,5,-15],feet:[21,6,1],arms:[16,5,-2],hands:[16,5,2],ears:[15,5,-4],hair:[7,2,0],'face-relief':[2,1,1],eyes:[3.5,1,2],nose:[6,2,2],face:[2,1,3],clothing:[2.5,1,1],accessory:[12,4,6]};

function boundsOf(shape){
  const points=shape.getPoints(32),box=new THREE.Box2().setFromPoints(points);
  const size=box.getSize(new THREE.Vector2()),center=box.getCenter(new THREE.Vector2());
  return {cx:center.x,cy:center.y,rx:Math.max(1,size.x/2),ry:Math.max(1,size.y/2),width:size.x,height:size.y};
}
// A rounded pillow cap with real interior vertices, not a flat polygon extrusion.
export function pillowGeometry(shape,depth,bulge){
  const b=boundsOf(shape),bevel=Math.min(3,Math.max(.3,Math.min(b.width,b.height)*.095));
  const original=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:5,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});
  const source=original.getAttribute('position'),positions=[];
  const emit=(a,b,c,level=0)=>{
    // Refine front/back caps before inflating; the sides already have curved bevels.
    const planar=Math.abs(a[2]-b[2])<1e-5&&Math.abs(b[2]-c[2])<1e-5;
    const longest=Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(b[0]-c[0],b[1]-c[1]),Math.hypot(c[0]-a[0],c[1]-a[1]));
    if(planar&&longest>7&&level<4){
      const mid=(p,q)=>p.map((v,i)=>(v+q[i])/2),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
      emit(a,ab,ca,level+1);emit(ab,b,bc,level+1);emit(ca,bc,c,level+1);emit(ab,bc,ca,level+1);
    }else positions.push(...a,...b,...c);
  };
  for(let n=0;n<source.count;n+=3)emit([source.getX(n),source.getY(n),source.getZ(n)],[source.getX(n+1),source.getY(n+1),source.getZ(n+1)],[source.getX(n+2),source.getY(n+2),source.getZ(n+2)]);
  original.dispose();
  for(let n=0;n<positions.length;n+=3){
    const x=positions[n],y=positions[n+1],z=positions[n+2]-depth/2;
    const dome=Math.sqrt(Math.max(0,1-((x-b.cx)/b.rx)**2-((y-b.cy)/b.ry)**2));
    const capBlend=Math.min(1,Math.abs(z)/(depth/2));
    positions[n+2]=z+Math.sign(z)*bulge*dome*capBlend;
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(positions.flatMap((v,i)=>i%3===0?[v/120,positions[i+1]/140]:[]),2));
  // Shared vertices give continuous curved normals and compact GPU buffers.
  const smooth=mergeVertices(geometry,.0001);geometry.dispose();smooth.computeVertexNormals();smooth.computeBoundingBox();
  return {geometry:smooth,bounds:b,front:(x,y)=>depth/2+bulge*Math.sqrt(Math.max(0,1-((x-b.cx)/b.rx)**2-((y-b.cy)/b.ry)**2))};
}

export function createFleece(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#dedede';ctx.fillRect(0,0,256,256);
  let seed=617;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let n=0;n<13000;n++){const x=random()*256,y=random()*256,v=Math.floor(170+random()*85);ctx.strokeStyle=`rgb(${v},${v},${v})`;ctx.lineWidth=.5+random();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(random()-.5)*3,y+2+random()*4);ctx.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);return texture;
}
function semanticPart(node){for(let el=node;el;el=el.parentNode){const part=el.getAttribute?.('data-part');if(part)return part;}return 'accessory';}

export function createFigurine(character,rarity,fleece){
  const group=new THREE.Group(),data=new SVGLoader().parse(sculptureSvg(character,rarity)),metal=metalFinishes[rarity],materials=new Map();
  const entries=data.paths.map(path=>({path,part:semanticPart(path.userData.node),shapes:SVGLoader.createShapes(path)}));
  const core={};
  for(const name of ['head','body']){
    const entry=entries.find(e=>e.part===name&&e.shapes.length);if(!entry)throw new Error(`Volume ${name} absent : ${character.name}`);
    const [depth,bulge,z]=partSettings[name];core[name]={...pillowGeometry(entry.shapes[0],depth,bulge),z};
  }
  const surface=(name,x,y)=>{const volume=core[name];return volume.z+volume.front(x,y);};
  const materialFor=(color,part)=>{
    const dark=new THREE.Color(color);const inlay=dark.r+dark.g+dark.b<.22&&['eyes','face','nose'].includes(part),eye=part==='eyes',key=`${color}:${part}`;
    if(!materials.has(key)){
      const settings=metal&&!inlay?{...metal,color:part==='eyes'?'#fff5df':metal.color,envMapIntensity:1.3,bumpMap:null,map:null}
        :{color,metalness:0,roughness:eye?.23:.94,clearcoat:eye?.45:0,clearcoatRoughness:.12,map:inlay||eye?null:fleece,bumpMap:inlay||eye?null:fleece,bumpScale:.6};
      const material=new THREE.MeshPhysicalMaterial({...settings,side:THREE.DoubleSide});materials.set(key,material);
    }
    return materials.get(key);
  };
  const counters={};
  for(const {path,part,shapes} of entries){
    const style=path.userData.style,[depth,bulge,z]=partSettings[part]||partSettings.accessory;
    const order=counters[part]||0;counters[part]=order+1;
    const wrapped=['hair','face-relief','eyes','nose','face','clothing'].includes(part);
    const wrapTo=part==='clothing'?'body':'head';
    const place=(geometry,isStroke=false)=>{
      const positions=geometry.getAttribute('position');
      for(let n=0;n<positions.count;n++){
        const x=positions.getX(n),y=positions.getY(n),originalZ=positions.getZ(n);
        const front=wrapped?surface(wrapTo,x,y)+depth/2+z+order*.16:z;
        positions.setZ(n,originalZ+front+(isStroke?depth/2+1:0));
      }
      if(wrapped)geometry.computeVertexNormals();
    };
    if(style.fill&&style.fill!=='none'&&style.fillOpacity!==0){
      for(const shape of shapes){
        let geometry;
        if(core[part])geometry=core[part].geometry;
        else geometry=pillowGeometry(shape,depth,bulge).geometry;
        place(geometry);
        const mesh=new THREE.Mesh(geometry,materialFor(style.fill,part));mesh.userData.part=part;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
      }
    }
    if(style.stroke&&style.stroke!=='none')for(const sub of path.subPaths){
      const geometry=SVGLoader.pointsToStroke(sub.getPoints(30),style);if(!geometry)continue;place(geometry,true);
      const line=new THREE.Mesh(geometry,materialFor(style.stroke,part));line.userData.part=part;group.add(line);
    }
  }
  group.scale.set(.013,-.013,.013);
  const bounds=new THREE.Box3().setFromObject(group),center=bounds.getCenter(new THREE.Vector3());group.position.sub(center);
  group.userData={character:character.name,rarity,depth:bounds.max.z-bounds.min.z};
  return group;
}
export function disposeFigurine(group){const materials=new Set();group.traverse(o=>{if(o.isMesh){o.geometry.dispose();materials.add(o.material);}});for(const material of materials)material.dispose();}
