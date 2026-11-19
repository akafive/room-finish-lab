import * as THREE from 'three';
import './style.css';

const finishes = {
  oak: { name: 'Natural oak', floor: '#bd8c5c', wall: '#e8dfcd', wood: true },
  limestone: { name: 'Limestone', floor: '#cfc4ad', wall: '#dfe3d5', wood: false },
  walnut: { name: 'Smoked walnut', floor: '#77503b', wall: '#d0d8ca', wood: true },
};

type Finish = keyof typeof finishes;
const original = document.querySelector<HTMLCanvasElement>('#original')!;
const preview = document.querySelector<HTMLCanvasElement>('#preview')!;
const name = document.querySelector<HTMLSpanElement>('#finish-name')!;
const reset = document.querySelector<HTMLButtonElement>('#reset')!;
const controls = document.querySelector<HTMLFieldSetElement>('#finishes')!;
const errorMessage = document.querySelector<HTMLParagraphElement>('#renderer-error')!;

function floorTexture(finish: Finish) {
  const spec = finishes[finish];
  const tile = document.createElement('canvas');
  tile.width = tile.height = 384;
  const ctx = tile.getContext('2d')!;
  const base = new THREE.Color(spec.floor);
  let state = 39;
  const random = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const rows = spec.wood ? 8 : 4;
  const height = tile.height / rows;
  const width = spec.wood ? tile.width / 2 : height;
  for (let row = 0; row < rows; row++) {
    for (let x = -(row % 2) * width / 2; x < tile.width; x += width) {
      ctx.fillStyle = base.clone().multiplyScalar(.78 + random() * .37).getStyle();
      ctx.fillRect(x, row * height, width, height);
      ctx.strokeStyle = spec.wood ? '#49301f69' : '#eee8da';
      ctx.lineWidth = spec.wood ? 1.7 : 2.4;
      ctx.strokeRect(x, row * height, width, height);
    }
  }
  for (let stroke = 0; stroke < 2300; stroke++) {
    const x = random() * tile.width;
    const y = random() * tile.height;
    ctx.fillStyle = random() > .5 ? '#35271c13' : '#fffdf319';
    ctx.fillRect(x, y, spec.wood ? 6 + random() * 90 : 1 + random() * 3, spec.wood ? 1 : 2);
  }
  const texture = new THREE.CanvasTexture(tile);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.15, 2.15);
  texture.anisotropy = 4;
  return texture;
}

