import * as THREE from 'three';
import { foodTexture } from './textures.js';
import { appleJuice, cider } from './packaging.js';
import { americanPie } from './american-pie.js';

const textureCache = new Map();
function textureFor(kind) {
  if (!textureCache.has(kind)) textureCache.set(kind, foodTexture(kind));
  return textureCache.get(kind);
}
const ceramic = () => new THREE.MeshPhysicalMaterial({ color: '#f1efdf', roughness: .28, clearcoat: .4 });
const dough = () => new THREE.MeshStandardMaterial({ map: textureFor('crust'), bumpMap: textureFor('crumb'), bumpScale: .025, roughness: .85 });
const flesh = () => new THREE.MeshStandardMaterial({ map: textureFor('flesh'), roughness: .68, side: THREE.DoubleSide });

function mesh(geometry, material, position = [0, 0, 0]) {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(...position);
  return result;
}

function plate(radius = 1.28, height = -.7) {
  const points = [[0, 0], [.65 * radius, 0], [.88 * radius, .025], [radius, .11], [radius, .145], [.88 * radius, .06], [0, .035]].map(([x, y]) => new THREE.Vector2(x, y));
  return mesh(new THREE.LatheGeometry(points, 96), ceramic(), [0, height, 0]);
}

function quarterGeometry(skin) {
  const rows = 70, cols = 42;
  const positions = [], indices = [], uvs = [];
  const start = -Math.PI / 2, end = 0;
  const profile = (phi) => ({
    radius: Math.pow(Math.sin(phi), .96) * 1.14 * (1 + .17 * Math.cos(phi)),
    y: 1.12 * Math.cos(phi) - .28 * Math.exp(-phi * phi / .12) + .085 * Math.exp(-Math.pow(Math.PI - phi, 2) / .07),
  });
  for (let row = 0; row <= rows; row++) {
    const phi = row / rows * Math.PI;
    const { radius, y } = profile(phi);
    for (let col = 0; col <= cols; col++) {
      const theta = start + col / cols * (end - start);
      positions.push(radius * Math.cos(theta), y, radius * Math.sin(theta) * .94);
      uvs.push(col / cols / 4, 1 - row / rows);
      if (row < rows && col < cols) { const a = row * (cols + 1) + col, b = a + cols + 1; indices.push(a, a + 1, b, a + 1, b + 1, b); }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const group = new THREE.Group();
  group.add(mesh(geometry, skin));
  for (const theta of [start, end]) {
    const p = [], index = [], cutUVs = [];
    for (let row = 0; row <= rows; row++) {
      const { radius, y } = profile(row / rows * Math.PI);
      for (let col = 0; col <= 10; col++) {
        const r = radius * col / 10;
        p.push(r * Math.cos(theta), y, r * Math.sin(theta) * .94);
        cutUVs.push(col / 10, row / rows);
        if (row < rows && col < 10) { const a = row * 11 + col; index.push(a, a + 1, a + 11, a + 1, a + 12, a + 11); }
      }
    }
    const cut = new THREE.BufferGeometry();
    cut.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); cut.setIndex(index); cut.computeVertexNormals();
    cut.setAttribute('uv', new THREE.Float32BufferAttribute(cutUVs, 2));
    group.add(mesh(cut, flesh()));
  }
  const core = mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshStandardMaterial({ color: '#ddc68e', roughness: .85 }), [.09, -.1, .007]);
  core.scale.set(.085, .38, .014); group.add(core);
  for (const y of [-.24, .05]) {
    const seed = mesh(new THREE.SphereGeometry(1, 20, 16), new THREE.MeshStandardMaterial({ color: '#4e2c17', roughness: .4 }), [.21, y, .027]);
    seed.scale.set(.047, .084, .021); seed.rotation.z = -.4; group.add(seed);
  }
  return group;
}

