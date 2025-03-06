import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';
import { Water } from 'three/examples/jsm/objects/Water';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// stats
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// canvas
const canvas = document.getElementsByClassName('webgl')[0] as HTMLCanvasElement;

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE0FFFF); // Light cyan color for the sky

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 10, 30);
scene.add(camera);

// controls
const controls = new FirstPersonControls(camera, canvas);
controls.lookSpeed = 0.1;
controls.movementSpeed = 20;
controls.noFly = true;
controls.lookVertical = true;
controls.constrainVertical = true;
controls.verticalMin = 1.0;
controls.verticalMax = 2.0;
controls.lon = -150;
controls.lat = 120;

// texture loader
const textureLoader = new THREE.TextureLoader();

// water geometry and material
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: textureLoader.load('textures/waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffddaa, // Brighter sun color
  waterColor: 0xADD8E6, // Light blue water color
  distortionScale: 3.7,
});
water.rotation.x = -Math.PI / 2;
scene.add(water);

// light
const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Further increase intensity
directionalLight.position.set(10, 30, 10);
scene.add(directionalLight);

// renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// resize handler
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// fullscreen handler
window.addEventListener('dblclick', () => {
  if (!document.fullscreenElement) {
    return canvas.requestFullscreen();
  }
  return document.exitFullscreen();
});

// Movement step size
const MOVE_STEP = 3;

// keyboard listener
window.addEventListener('keydown2', (event) => {
  switch (event.key) {
    case 'ArrowRight':
      camera.position.x += MOVE_STEP;
      break;
    case 'ArrowLeft':
      camera.position.x -= MOVE_STEP;
      break;
    case 'ArrowUp':
      camera.position.z -= MOVE_STEP;
      break;
    case 'ArrowDown':
      camera.position.z += MOVE_STEP;
      break;
  }
});

// animate
const animate = () => {
  stats.begin();
  controls.update(1); // Pass delta time to update method
  water.material.uniforms['time'].value += 1.0 / 60.0;
  
  // Ensure camera responds to changes
  camera.updateMatrixWorld();
  
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
};

animate();