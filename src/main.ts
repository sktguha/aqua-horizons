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
const cameraRotationSpeed = 0.005;
// first person controls
const fpControls = new FirstPersonControls(camera, canvas);
fpControls.lookSpeed = 0.1; // Adjust look speed for rotation

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
    // fpControls.lookSpeed = 0; work fine
    fpControls.movementSpeed = 0.6;
    cameraRotationSpeed = 0.005;
  } else if (event.key === 'z') {
    fpControls.movementSpeed = START_MOVEMENT_SPEED;
    cameraRotationSpeed = 0.01
    // fpControls.lookSpeed = 0.001;
  }
 else if (event.key === 'x') {
  fpControls.movementSpeed = START_MOVEMENT_SPEED*2;
  cameraRotationSpeed = 0.01
  // fpControls.lookSpeed = 0.001;
}

});
const START_MOVEMENT_SPEED = 1.8;
fpControls.constrainVertical = true;
fpControls.movementSpeed = START_MOVEMENT_SPEED; // 0.6
fpControls.noFly = true;

// texture loader
const textureLoader = new THREE.TextureLoader();

// water geometry and material
const worldX = 100000, worldY = 100000;
const waterGeometry = new THREE.PlaneGeometry(worldX, worldY);
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

const balls: THREE.Mesh[] = [];
const trees: THREE.Mesh[] = [];
const ballSpeeds: number[] = [];
const treeSpeeds: number[] = [];
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080, 0x008000];
const speedRanges = {
  0xff0000: [0.1, 0.02], // Red
  0x00ff00: [0.2, 0.03], // Green
  0x0000ff: [0.3, 0.04], // Blue
  0xffff00: [0.4, 0.05], // Yellow
  0xff00ff: [0.5, 0.06], // Magenta
  0x00ffff: [0.6, 0.07], // Cyan
  0xffa500: [0.7, 0.08], // Orange
  0x800080: [0.8, 0.09], // Purple
  0x008000: [0.9, 0.1]   // Dark Green
};

// Add random objects
const addRandomObjects = () => {
  const geometry = new THREE.SphereGeometry(200, 32, 32); // Increased size by 4 times
  const OBJECTS_TO_RENDER = 5000;
  
  // Add balls
  for (let i = 0; i < OBJECTS_TO_RENDER; i++) { // Increased number of objects
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshStandardMaterial({ color });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(
      Math.random() * worldX - worldX / 2, // Adjusted spread
      Math.random() * 200 + 10, // Increased spread
      Math.random() * worldY - worldY / 2 // Adjusted spread
    );
    balls.push(ball);
    const [minSpeed, maxSpeed] = speedRanges[color];
    ballSpeeds.push((Math.random() * (maxSpeed - minSpeed)) + minSpeed); // Random speed within range
    scene.add(ball);
  }

  // Add trees
  const treeGeometry = new THREE.ConeGeometry(200, 1000, 32); // Increased size by 4 times
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  for (let i = 0; i < OBJECTS_TO_RENDER; i++) { // Increased number of objects
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(
      Math.random() * worldX - worldX / 2, // Adjusted spread
      Math.random() * 200 + 10, // Increased spread
      Math.random() * worldY - worldY / 2 // Adjusted spread
    );
    trees.push(tree);
    treeSpeeds.push((Math.random() * 0.02) + 0.01); // Random speed
    scene.add(tree);
  }

  // Add islands
  const islandGeometry = new THREE.BoxGeometry(1000, 100, 1000); // Large size
  const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
  const island1 = new THREE.Mesh(islandGeometry, islandMaterial);
  island1.position.set(-1500, 50, -1500);
  scene.add(island1);

  const island2 = new THREE.Mesh(islandGeometry, islandMaterial);
  island2.position.set(1500, 50, 1500);
  scene.add(island2);

  // Add trees on islands
  const islandTreeGeometry = new THREE.ConeGeometry(200, 1000, 32); // Increased size by 4 times
  const islandTreeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  for (let i = 0; i < 10; i++) { // Add 10 trees on each island
    const tree1 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree1.position.set(
      island1.position.x + (Math.random() * 800 - 400), // Random position within island
      100, // Height of the island
      island1.position.z + (Math.random() * 800 - 400) // Random position within island
    );
    scene.add(tree1);

    const tree2 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree2.position.set(
      island2.position.x + (Math.random() * 800 - 400), // Random position within island
      100, // Height of the island
      island2.position.z + (Math.random() * 800 - 400) // Random position within island
    );
    scene.add(tree2);
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

const keyState: { [key: string]: boolean } = {};


// keyboard event listeners
window.addEventListener('keydown', (event) => {
  keyState[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keyState[event.key] = false;
});

// animate
let y = 0;
const animate = () => {
  stats.begin();
  fpControls.update(1);
  water.material.uniforms['time'].value += 1.0 / 60.0;

  // camera rotation logic
  if (keyState['ArrowLeft'] || keyState['A'] || keyState['q']) {
    y += cameraRotationSpeed;
    camera.rotation.y = y;
    console.log({y});
  }
  if (keyState['ArrowRight'] || keyState['D'] || keyState['e']) {
    y -= cameraRotationSpeed;
    camera.rotation.y = y;
    console.log({y});
  }
  camera.rotation.x = 0;
  camera.rotation.z = 0;
  camera.rotation.y = y;

  // Move balls up and down
  balls.forEach((ball, index) => {
    ball.position.y += ballSpeeds[index];
    if (ball.position.y > 200 || ball.position.y < 10) {
      ballSpeeds[index] = -ballSpeeds[index];
    }
  });

  // Move trees up and down
  trees.forEach((tree, index) => {
    tree.position.y += treeSpeeds[index];
    if (tree.position.y > 200 || tree.position.y < 10) {
      treeSpeeds[index] = -treeSpeeds[index];
    }
  });

  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
};

animate();