function bakedApple(geometry, skinMap) {
  const group = new THREE.Group();
  const wrinkled = geometry.clone();
  const points = wrinkled.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
    const theta = Math.atan2(z, x);
    const wrinkle = 1 + .009 * Math.sin(theta * 27 + Math.sin(y * 3) * 2) + .004 * Math.sin(theta * 13 + y * 11);
    points.setXYZ(i, x * wrinkle * .92, y * .87, z * wrinkle * .92);
  }
  wrinkled.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({ color: '#935025', map: skinMap, roughness: .82, clearcoat: .25, clearcoatRoughness: .55 });
  group.add(mesh(wrinkled, material, [0, .03, 0]));
  const filling = mesh(new THREE.CylinderGeometry(.24, .21, .07, 36), new THREE.MeshStandardMaterial({ color: '#623015', roughness: .9 }), [0, .765, 0]);
  group.add(filling);
  const cinnamon = mesh(new THREE.CylinderGeometry(.036, .045, .58, 12), new THREE.MeshStandardMaterial({ color: '#71401e', roughness: .9 }), [.02, .93, 0]);
  cinnamon.rotation.z = -.3; group.add(cinnamon);
  group.add(plate(1.32, -.94));
  for (let i = 0; i < 3; i++) {
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 10 }, (_, j) => new THREE.Vector3((i - 1) * .3 + Math.sin(j * .65 + i) * .045, 1.04 + j * .055, -.05)));
    group.add(mesh(new THREE.TubeGeometry(curve, 30, .012, 5, false), new THREE.MeshBasicMaterial({ color: '#9da58e', transparent: true, opacity: .19 })));
  }
  return group;
}

function appleQuarters(skin) {
  const group = new THREE.Group();
  const template = quarterGeometry(skin);
  // Uneven spacing and small overlaps, with each wedge resting on a cut face.
  const arrangement = [
    { x: -.43, z: .43, yaw: -.42, scale: .56, lift: 0 },
    { x: .35, z: .50, yaw: .12, scale: .53, lift: .07 },
    { x: .30, z: -.26, yaw: .78, scale: .58, lift: 0 },
    { x: -.47, z: -.30, yaw: -.82, scale: .54, lift: .025 },
  ];
  for (const { x, z, yaw, scale, lift } of arrangement) {
    const quarter = template.clone();
    quarter.scale.setScalar(scale);
    quarter.position.set(x, -.665 + lift, z);
    quarter.rotation.set(0, yaw, Math.PI / 2);
    group.add(quarter);
  }
  group.add(plate(1.4, -.7));
  group.position.y = .4;
  return group;
}

function appleTart() {
  const group = new THREE.Group();
  group.add(plate(1.34, -.62));
  group.add(mesh(new THREE.CylinderGeometry(1.12, 1.02, .28, 96), dough(), [0, -.42, 0]));
  group.add(mesh(new THREE.CylinderGeometry(1.03, 1.01, .08, 96), new THREE.MeshStandardMaterial({ color: '#b27a35', roughness: .55 }), [0, -.235, 0]));
  const rim = mesh(new THREE.TorusGeometry(1.08, .09, 16, 96), dough(), [0, -.245, 0]);
  rim.rotation.x = Math.PI / 2; group.add(rim);
  for (let i = 0; i < 48; i++) {
    const angle = i / 48 * Math.PI * 2;
    const crimp = mesh(new THREE.SphereGeometry(.087, 12, 8), dough(), [Math.cos(angle) * 1.087, -.22, Math.sin(angle) * 1.087]);
    crimp.scale.set(1, .52, 1); group.add(crimp);
  }
  const sliceShape = new THREE.Shape();
  sliceShape.moveTo(-.31, 0); sliceShape.absarc(0, 0, .31, Math.PI, 0, true); sliceShape.lineTo(-.31, 0);
  const sliceGeometry = new THREE.ExtrudeGeometry(sliceShape, { depth: .023, bevelEnabled: true, bevelSegments: 2, bevelSize: .005, bevelThickness: .005, steps: 1, curveSegments: 24 });
  const sliceUVs = sliceGeometry.attributes.uv, slicePositions = sliceGeometry.attributes.position;
  for (let i = 0; i < sliceUVs.count; i++) sliceUVs.setXY(i, (slicePositions.getX(i) + .31) / .62, slicePositions.getY(i) / .31);
  const sliceMaterials = ['#efe4c8', '#e2c995', '#eee0b6'].map((color) => new THREE.MeshPhysicalMaterial({ color, map: textureFor('flesh'), bumpMap: textureFor('grain'), bumpScale: .004, roughness: .53, clearcoat: .16 }));
  const skinCurve = new THREE.CatmullRomCurve3(Array.from({ length: 33 }, (_, i) => {
    const angle = Math.PI - i / 32 * Math.PI;
    return new THREE.Vector3(Math.cos(angle) * .311, Math.sin(angle) * .311, .025);
  }));
  const skinGeometry = new THREE.TubeGeometry(skinCurve, 40, .005, 6, false);
  const skinMaterial = new THREE.MeshPhysicalMaterial({ color: '#9f2d1b', roughness: .5, clearcoat: .15 });
  for (const [radius, count] of [[.77, 30], [.56, 24], [.35, 17], [.14, 9], [.015, 5]]) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2;
      const petal = new THREE.Group();
      const slice = mesh(sliceGeometry, sliceMaterials[i % 3]);
      const lamella = new THREE.Group();
      lamella.add(slice, mesh(skinGeometry, skinMaterial));
      lamella.rotation.y = .24;
      petal.add(lamella);
      if (radius < .1) petal.scale.setScalar(.5);
      petal.position.set(Math.cos(angle) * radius, -.17 + (1 - radius) * .17 + (i % 3) * .001, Math.sin(angle) * radius);
      petal.rotation.set(-Math.PI / 2 + .22, 0, -angle - Math.PI / 2 + .22);
      group.add(petal);
    }
  }
  group.position.y = .1;
  group.scale.setScalar(1.13);
  return group;
}