function buildRoom(scene: THREE.Scene, wall: THREE.MeshStandardMaterial) {
  const cotton = new THREE.MeshStandardMaterial({ color: '#c9c4b3', roughness: .95 });
  const olive = new THREE.MeshStandardMaterial({ color: '#718271', roughness: 1 });
  const sand = new THREE.MeshStandardMaterial({ color: '#e3d0ab', roughness: .92 });
  const rust = new THREE.MeshStandardMaterial({ color: '#ba7354', roughness: .9 });
  const bark = new THREE.MeshStandardMaterial({ color: '#76543b', roughness: .75 });
  const enamel = new THREE.MeshStandardMaterial({ color: '#ede5d4', roughness: .8 });
  const window = new THREE.MeshStandardMaterial({
    color: '#c4d9d6', emissive: '#a6c5bd', emissiveIntensity: .45, roughness: .52,
  });
  const edge = new THREE.MeshStandardMaterial({ color: '#b9a98e', roughness: .88 });

  function add(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function box(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) {
    return add(new THREE.BoxGeometry(w, h, d), material, x, y, z);
  }

  box(6, .19, 4.8, edge, 0, -.10, 0);
  box(.16, 2.65, 4.8, wall, -2.92, 1.32, 0);
  box(6, .82, .16, wall, 0, .41, -2.32);
  box(6, .50, .16, wall, 0, 2.40, -2.32);
  box(1.30, 1.33, .16, wall, -2.35, 1.48, -2.32);
  box(2.50, 1.33, .16, wall, 1.75, 1.48, -2.32);
  box(2.20, 1.33, .04, window, -.60, 1.48, -2.30);
  for (const x of [-1.70, -.60, .50]) box(.07, 1.35, .15, enamel, x, 1.48, -2.23);
  for (const y of [.81, 1.48, 2.15]) box(2.26, .07, .18, enamel, -.60, y, -2.22);
  box(6, .10, .045, enamel, 0, .05, -2.21);
  box(.045, .10, 4.6, enamel, -2.82, .05, .01);

  box(2.45, .025, 1.7, sand, -.25, .017, .75);
  box(2.42, .28, .92, cotton, -.67, .25, -1.38);
  box(2.42, .73, .21, cotton, -.67, .62, -1.77);
  for (const x of [-1.82, .48]) {
    box(.23, .40, .94, cotton, x, .48, -1.38);
    box(.11, .17, .11, bark, x, .09, -1.68);
    box(.11, .17, .11, bark, x, .09, -1.05);
  }
  for (const x of [-1.32, -.67, -.02]) box(.63, .15, .65, cotton, x, .47, -1.32);
  box(.43, .39, .17, olive, -1.42, .75, -1.60).rotation.z = .15;
  box(.37, .32, .18, rust, .04, .72, -1.60).rotation.z = -.18;

  add(new THREE.CylinderGeometry(.56, .54, .10, 40), bark, -.29, .40, .64);
  add(new THREE.CylinderGeometry(.12, .24, .34, 24), bark, -.29, .20, .64);
  box(.22, .046, .15, rust, -.13, .475, .56).rotation.y = .35;
  add(new THREE.CylinderGeometry(.08, .06, .09, 18), enamel, -.50, .49, .78);

  add(new THREE.CylinderGeometry(.25, .18, .26, 24), rust, 1.78, .14, -1.59);
  add(new THREE.CylinderGeometry(.025, .04, .77, 12), bark, 1.78, .57, -1.59);
  for (const [x, y, z, angle] of [
    [1.58, .72, -1.68, -.65], [1.96, .82, -1.53, .60], [1.72, 1.02, -1.58, -.26], [1.85, .93, -1.70, .3],
  ]) {
    const leaf = add(new THREE.SphereGeometry(1, 16, 12), olive, x, y, z);
    leaf.scale.set(.14, .27, .09);
    leaf.rotation.z = angle;
  }
}

function start() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e6e8dc');
  const wall = new THREE.MeshStandardMaterial({ roughness: .9 });
  buildRoom(scene, wall);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5.83, 4.65),
    new THREE.MeshStandardMaterial({ roughness: .87 }),
  );
  floor.position.set(.06, .002, .06);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  scene.add(new THREE.HemisphereLight('#f7fbff', '#a38c72', 2.1));
  const sun = new THREE.DirectionalLight('#fff3d6', 2.2);
  sun.position.set(1, 7, 4.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = .025;
  scene.add(sun);

  const camera = new THREE.OrthographicCamera();
  camera.position.set(6.9, 5.2, 7.5);
  camera.lookAt(-.13, .94, -.15);
  const textures = { oak: floorTexture('oak'), limestone: floorTexture('limestone'), walnut: floorTexture('walnut') };
  let selected: Finish = 'limestone';

  function render(canvas: HTMLCanvasElement, finish: Finish) {
    floor.material.map = textures[finish];
    floor.material.needsUpdate = true;
    wall.color.set(finishes[finish].wall);
    renderer.render(scene, camera);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(renderer.domElement, 0, 0);
  }

  function updateViews() {
    const scale = Math.min(window.devicePixelRatio, 2);
    const bounds = original.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width * scale));
    const height = Math.max(1, Math.round(bounds.height * scale));
    renderer.setSize(width, height, false);
    const verticalRange = 6.45;
    camera.top = verticalRange / 2;
    camera.bottom = -camera.top;
    camera.right = camera.top * width / height;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
    for (const canvas of [original, preview]) {
      canvas.width = width;
      canvas.height = height;
    }
    render(original, 'oak');
    render(preview, selected);
  }

  function choose(finish: Finish) {
    selected = finish;
    controls.querySelector<HTMLInputElement>(`input[value="${selected}"]`)!.checked = true;
    name.textContent = finishes[finish].name;
    preview.setAttribute('aria-label', `3D living room with the ${finishes[finish].name.toLowerCase()} finish`);
    render(preview, finish);
  }

  controls.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    choose(target.value as Finish);
  });
  reset.addEventListener('click', () => choose('limestone'));
  const observer = new ResizeObserver(updateViews);
  observer.observe(original);
  updateViews();
}

try {
  start();
} catch (error) {
  errorMessage.hidden = false;
  controls.disabled = true;
  reset.disabled = true;
  console.error(error);
}
