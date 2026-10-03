import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createFigurine,createFleece,disposeFigurine} from './figurine.js';

export function createFigurineStudio(canvas,{portrait=false}={}){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:portrait});
  renderer.setPixelRatio(portrait?1:Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,30);
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.035);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.environmentIntensity=1.15;
  scene.add(new THREE.HemisphereLight(0xfff7ef,0x9a84a9,1.6));
  const key=new THREE.DirectionalLight(0xfff1d3,3.4);key.position.set(-3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xe0edff,3);rim.position.set(3,2,-2);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xffffff,.9);fill.position.set(1,-1,5);scene.add(fill);
  // Real bright panels are reflected by the polished metallic surfaces.
  for(const [x,y,z,w,h,intensity] of [[-2,1,3,.7,4,5],[2.3,.5,1.8,.45,3.5,4],[0,3,-1,3,.5,3]]){
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(1,1,1).multiplyScalar(intensity),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);scene.add(panel);
    // Kept outside the camera frustum, included in the reflection environment.
  }
  scene.background=new THREE.Color('#77717f');
  const studioPMREM=new THREE.PMREMGenerator(renderer),reflection=studioPMREM.fromScene(scene,.02);scene.environment=reflection.texture;scene.background=null;environment.dispose();studioPMREM.dispose();
  // Remove panels from the display; their reflection remains baked in the environment.
  const panels=scene.children.filter(o=>o.isMesh);for(const panel of panels){scene.remove(panel);panel.geometry.dispose();panel.material.dispose();}
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,5,64,64,61);gradient.addColorStop(0,'rgba(61,42,76,.22)');gradient.addColorStop(1,'rgba(61,42,76,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas),shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
  const fleece=createFleece();let model=null,width=1,height=1,baseRotation=-.32;
  function frameCamera(){
    if(!model)return;
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    const distance=Math.max(size.y,size.x/camera.aspect)/Math.tan(THREE.MathUtils.degToRad(16))*.63;
    camera.position.set(0,size.y*.035,Math.max(2.6,distance));camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    shadow.position.set(0,bounds.min.y-.055,0);shadow.scale.setScalar(Math.max(.7,size.x*.68));
  }
  function resize(w,h){width=Math.max(1,w);height=Math.max(1,h);renderer.setSize(width,height,false);camera.aspect=width/height;frameCamera();}
  function setModel(character,rarity){if(model){scene.remove(model);disposeFigurine(model);}model=createFigurine(character,rarity,fleece);model.rotation.y=baseRotation;scene.add(model);frameCamera();return model;}
  function rotate(yaw,pitch=0){if(model){model.rotation.y=yaw;model.rotation.x=pitch;}}
  function render(){renderer.render(scene,camera);}
  function dispose(){if(model)disposeFigurine(model);shadow.geometry.dispose();shadow.material.dispose();shadowTexture.dispose();fleece.dispose();reflection.dispose();renderer.dispose();renderer.forceContextLoss();}
  return {resize,setModel,rotate,render,dispose,get canvas(){return canvas;},get model(){return model;},get angle(){return baseRotation;}};
}

// One offscreen WebGL renderer serves the entire collection, never one per card.
export function createFigurinePortraits(){
  const cache=new Map(),pending=new Map(),queue=[];let studio=null,raf=0,disposed=false,failed=false;
  function tick(){
    if(disposed)return;raf=0;
    if(!queue.length)return;
    if(document.hidden||document.querySelector('dialog[open]')){raf=requestAnimationFrame(tick);return;}
    const task=queue.shift();
    try{
      if(!studio){studio=createFigurineStudio(document.createElement('canvas'),{portrait:true});studio.resize(160,192);}
      studio.setModel(task.character,task.rarity);studio.render();
      const image=studio.canvas.toDataURL('image/png');cache.set(task.key,image);task.resolve(image);
    }catch(error){failed=true;studio?.dispose();studio=null;task.resolve(null);for(const item of queue.splice(0))item.resolve(null);console.warn('Aperçus 3D indisponibles :',error);}
    pending.delete(task.key);if(queue.length&&!failed)raf=requestAnimationFrame(tick);
  }
  function request(character,rarity){
    const key=`${character.id}:${rarity}`;if(cache.has(key))return Promise.resolve(cache.get(key));if(disposed||failed)return Promise.resolve(null);if(pending.has(key))return pending.get(key);
    const promise=new Promise(resolve=>queue.push({key,character,rarity,resolve}));pending.set(key,promise);if(!raf)raf=requestAnimationFrame(tick);return promise;
  }
  return {request,dispose(){disposed=true;cancelAnimationFrame(raf);studio?.dispose();for(const task of queue.splice(0))task.resolve(null);pending.clear();cache.clear();}};
}