function compote() {
  const group = new THREE.Group();
  const bowlPoints = [[0, -.73], [.42, -.73], [.68, -.55], [.91, -.06], [.91, .02], [.85, .045], [.8, -.1], [.59, -.53], [0, -.6]].map(([x, y]) => new THREE.Vector2(x, y));
  group.add(mesh(new THREE.LatheGeometry(bowlPoints, 96), ceramic()));
  const puree = new THREE.MeshPhysicalMaterial({ map: textureFor('puree'), bumpMap: textureFor('grain'), bumpScale: .008, roughness: .87, clearcoat: .08 });
  group.add(mesh(new THREE.CylinderGeometry(.835, .67, .27, 80), puree, [0, -.135, 0]));
  const surface = mesh(new THREE.SphereGeometry(.83, 64, 32), puree, [0, -.005, 0]);
  surface.scale.y = .11; group.add(surface);
  const swirl = new THREE.CatmullRomCurve3(Array.from({ length: 90 }, (_, i) => {
    const t = i / 89, radius = .58 * (1 - t), angle = t * Math.PI * 5;
    return new THREE.Vector3(Math.cos(angle) * radius, .07 + t * .03, Math.sin(angle) * radius);
  }));
  group.add(mesh(new THREE.TubeGeometry(swirl, 120, .035, 8, false), new THREE.MeshStandardMaterial({ color: '#e0bd7d', roughness: .8 })));
  const silver = new THREE.MeshStandardMaterial({ color: '#c7ccbf', metalness: .82, roughness: .24 });
  const spoonHead = mesh(new THREE.SphereGeometry(1, 24, 16), silver, [.32, -.085, .05]);
  spoonHead.scale.set(.13, .02, .22); spoonHead.rotation.y = -.9; group.add(spoonHead);
  const handleCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(.32, -.09, .05), new THREE.Vector3(.46, .065, .10), new THREE.Vector3(.68, .31, .17), new THREE.Vector3(.96, .65, .24)]);
  const handle = mesh(new THREE.TubeGeometry(handleCurve, 32, .027, 10, false), silver); group.add(handle);
  group.scale.setScalar(1.3);
  group.position.y = -.06;
  return group;
}

