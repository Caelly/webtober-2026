import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createCactusModel} from './model.js';
import {trackballPoint,dragRotation,turnAxis,facingRotation,framingSpan} from './rotation.js';
import {pickVisibleSpine} from './picking.js';
import {pointerIntent,createSpinePull,springStep} from './pull.js';

function texture(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');
  let seed=kind==='skin'?41:109;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const pixels=ctx.createImageData(512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,band=kind==='skin'?Math.cos(x/512*Math.PI*20)*8:0,v=215+random()*28+band;pixels.data[i]=v;pixels.data[i+1]=v+(kind==='skin'?3:0);pixels.data[i+2]=v-6;pixels.data[i+3]=255;}
  ctx.putImageData(pixels,0,0);
  for(let i=0;i<2800;i++){ctx.fillStyle=i%2?'#ffffff29':'#2d391b15';ctx.beginPath();ctx.ellipse(random()*512,random()*512,.4+random(),.6+random()*1.4,0,0,Math.PI*2);ctx.fill();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;return map;
}

export function createCactusScene(canvas,{game,onPluck,preview=false}){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,40);camera.position.set(0,.15,10);camera.lookAt(0,0,0);
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.02);scene.environment=environment.texture;scene.environmentIntensity=.4;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff4dc','#52694c',2));
  const sun=new THREE.DirectionalLight('#ffe9c8',3.2);sun.position.set(-3,6,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=4;sun.shadow.camera.bottom=-4;sun.shadow.bias=-.001;sun.shadow.normalBias=.02;scene.add(sun);
  const fill=new THREE.DirectionalLight('#d4e6ce',1.1);fill.position.set(4,2,-3);scene.add(fill);
  const skin=texture('skin'),clay=texture('clay'),model=createCactusModel({skin,clay});scene.add(model.root);
  const bounds=new THREE.Box3().setFromObject(model.root),corners=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(x,y,z));
  const initial=new THREE.Quaternion().setFromEuler(new THREE.Euler(.055,-.24,-.025));model.root.quaternion.copy(initial);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const shadowContext=shadowCanvas.getContext('2d'),gradient=shadowContext.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'#65573a44');gradient.addColorStop(1,'#65573a00');shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas),floor=new THREE.Sprite(new THREE.SpriteMaterial({map:shadowTexture,transparent:true,depthWrite:false}));floor.position.set(0,new THREE.Box3().setFromObject(model.root).min.y-.01,0);floor.scale.set(2.8,.23,1);scene.add(floor);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),gestures=new Map();let width=1,height=1,raf,disposed=false,drag=null,pull=null,flowerScale=0,span=3,lastFrame=performance.now();
  for(const pin of model.needles.values())Object.assign(pin,{extension:0,velocity:0,target:0,releaseFrom:pin.position.clone()});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frameCamera(snap=false){const aspect=width/height,rotation=camera.quaternion.clone().invert().multiply(model.root.quaternion),target=framingSpan(corners,rotation,aspect);span=snap||target>span?target:THREE.MathUtils.lerp(span,target,.18);camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();}
  function resize(){const b=canvas.getBoundingClientRect();width=Math.max(1,b.width);height=Math.max(1,b.height);renderer.setSize(width,height,false);frameCamera(true);}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const local=e=>{const b=canvas.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top};};
  function pick(e){const p=local(e);pointer.set(p.x/width*2-1,1-p.y/height*2);raycaster.setFromCamera(pointer,camera);model.root.updateMatrixWorld(true);return pickVisibleSpine(raycaster.intersectObject(model.root,true),id=>game.has(id));}
  function highlight(id){for(const [key,pin] of model.needles){pin.halo.visible=key===id&&!pin.removed;pin.halo.scale.setScalar(1);}canvas.style.cursor=id?'grab':'default';}
  function releasePull(){if(pull){model.needles.get(pull.id).target=0;pull=null;}canvas.classList.remove('is-pulling');}
  function cancelInteraction(){releasePull();drag=null;const ids=[...gestures.keys()];gestures.clear();for(const id of ids)if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);highlight(null);}
  function beginRotation(p){drag={from:trackballPoint(p.x,p.y,width,height),start:model.root.quaternion.clone(),x:p.x,y:p.y,moved:false};if(gestures.size===2){const a=[...gestures.values()];drag.angle=Math.atan2(a[1].y-a[0].y,a[1].x-a[0].x);}canvas.style.cursor='grabbing';}
  function down(e){
    if(preview)return;
    const p=local(e),id=pick(e),intent=pointerIntent(e,!!id);
    if(!intent)return;
    e.preventDefault();gestures.set(e.pointerId,p);canvas.setPointerCapture(e.pointerId);
    if(e.pointerType==='touch'&&gestures.size===2){releasePull();beginRotation(p);highlight(null);return;}
    if(gestures.size>1)return;
    if(intent==='pull'){pull=createSpinePull(id,p,e);pull.pointerId=e.pointerId;highlight(id);canvas.classList.add('is-pulling');canvas.style.cursor='grabbing';}
    else beginRotation(p);
  }
  function pullTo(p){
    const sample=pull.sample(p),pin=model.needles.get(pull.id);pin.target=sample.extension;pin.halo.scale.setScalar(1+sample.tension*.7);
    if(sample.detached){const id=pull.id;releasePull();highlight(null);onPluck(id);}
  }
  function move(e){
    if(!gestures.has(e.pointerId)){if(!drag&&!pull)highlight(pick(e));return;}
    if(e.pointerType==='mouse'&&((pull&&!(e.buttons&1))||(drag&&!(e.buttons&2)))){cancelInteraction();return;}
    const p=local(e);gestures.set(e.pointerId,p);
    if(pull){pullTo(p);return;}
    if(!drag)return;
    drag.moved ||=gestures.size>1||Math.hypot(p.x-drag.x,p.y-drag.y)>3;if(!drag.moved)return;
    highlight(null);canvas.style.cursor='grabbing';
    if(gestures.size===2){const a=[...gestures.values()],angle=Math.atan2(a[1].y-a[0].y,a[1].x-a[0].x);model.root.quaternion.copy(turnAxis(drag.start,'z',drag.angle-angle));}
    else model.root.quaternion.copy(dragRotation(drag.from,trackballPoint(p.x,p.y,width,height),drag.start));
  }
  function up(e){if(!gestures.has(e.pointerId))return;if(e.type==='pointerup'&&pull&&pull.pointerId===e.pointerId)pullTo(local(e));cancelInteraction();}
  function context(e){e.preventDefault();}
  function key(e){const action={ArrowLeft:['y',-.15],ArrowRight:['y',.15],ArrowUp:['x',-.15],ArrowDown:['x',.15],q:['z',.15],e:['z',-.15]}[e.key];if(!action)return;e.preventDefault();turn(...action);}
  function turn(axis,amount=.3){cancelInteraction();model.root.quaternion.copy(turnAxis(model.root.quaternion,axis,amount));}
  function sync(){const now=performance.now();releasePull();for(const [id,pin] of model.needles){const removed=!game.has(id);if(removed!==pin.removed){pin.removed=removed;pin.at=now;pin.releaseFrom.copy(removed?pin.group.position:pin.position);pin.extension=pin.velocity=pin.target=0;pin.group.position.copy(pin.releaseFrom);pin.group.visible=true;pin.halo.visible=false;pin.areole.scale.setScalar(removed?.55:1);pin.areole.scale.z*=.65;}}}
  function focus(id){cancelInteraction();const pin=model.needles.get(id);if(!pin)return;model.root.quaternion.copy(facingRotation(pin.normal));highlight(id);}
  function frame(now){if(disposed)return;raf=requestAnimationFrame(frame);const dt=Math.min(.025,(now-lastFrame)/1000);lastFrame=now;if(document.hidden)return;for(const pin of model.needles.values())if(pin.removed&&pin.group.visible){const t=reduced?1:Math.min(1,(now-pin.at)/280);pin.group.position.copy(pin.releaseFrom).addScaledVector(pin.normal,t*.55);pin.group.scale.setScalar(1-t*.85);if(t===1)pin.group.visible=false;}else if(!pin.removed){const spring=springStep(pin.extension,pin.velocity,pin.target,dt);pin.extension=reduced?pin.target:spring.value;pin.velocity=reduced?0:spring.velocity;pin.group.position.copy(pin.position).addScaledVector(pin.normal,pin.extension);pin.group.scale.setScalar(1);}const target=game.completed?1:0;flowerScale=reduced?target:THREE.MathUtils.lerp(flowerScale,target,.08);model.flower.visible=flowerScale>.01;model.flower.scale.setScalar(Math.max(.001,flowerScale));floor.visible=new THREE.Vector3(0,1,0).applyQuaternion(model.root.quaternion).y>.93;frameCamera();renderer.render(scene,camera);}
  const leave=()=>{if(!drag)highlight(null);};
  if(!preview){canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('contextmenu',context);canvas.addEventListener('keydown',key);}
  raf=requestAnimationFrame(frame);
  return {sync,turn,focus,resetView(){cancelInteraction();model.root.quaternion.copy(initial);},dispose(){cancelInteraction();disposed=true;cancelAnimationFrame(raf);observer.disconnect();for(const [type,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['pointerleave',leave],['contextmenu',context],['keydown',key]])canvas.removeEventListener(type,fn);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());floor.material.dispose();shadowTexture.dispose();skin.dispose();clay.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
