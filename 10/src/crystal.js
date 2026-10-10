import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createCrystal(host,{preview=false,onPosition=()=>{}}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const scene=new THREE.Scene();
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;host.replaceChildren(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(34,1,.1,30);camera.position.set(0,2.7,7.9);camera.lookAt(0,1.65,0);
 const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(environment,.04);scene.environment=env.texture;environment.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight('#c6b2e7','#261625',2));
 const key=new THREE.DirectionalLight('#ffd4a0',3);key.position.set(-3,5,3);scene.add(key);
 const rim=new THREE.DirectionalLight('#a89cff',5);rim.position.set(3,4,-2);scene.add(rim);
 const bronze=new THREE.MeshStandardMaterial({color:'#b69763',roughness:.32,metalness:.87});
 const darkBronze=new THREE.MeshStandardMaterial({color:'#3c2c26',roughness:.38,metalness:.85});
 const black=new THREE.MeshStandardMaterial({color:'#241d2b',roughness:.46,metalness:.4});
 const root=new THREE.Group();scene.add(root);
 function mesh(geo,mat,parent=root){const item=new THREE.Mesh(geo,mat);parent.add(item);return item;}
 const foot=mesh(new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.7,0),new THREE.Vector2(.84,.08),new THREE.Vector2(.83,.16),new THREE.Vector2(.63,.22),new THREE.Vector2(.45,.35),new THREE.Vector2(.44,.45),new THREE.Vector2(.69,.56),new THREE.Vector2(.85,.63),new THREE.Vector2(.87,.69),new THREE.Vector2(.79,.76)],80),darkBronze);
 for(let [radius,y] of [[.81,.1],[.68,.23],[.45,.41],[.82,.64],[.8,.74]]){const ring=mesh(new THREE.TorusGeometry(radius,.018,8,80),bronze);ring.rotation.x=Math.PI/2;ring.position.y=y;}
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2,stud=mesh(new THREE.SphereGeometry(.016,6,6),bronze);stud.position.set(Math.sin(a)*.829,.15,Math.cos(a)*.829);}
 const tray=mesh(new THREE.CylinderGeometry(.77,.71,.1,80),black);tray.position.y=.69;
 // Three sculpted claws cradle the glass instead of intersecting it.
 for(let i=0;i<3;i++){
  const a=i/3*Math.PI*2+Math.PI/3;
  const points=[[.7,.47],[.92,.65],[1.05,.88],[.96,1.04]].map(([r,y])=>new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.037,8,false),bronze);
  const end=mesh(new THREE.SphereGeometry(.065,12,10),bronze);end.position.copy(points.at(-1));
 }
 const center=new THREE.Vector3(0,1.98,0),radius=1.28;
 const uniforms={time:{value:0},energy:{value:0},eye:{value:camera.position.clone().sub(center)}};
 const mistMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
 vertexShader:`varying vec3 localPosition;void main(){localPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`precision highp float;
 varying vec3 localPosition;uniform float time;uniform float energy;uniform vec3 eye;
 float hash(vec3 p){p=fract(p*.3183099+vec3(.17,.32,.57));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float cloud(vec3 p){return noise(p)*.62+noise(p*2.03+3.9)*.26+noise(p*4.1)*.12;}
 void main(){
 vec3 ray=normalize(localPosition-eye);float b=dot(eye,ray),c=dot(eye,eye)-1.51;float discriminant=b*b-c;if(discriminant<0.)discard;
 float near=-b-sqrt(discriminant),far=-b+sqrt(discriminant),stepSize=(far-near)/16.;vec3 sum=vec3(0);float opacity=0.;
 for(int i=0;i<16;i++){
  vec3 p=eye+ray*(near+(float(i)+.5)*stepSize);float r=length(p);
  // Twist each depth slice into a slow vortex, then break it up into smoky ribbons.
  float angle=time*.34+p.y*(1.9+energy*.9)+(1.-r)*.8;
  mat2 spin=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  vec2 swirl=spin*p.xz;
  vec3 flow=vec3(swirl.x*2.1+sin(p.y*2.8-time*.53)*.32,p.y*1.9-time*.37,swirl.y*2.1+cos(p.y*2.2+time*.42)*.36);
  float n=cloud(flow);
  float ribbon=sin(p.y*5.2+atan(swirl.y,swirl.x)*2.+n*6.-time*.7)*.5+.5;
  float edgeFade=1.-smoothstep(.65,1.23,r);
  float density=smoothstep(.29,.74,n)*edgeFade*(.14+ribbon*.16);
  float curl=smoothstep(.2,.88,ribbon);
  vec3 color=mix(vec3(.13,.045,.25),vec3(.58,.3,.91),curl);
  color=mix(color,vec3(.2,.74,.82),smoothstep(.51,.81,n)*(1.-curl*.65));
  float filament=pow(ribbon,9.)*smoothstep(.38,.7,n);
  color+=filament*vec3(.23,.32,.44)*(1.+energy*.65);
  color+=energy*vec3(.09,.055,.16);
  sum+=(1.-opacity)*color*density*1.7;opacity+=(1.-opacity)*density;
 }
 float edge=pow(1.-abs(dot(normalize(localPosition),-ray)),2.);sum+=vec3(.22,.14,.42)*edge*.3;
 gl_FragColor=vec4(sum,clamp(opacity+edge*.25,0.,.96));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const mist=mesh(new THREE.SphereGeometry(1.23,48,32),mistMaterial);mist.position.copy(center);mist.renderOrder=2;
 const glassMaterial=new THREE.MeshPhysicalMaterial({color:'#d2c6ef',roughness:.045,metalness:0,transmission:.58,thickness:.2,ior:1.46,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.36,envMapIntensity:1.3,side:THREE.FrontSide,depthWrite:false});
 const glass=mesh(new THREE.SphereGeometry(radius,80,56),glassMaterial);glass.position.copy(center);glass.renderOrder=3;
 const pearlMaterial=new THREE.MeshBasicMaterial({color:'#d6b7ff',transparent:true,opacity:.72,depthWrite:false});
 let seed=1006;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const particles=Array.from({length:110},()=>({radius:.25+random()*.84,angle:random()*Math.PI*2,latitude:random()*Math.PI-Math.PI/2,speed:.12+random()*.18,phase:random()*Math.PI*2}));
 const vertices=new Float32Array(particles.length*3),seeds=new Float32Array(particles.length);
 function placeParticles(time){particles.forEach((particle,index)=>{
  const latitude=particle.latitude+Math.sin(time*.24+particle.phase)*.12;
  const angle=particle.angle+time*particle.speed;
  const band=particle.radius*Math.cos(latitude);
  vertices[index*3]=Math.cos(angle)*band;vertices[index*3+1]=Math.sin(latitude)*particle.radius;vertices[index*3+2]=Math.sin(angle)*band;
 });}
 placeParticles(3);particles.forEach((particle,index)=>seeds[index]=particle.phase);
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3).setUsage(THREE.DynamicDrawUsage));starGeometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
 const sparkMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`uniform float time;uniform float energy;attribute float seed;varying float brightness;void main(){vec4 eyePosition=modelViewMatrix*vec4(position,1.);brightness=.35+.65*pow(.5+.5*sin(time*.7+seed),2.);gl_PointSize=min(8.,max(2.2,(22.+energy*12.+sin(seed)*3.)/-eyePosition.z));gl_Position=projectionMatrix*eyePosition;}`,
 fragmentShader:`varying float brightness;void main(){float distanceFromCenter=length(gl_PointCoord-.5);float soft=exp(-distanceFromCenter*distanceFromCenter*20.)*(1.-smoothstep(.35,.5,distanceFromCenter));gl_FragColor=vec4(vec3(.69,.77,1.),soft*brightness);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const sparkles=new THREE.Points(starGeometry,sparkMaterial);sparkles.position.copy(center);sparkles.renderOrder=4;root.add(sparkles);
 // Tiny suspended flecks give the glass a tangible interior without hiding the answer.
 for(let i=0;i<7;i++){const fleck=mesh(new THREE.SphereGeometry(.01,6,6),pearlMaterial);fleck.position.set((random()-.5)*1.6,center.y+(random()-.5)*1.6,(random()-.5)*.7);}
 const floor=mesh(new THREE.CircleGeometry(2.8,80),new THREE.MeshBasicMaterial({color:'#1b1526',transparent:true,opacity:.32,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;
 const glow=new THREE.PointLight('#9f66ed',3,4);glow.position.copy(center);scene.add(glow);
 let state='idle',target=0,energy=0,raf=0,disposed=false,previous=performance.now(),simulationTime=3;
 function frame(now){raf=0;if(disposed||document.hidden)return;
  const delta=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
  energy+=(target-energy)*(1.-Math.exp(-delta*3.8));
  if(!reduced&&!preview){simulationTime+=delta*(.6+energy*1.8);placeParticles(simulationTime);starGeometry.attributes.position.needsUpdate=true;glow.intensity=2.8+energy*1.4+Math.sin(simulationTime*.65)*.2;}
  uniforms.energy.value=energy;uniforms.time.value=simulationTime;
  renderer.render(scene,camera);if(!preview&&!reduced)raf=requestAnimationFrame(frame);
 }
 function draw(){renderer.render(scene,camera);}
 function position(){
  const projected=center.clone().project(camera),edge=center.clone().add(new THREE.Vector3(radius,0,0)).project(camera);
  const x=(projected.x*.5+.5)*host.clientWidth,y=(-projected.y*.5+.5)*host.clientHeight;
  const diameter=Math.abs(edge.x-projected.x)*host.clientWidth;
  onPosition(x,y,Math.max(150,diameter*.73));
 }
 function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.position.set(0,2.7,w/h<.9?9.6:7.9);camera.lookAt(0,1.65,0);camera.updateProjectionMatrix();uniforms.eye.value.copy(camera.position).sub(center);position();draw();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 function wake(){if(!preview&&!reduced&&!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
 const visibility=()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else wake();};document.addEventListener('visibilitychange',visibility);
 uniforms.time.value=3;resize();wake();
 return {
  setState(next){state=next;target=state==='waiting'?1:state==='answered'?.18:0;if(state==='answered'&&!reduced)energy=.82;host.dataset.state=state;if(reduced){energy=target;uniforms.energy.value=energy;draw();}},
  dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);const geometries=new Set(),materials=new Set();scene.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)materials.add(obj.material);});geometries.forEach(geo=>geo.dispose());materials.forEach(mat=>mat.dispose());env.dispose();renderer.renderLists.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
