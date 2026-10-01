import * as THREE from 'three';

function rng(seed = 17) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export function appleSkin(color) {
  const size = 1024;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const data = ctx.createImageData(size, size);
  const random = rng(37);
  const colors = { red: [177, 35, 22], green: [98, 135, 33], yellow: [222, 171, 39] };
  const base = colors[color];
  for (let y = 0; y < size; y++) {
    const pole = Math.pow(Math.abs(y / size * 2 - 1), 9);
    for (let x = 0; x < size; x++) {
      const u = x / size * Math.PI * 2, v = y / size;
      const stripe = Math.pow(Math.max(0, Math.sin(u * 31 + Math.sin(v * 13) * 1.4 + Math.sin(u * 11 + v * 7) * 2.3)), 4) * (.35 + .65 * (Math.sin(v * 23 + u * 3) * .5 + .5));
      const blush = Math.sin(u * 4 + Math.sin(v * 6)) * Math.sin(v * 16 + Math.cos(u * 3)) * .5 + .5;
      const grain = (random() - .5) * 12;
      const i = (y * size + x) * 4;
      data.data[i] = base[0] + stripe * 18 + blush * 14 + grain + pole * 30;
      data.data[i + 1] = base[1] + stripe * (color === 'red' ? 18 : 10) + blush * 18 + grain + pole * 45;
      data.data[i + 2] = base[2] + stripe * 10 + blush * 8 + grain + pole * 13;
      data.data[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  for (let i = 0; i < 9500; i++) {
    const x = random() * size, y = random() * size, r = .5 + random() * 1.25;
    ctx.fillStyle = color === 'red' ? `rgba(244,204,127,${.3 + random() * .35})` : `rgba(243,225,154,${.3 + random() * .35})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * .8, 0, 0, Math.PI * 2); ctx.fill();
    if (i % 3 === 0) { ctx.fillStyle = 'rgba(79,54,19,.16)'; ctx.fillRect(x, y, .7, .7); }
  }
  return canvasTexture(canvas);
}

export function foodTexture(kind = 'crust') {
  const size = 512, random = rng(kind === 'crust' ? 12 : 54);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const data = ctx.createImageData(size, size);
  const base = { crust: [153, 99, 37], flesh: [238, 218, 173], crumb: [158, 105, 46], puree: [184, 143, 78], dried: [189, 142, 70], sauce: [188, 137, 61], bark: [83, 46, 24], grain: [185, 185, 185] }[kind];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const broad = Math.sin(x * .034 + Math.sin(y * .025) * 2) * Math.sin(y * .042) * 13;
      const grain = (random() - .5) * (kind === 'crumb' || kind === 'grain' ? 65 : 24);
      for (let c = 0; c < 3; c++) data.data[i + c] = base[c] + broad + grain;
      data.data[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  if (kind === 'flesh') {
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = `rgba(137,73,23,${random() * .18})`;
      ctx.beginPath(); ctx.ellipse(random() * size, random() * size, 2 + random() * 14, 2 + random() * 7, random(), 0, Math.PI * 2); ctx.fill();
    }
  }
  if (kind === 'crust' || kind === 'crumb') {
    for (let i = 0; i < 9500; i++) {
      ctx.fillStyle = random() > .5 ? 'rgba(255,211,125,.35)' : 'rgba(55,26,9,.3)';
      ctx.beginPath(); ctx.arc(random() * size, random() * size, .5 + random() * 1.7, 0, Math.PI * 2); ctx.fill();
    }
  }
  return canvasTexture(canvas);
}
