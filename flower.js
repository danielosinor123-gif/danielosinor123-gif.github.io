import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('flower-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 700;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d0e12, 10, 26);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 8);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const sun = new THREE.DirectionalLight(0xfff3d6, 1.4);
sun.position.set(4, 8, 3);
scene.add(sun);

const gold = new THREE.PointLight(0xffd700, 26, 14);
gold.position.set(-3, 3, 2);
scene.add(gold);

const pink = new THREE.PointLight(0xff6fae, 16, 11);
pink.position.set(3, 2, -1);
scene.add(pink);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(13, 48),
  new THREE.MeshStandardMaterial({ color: 0x121318, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const FLOWER_COLORS = [0xff6fae, 0xffd700, 0xff8c42, 0xc77dff, 0x7ce7c4, 0xff4d6d, 0xffe066, 0x90dbf4];

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function petalShape(width, height) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width * 0.55, height * 0.12, width * 0.64, height * 0.45, 0, height);
  s.bezierCurveTo(-width * 0.64, height * 0.45, -width * 0.55, height * 0.12, 0, 0);
  return s;
}

function makePetalGeometry(width, height, curl) {
  const geo = new THREE.ShapeGeometry(petalShape(width, height), 14);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const p = y / height;
    const z = -Math.sin(p * Math.PI) * curl * height * 0.5 + (x * x) * 0.18;
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function lighten(hex, amt) {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color(0xffffff), amt);
  return c;
}

function createPetalLayer(color, count, radius, tilt, size, curl) {
  const group = new THREE.Group();
  const geo = makePetalGeometry(size, size * 1.7, curl);
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      side: THREE.DoubleSide,
      emissive: lighten(color, 0.15),
      emissiveIntensity: 0.35,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.25;
    mesh.rotation.y = angle;
    mesh.rotation.z = -tilt;
    mesh.rotation.x = Math.sin(angle) * tilt * 0.6;
    mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(mesh);
  }
  return group;
}

function createFlower() {
  const group = new THREE.Group();
  const s = 0.7 + Math.random() * 0.9;
  const color = FLOWER_COLORS[(Math.random() * FLOWER_COLORS.length) | 0];

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03 * s, 0.055 * s, 2.0 * s, 7),
    new THREE.MeshStandardMaterial({ color: 0x3d8c5a, roughness: 0.8 })
  );
  stem.position.y = -1.0 * s;
  group.add(stem);

  const leafGeo = makePetalGeometry(0.34 * s, 0.5 * s, 0.5);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x4c9e63,
    roughness: 0.8,
    side: THREE.DoubleSide,
    emissive: 0x2f7a4d,
    emissiveIntensity: 0.15,
  });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(0.22 * s, -0.65 * s, 0);
  leaf.rotation.z = -0.5;
  leaf.rotation.y = 0.4;
  group.add(leaf);
  const leaf2 = leaf.clone();
  leaf2.position.set(-0.2 * s, -1.15 * s, 0.08);
  leaf2.rotation.z = 0.6;
  leaf2.rotation.y = -0.5;
  group.add(leaf2);

  const head = new THREE.Group();
  head.position.y = 0.02 * s;
  const outer = createPetalLayer(color, 6, 0.16 * s, 0.62, 0.4 * s, 0.55);
  const inner = createPetalLayer(lighten(color, 0.22), 5, 0.1 * s, 0.3, 0.3 * s, 0.4);
  head.add(outer);
  head.add(inner);

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.11 * s, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffe9a8,
      roughness: 0.5,
      emissive: 0xffc94d,
      emissiveIntensity: 1.0,
    })
  );
  center.position.y = 0.1 * s;
  head.add(center);

  group.add(head);
  group.userData = {
    head,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.8,
    sway: 0.02 + Math.random() * 0.05,
    growth: reducedMotion ? 1 : 0,
  };
  return group;
}

const flowers = [];
const flowerCount = isMobile ? 14 : 26;
for (let i = 0; i < flowerCount; i++) {
  const f = createFlower();
  const angle = Math.random() * Math.PI * 2;
  const radius = 1.6 + Math.random() * 4.8;
  f.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  f.userData.growth = reducedMotion ? 1 : Math.random() * 0.6;
  f.scale.setScalar(0.001);
  scene.add(f);
  flowers.push(f);
}