function driedApples() {
  const group = new THREE.Group();
  const driedMaterial = new THREE.MeshStandardMaterial({ map: textureFor('dried'), bumpMap: textureFor('grain'), bumpScale: .018, roughness: .95, side: THREE.DoubleSide });
  const positions = [], uvs = [], indices = [];
  const segments = 96, rings = 10;
  for (let row = 0; row <= rings; row++) {
    const t = row / rings;
    for (let i = 0; i <= segments; i++) {
      const angle = i / segments * Math.PI * 2;
      const inner = .085 + .023 * Math.cos(angle * 5);
      const outer = .5 + .035 * Math.sin(angle * 8 + .6);
      const radius = THREE.MathUtils.lerp(inner, outer, t);
      positions.push(radius * Math.cos(angle), .033 * Math.sin(angle * 7) * t + .07 * t * t, radius * Math.sin(angle));
      uvs.push(.5 + radius * Math.cos(angle), .5 + radius * Math.sin(angle));
      if (row < rings && i < segments) { const a = row * (segments + 1) + i; indices.push(a, a + 1, a + segments + 1, a + 1, a + segments + 2, a + segments + 1); }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const peelCurve = new THREE.CatmullRomCurve3(Array.from({ length: 97 }, (_, i) => {
    const a = i / 96 * Math.PI * 2, r = .5 + .035 * Math.sin(a * 8 + .6);
    return new THREE.Vector3(r * Math.cos(a), .033 * Math.sin(a * 7) + .07, r * Math.sin(a));
  }));
  const peelGeometry = new THREE.TubeGeometry(peelCurve, 96, .009, 5, false);
  const peelMaterial = new THREE.MeshStandardMaterial({ color: '#90492b', roughness: .9 });
  const arrangement = [[-.5, -.35, .3, -.12], [.42, -.32, .4, .06], [-.45, -.28, -.38, .11], [.4, -.23, -.37, -.08], [.02, -.14, .03, .17]];
  for (const [x, y, z, tilt] of arrangement) {
    const slice = new THREE.Group(); slice.add(mesh(geometry, driedMaterial), mesh(peelGeometry, peelMaterial));
    slice.position.set(x, y, z); slice.rotation.set(tilt, x * 3, tilt); group.add(slice);
  }
  group.add(plate(1.32, -.5));
  group.scale.setScalar(1.13);
  return group;
}

function appleFritter() {
  const group = new THREE.Group();
  const geometry = new THREE.TorusGeometry(.66, .24, 40, 112);
  const points = geometry.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
    const lump = 1 + .012 * Math.sin(x * 31 + y * 24) + .009 * Math.cos(y * 42 + z * 16);
    points.setXYZ(i, x * lump, y * lump, z * lump);
  }
  geometry.computeVertexNormals();
  const fritter = mesh(geometry, new THREE.MeshPhysicalMaterial({ map: textureFor('crumb'), bumpMap: textureFor('grain'), bumpScale: .025, roughness: .77, clearcoat: .08 }), [0, -.13, 0]);
  fritter.rotation.x = Math.PI / 2; group.add(fritter);
  const sugar = new THREE.InstancedMesh(new THREE.SphereGeometry(.009, 5, 4), new THREE.MeshStandardMaterial({ color: '#f3e9d3', roughness: 1 }), 700);
  const transform = new THREE.Object3D();
  for (let i = 0; i < 700; i++) {
    const theta = i * 2.39996, phi = ((i * .618034) % 1) * Math.PI;
    const radius = .66 + .242 * Math.cos(phi);
    transform.position.set(radius * Math.cos(theta), -.13 + .243 * Math.sin(phi), radius * Math.sin(theta));
    transform.scale.setScalar(.6 + (i % 7) * .12); transform.updateMatrix(); sugar.setMatrixAt(i, transform.matrix);
  }
  group.add(sugar, plate(1.26, -.43));
  group.scale.setScalar(1.18);
  return group;
}

function appleSauce() {
  const group = new THREE.Group();
  const profile = [[0, -.63], [.44, -.63], [.69, -.44], [.86, -.03], [.9, .1], [.86, .14], [.8, -.01], [.6, -.44], [0, -.52]].map(([x, y]) => new THREE.Vector2(x, y));
  const geometry = new THREE.LatheGeometry(profile, 96);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const spout = Math.max(0, -x - .55) * Math.max(0, (y + .1) / .24);
    positions.setXYZ(i, x * 1.35 - spout * .6, y + spout * .16, z * .72);
  }
  geometry.computeVertexNormals(); group.add(mesh(geometry, ceramic()));
  const sauceMaterial = new THREE.MeshPhysicalMaterial({ map: textureFor('sauce'), bumpMap: textureFor('grain'), bumpScale: .004, roughness: .4, clearcoat: .28 });
  const sauce = mesh(new THREE.CylinderGeometry(.81, .65, .19, 80), sauceMaterial, [0, -.065, 0]);
  sauce.scale.set(1.33, 1, .72); group.add(sauce);
  const handle = mesh(new THREE.TorusGeometry(.255, .047, 16, 48), ceramic(), [1.15, -.11, 0]);
  handle.scale.y = 1.15; group.add(handle);
  group.add(plate(1.38, -.71));
  group.position.y = .06;
  return group;
}

