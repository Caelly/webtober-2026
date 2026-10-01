import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { appleSkin, foodTexture } from './textures.js';

function texture(canvas) {
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  result.anisotropy = 8;
  return result;
}
function mesh(geometry, material, position = [0, 0, 0]) {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(...position);
  return result;
}
function applePath(ctx) {
  ctx.beginPath(); ctx.moveTo(0, -.7);
  ctx.bezierCurveTo(-.85, -1.2, -1.2, -.3, -.72, .6);
  ctx.bezierCurveTo(-.44, 1.12, -.15, .95, 0, .9);
  ctx.bezierCurveTo(.42, 1.13, .76, .88, .95, .24);
  ctx.bezierCurveTo(1.23, -.68, .57, -1.04, 0, -.7);
  ctx.closePath();
}
function leaf(ctx, x, y, size, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(size, size);
  ctx.beginPath(); ctx.moveTo(-1, 0); ctx.bezierCurveTo(-.4, -1, .6, -.65, 1, 0); ctx.bezierCurveTo(.4, .8, -.6, .7, -1, 0);
  ctx.fillStyle = '#6aaf5d'; ctx.fill(); ctx.strokeStyle = '#213b21'; ctx.lineWidth = .09; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(1, 0);
  for (let t = -.5; t < .8; t += .35) { ctx.moveTo(t, 0); ctx.lineTo(t - .2, -.35); ctx.moveTo(t, 0); ctx.lineTo(t - .25, .35); }
  ctx.stroke(); ctx.restore();
}

export function appleJuice() {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fafaf3'; ctx.fillRect(0, 0, 768, 1024);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 35 + col * 139 + (row % 2) * 32, y = 42 + row * 113;
      if ((x > 185 && x < 565 && y > 90 && y < 365) || (x > 210 && x < 570 && y > 420 && y < 835)) continue;
      if ((row + col) % 2) leaf(ctx, x, y, 27, .6 + row * .4);
      else {
        ctx.save(); ctx.translate(x, y); ctx.rotate((row - col) * .14); ctx.scale(29, 29);
        applePath(ctx); ctx.fillStyle = '#de1f2c'; ctx.fill(); ctx.strokeStyle = '#203623'; ctx.lineWidth = .065; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -.68); ctx.lineTo(.14, -1.13); ctx.stroke(); ctx.restore();
        leaf(ctx, x + 16, y - 32, 12, -.6);
      }
    }
  }
  ctx.save(); ctx.translate(384, 239); ctx.scale(146, 146); applePath(ctx); ctx.fillStyle = '#009447'; ctx.fill(); ctx.restore();
  leaf(ctx, 388, 86, 49, .75);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = '600 72px Georgia'; ctx.fillText('pomme.', 384, 261);
  const skin = appleSkin('red');
  ctx.save(); ctx.translate(384, 604); ctx.scale(168, 168); applePath(ctx); ctx.clip();
  ctx.drawImage(skin.image, -.95, -.97, 1.94, 2.02);
  const glow = ctx.createRadialGradient(-.35, -.4, .05, .2, .15, 1.2);
  glow.addColorStop(0, '#ffe6b65c'); glow.addColorStop(.55, '#ffffff00'); glow.addColorStop(1, '#401d2059');
  ctx.fillStyle = glow; ctx.fillRect(-1.1, -1.1, 2.3, 2.3); ctx.restore(); skin.dispose();
  ctx.strokeStyle = '#735135'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(384, 496); ctx.quadraticCurveTo(383, 459, 360, 432); ctx.stroke();
  leaf(ctx, 424, 455, 52, -.5);
  ctx.fillStyle = '#50b35a'; ctx.fillRect(0, 816, 768, 208);
  ctx.fillStyle = '#ffffff'; ctx.font = '600 46px sans-serif'; ctx.fillText('PUR JUS DE POMME', 384, 898);
  ctx.fillStyle = '#e5e842'; ctx.font = 'italic 40px Georgia'; ctx.fillText('100 % pur fruit pressé', 384, 961);
  const front = new THREE.MeshStandardMaterial({ map: texture(canvas), roughness: .88 });
  const sideCanvas = document.createElement('canvas'); sideCanvas.width = 256; sideCanvas.height = 1024;
  const side = sideCanvas.getContext('2d'); side.fillStyle = '#f4f4e8'; side.fillRect(0, 0, 256, 1024);
  side.fillStyle = '#354b31'; side.textAlign = 'center'; side.font = '600 25px sans-serif'; side.fillText('PUR JUS', 128, 145); side.fillText('DE POMME', 128, 188);
  side.font = '21px sans-serif'; side.fillText('100 % pommes', 128, 300); side.fillText('1 L', 128, 355);
  for (let i = 0; i < 53; i++) { side.fillStyle = '#273627'; side.fillRect(25 + i * 4, 670, i % 3 === 0 ? 3 : 1, 140); }
  side.fillStyle = '#50b35a'; side.fillRect(0, 816, 256, 208);
  const sideMaterial = new THREE.MeshStandardMaterial({ map: texture(sideCanvas), roughness: .92 });
  const paper = new THREE.MeshStandardMaterial({ color: '#eceede', roughness: .92 });
  group.add(mesh(new RoundedBoxGeometry(1.43, 2.05, .66, 5, .045), [sideMaterial, sideMaterial, paper, paper, front, front]));
  const seam = mesh(new THREE.BoxGeometry(1.25, .018, .53), paper, [0, 1.026, -.03]); group.add(seam);
  group.rotation.y = -.14; group.scale.setScalar(1.05);
  return group;
}

