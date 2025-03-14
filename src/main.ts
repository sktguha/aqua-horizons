// @ts-nocheck
import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import { Water } from 'three/examples/jsm/objects/Water';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { addRandomObjects } from './addRandomObjects';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { initDesertScene } from './main2Desert';
import { getParams } from './getParams';
import { createRaindrops } from './rainDrop';

export function isMobile() {
  // return 1;
  return /Mobi|Android/i.test(navigator.userAgent);
}

export const IS_NIGHT = true;

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
  button.addEventListener('touchstart', onMouseDown);
  button.addEventListener('touchend', onMouseUp);
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
  scene.background = new THREE.Color(0x000000); // Night sky

  // sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1, // Near clipping plane
    (Number(getParams().view) || 10000) // Far clipping plane (view distance)
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

  // Add global cruise mode variable
  let cruiseMode = false;
  let cruiseSpeed = 3; // Adjust cruise speed as desired

  // Add global pause variables for object movements only
  let objectsPaused = false;
  window.objectsPaused = objectsPaused;
  window.enterPressed = false;
// http://localhost:5173/?mountains=35&view=20000&bright=0.001&grass=0.7&waterOpacity=1&solid=true&water=0xff0000&url=https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/sunny_vondelpark_4k.hdr
  let url = getParams().url || 'https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@obstacleCourse/public/img/rustig_koppie_puresky_1k.hdr'
      // if(IS_NIGHT){
      //   url = '/textures/night.hdr';
      // }
      new RGBELoader().load(url, function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
      });

    const drops = getParams().rain === "true" ? createRaindrops(scene): [];

  // TODO: toggle controls, TODO: seperate in new file, and add folder structure 
  // objects/ and controls/ constants later, also useful, and GET parameter wise
  // main render loop also can be seperated, animations can be seperated
  window.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
    // Toggle cruise mode: Press "2" to enable, "1" to disable
    if (event.key === '2') {
      cruiseMode = true;
      console.log("Cruise mode enabled.");
    }
    if (event.key === '1') {
      cruiseMode = false;
      console.log("Cruise mode disabled.");
    }
    if (event.key === '4') {
      cruiseSpeed += 1; // Increase cruise speed by 1 unit
      console.log("Cruise speed increased to", cruiseSpeed);
    }
    if (event.key === '3') {
      cruiseSpeed = Math.max(1, cruiseSpeed - 1); // Decrease cruise speed, minimum 1
      console.log("Cruise speed decreased to", cruiseSpeed);
    }
    if(event.key === '5'){
      cruiseSpeed = 0.4;
    }
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
    else if (event.key === 'c') {
      fpControls.movementSpeed = START_MOVEMENT_SPEED*4;
      cameraRotationSpeed = 0.01
      // fpControls.lookSpeed = 0.001;
    }
    if (event.key === 'n') {
      fpControls.movementSpeed = START_MOVEMENT_SPEED*11;
      cameraRotationSpeed = 2;
      // fpControls.lookSpeed = 0.001;
    }
    if (event.key === 'Enter' && !window.enterPressed) {
      window.enterPressed = true;
      objectsPaused = !objectsPaused;
      window.objectsPaused = objectsPaused;
      console.log("Object movements " + (objectsPaused ? "paused" : "resumed"));
    }
    if (event.key === ';') { // When semicolon key is pressed
      takeScreenshot();
    }
  });
  const START_MOVEMENT_SPEED = 1.8;
  fpControls.constrainVertical = true;
  fpControls.movementSpeed = START_MOVEMENT_SPEED; // 0.6
  fpControls.noFly = true;

  // texture loader
  const textureLoader = new THREE.TextureLoader();
  const waterGeometry = new THREE.PlaneGeometry(worldX, worldY);
  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: textureLoader.load('textures/waternormals.jpg', (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      const url2= getParams().url;
      let url = url2 || 'https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@obstacleCourse/public/img/rustig_koppie_puresky_1k.hdr'
      // if(IS_NIGHT){
      //   url = '/textures/night.hdr';
      // }
      new RGBELoader().load(url, function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
      });
    }),
    sunDirection: new THREE.Vector3(1, 0.1, 0),
    sunColor: Number(getParams().sunColor) || 0xffffff, // Brighter sun color
    waterColor: Number(getParams().water) ||0x00AA55, // Changed to a green color
    distortionScale: 15, // Increased from 3.7 for aggressive, choppy waves
    fog: true,
    alpha: Number(getParams().waterOpacity) || 0.9 // Added alpha to make water more opaque (0-1 where 1 is fully opaque)
  });
  water.rotation.x = -Math.PI / 2;
  
  // Make water more opaque by adjusting material, true
  water.material.transparent = true;
  water.material.opacity = 0.9; // Adjust this value between 0-1 (1 = fully opaque)

  // REPLACE WATER WITH SOLID GREEN PLANE
  const waterGeometrySolid = new THREE.PlaneGeometry(worldX, worldY);
  
  // Create a solid green material - MeshBasicMaterial doesn't respond to lighting
  const waterMaterialSolid = new THREE.MeshBasicMaterial({
    color: Number(getParams().water) || 0x00AA55, // Solid green color
    side: THREE.DoubleSide, // Render both sides
  });
  
  // Create water plane with basic material
  const waterSolid = new THREE.Mesh(waterGeometrySolid, waterMaterialSolid);
  waterSolid.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  waterSolid.position.y = 0; // Position at y=0
  scene.add(getParams().solid === 'true' ? waterSolid: water);
  
  // Small ripple effect using geometry displacement (optional)
  // Create a simple displacement function to simulate gentle ripples
  const animateWaterRipples = () => {
    const time = performance.now() * 0.001;
    const vertices = waterGeometrySolid.attributes.position.array;
    
    // Apply small ripple effect
    for (let i = 0; i < vertices.length; i += 3) {
      // Skip updating edge vertices to avoid visual glitches at boundaries
      const x = vertices[i];
      const z = vertices[i+2];
      
      // Only displace vertices near the camera to improve performance
      if (Math.abs(x) < 1000 && Math.abs(z) < 1000) {
        // Small ripple effect
        vertices[i+1] = Math.sin(time + x * 0.01) * Math.cos(time + z * 0.01) * 5;
      }
    }
    
    waterGeometrySolid.attributes.position.needsUpdate = true;
  };
  
  // This simulates the water.material.uniforms['time'].value update but for our custom material
  const updateWater = () => {
    // Only apply ripples if needed - you can comment this out for a completely flat surface
    if(getParams().waterStill !== 'true'){
      animateWaterRipples();
    }
  };

  // Add a gigantic tree
  const trunkHeight = 1000;
  const trunkGeometry = new THREE.CylinderGeometry(10, 15, trunkHeight, 32);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  // Adjust trunk position so the bottom is at y=0
  trunk.position.set(0, trunkHeight / 2, -100);
  scene.add(trunk);

  const crownGeometry = new THREE.SphereGeometry(80, 32, 16);
  const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  // Position crown so it sits atop the trunk
  crown.position.set(0, trunkHeight + 80, -100);
  scene.add(crown);

  // light
  const directionalLight = new THREE.DirectionalLight(0x783412, 0.2); // Further increase intensity
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const {balls, trees, ballSpeeds, treeSpeeds, fishes} = addRandomObjects(scene, true);

  // Create X and Z speed arrays for balloons
  const ballXSpeeds: number[] = [];
  const ballZSpeeds: number[] = [];

  balls.forEach(() => {
    // Random horizontal speeds in range [-1, 1]
    ballXSpeeds.push(Math.random() * 2 - 1);
    ballZSpeeds.push(Math.random() * 2 - 1);
  });

  // Add this near the top of the file with other constant declarations
  // const WING_FLAP_INTERVAL = 500; // milliseconds between wing flaps

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
    if (event.key === 'Enter') {
      window.enterPressed = false;
    }
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
  let y = 5.5-1.7;
  let z = 0;
  let x = 0;
  const zRot = 0.02;
  const xRot = 0.02;

  // Add timing variables for raindrop optimization
  let lastRaindropUpdate = 0;
  const raindropUpdateInterval = 100; // Update rain positions every 100ms
  
  const animate = () => {
    stats.begin();
    
    // Always update controls and water, regardless of pause state
    fpControls.update(1);
    
    // Update water (replaces water.material.uniforms['time'].value update)
    updateWater();

    // Update raindrops - make them fall and recycle
    const currentTime = performance.now();
    if (drops && drops.length > 0 && !objectsPaused) {
      const fallSpeed = 1+Math.random()*4; // Speed of falling raindrops
      const maxY = camera.position.y + 250; // Maximum height for recycling
      let minY = camera.position.y - 150; // Minimum height before recycling back to top
      
      // Always update Y position for falling effect
      drops.forEach(drop => {
        // Make raindrop fall down
        drop.position.y -= fallSpeed;
      });
      
      // Only reposition drops around the camera less frequently
      if (currentTime - lastRaindropUpdate > raindropUpdateInterval) {
        lastRaindropUpdate = currentTime;
        drops.forEach(drop => {
          // If raindrop falls below threshold or is far from the camera, recycle it
          if (drop.position.y < minY) {
            // Reset position to top with random X and Z coordinates around the camera
            drop.position.y = maxY;
            const rainRadius = 1000; // Radius of rain area around camera
            drop.position.x = camera.position.x + (Math.random() - 0.5) * rainRadius;
            drop.position.y = camera.position.y + (Math.random()) * 70;
            drop.position.z = camera.position.z + (Math.random() - 0.5) * rainRadius;
          }
        });
      }
    }

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
    if(keyState['t']){
      z -= zRot;
    }
    if(keyState['y']){
      z += zRot;
    }
    if(keyState['g']){
      x -= xRot;
    }
    if(keyState['h']){
      x += xRot;
    }
    
    // New logic: if the 'K' key pressed, raise camera high, k for know
    if (keyState['k'] || keyState['K']) {
      // camera.position.y = -26000; // set to a high Y position
      // camera.rotation.y = 2.98;
      camera.rotation.set(-1.620000000000001, 3.1150000000000144, -0.019999999999999993);
      camera.position.set(2827.7598928613406, -25000, 4498.540878289671);
      // console.log(camera.rotation, camera.position);
    }
    if (keyState['l'] || keyState['L']) {
      camera.position.y = 5; // set to a high Y position
      camera.rotation.y = 0;
    }
    
    camera.rotation.x = x;
    camera.rotation.z = z;
    camera.rotation.y = y;
    const aWorldX = 40000;
    const aWorldY = 45000;
    window.aWorldX = aWorldX;
    window.aWorldY = aWorldY;
    const resetF = 7;
    const boundMult = 1.1;
    // console.log(camera.rotation, camera.position);
    // New: Wrap camera if it goes beyond world boundaries using full worldX and worldY
    // rem minus
    if (camera.position.x > aWorldX*boundMult) {
      camera.position.x = aWorldX/resetF;
      camera.position.z = aWorldY/resetF;
      window.rearrangeAll();
    } else if (camera.position.x < -aWorldX*boundMult) {
      camera.position.x = aWorldX/resetF;
      camera.position.z = aWorldY/resetF;
      window.rearrangeAll();
    }
    if (camera.position.z > aWorldY*boundMult) {
      camera.position.x = aWorldX/resetF;
      camera.position.z = aWorldY/resetF;
      window.rearrangeAll();
    } else if (camera.position.z < -aWorldY*boundMult) {
      camera.position.x = aWorldX/resetF;
      camera.position.z = aWorldY/resetF;
      window.rearrangeAll();
    }

    // New: If cruise mode is enabled, update camera position automatically in forward direction
    if (cruiseMode && !objectsPaused) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      // Update camera position by cruiseSpeed (scaled by delta time if needed)
      camera.position.add(forward.multiplyScalar(cruiseSpeed));
    }

    // Only update object positions if not paused
    if (!objectsPaused) {
      // Move balls up and down , sideways also
      balls.forEach((ball, index) => {
        ball.position.y += ballSpeeds[index] * 4; // Increase speed by ~4x
        const MAX_BALLOON_HEIGHT_IMP = 3000;
        if (ball.position.y > MAX_BALLOON_HEIGHT_IMP) { // Increase maximum height
          ball.position.y = MAX_BALLOON_HEIGHT_IMP;
          ballSpeeds[index] = -Math.abs(ballSpeeds[index]); // Ensure speed is negative
        } else if (ball.position.y < 10) {
          ball.position.y = 10;
          ballSpeeds[index] = Math.abs(ballSpeeds[index]); // Ensure speed is positive
        }
        // Update balloon X and Z positions - increased multiplier to 15 for faster lateral movement
        ball.position.x += ballXSpeeds[index] * 15;
        ball.position.z += ballZSpeeds[index] * 15;
        // New time-based wing flapping
        const currentTime = performance.now();
        if (ball.userData.leftWing) {
          if (!ball.userData.lastFlapTime) {
            ball.userData.lastFlapTime = currentTime;
          }
          
          if (currentTime - ball.userData.lastFlapTime > (ball.userData.wingSpeed)) {
            // ball.userData.bodyMesh.position.z = ball.userData.isFlapup ? 100 : 0;
            ball.userData.isFlapup = !ball.userData.isFlapup;
            const rotAngle = ball.userData.rotAngle;
            ball.userData.leftWing.rotation.y = ball.userData.isFlapup ? rotAngle : -rotAngle;
            ball.userData.rightWing.rotation.y = ball.userData.isFlapup ? rotAngle : -rotAngle;
            ball.userData.lastFlapTime = currentTime;
          }
        }
      });

      // Animate fish: move them along X and Z, with slight sinusoidal up/down motion
      const timeFactor = performance.now() * 0.001; // seconds
      fishes.forEach((fish) => {
        fish.position.x += fish.userData.velocity.x;
        fish.position.z += fish.userData.velocity.z;
        fish.position.y = fish.userData.initialY + Math.sin(timeFactor + fish.userData.oscPhase) * 5;

        // New: Wrap fish positions if they go beyond the boundaries using the same reset factors
        if (fish.position.x > aWorldX) {
          fish.position.x = -aWorldX / resetF;
        } else if (fish.position.x < -aWorldX) {
          fish.position.x = aWorldX / resetF;
        }
        if (fish.position.z > aWorldY) {
          fish.position.z = -aWorldY / resetF;
        } else if (fish.position.z < -aWorldY) {
          fish.position.z = aWorldY / resetF;
        }
      });
    }

    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(animate);
  };

  animate();
  
  function takeScreenshot() {
    // Force a render to ensure the latest frame is captured
    renderer.render(scene, camera);
    // Get the image data from the renderer's canvas
    const dataURL = renderer.domElement.toDataURL('image/png');
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'screenshot-' + Date.now() + '.png';
    link.href = dataURL;
    link.click();
    console.log("Screenshot taken and download triggered.");
  }
}

function getRandomForestColor() {
  return Math.floor(Math.random() * 0xffffff); // Random 24-bit color
}

function varyColor(baseColor: number) {
  const variation = 100;
  const r = Math.min(255, Math.max(0, ((baseColor >> 16) & 0xff) + (Math.random() * (2 * variation) - variation)));
  const g = Math.min(255, Math.max(0, ((baseColor >> 8) & 0xff) + (Math.random() * (2 * variation) - variation)));
  const b = Math.min(255, Math.max(0, (baseColor & 0xff) + (Math.random() * (2 * variation) - variation)));
  return (r << 16) + (g << 8) + b;
}

if(location.href.indexOf('desert') > -1){
  initDesertScene();
} else {
  initOceanScene();
}