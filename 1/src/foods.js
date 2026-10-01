import * as THREE from 'three';
import { foodTexture } from './textures.js';

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
  group.position.set(-.5, .05, .4);
  const presentation = new THREE.Group(); presentation.add(group);
  presentation.rotation.z = -.65;
  presentation.rotation.y = -.45;
  presentation.scale.setScalar(1.12);
  return presentation;
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
  const arrangement = [[-.6, -.65, -.4, -.4], [.6, -.65, -.4, .45], [-.6, -.65, .4, -.25], [.6, -.65, .4, .25]];
  for (const [x, y, z, yaw] of arrangement) {
    const quarter = template.clone();
    quarter.scale.setScalar(.59);
    quarter.position.set(x, y, z);
    quarter.rotation.set(-Math.PI / 2, yaw, 0);
    group.add(quarter);
  }
  group.add(plate(1.4, -1.02));
  return group;
}

function appleTart(american = false) {
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
  if (american) {
    for (let axis = 0; axis < 2; axis++) {
      for (let band = -3; band <= 3; band++) {
        const offset = band * .27, limit = Math.sqrt(1.02 ** 2 - offset ** 2);
        const vertices = [], indices = [];
        for (let segment = 0; segment <= 32; segment++) {
          const along = -limit + segment / 32 * limit * 2;
          for (const side of [-1, 1]) {
            const cross = offset + side * .075;
            const x = axis ? cross : along, z = axis ? along : cross;
            const y = -.03 + .17 * Math.max(0, 1 - (x * x + z * z)) + axis * .022;
            vertices.push(x, y, z);
          }
          if (segment < 32) { const a = segment * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(vertices.flatMap((_, i) => i % 3 === 0 ? [(vertices[i] + 1) / 2, (vertices[i + 2] + 1) / 2] : []), 2));
        geometry.setIndex(indices); geometry.computeVertexNormals();
        const pastry = dough(); pastry.side = THREE.DoubleSide;
        group.add(mesh(geometry, pastry));
      }
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

function cider() {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: '#9ba663', roughness: .1, metalness: 0, transparent: true, opacity: .25, depthWrite: false, side: THREE.DoubleSide });
  const amber = new THREE.MeshPhysicalMaterial({ color: '#9e5d08', roughness: .22, clearcoat: .5 });
  const bottlePoints = [[0, -1], [.36, -1], [.43, -.94], [.44, -.75], [.44, .47], [.4, .61], [.2, .82], [.16, .94], [.16, 1.28], [.18, 1.3], [.18, 1.36], [.135, 1.36], [.135, .96], [.18, .8], [.36, .58], [.395, .43], [.395, -.91], [0, -.94]].map(([x, y]) => new THREE.Vector2(x, y));
  const bottle = mesh(new THREE.LatheGeometry(bottlePoints, 80), glass, [-.43, 0, 0]); group.add(bottle);
  group.add(mesh(new THREE.CylinderGeometry(.386, .386, 1.39, 64), amber, [-.43, -.23, 0]));
  group.add(mesh(new THREE.CylinderGeometry(.146, .146, .17, 24), new THREE.MeshStandardMaterial({ color: '#987044', roughness: 1 }), [-.43, 1.39, 0]));
  const labelCanvas = document.createElement('canvas'); labelCanvas.width = 1024; labelCanvas.height = 512;
  const ctx = labelCanvas.getContext('2d');
  ctx.fillStyle = '#f0ead6'; ctx.fillRect(0, 0, 1024, 512);
  ctx.textAlign = 'center'; ctx.fillStyle = '#3c5034';
  ctx.font = '600 84px Georgia'; ctx.fillText('pomme.', 768, 206);
  ctx.font = '26px sans-serif'; ctx.fillText('CIDRE', 768, 286);
  ctx.strokeStyle = '#a8b290'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(666, 322); ctx.lineTo(870, 322); ctx.stroke();
  const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
  const label = mesh(new THREE.CylinderGeometry(.449, .449, .68, 80, 1, true), new THREE.MeshStandardMaterial({ map: labelTexture, roughness: .9 }), [-.43, -.22, 0]);
  label.rotation.y = Math.PI / 2;
  group.add(label);
  const clearGlass = glass.clone(); clearGlass.color.set('#f1f0d8'); clearGlass.opacity = .24;
  const glassPoints = [[0, -.98], [.32, -.98], [.36, -.94], [.385, .05], [.365, .065], [.34, -.86], [0, -.89]].map(([x, y]) => new THREE.Vector2(x, y));
  group.add(mesh(new THREE.LatheGeometry(glassPoints, 64), clearGlass, [.65, 0, .35]));
  group.add(mesh(new THREE.CylinderGeometry(.347, .31, .68, 64), amber, [.65, -.53, .35]));
  for (let i = 0; i < 18; i++) {
    const angle = i * 2.4, radius = .08 + (i % 5) * .045;
    group.add(mesh(new THREE.SphereGeometry(.011 + (i % 3) * .004, 8, 6), new THREE.MeshBasicMaterial({ color: '#f5d889', transparent: true, opacity: .7 }), [.65 + Math.cos(angle) * radius, -.84 + (i % 7) * .095, .35 + Math.sin(angle) * radius]));
  }
  group.position.y = .04;
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

export function createFood(type, { appleGeometry, skinMaterial, skinMap }) {
  switch (type) {
    case 'quarter': return appleQuarters(skinMaterial);
    case 'baked': return bakedApple(appleGeometry, skinMap);
    case 'tart': return appleTart();
    case 'american': return appleTart(true);
    case 'compote': return compote();
    case 'cider': return cider();
    case 'dried': return driedApples();
    case 'fritter': return appleFritter();
    case 'sauce': return appleSauce();
    default: throw new Error(`Unknown food: ${type}`);
  }
}

export function foodFallback(type) {
  const frame = (body) => `<svg viewBox="0 0 260 260" aria-hidden="true">${body}</svg>`;
  if (type === 'quarter') return frame('<path d="M55 45C220 34 245 199 89 221Z" fill="#c7462e"/><path d="M55 45C201 46 222 185 89 208Z" fill="#f2dfa5"/><ellipse cx="91" cy="120" rx="6" ry="11" fill="#58371c"/>');
  if (type === 'tart' || type === 'american') return frame(`<ellipse cx="130" cy="171" rx="110" ry="40" fill="#e4e5d4"/><ellipse cx="130" cy="139" rx="102" ry="57" fill="#c58c41"/><ellipse cx="130" cy="128" rx="89" ry="43" fill="#dfb66d"/>${type === 'american' ? '<path d="m63 104 126 39m-141-21 126 39m-64-72 93 31m-118 31 74-65m-43 79 74-65m-11 64 51-45" stroke="#ae732b" stroke-width="12"/>' : '<path d="M61 128q30-42 50 0m-3 0q30-42 50 0m-3 0q30-42 50 0" fill="#f2d08d"/>'}`);
  if (type === 'compote') return frame('<path d="M28 116h204c-10 87-194 87-204 0" fill="#e6e6d4"/><ellipse cx="130" cy="116" rx="100" ry="35" fill="#d9b06b"/><path d="M76 119q50-35 97 0" fill="none" stroke="#ebcd96" stroke-width="8"/>');
  if (type === 'cider') return frame('<path d="M86 33h32v44l22 24v125H64V101l22-24Z" fill="#8f9e55"/><rect x="68" y="130" width="68" height="57" rx="3" fill="#f0ead6"/><text x="102" y="163" text-anchor="middle" fill="#3c5034" font-family="Georgia" font-size="15">cidre.</text><path d="M171 140h52l-5 85h-43Z" fill="#d4a13f"/>');
  if (type === 'dried') return frame('<ellipse cx="90" cy="135" rx="62" ry="42" fill="#c49b62"/><ellipse cx="90" cy="135" rx="12" ry="8" fill="#f5f4ec"/><ellipse cx="161" cy="160" rx="66" ry="43" fill="#d1ad77"/><ellipse cx="161" cy="160" rx="12" ry="8" fill="#f5f4ec"/>');
  if (type === 'fritter') return frame('<ellipse cx="130" cy="153" rx="104" ry="47" fill="#e6e6d4"/><ellipse cx="130" cy="134" rx="89" ry="57" fill="#b07b35"/><ellipse cx="130" cy="126" rx="83" ry="47" fill="#d5a65e"/><ellipse cx="130" cy="125" rx="27" ry="16" fill="#f5f4ec"/>');
  if (type === 'sauce') return frame('<path d="M19 108h199l-17 65c-39 45-119 28-150-9Z" fill="#e6e6d4"/><ellipse cx="123" cy="110" rx="86" ry="27" fill="#c5954f"/><path d="M210 108c60-30 47 86-15 44" fill="none" stroke="#e6e6d4" stroke-width="12"/>');
  return '<div class="fallback-apple"></div>';
}
