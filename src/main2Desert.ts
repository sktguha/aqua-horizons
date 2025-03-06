// @ts-check
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { addRandomObjects } from './addRandomObjects';
import { isMobile, createControlButton, createStartAffor } from './main';
import { createPatch, generatePatch } from './patchUtils';

export function initDesertScene() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 0.1);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  new RGBELoader().load('https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@obstacleCourse/public/img/rustig_koppie_puresky_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

  const fpControls = new FirstPersonControls(camera, renderer.domElement);
  fpControls.lookSpeed = 0.001; // Adjust look speed for rotation
  fpControls.noFly = true;
  fpControls.lookVertical = true; // Enable vertical look
  fpControls.constrainVertical = true; // Enable vertical constraints
  fpControls.verticalMin = Math.PI / 4; // Constrain vertical rotation
  fpControls.verticalMax = Math.PI / 2; // Constrain vertical rotation
  const h = -10;
  fpControls.heightMax = h;
  fpControls.heightMin = h - 1;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 20, 0);

  const material = new THREE.MeshStandardMaterial({
    color: '#ffbe67',
    dithering: true
  });

  let lods = [];
  for (let i = 0; i < 4; i++) {
    let m = createPatch(scene, material);
    let scl = (i + 1) ** 3;
    m.scale.x = scl;
    m.scale.z = scl;
    m.scale.y = i + 1;
    lods.push(m);
    generatePatch(m, 0, i);
  }

  window.addEventListener(
    'resize',
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  const stats = new Stats();
  document.body.appendChild(stats.dom);
  addRandomObjects(scene);
  const keyState = {};

  window.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
  });

  window.addEventListener('keyup', (event) => {
    keyState[event.key] = false;
  });

  if (isMobile()) {
    createControlButton('left-arrow', '←', () => {
      keyState['q'] = true;
    }, () => {
      keyState['q'] = false;
    });

    createControlButton('right-arrow', '→', () => {
      keyState['e'] = true;
    }, () => {
      keyState['e'] = false;
    });
    createStartAffor();
  }

  const cameraRotationSpeed = 0.005;
  let y = 0;
  const animate = () => {
    stats.begin();
    fpControls.update(1);

    if (keyState['ArrowLeft'] || keyState['A'] || keyState['q']) {
      y += cameraRotationSpeed;
      camera.rotation.y = y;
    }
    if (keyState['ArrowRight'] || keyState['D'] || keyState['e']) {
      y -= cameraRotationSpeed;
      camera.rotation.y = y;
    }
    camera.rotation.x = 0;
    camera.rotation.z = 0;
    camera.rotation.y = y;

    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(animate);
  };

  animate();
}