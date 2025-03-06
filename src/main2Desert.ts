// @ts-nocheck
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { addRandomObjects } from './addRandomObjects';
import { isMobile, createControlButton, createStartAffor } from './main';

export function initDesertScene(){

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 20, .1)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

new RGBELoader().load('https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@obstacleCourse/public/img/rustig_koppie_puresky_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  scene.environment = texture
})

const fpControls = new FirstPersonControls(camera, renderer.domElement);
fpControls.lookSpeed = 0.001; // Adjust look speed for rotation

fpControls.noFly = true;
fpControls.lookVertical = true; // Enable vertical look
fpControls.constrainVertical = true; // Enable vertical constraints
fpControls.verticalMin = Math.PI / 4; // Constrain vertical rotation
fpControls.verticalMax = Math.PI / 2; // Constrain vertical rotation
const h = -10;
fpControls.heightMax = h;
fpControls.heightMin= h-1;


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 20, 0)

// Desert in Three.js
// By manthrax : https://github.com/manthrax
// https://discourse.threejs.org/t/can-a-realistic-desert-be-made-from-threejs/56820/9

let v0 = new THREE.Vector3();
let v1 = new THREE.Vector3();
let v2 = new THREE.Vector3();
let v3 = new THREE.Vector3();
let v4 = new THREE.Vector3();

let noisefn = (x, y, seconds, v = v0) => {
  let z = Math.sin((x * 0.1) + seconds) * Math.cos((y * 0.13) + seconds);
  let z1 = Math.sin((y * 0.15) + seconds) * Math.cos((x * 0.2) + seconds);
  z -= z1;
  return v.set(x, z * 3, y)
}

let patchGeometry = new THREE.PlaneGeometry(50, 50, 99, 99);
let material = new THREE.MeshStandardMaterial({
  color: '#ffbe67',
  dithering: true
})
patchGeometry.rotateX(Math.PI * -0.5)

let createPatch = () => {
  let m1 = new THREE.Mesh(patchGeometry.clone(), material)
  scene.add(m1)
  return m1;
}

let generatePatch = (mesh, seconds, lod = 0) => {
  let a = mesh.geometry.attributes.position.array;
  let na = mesh.geometry.attributes.normal.array;

  let sz = 100;
  let sz2 = sz / 2;
  v3.set(-sz2, 0, -sz2)
  v4.set(sz2, 0, sz2);
  let bb = mesh.geometry.boundingBox || (mesh.geometry.boundingBox = new THREE.Box3())

  let cutoff = 6 * lod;
  let outIndex = []
  let gi = mesh.geometry.index.array;
  for (let i = 0, ai = 0, c = (sz * sz); i < c; i++, ai += 3) {
    let ix = (i % sz);
    let iy = ((i / sz) | 0);
    let x = ix - sz2;
    let y = iy - sz2;


    let ax = Math.abs(x);
    let ay = Math.abs(y);

    if ((ax < cutoff) && (ay < cutoff)) {
      a[ai + 0] = x;
      a[ai + 1] = 0;
      a[ai + 2] = y;
      continue;
    }

    if ((ax < sz2) && (ay < sz2)) {
      let ei = ((iy * 99) + ix) * 6;
      outIndex.push(gi[ei], gi[ei + 1], gi[ei + 2], gi[ei + 3], gi[ei + 4], gi[ei + 5]);
    }
    let nx = (x * mesh.scale.x) + mesh.position.x;
    let ny = (y * mesh.scale.z) + mesh.position.z;
    let pp = noisefn(nx, ny, seconds);
    let vx = noisefn(nx + (0.0001 * mesh.scale.x), ny, seconds, v1).sub(pp);
    let vy = noisefn(nx, ny + (0.0001 * mesh.scale.z), seconds, v2).sub(pp);
    let vn = vy.cross(vx)
    vn.y /= 1 + lod;
    vn.normalize();
    if (!i) {
      v3.y = v4.y = pp.y
    } else {
      if (pp.y < v2.y) v3.y = pp.y
      if (pp.y > v3.y) v4.y = pp.y
    }
    a[ai] = x; //pp.x;
    a[ai + 1] = pp.y;
    a[ai + 2] = y; //pp.z;
    na[ai] = vn.x;
    na[ai + 1] = vn.y;
    na[ai + 2] = vn.z;
  }
  mesh.geometry.setIndex(outIndex);
  mesh.geometry.boundingBox.set(v3, v4);
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.attributes.normal.needsUpdate = true;
}


//debugger
let lods = []
for (let i = 0; i < 4; i++) {
  let m = createPatch();
  let scl = (i + 1) ** 3;
  m.scale.x = scl;
  m.scale.z = scl;
  m.scale.y = i + 1;

  //m.position.y += i;
  lods.push(m);
  generatePatch(m, 0, i);
}

// End of Desert in Three.js

window.addEventListener(
  'resize',
  () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  },
  false
)

const stats = new Stats()
document.body.appendChild(stats.dom)
addRandomObjects(scene);
const keyState = {};
// keyboard event listeners
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
    // window.alert('Tap anywhere on screen to start/stop');
  }

const cameraRotationSpeed = 0.005;
// animate
let y = 0;
const animate = () => {
  stats.begin();
  fpControls.update(1);
//   water.material.uniforms['time'].value += 1.0 / 60.0;

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

//   // Move balls up and down
//   balls.forEach((ball, index) => {
//     ball.position.y += ballSpeeds[index] * 4; // Increase speed by ~4x
//     if (ball.position.y > 200 || ball.position.y < 10) {
//       ballSpeeds[index] = -ballSpeeds[index];
//     }
//   });

//   // Move trees up and down
//   trees.forEach((tree, index) => {
//     tree.position.y += treeSpeeds[index] * 4; // Increase speed by ~4x
//     if (tree.position.y > 200 || tree.position.y < 10) {
//       treeSpeeds[index] = -treeSpeeds[index];
//     }
//   });

  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
};

animate();

// function animate() {
//   requestAnimationFrame(animate)
//   controls.update()
//   fpControls.update(1);
//   render()
//   stats.update()
// }

// function render() {
//   renderer.render(scene, camera)
// }

// animate()

}