function boudinApples() {
  const group = new THREE.Group();
  group.add(plate(1.4, -.57));
  const casing = new THREE.MeshPhysicalMaterial({ map: textureFor('boudin'), bumpMap: textureFor('grain'), bumpScale: .008, roughness: .48, clearcoat: .3 });
  const filling = new THREE.MeshStandardMaterial({ map: textureFor('cutBoudin'), bumpMap: textureFor('grain'), bumpScale: .025, roughness: .95 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.69, -.30, -.68), new THREE.Vector3(-.86, -.30, -.31),
    new THREE.Vector3(-.77, -.30, .12), new THREE.Vector3(-.47, -.30, .43),
  ]);
  const sausageGeometry = new THREE.TubeGeometry(curve, 80, .215, 32, false);
  const p = sausageGeometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    p.setY(i, y + .003 * Math.sin(x * 63 + z * 34));
  }
  sausageGeometry.computeVertexNormals();
  group.add(mesh(sausageGeometry, casing));
  const capGeometry = new THREE.CircleGeometry(.213, 48);
  const endPosition = curve.getPoint(1), endDirection = curve.getTangent(1);
  const end = mesh(capGeometry, filling, endPosition.toArray());
  end.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), endDirection); group.add(end);
  const tip = mesh(new THREE.SphereGeometry(.215, 32, 20), casing, curve.getPoint(0).toArray());
  tip.scale.set(1, .98, .72); group.add(tip);
  for (const [x, z, yaw] of [[-.33, .73, -.3], [-.05, .86, .18]]) {
    const slice = mesh(new THREE.CylinderGeometry(.216, .215, .095, 48), [casing, filling, filling], [x, -.4, z]);
    slice.rotation.set(.12, yaw, .05); group.add(slice);
  }
  const shape = new THREE.Shape();
  shape.moveTo(-.42, 0); shape.quadraticCurveTo(0, .48, .42, 0); shape.quadraticCurveTo(.05, .17, -.42, 0);
  const wedgeGeometry = new THREE.ExtrudeGeometry(shape, { depth: .11, bevelEnabled: true, bevelSize: .028, bevelThickness: .027, bevelSegments: 3, curveSegments: 32 });
  const golden = ['#d6a251', '#e0b468', '#c89143'].map(color => new THREE.MeshPhysicalMaterial({ color, map: textureFor('flesh'), bumpMap: textureFor('grain'), bumpScale: .006, roughness: .53, clearcoat: .2 }));
  const peelCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.42, 0, .115), new THREE.Vector3(0, .48, .115), new THREE.Vector3(.42, 0, .115));
  const peel = new THREE.TubeGeometry(peelCurve, 40, .018, 8, false);
  const caramel = new THREE.MeshStandardMaterial({ color: '#8b4825', roughness: .6 });
  const arrangement = [[.32, -.58, -.2], [.68, -.24, -.75], [.62, .2, -.9], [.48, .50, -1.1], [.12, .33, -.5]];
  arrangement.forEach(([x, z, yaw], i) => {
    const wedge = new THREE.Group();
    wedge.add(mesh(wedgeGeometry, golden[i % golden.length]), mesh(peel, caramel));
    wedge.rotation.set(-Math.PI / 2, 0, yaw);
    wedge.position.set(x, -.455 + (i % 2) * .035, z); group.add(wedge);
  });
  const herb = new THREE.MeshStandardMaterial({ color: '#77875c', roughness: .9, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const leaf = mesh(new THREE.SphereGeometry(1, 24, 16), herb, [.35 + i * .09, -.27 + i * .025, -.1 - i * .07]);
    leaf.scale.set(.08, .008, .2); leaf.rotation.y = -.5 + i * .65; group.add(leaf);
  }
  group.position.y = .23;
  return group;
}

