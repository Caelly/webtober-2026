import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {sculptureSvg} from './plush.js';

export function showPlush(canvas,character,rarity){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,20);camera.position.set(0,.15,3.3);camera.lookAt(0,0,0);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.environmentIntensity=.6;
  scene.add(new THREE.HemisphereLight(0xfff6e8,0xa496b5,1.2));const light=new THREE.DirectionalLight(0xffffff,2.2);light.position.set(-3,4,6);scene.add(light);
  const fleece=document.createElement('canvas');fleece.width=fleece.height=256;const ctx=fleece.getContext('2d');ctx.fillStyle='#bababa';ctx.fillRect(0,0,256,256);
  for(let n=0;n<14000;n++){const x=Math.random()*256,y=Math.random()*256,v=Math.floor(155+Math.random()*100);ctx.strokeStyle=`rgb(${v},${v},${v})`;ctx.lineWidth=.5+Math.random();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(Math.random()-.5)*3,y+2+Math.random()*4);ctx.stroke();}
  const fur=new THREE.CanvasTexture(fleece);fur.colorSpace=THREE.SRGBColorSpace;fur.wrapS=fur.wrapT=THREE.RepeatWrapping;fur.repeat.set(3,3);
  const group=new THREE.Group(),data=new SVGLoader().parse(sculptureSvg(character,rarity));scene.add(group);
  data.paths.forEach((path,index)=>{
    const style=path.userData.style,fill=style.fill;
    if(fill&&fill!=='none'&&style.fillOpacity!==0){
      for(const shape of SVGLoader.createShapes(path)){
        const padded=index>0&&fill!=='#17191f';
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:padded?8:2,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:padded?1.8:.35,bevelThickness:padded?3:.4,curveSegments:14});
        const uv=geometry.getAttribute('uv');for(let n=0;n<uv.count;n++)uv.setXY(n,uv.getX(n)/120,uv.getY(n)/140);
        const color=new THREE.Color(fill),embroidered=color.r+color.g+color.b<.2;
        const material=new THREE.MeshStandardMaterial({color,roughness:embroidered?.7:.96,metalness:rarity==='normal'?0:.25,map:embroidered?null:fur,bumpMap:embroidered?null:fur,bumpScale:1.2,side:THREE.DoubleSide});
        const part=new THREE.Mesh(geometry,material);part.position.z=index*.35;group.add(part);
      }
    }
    if(style.stroke&&style.stroke!=='none')for(const sub of path.subPaths){
      const geometry=SVGLoader.pointsToStroke(sub.getPoints(),style);if(!geometry)continue;
      const line=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:style.stroke,roughness:1,side:THREE.DoubleSide}));line.position.z=index*.35+9;group.add(line);
    }
  });
  // Centre the real padded geometry, preserve a slightly oversized plush head.
  group.scale.set(.013,-.013,.013);const bounds=new THREE.Box3().setFromObject(group),center=bounds.getCenter(new THREE.Vector3());group.position.sub(center);
  let disposed=false,raf;const start=performance.now();
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(now){if(disposed)return;group.rotation.y=reduced?0:Math.sin((now-start)/1800)*.21;renderer.render(scene,camera);raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
  return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});fur.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();};
}
