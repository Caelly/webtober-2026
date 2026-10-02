import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildReliquary } from './reliquary-model.js';

export function createReliquary(element) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { element.classList.add('relic-fallback'); return { dispose() {} }; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));renderer.setClearColor(0,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  element.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.4,7);camera.lookAt(0,.12,0);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;scene.environmentIntensity=.85;pmrem.dispose();room.dispose();
  scene.add(new THREE.HemisphereLight('#fff9ec','#433e35',.65));
  const key=new THREE.DirectionalLight('#fff8ed',3.8);key.position.set(-3,4,5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;
  key.shadow.bias=-.0005;key.shadow.normalBias=.015;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight('#e4e9f1',1.15);fill.position.set(3,2,4);scene.add(fill);
  const rim=new THREE.DirectionalLight('#fff0cc',2.6);rim.position.set(2,3,-4);scene.add(rim);
  const {root:object,textures}=buildReliquary();scene.add(object);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({color:'#4e4130',opacity:.11}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.525;floor.receiveShadow=true;scene.add(floor);
  let raf=0,visible=true,disposed=false,hover=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const resize=new ResizeObserver(()=>{
    const {width,height}=element.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=Math.max(7,4.2/camera.aspect);camera.updateProjectionMatrix();
  });resize.observe(element);
  const observe=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(render);});observe.observe(element);
  const enter=()=>hover=true,leave=()=>hover=false;
  element.addEventListener('pointerenter',enter);element.addEventListener('pointerleave',leave);
  function render(time) {
    raf=0;if(!visible||disposed)return;
    const target=reduced.matches?-.16:-.16+Math.sin(time*.00024)*.065+(hover?.09:0);
    object.rotation.y+=(target-object.rotation.y)*.03;renderer.render(scene,camera);raf=requestAnimationFrame(render);
  }
  raf=requestAnimationFrame(render);
  return { dispose() {
    disposed=true;cancelAnimationFrame(raf);resize.disconnect();observe.disconnect();
    element.removeEventListener('pointerenter',enter);element.removeEventListener('pointerleave',leave);
    const geometries=new Set(),materials=new Set();
    scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);for(const material of [o.material].flat())materials.add(material);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();
  } };
}
