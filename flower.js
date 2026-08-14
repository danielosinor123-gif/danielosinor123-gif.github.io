import * as THREE from 'three';

const canvas = document.getElementById('flower-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 700;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d0e12, 10, 24);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 8);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const sun = new THREE.DirectionalLight(0xfff3d6, 1.3);
sun.position.set(4, 8, 3);
scene.add(sun);

const gold = new THREE.PointLight(0xffd700, 22, 14);
gold.position.set(-3, 3, 2);
scene.add(gold);

const pink = new THREE.PointLight(0xff6fae, 14, 11);
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

function createFlower() {
  const group = new THREE.Group();
  const s = 0.7 + Math.random() * 0.9;
  const color = FLOWER_COLORS[(Math.random() * FLOWER_COLORS.length) | 0];

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035 * s, 0.05 * s, 1.9 * s, 5),
    new THREE.MeshStandardMaterial({ color: 0x3d8c5a, roughness: 0.8 })
  );
  stem.position.y = -0.95 * s;
  group.add(stem);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4c9e63, roughness: 0.8, side: THREE.DoubleSide });
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 8, 6), leafMat);
  leaf.scale.set(1.6, 0.4, 0.5);
  leaf.position.set(0.28 * s, -0.6 * s, 0);
  leaf.rotation.z = -0.6;
  group.add(leaf);
  const leaf2 = leaf.clone();
  leaf2.position.set(-0.26 * s, -1.05 * s, 0.1);
  leaf2.rotation.z = 0.7;
  leaf2.scale.set(1.3, 0.35, 0.45);
  group.add(leaf2);

  const petalMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    emissive: color,
    emissiveIntensity: 0.12,
    side: THREE.DoubleSide,
  });
  const petalCount = 5 + ((Math.random() * 3) | 0);
  for (let i = 0; i < petalCount; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16 * s, 10, 8), petalMat);
    petal.scale.set(0.85, 1.15, 0.28);
    const angle = (i / petalCount) * Math.PI * 2 + Math.random() * 0.3;
    const r = 0.17 * s;
    petal.position.set(Math.cos(angle) * r, 0.1 * s + 0.04, Math.sin(angle) * r);
    petal.rotation.y = angle;
    petal.rotation.z = -0.35;
    petal.rotation.x = Math.sin(angle) * 0.15;
    group.add(petal);
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.11 * s, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffe9a8,
      roughness: 0.6,
      emissive: 0xffd700,
      emissiveIntensity: 0.35,
    })
  );
  center.position.y = 0.12 * s;
  group.add(center);

  group.userData = {
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
});
for (let i = 0; i < (isMobile ? 18 : 40); i++) {
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), fallMat);
  p.scale.set(1.4, 0.35, 0.8);
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

const bursts = [];

function spawnBurst(x, z) {
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: FLOWER_COLORS[(Math.random() * FLOWER_COLORS.length) | 0],
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), mat);
    p.scale.set(1.4, 0.4, 0.8);
    p.position.set(x, 0.4, z);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 2.4;
    p.userData = {
      vx: Math.cos(angle) * speed,
      vy: 2 + Math.random() * 3,
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

window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
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
});

const clock = new THREE.Clock();
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  target.x += (mouse.x - target.x) * 0.05;
  target.y += (mouse.y - target.y) * 0.05;

  camera.position.x = target.x * 1.1;
  camera.position.y = 2.2 - target.y * 0.5 + Math.min(scrollY * 0.0015, 0.8);
  camera.lookAt(0, 0.8, 0);

  for (const f of flowers) {
    const u = f.userData;
    if (u.growth < 1) {
      u.growth = Math.min(1, u.growth + dt * 0.85);
      f.scale.setScalar(easeOutBack(u.growth));
    }
    const sway = Math.sin(t * u.speed + u.phase) * u.sway;
    f.rotation.z = sway;
    f.rotation.x = Math.cos(t * u.speed * 0.8 + u.phase) * u.sway * 0.7;
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

  renderer.render(scene, camera);
}

if (reducedMotion) {
  for (const f of flowers) f.scale.setScalar(1);
  for (const b of bursts) {
    scene.remove(b);
    b.material.dispose();
  }
  bursts.length = 0;
  renderer.render(scene, camera);
} else {
  animate();
}