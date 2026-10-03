import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {nearestCapsule} from './collection.js';

export function createMachine(canvas,{onPhase,onPrize,onReady}){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,60);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.environmentIntensity=.65;
  camera.position.set(.25,3.45,10);camera.lookAt(0,2.55,0);
  const hemi=new THREE.HemisphereLight(0xfff8ed,0x9e8aaf,1.2);scene.add(hemi);
  const light=new THREE.DirectionalLight(0xfff4df,2.7);light.position.set(-3,9,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-4;light.shadow.camera.right=4;light.shadow.camera.top=6;light.shadow.camera.bottom=-3;light.shadow.normalBias=.03;light.shadow.radius=4;scene.add(light);
  const pink=new THREE.PointLight(0xf8a1b1,8,7);pink.position.set(2,3,-1);scene.add(pink);
  const mat=(color,roughness=.6,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const lilac=mat('#a898c4',.35,.12),cream=mat('#f8efdd',.5),chrome=mat('#dce5ed',.2,.9),dark=mat('#4c4657',.7),pinkMat=mat('#e9a4ae',.48),floorMat=mat('#ebe4e6');
  const mesh=(geometry,material,x=0,y=0,z=0,parent=scene)=>{const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;};
  const box=(w,h,d,m,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
  const cylinder=(r,h,m,x,y,z,parent)=>mesh(new THREE.CylinderGeometry(r,r,h,24),m,x,y,z,parent);
  const cabinet=new THREE.Group();scene.add(cabinet);
  box(3.5,1.35,2.7,lilac,0,.72,0,cabinet);box(3.64,.15,2.82,cream,0,1.4,0,cabinet);
  box(3.15,.12,2.3,floorMat,0,1.51,0,cabinet);
  box(3.4,3.25,.12,cream,0,3.07,-1.29,cabinet);
  for(const x of [-1.64,1.64])for(const z of [-1.27,1.27])box(.14,3.25,.14,lilac,x,3.06,z,cabinet);
  box(3.65,.52,2.83,lilac,0,4.8,0,cabinet);box(3.5,.09,2.7,cream,0,4.5,0,cabinet);
  for(const x of [-1.49,1.49]){box(.035,2.87,.035,new THREE.MeshBasicMaterial({color:'#fff3cc'}),x,3,-1.16,cabinet);box(.2,.12,2.7,chrome,x,1.48,0,cabinet);}
  const lettering=document.createElement('canvas');lettering.width=1024;lettering.height=160;const ctx=lettering.getContext('2d');ctx.fillStyle='#a898c4';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#fff7e4';ctx.textAlign='center';ctx.font='bold 65px sans-serif';ctx.fillText('PETIT BONHEUR',512,87);ctx.font='20px sans-serif';ctx.letterSpacing='5px';ctx.fillText('LE CLUB DES PELUCHES',512,132);
  const signTex=new THREE.CanvasTexture(lettering);signTex.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(3.1,.43),new THREE.MeshBasicMaterial({map:signTex}),0,4.81,1.427,cabinet);
  // Transparent side walls and restrained reflections keep the entire play area visible.
  const glass=new THREE.MeshPhysicalMaterial({color:'#f9ffff',transparent:true,opacity:.09,roughness:.03,metalness:0,depthWrite:false,side:THREE.DoubleSide});
  const side1=mesh(new THREE.PlaneGeometry(2.5,2.9),glass,-1.58,3,0,cabinet);side1.rotation.y=Math.PI/2;
  const side2=mesh(new THREE.PlaneGeometry(2.5,2.9),glass,1.58,3,0,cabinet);side2.rotation.y=Math.PI/2;
  const pane=mesh(new THREE.PlaneGeometry(3.15,2.92),glass,0,3.02,1.27,cabinet);pane.castShadow=false;
  const sheen=mesh(new THREE.PlaneGeometry(.13,2.55),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.16,depthWrite:false}),1.24,3.1,1.285,cabinet);sheen.rotation.z=-.12;sheen.castShadow=false;
  // Prize chute, lower panel and the tactile controls under the glass.
  box(.91,.64,.08,dark,-.98,.8,1.37,cabinet);box(.76,.48,.1,cream,-.98,.77,1.43,cabinet);box(.7,.33,.11,dark,-.98,.83,1.49,cabinet);
  box(1.12,.045,.85,dark,-.98,1.51,.72,cabinet);
  box(3.48,.16,.55,cream,0,1.18,1.5,cabinet);
  cylinder(.09,.3,dark,.57,1.39,1.59,cabinet);mesh(new THREE.SphereGeometry(.13,24,16),pinkMat,.57,1.57,1.59,cabinet);
  cylinder(.18,.08,pinkMat,1.12,1.33,1.59,cabinet);
  for(const x of [-1.4,1.4]){cylinder(.14,.16,dark,x,.08,.9,cabinet);cylinder(.14,.16,dark,x,.08,-.9,cabinet);}
  const ground=mesh(new THREE.CircleGeometry(2.65,64),new THREE.ShadowMaterial({opacity:.085}),0,-.015,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  const capsuleColors=['#e79aad','#85b9c3','#d6b866','#b397cd','#95bd91'];
  const shellTop=mat('#fff7e7',.23,.07),seam=mat('#d6cbbd',.4);
  const capsules=[];let capsuleId=0;
  function capsule(x,z){
    const group=new THREE.Group(),color=mat(capsuleColors[capsuleId%5],.3,.08),radius=.225;
    // Two contrasting halves with a raised seam: little surprise capsules.
    mesh(new THREE.SphereGeometry(radius,24,16,0,Math.PI*2,0,Math.PI/2),shellTop,0,0,0,group);
    mesh(new THREE.SphereGeometry(radius,24,16,0,Math.PI*2,Math.PI/2,Math.PI/2),color,0,0,0,group);
    const ring=mesh(new THREE.TorusGeometry(radius,.008,6,32),seam,0,0,0,group);ring.rotation.x=Math.PI/2;
    group.rotation.set((Math.random()-.5)*1.6,Math.random()*Math.PI,(Math.random()-.5)*1.6);
    group.position.set(x,1.8,z);scene.add(group);const entry={id:capsuleId++,x,z,group,color};capsules.push(entry);return entry;
  }
  for(let row=0;row<5;row++)for(let col=0;col<6;col++)capsule(-1.23+col*.48+(Math.random()-.5)*.035,-.94+row*.45+(Math.random()-.5)*.035);
  // The gantry really travels over both axes, viewed through the front of the cabinet.
  for(const x of [-1.4,1.4])box(.06,.06,2.4,chrome,x,4.36,0);
  const bridge=new THREE.Group();scene.add(bridge);box(2.9,.08,.08,chrome,0,4.36,0,bridge);
  const carriage=box(.34,.17,.28,lilac,0,4.37,0);
  const cable=cylinder(.014,1,dark,0,4.1,0);
  const claw=new THREE.Group();scene.add(claw);
  cylinder(.105,.14,chrome,0,0,0,claw);mesh(new THREE.SphereGeometry(.115,24,12),chrome,0,-.07,0,claw);
  const fingers=[];
  for(let n=0;n<3;n++){
    const pivot=new THREE.Group();pivot.rotation.y=n*Math.PI*2/3;claw.add(pivot);
    const arm=new THREE.Group();pivot.add(arm);arm.position.y=-.08;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.06,0,0),new THREE.Vector3(.26,-.22,0),new THREE.Vector3(.3,-.47,0),new THREE.Vector3(.16,-.61,0)]);
    mesh(new THREE.TubeGeometry(curve,24,.024,8,false),chrome,0,0,0,arm);
    mesh(new THREE.SphereGeometry(.038,12,8),chrome,.16,-.61,0,arm);fingers.push(arm);
  }
  const target=mesh(new THREE.RingGeometry(.19,.205,48),new THREE.MeshBasicMaterial({color:'#7d709b',transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}),0,1.579,0);target.rotation.x=-Math.PI/2;target.castShadow=false;
  let x=0,z=0,y=3.99,close=0,phase='ready',elapsed=0,caught=null,from={x:0,z:0},raf,disposed=false,last=performance.now();
  const direction={x:0,z:0};const lerp=THREE.MathUtils.lerp,ease=t=>t*t*(3-2*t);
  function phaseTo(next){phase=next;elapsed=0;onPhase?.(next);}
  function grab(){if(phase!=='ready')return false;from={x,z};direction.x=direction.z=0;phaseTo('descending');return true;}
  function setDirection(dx,dz){direction.x=dx;direction.z=dz;}
  function resetReady(){y=3.99;close=0;phaseTo('ready');onReady?.();}
  function update(dt){
    elapsed+=dt;
    if(phase==='ready'){
      x=THREE.MathUtils.clamp(x+direction.x*dt*1.25,-1.28,1.28);z=THREE.MathUtils.clamp(z+direction.z*dt*1.25,-.97,.96);
    }else if(phase==='descending'){
      y=lerp(3.99,2.37,ease(Math.min(1,elapsed/1.3)));if(elapsed>=1.3)phaseTo('closing');
    }else if(phase==='closing'){
      close=Math.min(1,elapsed/.55);
      if(elapsed>=.55){caught=nearestCapsule(capsules,x,z);if(caught){capsules.splice(capsules.indexOf(caught),1);claw.attach(caught.group);caught.group.position.set(0,-.53,0);}phaseTo('lifting');}
    }else if(phase==='lifting'){
      y=lerp(2.37,3.99,ease(Math.min(1,elapsed/1.25)));if(elapsed>=1.25){if(caught)phaseTo('transporting');else{onPrize?.(null);resetReady();}}
    }else if(phase==='transporting'){
      const t=ease(Math.min(1,elapsed/1.1));x=lerp(from.x,-.98,t);z=lerp(from.z,.72,t);if(elapsed>=1.1){scene.attach(caught.group);phaseTo('dropping');}
    }else if(phase==='dropping'){
      close=1-Math.min(1,elapsed/.4);caught.group.position.y=3.46-Math.min(1,elapsed/.72)**2*2.8;
      if(elapsed>=.72){scene.remove(caught.group);caught.group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});caught.color.dispose();capsule(caught.x,caught.z);caught=null;phaseTo('opening');onPrize?.(true);}
    }
    for(const arm of fingers)arm.rotation.z=-close*.26;
    claw.position.set(x,y,z);bridge.position.z=z;carriage.position.set(x,4.37,z);cable.position.set(x,(y+4.28)/2,z);cable.scale.y=4.28-y;
    target.position.set(x,1.579,z);target.visible=phase==='ready';
  }
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.position.z=Math.max(10,6.5/Math.max(.3,camera.aspect));camera.lookAt(0,2.55,0);camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();update(0);
  function frame(now){if(disposed)return;raf=requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000);last=now;if(document.hidden)return;update(dt);renderer.render(scene,camera);}raf=requestAnimationFrame(frame);
  return {grab,setDirection,nudge(dx,dz){if(phase!=='ready')return;x=THREE.MathUtils.clamp(x+dx*.16,-1.28,1.28);z=THREE.MathUtils.clamp(z+dz*.16,-.97,.96);},release:resetReady,get busy(){return phase!=='ready';},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});signTex.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
