// @ts-nocheck
import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { Water } from 'three/examples/jsm/objects/Water';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// stats
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// canvas init
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

// first person controls
const fpControls = new FirstPersonControls(camera, canvas);
fpControls.lookSpeed = 0.1; // Adjust look speed for rotation
fpControls.movementSpeed = 0.2;
fpControls.noFly = true;
fpControls.lookVertical = true; // Enable vertical look
fpControls.constrainVertical = true; // Enable vertical constraints
fpControls.verticalMin = Math.PI / 4; // Constrain vertical rotation
fpControls.verticalMax = Math.PI / 2; // Constrain vertical rotation
const h = -10;
fpControls.heightMax = h;
fpControls.heightMin= h-1;

// toggle controls
window.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    fpControls.lookSpeed = 0;
  } else if (event.key === 'z') {
    fpControls.lookSpeed = 0.001;
  }
});
fpControls.constrainVertical = true;
fpControls.movementSpeed = 0.2;
fpControls.noFly = true;

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

// Add random objects
const addRandomObjects = () => {
  const geometry = new THREE.SphereGeometry(50, 32, 32); // Increased size
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  
  // Add balls
  for (let i = 0; i < 50; i++) { // Increased number of objects
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(
      Math.random() * 1000 - 500, // Increased spread
      Math.random() * 100 + 10, // Increased spread
      Math.random() * 1000 - 500 // Increased spread
    );
    scene.add(ball);
  }

  // Add trees
  const treeGeometry = new THREE.ConeGeometry(50, 250, 32); // Increased size
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  for (let i = 0; i < 50; i++) { // Increased number of objects
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(
      Math.random() * 1000 - 500, // Increased spread
      Math.random() * 100 + 10, // Increased spread
      Math.random() * 1000 - 500 // Increased spread
    );
    scene.add(tree);
  }
};

addRandomObjects();

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

// Rotation step size
const ROTATE_STEP = 1;

// keyboard listener for rotation
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'Q':
    case 'q':
      camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), ROTATE_STEP * Math.PI / 180);
      camera.updateMatrixWorld();
      break;
    case 'E':
    case 'e':
      camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -ROTATE_STEP * Math.PI / 180);
      camera.updateMatrixWorld();
      break;
  }
});

const keyState: { [key: string]: boolean } = {};
const cameraRotationSpeed = 0.05;

// keyboard event listeners
window.addEventListener('keydown', (event) => {
  keyState[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keyState[event.key] = false;
});

// animate
const animate = () => {
  stats.begin();
  fpControls.update(1);
  water.material.uniforms['time'].value += 1.0 / 60.0;

  // camera rotation logic
  if (keyState['ArrowLeft']) {
    camera.rotation.y += cameraRotationSpeed;
  }
  if (keyState['ArrowRight']) {
    camera.rotation.y -= cameraRotationSpeed;
  }
  if (keyState['ArrowUp']) {
    camera.rotation.x += cameraRotationSpeed;
  }
  if (keyState['ArrowDown']) {
    camera.rotation.x -= cameraRotationSpeed;
  }
  if (keyState['Q'] || keyState['q']) {
    camera.rotation.z += cameraRotationSpeed;
  }
  if (keyState['E'] || keyState['e']) {
    camera.rotation.z -= cameraRotationSpeed;
  }

  camera.updateMatrixWorld();
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
};

animate();