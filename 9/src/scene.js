import * as THREE from 'three';

// The scene only illustrates a resolved turn; all rules live in game.js.
export function createScene(host,{preview=false}={}) {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const world=new THREE.Scene();world.background=new THREE.Color('#23343f');world.fog=new THREE.FogExp2('#23343f',.026);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 host.replaceChildren(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(38,1,.1,90);
 const cameraBase=new THREE.Vector3(8.4,6.6,15.5);camera.position.copy(cameraBase);camera.lookAt(0,2.2,1.2);
 const assets=new Set();
 let seed=906;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 function texture(type){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');
  if(type==='stone'){
   ctx.fillStyle='#576775';ctx.fillRect(0,0,512,512);
   for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
    const x=col*128+(row%2)*64,y=row*64,c=75+random()*35;
    ctx.fillStyle=`rgb(${c},${c+11},${c+17})`;ctx.fillRect(x+3,y+3,122,58);
    ctx.fillStyle='rgba(211,217,211,.13)';ctx.fillRect(x+4,y+4,120,2);ctx.fillStyle='rgba(18,27,33,.22)';ctx.fillRect(x+4,y+59,120,2);
   }
   for(let i=0;i<22000;i++){ctx.fillStyle=random()>.5?'rgba(245,244,210,.10)':'rgba(10,19,29,.13)';ctx.fillRect(random()*512,random()*512,random()*2+1,1);}
  }else{
   ctx.fillStyle='#745137';ctx.fillRect(0,0,512,512);
   for(let i=0;i<450;i++){const x=random()*512;ctx.strokeStyle=`rgba(${random()>.5?'40,22,12':'222,165,87'},${random()*.18+.03})`;ctx.lineWidth=random()*2+.4;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x-14,150,x+15,350,x+3,512);ctx.stroke();}
   for(let x=0;x<512;x+=64){ctx.fillStyle='rgba(19,13,8,.5)';ctx.fillRect(x,0,2,512);ctx.fillStyle='rgba(246,211,144,.18)';ctx.fillRect(x+3,0,1,512);}
   for(let i=0;i<12;i++){const x=random()*512,y=random()*512;ctx.strokeStyle='rgba(44,27,15,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,random()*7+3,random()*30+8,0,0,Math.PI*2);ctx.stroke();}
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;assets.add(map);return map;
 }
 const stoneMap=texture('stone'),woodMap=texture('wood');
 const stone=new THREE.MeshStandardMaterial({map:stoneMap,roughness:.97,color:'#b6bcc0'});
 const edge=new THREE.MeshStandardMaterial({map:stoneMap,color:'#d6c5a7',roughness:.95});
 const wood=new THREE.MeshStandardMaterial({map:woodMap,roughness:.87,color:'#b99461'});
 const logWood=new THREE.MeshStandardMaterial({map:woodMap,color:'#815b39',roughness:.9});
 const iron=new THREE.MeshStandardMaterial({color:'#333f43',metalness:.78,roughness:.4});
 const bronze=new THREE.MeshStandardMaterial({color:'#b8995a',metalness:.75,roughness:.4});
 const dark=new THREE.MeshStandardMaterial({color:'#0d161d',roughness:1});
 const floor=new THREE.MeshStandardMaterial({map:stoneMap,color:'#8c969a',roughness:1});
 const armor=new THREE.MeshStandardMaterial({color:'#778791',metalness:.63,roughness:.39});
 const skin=new THREE.MeshStandardMaterial({color:'#b79278',roughness:.92});
 const cloth=new THREE.MeshStandardMaterial({color:'#803c35',roughness:1});
 const leather=new THREE.MeshStandardMaterial({color:'#302c29',roughness:1});
 function mesh(geometry,material,parent=world,x=0,y=0,z=0){const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
 function box(w,h,d,mat,parent=world,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);}
 function cylinder(r1,r2,h,mat,parent,x,y,z,n=18){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),mat,parent,x,y,z);}
 world.add(new THREE.HemisphereLight('#cadbe0','#28312c',2.3));
 const sun=new THREE.DirectionalLight('#ffe4b5',3.3);sun.position.set(-7,13,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-9;sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;world.add(sun);
 const rim=new THREE.DirectionalLight('#8ba6c0',1.8);rim.position.set(9,8,-8);world.add(rim);
 // The bridge stops at the threshold. Behind the doors lies the open shaft.
 box(28,.7,18,floor,world,0,-2.5,-7);
 box(4.9,.38,13,floor,world,0,-.2,6.7);
 for(let side of [-1,1]){
  box(7.8,1.1,14,stone,world,side*6.25,-.5,5.5);
  box(6.1,6.5,1.5,stone,world,side*5.1,3.2,-.35);
  box(6.15,.38,1.75,edge,world,side*5.1,6.55,-.35);
  for(let i=0;i<6;i++)box(.56,.8,1.5,stone,world,side*5.1-2.55+i*1.03,7.08,-.35);
  const tower=new THREE.Group();world.add(tower);tower.position.set(side*7.15,0,.6);
  cylinder(1.28,1.43,7.7,stone,tower,0,3.8,0,24);cylinder(1.45,1.42,.38,edge,tower,0,7.65,0,24);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const block=box(.57,.85,.5,stone,tower,Math.sin(a)*1.12,8.19,Math.cos(a)*1.12);block.rotation.y=a;}
  for(let y of [2.2,5]){box(.19,.92,.1,dark,tower,0,y,1.3);box(.11,.85,.08,iron,tower,0,y,1.37);}
  box(.85,.35,1.9,edge,world,side*2.48,5.5,0);
  box(.54,3.6,1.1,edge,world,side*2.35,1.8,.15);
 }
 // Individual arch stones give the gateway a visible, deep silhouette.
 for(let i=0;i<13;i++){
  const a=i/13*Math.PI,b=(i+1)/13*Math.PI-.012;
  const shape=new THREE.Shape();shape.moveTo(Math.cos(a)*2.08,3+Math.sin(a)*2.08);shape.lineTo(Math.cos(a)*2.72,3+Math.sin(a)*2.72);shape.absarc(0,3,2.72,a,b,false);shape.lineTo(Math.cos(b)*2.08,3+Math.sin(b)*2.08);shape.absarc(0,3,2.08,b,a,true);shape.closePath();
  mesh(new THREE.ExtrudeGeometry(shape,{depth:1.35,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:1,steps:1}),edge,world,0,0,-.55);
 }
 // Interior stone ledges and a dark drop, visible only when the door opens.
 box(1,6,7,stone,world,-3,2.4,-4);box(1,6,7,stone,world,3,2.4,-4);
 box(6,.4,7,dark,world,0,-5,-3.5);
 const doors=[];
 for(let side of [-1,1]){
  const hinge=new THREE.Group();hinge.position.set(side*2,0,.19);world.add(hinge);doors.push(hinge);
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(2,0);shape.lineTo(2,5);shape.absarc(2,3,2,Math.PI/2,Math.PI,false);shape.closePath();
  const leaf=new THREE.Group();leaf.scale.x=side===-1?1:-1;hinge.add(leaf);
  mesh(new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:1}),wood,leaf);
  for(let y of [.55,1.95,3.3]){
   box(1.96,.18,.08,iron,leaf,1,y,.32);
   for(let x of [.17,.58,1.13,1.78])mesh(new THREE.SphereGeometry(.043,8,6),bronze,leaf,x,y,.38);
  }
  for(let y of [.5,2,3.5])cylinder(.09,.09,.33,iron,leaf,.04,y,.25,10);
  mesh(new THREE.TorusGeometry(.16,.035,6,20),bronze,leaf,1.65,1.85,.4);
 }
 const crackMaterial=new THREE.LineBasicMaterial({color:'#23190f'}),cracks=new THREE.Group();world.add(cracks);cracks.position.z=.49;
 for(let i=0;i<8;i++){
  const x=(random()-.5)*3.3,y=.5+random()*3.4,points=[new THREE.Vector3(x,y,0)];
  for(let j=1;j<5;j++)points.push(new THREE.Vector3(x+(random()-.5)*.22,y+j*.13,0));
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),crackMaterial);line.visible=false;cracks.add(line);
 }
 const torches=[];
 for(let side of [-1,1]){
  const x=side*3.55;box(.12,.5,.14,iron,world,x,3.1,.56);box(.1,.12,.4,iron,world,x,3,.75);
  cylinder(.1,.2,.27,bronze,world,x,3.4,.85);
  const flame=mesh(new THREE.ConeGeometry(.12,.4,7),new THREE.MeshBasicMaterial({color:'#ffb355'}),world,x,3.67,.85);torches.push(flame);
  const light=new THREE.PointLight('#ffad52',5,6,2);light.position.set(x,3.6,1.1);world.add(light);
 }
 // The crest is built as a shield with a stylised ram head.
 const shieldShape=new THREE.Shape();shieldShape.moveTo(-.47,.55);shieldShape.lineTo(.47,.55);shieldShape.lineTo(.42,-.2);shieldShape.quadraticCurveTo(.3,-.62,0,-.78);shieldShape.quadraticCurveTo(-.3,-.62,-.42,-.2);shieldShape.closePath();
 mesh(new THREE.ExtrudeGeometry(shieldShape,{depth:.1,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2}),bronze,world,0,6.38,.65);
 box(.12,.7,.05,iron,world,0,6.22,.8);box(.58,.1,.05,iron,world,0,6.4,.8);
 for(let side of [-1,1]){
  const pole=cylinder(.034,.034,3,iron,world,side*6.15,8.5,-.5,8);
  const banner=box(.65,1.18,.035,cloth,world,pole.position.x+side*.3,9.05,-.5);banner.rotation.y=side*.15;
 }
 const team=new THREE.Group();world.add(team);team.position.z=5.5;
 const ram=new THREE.Group();ram.position.y=1.58;team.add(ram);
 const log=cylinder(.24,.29,3.5,logWood,ram,0,0,0,20);log.rotation.x=Math.PI/2;
 for(let z of [-1.45,-.7,.8,1.55]){const band=cylinder(.29,.29,.12,iron,ram,0,0,z,20);band.rotation.x=Math.PI/2;}
 const head=new THREE.Group();head.position.z=-1.9;ram.add(head);
 const ramNose=mesh(new THREE.IcosahedronGeometry(.35,1),bronze,head,0,0,0);ramNose.scale.set(1,.9,1.35);
 for(let side of [-1,1]){
  const horn=mesh(new THREE.TorusGeometry(.25,.075,7,18,Math.PI*1.7),bronze,head,side*.32,.09,.12);horn.rotation.set(0,side*.3,side*-.55);
  mesh(new THREE.SphereGeometry(.055,8,6),iron,head,side*.19,.1,-.27);
 }
 for(let z of [-.8,.85])box(2.2,.13,.14,wood,ram,0,-.18,z);
 const crew=[];
 for(let side of [-1,1])for(let lane of [-1,1]){
  const person=new THREE.Group();person.position.set(side*.86,0,lane*.84);team.add(person);crew.push(person);
  const body=cylinder(.25,.3,.6,cloth,person,0,.97,0,12);
  mesh(new THREE.SphereGeometry(.235,16,12),skin,person,0,1.53,0);
  const helmet=mesh(new THREE.SphereGeometry(.255,16,12,0,Math.PI*2,0,Math.PI*.65),armor,person,0,1.55,0);
  cylinder(.29,.29,.07,armor,person,0,1.54,0,16);
  box(.09,.31,.05,iron,person,0,1.41,-.24);box(.32,.05,.07,iron,person,0,1.47,-.23);
  const shoulders=mesh(new THREE.SphereGeometry(.16,12,8),armor,person,side*-.22,1.2,0);shoulders.scale.y=.72;
  const arm=box(.17,.42,.2,cloth,person,side*-.24,1.12,-.14);arm.rotation.z=side*.7;
  mesh(new THREE.SphereGeometry(.11,10,8),skin,person,side*-.44,1.35,-.02);
  box(.46,.09,.42,leather,person,0,.76,0);
  for(let legSide of [-1,1]){
   const leg=box(.14,.53,.19,leather,person,legSide*.13,.43,0);leg.rotation.x=lane*legSide*.13;
   box(.21,.18,.34,iron,person,legSide*.13,.12,-.07);
  }
 }
 // Debris is pooled and reused; turns do not allocate more GPU resources.
 const particles=[];const debrisGeo=new THREE.IcosahedronGeometry(.08,0);
 for(let i=0;i<24;i++){const particle=mesh(debrisGeo,wood);particle.visible=false;particles.push({mesh:particle,v:new THREE.Vector3(),origin:new THREE.Vector3()});}
 let phase='idle',started=performance.now(),choice='wait',hp=200,result=null,disposed=false,raf=0,fromZ=5.5,doorFrom=0;
 const ease=t=>1-Math.pow(1-t,3),clamp=t=>Math.min(1,Math.max(0,t));
 function angles(amount){doors[0].rotation.y=amount;doors[1].rotation.y=-amount;}
 function emit(){for(let item of particles){item.origin.set((random()-.5)*1.7,1.65+(random()-.5)*.5,.8);item.v.set((random()-.5)*3,random()*2.4+.6,random()*2.6+.6);item.mesh.visible=true;}}
 function state(next){phase=next;started=performance.now();}
 function update(now){
  const sec=(now-started)/1000,t=clamp(sec/(phase==='approach'?.85:phase==='recover'?.45:1));
  if(phase==='approach'){
   if(choice==='charge'){team.position.z=5.5-(5.5-2.48)*ease(t);ram.position.z=Math.sin(t*Math.PI)*-.08;}
   else{ram.position.y=1.58+Math.sin(t*Math.PI)*.12;}
  }else if(phase==='hit'){
   angles(0);team.position.z=2.48+Math.sin(sec*23)*Math.exp(-sec*5)*.12;doors.forEach((door,index)=>door.position.z=.19+Math.sin(sec*35)*Math.exp(-sec*6)*.07*(index?1:-1));
  }else if(phase==='opened')angles(ease(clamp(sec/.55))*1.5);
  else if(phase==='fall'){
   angles(ease(clamp(sec/.4))*1.6);
   team.position.z=2.48-5.2*ease(clamp(sec/.9));
   team.position.y=-Math.pow(clamp((sec-.3)/.9),2)*9;
   team.rotation.x=-clamp((sec-.25)/.8)*.65;
   crew.forEach((person,index)=>{person.rotation.z=Math.sin(index*2+1)*clamp(sec/.9)*.8;person.position.y=-clamp((sec-.4)/.8)*index*.25;});
  }else if(phase==='victory'){
   doors.forEach((door,index)=>{door.rotation.x=-ease(clamp(sec/.8))*1.35;door.rotation.z=(index?1:-1)*ease(clamp(sec/.9))*.16;});
  }else if(phase==='recover'){
   team.position.z=fromZ+(5.5-fromZ)*ease(t);ram.position.y=1.58;ram.position.z=0;angles(doorFrom*(1-ease(t)));doors.forEach(door=>door.position.z=.19);if(t>=1)phase='idle';
  }
  if(phase==='hit'||phase==='victory')for(let item of particles){item.mesh.position.copy(item.origin).addScaledVector(item.v,sec);item.mesh.position.y-=sec*sec*2.8;item.mesh.rotation.set(sec*2,sec*3,sec);item.mesh.visible=sec<1.1;}
  const damageCount=Math.floor((200-hp)/200*cracks.children.length);cracks.children.forEach((line,index)=>line.visible=index<damageCount&&!result?.opened&&phase!=='victory');
  if(!reduced){crew.forEach((person,index)=>{if(phase==='approach'&&choice==='charge')person.rotation.x=Math.sin(now*.021+index)*.055;else if(!['fall','victory'].includes(phase))person.rotation.x=0;});torches.forEach((torch,index)=>torch.scale.y=1+Math.sin(now*.007+index)*.09);}
  const shake=!reduced&&phase==='hit'?Math.sin(sec*50)*Math.exp(-sec*7)*.06:0;
  camera.position.copy(cameraBase);camera.position.x+=shake;camera.lookAt(0,2.2,1.2);
 }
 function draw(now=performance.now()){if(disposed)return;update(now);renderer.render(world,camera);}
 function tick(now){raf=0;if(disposed||document.hidden)return;draw(now);if(!preview&&!reduced)raf=requestAnimationFrame(tick);else if(!preview&&phase!=='idle'&&phase!=='still')raf=requestAnimationFrame(tick);}
 function wake(){if(!preview&&!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
 function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;
  cameraBase.set(w/h<1.1?7.7:8.4,w/h<1.1?7.2:6.6,w/h<1.1?21:15.5);camera.position.copy(cameraBase);camera.lookAt(0,2.2,1.2);camera.updateProjectionMatrix();draw();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 const visibility=()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else wake();};document.addEventListener('visibilitychange',visibility);
 function reset(){hp=200;result=null;phase='idle';team.visible=true;team.position.set(0,0,5.5);team.rotation.set(0,0,0);ram.position.set(0,1.58,0);crew.forEach(person=>{person.rotation.set(0,0,0);person.position.y=0;});doors.forEach(door=>{door.rotation.set(0,0,0);door.position.z=.19;});particles.forEach(item=>item.mesh.visible=false);draw();wake();}
 resize();if(!preview)wake();
 return {
  approach(next){choice=next;result=null;state('approach');if(reduced){team.position.z=choice==='charge'?2.48:5.5;state('still');draw();}wake();},
  resolve(next,doorHp){result=next;hp=doorHp;state(next.fatal?'fall':hp===0?'victory':next.opened?'opened':next.damage?'hit':'idle');if(next.damage&&!reduced)emit();
   if(reduced){angles(next.opened?1.6:0);if(next.fatal)team.visible=false;if(hp===0)doors.forEach(door=>door.rotation.x=-1.35);state('still');draw();}wake();},
  recover(){fromZ=team.position.z;doorFrom=doors[0].rotation.y;state('recover');if(reduced){team.position.z=5.5;angles(0);state('idle');draw();}wake();},
  reset,
  dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);const geometries=new Set(),materials=new Set();world.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(mat=>materials.add(mat));});geometries.forEach(geo=>geo.dispose());materials.forEach(mat=>mat.dispose());assets.forEach(asset=>asset.dispose());renderer.renderLists.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