export function createFood(type, { appleGeometry, skinMaterial, skinMap }) {
  switch (type) {
    case 'quarter': return appleQuarters(skinMaterial);
    case 'baked': return bakedApple(appleGeometry, skinMap);
    case 'tart': return appleTart();
    case 'american': return americanPie();
    case 'compote': return compote();
    case 'juice': return appleJuice();
    case 'cider': return cider();
    case 'dried': return driedApples();
    case 'fritter': return appleFritter();
    case 'sauce': return appleSauce();
    case 'boudin': return boudinApples();
    default: throw new Error(`Unknown food: ${type}`);
  }
}

export function foodFallback(type) {
  const frame = (body) => `<svg viewBox="0 0 260 260" aria-hidden="true">${body}</svg>`;
  if (type === 'boudin') return frame('<ellipse cx="130" cy="153" rx="116" ry="69" fill="#e8e5d7"/><ellipse cx="130" cy="146" rx="101" ry="55" fill="#f4f0e2"/><path d="M91 104c-42 20-42 59 5 72" fill="none" stroke="#302421" stroke-width="32" stroke-linecap="round"/><path d="M89 102c-31 19-36 48-4 63" fill="none" stroke="#62514a" stroke-width="3"/><g fill="#ddb069" stroke="#a96930" stroke-width="2"><path d="M129 94q59 1 69 33-33-16-69-33Z"/><path d="M139 118q65 0 67 30-38-13-67-30Z"/><path d="M132 147q64 3 66 32-31-10-66-32Z"/></g><ellipse cx="109" cy="189" rx="17" ry="10" fill="#302421"/><ellipse cx="109" cy="186" rx="16" ry="8" fill="#514038"/><path d="M139 155q-19-14-21-3 9 11 21 3Z" fill="#7b8d5e"/>');
  if (type === 'quarter') return frame('<path d="M55 45C220 34 245 199 89 221Z" fill="#c7462e"/><path d="M55 45C201 46 222 185 89 208Z" fill="#f2dfa5"/><ellipse cx="91" cy="120" rx="6" ry="11" fill="#58371c"/>');
  if (type === 'tart') return frame('<ellipse cx="130" cy="171" rx="110" ry="40" fill="#e4e5d4"/><ellipse cx="130" cy="139" rx="102" ry="57" fill="#c58c41"/><ellipse cx="130" cy="128" rx="89" ry="43" fill="#dfb66d"/><path d="M61 128q30-42 50 0m-3 0q30-42 50 0m-3 0q30-42 50 0" fill="#f2d08d"/>');
  if (type === 'american') return frame('<ellipse cx="130" cy="183" rx="117" ry="44" fill="#cd5547"/><ellipse cx="130" cy="149" rx="102" ry="59" fill="#aa6528"/><ellipse cx="130" cy="133" rx="102" ry="56" fill="#e8c189"/><path d="m48 119 148 39m-153-15 137 40m-95-91 128 34m-153 37 87-79m-48 93 92-85m-45 87 69-63" stroke="#ce9240" stroke-width="13"/><path d="m130 133-18 71 65-9Z" fill="#cd5547"/><path d="m139 157-17 54 57-8v-15Z" fill="#ad6c2d"/><path d="m139 153-17 44 57-9Z" fill="#dfaa5e"/><path d="m134 168 25 4m-28 9 37-5" stroke="#f2d6a0" stroke-width="8"/>');
  if (type === 'compote') return frame('<path d="M28 116h204c-10 87-194 87-204 0" fill="#e6e6d4"/><ellipse cx="130" cy="116" rx="100" ry="35" fill="#d9b06b"/><path d="M76 119q50-35 97 0" fill="none" stroke="#ebcd96" stroke-width="8"/>');
  if (type === 'juice') return frame('<path d="m185 41 16 8v179l-16 5Z" fill="#dddfd0"/><rect x="76" y="37" width="111" height="196" rx="6" fill="#f9f9f1"/><g fill="#db2430"><circle cx="89" cy="52" r="5"/><circle cx="173" cy="64" r="5"/><circle cx="86" cy="109" r="5"/><circle cx="171" cy="130" r="5"/><circle cx="87" cy="178" r="5"/><circle cx="171" cy="185" r="5"/></g><g fill="#62a75b"><ellipse cx="104" cy="76" rx="4" ry="7"/><ellipse cx="174" cy="99" rx="4" ry="7"/><ellipse cx="91" cy="153" rx="4" ry="7"/></g><circle cx="131" cy="84" r="25" fill="#009447"/><text x="131" y="88" text-anchor="middle" fill="white" font-family="Georgia" font-size="11">pomme.</text><path d="M130 132c-39-20-43 56-2 49 41 14 47-65 2-49Z" fill="#bb3c2b"/><path d="m133 131 2-15" stroke="#795332" stroke-width="3"/><rect x="76" y="197" width="111" height="36" fill="#50b35a"/><text x="131" y="213" text-anchor="middle" fill="white" font-size="9">PUR JUS DE POMME</text><text x="131" y="226" text-anchor="middle" fill="#e5e842" font-size="8">100 % pur fruit pressé</text>');
  if (type === 'cider') return frame('<path d="M120 28h22v53c0 29 25 42 25 72v74q0 13-12 13h-49q-12 0-12-13v-74c0-30 26-43 26-72Z" fill="#24420f"/><path d="M124 60v37c0 24-20 43-20 70" stroke="#789954" stroke-width="4" opacity=".6"/><rect x="117" y="34" width="28" height="12" fill="#172319"/><rect x="121" y="21" width="21" height="16" rx="3" fill="#b99158"/><path d="m121 22-5 27h30l-5-27" fill="none" stroke="#879080"/><circle cx="131" cy="110" r="10" fill="#a73837"/><rect x="99" y="164" width="63" height="68" rx="3" fill="#f8f5e8"/><text x="130" y="192" text-anchor="middle" fill="#2d3626" font-family="Georgia" font-style="italic" font-size="20">Cidre</text><text x="130" y="211" text-anchor="middle" fill="#2d3626" font-family="Georgia" font-size="8">DE NOS VERGERS</text><text x="130" y="224" text-anchor="middle" fill="#2d3626" font-size="9">BRUT</text>');
  if (type === 'dried') return frame('<ellipse cx="90" cy="135" rx="62" ry="42" fill="#c49b62"/><ellipse cx="90" cy="135" rx="12" ry="8" fill="#f5f4ec"/><ellipse cx="161" cy="160" rx="66" ry="43" fill="#d1ad77"/><ellipse cx="161" cy="160" rx="12" ry="8" fill="#f5f4ec"/>');
  if (type === 'fritter') return frame('<ellipse cx="130" cy="153" rx="104" ry="47" fill="#e6e6d4"/><ellipse cx="130" cy="134" rx="89" ry="57" fill="#b07b35"/><ellipse cx="130" cy="126" rx="83" ry="47" fill="#d5a65e"/><ellipse cx="130" cy="125" rx="27" ry="16" fill="#f5f4ec"/>');
  if (type === 'sauce') return frame('<path d="M19 108h199l-17 65c-39 45-119 28-150-9Z" fill="#e6e6d4"/><ellipse cx="123" cy="110" rx="86" ry="27" fill="#c5954f"/><path d="M210 108c60-30 47 86-15 44" fill="none" stroke="#e6e6d4" stroke-width="12"/>');
  return '<div class="fallback-apple"></div>';
}
