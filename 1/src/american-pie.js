import * as THREE from 'three';
import { foodTexture } from './textures.js';

const radius = 1.13, gap = .76;
function mesh(geometry, material, position = [0, 0, 0]) {
  const result = new THREE.Mesh(geometry, material); result.position.set(...position); return result;
}
function inSlice(x, z) { return Math.abs(Math.atan2(x, z)) < gap / 2; }
function dome(x, z) { return .12 * Math.max(0, 1 - (x * x + z * z) / radius ** 2); }

export function americanPie() {
  const group = new THREE.Group();
  const pastryTexture = foodTexture('pastry');
  const pastry = new THREE.MeshPhysicalMaterial({ map: pastryTexture, bumpMap: foodTexture('crumb'), bumpScale: .019, roughness: .61, clearcoat: .12 });
  const bakedEdge = pastry.clone(); bakedEdge.color.set('#cc9e68'); bakedEdge.roughness = .78;
  const appleMaterials = ['#f0dba8', '#e8c990', '#f1dfb9'].map(color => new THREE.MeshPhysicalMaterial({ color, map: foodTexture('flesh'), roughness: .55, clearcoat: .15 }));
  const filling = new THREE.MeshStandardMaterial({ color: '#bc7c39', roughness: .72 });
  const platePoints = [[0, -.51], [1.15, -.51], [1.52, -.47], [1.64, -.38], [1.64, -.34], [1.48, -.4], [0, -.45]].map(([x, y]) => new THREE.Vector2(x, y));
  group.add(mesh(new THREE.LatheGeometry(platePoints, 112), new THREE.MeshPhysicalMaterial({ color: '#cd5547', roughness: .29, clearcoat: .7 })));

  function sector(detached) {
    const piece = new THREE.Group();
    const start = detached ? -gap / 2 : gap / 2, length = detached ? gap : Math.PI * 2 - gap;
    const keep = (x, z) => inSlice(x, z) === detached;
    piece.add(mesh(new THREE.CylinderGeometry(1.10, 1.02, .22, 96, 1, false, start, length), pastry, [0, -.33, 0]));
    piece.add(mesh(new THREE.CylinderGeometry(1.065, 1.015, .23, 96, 1, false, start, length), filling, [0, -.105, 0]));
    const edgePoints = [[1.02, -.43], [1.16, -.37], [1.195, .08], [1.155, .17], [1.065, .12], [1.02, -.31]].map(([x, y]) => new THREE.Vector2(x, y));
    piece.add(mesh(new THREE.LatheGeometry(edgePoints, 96, start, length), bakedEdge));
    for (const angle of [start, start + length]) {
      const cut = mesh(new THREE.PlaneGeometry(1.06, .27), filling, [Math.sin(angle) * .53, -.14, Math.cos(angle) * .53]);
      cut.material = filling.clone(); cut.material.side = THREE.DoubleSide; cut.rotation.y = angle - Math.PI / 2; piece.add(cut);
      for (let layer = 0; layer < 4; layer++) {
        const line = mesh(new THREE.BoxGeometry(1.08, .013, .018), pastry, [Math.sin(angle) * .54, -.41 + layer * .016, Math.cos(angle) * .54]);
        line.rotation.y = angle - Math.PI / 2; piece.add(line);
      }
    }
    const chunkShape = new THREE.Shape();
    chunkShape.moveTo(-.21, 0); chunkShape.absarc(0, 0, .21, Math.PI, 0, true); chunkShape.lineTo(-.21, 0);
    const chunkGeometry = new THREE.ExtrudeGeometry(chunkShape, { depth: .052, bevelEnabled: true, bevelSize: .008, bevelThickness: .008, bevelSegments: 2, curveSegments: 16, steps: 1 });
    const chunkUVs = chunkGeometry.attributes.uv, chunkPoints = chunkGeometry.attributes.position;
    for (let i = 0; i < chunkUVs.count; i++) chunkUVs.setXY(i, (chunkPoints.getX(i) + .21) / .42, chunkPoints.getY(i) / .21);
    for (let i = 0; i < 135; i++) {
      const angle = i * 2.399963, r = Math.sqrt((i + .5) / 135) * 1.005;
      const x = Math.sin(angle) * r, z = Math.cos(angle) * r;
      if (!keep(x, z)) continue;
      const chunk = mesh(chunkGeometry, appleMaterials[i % 3], [x, .035 + dome(x, z) + (i % 3) * .009, z]);
      chunk.rotation.set(-Math.PI / 2 + Math.sin(i) * .12, 0, angle + .3); piece.add(chunk);
    }
    for (let axis = 0; axis < 2; axis++) {
      for (let band = -2; band <= 2; band++) {
        const offset = band * .42, vertices = [], uvs = [], indices = [], segments = 100;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments * 2 - 1;
          for (const bottom of [false, true]) {
            for (const side of [-1, 1]) {
              const cross = offset + side * (.112 + .008 * Math.sin(i * .57 + band));
              const along = t * Math.sqrt(Math.max(0, radius ** 2 - cross ** 2));
              const x = axis ? cross : along, z = axis ? along : cross;
              const weave = .044 * Math.cos(along / .42 * Math.PI) * (band % 2 ? -1 : 1) * (axis ? -1 : 1);
              const y = .205 + dome(x, z) + weave + .005 * Math.sin(i * 1.8) - (bottom ? .075 : 0);
              vertices.push(x, y, z); uvs.push((x + radius) / (2 * radius), (z + radius) / (2 * radius));
            }
          }
        }
        for (let i = 0; i < segments; i++) {
          const a = i * 4;
          const samples = [a, a + 1, a + 4, a + 5];
          if (!samples.every(j => keep(vertices[j * 3], vertices[j * 3 + 2]))) continue;
          indices.push(a, a + 4, a + 1, a + 1, a + 4, a + 5);
          indices.push(a + 2, a + 3, a + 6, a + 3, a + 7, a + 6);
          indices.push(a, a + 2, a + 4, a + 2, a + 6, a + 4);
          indices.push(a + 1, a + 5, a + 3, a + 3, a + 5, a + 7);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices); geometry.computeVertexNormals();
        const ribbonMaterial = pastry.clone(); ribbonMaterial.side = THREE.DoubleSide;
        piece.add(mesh(geometry, ribbonMaterial));
      }
    }
    const crimps = Math.round(length / (Math.PI * 2) * 50);
    for (let i = 0; i <= crimps; i++) {
      const angle = start + i / crimps * length;
      const fold = mesh(new THREE.SphereGeometry(.10, 12, 8), i % 4 ? pastry : bakedEdge, [Math.sin(angle) * 1.145, .14 + .025 * Math.sin(i * 2.3), Math.cos(angle) * 1.145]);
      fold.scale.set(.72 + (i % 3) * .13, .5 + (i % 4) * .1, 1.12); fold.rotation.set(Math.sin(i) * .25, angle, Math.cos(i * 3) * .25); piece.add(fold);
    }
    const crumbs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 4, 3), new THREE.MeshStandardMaterial({ color: '#f0cf8c', roughness: .9 }), 160);
    const transform = new THREE.Object3D(); let count = 0;
    for (let i = 0; i < 2000 && count < 160; i++) {
      const x = Math.sin(i * 7.11) * 1.09, z = Math.cos(i * 3.71) * 1.09;
      if (x * x + z * z > 1.11 ** 2 || !keep(x, z)) continue;
      if (![x, z].some(v => Math.abs(v / .42 - Math.round(v / .42)) * .42 < .09)) continue;
      transform.position.set(x, .245 + dome(x, z), z);
      transform.scale.set(.005 + (i % 5) * .0015, .002, .004 + (i % 4) * .0015); transform.rotation.y = i; transform.updateMatrix(); crumbs.setMatrixAt(count++, transform.matrix);
    }
    crumbs.count = count; piece.add(crumbs);
    return piece;
  }
  group.add(sector(false));
  const slice = sector(true); slice.position.set(.13, -.015, .38); slice.rotation.y = .06; group.add(slice);
  for (let i = 0; i < 35; i++) {
    const angle = i * 2.4, r = 1.23 + (i % 5) * .047;
    const crumb = mesh(new THREE.SphereGeometry(.018, 4, 3), pastry, [Math.sin(angle) * r, -.405, Math.cos(angle) * r]);
    crumb.scale.set(1.4, .35, 1); group.add(crumb);
  }
  group.position.y = .14;
  return group;
}
