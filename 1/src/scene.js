import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createFood, foodFallback } from './foods.js';
import { appleSkin, foodTexture } from './textures.js';

function appleGeometry() {
  const around = 160;
  const vertical = 112;
  const positions = [], uvs = [], indices = [];
  for (let row = 0; row <= vertical; row++) {
    const phi = row / vertical * Math.PI;
    const sin = Math.sin(phi);
    for (let col = 0; col <= around; col++) {
      const theta = col / around * Math.PI * 2;
      const lobes = 1 + 0.016 * Math.cos(5 * theta + 0.4) * (0.4 + 0.6 * Math.abs(Math.cos(phi)));
      const radius = Math.pow(sin, 0.96) * 1.14 * (1 + 0.17 * Math.cos(phi)) * lobes;
      const y = 1.12 * Math.cos(phi) - 0.36 * Math.exp(-phi * phi / 0.12) + 0.085 * Math.exp(-Math.pow(Math.PI - phi, 2) / 0.07);
      const ripple = 0.027 * Math.cos(5 * theta + 0.4) * sin * Math.exp(-Math.pow(phi - 0.48, 2) / 0.14);
      positions.push(radius * Math.cos(theta), y + ripple, radius * Math.sin(theta) * 0.94);
      uvs.push(col / around, 1 - row / vertical);
      if (row < vertical && col < around) {
        const a = row * (around + 1) + col;
        const b = a + around + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function skinTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const data = context.createImageData(1024, 1024);
  let seed = 42;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const bands = Array.from({ length: 1024 }, (_, x) => 2 * Math.sin(x * .16) + 3 * Math.sin(x * .051) + random() * 3);
  for (let y = 0; y < 1024; y++) {
    for (let x = 0; x < 1024; x++) {
      const i = (y * 1024 + x) * 4;
      const mottling = Math.sin(x * .027 + Math.sin(y * .021) * 2) * Math.sin(y * .031 + x * .004) * 9;
      const value = Math.min(255, 234 + bands[x] + mottling + random() * 8);
      data.data[i] = value;
      data.data[i + 1] = value - 4;
      data.data[i + 2] = value - 8;
      data.data[i + 3] = 255;
    }
  }
  context.putImageData(data, 0, 0);
  for (let i = 0; i < 15500; i++) {
    const x = random() * 1024, y = random() * 1024;
    context.fillStyle = `rgba(255,236,194,${.1 + random() * .38})`;
    context.beginPath();
    context.ellipse(x, y, .25 + random() * .7, .3 + random() * .8, 0, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createLeaf() {
  const positions = [], uvs = [], indices = [];
  const count = 36;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const halfWidth = Math.sin(Math.PI * t) * .2 * (1 + .045 * Math.sin(i * 3.2));
    for (let side = 0; side < 3; side++) {
      const across = side - 1;
      positions.push(t * .86, Math.sin(t * Math.PI) * .15 + t * .24 - Math.abs(across) * .04, across * halfWidth + Math.sin(t * Math.PI) * .08);
      uvs.push(t, side / 2);
      if (i < count && side < 2) {
        const a = i * 3 + side;
        indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, '#344d1b'); gradient.addColorStop(.5, '#617e2e'); gradient.addColorStop(1, '#83a245');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#a1b261'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 128); ctx.lineTo(512, 128); ctx.stroke();
  ctx.globalAlpha = .4; ctx.lineWidth = 1;
  for (let x = 25; x < 490; x += 30) { ctx.beginPath(); ctx.moveTo(x, 128); ctx.lineTo(x + 75, 0); ctx.moveTo(x, 128); ctx.lineTo(x + 75, 256); ctx.stroke(); }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const leaf = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ map: texture, color: '#94ab66', roughness: .85, side: THREE.DoubleSide, clearcoat: .05 }));
  leaf.rotation.set(1.08, -.33, .1);
  leaf.position.set(.105, 1.27, .01);
  leaf.castShadow = true;
  return leaf;
}

export function createAppleScene(container) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch {
    container.innerHTML = '<div class="scene-fallback"><div class="fallback-apple"></div></div>';
    return {
      setState(state) {
        container.dataset.food = state.type;
        container.innerHTML = `<div class="scene-fallback">${foodFallback(state.type)}</div>`;
      },
      reset() {},
    };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, .75, 5.65);
  camera.lookAt(0, .18, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .035);
  scene.environment = environment.texture;
  scene.environmentIntensity = .48;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff9e9', '#75814e', .9));
  const key = new THREE.DirectionalLight('#fff7e8', 2.1);
  key.position.set(-3, 5, 4); scene.add(key);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 15 });
  key.shadow.bias = -.0005;
  key.shadow.normalBias = .018;
  const fill = new THREE.DirectionalLight('#e5efd7', .6);
  fill.position.set(4, 2, -3); scene.add(fill);

  const apple = new THREE.Group();
  apple.scale.setScalar(1.1);
  apple.rotation.y = -.32;
  apple.position.y = .12;
  scene.add(apple);
  const rawApple = new THREE.Group();
  apple.add(rawApple);
  const skins = { red: appleSkin('red'), green: appleSkin('green'), yellow: appleSkin('yellow') };
  const texture = skinTexture();
  const grain = foodTexture('grain');
  grain.colorSpace = THREE.NoColorSpace;
  const paint = { nextSkin: { value: skins.red }, paintMix: { value: 1 } };
  const material = new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: skins.red, roughness: .74, metalness: 0, clearcoat: .1, clearcoatRoughness: .5, bumpMap: grain, bumpScale: .009, roughnessMap: grain });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, paint);
    shader.fragmentShader = 'uniform sampler2D nextSkin;\nuniform float paintMix;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, texture2D(nextSkin, vMapUv).rgb, paintMix);');
  };
  let activeColor = 'red';
  const fruit = new THREE.Mesh(appleGeometry(), material);
  rawApple.add(fruit);
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .79, 0), new THREE.Vector3(.035, 1.02, 0), new THREE.Vector3(.075, 1.24, -.025), new THREE.Vector3(.155, 1.45, -.04)]);
  const bark = foodTexture('bark');
  const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 20, .035, 9, false), new THREE.MeshStandardMaterial({ map: bark, bumpMap: bark, bumpScale: .015, roughness: .95 }));
  rawApple.add(stem);
  const stemTip = new THREE.Mesh(new THREE.SphereGeometry(.047, 10, 8), new THREE.MeshStandardMaterial({ color: '#997247', roughness: .9 }));
  stemTip.scale.y = .35; stemTip.position.copy(stemCurve.getPoint(1)); rawApple.add(stemTip);
  rawApple.add(createLeaf());
  rawApple.traverse((object) => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  const models = new Map([['apple', rawApple]]);
  let activeType = 'apple';

  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 256;
  const shadowCtx = shadowCanvas.getContext('2d');
  const shadowGradient = shadowCtx.createRadialGradient(128, 128, 5, 128, 128, 128);
  shadowGradient.addColorStop(0, 'rgba(58,62,36,.23)'); shadowGradient.addColorStop(.38, 'rgba(58,62,36,.12)'); shadowGradient.addColorStop(1, 'rgba(58,62,36,0)');
  shadowCtx.fillStyle = shadowGradient; shadowCtx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(.06, -1.065, 0); scene.add(shadow);

  let targetY = -.32, targetX = 0, dragging = false, lastX = 0, lastY = 0;
  let activePointer = null;
  const restScale = new THREE.Vector3(1.1, 1.1, 1.1);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, visible = true, destroyed = false, lastTime = 0;
  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole apple visible in a narrow viewport.
    camera.position.z = width / height < 1 ? 6.2 : 5.65;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(render); });
  visibilityObserver.observe(container);
  const down = (event) => {
    if (event.button !== 0) return;
    activePointer = event.pointerId; dragging = true;
    lastX = event.clientX; lastY = event.clientY;
    container.setPointerCapture(event.pointerId);
  };
  container.addEventListener('pointerdown', down);
  container.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== activePointer) return;
    targetY += (event.clientX - lastX) * .009;
    targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastY) * .004, -.4, 1.05);
    lastX = event.clientX; lastY = event.clientY;
  });
  const release = () => { dragging = false; activePointer = null; };
  container.addEventListener('pointerup', release);
  container.addEventListener('pointercancel', release);
  container.addEventListener('lostpointercapture', release);
  container.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); targetY += event.key === 'ArrowLeft' ? -.25 : .25; }
  });
  function render(time) {
    raf = 0;
    if (destroyed || !visible) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : .016;
    lastTime = time;
    const smoothing = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 9);
    paint.paintMix.value = THREE.MathUtils.lerp(paint.paintMix.value, 1, reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 5));
    apple.rotation.y += (targetY - apple.rotation.y) * smoothing;
    apple.rotation.x += (targetX - apple.rotation.x) * smoothing;
    apple.scale.lerp(restScale, smoothing);
    if (!reducedMotion.matches) {
      apple.position.y = .12 + Math.sin(time * .0009) * .025;
      shadow.material.opacity = .96 + Math.sin(time * .0009) * .04;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  }
  raf = requestAnimationFrame(render);
  window.addEventListener('pagehide', () => { destroyed = true; cancelAnimationFrame(raf); resizeObserver.disconnect(); visibilityObserver.disconnect(); renderer.dispose(); environment.dispose(); }, { once: true });
  return {
    setState(state) {
      if (state.color !== activeColor) {
        material.map = skins[activeColor];
        paint.nextSkin.value = skins[state.color];
        paint.paintMix.value = reducedMotion.matches ? 1 : 0;
        activeColor = state.color;
      }
      if (!models.has(state.type)) {
        const model = createFood(state.type, { appleGeometry: fruit.geometry, skinMaterial: material, skinMap: texture });
        models.set(state.type, model);
        apple.add(model);
        model.traverse((object) => { if (object.isMesh && !object.material.transparent) { object.castShadow = true; object.receiveShadow = true; } });
      }
      for (const [type, model] of models) model.visible = type === state.type;
      if (activeType !== state.type) {
        targetX = ['quarter', 'tart', 'american', 'compote', 'dried', 'fritter', 'sauce', 'boudin'].includes(state.type) ? .65 : 0;
        targetY = state.type === 'cider' ? 0 : -.32;
        if (!reducedMotion.matches) apple.scale.setScalar(.98);
      }
      activeType = state.type;
    },
    reset() { targetY = -.32; targetX = 0; },
  };
}
