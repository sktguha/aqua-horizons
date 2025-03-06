// @ts-nocheck
import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { Water } from 'three/examples/jsm/objects/Water';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { addRandomObjects } from './addRandomObjects';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { initDesertScene } from './main2Desert';

export function isMobile() {
  // return 1;
  return /Mobi|Android/i.test(navigator.userAgent);
}

export function createControlButton(id, text, onMouseDown, onMouseUp) {
  const button = document.createElement('button');
  button.id = id;
  button.innerText = text;
  button.style.position = 'absolute';
  button.style.bottom = '10px';
  button.style.left = id === 'left-arrow' ? '10px' : '50px';
  button.style.zIndex = '1000';
  button.style.zoom = 2.6;
  button.style.opacity = 0.2;
  // button.style.pointerEvents = 'none';
  button.addEventListener('mousedown', onMouseDown);
  button.addEventListener('mouseup', onMouseUp);
  document.body.appendChild(button);
}

export function createStartAffor(){
  const button = document.createElement('button');
  // button.id = id;
  button.innerHTML = "Start/<br/>Stop";
  button.style.position = 'absolute';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '1000';
  button.style.zoom = 2.6;
  button.style.opacity = 0.2;
  button.style.width = '50px'; // Set the width
  button.style.height = '50px'; // Set the height
  button.style.borderRadius = '50%'; // Make it a circle
  button.style.pointerEvents = 'none';
  // button.addEventListener('mousedown', onMouseDown);
  // button.addEventListener('mouseup', onMouseUp);
  document.body.appendChild(button);
}

export const worldX = 100000, worldY = 100000;
// initDesertScene();
function initOceanScene(){
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
  camera.position.set(0, 60, 60);
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
  const waterGeometry = new THREE.PlaneGeometry(worldX, worldY);
  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: textureLoader.load('textures/waternormals.jpg', (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      new RGBELoader().load('https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@obstacleCourse/public/img/rustig_koppie_puresky_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.background = texture
        scene.environment = texture
      })
    }),
    sunDirection: new THREE.Vector3(1, 0.1, 0),
    sunColor: 0xffffff, // Brighter sun color
    waterColor: 0xADD8E6, // Light blue water color
    distortionScale: 3.7,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Further increase intensity
  directionalLight.position.set(10, 30, 10);
  scene.add(directionalLight);

  const {balls, trees, ballSpeeds, treeSpeeds} = addRandomObjects(scene);

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

  if (isMobile()) {
    createControlButton('left-arrow', '←', (e) => {
      keyState['q'] = true;
      e.preventDefault();
      return false;
    }, (e) => {
      keyState['q'] = false;
      e.preventDefault();
      return false;
    });

    createControlButton('right-arrow', '→', (e) => {
      keyState['e'] = true;
      console.log('eeee')
      e.preventDefault();
      return false;
    }, (e) => {
      keyState['e'] = false;
      console.log('eeee')
      e.preventDefault();
      return false;
    });
    createStartAffor();
    // window.alert('Tap anywhere on screen to start/stop');
  }

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
      ball.position.y += ballSpeeds[index] * 4; // Increase speed by ~4x
      if (ball.position.y > 200 || ball.position.y < 10) {
        ballSpeeds[index] = -ballSpeeds[index];
      }
    });

    // Move trees up and down
    trees.forEach((tree, index) => {
      tree.position.y += treeSpeeds[index] * 4; // Increase speed by ~4x
      if (tree.position.y > 200 || tree.position.y < 10) {
        treeSpeeds[index] = -treeSpeeds[index];
      }
    });

    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(animate);
  };

  animate();
}

if(location.href.indexOf('desert') > -1){
  initDesertScene();
} else {
  initOceanScene();
}