const falling = [];
const fallMat = new THREE.MeshStandardMaterial({
  color: 0xff8fb1,
  roughness: 0.5,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9,
  emissive: 0xff6fae,
  emissiveIntensity: 0.5,
});
for (let i = 0; i < (isMobile ? 18 : 40); i++) {
  const p = new THREE.Mesh(makePetalGeometry(0.09, 0.14, 0.6), fallMat);
  p.userData = {
    speed: 0.3 + Math.random() * 0.6,
    spin: (Math.random() - 0.5) * 3,
    drift: (Math.random() - 0.5) * 0.4,
    x: (Math.random() - 0.5) * 14,
    z: (Math.random() - 0.5) * 8,
    y: Math.random() * 6,
  };
  p.position.set(p.userData.x, p.userData.y, p.userData.z);
  scene.add(p);
  falling.push(p);
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const fireflies = [];
const fireflyCount = isMobile ? 25 : 60;
const fireflyMat = new THREE.PointsMaterial({
  size: 0.16,
  map: glowTexture(),
  color: 0xffe9a8,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const fireflyGeo = new THREE.BufferGeometry();
const fireflyPos = new Float32Array(fireflyCount * 3);
for (let i = 0; i < fireflyCount; i++) {
  fireflyPos[i * 3] = (Math.random() - 0.5) * 12;
  fireflyPos[i * 3 + 1] = 0.4 + Math.random() * 4.5;
  fireflyPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
}
fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
const firefliesPoints = new THREE.Points(fireflyGeo, fireflyMat);
firefliesPoints.userData.seeds = fireflyPos.map((v, i) => Math.random() * Math.PI * 2);
scene.add(firefliesPoints);
for (let i = 0; i < fireflyCount; i++) fireflies.push({ seed: firefliesPoints.userData.seeds[i] });

const bursts = [];

function spawnBurst(x, z) {
  for (let i = 0; i < 28; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: FLOWER_COLORS[(Math.random() * FLOWER_COLORS.length) | 0],
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      emissive: 0xfff2c0,
      emissiveIntensity: 0.9,
    });
    const p = new THREE.Mesh(makePetalGeometry(0.09, 0.14, 0.6), mat);
    p.position.set(x, 0.5, z);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.4 + Math.random() * 2.6;
    p.userData = {
      vx: Math.cos(angle) * speed,
      vy: 2.5 + Math.random() * 3.2,
      vz: Math.sin(angle) * speed,
      rot: (Math.random() - 0.5) * 6,
      life: 1.6 + Math.random(),
      t: 0,
    };
    scene.add(p);
    bursts.push(p);
  }
}

const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
const ray = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
let lastMove = 0;

window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  lastMove = performance.now();
});

window.addEventListener('click', (e) => {
  if (e.target.closest('a, button')) return;
  ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.ray.intersectPlane(groundPlane, new THREE.Vector3());
  if (!hit) return;
  const f = createFlower();
  f.position.set(hit.x, 0, hit.z);
  f.scale.setScalar(0.001);
  scene.add(f);
  flowers.push(f);
  spawnBurst(hit.x, hit.z);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  isMobile ? 0.7 : 0.95,
  0.55,
  0.18
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const clock = new THREE.Clock();
let scrollY = 0;
let autoT = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  const idle = performance.now() - lastMove > 4000;
  target.x += (mouse.x - target.x) * 0.05;
  target.y += (mouse.y - target.y) * 0.05;
  if (idle) autoT += dt * 0.06;

  camera.position.x = idle ? Math.sin(autoT) * 1.6 : target.x * 1.1;
  camera.position.y = 2.2 - target.y * 0.5 + Math.min(scrollY * 0.0015, 0.8);
  camera.lookAt(0, 0.9, 0);

  for (const f of flowers) {
    const u = f.userData;
    if (u.growth < 1) {
      u.growth = Math.min(1, u.growth + dt * 0.85);
      f.scale.setScalar(easeOutBack(u.growth));
    }
    const sway = Math.sin(t * u.speed + u.phase) * u.sway;
    f.rotation.z = sway;
    f.rotation.x = Math.cos(t * u.speed * 0.8 + u.phase) * u.sway * 0.7;
    u.head.rotation.y = Math.sin(t * u.speed * 0.5 + u.phase) * 0.08;
  }

  for (const p of falling) {
    const u = p.userData;
    u.y -= u.speed * dt;
    p.rotation.x += u.spin * dt;
    p.rotation.z += u.spin * 0.7 * dt;
    p.position.set(u.x + Math.sin(t * 0.8 + u.y) * 0.4, u.y, u.z + Math.cos(t * 0.6 + u.y) * 0.3);
    if (u.y < -0.3) {
      u.y = 5.5 + Math.random();
      u.x = (Math.random() - 0.5) * 14;
      u.z = (Math.random() - 0.5) * 8;
    }
  }

  const pos = fireflyGeo.attributes.position;
  for (let i = 0; i < fireflyCount; i++) {
    const seed = fireflies[i].seed;
    pos.setY(i, fireflyPos[i * 3 + 1] + Math.sin(t * 1.2 + seed) * 0.35);
    pos.setX(i, fireflyPos[i * 3] + Math.sin(t * 0.7 + seed * 2) * 0.5);
    pos.setZ(i, fireflyPos[i * 3 + 2] + Math.cos(t * 0.6 + seed) * 0.4);
  }
  pos.needsUpdate = true;
  fireflyMat.opacity = 0.75 + Math.sin(t * 0.8) * 0.25;

  for (let i = bursts.length - 1; i >= 0; i--) {
    const p = bursts[i];
    const u = p.userData;
    u.t += dt;
    u.vy -= 9.8 * dt;
    p.position.x += u.vx * dt;
    p.position.y += u.vy * dt;
    p.position.z += u.vz * dt;
    p.rotation.x += u.rot * dt;
    p.rotation.z += u.rot * dt;
    p.material.opacity = Math.max(0, 1 - u.t / u.life);
    if (u.t >= u.life) {
      scene.remove(p);
      p.material.dispose();
      bursts.splice(i, 1);
    }
  }

  composer.render();
}

if (reducedMotion) {
  for (const f of flowers) f.scale.setScalar(1);
  for (const b of bursts) {
    scene.remove(b);
    b.material.dispose();
  }
  bursts.length = 0;
  composer.render();
} else {
  animate();
}