export function cider() {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: '#233d0d', roughness: .18, clearcoat: .9, clearcoatRoughness: .14, transmission: .04, thickness: .18, ior: 1.5 });
  const points = [[0, -1.12], [.32, -1.12], [.395, -1.08], [.418, -.94], [.418, .13], [.397, .38], [.32, .64], [.205, .91], [.135, 1.12], [.12, 1.48], [.135, 1.51], [.135, 1.56], [0, 1.56]].map(([x, y]) => new THREE.Vector2(x, y));
  group.add(mesh(new THREE.LatheGeometry(points, 112), glass));
  const foil = new THREE.MeshStandardMaterial({ color: '#172319', roughness: .45 });
  group.add(mesh(new THREE.CylinderGeometry(.141, .153, .20, 48), foil, [0, 1.47, 0]));
  const cork = new THREE.MeshStandardMaterial({ color: '#c49958', map: foodTexture('grain'), bumpMap: foodTexture('bark'), bumpScale: .009, roughness: .92 });
  group.add(mesh(new THREE.CylinderGeometry(.137, .121, .23, 40), cork, [0, 1.59, 0]));
  const metal = new THREE.MeshStandardMaterial({ color: '#858b7b', metalness: .72, roughness: .28 });
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2 + .25;
    const wire = new THREE.CatmullRomCurve3([[.10, 1.72], [.145, 1.66], [.151, 1.51], [.162, 1.37]].map(([r, y]) => new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r)));
    group.add(mesh(new THREE.TubeGeometry(wire, 20, .008, 6, false), metal));
  }
  const cageRing = mesh(new THREE.TorusGeometry(.161, .008, 6, 48), metal, [0, 1.39, 0]); cageRing.rotation.x = Math.PI / 2; group.add(cageRing);
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8f5e8'; ctx.beginPath();
  for (let i = 0; i <= 36; i++) { const x = 18 + i / 36 * 732, y = 24 + 12 * Math.sin(i * 2.7); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.lineTo(752, 1000); for (let i = 36; i >= 0; i--) ctx.lineTo(18 + i / 36 * 732, 998 + 9 * Math.sin(i * 2.3)); ctx.closePath(); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#2d3626'; ctx.font = 'italic 49px Georgia'; ctx.fillText('pomme.', 384, 132);
  ctx.font = 'italic 188px Georgia'; ctx.fillText('Cidre', 384, 409);
  ctx.font = 'italic 60px Georgia'; ctx.fillText('de nos vergers', 384, 519);
  ctx.font = '600 51px Georgia'; ctx.fillText('BRUT', 384, 669);
  ctx.font = '29px sans-serif'; ctx.fillText('LES BELLES POMMES', 384, 784); ctx.fillText('75 cl', 384, 925);
  const labelMaterial = new THREE.MeshStandardMaterial({ map: texture(canvas), transparent: true, alphaTest: .1, side: THREE.DoubleSide, roughness: .85 });
  group.add(mesh(new THREE.CylinderGeometry(.424, .424, 1.04, 72, 1, true, -.98, 1.96), labelMaterial, [0, -.49, 0]));
  const sealCanvas = document.createElement('canvas'); sealCanvas.width = sealCanvas.height = 256;
  const seal = sealCanvas.getContext('2d'); seal.fillStyle = '#a73837'; seal.beginPath(); seal.arc(128, 128, 122, 0, Math.PI * 2); seal.fill();
  seal.strokeStyle = '#eec7ad'; seal.lineWidth = 3; seal.beginPath(); seal.arc(128, 128, 104, 0, Math.PI * 2); seal.stroke();
  seal.fillStyle = '#fff1da'; seal.textAlign = 'center'; seal.font = 'italic 27px Georgia'; seal.fillText('pomme.', 128, 116); seal.font = '23px Georgia'; seal.fillText('BRUT', 128, 152);
  group.add(mesh(new THREE.CircleGeometry(.15, 48), new THREE.MeshStandardMaterial({ map: texture(sealCanvas), transparent: true, alphaTest: .1, roughness: .7 }), [0, .83, .275]));
  group.scale.setScalar(.94); group.position.y = -.06; group.rotation.y = -.15;
  return group;
}
