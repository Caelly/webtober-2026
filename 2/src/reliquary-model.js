import * as THREE from 'three';

// All textures are generated locally: worn brass, textile weave and porous bone.
export function buildReliquary() {
  const root = new THREE.Group(), textures = [];
  let seed = 1847;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function canvasTexture(draw, color = false, size = 512) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const texture = new THREE.CanvasTexture(canvas);
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    textures.push(texture); return texture;
  }
  const brass = canvasTexture((ctx, size) => {
    ctx.fillStyle = '#b39454'; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 90; i++) {
      const x = random()*size, y = random()*size, radius = 8 + random()*68;
      const patch = ctx.createRadialGradient(x,y,0,x,y,radius);
      patch.addColorStop(0,i%4?'rgba(57,43,23,.16)':'rgba(48,68,46,.20)'); patch.addColorStop(1,'rgba(57,43,23,0)');
      ctx.fillStyle = patch; ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
    }
    for (let i = 0; i < 24000; i++) {
      ctx.fillStyle = i%3?'rgba(24,17,8,.10)':'rgba(255,235,178,.22)';
      ctx.fillRect(random()*size,random()*size,.4+random()*1.5,.4+random()*1.5);
    }
  }, true);
  const scratches = canvasTexture((ctx,size) => {
    ctx.fillStyle='#a4a4a4'; ctx.fillRect(0,0,size,size);
    for(let i=0;i<3500;i++) {
      ctx.strokeStyle=i%4?'#919191':'#d1d1d1'; ctx.lineWidth=.3+random()*.5;
      const x=random()*size,y=random()*size;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+random()*24,y+random()*3);ctx.stroke();
    }
  });
  const velvet = canvasTexture((ctx,size) => {
    ctx.fillStyle='#281c1e';ctx.fillRect(0,0,size,size);
    for(let i=0;i<22000;i++) {
      ctx.fillStyle=i%2?'rgba(93,43,46,.35)':'rgba(7,4,6,.35)';ctx.fillRect(random()*size,random()*size,1,2+random()*4);
    }
    for(let y=0;y<size;y+=3) {ctx.fillStyle='rgba(194,118,104,.025)';ctx.fillRect(0,y,size,.5);}
  },true);
  const boneMap = canvasTexture((ctx,size) => {
    ctx.fillStyle='#bdaa80';ctx.fillRect(0,0,size,size);
    for(let i=0;i<350;i++) {
      const x=random()*size,y=random()*size,r=2+random()*21;
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(86,58,29,.25)');g.addColorStop(1,'rgba(86,58,29,0)');
      ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
    }
    for(let i=0;i<16000;i++) {ctx.fillStyle=i%4?'rgba(249,232,190,.16)':'rgba(47,29,12,.3)';ctx.fillRect(random()*size,random()*size,.5+random()*1.4,.6+random()*2);}
  },true);
  const gold = new THREE.MeshStandardMaterial({map:brass,roughnessMap:scratches,bumpMap:scratches,bumpScale:.0025,metalness:.94,roughness:.48});
  const polished = new THREE.MeshStandardMaterial({color:'#bda467',metalness:.98,roughness:.23,bumpMap:scratches,bumpScale:.001});
  const tarnish = new THREE.MeshStandardMaterial({color:'#473b26',metalness:.84,roughness:.61});
  const silver = new THREE.MeshStandardMaterial({color:'#a6a28d',metalness:.95,roughness:.33,bumpMap:scratches,bumpScale:.001});
  const ruby = new THREE.MeshPhysicalMaterial({color:'#4b0711',roughness:.13,metalness:.08,clearcoat:1,clearcoatRoughness:.04});
  const add = (geometry, material, x=0,y=0,z=0,parent=root) => {
    const mesh = new THREE.Mesh(geometry, material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  const ring = (r,tube,sx,sy,y,z,mat=gold) => { const mesh=add(new THREE.TorusGeometry(r,tube,12,120),mat,0,y,z);mesh.scale.set(sx,sy,1);return mesh; };
  const tube = (points,radius,mat=gold,parent=root) => {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return add(new THREE.TubeGeometry(curve,32,radius,7,false),mat,0,0,0,parent);
  };
  // Turned foot with several chased rims, and a fluted stem.
  const profile=[[.62,-1.52],[.65,-1.50],[.65,-1.46],[.60,-1.435],[.60,-1.40],[.55,-1.385],[.53,-1.36],[.45,-1.33],[.34,-1.29],[.26,-1.22],[.17,-1.13],[.12,-1.08],[.11,-1.02],[.16,-.98],[.17,-.93],[.13,-.89],[.075,-.87],[.068,-.63],[.10,-.59],[.10,-.54]];
  const foot=add(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),96),gold);foot.scale.z=.72;
  for(const [r,y] of [[.63,-1.47],[.59,-1.40],[.52,-1.35],[.15,-.96],[.10,-.59]]) { const m=ring(r,.009,1,1,0,0,polished);m.rotation.x=Math.PI/2;m.position.y=y;m.scale.y=.72; }
  for(let i=0;i<32;i++) {
    const a=i/32*Math.PI*2;
    tube([[Math.cos(a)*.47,-1.33,Math.sin(a)*.34],[Math.cos(a)*.34,-1.28,Math.sin(a)*.25],[Math.cos(a)*.16,-1.12,Math.sin(a)*.115]],.004,polished);
  }
  for(let i=0;i<12;i++) {
    const a=i/12*Math.PI*2;
    add(new THREE.SphereGeometry(.011,8,6),polished,Math.cos(a)*.076,-.73,Math.sin(a)*.076).scale.y=10;
  }
  add(new THREE.SphereGeometry(.14,32,24),gold,0,-.72,0).scale.set(1,.57,1);
  for(let i=0;i<16;i++) {
    const a=i/16*Math.PI*2;
    add(new THREE.SphereGeometry(.018,8,6),polished,Math.cos(a)*.135,-.72,Math.sin(a)*.135);
  }
  // Cast oval case: depth and dark seams are visible at the sides.
  const center=.28;
  const back=add(new THREE.CylinderGeometry(.65,.65,.19,96),tarnish,0,center,-.025);back.rotation.x=Math.PI/2;back.scale.z=1.30;
  const fabric=add(new THREE.CircleGeometry(.626,100),new THREE.MeshStandardMaterial({map:velvet,bumpMap:velvet,bumpScale:.004,roughness:1}),0,center,.075);fabric.scale.y=1.30;
  ring(.637,.022,1,1.3,center,.105,tarnish);
  ring(.652,.037,1,1.3,center,.11);
  ring(.604,.013,1,1.3,center,.145,polished);
  ring(.711,.018,1,1.3,center,.082,polished);
  ring(.753,.030,1,1.3,center,.045);
  ring(.784,.009,1,1.3,center,.035,polished);
  for(let i=0;i<100;i++) {
    const a=i/100*Math.PI*2;
    add(new THREE.SphereGeometry(.013,8,6),polished,Math.cos(a)*.697,center+Math.sin(a)*.906,.106);
    const notch=add(new THREE.BoxGeometry(.013,.030,.015),tarnish,Math.cos(a)*.765,center+Math.sin(a)*.993,.06);notch.rotation.z=a-Math.PI/2;
  }
  // Hammered sunburst. Each ray has bevelled edges and a chased central ridge.
  for(let i=0;i<40;i++) {
    const a=i/40*Math.PI*2, length=i%2?.19:.35;
    const shape=new THREE.Shape();shape.moveTo(-.028,0);shape.quadraticCurveTo(-.026,length*.45,0,length);shape.quadraticCurveTo(.026,length*.45,.028,0);shape.closePath();
    const ray=add(new THREE.ExtrudeGeometry(shape,{depth:.017,bevelEnabled:true,bevelThickness:.003,bevelSize:.004,bevelSegments:2,steps:1,curveSegments:10}),gold,Math.cos(a)*.79,center+Math.sin(a)*1.025,-.05);
    ray.rotation.z=a-Math.PI/2;
    const ridge=new THREE.Mesh(new THREE.ConeGeometry(.008,length*.87,6),polished);ridge.position.set(0,length*.45,.028);ray.add(ridge);
  }
  // Symmetric foliage, with raised leaves and vein engraving.
  for(const side of [-1,1]) for(let i=0;i<4;i++) {
    const x=side*(.75+i*.016),y=center+(i-1.5)*.35;
    tube([[x,y-.13,.085],[x+side*.20,y-.03,.085],[x+side*.22,y+.10,.085],[x+side*.15,y+.12,.085],[x+side*.12,y+.06,.085]],.013);
    for(let j=0;j<2;j++) {
      const leaf=add(new THREE.SphereGeometry(.06,16,10),gold,x+side*(.13+j*.04),y+(j?.065:-.025),.085);
      leaf.scale.set(.48,1,.18);leaf.rotation.z=side*(j?-.65:.65);
      const vein=add(new THREE.BoxGeometry(.003,.06,.003),polished,leaf.position.x,leaf.position.y,.099);vein.rotation.z=leaf.rotation.z;
    }
  }
  // Faceted stones in real raised bezels and four small claws.
  for(const [x,y] of [[0,center+.965],[0,center-.965],[-.756,center],[.756,center]]) {
    const bezel=add(new THREE.TorusGeometry(.046,.010,8,24),gold,x,y,.10);bezel.scale.y=1.20;
    add(new THREE.IcosahedronGeometry(.044,1),ruby,x,y,.133).scale.set(.83,1.1,.55);
    for(let i=0;i<4;i++) {const a=i/4*Math.PI*2;add(new THREE.SphereGeometry(.007,8,6),polished,x+Math.cos(a)*.035,y+Math.sin(a)*.045,.158);}
  }
  // A small irregular, time-worn bone, rather than a stylised symmetrical icon.
  const bone = new THREE.Group();root.add(bone);bone.position.set(.015,.38,.19);bone.rotation.z=-.35;
  const vertices=[],uvs=[],indices=[],rows=42,segments=32;
  for(let row=0;row<=rows;row++) {
    const t=row/rows,y=(t-.5)*.52;
    const swelling=.025+.030*Math.exp(-(((t-.12)/.15)**2))+.020*Math.exp(-(((t-.88)/.12)**2));
    for(let i=0;i<=segments;i++) {
      const a=i/segments*Math.PI*2;
      const r=swelling*(1+.13*Math.sin(a*3+t*20)+.055*Math.cos(a*7+t*33));
      vertices.push(Math.cos(a)*r+.014*Math.sin(t*4),y,Math.sin(a)*r*.71);
      uvs.push(i/segments,t);
      if(row<rows&&i<segments) {const p=row*(segments+1)+i;indices.push(p,p+1,p+segments+1,p+1,p+segments+2,p+segments+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const boneMaterial=new THREE.MeshStandardMaterial({map:boneMap,bumpMap:boneMap,bumpScale:.003,roughness:.89});
  add(geometry,boneMaterial,0,0,0,bone);
  for(const [x,y,sx,sy] of [[.006,-.255,.039,.030],[.025,.25,.045,.033]]) add(new THREE.SphereGeometry(1,20,12),boneMaterial,x,y,0,bone).scale.set(sx,sy,.026);
  // Thin gold wire keeps the fragment suspended against the velvet.
  for(const y of [.20,.55]) tube([[-.23,y,.1],[-.07,y,.19],[.08,y,.19],[.23,y,.1]],.0024,polished);
  const glassMaterial=new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:0,roughness:.035,transmission:.15,thickness:.06,ior:1.52,clearcoat:1,clearcoatRoughness:.025,transparent:true,opacity:.17,depthWrite:false});
  const glass=add(new THREE.SphereGeometry(.606,80,48),glassMaterial,0,center,.13);glass.scale.set(1,1.3,.18);glass.castShadow=false;
  // Old handwritten slip, held by two tiny rivets.
  const labelMap=canvasTexture((ctx,size)=>{
    ctx.fillStyle='#cdb98b';ctx.fillRect(0,0,size,size);
    for(let i=0;i<16000;i++){ctx.fillStyle=i%2?'rgba(60,32,9,.05)':'rgba(255,248,215,.16)';ctx.fillRect(random()*size,random()*size,1,1);}
    ctx.fillStyle='#4f3b23';ctx.font='italic 51px Georgia';ctx.textAlign='center';ctx.fillText('Memento mori',size/2,size*.55);ctx.font='23px Georgia';ctx.fillText('MEMORIA · MMXXVI',size/2,size*.72);
  },true);
  add(new THREE.PlaneGeometry(.41,.13),new THREE.MeshStandardMaterial({map:labelMap,roughness:1}),0,-.17,.19);
  for(const x of [-.213,.213]) add(new THREE.SphereGeometry(.008,8,6),polished,x,-.17,.19);
  // Small engraved cross, finishing in trefoils.
  add(new THREE.BoxGeometry(.034,.28,.045),gold,0,1.64,-.03);
  add(new THREE.BoxGeometry(.19,.034,.045),gold,0,1.685,-.03);
  add(new THREE.BoxGeometry(.009,.225,.007),polished,0,1.65,-.003);
  for(const [x,y] of [[0,1.79],[-.105,1.685],[.105,1.685]]) {
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2;add(new THREE.SphereGeometry(.019,12,8),gold,x+Math.cos(a)*.014,y+Math.sin(a)*.014,-.027);}
  }
  root.rotation.y=-.16;
  return {root,textures};
}
